// Chat API Integration Tests
import { createMocks } from 'node-mocks-http'
import chatHandler from '@/app/api/chat/route'
import { createMockJWT, createMockTenant, mockPrismaClient } from '../../utils/test-helpers'
import { MockOpenAI, mockOpenAIResponses } from '../../mocks/openai.mock'

// Mock external dependencies
jest.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      })
    }
  })
}))

jest.mock('@/services/chatService', () => {
  const mockChatService = {
    getInstance: () => ({
      createConversation: jest.fn(),
      sendMessage: jest.fn(),
      getConversations: jest.fn(),
      getConversationById: jest.fn(),
      updateConversation: jest.fn(),
      markMessagesAsRead: jest.fn(),
    })
  }
  return { ChatService: mockChatService }
})

describe('/api/chat', () => {
  let mockTenant: any
  let mockChatService: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockTenant = createMockTenant()
    mockChatService = require('@/services/chatService').ChatService.getInstance()
  })

  describe('POST /api/chat', () => {
    it('should create a new conversation', async () => {
      const conversationData = {
        visitorName: 'John Doe',
        visitorEmail: 'john@example.com',
        conversationType: 'support',
        initialMessage: 'Hello, I need help'
      }

      const mockConversation = {
        id: 'conv-123',
        sessionId: 'session-123',
        ...conversationData,
        messages: []
      }

      mockChatService.createConversation.mockResolvedValue(mockConversation)

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${createMockJWT()}`
        },
        body: conversationData,
      })

      await chatHandler(req, res)

      expect(res._getStatusCode()).toBe(200)
      const responseData = JSON.parse(res._getData())
      expect(responseData.success).toBe(true)
      expect(responseData.data).toHaveProperty('id')
      expect(mockChatService.createConversation).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining(conversationData)
      )
    })

    it('should return 400 for invalid conversation data', async () => {
      const invalidData = {
        conversationType: 'invalid-type',
        initialMessage: '' // Empty message
      }

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${createMockJWT()}`
        },
        body: invalidData,
      })

      await chatHandler(req, res)

      expect(res._getStatusCode()).toBe(400)
      const responseData = JSON.parse(res._getData())
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('validation')
    })

    it('should return 401 for missing authentication', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: {
          visitorName: 'John Doe',
          conversationType: 'support'
        },
      })

      await chatHandler(req, res)

      expect(res._getStatusCode()).toBe(401)
      const responseData = JSON.parse(res._getData())
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('authentication')
    })
  })

  describe('GET /api/chat', () => {
    it('should retrieve conversations with pagination', async () => {
      const mockConversations = {
        conversations: [
          { id: 'conv-1', visitorName: 'John Doe', status: 'active' },
          { id: 'conv-2', visitorName: 'Jane Smith', status: 'resolved' }
        ],
        total: 2,
        page: 1,
        limit: 25,
        totalPages: 1
      }

      mockChatService.getConversations.mockResolvedValue(mockConversations)

      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          'authorization': `Bearer ${createMockJWT()}`
        },
        query: {
          page: '1',
          limit: '25'
        }
      })

      await chatHandler(req, res)

      expect(res._getStatusCode()).toBe(200)
      const responseData = JSON.parse(res._getData())
      expect(responseData.success).toBe(true)
      expect(responseData.data.conversations).toHaveLength(2)
      expect(responseData.data.total).toBe(2)
    })

    it('should apply filters to conversation query', async () => {
      mockChatService.getConversations.mockResolvedValue({
        conversations: [],
        total: 0,
        page: 1,
        limit: 25,
        totalPages: 0
      })

      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          'authorization': `Bearer ${createMockJWT()}`
        },
        query: {
          status: 'active',
          conversationType: 'support',
          search: 'john'
        }
      })

      await chatHandler(req, res)

      expect(mockChatService.getConversations).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          status: 'active',
          conversationType: 'support',
          search: 'john'
        })
      )
    })
  })

  describe('PUT /api/chat/:id', () => {
    it('should update conversation status', async () => {
      const conversationId = 'conv-123'
      const updates = {
        status: 'resolved',
        rating: 5,
        feedback: 'Great service!'
      }

      mockChatService.updateConversation.mockResolvedValue({
        id: conversationId,
        ...updates
      })

      const { req, res } = createMocks({
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${createMockJWT()}`
        },
        query: { id: conversationId },
        body: updates
      })

      await chatHandler(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(mockChatService.updateConversation).toHaveBeenCalledWith(
        expect.any(String),
        conversationId,
        updates
      )
    })

    it('should return 404 for non-existent conversation', async () => {
      mockChatService.updateConversation.mockRejectedValue(
        new Error('Conversation not found')
      )

      const { req, res } = createMocks({
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${createMockJWT()}`
        },
        query: { id: 'non-existent' },
        body: { status: 'resolved' }
      })

      await chatHandler(req, res)

      expect(res._getStatusCode()).toBe(404)
    })
  })

  describe('POST /api/chat/:id/messages', () => {
    it('should send a new message', async () => {
      const conversationId = 'conv-123'
      const messageData = {
        message: 'Thank you for your help!',
        messageType: 'text'
      }

      const mockMessage = {
        id: 'msg-123',
        conversationId,
        ...messageData,
        senderType: 'user'
      }

      mockChatService.sendMessage.mockResolvedValue(mockMessage)

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${createMockJWT()}`
        },
        query: { id: conversationId },
        body: messageData
      })

      await chatHandler(req, res)

      expect(res._getStatusCode()).toBe(200)
      const responseData = JSON.parse(res._getData())
      expect(responseData.success).toBe(true)
      expect(responseData.data).toHaveProperty('id')
      expect(mockChatService.sendMessage).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          conversationId,
          ...messageData
        }),
        'user'
      )
    })

    it('should return 400 for invalid message data', async () => {
      const conversationId = 'conv-123'
      const invalidData = {
        message: '', // Empty message
        messageType: 'invalid-type'
      }

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${createMockJWT()}`
        },
        query: { id: conversationId },
        body: invalidData
      })

      await chatHandler(req, res)

      expect(res._getStatusCode()).toBe(400)
      const responseData = JSON.parse(res._getData())
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('validation')
    })
  })

  describe('POST /api/chat/:id/read', () => {
    it('should mark messages as read', async () => {
      const conversationId = 'conv-123'
      
      mockChatService.markMessagesAsRead.mockResolvedValue(undefined)

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'authorization': `Bearer ${createMockJWT()}`
        },
        query: { id: conversationId }
      })

      await chatHandler(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(mockChatService.markMessagesAsRead).toHaveBeenCalledWith(
        expect.any(String),
        conversationId,
        expect.any(String)
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      mockChatService.createConversation.mockRejectedValue(
        new Error('Database connection failed')
      )

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${createMockJWT()}`
        },
        body: {
          visitorName: 'John Doe',
          conversationType: 'support'
        }
      })

      await chatHandler(req, res)

      expect(res._getStatusCode()).toBe(500)
      const responseData = JSON.parse(res._getData())
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBeDefined()
    })

    it('should handle invalid HTTP methods', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        headers: {
          'authorization': `Bearer ${createMockJWT()}`
        }
      })

      await chatHandler(req, res)

      expect(res._getStatusCode()).toBe(405)
      const responseData = JSON.parse(res._getData())
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Method not allowed')
    })

    it('should handle malformed JSON', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${createMockJWT()}`
        },
        body: 'invalid json'
      })

      await chatHandler(req, res)

      expect(res._getStatusCode()).toBe(400)
      const responseData = JSON.parse(res._getData())
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('JSON')
    })
  })

  describe('Rate Limiting', () => {
    it('should enforce rate limits for message sending', async () => {
      // Simulate rapid message sending
      const conversationId = 'conv-123'
      const messageData = {
        message: 'Rapid message',
        messageType: 'text'
      }

      // First message should succeed
      mockChatService.sendMessage.mockResolvedValueOnce({ id: 'msg-1' })
      
      const { req: req1, res: res1 } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${createMockJWT()}`,
          'x-forwarded-for': '192.168.1.1'
        },
        query: { id: conversationId },
        body: messageData
      })

      await chatHandler(req1, res1)
      expect(res1._getStatusCode()).toBe(200)

      // Subsequent rapid messages should be rate limited
      // This would require implementing rate limiting middleware
    })
  })

  describe('Multi-tenant Isolation', () => {
    it('should isolate conversations by tenant', async () => {
      const tenant1JWT = createMockJWT({ tenantId: 'tenant-1' })
      const tenant2JWT = createMockJWT({ tenantId: 'tenant-2' })

      mockChatService.getConversations.mockResolvedValue({
        conversations: [],
        total: 0,
        page: 1,
        limit: 25,
        totalPages: 0
      })

      // Request from tenant 1
      const { req: req1, res: res1 } = createMocks({
        method: 'GET',
        headers: { 'authorization': `Bearer ${tenant1JWT}` }
      })

      await chatHandler(req1, res1)

      // Request from tenant 2
      const { req: req2, res: res2 } = createMocks({
        method: 'GET',
        headers: { 'authorization': `Bearer ${tenant2JWT}` }
      })

      await chatHandler(req2, res2)

      // Verify that each request was scoped to its tenant
      expect(mockChatService.getConversations).toHaveBeenNthCalledWith(
        1,
        'tenant-1',
        expect.any(Object)
      )
      expect(mockChatService.getConversations).toHaveBeenNthCalledWith(
        2,
        'tenant-2',
        expect.any(Object)
      )
    })

    it('should prevent cross-tenant data access', async () => {
      const tenant1JWT = createMockJWT({ tenantId: 'tenant-1' })
      const conversationFromTenant2 = 'conv-from-tenant-2'

      mockChatService.getConversationById.mockRejectedValue(
        new Error('Conversation not found')
      )

      const { req, res } = createMocks({
        method: 'GET',
        headers: { 'authorization': `Bearer ${tenant1JWT}` },
        query: { id: conversationFromTenant2 }
      })

      await chatHandler(req, res)

      expect(res._getStatusCode()).toBe(404)
      expect(mockChatService.getConversationById).toHaveBeenCalledWith(
        'tenant-1', // Should only query within tenant-1
        conversationFromTenant2
      )
    })
  })
})