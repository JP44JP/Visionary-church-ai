// Chat Service with AI Integration
import { z } from 'zod';
import OpenAI from 'openai';
import { config } from '../config';
import { prisma, redis, logger } from '../app';
import { ValidationError, NotFoundError, ServiceUnavailableError } from '../utils/errors';
import { AnalyticsService } from './analyticsService';

// Validation schemas
export const createConversationSchema = z.object({
  memberId: z.string().uuid().optional(),
  visitorName: z.string().max(255).optional(),
  visitorEmail: z.string().email().optional(),
  conversationType: z.enum(['support', 'prayer', 'information', 'emergency']).default('support'),
  initialMessage: z.string().min(1).max(2000).optional(),
  metadata: z.record(z.any()).default({})
});

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().min(1).max(2000),
  messageType: z.enum(['text', 'image', 'file', 'quick_reply']).default('text'),
  messageData: z.record(z.any()).default({}),
  requiresAIResponse: z.boolean().default(true)
});

export const updateConversationSchema = z.object({
  status: z.enum(['active', 'resolved', 'transferred', 'abandoned']).optional(),
  assignedTo: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  rating: z.number().min(1).max(5).optional(),
  feedback: z.string().max(1000).optional()
});

interface ConversationWithMessages {
  id: string;
  memberId: string | null;
  sessionId: string;
  visitorName: string | null;
  visitorEmail: string | null;
  conversationType: string;
  status: string;
  assignedTo: string | null;
  tags: string[];
  isActive: boolean;
  lastActivityAt: Date;
  startedAt: Date;
  endedAt: Date | null;
  rating: number | null;
  feedback: string | null;
  metadata: any;
  messages: Array<{
    id: string;
    senderType: string;
    senderId: string | null;
    senderName: string | null;
    messageText: string;
    messageType: string;
    messageData: any;
    isRead: boolean;
    readAt: Date | null;
    createdAt: Date;
  }>;
}

export class ChatService {
  private static instance: ChatService;
  private openai: OpenAI | null = null;
  private analyticsService: AnalyticsService;
  
