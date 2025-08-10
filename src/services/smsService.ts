import { AppError } from '@/types/index'

export interface SMSRequest {
  to: string
  message: string
  from?: string
  metadata?: Record<string, any>
}

export interface SMSResponse {
  id: string
  status: 'sent' | 'queued' | 'failed'
  message?: string
  external_id?: string
  provider?: string
}

export interface SMSProvider {
  name: string
  send(sms: SMSRequest): Promise<SMSResponse>
  validateConfig(): boolean
}

// Twilio Provider
class TwilioProvider implements SMSProvider {
  name = 'twilio'
  private accountSid: string
  private authToken: string
  private fromNumber: string

  constructor(config: { accountSid: string; authToken: string; fromNumber: string }) {
    this.accountSid = config.accountSid
    this.authToken = config.authToken
    this.fromNumber = config.fromNumber
  }

  async send(sms: SMSRequest): Promise<SMSResponse> {
    try {
      const twilio = await import('twilio')
      const client = twilio.default(this.accountSid, this.authToken)

      const message = await client.messages.create({
        body: sms.message,
        from: sms.from || this.fromNumber,
        to: sms.to
      })

      return {
        id: crypto.randomUUID(),
        status: message.status === 'queued' || message.status === 'sent' ? 'sent' : 'failed',
        external_id: message.sid,
        provider: this.name
      }
    } catch (error: any) {
      console.error('Twilio send error:', error)
      return {
        id: crypto.randomUUID(),
        status: 'failed',
        message: error.message,
        provider: this.name
      }
    }
  }

  validateConfig(): boolean {
    return !!this.accountSid && !!this.authToken && !!this.fromNumber
  }
}

// AWS SNS Provider
class AWSSNSProvider implements SMSProvider {
  name = 'aws-sns'
  private region: string
  private accessKeyId: string
  private secretAccessKey: string

  constructor(config: { region: string; accessKeyId: string; secretAccessKey: string }) {
    this.region = config.region
    this.accessKeyId = config.accessKeyId
    this.secretAccessKey = config.secretAccessKey
  }

  async send(sms: SMSRequest): Promise<SMSResponse> {
    try {
      // This would require AWS SDK implementation
      // For now, returning a mock response
      throw new Error('AWS SNS provider not implemented yet')
    } catch (error: any) {
      console.error('AWS SNS send error:', error)
      return {
        id: crypto.randomUUID(),
        status: 'failed',
        message: error.message,
        provider: this.name
      }
    }
  }

  validateConfig(): boolean {
    return !!this.region && !!this.accessKeyId && !!this.secretAccessKey
  }
}

// MessageBird Provider
class MessageBirdProvider implements SMSProvider {
  name = 'messagebird'
  private apiKey: string
  private originator: string

  constructor(config: { apiKey: string; originator: string }) {
    this.apiKey = config.apiKey
    this.originator = config.originator
  }

