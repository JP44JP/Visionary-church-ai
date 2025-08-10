// AI-Powered Chat Service for Church SaaS Platform
// Intelligent conversation handling with church-specific context

import OpenAI from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';
import winston from 'winston';
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface ChatContext {
  tenantId: string;
  memberId?: string;
  conversationId: string;
  visitorName?: string;
  visitorEmail?: string;
  sessionData: Record<string, any>;
  churchInfo: ChurchInfo;
  conversationHistory: ChatMessage[];
}

interface ChurchInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  serviceTimes: ServiceTime[];
  ministries: Ministry[];
  beliefs: string[];
  pastorName?: string;
  denominational?: string;
  kidsProgramInfo?: string;
  specialEvents?: SpecialEvent[];
  directions?: string;
  parking?: string;
  accessibility?: string;
  customFAQs: FAQ[];
}

interface ServiceTime {
  day: string;
  time: string;
  serviceType: string;
  location?: string;
  description?: string;
}

interface Ministry {
  name: string;
  description: string;
  leader?: string;
  meetingTime?: string;
  contactInfo?: string;
  ageGroup?: string;
}

interface SpecialEvent {
  name: string;
  date: string;
  time?: string;
  description: string;
  location?: string;
  registrationRequired?: boolean;
}

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface AIResponse {
  message: string;
  intent: string;
  confidence: number;
  suggestedActions?: SuggestedAction[];
  needsHuman: boolean;
  collectInfo?: InfoCollectionRequest;
  followUpQuestions?: string[];
}

interface SuggestedAction {
  type: 'schedule_visit' | 'prayer_request' | 'contact_pastor' | 'event_registration' | 'ministry_interest';
  label: string;
  data: Record<string, any>;
}

interface InfoCollectionRequest {
  type: 'contact' | 'visit_planning' | 'prayer_request';
  fields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
  }>;
  context: string;
}

interface ChatAnalytics {
  totalConversations: number;
  averageResponseTime: number;
  topIntents: Array<{ intent: string; count: number }>;
  satisfactionRating: number;
  resolutionRate: number;
  humanHandoffRate: number;
}

// =============================================================================
// AI CHAT SERVICE CLASS
// =============================================================================

export class AIChatService {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private prisma: PrismaClient;
  private redis: Redis;
  private logger: winston.Logger;
  private aiQueue: Queue;
  private intentCache: Map<string, { intent: string; confidence: number; timestamp: number }> = new Map();

  constructor(
    openaiApiKey: string,
    anthropicApiKey: string,
    prisma: PrismaClient,
    redis: Redis,
    logger: winston.Logger
  ) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.anthropic = new Anthropic({ apiKey: anthropicApiKey });
    this.prisma = prisma;
    this.redis = redis;
    this.logger = logger;

