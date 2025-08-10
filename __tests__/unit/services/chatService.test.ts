// ChatService Unit Tests
import { ChatService } from '@/services/chatService'
import { createMockTenant, generateMockConversation, generateMockMessage, mockPrismaClient } from '../../utils/test-helpers'
import { MockOpenAI, mockOpenAIResponses } from '../../mocks/openai.mock'
import { NotFoundError, ServiceUnavailableError } from '@/utils/errors'

// Mock dependencies
jest.mock('@/app', () => ({
  prisma: mockPrismaClient,
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
  },
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }
}))
jest.mock('@/services/analyticsService', () => ({
  AnalyticsService: {
    getInstance: () => ({
      trackEvent: jest.fn(),
    })
  }
}))
jest.mock('@/config', () => ({
  config: {
    ai: {
      openai: {
        apiKey: 'test-key',
        model: 'gpt-3.5-turbo'
      }
    },
    features: {
      aiChat: true
    },
    aiConfig: {
      systemPrompts: {
        general: 'You are a helpful church assistant.',
        prayer: 'You are a compassionate prayer assistant.',
        pastoral: 'You are a caring pastoral assistant.'
      },
      maxTokens: 500,
      temperature: 0.7
    }
  }
}))

describe('ChatService', () => {
  let chatService: ChatService
  let mockTenant: any
  let mockConversation: any
  let mockMessage: any

  beforeEach(() => {
    jest.clearAllMocks()
    chatService = ChatService.getInstance()
    mockTenant = createMockTenant()
    mockConversation = generateMockConversation()
    mockMessage = generateMockMessage()
  })

  describe('createConversation', () => {
    const conversationData = {
      memberId: 'user-123',
      visitorName: 'John Doe',
      visitorEmail: 'john@example.com',
      conversationType: 'support' as const,
      initialMessage: 'Hello, I need help',
      metadata: { source: 'website' }
    }

    beforeEach(() => {
      mockPrismaClient.tenant.findUnique.mockResolvedValue(mockTenant)
      mockPrismaClient.$executeRaw.mockResolvedValue({ id: mockConversation.id })
    })

    it('should create a new conversation successfully', async () => {
      // Mock the getConversationById call
      const chatServiceSpy = jest.spyOn(chatService, 'getConversationById')
      chatServiceSpy.mockResolvedValue({
        ...mockConversation,
        messages: []
      })

      const result = await chatService.createConversation(mockTenant.id, conversationData)

      expect(mockPrismaClient.tenant.findUnique).toHaveBeenCalledWith({
        where: { id: mockTenant.id },
        select: { schemaName: true }
      })
      expect(mockPrismaClient.$executeRaw).toHaveBeenCalled()
      expect(result).toHaveProperty('id')
    })

    it('should throw NotFoundError for non-existent tenant', async () => {
      mockPrismaClient.tenant.findUnique.mockResolvedValue(null)

      await expect(chatService.createConversation(mockTenant.id, conversationData))
        .rejects.toThrow(NotFoundError)
    })

    it('should send initial message if provided', async () => {
      const sendMessageSpy = jest.spyOn(chatService, 'sendMessage')
      sendMessageSpy.mockResolvedValue(mockMessage)
      
      const chatServiceSpy = jest.spyOn(chatService, 'getConversationById')
      chatServiceSpy.mockResolvedValue({
        ...mockConversation,
        messages: [mockMessage]
      })

      await chatService.createConversation(mockTenant.id, conversationData)

      expect(sendMessageSpy).toHaveBeenCalledWith(
        mockTenant.id,
        expect.objectContaining({
          message: conversationData.initialMessage,
          requiresAIResponse: true
        }),
        'user',
        conversationData.memberId,
        conversationData.visitorName
      )
    })
  })

  describe('sendMessage', () => {
    const messageData = {
      conversationId: mockConversation.id,
      message: 'Hello, world!',
      messageType: 'text' as const,
      messageData: {},
      requiresAIResponse: true
    }

    beforeEach(() => {
      mockPrismaClient.tenant.findUnique.mockResolvedValue(mockTenant)
      mockPrismaClient.$queryRaw.mockResolvedValue([mockConversation])
      mockPrismaClient.$executeRaw.mockResolvedValue(mockMessage)
    })

    it('should send message successfully', async () => {
      const result = await chatService.sendMessage(mockTenant.id, messageData)

      expect(mockPrismaClient.$executeRaw).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO'),
        expect.anything()
      )
      expect(result).toBe(mockMessage)
    })

    it('should throw NotFoundError for non-existent tenant', async () => {
      mockPrismaClient.tenant.findUnique.mockResolvedValue(null)

      await expect(chatService.sendMessage(mockTenant.id, messageData))
        .rejects.toThrow(NotFoundError)
    })

    it('should throw NotFoundError for inactive conversation', async () => {
      mockPrismaClient.$queryRaw.mockResolvedValue([])

      await expect(chatService.sendMessage(mockTenant.id, messageData))
        .rejects.toThrow(NotFoundError)
    })

    it('should trigger AI response for user messages', async () => {
      const generateAIResponseSpy = jest.spyOn(chatService as any, 'generateAIResponse')
      generateAIResponseSpy.mockResolvedValue(undefined)

      await chatService.sendMessage(mockTenant.id, messageData, 'user')

      // AI response is called asynchronously with setTimeout
      await new Promise(resolve => setTimeout(resolve, 1100))
      expect(generateAIResponseSpy).toHaveBeenCalledWith(
        mockTenant.id,
        messageData.conversationId,
        messageData.message
      )
    })

    it('should not trigger AI response for AI messages', async () => {
      const generateAIResponseSpy = jest.spyOn(chatService as any, 'generateAIResponse')
      generateAIResponseSpy.mockResolvedValue(undefined)

      await chatService.sendMessage(mockTenant.id, {
        ...messageData,
        requiresAIResponse: true
      }, 'ai')

      await new Promise(resolve => setTimeout(resolve, 1100))
      expect(generateAIResponseSpy).not.toHaveBeenCalled()
    })
  })

  describe('generateAIResponse', () => {
    const mockOpenAI = new MockOpenAI({ apiKey: 'test-key' })
    
    beforeEach(() => {
      // Replace the OpenAI instance in ChatService
      ;(chatService as any).openai = mockOpenAI
      
      const conversationWithMessages = {
        ...mockConversation,
        messages: [
          { ...mockMessage, senderType: 'user', messageText: 'Hello' },
          { ...mockMessage, senderType: 'assistant', messageText: 'Hi there!' }
        ]
      }
      
      jest.spyOn(chatService, 'getConversationById').mockResolvedValue(conversationWithMessages)
      jest.spyOn(chatService, 'sendMessage').mockResolvedValue(mockMessage)
    })

    it('should generate AI response successfully', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue(mockOpenAIResponses.success)

      await (chatService as any).generateAIResponse(
        mockTenant.id,
        mockConversation.id,
        'Hello, I need help'
      )

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          expect.objectContaining({ role: 'user', content: 'Hello' }),
          expect.objectContaining({ role: 'assistant', content: 'Hi there!' })
        ]),
        max_tokens: 500,
        temperature: 0.7
      })

      expect(chatService.sendMessage).toHaveBeenCalledWith(
        mockTenant.id,
        expect.objectContaining({
          message: mockOpenAIResponses.success.choices[0].message.content,
          messageData: expect.objectContaining({
            aiGenerated: true,
            model: 'gpt-3.5-turbo'
          }),
          requiresAIResponse: false
        }),
        'ai',
        null,
        'Church Assistant'
      )
    })

    it('should handle OpenAI API errors gracefully', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'))

      await (chatService as any).generateAIResponse(
        mockTenant.id,
        mockConversation.id,
        'Hello'
      )

      expect(chatService.sendMessage).toHaveBeenCalledWith(
        mockTenant.id,
        expect.objectContaining({
          message: expect.stringContaining('having trouble responding'),
          messageData: { fallbackMessage: true },
          requiresAIResponse: false
        }),
        'ai',
        null,
        'Church Assistant'
      )
    })

    it('should use appropriate system prompt for prayer conversations', async () => {
      const prayerConversation = {
        ...mockConversation,
        conversationType: 'prayer',
        messages: [{ ...mockMessage, senderType: 'user', messageText: 'Please pray for me' }]
      }
      
      jest.spyOn(chatService, 'getConversationById').mockResolvedValue(prayerConversation)
      mockOpenAI.chat.completions.create.mockResolvedValue(mockOpenAIResponses.prayerResponse)

      await (chatService as any).generateAIResponse(
        mockTenant.id,
        mockConversation.id,
        'Please pray for me'
      )

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ 
              role: 'system', 
              content: 'You are a compassionate prayer assistant.' 
            })
          ])
        })
      )
    })

    it('should skip AI response when OpenAI is not configured', async () => {
      ;(chatService as any).openai = null

      await (chatService as any).generateAIResponse(
        mockTenant.id,
        mockConversation.id,
        'Hello'
      )

      expect(chatService.sendMessage).not.toHaveBeenCalled()
    })
  })

  describe('getConversationById', () => {
    beforeEach(() => {
      mockPrismaClient.tenant.findUnique.mockResolvedValue(mockTenant)
      mockPrismaClient.$queryRaw.mockResolvedValue([{
        ...mockConversation,
        messages: [mockMessage]
      }])
    })

    it('should retrieve conversation with messages', async () => {
      const result = await chatService.getConversationById(mockTenant.id, mockConversation.id)

      expect(mockPrismaClient.$queryRaw).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        mockConversation.id
      )
      expect(result).toHaveProperty('id', mockConversation.id)
      expect(result).toHaveProperty('messages')
    })

    it('should throw NotFoundError for non-existent conversation', async () => {
      mockPrismaClient.$queryRaw.mockResolvedValue([])

      await expect(chatService.getConversationById(mockTenant.id, 'non-existent'))
        .rejects.toThrow(NotFoundError)
    })
  })

  describe('updateConversation', () => {
    const updates = {
      status: 'resolved' as const,
      assignedTo: 'user-123',
      rating: 5,
      feedback: 'Great service!'
    }

    beforeEach(() => {
      mockPrismaClient.tenant.findUnique.mockResolvedValue(mockTenant)
      mockPrismaClient.$queryRawUnsafe.mockResolvedValue([{ ...mockConversation, ...updates }])
    })

    it('should update conversation successfully', async () => {
      await chatService.updateConversation(mockTenant.id, mockConversation.id, updates)

      expect(mockPrismaClient.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE'),
        expect.arrayContaining([
          updates.status,
          updates.assignedTo,
          updates.rating,
          updates.feedback,
          mockConversation.id
        ])
      )
    })

    it('should set ended_at when status is resolved', async () => {
      await chatService.updateConversation(mockTenant.id, mockConversation.id, {
        status: 'resolved'
      })

      expect(mockPrismaClient.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('ended_at = NOW()'),
        expect.anything()
      )
    })

    it('should throw validation error for empty updates', async () => {
      await expect(chatService.updateConversation(mockTenant.id, mockConversation.id, {}))
        .rejects.toThrow('No updates provided')
    })
  })

  describe('getConversations', () => {
    const conversations = [
      { ...mockConversation, messages: [] },
      { ...generateMockConversation(), messages: [] }
    ]

    beforeEach(() => {
      mockPrismaClient.tenant.findUnique.mockResolvedValue(mockTenant)
      mockPrismaClient.$queryRawUnsafe
        .mockResolvedValueOnce([{ count: '2' }]) // Count query
        .mockResolvedValueOnce(conversations) // Data query
    })

    it('should retrieve paginated conversations', async () => {
      const result = await chatService.getConversations(mockTenant.id, {
        page: 1,
        limit: 25
      })

      expect(result).toHaveProperty('conversations')
      expect(result).toHaveProperty('total', 2)
      expect(result).toHaveProperty('page', 1)
      expect(result).toHaveProperty('limit', 25)
      expect(result).toHaveProperty('totalPages', 1)
      expect(result.conversations).toHaveLength(2)
    })

    it('should apply status filter', async () => {
      await chatService.getConversations(mockTenant.id, {
        status: 'active'
      })

      expect(mockPrismaClient.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('c.status = $1'),
        'active'
      )
    })

    it('should apply search filter', async () => {
      await chatService.getConversations(mockTenant.id, {
        search: 'test search'
      })

      expect(mockPrismaClient.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        '%test search%'
      )
    })
  })

  describe('markMessagesAsRead', () => {
    beforeEach(() => {
      mockPrismaClient.tenant.findUnique.mockResolvedValue(mockTenant)
      mockPrismaClient.$executeRaw.mockResolvedValue(undefined)
    })

    it('should mark messages as read', async () => {
      await chatService.markMessagesAsRead(mockTenant.id, mockConversation.id, 'user-123')

      expect(mockPrismaClient.$executeRaw).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE'),
        mockConversation.id,
        'user-123'
      )
    })
  })

  describe('getConversationAnalytics', () => {
    const mockAnalytics = {
      summary: {
        total_conversations: '10',
        resolved_conversations: '8',
        active_conversations: '2',
        avg_rating: '4.5'
      },
      byType: [
        { conversation_type: 'support', count: '6' },
        { conversation_type: 'prayer', count: '4' }
      ],
      dailyVolume: [
        { date: '2024-08-10', conversations: '5', resolved: '4' }
      ]
    }

    beforeEach(() => {
      mockPrismaClient.tenant.findUnique.mockResolvedValue(mockTenant)
      mockPrismaClient.$queryRawUnsafe
        .mockResolvedValueOnce([mockAnalytics.summary]) // Summary query
        .mockResolvedValueOnce(mockAnalytics.byType) // By type query
        .mockResolvedValueOnce(mockAnalytics.dailyVolume) // Daily volume query
    })

    it('should retrieve conversation analytics', async () => {
      const result = await chatService.getConversationAnalytics(mockTenant.id)

      expect(result).toHaveProperty('summary')
      expect(result).toHaveProperty('byType')
      expect(result).toHaveProperty('dailyVolume')
      expect(result.summary).toBe(mockAnalytics.summary)
    })

    it('should apply date range filter', async () => {
      const dateRange = {
        start: new Date('2024-08-01'),
        end: new Date('2024-08-31')
      }

      await chatService.getConversationAnalytics(mockTenant.id, dateRange)

      expect(mockPrismaClient.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('WHERE started_at >= $1 AND started_at <= $2'),
        dateRange.start,
        dateRange.end
      )
    })
  })
})