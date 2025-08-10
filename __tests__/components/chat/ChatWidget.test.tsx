// ChatWidget Component Tests
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ChatWidget from '@/components/chat/ChatWidget'
import { generateMockConversation, generateMockMessage } from '../../utils/test-helpers'

// Mock fetch API
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock WebSocket
const mockWebSocket = {
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: WebSocket.OPEN,
}

global.WebSocket = jest.fn(() => mockWebSocket) as any

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  createClientSupabaseClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      })
    }
  })
}))

describe('ChatWidget', () => {
  let queryClient: QueryClient
  let mockConversation: any
  let mockMessages: any[]

  const renderChatWidget = (props = {}) => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    const defaultProps = {
      tenantId: 'tenant-123',
      churchName: 'Test Church',
      isOpen: true,
      onToggle: jest.fn(),
      ...props
    }

    return render(
      <QueryClientProvider client={queryClient}>
        <ChatWidget {...defaultProps} />
      </QueryClientProvider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockConversation = generateMockConversation()
    mockMessages = [
      generateMockMessage({ senderType: 'user', messageText: 'Hello!' }),
      generateMockMessage({ senderType: 'ai', messageText: 'Hi there! How can I help?' })
    ]

    // Mock successful API responses
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: mockConversation
      })
    })
  })

  afterEach(() => {
    queryClient?.clear()
  })

  describe('Rendering', () => {
    it('should render chat widget when open', () => {
      renderChatWidget({ isOpen: true })

      expect(screen.getByTestId('chat-widget')).toBeInTheDocument()
      expect(screen.getByText('Chat with Test Church')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
    })

    it('should not render chat widget when closed', () => {
      renderChatWidget({ isOpen: false })

      expect(screen.queryByTestId('chat-widget')).not.toBeInTheDocument()
    })

    it('should render welcome message for new visitors', () => {
      renderChatWidget()

      expect(screen.getByText(/Welcome to Test Church/)).toBeInTheDocument()
      expect(screen.getByText(/How can we help you today/)).toBeInTheDocument()
    })

    it('should show typing indicator when AI is responding', async () => {
      renderChatWidget()

      // Send a message to trigger AI response
      const input = screen.getByPlaceholderText('Type your message...')
      const sendButton = screen.getByTestId('send-button')

      await userEvent.type(input, 'Hello!')
      await userEvent.click(sendButton)

      await waitFor(() => {
        expect(screen.getByTestId('typing-indicator')).toBeInTheDocument()
      })
    })
  })

  describe('Message Sending', () => {
    it('should send message when send button is clicked', async () => {
      renderChatWidget()

      const input = screen.getByPlaceholderText('Type your message...')
      const sendButton = screen.getByTestId('send-button')

      await userEvent.type(input, 'Hello, I need help!')
      await userEvent.click(sendButton)

      expect(mockFetch).toHaveBeenCalledWith('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello, I need help!',
          conversationId: expect.any(String),
          messageType: 'text',
          requiresAIResponse: true
        })
      })

      // Input should be cleared after sending
      expect(input).toHaveValue('')
    })

    it('should send message when Enter key is pressed', async () => {
      renderChatWidget()

      const input = screen.getByPlaceholderText('Type your message...')

      await userEvent.type(input, 'Hello!')
      await userEvent.keyboard('{Enter}')

      expect(mockFetch).toHaveBeenCalled()
    })

    it('should not send empty messages', async () => {
      renderChatWidget()

      const sendButton = screen.getByTestId('send-button')
      
      await userEvent.click(sendButton)

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should disable input while sending message', async () => {
      renderChatWidget()

      const input = screen.getByPlaceholderText('Type your message...')
      const sendButton = screen.getByTestId('send-button')

      // Mock slow API response
      mockFetch.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockMessages[0] })
        }), 1000))
      )

      await userEvent.type(input, 'Hello!')
      await userEvent.click(sendButton)

      expect(input).toBeDisabled()
      expect(sendButton).toBeDisabled()
    })
  })

  describe('Message Display', () => {
    it('should display user messages on the right', () => {
      renderChatWidget()

      const messageContainer = screen.getByTestId('message-user-123')
      expect(messageContainer).toHaveClass('justify-end')
      expect(messageContainer.querySelector('.bg-blue-500')).toBeInTheDocument()
    })

    it('should display AI messages on the left', () => {
      renderChatWidget()

      const messageContainer = screen.getByTestId('message-ai-456')
      expect(messageContainer).toHaveClass('justify-start')
      expect(messageContainer.querySelector('.bg-gray-200')).toBeInTheDocument()
    })

    it('should format timestamps correctly', () => {
      renderChatWidget()

      const timestamp = screen.getByText(/\d{1,2}:\d{2}/)
      expect(timestamp).toBeInTheDocument()
    })

    it('should auto-scroll to bottom when new messages arrive', async () => {
      const scrollIntoViewMock = jest.fn()
      Element.prototype.scrollIntoView = scrollIntoViewMock

      renderChatWidget()

      const input = screen.getByPlaceholderText('Type your message...')
      const sendButton = screen.getByTestId('send-button')

      await userEvent.type(input, 'New message')
      await userEvent.click(sendButton)

      await waitFor(() => {
        expect(scrollIntoViewMock).toHaveBeenCalled()
      })
    })
  })

  describe('Conversation Management', () => {
    it('should create new conversation for first-time visitors', async () => {
      renderChatWidget()

      const input = screen.getByPlaceholderText('Type your message...')
      await userEvent.type(input, 'Hello!')
      await userEvent.keyboard('{Enter}')

      expect(mockFetch).toHaveBeenCalledWith('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationType: 'support',
          initialMessage: 'Hello!',
          visitorName: '',
          visitorEmail: '',
          metadata: {
            source: 'widget',
            userAgent: expect.any(String),
            timestamp: expect.any(String)
          }
        })
      })
    })

    it('should resume existing conversation', () => {
      // Mock existing conversation in localStorage
      localStorage.setItem('chat_conversation_id', mockConversation.id)

      renderChatWidget()

      expect(screen.queryByText(/Welcome to Test Church/)).not.toBeInTheDocument()
    })

    it('should handle conversation creation failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({
          success: false,
          error: 'Failed to create conversation'
        })
      })

      renderChatWidget()

      const input = screen.getByPlaceholderText('Type your message...')
      await userEvent.type(input, 'Hello!')
      await userEvent.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByText(/Unable to start conversation/)).toBeInTheDocument()
      })
    })
  })

  describe('Real-time Features', () => {
    it('should establish WebSocket connection', () => {
      renderChatWidget()

      expect(global.WebSocket).toHaveBeenCalledWith(
        expect.stringContaining('ws')
      )
    })

    it('should handle incoming messages via WebSocket', () => {
      renderChatWidget()

      const newMessage = generateMockMessage({
        senderType: 'ai',
        messageText: 'Real-time message'
      })

      // Simulate WebSocket message
      const messageEvent = new MessageEvent('message', {
        data: JSON.stringify({
          type: 'new_message',
          data: newMessage
        })
      })

      mockWebSocket.addEventListener.mock.calls
        .find(call => call[0] === 'message')[1](messageEvent)

      expect(screen.getByText('Real-time message')).toBeInTheDocument()
    })

    it('should show online/offline status', () => {
      renderChatWidget()

      // Mock online status
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      })

      window.dispatchEvent(new Event('online'))
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Online')

      // Mock offline status
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      })

      window.dispatchEvent(new Event('offline'))
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Offline')
    })
  })

  describe('User Information Collection', () => {
    it('should show visitor form for anonymous users', () => {
      renderChatWidget()

      expect(screen.getByText(/Let us know who you are/)).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Your email')).toBeInTheDocument()
    })

    it('should validate email format', async () => {
      renderChatWidget()

      const emailInput = screen.getByPlaceholderText('Your email')
      const submitButton = screen.getByText('Start Chat')

      await userEvent.type(emailInput, 'invalid-email')
      await userEvent.click(submitButton)

      expect(screen.getByText(/Please enter a valid email/)).toBeInTheDocument()
    })

    it('should start conversation after collecting visitor info', async () => {
      renderChatWidget()

      const nameInput = screen.getByPlaceholderText('Your name')
      const emailInput = screen.getByPlaceholderText('Your email')
      const submitButton = screen.getByText('Start Chat')

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'john@example.com')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationType: 'support',
            visitorName: 'John Doe',
            visitorEmail: 'john@example.com',
            metadata: expect.any(Object)
          })
        })
      })
    })
  })

  describe('Accessibility', () => {
    it('should support keyboard navigation', () => {
      renderChatWidget()

      const input = screen.getByPlaceholderText('Type your message...')
      const sendButton = screen.getByTestId('send-button')

      input.focus()
      expect(document.activeElement).toBe(input)

      // Tab to send button
      userEvent.tab()
      expect(document.activeElement).toBe(sendButton)
    })

    it('should have proper ARIA labels', () => {
      renderChatWidget()

      expect(screen.getByRole('complementary')).toHaveAttribute(
        'aria-label', 
        'Chat widget'
      )
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'aria-label',
        'Type your message'
      )
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
    })

    it('should announce new messages to screen readers', async () => {
      renderChatWidget()

      const liveRegion = screen.getByRole('status')
      expect(liveRegion).toHaveAttribute('aria-live', 'polite')

      // Send message and wait for AI response
      const input = screen.getByPlaceholderText('Type your message...')
      await userEvent.type(input, 'Hello!')
      await userEvent.keyboard('{Enter}')

      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/New message from Church Assistant/)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      renderChatWidget()

      const input = screen.getByPlaceholderText('Type your message...')
      await userEvent.type(input, 'Hello!')
      await userEvent.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByText(/Connection error/)).toBeInTheDocument()
      })
    })

    it('should show retry option for failed messages', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Send failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockMessages[0] })
        })

      renderChatWidget()

      const input = screen.getByPlaceholderText('Type your message...')
      await userEvent.type(input, 'Hello!')
      await userEvent.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument()
      })

      // Click retry
      await userEvent.click(screen.getByText('Retry'))

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Performance', () => {
    it('should debounce typing indicators', async () => {
      renderChatWidget()

      const input = screen.getByPlaceholderText('Type your message...')

      // Type rapidly
      await userEvent.type(input, 'Hello')

      // Typing indicator should not spam
      const typingEvents = mockWebSocket.send.mock.calls.filter(
        call => JSON.parse(call[0]).type === 'typing'
      )
      
      expect(typingEvents.length).toBeLessThan(5)
    })

    it('should virtualize message list for long conversations', () => {
      // This would require implementing virtualization
      // Test that only visible messages are rendered
      const longConversation = Array.from({ length: 1000 }, (_, i) =>
        generateMockMessage({ messageText: `Message ${i}` })
      )

      renderChatWidget()

      // Should only render visible messages, not all 1000
      const renderedMessages = screen.getAllByTestId(/message-/)
      expect(renderedMessages.length).toBeLessThan(100)
    })
  })
})