  private constructor() {
    if (config.ai.openai.apiKey) {
      this.openai = new OpenAI({
        apiKey: config.ai.openai.apiKey,
      });
    }
    this.analyticsService = AnalyticsService.getInstance();
  }
  
  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }
  
  /**
   * Create a new conversation
   */
  async createConversation(
    tenantId: string,
    data: z.infer<typeof createConversationSchema>
  ): Promise<ConversationWithMessages> {
    try {
      // Generate unique session ID
      const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get tenant schema name
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { schemaName: true }
      });
      
      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }
      
      // Create conversation
      const conversation = await prisma.$executeRaw`
        INSERT INTO ${tenant.schemaName}.chat_conversations (
          member_id, session_id, visitor_name, visitor_email, 
          conversation_type, status, tags, metadata
        ) VALUES (
          ${data.memberId || null}, ${sessionId}, ${data.visitorName || null}, 
          ${data.visitorEmail || null}, ${data.conversationType}, 'active', 
          '{}', ${JSON.stringify(data.metadata)}
        ) RETURNING *
      `;
      
      const conversationId = (conversation as any).id;
      
      // Send initial message if provided
      if (data.initialMessage) {
        await this.sendMessage(tenantId, {
          conversationId,
          message: data.initialMessage,
          messageType: 'text',
          messageData: {},
          requiresAIResponse: true
        }, 'user', data.memberId || null, data.visitorName || 'Visitor');
      }
      
      // Track analytics
      await this.analyticsService.trackEvent(tenantId, 'chat_conversation_started', {
        conversationId,
        conversationType: data.conversationType,
        hasMember: !!data.memberId
      });
      
      return this.getConversationById(tenantId, conversationId);
      
    } catch (error) {
      logger.error('Error creating conversation:', error);
      throw error;
    }
  }
  
  /**
   * Send a message in a conversation
   */
  async sendMessage(
    tenantId: string,
    data: z.infer<typeof sendMessageSchema>,
    senderType: string = 'user',
    senderId: string | null = null,
    senderName: string | null = null
  ): Promise<any> {
    try {
      // Get tenant schema name
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { schemaName: true }
      });
      
      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }
      
      // Verify conversation exists and is active
      const conversation = await prisma.$queryRaw`
        SELECT * FROM ${tenant.schemaName}.chat_conversations 
        WHERE id = ${data.conversationId} AND is_active = true
      `;
      
      if (!Array.isArray(conversation) || conversation.length === 0) {
        throw new NotFoundError('Conversation not found or inactive');
      }
      
      // Insert message
      const message = await prisma.$executeRaw`
        INSERT INTO ${tenant.schemaName}.chat_messages (
          conversation_id, sender_type, sender_id, sender_name,
          message_text, message_type, message_data, metadata
        ) VALUES (
          ${data.conversationId}, ${senderType}, ${senderId}, 
          ${senderName}, ${data.message}, ${data.messageType}, 
          ${JSON.stringify(data.messageData)}, '{}'
        ) RETURNING *
      `;
      
      // Update conversation last activity
      await prisma.$executeRaw`
        UPDATE ${tenant.schemaName}.chat_conversations 
        SET last_activity_at = NOW() 
        WHERE id = ${data.conversationId}
      `;
      
      // Generate AI response if requested and AI is enabled
      if (data.requiresAIResponse && this.openai && config.features.aiChat && senderType === 'user') {
        setTimeout(() => {
          this.generateAIResponse(tenantId, data.conversationId, data.message)
            .catch(error => logger.error('AI response generation failed:', error));
        }, 1000); // Delay to allow message to be saved
      }
      
      // Track analytics
      await this.analyticsService.trackEvent(tenantId, 'chat_message_sent', {
        conversationId: data.conversationId,
        messageType: data.messageType,
        senderType,
        messageLength: data.message.length
      });
      
      return message;
      
    } catch (error) {
      logger.error('Error sending message:', error);
      throw error;
    }
  }
  
  /**
   * Generate AI response to user message
   */
  private async generateAIResponse(
    tenantId: string,
    conversationId: string,
    userMessage: string
  ): Promise<void> {
    if (!this.openai) {
      logger.warn('OpenAI not configured, skipping AI response');
      return;
    }
    
    try {
      // Get conversation context
      const conversationData = await this.getConversationById(tenantId, conversationId);
      if (!conversationData) {
        throw new NotFoundError('Conversation not found');
      }
      
      // Get recent message history for context
      const recentMessages = conversationData.messages
        .slice(-5) // Last 5 messages
        .map(msg => ({
          role: msg.senderType === 'user' ? 'user' : 'assistant',
          content: msg.messageText
        }));
      
      // Determine system prompt based on conversation type
      let systemPrompt = config.aiConfig.systemPrompts.general;
      if (conversationData.conversationType === 'prayer') {
        systemPrompt = config.aiConfig.systemPrompts.prayer;
      } else if (conversationData.conversationType === 'support') {
        systemPrompt = config.aiConfig.systemPrompts.pastoral;
      }
      
      // Generate AI response
      const response = await this.openai.chat.completions.create({
        model: config.ai.openai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...recentMessages
        ],
        max_tokens: config.aiConfig.maxTokens,
        temperature: config.aiConfig.temperature,
      });
      
      const aiMessage = response.choices[0]?.message?.content;
      
      if (aiMessage) {
        // Send AI response
        await this.sendMessage(
          tenantId,
          {
            conversationId,
            message: aiMessage,
            messageType: 'text',
            messageData: {
              aiGenerated: true,
              model: config.ai.openai.model,
              tokensUsed: response.usage?.total_tokens || 0
            },
            requiresAIResponse: false
          },
          'ai',
          null,
          'Church Assistant'
        );
        
        // Track AI usage
        await this.analyticsService.trackEvent(tenantId, 'ai_response_generated', {
          conversationId,
          tokensUsed: response.usage?.total_tokens || 0,
          model: config.ai.openai.model
        });
      }
      
    } catch (error) {
      logger.error('Error generating AI response:', error);
      
      // Send fallback message
      try {
        await this.sendMessage(
          tenantId,
          {
            conversationId,
            message: "I'm sorry, I'm having trouble responding right now. A member of our team will be with you shortly.",
            messageType: 'text',
            messageData: { fallbackMessage: true },
            requiresAIResponse: false
          },
          'ai',
          null,
          'Church Assistant'
        );
      } catch (fallbackError) {
        logger.error('Failed to send fallback message:', fallbackError);
      }
    }
  }
  
  /**
   * Get conversation by ID with messages
   */
  async getConversationById(tenantId: string, conversationId: string): Promise<ConversationWithMessages> {
    try {
      // Get tenant schema name
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { schemaName: true }
      });
      
      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }
      
      // Get conversation with messages
      const result = await prisma.$queryRaw`
        SELECT 
          c.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', m.id,
                'senderType', m.sender_type,
                'senderId', m.sender_id,
                'senderName', m.sender_name,
                'messageText', m.message_text,
                'messageType', m.message_type,
                'messageData', m.message_data,
                'isRead', m.is_read,
                'readAt', m.read_at,
                'createdAt', m.created_at
              ) ORDER BY m.created_at
            ) FILTER (WHERE m.id IS NOT NULL),
            '[]'::json
          ) as messages
        FROM ${tenant.schemaName}.chat_conversations c
        LEFT JOIN ${tenant.schemaName}.chat_messages m ON c.id = m.conversation_id
        WHERE c.id = ${conversationId}
        GROUP BY c.id
      `;
      
      if (!Array.isArray(result) || result.length === 0) {
        throw new NotFoundError('Conversation not found');
      }
      
      return result[0] as ConversationWithMessages;
      
    } catch (error) {
      logger.error('Error getting conversation:', error);
      throw error;
    }
  }
  
  /**
   * Get conversations for a tenant with pagination
   */
  async getConversations(
    tenantId: string,
    filters: {
      status?: string;
      conversationType?: string;
      assignedTo?: string;
      page?: number;
      limit?: number;
      search?: string;
    } = {}
  ): Promise<{
    conversations: ConversationWithMessages[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { 
        status, 
        conversationType, 
        assignedTo, 
        page = 1, 
        limit = 25, 
        search 
      } = filters;
      
      const offset = (page - 1) * limit;
      
      // Get tenant schema name
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { schemaName: true }
      });
      
      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }
      
      // Build where clause
      let whereConditions: string[] = ['1=1'];
      let params: any[] = [];
      let paramIndex = 1;
      
      if (status) {
        whereConditions.push(`c.status = $${paramIndex}`);
        params.push(status);
        paramIndex++;
      }
      
      if (conversationType) {
        whereConditions.push(`c.conversation_type = $${paramIndex}`);
        params.push(conversationType);
        paramIndex++;
      }
      
      if (assignedTo) {
        whereConditions.push(`c.assigned_to = $${paramIndex}`);
        params.push(assignedTo);
        paramIndex++;
      }
      
      if (search) {
        whereConditions.push(`(
          c.visitor_name ILIKE $${paramIndex} OR 
          c.visitor_email ILIKE $${paramIndex} OR
          EXISTS (
            SELECT 1 FROM ${tenant.schemaName}.chat_messages m 
            WHERE m.conversation_id = c.id AND m.message_text ILIKE $${paramIndex}
          )
        )`);
        params.push(`%${search}%`);
        paramIndex++;
      }
      
      const whereClause = whereConditions.join(' AND ');
      
      // Get total count
      const countResult = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count
        FROM ${tenant.schemaName}.chat_conversations c
        WHERE ${whereClause}
      `, ...params);
      
      const total = parseInt((countResult as any)[0].count);
      
      // Get conversations with latest message
      const conversations = await prisma.$queryRawUnsafe(`
        SELECT 
          c.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', m.id,
                'senderType', m.sender_type,
                'senderId', m.sender_id,
                'senderName', m.sender_name,
                'messageText', m.message_text,
                'messageType', m.message_type,
                'messageData', m.message_data,
                'isRead', m.is_read,
                'readAt', m.read_at,
                'createdAt', m.created_at
              ) ORDER BY m.created_at
            ) FILTER (WHERE m.id IS NOT NULL),
            '[]'::json
          ) as messages
        FROM ${tenant.schemaName}.chat_conversations c
        LEFT JOIN ${tenant.schemaName}.chat_messages m ON c.id = m.conversation_id
        WHERE ${whereClause}
        GROUP BY c.id
        ORDER BY c.last_activity_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, ...params, limit, offset);
      
      return {
        conversations: conversations as ConversationWithMessages[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
      
    } catch (error) {
      logger.error('Error getting conversations:', error);
      throw error;
    }
  }
  
  /**
   * Update conversation
   */
  async updateConversation(
    tenantId: string,
    conversationId: string,
    updates: z.infer<typeof updateConversationSchema>
  ): Promise<any> {
    try {
      // Get tenant schema name
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { schemaName: true }
      });
      
      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }
      
      // Build update query
      const setClause: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;
      
      if (updates.status) {
        setClause.push(`status = $${paramIndex}`);
        params.push(updates.status);
        paramIndex++;
        
        if (updates.status === 'resolved') {
          setClause.push(`ended_at = NOW()`);
        }
      }
      
      if (updates.assignedTo) {
        setClause.push(`assigned_to = $${paramIndex}`);
        params.push(updates.assignedTo);
        paramIndex++;
      }
      
      if (updates.tags) {
        setClause.push(`tags = $${paramIndex}`);
        params.push(updates.tags);
        paramIndex++;
      }
      
      if (updates.rating) {
        setClause.push(`rating = $${paramIndex}`);
        params.push(updates.rating);
        paramIndex++;
      }
      
      if (updates.feedback) {
        setClause.push(`feedback = $${paramIndex}`);
        params.push(updates.feedback);
        paramIndex++;
      }
      
      if (setClause.length === 0) {
        throw new ValidationError('No updates provided');
      }
      
      // Update conversation
      const updated = await prisma.$queryRawUnsafe(`
        UPDATE ${tenant.schemaName}.chat_conversations 
        SET ${setClause.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, ...params, conversationId);
      
      // Track analytics
      if (updates.status === 'resolved') {
        await this.analyticsService.trackEvent(tenantId, 'chat_conversation_resolved', {
          conversationId,
          rating: updates.rating,
          hasFeedback: !!updates.feedback
        });
      }
      
      return updated;
      
    } catch (error) {
      logger.error('Error updating conversation:', error);
      throw error;
    }
  }
  
  /**
   * Mark messages as read
   */
  async markMessagesAsRead(
    tenantId: string,
    conversationId: string,
    userId: string
  ): Promise<void> {
    try {
      // Get tenant schema name
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { schemaName: true }
      });
      
      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }
      
      // Mark unread messages as read
      await prisma.$executeRaw`
        UPDATE ${tenant.schemaName}.chat_messages 
        SET is_read = true, read_at = NOW()
        WHERE conversation_id = ${conversationId} 
          AND is_read = false 
          AND sender_id != ${userId}
      `;
      
    } catch (error) {
      logger.error('Error marking messages as read:', error);
      throw error;
    }
  }
  
  /**
   * Get conversation analytics
   */
  async getConversationAnalytics(tenantId: string, dateRange?: { start: Date; end: Date }) {
    try {
      // Get tenant schema name
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { schemaName: true }
      });
      
      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }
      
      let dateFilter = '';
      let params: any[] = [];
      
      if (dateRange) {
        dateFilter = 'WHERE started_at >= $1 AND started_at <= $2';
        params = [dateRange.start, dateRange.end];
      }
      
      // Get analytics data
      const analytics = await prisma.$queryRawUnsafe(`
        SELECT 
          COUNT(*) as total_conversations,
          COUNT(*) FILTER (WHERE status = 'resolved') as resolved_conversations,
          COUNT(*) FILTER (WHERE status = 'active') as active_conversations,
          COUNT(*) FILTER (WHERE status = 'abandoned') as abandoned_conversations,
          AVG(rating) FILTER (WHERE rating IS NOT NULL) as avg_rating,
          COUNT(*) FILTER (WHERE rating IS NOT NULL) as rated_conversations,
          AVG(EXTRACT(EPOCH FROM (COALESCE(ended_at, NOW()) - started_at))) as avg_duration_seconds
        FROM ${tenant.schemaName}.chat_conversations
        ${dateFilter}
      `, ...params);
      
      // Get conversations by type
      const byType = await prisma.$queryRawUnsafe(`
        SELECT 
          conversation_type,
          COUNT(*) as count
        FROM ${tenant.schemaName}.chat_conversations
        ${dateFilter}
        GROUP BY conversation_type
        ORDER BY count DESC
      `, ...params);
      
      // Get daily conversation volume
      const dailyVolume = await prisma.$queryRawUnsafe(`
        SELECT 
          DATE(started_at) as date,
          COUNT(*) as conversations,
          COUNT(*) FILTER (WHERE status = 'resolved') as resolved
        FROM ${tenant.schemaName}.chat_conversations
        ${dateFilter}
        GROUP BY DATE(started_at)
        ORDER BY date DESC
        LIMIT 30
      `, ...params);
      
      return {
        summary: analytics[0],
        byType,
        dailyVolume
      };
      
    } catch (error) {
      logger.error('Error getting conversation analytics:', error);
      throw error;
    }
  }
}

export default ChatService;