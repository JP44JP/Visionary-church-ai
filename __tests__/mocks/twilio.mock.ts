// Twilio SMS/Voice API Mock
import { jest } from '@jest/globals'

export interface MockSMSData {
  to: string
  from: string
  body: string
  mediaUrl?: string[]
  statusCallback?: string
}

export interface MockCallData {
  to: string
  from: string
  url: string
  method?: string
  statusCallback?: string
}

export const mockTwilioSMSResponse = {
  sid: 'SM' + Math.random().toString(36).substr(2, 32),
  accountSid: 'AC' + Math.random().toString(36).substr(2, 32),
  to: '+1234567890',
  from: '+0987654321',
  body: 'Mock SMS message',
  status: 'queued',
  direction: 'outbound-api',
  apiVersion: '2010-04-01',
  price: null,
  priceUnit: 'USD',
  errorCode: null,
  errorMessage: null,
  uri: '/2010-04-01/Accounts/ACtest/Messages/SMtest.json',
  subresourceUris: {},
  dateCreated: new Date(),
  dateUpdated: new Date(),
  dateSent: null
}

export const mockTwilioCallResponse = {
  sid: 'CA' + Math.random().toString(36).substr(2, 32),
  accountSid: 'AC' + Math.random().toString(36).substr(2, 32),
  to: '+1234567890',
  from: '+0987654321',
  status: 'queued',
  startTime: null,
  endTime: null,
  duration: null,
  price: null,
  priceUnit: 'USD',
  direction: 'outbound-api',
  answeredBy: null,
  apiVersion: '2010-04-01',
  forwardedFrom: null,
  groupSid: null,
  callerName: null,
  uri: '/2010-04-01/Accounts/ACtest/Calls/CAtest.json',
  subresourceUris: {},
  dateCreated: new Date(),
  dateUpdated: new Date()
}

export const mockTwilioError = {
  code: 21211,
  message: 'The \'To\' number is not a valid phone number.',
  moreInfo: 'https://www.twilio.com/docs/errors/21211',
  status: 400
}

// Mock Twilio Messages resource
export class MockTwilioMessages {
  private messages: MockSMSData[] = []
  
  create = jest.fn().mockImplementation((messageData: MockSMSData) => {
    this.messages.push(messageData)
    return Promise.resolve({
      ...mockTwilioSMSResponse,
      to: messageData.to,
      from: messageData.from,
      body: messageData.body
    })
  })
  
  // Test utility methods
  getLastMessage(): MockSMSData | undefined {
    return this.messages[this.messages.length - 1]
  }
  
  getAllMessages(): MockSMSData[] {
    return [...this.messages]
  }
  
  clearMessages(): void {
    this.messages = []
  }
  
  getMessagesTo(phoneNumber: string): MockSMSData[] {
    return this.messages.filter(m => m.to === phoneNumber)
  }
  
  getMessagesByContent(content: string): MockSMSData[] {
    return this.messages.filter(m => m.body.includes(content))
  }
}

// Mock Twilio Calls resource
export class MockTwilioCalls {
  private calls: MockCallData[] = []
  
  create = jest.fn().mockImplementation((callData: MockCallData) => {
    this.calls.push(callData)
    return Promise.resolve({
      ...mockTwilioCallResponse,
      to: callData.to,
      from: callData.from
    })
  })
  
  // Test utility methods
  getLastCall(): MockCallData | undefined {
    return this.calls[this.calls.length - 1]
  }
  
  getAllCalls(): MockCallData[] {
    return [...this.calls]
  }
  
  clearCalls(): void {
    this.calls = []
  }
  
  getCallsTo(phoneNumber: string): MockCallData[] {
    return this.calls.filter(c => c.to === phoneNumber)
  }
}

// Mock Twilio client
export class MockTwilioClient {
  accountSid: string
  authToken: string
  messages: MockTwilioMessages
  calls: MockTwilioCalls
  
  constructor(accountSid: string, authToken: string) {
    this.accountSid = accountSid
    this.authToken = authToken
    this.messages = new MockTwilioMessages()
    this.calls = new MockTwilioCalls()
  }
}

// Create singleton instance
export const mockTwilioInstance = new MockTwilioClient('test-sid', 'test-token')