    this.aiQueue = new Queue('ai-chat', {
      connection: redis,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 2,
        backoff: { type: 'exponential', delay: 1000 }
      }
    });

    this.setupWorker();
  }

  // =============================================================================
  // CORE CHAT PROCESSING
  // =============================================================================

  async processMessage(context: ChatContext, userMessage: string): Promise<AIResponse> {
    try {
      // Detect intent first
      const intent = await this.detectIntent(userMessage, context);
      
      // Check if we need to collect information
      const infoNeeded = this.checkInfoCollection(intent, context);
      if (infoNeeded) {
        return this.requestInformation(intent, context, infoNeeded);
      }

      // Generate contextual response
      const response = await this.generateResponse(userMessage, intent, context);
      
      // Save interaction for learning
      await this.saveInteraction(context, userMessage, response, intent);
      
      return response;

    } catch (error) {
      this.logger.error('Chat processing error:', error);
      return {
        message: "I apologize, but I'm having trouble processing your request right now. A staff member will be with you shortly.",
        intent: 'error',
        confidence: 0,
        needsHuman: true
      };
    }
  }

  private async detectIntent(message: string, context: ChatContext): Promise<string> {
    const cacheKey = `intent:${context.tenantId}:${Buffer.from(message.toLowerCase()).toString('base64').slice(0, 50)}`;
    const cached = this.intentCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minute cache
      return cached.intent;
    }

    const intents = [
      'service_times', 'location_directions', 'beliefs_doctrine', 'kids_programs',
      'ministry_involvement', 'first_visit_planning', 'contact_pastor', 'prayer_request',
      'special_events', 'membership_info', 'baptism_inquiry', 'wedding_inquiry',
      'volunteer_opportunities', 'donations_giving', 'bible_study', 'youth_programs',
      'seniors_ministry', 'music_worship', 'community_outreach', 'emergency_pastoral_care',
      'general_question', 'technical_support'
    ];

    const prompt = `
Classify this church visitor message into one of these intents: ${intents.join(', ')}

Message: "${message}"

Context: Conversation with ${context.churchInfo.name}
Previous messages: ${context.conversationHistory.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')}

Respond with just the intent name that best matches:`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
        temperature: 0.1
      });

      const intent = completion.choices[0]?.message?.content?.trim().toLowerCase() || 'general_question';
      
      // Cache the result
      this.intentCache.set(cacheKey, { intent, confidence: 0.9, timestamp: Date.now() });
      
      return intent;
    } catch (error) {
      this.logger.error('Intent detection error:', error);
      return 'general_question';
    }
  }

  private async generateResponse(message: string, intent: string, context: ChatContext): Promise<AIResponse> {
    const churchInfo = context.churchInfo;
    const conversationHistory = context.conversationHistory.slice(-5); // Last 5 messages for context

    const systemPrompt = this.buildSystemPrompt(churchInfo, intent);
    const userPrompt = this.buildUserPrompt(message, intent, context);

    try {
      // Use Claude for more nuanced, empathetic responses
      const completion = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          ...conversationHistory.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          })),
          { role: 'user', content: userPrompt }
        ]
      });

      const responseText = completion.content[0]?.type === 'text' ? completion.content[0].text : "I'd be happy to help you with that.";
      
      const response: AIResponse = {
        message: responseText,
        intent,
        confidence: 0.85,
        suggestedActions: this.getSuggestedActions(intent, context),
        needsHuman: this.shouldEscalateToHuman(intent, message, context),
        followUpQuestions: this.getFollowUpQuestions(intent, context)
      };

      return response;
    } catch (error) {
      this.logger.error('Response generation error:', error);
      
      // Fallback to predefined responses
      return this.getFallbackResponse(intent, context);
    }
  }

  private buildSystemPrompt(churchInfo: ChurchInfo, intent: string): string {
    return `You are an AI assistant for ${churchInfo.name}, a welcoming church community. Your role is to help visitors and members with information about the church, answer questions, and guide them toward meaningful connections.

Church Information:
- Name: ${churchInfo.name}
- Address: ${churchInfo.address || 'Contact us for location details'}
- Phone: ${churchInfo.phone || 'Available upon request'}
- Email: ${churchInfo.email || 'Contact through our website'}
- Pastor: ${churchInfo.pastorName || 'Our pastoral team'}
${churchInfo.denominational ? `- Denomination: ${churchInfo.denominational}` : ''}

Service Times:
${churchInfo.serviceTimes.map(s => `- ${s.day} at ${s.time}: ${s.serviceType}${s.description ? ' - ' + s.description : ''}`).join('\n')}

Core Beliefs:
${churchInfo.beliefs.map(b => `- ${b}`).join('\n')}

Ministries:
${churchInfo.ministries.map(m => `- ${m.name}: ${m.description}${m.meetingTime ? ' (Meets: ' + m.meetingTime + ')' : ''}`).join('\n')}

${churchInfo.kidsProgramInfo ? `Kids Programs: ${churchInfo.kidsProgramInfo}` : ''}

${churchInfo.specialEvents && churchInfo.specialEvents.length > 0 ? `Upcoming Events:\n${churchInfo.specialEvents.map(e => `- ${e.name} on ${e.date}${e.time ? ' at ' + e.time : ''}: ${e.description}`).join('\n')}` : ''}

Custom FAQs:
${churchInfo.customFAQs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}

Guidelines:
1. Be warm, welcoming, and pastoral in tone
2. Provide specific, accurate information about the church
3. Encourage visitors to attend and get involved
4. Offer to connect them with pastoral staff for deeper conversations
5. Be sensitive to spiritual needs and questions
6. Suggest next steps (visit, contact pastor, join a ministry)
7. Keep responses concise but helpful (2-3 paragraphs max)
8. If you don't have specific information, offer to connect them with someone who does

Current Intent: ${intent}`;
  }

  private buildUserPrompt(message: string, intent: string, context: ChatContext): string {
    let prompt = `Visitor message: "${message}"`;
    
    if (context.visitorName) {
      prompt += `\nVisitor name: ${context.visitorName}`;
    }
    
    if (context.sessionData.previousIntents) {
      prompt += `\nPrevious topics discussed: ${context.sessionData.previousIntents.join(', ')}`;
    }
    
    if (context.sessionData.collectedInfo) {
      prompt += `\nInformation already collected: ${JSON.stringify(context.sessionData.collectedInfo)}`;
    }

    return prompt;
  }

  // =============================================================================
  // INFORMATION COLLECTION
  // =============================================================================

  private checkInfoCollection(intent: string, context: ChatContext): InfoCollectionRequest | null {
    const sessionData = context.sessionData;
    
    // Check if we're already collecting info
    if (sessionData.collectingInfo) {
      return sessionData.collectingInfo;
    }

    // Determine if we need to collect info based on intent
    switch (intent) {
      case 'first_visit_planning':
        if (!sessionData.collectedInfo?.contact) {
          return {
            type: 'contact',
            context: "I'd love to help you plan your first visit! Let me get some basic information so we can make sure you have the best experience possible.",
            fields: [
              { name: 'name', label: 'Your Name', type: 'text', required: true },
              { name: 'email', label: 'Email Address', type: 'email', required: true },
              { name: 'phone', label: 'Phone Number', type: 'tel', required: false },
              { name: 'visitDate', label: 'Preferred Visit Date', type: 'date', required: false },
              { name: 'familySize', label: 'How many will be visiting?', type: 'number', required: false },
              { name: 'kidsAges', label: 'Ages of children (if any)', type: 'text', required: false },
              { name: 'questions', label: 'Any specific questions or needs?', type: 'textarea', required: false }
            ]
          };
        }
        break;

      case 'prayer_request':
        return {
          type: 'prayer_request',
          context: "I'd be honored to add your prayer request to our prayer list. You can share as much or as little as you'd like.",
          fields: [
            { name: 'name', label: 'Your Name (optional)', type: 'text', required: false },
            { name: 'email', label: 'Email (optional, for follow-up)', type: 'email', required: false },
            { name: 'request', label: 'Prayer Request', type: 'textarea', required: true },
            { name: 'category', label: 'Category', type: 'select', required: false, 
              options: ['General', 'Healing', 'Family', 'Work/Career', 'Guidance', 'Thanksgiving', 'Other'] },
            { name: 'urgent', label: 'Is this urgent?', type: 'boolean', required: false },
            { name: 'anonymous', label: 'Keep this anonymous', type: 'boolean', required: false },
            { name: 'pastoralVisit', label: 'Would you like a pastoral visit?', type: 'boolean', required: false }
          ]
        };

      case 'contact_pastor':
        if (!sessionData.collectedInfo?.contact) {
          return {
            type: 'contact',
            context: "I'd be happy to connect you with our pastoral team. Let me get your contact information so they can reach out to you.",
            fields: [
              { name: 'name', label: 'Your Name', type: 'text', required: true },
              { name: 'email', label: 'Email Address', type: 'email', required: true },
              { name: 'phone', label: 'Phone Number', type: 'tel', required: false },
              { name: 'preferredContact', label: 'Preferred Contact Method', type: 'select', required: true,
                options: ['Email', 'Phone Call', 'Text Message', 'In-Person Meeting'] },
              { name: 'reason', label: 'What would you like to discuss?', type: 'textarea', required: true },
              { name: 'urgency', label: 'How soon do you need to connect?', type: 'select', required: false,
                options: ['Today', 'This week', 'Next week', 'No rush'] }
            ]
          };
        }
        break;
    }

    return null;
  }

  private requestInformation(intent: string, context: ChatContext, infoRequest: InfoCollectionRequest): AIResponse {
    return {
      message: infoRequest.context,
      intent,
      confidence: 0.9,
      needsHuman: false,
      collectInfo: infoRequest
    };
  }

  // =============================================================================
  // SUGGESTED ACTIONS & FOLLOW-UPS
  // =============================================================================

  private getSuggestedActions(intent: string, context: ChatContext): SuggestedAction[] {
    const actions: SuggestedAction[] = [];

    switch (intent) {
      case 'first_visit_planning':
        actions.push(
          { type: 'schedule_visit', label: 'Plan Your Visit', data: { intent } },
          { type: 'contact_pastor', label: 'Speak with Pastor', data: { intent } }
        );
        break;

      case 'kids_programs':
        actions.push(
          { type: 'schedule_visit', label: 'Visit with Kids', data: { intent, focus: 'family' } },
          { type: 'contact_pastor', label: 'Talk to Children\'s Director', data: { intent } }
        );
        break;

      case 'ministry_involvement':
        actions.push(
          { type: 'ministry_interest', label: 'Express Ministry Interest', data: { intent } },
          { type: 'schedule_visit', label: 'Meet Ministry Leaders', data: { intent } }
        );
        break;

      case 'prayer_request':
        actions.push(
          { type: 'prayer_request', label: 'Submit Prayer Request', data: { intent } },
          { type: 'contact_pastor', label: 'Pastoral Care', data: { intent, urgent: true } }
        );
        break;

      case 'special_events':
        if (context.churchInfo.specialEvents && context.churchInfo.specialEvents.length > 0) {
          context.churchInfo.specialEvents.forEach(event => {
            if (event.registrationRequired) {
              actions.push({
                type: 'event_registration',
                label: `Register for ${event.name}`,
                data: { eventName: event.name, eventDate: event.date }
              });
            }
          });
        }
        break;
    }

    // Always offer general contact options
    if (actions.length === 0) {
      actions.push(
        { type: 'schedule_visit', label: 'Plan a Visit', data: { intent } },
        { type: 'contact_pastor', label: 'Contact Pastor', data: { intent } }
      );
    }

    return actions.slice(0, 3); // Limit to 3 actions
  }

  private getFollowUpQuestions(intent: string, context: ChatContext): string[] {
    const questions: string[] = [];

    switch (intent) {
      case 'service_times':
        questions.push(
          "Would you like help planning your first visit?",
          "Do you have any questions about what to expect?",
          "Are you interested in our children's programs?"
        );
        break;

      case 'beliefs_doctrine':
        questions.push(
          "Would you like to speak with one of our pastors about this?",
          "Are you considering membership with us?",
          "Do you have other questions about our faith?"
        );
        break;

      case 'kids_programs':
        questions.push(
          "What are the ages of your children?",
          "Would you like a tour of our children's facilities?",
          "Are you interested in our family events?"
        );
        break;

      case 'first_visit_planning':
        questions.push(
          "What date were you thinking of visiting?",
          "Do you have any specific questions or concerns?",
          "Would you like someone to meet you when you arrive?"
        );
        break;
    }

    return questions.slice(0, 2); // Limit to 2 questions
  }

  // =============================================================================
  // ESCALATION LOGIC
  // =============================================================================

  private shouldEscalateToHuman(intent: string, message: string, context: ChatContext): boolean {
    // Emotional distress indicators
    const distressKeywords = ['crisis', 'emergency', 'urgent', 'desperate', 'suicidal', 'dying', 'death', 'funeral', 'counseling', 'help me'];
    const hasDistressKeyword = distressKeywords.some(keyword => message.toLowerCase().includes(keyword));

    // Complex theological questions
    const complexTheology = message.length > 200 && (message.includes('why does God') || message.includes('Bible says') || message.includes('don\'t understand'));

    // Administrative/complex requests
    const adminRequests = ['wedding', 'funeral', 'baptism ceremony', 'membership transfer', 'official document'];
    const hasAdminRequest = adminRequests.some(request => message.toLowerCase().includes(request));

    // Escalation scenarios
    return hasDistressKeyword || 
           complexTheology || 
           hasAdminRequest || 
           intent === 'emergency_pastoral_care' ||
           context.conversationHistory.length > 10; // Long conversations
  }

  // =============================================================================
  // FALLBACK RESPONSES
  // =============================================================================

  private getFallbackResponse(intent: string, context: ChatContext): AIResponse {
    const churchName = context.churchInfo.name;
    
    const fallbackResponses = {
      service_times: `Thanks for asking about our service times! ${churchName} welcomes everyone to join us for worship. I'd be happy to connect you with someone who can provide all the details about our services and what to expect on your first visit.`,
      
      first_visit_planning: `We're so excited you're considering visiting ${churchName}! Planning your first visit is important to us, and we want to make sure you feel welcome and comfortable. Let me connect you with our hospitality team who can help with all the details.`,
      
      prayer_request: `Thank you for trusting us with your prayer request. Prayer is at the heart of our church community, and we'd be honored to pray with and for you. Our pastoral team would love to connect with you personally about this.`,
      
      general_question: `Thank you for reaching out to ${churchName}! We're here to help and would love to answer your questions. Let me connect you with one of our team members who can provide the best assistance.`
    };

    return {
      message: fallbackResponses[intent as keyof typeof fallbackResponses] || fallbackResponses.general_question,
      intent,
      confidence: 0.5,
      needsHuman: true,
      suggestedActions: [
        { type: 'contact_pastor', label: 'Speak with Someone', data: { intent, fallback: true } }
      ]
    };
  }

  // =============================================================================
  // DATA PERSISTENCE
  // =============================================================================

  private async saveInteraction(
    context: ChatContext,
    userMessage: string,
    aiResponse: AIResponse,
    intent: string
  ): Promise<void> {
    try {
      const schemaName = `tenant_${context.tenantId.replace(/-/g, '_')}`;
      
      // Save user message
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO ${schemaName}.chat_messages (
          conversation_id, sender_type, sender_id, sender_name, message_text, 
          message_type, message_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, 
        context.conversationId,
        'user',
        context.memberId || null,
        context.visitorName || 'Visitor',
        userMessage,
        'text',
        JSON.stringify({ intent, confidence: aiResponse.confidence })
      );
      
      // Save AI response
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO ${schemaName}.chat_messages (
          conversation_id, sender_type, sender_id, sender_name, message_text,
          message_type, message_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, 
        context.conversationId,
        'ai',
        null,
        'AI Assistant',
        aiResponse.message,
        'ai_response',
        JSON.stringify({
          intent,
          confidence: aiResponse.confidence,
          suggestedActions: aiResponse.suggestedActions,
          needsHuman: aiResponse.needsHuman,
          collectInfo: aiResponse.collectInfo
        })
      );

      // Update conversation metadata
      await this.prisma.$executeRawUnsafe(`
        UPDATE ${schemaName}.chat_conversations 
        SET last_activity_at = NOW(),
            metadata = metadata || $2::jsonb
        WHERE id = $1
      `,
        context.conversationId,
        JSON.stringify({ lastIntent: intent, messageCount: context.conversationHistory.length + 2 })
      );
      
      // Cache for analytics
      await this.redis.hincrby(`chat:analytics:${context.tenantId}:${new Date().toISOString().split('T')[0]}`, intent, 1);
      
    } catch (error) {
      this.logger.error('Failed to save chat interaction:', error);
    }
  }

  // =============================================================================
  // CHURCH CONTEXT MANAGEMENT
  // =============================================================================

  async getChurchContext(tenantId: string): Promise<ChurchInfo> {
    const cacheKey = `church:context:${tenantId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      // Get tenant info
      const tenant = await this.prisma.$queryRaw`
        SELECT name, settings
        FROM shared.tenants 
        WHERE id = ${tenantId} AND status = 'active'
      `;

      if (!Array.isArray(tenant) || tenant.length === 0) {
        throw new Error('Tenant not found');
      }

      const tenantData = tenant[0] as any;
      const settings = tenantData.settings || {};
      
      const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
      
      // Get service times from events
      const services = await this.prisma.$queryRawUnsafe(`
        SELECT title, start_datetime, end_datetime, description, location
        FROM ${schemaName}.events
        WHERE event_type = 'service' 
          AND start_datetime > NOW()
          AND recurring_pattern IS NOT NULL
        ORDER BY start_datetime
        LIMIT 10
      `);

      // Get ministries
      const ministries = await this.prisma.$queryRawUnsafe(`
        SELECT name, description, meeting_schedule, contact_email
        FROM ${schemaName}.ministries
        WHERE status = 'active'
        ORDER BY name
      `);

      // Get upcoming events
      const events = await this.prisma.$queryRawUnsafe(`
        SELECT title, start_datetime, description, location, registration_required
        FROM ${schemaName}.events
        WHERE start_datetime > NOW()
          AND status = 'active'
          AND event_type != 'service'
        ORDER BY start_datetime
        LIMIT 5
      `);

      const churchInfo: ChurchInfo = {
        name: tenantData.name,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        website: settings.website,
        pastorName: settings.pastorName,
        denominational: settings.denomination,
        kidsProgramInfo: settings.kidsProgramInfo,
        directions: settings.directions,
        parking: settings.parking,
        accessibility: settings.accessibility,
        beliefs: settings.beliefs || [
          'We believe in the Trinity - Father, Son, and Holy Spirit',
          'We believe in salvation by faith through grace',
          'We believe in the authority of Scripture',
          'We believe in the importance of community and fellowship'
        ],
        serviceTimes: (services as any[]).map(s => ({
          day: new Date(s.start_datetime).toLocaleDateString('en-US', { weekday: 'long' }),
          time: new Date(s.start_datetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          serviceType: s.title,
          location: s.location,
          description: s.description
        })),
        ministries: (ministries as any[]).map(m => ({
          name: m.name,
          description: m.description,
          meetingTime: m.meeting_schedule,
          contactInfo: m.contact_email
        })),
        specialEvents: (events as any[]).map(e => ({
          name: e.title,
          date: new Date(e.start_datetime).toLocaleDateString(),
          time: new Date(e.start_datetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          description: e.description,
          location: e.location,
          registrationRequired: e.registration_required
        })),
        customFAQs: settings.customFAQs || [
          {
            question: "What should I expect on my first visit?",
            answer: "We want you to feel welcome and comfortable! Come as you are, and don't worry about what to wear or bring. Our greeters will help you find your way, and we'd love to connect with you after the service.",
            category: "visiting"
          },
          {
            question: "Do you have programs for children?",
            answer: "Yes! We have age-appropriate programs for children during our services, including nursery care, Sunday school, and children's church. All our children's workers are background-checked and trained.",
            category: "families"
          }
        ]
      };

      // Cache for 1 hour
      await this.redis.setex(cacheKey, 3600, JSON.stringify(churchInfo));
      
      return churchInfo;
      
    } catch (error) {
      this.logger.error('Failed to get church context:', error);
      
      // Return minimal fallback
      return {
        name: 'Our Church',
        serviceTimes: [{ day: 'Sunday', time: '10:00 AM', serviceType: 'Worship Service' }],
        ministries: [],
        beliefs: ['We believe in God\'s love for everyone'],
        specialEvents: [],
        customFAQs: []
      };
    }
  }

  // =============================================================================
  // QUEUE WORKER SETUP
  // =============================================================================

  private setupWorker(): void {
    const worker = new Worker('ai-chat', async (job) => {
      const { tenantId, conversationId, userMessage, sessionData = {} } = job.data;
      
      try {
        const churchInfo = await this.getChurchContext(tenantId);
        
        // Get conversation history
        const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
        const history = await this.prisma.$queryRawUnsafe(`
          SELECT sender_type as role, message_text as content, created_at as timestamp
          FROM ${schemaName}.chat_messages
          WHERE conversation_id = $1
          ORDER BY created_at DESC
          LIMIT 10
        `, conversationId);
        
        const context: ChatContext = {
          tenantId,
          conversationId,
          sessionData,
          churchInfo,
          conversationHistory: (history as any[]).reverse().map(h => ({
            id: '',
            role: h.role === 'user' ? 'user' : 'assistant',
            content: h.content,
            timestamp: h.timestamp
          }))
        };
        
        const response = await this.processMessage(context, userMessage);
        
        return response;
        
      } catch (error) {
        this.logger.error('AI worker error:', error);
        throw error;
      }
    }, { connection: this.redis });
    
    worker.on('completed', (job) => {
      this.logger.info(`AI chat job completed: ${job.id}`);
    });
    
    worker.on('failed', (job, err) => {
      this.logger.error(`AI chat job failed: ${job?.id}`, err);
    });
  }

  // =============================================================================
  // ANALYTICS AND INSIGHTS
  // =============================================================================

  async getChatAnalytics(tenantId: string, dateRange?: { start: Date; end: Date }): Promise<ChatAnalytics> {
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
    const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = dateRange?.end || new Date();

    try {
      // Get conversation stats
      const conversationStats = await this.prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as total_conversations,
               AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_duration,
               AVG(rating) as avg_rating,
               COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
               COUNT(*) FILTER (WHERE assigned_to IS NOT NULL) as human_handoff_count
        FROM ${schemaName}.chat_conversations
        WHERE started_at BETWEEN $1 AND $2
      `, startDate, endDate);

      // Get intent distribution
      const intentStats = await this.redis.hgetall(`chat:analytics:${tenantId}:${endDate.toISOString().split('T')[0]}`);
      const topIntents = Object.entries(intentStats)
        .map(([intent, count]) => ({ intent, count: parseInt(count as string) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const stats = conversationStats[0] as any;
      
      return {
        totalConversations: parseInt(stats.total_conversations) || 0,
        averageResponseTime: parseFloat(stats.avg_duration) || 0,
        topIntents,
        satisfactionRating: parseFloat(stats.avg_rating) || 0,
        resolutionRate: stats.total_conversations > 0 ? (stats.resolved_count / stats.total_conversations) * 100 : 0,
        humanHandoffRate: stats.total_conversations > 0 ? (stats.human_handoff_count / stats.total_conversations) * 100 : 0
      };
      
    } catch (error) {
      this.logger.error('Failed to get chat analytics:', error);
      return {
        totalConversations: 0,
        averageResponseTime: 0,
        topIntents: [],
        satisfactionRating: 0,
        resolutionRate: 0,
        humanHandoffRate: 0
      };
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  async queueAIResponse(tenantId: string, conversationId: string, userMessage: string, sessionData?: Record<string, any>): Promise<void> {
    await this.aiQueue.add('process-message', {
      tenantId,
      conversationId,
      userMessage,
      sessionData
    });
  }

  async updateChurchContext(tenantId: string, updates: Partial<ChurchInfo>): Promise<void> {
    const cacheKey = `church:context:${tenantId}`;
    const current = await this.getChurchContext(tenantId);
    const updated = { ...current, ...updates };
    await this.redis.setex(cacheKey, 3600, JSON.stringify(updated));
  }

  async clearChatCache(tenantId: string): Promise<void> {
    const pattern = `*${tenantId}*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

export default AIChatService;