  async send(sms: SMSRequest): Promise<SMSResponse> {
    try {
      const response = await fetch('https://rest.messagebird.com/messages', {
        method: 'POST',
        headers: {
          'Authorization': `AccessKey ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipients: [sms.to],
          originator: sms.from || this.originator,
          body: sms.message
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.errors?.[0]?.description || 'MessageBird API error')
      }

      return {
        id: crypto.randomUUID(),
        status: 'sent',
        external_id: result.id,
        provider: this.name
      }
    } catch (error: any) {
      console.error('MessageBird send error:', error)
      return {
        id: crypto.randomUUID(),
        status: 'failed',
        message: error.message,
        provider: this.name
      }
    }
  }

  validateConfig(): boolean {
    return !!this.apiKey && !!this.originator
  }
}

// Vonage (formerly Nexmo) Provider
class VonageProvider implements SMSProvider {
  name = 'vonage'
  private apiKey: string
  private apiSecret: string
  private from: string

  constructor(config: { apiKey: string; apiSecret: string; from: string }) {
    this.apiKey = config.apiKey
    this.apiSecret = config.apiSecret
    this.from = config.from
  }

  async send(sms: SMSRequest): Promise<SMSResponse> {
    try {
      const vonage = await import('@vonage/server-sdk')
      const vonageClient = new vonage.default({
        apiKey: this.apiKey,
        apiSecret: this.apiSecret
      })

      const result = await vonageClient.sms.send({
        to: sms.to,
        from: sms.from || this.from,
        text: sms.message
      })

      const message = result.messages[0]
      const success = message.status === '0'

      return {
        id: crypto.randomUUID(),
        status: success ? 'sent' : 'failed',
        external_id: message['message-id'],
        message: success ? undefined : message['error-text'],
        provider: this.name
      }
    } catch (error: any) {
      console.error('Vonage send error:', error)
      return {
        id: crypto.randomUUID(),
        status: 'failed',
        message: error.message,
        provider: this.name
      }
    }
  }

  validateConfig(): boolean {
    return !!this.apiKey && !!this.apiSecret && !!this.from
  }
}

export class SMSService {
  private providers: SMSProvider[] = []
  private defaultProvider?: SMSProvider
  private rateLimiter: Map<string, { count: number; resetTime: number }> = new Map()

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders() {
    // Initialize providers based on environment variables
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      const twilio = new TwilioProvider({
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        fromNumber: process.env.TWILIO_PHONE_NUMBER
      })
      this.providers.push(twilio)
      if (!this.defaultProvider) this.defaultProvider = twilio
    }

    if (process.env.MESSAGEBIRD_API_KEY && process.env.MESSAGEBIRD_ORIGINATOR) {
      const messagebird = new MessageBirdProvider({
        apiKey: process.env.MESSAGEBIRD_API_KEY,
        originator: process.env.MESSAGEBIRD_ORIGINATOR
      })
      this.providers.push(messagebird)
      if (!this.defaultProvider) this.defaultProvider = messagebird
    }

    if (process.env.VONAGE_API_KEY && process.env.VONAGE_API_SECRET && process.env.VONAGE_FROM_NUMBER) {
      const vonage = new VonageProvider({
        apiKey: process.env.VONAGE_API_KEY,
        apiSecret: process.env.VONAGE_API_SECRET,
        from: process.env.VONAGE_FROM_NUMBER
      })
      this.providers.push(vonage)
      if (!this.defaultProvider) this.defaultProvider = vonage
    }

    if (!this.defaultProvider) {
      console.warn('No SMS providers configured. SMS sending will fail.')
    }
  }

  async sendSMS(sms: SMSRequest, provider?: string): Promise<SMSResponse> {
    try {
      // Rate limiting check
      await this.checkRateLimit(sms.to)

      // Validate SMS
      this.validateSMS(sms)

      // Select provider
      const selectedProvider = provider 
        ? this.providers.find(p => p.name === provider)
        : this.defaultProvider

      if (!selectedProvider) {
        throw new AppError('No SMS provider available', 'NO_SMS_PROVIDER', 500)
      }

      // Check message length and split if necessary
      const messages = this.splitLongMessage(sms.message)
      
      if (messages.length === 1) {
        // Single message
        const result = await selectedProvider.send(sms)
        this.updateRateLimit(sms.to)
        console.log(`SMS sent: ${result.id} to ${sms.to} via ${selectedProvider.name}`)
        return result
      } else {
        // Multiple messages
        const results: SMSResponse[] = []
        for (let i = 0; i < messages.length; i++) {
          const messagePart = `(${i + 1}/${messages.length}) ${messages[i]}`
          const partResult = await selectedProvider.send({
            ...sms,
            message: messagePart
          })
          results.push(partResult)
          
          // Small delay between parts
          if (i < messages.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }

        this.updateRateLimit(sms.to, messages.length)
        
        // Return combined result
        const allSent = results.every(r => r.status === 'sent')
        return {
          id: crypto.randomUUID(),
          status: allSent ? 'sent' : 'failed',
          message: allSent ? `Sent as ${messages.length} parts` : 'Some parts failed',
          provider: selectedProvider.name
        }
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      console.error('SMS service error:', error)
      throw new AppError('Failed to send SMS', 'SMS_SEND_ERROR', 500)
    }
  }

  async sendBulkSMS(messages: SMSRequest[], provider?: string): Promise<{
    sent: number
    failed: number
    results: SMSResponse[]
  }> {
    const results: SMSResponse[] = []
    let sent = 0
    let failed = 0

    // Process SMS in batches to avoid overwhelming the provider
    const batchSize = 5
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (sms) => {
        try {
          const result = await this.sendSMS(sms, provider)
          if (result.status === 'sent') sent++
          else failed++
          return result
        } catch (error) {
          failed++
          return {
            id: crypto.randomUUID(),
            status: 'failed' as const,
            message: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)

      // Longer delay between SMS batches
      if (i + batchSize < messages.length) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    return { sent, failed, results }
  }

  private validateSMS(sms: SMSRequest) {
    if (!sms.to) {
      throw new AppError('Recipient phone number is required', 'MISSING_RECIPIENT', 400)
    }
    if (!this.isValidPhoneNumber(sms.to)) {
      throw new AppError('Invalid phone number format', 'INVALID_PHONE', 400)
    }
    if (!sms.message || sms.message.trim().length === 0) {
      throw new AppError('SMS message is required', 'MISSING_MESSAGE', 400)
    }
    if (sms.message.length > 1600) { // Max for concatenated SMS
      throw new AppError('SMS message too long', 'MESSAGE_TOO_LONG', 400)
    }
  }

  private async checkRateLimit(recipient: string): Promise<void> {
    const key = this.getRateLimitKey(recipient)
    const now = Date.now()
    const limit = this.rateLimiter.get(key)

    if (limit) {
      if (now < limit.resetTime) {
        if (limit.count >= this.getMaxSMSPerHour()) {
          throw new AppError('SMS rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429)
        }
      } else {
        // Reset the counter
        this.rateLimiter.set(key, { count: 0, resetTime: now + (60 * 60 * 1000) })
      }
    } else {
      this.rateLimiter.set(key, { count: 0, resetTime: now + (60 * 60 * 1000) })
    }
  }

  private updateRateLimit(recipient: string, count: number = 1): void {
    const key = this.getRateLimitKey(recipient)
    const limit = this.rateLimiter.get(key)
    if (limit) {
      limit.count += count
    }
  }

  private getRateLimitKey(recipient: string): string {
    return `sms_rate_${recipient}`
  }

  private getMaxSMSPerHour(): number {
    return parseInt(process.env.SMS_RATE_LIMIT_PER_HOUR || '50')
  }

  private splitLongMessage(message: string): string[] {
    const maxLength = 160 // Standard SMS length
    const maxConcatenatedLength = 153 // Length for concatenated SMS parts

    if (message.length <= maxLength) {
      return [message]
    }

    const messages: string[] = []
    let currentMessage = ''

    // Split by words to avoid breaking words
    const words = message.split(' ')
    
    for (const word of words) {
      const testMessage = currentMessage ? `${currentMessage} ${word}` : word
      
      if (testMessage.length <= maxConcatenatedLength) {
        currentMessage = testMessage
      } else {
        if (currentMessage) {
          messages.push(currentMessage)
          currentMessage = word
        } else {
          // Single word is too long, we'll have to break it
          messages.push(word.substring(0, maxConcatenatedLength))
          currentMessage = word.substring(maxConcatenatedLength)
        }
      }
    }
    
    if (currentMessage) {
      messages.push(currentMessage)
    }

    return messages
  }

  // Phone number validation and formatting
  isValidPhoneNumber(phone: string): boolean {
    // Basic phone number validation - you might want to use a library like libphonenumber-js
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    return phoneRegex.test(cleanPhone)
  }

  normalizePhoneNumber(phone: string): string {
    // Remove common formatting characters
    const cleaned = phone.replace(/[\s\-\(\)]/g, '')
    
    // Add + if missing and number doesn't start with it
    if (!cleaned.startsWith('+') && !cleaned.startsWith('00')) {
      // Assume US number if no country code
      if (cleaned.length === 10) {
        return `+1${cleaned}`
      }
      return `+${cleaned}`
    }
    
    return cleaned.startsWith('00') ? `+${cleaned.substring(2)}` : cleaned
  }

  // Provider management methods
  getAvailableProviders(): string[] {
    return this.providers.map(p => p.name)
  }

  getDefaultProvider(): string | undefined {
    return this.defaultProvider?.name
  }

  isProviderHealthy(providerName: string): boolean {
    const provider = this.providers.find(p => p.name === providerName)
    return provider?.validateConfig() || false
  }

  // Template processing utilities
  processSMSTemplate(template: string, variables: Record<string, any>): string {
    let processed = template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match
    })

    // Ensure SMS is within reasonable length
    if (processed.length > 160) {
      console.warn(`SMS template result is ${processed.length} characters, may be split into multiple messages`)
    }

    return processed
  }

  // Delivery status handling
  async handleDeliveryStatus(messageId: string, status: string, errorCode?: string): Promise<void> {
    // This would typically update the database with delivery status
    console.log(`SMS delivery status: ${messageId} - ${status}${errorCode ? ` (${errorCode})` : ''}`)
    // Implementation would depend on your specific requirements
  }

  // Opt-out handling
  async handleOptOut(phoneNumber: string): Promise<void> {
    // This would typically update the database to mark the number as opted out
    console.log(`SMS opt-out received from: ${phoneNumber}`)
    // Implementation would depend on your specific requirements
  }

  // Get SMS cost estimation (useful for budgeting)
  estimateSmsCost(message: string, recipientCount: number): {
    messageCount: number
    estimatedCost: number
    currency: string
  } {
    const messages = this.splitLongMessage(message)
    const totalMessages = messages.length * recipientCount
    
    // These are rough estimates - actual costs vary by provider and destination
    const costPerMessage = 0.01 // $0.01 per message (adjust based on your provider)
    
    return {
      messageCount: totalMessages,
      estimatedCost: totalMessages * costPerMessage,
      currency: 'USD'
    }
  }

  // Quiet hours checking
  isWithinQuietHours(timezone: string = 'UTC', quietHours: { start: string; end: string } = { start: '22:00', end: '08:00' }): boolean {
    try {
      const now = new Date()
      const currentTime = now.toLocaleTimeString('en-US', { 
        timeZone: timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      })

      const [currentHour, currentMinute] = currentTime.split(':').map(Number)
      const currentMinutes = currentHour * 60 + currentMinute

      const [startHour, startMinute] = quietHours.start.split(':').map(Number)
      const startMinutes = startHour * 60 + startMinute

      const [endHour, endMinute] = quietHours.end.split(':').map(Number)
      const endMinutes = endHour * 60 + endMinute

      // Handle overnight quiet hours (e.g., 22:00 to 08:00)
      if (startMinutes > endMinutes) {
        return currentMinutes >= startMinutes || currentMinutes <= endMinutes
      } else {
        return currentMinutes >= startMinutes && currentMinutes <= endMinutes
      }
    } catch (error) {
      console.error('Error checking quiet hours:', error)
      return false
    }
  }
}