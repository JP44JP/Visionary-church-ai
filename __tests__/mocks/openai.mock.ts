// OpenAI API Mock
import { jest } from '@jest/globals'

export const mockOpenAIResponse = {
  id: 'chatcmpl-test123',
  object: 'chat.completion',
  created: Date.now(),
  model: 'gpt-3.5-turbo',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant' as const,
        content: 'This is a mocked AI response for testing purposes.'
      },
      finish_reason: 'stop'
    }
  ],
  usage: {
    prompt_tokens: 15,
    completion_tokens: 12,
    total_tokens: 27
  }
}

export const mockOpenAIStreamResponse = {
  id: 'chatcmpl-test123',
  object: 'chat.completion.chunk',
  created: Date.now(),
  model: 'gpt-3.5-turbo',
  choices: [
    {
      index: 0,
      delta: {
        role: 'assistant' as const,
        content: 'This is a mocked streaming response.'
      },
      finish_reason: null
    }
  ]
}

export const mockOpenAIError = {
  error: {
    message: 'Mock OpenAI error for testing',
    type: 'invalid_request_error',
    param: null,
    code: 'test_error'
  }
}

// Mock OpenAI class
export class MockOpenAI {
  apiKey: string
  
  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey
  }
  
  chat = {
    completions: {
      create: jest.fn().mockResolvedValue(mockOpenAIResponse)
    }
  }
  
  images = {
    generate: jest.fn().mockResolvedValue({
      created: Date.now(),
      data: [
        {
          url: 'https://example.com/mock-image.png'
        }
      ]
    })
  }
  
  audio = {
    speech: {
      create: jest.fn().mockResolvedValue({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024))
      })
    },
    transcriptions: {
      create: jest.fn().mockResolvedValue({
        text: 'This is a mock transcription'
      })
    }
  }
  
  embeddings = {
    create: jest.fn().mockResolvedValue({
      object: 'list',
      data: [
        {
          object: 'embedding',
          embedding: Array.from({ length: 1536 }, () => Math.random()),
          index: 0
        }
      ],
      model: 'text-embedding-ada-002',
      usage: {
        prompt_tokens: 8,
        total_tokens: 8
      }
    })
  }
}

// Mock responses for different scenarios
export const mockOpenAIResponses = {
  success: mockOpenAIResponse,
  
  prayerResponse: {
    ...mockOpenAIResponse,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant' as const,
          content: 'I understand you\'re going through a difficult time. Please know that you\'re in our prayers, and we\'re here to support you through this journey.'
        },
        finish_reason: 'stop'
      }
    ]
  },
  
  pastoralResponse: {
    ...mockOpenAIResponse,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant' as const,
          content: 'Thank you for reaching out to our church. I\'d be happy to help answer your questions and connect you with the right person on our team.'
        },
        finish_reason: 'stop'
      }
    ]
  },
  
  emergencyResponse: {
    ...mockOpenAIResponse,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant' as const,
          content: 'I understand this is urgent. Let me immediately connect you with one of our pastors who can provide the support you need right now.'
        },
        finish_reason: 'stop'
      }
    ]
  },
  
  rateLimitError: {
    error: {
      message: 'Rate limit exceeded',
      type: 'rate_limit_error',
      param: null,
      code: 'rate_limit_exceeded'
    }
  },
  
  authError: {
    error: {
      message: 'Invalid API key',
      type: 'authentication_error',
      param: null,
      code: 'invalid_api_key'
    }
  },
  
  serverError: {
    error: {
      message: 'The server had an error processing your request',
      type: 'server_error',
      param: null,
      code: 'server_error'
    }
  }
}

// Mock factory function
export const createMockOpenAI = (scenario: keyof typeof mockOpenAIResponses = 'success') => {
  const mockInstance = new MockOpenAI({ apiKey: 'test-key' })
  
  if (scenario === 'success') {
    mockInstance.chat.completions.create.mockResolvedValue(mockOpenAIResponse)
  } else if (scenario in mockOpenAIResponses) {
    const response = mockOpenAIResponses[scenario]
    if ('error' in response) {
      mockInstance.chat.completions.create.mockRejectedValue(new Error(response.error.message))
    } else {
      mockInstance.chat.completions.create.mockResolvedValue(response)
    }
  }
  
  return mockInstance
}

// Jest mock setup for OpenAI module
jest.mock('openai', () => ({
  default: MockOpenAI
}))

export default MockOpenAI