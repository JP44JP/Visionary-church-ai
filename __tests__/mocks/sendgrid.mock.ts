// SendGrid Email API Mock
import { jest } from '@jest/globals'

export interface MockEmailData {
  to: string | string[]
  from: string
  subject: string
  html?: string
  text?: string
  templateId?: string
  dynamicTemplateData?: any
  attachments?: any[]
}

export const mockSendGridResponse = {
  statusCode: 202,
  body: '',
  headers: {
    'x-message-id': 'mock-message-id-123'
  }
}

export const mockSendGridError = {
  code: 400,
  message: 'Mock SendGrid error for testing',
  response: {
    body: {
      errors: [
        {
          message: 'Mock error message',
          field: 'to',
          help: 'Please provide a valid email address'
        }
      ]
    }
  }
}

// Mock SendGrid mail service
export class MockSendGridMail {
  private apiKey: string
  private emails: MockEmailData[] = []
  
  constructor() {
    this.apiKey = 'test-sendgrid-key'
  }
  
  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }
  
  send = jest.fn().mockImplementation((emailData: MockEmailData) => {
    this.emails.push(emailData)
    return Promise.resolve([mockSendGridResponse, {}])
  })
  
  sendMultiple = jest.fn().mockImplementation((emailDataArray: MockEmailData[]) => {
    this.emails.push(...emailDataArray)
    return Promise.resolve([mockSendGridResponse, {}])
  })
  
  // Test utility methods
  getLastEmail(): MockEmailData | undefined {
    return this.emails[this.emails.length - 1]
  }
  
  getAllEmails(): MockEmailData[] {
    return [...this.emails]
  }
  
  clearEmails(): void {
    this.emails = []
  }
  
  getEmailsTo(email: string): MockEmailData[] {
    return this.emails.filter(e => 
      Array.isArray(e.to) ? e.to.includes(email) : e.to === email
    )
  }
  
  getEmailsBySubject(subject: string): MockEmailData[] {
    return this.emails.filter(e => e.subject.includes(subject))
  }
  
  getEmailsByTemplate(templateId: string): MockEmailData[] {
    return this.emails.filter(e => e.templateId === templateId)
  }
}

// Create singleton instance
export const mockSendGridInstance = new MockSendGridMail()

// Mock responses for different scenarios
export const mockSendGridResponses = {
  success: mockSendGridResponse,
  
  welcomeEmail: {
    ...mockSendGridResponse,
    headers: {
      'x-message-id': 'welcome-email-123'
    }
  },
  
  passwordResetEmail: {
    ...mockSendGridResponse,
    headers: {
      'x-message-id': 'password-reset-456'
    }
  },
  
  visitConfirmationEmail: {
    ...mockSendGridResponse,
    headers: {
      'x-message-id': 'visit-confirmation-789'
    }
  },
  
  followUpEmail: {
    ...mockSendGridResponse,
    headers: {
      'x-message-id': 'follow-up-abc'
    }
  },
  
  eventRegistrationEmail: {
    ...mockSendGridResponse,
    headers: {
      'x-message-id': 'event-registration-def'
    }
  },
  
  prayerRequestEmail: {
    ...mockSendGridResponse,
    headers: {
      'x-message-id': 'prayer-request-ghi'
    }
  },
  
  authenticationError: {
    code: 401,
    message: 'Unauthorized',
    response: {
      body: {
        errors: [
          {
            message: 'The provided authorization grant is invalid, expired, or revoked',
            field: null,
            help: null
          }
        ]
      }
    }
  },
  
  invalidEmailError: {
    code: 400,
    message: 'Bad Request',
    response: {
      body: {
        errors: [
          {
            message: 'Invalid email address',
            field: 'to',
            help: 'Please provide a valid email address'
          }
        ]
      }
    }
  },
  
  rateLimitError: {
    code: 429,
    message: 'Too Many Requests',
    response: {
      body: {
        errors: [
          {
            message: 'Rate limit exceeded',
            field: null,
            help: 'Please wait before sending more emails'
          }
        ]
      }
    }
  },
  
  serverError: {
    code: 500,
    message: 'Internal Server Error',
    response: {
      body: {
        errors: [
          {
            message: 'An error occurred while processing your request',
            field: null,
            help: null
          }
        ]
      }
    }
  }
}

// Mock factory function
export const createMockSendGrid = (scenario: keyof typeof mockSendGridResponses = 'success') => {
  const mockInstance = new MockSendGridMail()
  
  if (scenario === 'success') {
    mockInstance.send.mockResolvedValue([mockSendGridResponse, {}])
  } else if (scenario in mockSendGridResponses) {
    const response = mockSendGridResponses[scenario]
    if ('code' in response && response.code >= 400) {
      mockInstance.send.mockRejectedValue(response)
    } else {
      mockInstance.send.mockResolvedValue([response, {}])
    }
  }
  
  return mockInstance
}

// Common email templates for testing
export const mockEmailTemplates = {
  welcome: {
    templateId: 'd-welcome123',
    subject: 'Welcome to {{ church_name }}!',
    dynamicTemplateData: {
      first_name: 'Test',
      church_name: 'Test Church',
      temp_password: 'tempPass123',
      login_url: 'https://testchurch.visionarychurch.ai/login'
    }
  },
  
  passwordReset: {
    templateId: 'd-reset456',
    subject: 'Reset Your Password',
    dynamicTemplateData: {
      first_name: 'Test',
      reset_url: 'https://testchurch.visionarychurch.ai/reset?token=abc123'
    }
  },
  
  visitConfirmation: {
    templateId: 'd-visit789',
    subject: 'Visit Confirmation',
    dynamicTemplateData: {
      visitor_name: 'Test Visitor',
      visit_date: '2024-08-15',
      visit_time: '10:00 AM',
      pastor_name: 'Pastor Smith'
    }
  },
  
  eventRegistration: {
    templateId: 'd-event123',
    subject: 'Event Registration Confirmed',
    dynamicTemplateData: {
      attendee_name: 'Test Attendee',
      event_title: 'Sunday Service',
      event_date: '2024-08-18',
      event_time: '10:00 AM'
    }
  }
}

// Jest mock setup for @sendgrid/mail
jest.mock('@sendgrid/mail', () => mockSendGridInstance)

export default mockSendGridInstance