// Mock responses for different scenarios
export const mockTwilioResponses = {
  smsSuccess: mockTwilioSMSResponse,
  
  callSuccess: mockTwilioCallResponse,
  
  visitReminder: {
    ...mockTwilioSMSResponse,
    body: 'Reminder: Your visit is scheduled for tomorrow at 10:00 AM. Please reply CONFIRM or call us if you need to reschedule.'
  },
  
  followUpSMS: {
    ...mockTwilioSMSResponse,
    body: 'Thank you for visiting our church! We hope you felt welcomed. Would you like to learn more about getting involved? Reply YES or visit our website.'
  },
  
  prayerRequestSMS: {
    ...mockTwilioSMSResponse,
    body: 'Your prayer request has been received and shared with our prayer team. You are in our thoughts and prayers.'
  },
  
  eventReminder: {
    ...mockTwilioSMSResponse,
    body: 'Reminder: The church picnic is this Saturday at 2:00 PM in the park. We look forward to seeing you there!'
  },
  
  emergencyCall: {
    ...mockTwilioCallResponse,
    status: 'in-progress'
  },
  
  authenticationError: {
    code: 20003,
    message: 'Authenticate',
    moreInfo: 'https://www.twilio.com/docs/errors/20003',
    status: 401
  },
  
  invalidPhoneError: {
    code: 21211,
    message: 'The \'To\' number is not a valid phone number.',
    moreInfo: 'https://www.twilio.com/docs/errors/21211',
    status: 400
  },
  
  insufficientBalanceError: {
    code: 21608,
    message: 'The account does not have sufficient funds to send the message.',
    moreInfo: 'https://www.twilio.com/docs/errors/21608',
    status: 400
  },
  
  rateLimitError: {
    code: 20429,
    message: 'Too Many Requests',
    moreInfo: 'https://www.twilio.com/docs/errors/20429',
    status: 429
  },
  
  serverError: {
    code: 20500,
    message: 'Internal Server Error',
    moreInfo: 'https://www.twilio.com/docs/errors/20500',
    status: 500
  }
}

// Mock factory function
export const createMockTwilio = (scenario: keyof typeof mockTwilioResponses = 'smsSuccess') => {
  const mockInstance = new MockTwilioClient('test-sid', 'test-token')
  
  if (scenario === 'smsSuccess') {
    mockInstance.messages.create.mockResolvedValue(mockTwilioSMSResponse)
  } else if (scenario === 'callSuccess') {
    mockInstance.calls.create.mockResolvedValue(mockTwilioCallResponse)
  } else if (scenario in mockTwilioResponses) {
    const response = mockTwilioResponses[scenario]
    if ('code' in response && response.status >= 400) {
      mockInstance.messages.create.mockRejectedValue(response)
      mockInstance.calls.create.mockRejectedValue(response)
    } else {
      if (response.body) {
        mockInstance.messages.create.mockResolvedValue(response)
      } else {
        mockInstance.calls.create.mockResolvedValue(response)
      }
    }
  }
  
  return mockInstance
}

// Common SMS templates for testing
export const mockSMSTemplates = {
  visitReminder: {
    body: 'Reminder: Your visit is scheduled for {{date}} at {{time}}. Please reply CONFIRM or call us if you need to reschedule.',
    variables: {
      date: 'tomorrow',
      time: '10:00 AM'
    }
  },
  
  followUp: {
    body: 'Thank you for visiting {{church_name}}! We hope you felt welcomed. Would you like to learn more about getting involved? Reply YES or visit our website.',
    variables: {
      church_name: 'Test Church'
    }
  },
  
  prayerConfirmation: {
    body: 'Your prayer request has been received and shared with our prayer team. You are in our thoughts and prayers.',
    variables: {}
  },
  
  eventReminder: {
    body: 'Reminder: {{event_name}} is {{when}} at {{location}}. We look forward to seeing you there!',
    variables: {
      event_name: 'The church picnic',
      when: 'this Saturday at 2:00 PM',
      location: 'the park'
    }
  },
  
  welcome: {
    body: 'Welcome to {{church_name}}! We\'re excited to have you join our community. If you have any questions, just reply to this message.',
    variables: {
      church_name: 'Test Church'
    }
  }
}

// Jest mock setup for twilio module
jest.mock('twilio', () => {
  return jest.fn().mockImplementation((accountSid: string, authToken: string) => {
    return new MockTwilioClient(accountSid, authToken)
  })
})

export default mockTwilioInstance