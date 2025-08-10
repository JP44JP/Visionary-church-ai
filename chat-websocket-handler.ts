// WebSocket Chat Handler for AI-Powered Church Chat
// Handles real-time chat communication and AI integration

import { Server as SocketIOServer, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import winston from 'winston';
import Redis from 'ioredis';
import { Queue } from 'bullmq';
import AIChatService from './ai-chat-service';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface ChatSocket extends Socket {
  data: {
    tenantId: string;
    conversationId: string;
    sessionId: string;
    visitorName?: string;
    visitorEmail?: string;
    memberId?: string;
    isStaff?: boolean;
    staffName?: string;
  };
}

interface ConversationParticipant {
  socketId: string;
  type: 'visitor' | 'member' | 'staff' | 'ai';
  name: string;
  joinedAt: Date;
}

interface MessageData {
  conversationId: string;
  message: string;
  type: 'text' | 'image' | 'file' | 'quick_reply' | 'form_data';
  metadata?: Record<string, any>;
}

interface InfoCollectedData {
  conversationId: string;
  type: 'contact' | 'visit_planning' | 'prayer_request';
  data: Record<string, any>;
}

interface SatisfactionRatingData {
  conversationId: string;
  rating: number;
  feedback?: string;
}

interface ConversationTransferData {
  conversationId: string;
  fromStaffId: string;
  toStaffId: string;
  reason?: string;
}

// =============================================================================
// CHAT WEBSOCKET HANDLER CLASS
// =============================================================================

export class ChatWebSocketHandler {
  private io: SocketIOServer;
  private prisma: PrismaClient;
  private redis: Redis;
  private logger: winston.Logger;
  private aiChatService: AIChatService;
  private notificationQueue: Queue;
  private activeConversations: Map<string, ConversationParticipant[]> = new Map();
  private staffSockets: Map<string, string[]> = new Map(); // tenantId -> socketIds

  constructor(
    io: SocketIOServer,
    prisma: PrismaClient,
    redis: Redis,
    logger: winston.Logger,
    aiChatService: AIChatService
  ) {
    this.io = io;
    this.prisma = prisma;
    this.redis = redis;
    this.logger = logger;
    this.aiChatService = aiChatService;

    this.notificationQueue = new Queue('notifications', {
      connection: redis,
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 25,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 }
      }
    });

    this.setupChatNamespace();
    this.setupStaffNamespace();
  }

  // =============================================================================
  // CHAT NAMESPACE SETUP (Public Widget)
  // =============================================================================

  private setupChatNamespace(): void {
    const chatNamespace = this.io.of('/chat');

    chatNamespace.use(async (socket: ChatSocket, next) => {
      try {
        const { tenantId, conversationId } = socket.handshake.query;
        
        if (!tenantId || !conversationId) {
          return next(new Error('Missing tenantId or conversationId'));
        }

        // Validate tenant
        const tenant = await this.prisma.$queryRaw`
          SELECT id, name, status
          FROM shared.tenants 
          WHERE id = ${tenantId as string} AND status = 'active'
        `;

        if (!Array.isArray(tenant) || tenant.length === 0) {
          return next(new Error('Invalid tenant'));
        }

        // Get conversation details
        const schemaName = `tenant_${(tenantId as string).replace(/-/g, '_')}`;
        const conversation = await this.prisma.$queryRawUnsafe(`
          SELECT id, member_id, session_id, visitor_name, visitor_email, status, assigned_to
          FROM ${schemaName}.chat_conversations
          WHERE id = $1
        `, conversationId as string);

        if (!Array.isArray(conversation) || conversation.length === 0) {
          return next(new Error('Invalid conversation'));
        }

        const conv = conversation[0] as any;
        
        socket.data = {
          tenantId: tenantId as string,
          conversationId: conversationId as string,
          sessionId: conv.session_id,
          memberId: conv.member_id,
          visitorName: conv.visitor_name,
          visitorEmail: conv.visitor_email
        };

        next();
      } catch (error) {
        this.logger.error('Chat socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });

    chatNamespace.on('connection', (socket: ChatSocket) => {
      this.handleChatConnection(socket);
    });
  }

  private handleChatConnection(socket: ChatSocket): void {
    const { tenantId, conversationId, visitorName } = socket.data;
    
    this.logger.info(`Chat connection established: ${socket.id} for conversation ${conversationId}`);

    // Join conversation room
    socket.join(`conversation:${conversationId}`);
    socket.join(`tenant:${tenantId}:visitors`);

    // Add to active conversations
    this.addParticipantToConversation(conversationId, {
      socketId: socket.id,
      type: socket.data.memberId ? 'member' : 'visitor',
      name: visitorName || 'Visitor',
      joinedAt: new Date()
    });

    // Notify staff of new chat
    this.notifyStaffOfNewChat(tenantId, conversationId, visitorName);

    // =============================================================================
    // MESSAGE HANDLING
    // =============================================================================

    socket.on('send-message', async (data: MessageData) => {
      try {
        await this.handleUserMessage(socket, data);
      } catch (error) {
        this.logger.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('info-collected', async (data: InfoCollectedData) => {
      try {
        await this.handleInfoCollection(socket, data);
      } catch (error) {
        this.logger.error('Info collection error:', error);
        socket.emit('error', { message: 'Failed to process information' });
      }
    });

    socket.on('satisfaction-rating', async (data: SatisfactionRatingData) => {
      try {
        await this.handleSatisfactionRating(socket, data);
      } catch (error) {
        this.logger.error('Satisfaction rating error:', error);
      }
    });

    socket.on('typing', () => {
      socket.to(`conversation:${conversationId}`).emit('user-typing', {
        name: visitorName || 'Visitor'
      });
    });

    socket.on('stop-typing', () => {
      socket.to(`conversation:${conversationId}`).emit('user-stop-typing', {
        name: visitorName || 'Visitor'
      });
    });

    socket.on('request-human', async () => {
      try {
        await this.requestHumanAssistance(socket);
      } catch (error) {
        this.logger.error('Request human error:', error);
      }
    });

    socket.on('disconnect', () => {
      this.handleChatDisconnection(socket);
    });
  }

  // =============================================================================
  // STAFF NAMESPACE SETUP
  // =============================================================================

  private setupStaffNamespace(): void {
    const staffNamespace = this.io.of('/staff-chat');

    staffNamespace.use(async (socket: ChatSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const { tenantId } = socket.handshake.query;
        
        // Validate staff token (implement JWT validation)
        const decoded = await this.validateStaffToken(token);
        
        if (!decoded || decoded.tenantId !== tenantId) {
          return next(new Error('Invalid staff credentials'));
        }

        socket.data = {
          tenantId: decoded.tenantId,
          conversationId: '', // Will be set when joining conversations
          sessionId: socket.id,
          isStaff: true,
          staffName: decoded.name,
          memberId: decoded.userId
        };

        next();
      } catch (error) {
        this.logger.error('Staff socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });

    staffNamespace.on('connection', (socket: ChatSocket) => {
      this.handleStaffConnection(socket);
    });
  }

  private handleStaffConnection(socket: ChatSocket): void {
    const { tenantId, staffName } = socket.data;
    
    this.logger.info(`Staff connection established: ${socket.id} (${staffName}) for tenant ${tenantId}`);

    // Join tenant staff room
    socket.join(`tenant:${tenantId}:staff`);
    
    // Add to staff sockets tracking
    if (!this.staffSockets.has(tenantId)) {
      this.staffSockets.set(tenantId, []);
    }
    this.staffSockets.get(tenantId)!.push(socket.id);

    // Staff message handling
    socket.on('join-conversation', async (conversationId: string) => {
      try {
        await this.handleStaffJoinConversation(socket, conversationId);
      } catch (error) {
        this.logger.error('Staff join conversation error:', error);
      }
    });

    socket.on('send-staff-message', async (data: MessageData) => {
      try {
        await this.handleStaffMessage(socket, data);
      } catch (error) {
        this.logger.error('Staff message error:', error);
      }
    });

    socket.on('transfer-conversation', async (data: ConversationTransferData) => {
      try {
        await this.handleConversationTransfer(socket, data);
      } catch (error) {
        this.logger.error('Conversation transfer error:', error);
      }
    });

    socket.on('end-conversation', async (conversationId: string) => {
      try {
        await this.handleEndConversation(socket, conversationId);
      } catch (error) {
        this.logger.error('End conversation error:', error);
      }
    });

    socket.on('disconnect', () => {
      this.handleStaffDisconnection(socket);
    });
  }

  // =============================================================================
  // MESSAGE PROCESSING
  // =============================================================================

  private async handleUserMessage(socket: ChatSocket, data: MessageData): Promise<void> {
    const { tenantId, conversationId, visitorName, visitorEmail, memberId } = socket.data;
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;

    // Save user message to database
    const messageResult = await this.prisma.$queryRawUnsafe(`
      INSERT INTO ${schemaName}.chat_messages (
        conversation_id, sender_type, sender_id, sender_name, message_text, 
        message_type, message_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, created_at
    `, 
      conversationId,
      'user',
      memberId || null,
      visitorName || 'Visitor',
      data.message,
      data.type,
      JSON.stringify(data.metadata || {})
    );

    const savedMessage = (messageResult as any[])[0];

    // Broadcast to conversation participants
    this.io.of('/chat').to(`conversation:${conversationId}`).emit('new-message', {
      id: savedMessage.id,
      role: 'user',
      content: data.message,
      timestamp: savedMessage.created_at,
      senderName: visitorName || 'Visitor'
    });

    // Notify staff
    this.io.of('/staff-chat').to(`tenant:${tenantId}:staff`).emit('visitor-message', {
      conversationId,
      message: data.message,
      visitorName: visitorName || 'Visitor',
      timestamp: savedMessage.created_at
    });

    // Check if conversation is assigned to staff
    const conversation = await this.prisma.$queryRawUnsafe(`
      SELECT assigned_to, status
      FROM ${schemaName}.chat_conversations
      WHERE id = $1
    `, conversationId);

    const conv = (conversation as any[])[0];
    
    // If not assigned to staff, process with AI
    if (!conv.assigned_to && conv.status !== 'waiting_human') {
      await this.processWithAI(socket, data.message);
    }

    // Update last activity
    await this.prisma.$queryRawUnsafe(`
      UPDATE ${schemaName}.chat_conversations 
      SET last_activity_at = NOW()
      WHERE id = $1
    `, conversationId);
  }

  private async processWithAI(socket: ChatSocket, message: string): Promise<void> {
    const { tenantId, conversationId, visitorName, visitorEmail, memberId } = socket.data;

    try {
      // Show typing indicator
      socket.emit('ai-typing');

      // Get church context and conversation history
      const churchInfo = await this.aiChatService.getChurchContext(tenantId);
      const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
      
      const history = await this.prisma.$queryRawUnsafe(`
        SELECT sender_type, message_text, created_at
        FROM ${schemaName}.chat_messages
        WHERE conversation_id = $1
        ORDER BY created_at ASC
        LIMIT 20
      `, conversationId);

      // Get session data from Redis
      const sessionData = await this.redis.hgetall(`chat:session:${conversationId}`);

      const context = {
        tenantId,
        conversationId,
        memberId,
        visitorName,
        visitorEmail,
        sessionData: {
          ...sessionData,
          previousIntents: JSON.parse(sessionData.previousIntents || '[]'),
          collectedInfo: JSON.parse(sessionData.collectedInfo || '{}')
        },
        churchInfo,
        conversationHistory: (history as any[]).map(h => ({
          id: '',
          role: h.sender_type === 'user' ? 'user' : 'assistant',
          content: h.message_text,
          timestamp: h.created_at
        }))
      };

      // Process message with AI
      const aiResponse = await this.aiChatService.processMessage(context, message);

      // Save AI response
      const aiMessageResult = await this.prisma.$queryRawUnsafe(`
        INSERT INTO ${schemaName}.chat_messages (
          conversation_id, sender_type, sender_name, message_text,
          message_type, message_data
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, created_at
      `, 
        conversationId,
        'ai',
        'AI Assistant',
        aiResponse.message,
        'ai_response',
        JSON.stringify({
          intent: aiResponse.intent,
          confidence: aiResponse.confidence,
          suggestedActions: aiResponse.suggestedActions,
          needsHuman: aiResponse.needsHuman,
          collectInfo: aiResponse.collectInfo
        })
      );

      const savedAiMessage = (aiMessageResult as any[])[0];

      // Send response to client
      socket.emit('ai-response', {
        message: aiResponse.message,
        intent: aiResponse.intent,
        confidence: aiResponse.confidence,
        suggestedActions: aiResponse.suggestedActions,
        needsHuman: aiResponse.needsHuman,
        collectInfo: aiResponse.collectInfo,
        followUpQuestions: aiResponse.followUpQuestions
      });

      // Update session data
      const updatedIntents = [...(JSON.parse(sessionData.previousIntents || '[]')), aiResponse.intent];
      await this.redis.hset(`chat:session:${conversationId}`, {
        lastIntent: aiResponse.intent,
        previousIntents: JSON.stringify(updatedIntents.slice(-10)), // Keep last 10
        lastActivity: new Date().toISOString()
      });

      // If human assistance is needed, notify staff
      if (aiResponse.needsHuman) {
        await this.requestHumanAssistance(socket, aiResponse.intent);
      }

    } catch (error) {
      this.logger.error('AI processing error:', error);
      
      // Send fallback response
      socket.emit('ai-response', {
        message: "I apologize, but I'm having trouble processing your request right now. Let me connect you with one of our team members who can help you directly.",
        intent: 'error',
        confidence: 0,
        needsHuman: true
      });
      
      await this.requestHumanAssistance(socket, 'technical_error');
    }
  }

  // =============================================================================
  // INFORMATION COLLECTION
  // =============================================================================

  private async handleInfoCollection(socket: ChatSocket, data: InfoCollectedData): Promise<void> {
    const { tenantId, conversationId, visitorName } = socket.data;
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;

    try {
      // Update session data with collected info
      const sessionKey = `chat:session:${conversationId}`;
      const existingInfo = await this.redis.hget(sessionKey, 'collectedInfo');
      const collectedInfo = {
        ...JSON.parse(existingInfo || '{}'),
        [data.type]: data.data
      };
      
      await this.redis.hset(sessionKey, 'collectedInfo', JSON.stringify(collectedInfo));

      // Process based on type
      switch (data.type) {
        case 'contact':
          await this.processContactInfo(socket, data.data);
          break;
        case 'visit_planning':
          await this.processVisitPlanningInfo(socket, data.data);
          break;
        case 'prayer_request':
          await this.processPrayerRequestInfo(socket, data.data);
          break;
      }

      // Send confirmation
      const confirmationMessage = await this.prisma.$queryRawUnsafe(`
        INSERT INTO ${schemaName}.chat_messages (
          conversation_id, sender_type, sender_name, message_text, message_type
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id, created_at
      `, 
        conversationId,
        'system',
        'System',
        `Thank you for providing that information! ${this.getConfirmationMessage(data.type)}`,
        'system_confirmation'
      );

      const saved = (confirmationMessage as any[])[0];
      
      socket.emit('info-processed', {
        type: data.type,
        message: `Thank you for providing that information! ${this.getConfirmationMessage(data.type)}`,
        nextSteps: this.getNextSteps(data.type)
      });

    } catch (error) {
      this.logger.error('Info collection processing error:', error);
      socket.emit('error', { message: 'Failed to process your information. Please try again.' });
    }
  }

  private async processContactInfo(socket: ChatSocket, data: Record<string, any>): Promise<void> {
    const { tenantId, conversationId } = socket.data;
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;

    // Update conversation with contact info
    await this.prisma.$queryRawUnsafe(`
      UPDATE ${schemaName}.chat_conversations 
      SET visitor_name = $2, visitor_email = $3,
          metadata = metadata || $4::jsonb
      WHERE id = $1
    `, 
      conversationId,
      data.name,
      data.email,
      JSON.stringify({ contactInfo: data })
    );

    // Update socket data
    socket.data.visitorName = data.name;
    socket.data.visitorEmail = data.email;

    // Create lead if email provided
    if (data.email) {
      await this.createLead(tenantId, data, 'chat_contact');
    }
  }

  private async processVisitPlanningInfo(socket: ChatSocket, data: Record<string, any>): Promise<void> {
    const { tenantId } = socket.data;

    // Create visit record
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
    
    await this.prisma.$queryRawUnsafe(`
      INSERT INTO ${schemaName}.visits (
        visitor_name, visitor_email, visitor_phone, visit_type, 
        scheduled_datetime, status, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, 
      data.name,
      data.email,
      data.phone || null,
      'first_visit',
      data.visitDate ? new Date(data.visitDate) : null,
      'planned',
      `Family size: ${data.familySize || 'Not specified'}, Kids ages: ${data.kidsAges || 'None'}, Questions: ${data.questions || 'None'}`,
      null // System created
    );

    // Queue welcome email if configured
    if (data.email) {
      await this.notificationQueue.add('send-welcome-email', {
        tenantId,
        recipientEmail: data.email,
        recipientName: data.name,
        visitInfo: data
      });
    }
  }

  private async processPrayerRequestInfo(socket: ChatSocket, data: Record<string, any>): Promise<void> {
    const { tenantId } = socket.data;
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;

    // Create prayer request
    await this.prisma.$queryRawUnsafe(`
      INSERT INTO ${schemaName}.prayer_requests (
        title, description, requester_name, requester_email, 
        category, priority, is_anonymous, is_public
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, 
      'Prayer Request from Chat',
      data.request,
      data.name || 'Anonymous',
      data.email || null,
      data.category || 'general',
      data.urgent ? 'urgent' : 'normal',
      data.anonymous || false,
      !data.anonymous
    );

    // Notify pastoral team if urgent or pastoral visit requested
    if (data.urgent || data.pastoralVisit) {
      await this.notificationQueue.add('urgent-prayer-notification', {
        tenantId,
        prayerRequest: data,
        urgentLevel: data.urgent ? 'high' : 'medium'
      });
    }
  }

  // =============================================================================
  // HUMAN ASSISTANCE
  // =============================================================================

  private async requestHumanAssistance(socket: ChatSocket, reason?: string): Promise<void> {
    const { tenantId, conversationId, visitorName } = socket.data;
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;

    try {
      // Update conversation status
      await this.prisma.$queryRawUnsafe(`
        UPDATE ${schemaName}.chat_conversations 
        SET status = 'waiting_human',
            metadata = metadata || $2::jsonb
        WHERE id = $1
      `, conversationId, JSON.stringify({ escalationReason: reason || 'user_request' }));

      // Notify available staff
      this.io.of('/staff-chat').to(`tenant:${tenantId}:staff`).emit('human-assistance-requested', {
        conversationId,
        visitorName: visitorName || 'Visitor',
        reason: reason || 'User requested human assistance',
        urgency: this.getUrgencyLevel(reason),
        timestamp: new Date()
      });

      // Send confirmation to visitor
      socket.emit('human-assistance-confirmed', {
        message: "I'm connecting you with one of our team members who will be with you shortly. Please hold on just a moment.",
        estimatedWait: this.getEstimatedWaitTime(tenantId)
      });

      // Queue staff notification if no one is online
      const onlineStaff = this.staffSockets.get(tenantId) || [];
      if (onlineStaff.length === 0) {
        await this.notificationQueue.add('staff-chat-notification', {
          tenantId,
          conversationId,
          visitorName: visitorName || 'Visitor',
          reason: reason || 'user_request'
        });
      }

    } catch (error) {
      this.logger.error('Request human assistance error:', error);
    }
  }

  private async handleStaffJoinConversation(socket: ChatSocket, conversationId: string): Promise<void> {
    const { tenantId, staffName } = socket.data;
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;

    try {
      // Update conversation assignment
      await this.prisma.$queryRawUnsafe(`
        UPDATE ${schemaName}.chat_conversations 
        SET assigned_to = $2, status = 'active'
        WHERE id = $1
      `, conversationId, socket.data.memberId);

      // Join conversation room
      socket.join(`conversation:${conversationId}`);
      socket.data.conversationId = conversationId;

      // Notify visitor that staff joined
      this.io.of('/chat').to(`conversation:${conversationId}`).emit('human-joined', {
        staffName,
        message: `Hi! I'm ${staffName} and I'm here to help you. How can I assist you today?`
      });

      // Notify other staff
      socket.to(`tenant:${tenantId}:staff`).emit('conversation-assigned', {
        conversationId,
        assignedTo: staffName
      });

      this.logger.info(`Staff ${staffName} joined conversation ${conversationId}`);

    } catch (error) {
      this.logger.error('Staff join conversation error:', error);
      socket.emit('error', { message: 'Failed to join conversation' });
    }
  }

  private async handleStaffMessage(socket: ChatSocket, data: MessageData): Promise<void> {
    const { tenantId, staffName, memberId } = socket.data;
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;

    try {
      // Save staff message
      const messageResult = await this.prisma.$queryRawUnsafe(`
        INSERT INTO ${schemaName}.chat_messages (
          conversation_id, sender_type, sender_id, sender_name, message_text, 
          message_type, message_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, created_at
      `, 
        data.conversationId,
        'staff',
        memberId,
        staffName,
        data.message,
        data.type,
        JSON.stringify(data.metadata || {})
      );

      const savedMessage = (messageResult as any[])[0];

      // Send to visitor
      this.io.of('/chat').to(`conversation:${data.conversationId}`).emit('new-message', {
        id: savedMessage.id,
        role: 'assistant',
        content: data.message,
        timestamp: savedMessage.created_at,
        senderName: staffName,
        isStaff: true
      });

      // Update last activity
      await this.prisma.$queryRawUnsafe(`
        UPDATE ${schemaName}.chat_conversations 
        SET last_activity_at = NOW()
        WHERE id = $1
      `, data.conversationId);

    } catch (error) {
      this.logger.error('Staff message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private addParticipantToConversation(conversationId: string, participant: ConversationParticipant): void {
    if (!this.activeConversations.has(conversationId)) {
      this.activeConversations.set(conversationId, []);
    }
    this.activeConversations.get(conversationId)!.push(participant);
  }

  private removeParticipantFromConversation(conversationId: string, socketId: string): void {
    const participants = this.activeConversations.get(conversationId);
    if (participants) {
      const filtered = participants.filter(p => p.socketId !== socketId);
      if (filtered.length === 0) {
        this.activeConversations.delete(conversationId);
      } else {
        this.activeConversations.set(conversationId, filtered);
      }
    }
  }

  private async createLead(tenantId: string, contactData: Record<string, any>, source: string): Promise<void> {
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
    
    try {
      // Check if member already exists
      const existing = await this.prisma.$queryRawUnsafe(`
        SELECT id FROM ${schemaName}.members WHERE email = $1
      `, contactData.email);

      if (Array.isArray(existing) && existing.length === 0) {
        // Create new member/lead
        await this.prisma.$queryRawUnsafe(`
          INSERT INTO ${schemaName}.members (
            member_number, first_name, last_name, email, phone,
            membership_status, tags, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, 
          `LEAD${Date.now()}`,
          contactData.name?.split(' ')[0] || 'Unknown',
          contactData.name?.split(' ').slice(1).join(' ') || '',
          contactData.email,
          contactData.phone || null,
          'inactive', // Lead status
          ['chat_lead', source],
          `Lead generated from chat conversation. Contact info collected on ${new Date().toLocaleDateString()}.`
        );
      }
    } catch (error) {
      this.logger.error('Create lead error:', error);
    }
  }

  private getConfirmationMessage(type: string): string {
    const messages = {
      contact: "We'll make sure to reach out to you soon.",
      visit_planning: "We're excited to welcome you to our church family!",
      prayer_request: "Your prayer request has been added to our prayer list."
    };
    return messages[type as keyof typeof messages] || "Your information has been received.";
  }

  private getNextSteps(type: string): string[] {
    const steps = {
      contact: ["A team member will contact you within 24 hours", "Feel free to ask any other questions"],
      visit_planning: ["We'll send you a welcome email with directions", "Someone will greet you when you arrive"],
      prayer_request: ["Our prayer team will be praying for you", "A pastor may reach out if you requested"]
    };
    return steps[type as keyof typeof steps] || ["Thank you for connecting with us"];
  }

  private getUrgencyLevel(reason?: string): 'low' | 'medium' | 'high' {
    if (reason?.includes('emergency') || reason?.includes('urgent')) return 'high';
    if (reason?.includes('pastoral') || reason?.includes('prayer')) return 'medium';
    return 'low';
  }

  private async getEstimatedWaitTime(tenantId: string): Promise<string> {
    const onlineStaff = this.staffSockets.get(tenantId) || [];
    if (onlineStaff.length > 0) return "1-2 minutes";
    
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 17) return "5-10 minutes";
    return "We'll get back to you as soon as possible";
  }

  private async notifyStaffOfNewChat(tenantId: string, conversationId: string, visitorName?: string): Promise<void> {
    this.io.of('/staff-chat').to(`tenant:${tenantId}:staff`).emit('new-chat-started', {
      conversationId,
      visitorName: visitorName || 'Visitor',
      timestamp: new Date()
    });
  }

  private async validateStaffToken(token: string): Promise<any> {
    // Implement JWT validation logic here
    // This should validate the staff member's authentication token
    // and return decoded user information
    try {
      // JWT validation would go here
      return null; // Placeholder
    } catch (error) {
      return null;
    }
  }

  private handleChatDisconnection(socket: ChatSocket): void {
    const { conversationId, visitorName } = socket.data;
    
    this.logger.info(`Chat disconnection: ${socket.id} (${visitorName})`);
    
    if (conversationId) {
      this.removeParticipantFromConversation(conversationId, socket.id);
    }
  }

  private handleStaffDisconnection(socket: ChatSocket): void {
    const { tenantId, staffName } = socket.data;
    
    this.logger.info(`Staff disconnection: ${socket.id} (${staffName})`);
    
    // Remove from staff sockets
    const staffSockets = this.staffSockets.get(tenantId);
    if (staffSockets) {
      const filtered = staffSockets.filter(id => id !== socket.id);
      if (filtered.length === 0) {
        this.staffSockets.delete(tenantId);
      } else {
        this.staffSockets.set(tenantId, filtered);
      }
    }
  }

  private async handleSatisfactionRating(socket: ChatSocket, data: SatisfactionRatingData): Promise<void> {
    const { tenantId } = socket.data;
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;

    try {
      await this.prisma.$queryRawUnsafe(`
        UPDATE ${schemaName}.chat_conversations 
        SET rating = $2, feedback = $3
        WHERE id = $1
      `, data.conversationId, data.rating, data.feedback);

      // Track analytics
      await this.redis.hincrby(`chat:analytics:${tenantId}:${new Date().toISOString().split('T')[0]}`, `rating_${data.rating}`, 1);

    } catch (error) {
      this.logger.error('Satisfaction rating error:', error);
    }
  }

  private async handleConversationTransfer(socket: ChatSocket, data: ConversationTransferData): Promise<void> {
    const { tenantId } = socket.data;
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;

    try {
      await this.prisma.$queryRawUnsafe(`
        UPDATE ${schemaName}.chat_conversations 
        SET assigned_to = $2
        WHERE id = $1
      `, data.conversationId, data.toStaffId);

      // Notify participants
      this.io.of('/chat').to(`conversation:${data.conversationId}`).emit('conversation-transferred', {
        message: "Your conversation has been transferred to another team member who can better assist you."
      });

    } catch (error) {
      this.logger.error('Conversation transfer error:', error);
    }
  }

  private async handleEndConversation(socket: ChatSocket, conversationId: string): Promise<void> {
    const { tenantId } = socket.data;
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;

    try {
      await this.prisma.$queryRawUnsafe(`
        UPDATE ${schemaName}.chat_conversations 
        SET status = 'resolved', ended_at = NOW()
        WHERE id = $1
      `, conversationId);

      // Notify visitor
      this.io.of('/chat').to(`conversation:${conversationId}`).emit('conversation-ended', {
        message: "Thank you for chatting with us! Feel free to start a new conversation anytime."
      });

    } catch (error) {
      this.logger.error('End conversation error:', error);
    }
  }
}

export default ChatWebSocketHandler;