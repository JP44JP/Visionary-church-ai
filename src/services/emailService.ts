import { AppError } from '@/types/index'

export interface EmailRequest {
  to: string
  subject: string
  content: string
  from?: string
  html?: string
  attachments?: Array<{
    filename: string
    content: string | Buffer
    contentType?: string
  }>
  headers?: Record<string, string>
  metadata?: Record<string, any>
}

export interface EmailResponse {
  id: string
  status: 'sent' | 'queued' | 'failed'
  message?: string
  external_id?: string
  provider?: string
}

export interface EmailProvider {
  name: string
  send(email: EmailRequest): Promise<EmailResponse>
  validateConfig(): boolean
}

// SendGrid Provider
class SendGridProvider implements EmailProvider {
  name = 'sendgrid'
  private apiKey: string

  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey
  }

  async send(email: EmailRequest): Promise<EmailResponse> {
    try {
      const sgMail = await import('@sendgrid/mail')
      sgMail.default.setApiKey(this.apiKey)

      const msg = {
        to: email.to,
        from: email.from || process.env.DEFAULT_FROM_EMAIL || 'noreply@church.com',
        subject: email.subject,
        text: email.content,
        html: email.html || email.content.replace(/\n/g, '<br>'),
        attachments: email.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          type: att.contentType
        })),
        customArgs: email.metadata
      }

      const response = await sgMail.default.send(msg)
      
      return {
        id: crypto.randomUUID(),
        status: 'sent',
        external_id: response[0].headers['x-message-id'] as string,
        provider: this.name
      }
    } catch (error: any) {
      console.error('SendGrid send error:', error)
      return {
        id: crypto.randomUUID(),
        status: 'failed',
        message: error?.response?.body?.errors?.[0]?.message || error.message,
        provider: this.name
      }
    }
  }

  validateConfig(): boolean {
    return !!this.apiKey
  }
}

// Mailgun Provider
class MailgunProvider implements EmailProvider {
  name = 'mailgun'
  private domain: string
  private apiKey: string

  constructor(config: { domain: string; apiKey: string }) {
    this.domain = config.domain
    this.apiKey = config.apiKey
  }

  async send(email: EmailRequest): Promise<EmailResponse> {
    try {
      const formData = new FormData()
      formData.append('from', email.from || process.env.DEFAULT_FROM_EMAIL || 'noreply@church.com')
      formData.append('to', email.to)
      formData.append('subject', email.subject)
      formData.append('text', email.content)
      if (email.html) {
        formData.append('html', email.html)
      }

      // Add metadata
      if (email.metadata) {
        Object.entries(email.metadata).forEach(([key, value]) => {
          formData.append(`v:${key}`, String(value))
        })
      }

      const response = await fetch(`https://api.mailgun.net/v3/${this.domain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`
        },
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Mailgun API error')
      }

      return {
        id: crypto.randomUUID(),
        status: 'sent',
        external_id: result.id,
        provider: this.name
      }
    } catch (error: any) {
      console.error('Mailgun send error:', error)
      return {
        id: crypto.randomUUID(),
        status: 'failed',
        message: error.message,
        provider: this.name
      }
    }
  }

  validateConfig(): boolean {
    return !!this.domain && !!this.apiKey
  }
}

// AWS SES Provider
class AWSProvider implements EmailProvider {
  name = 'aws-ses'
  private region: string
  private accessKeyId: string
  private secretAccessKey: string

  constructor(config: { region: string; accessKeyId: string; secretAccessKey: string }) {
    this.region = config.region
    this.accessKeyId = config.accessKeyId
    this.secretAccessKey = config.secretAccessKey
  }

  async send(email: EmailRequest): Promise<EmailResponse> {
    try {
      // This would require AWS SDK implementation
      // For now, returning a mock response
      throw new Error('AWS SES provider not implemented yet')
    } catch (error: any) {
      console.error('AWS SES send error:', error)
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

// SMTP Provider (fallback)
class SMTPProvider implements EmailProvider {
  name = 'smtp'
  private config: {
    host: string
    port: number
    secure: boolean
    user: string
    pass: string
  }

  constructor(config: { host: string; port: number; secure: boolean; user: string; pass: string }) {
    this.config = config
  }

  async send(email: EmailRequest): Promise<EmailResponse> {
    try {
      const nodemailer = await import('nodemailer')
      
      const transporter = nodemailer.default.createTransporter({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: {
          user: this.config.user,
          pass: this.config.pass
        }
      })

      const result = await transporter.sendMail({
        from: email.from || process.env.DEFAULT_FROM_EMAIL || 'noreply@church.com',
        to: email.to,
        subject: email.subject,
        text: email.content,
        html: email.html || email.content.replace(/\n/g, '<br>'),
        attachments: email.attachments
      })

      return {
        id: crypto.randomUUID(),
        status: 'sent',
        external_id: result.messageId,
        provider: this.name
      }
    } catch (error: any) {
      console.error('SMTP send error:', error)
      return {
        id: crypto.randomUUID(),
        status: 'failed',
        message: error.message,
        provider: this.name
      }
    }
  }

  validateConfig(): boolean {
    return !!this.config.host && !!this.config.user && !!this.config.pass
  }
}

export class EmailService {
  private providers: EmailProvider[] = []
  private defaultProvider?: EmailProvider
  private rateLimiter: Map<string, { count: number; resetTime: number }> = new Map()

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders() {
    // Initialize providers based on environment variables
    if (process.env.SENDGRID_API_KEY) {
      const sendgrid = new SendGridProvider({
        apiKey: process.env.SENDGRID_API_KEY
      })
      this.providers.push(sendgrid)
      if (!this.defaultProvider) this.defaultProvider = sendgrid
    }

    if (process.env.MAILGUN_DOMAIN && process.env.MAILGUN_API_KEY) {
      const mailgun = new MailgunProvider({
        domain: process.env.MAILGUN_DOMAIN,
        apiKey: process.env.MAILGUN_API_KEY
      })
      this.providers.push(mailgun)
      if (!this.defaultProvider) this.defaultProvider = mailgun
    }

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const smtp = new SMTPProvider({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      })
      this.providers.push(smtp)
      if (!this.defaultProvider) this.defaultProvider = smtp
    }

    if (!this.defaultProvider) {
      console.warn('No email providers configured. Email sending will fail.')
    }
  }

  async sendEmail(email: EmailRequest, provider?: string): Promise<EmailResponse> {
    try {
      // Rate limiting check
      await this.checkRateLimit(email.to)

      // Validate email
      this.validateEmail(email)

      // Select provider
      const selectedProvider = provider 
        ? this.providers.find(p => p.name === provider)
        : this.defaultProvider

      if (!selectedProvider) {
        throw new AppError('No email provider available', 'NO_EMAIL_PROVIDER', 500)
      }

      // Send email
      const result = await selectedProvider.send(email)

      // Update rate limiting
      this.updateRateLimit(email.to)

      // Log the email (in production, you might want to store this in database)
      console.log(`Email sent: ${result.id} to ${email.to} via ${selectedProvider.name}`)

      return result
    } catch (error) {
      if (error instanceof AppError) throw error
      console.error('Email service error:', error)
      throw new AppError('Failed to send email', 'EMAIL_SEND_ERROR', 500)
    }
  }

  async sendBulkEmails(emails: EmailRequest[], provider?: string): Promise<{
    sent: number
    failed: number
    results: EmailResponse[]
  }> {
    const results: EmailResponse[] = []
    let sent = 0
    let failed = 0

    // Process emails in batches to avoid overwhelming the provider
    const batchSize = 10
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (email) => {
        try {
          const result = await this.sendEmail(email, provider)
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

      // Small delay between batches
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return { sent, failed, results }
  }

  private validateEmail(email: EmailRequest) {
    if (!email.to || !email.to.includes('@')) {
      throw new AppError('Invalid recipient email address', 'INVALID_EMAIL', 400)
    }
    if (!email.subject) {
      throw new AppError('Email subject is required', 'MISSING_SUBJECT', 400)
    }
    if (!email.content) {
      throw new AppError('Email content is required', 'MISSING_CONTENT', 400)
    }
  }

  private async checkRateLimit(recipient: string): Promise<void> {
    const key = this.getRateLimitKey(recipient)
    const now = Date.now()
    const limit = this.rateLimiter.get(key)

    if (limit) {
      if (now < limit.resetTime) {
        if (limit.count >= this.getMaxEmailsPerHour()) {
          throw new AppError('Email rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429)
        }
      } else {
        // Reset the counter
        this.rateLimiter.set(key, { count: 0, resetTime: now + (60 * 60 * 1000) })
      }
    } else {
      this.rateLimiter.set(key, { count: 0, resetTime: now + (60 * 60 * 1000) })
    }
  }

  private updateRateLimit(recipient: string): void {
    const key = this.getRateLimitKey(recipient)
    const limit = this.rateLimiter.get(key)
    if (limit) {
      limit.count++
    }
  }

  private getRateLimitKey(recipient: string): string {
    // Extract domain from email for domain-based rate limiting
    const domain = recipient.split('@')[1] || recipient
    return `email_rate_${domain}`
  }

  private getMaxEmailsPerHour(): number {
    return parseInt(process.env.EMAIL_RATE_LIMIT_PER_HOUR || '100')
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
  processEmailTemplate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match
    })
  }

  generateUnsubscribeLink(email: string, sequenceId?: string): string {
    const token = Buffer.from(JSON.stringify({ email, sequenceId })).toString('base64')
    return `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${token}`
  }

  // Email validation utilities
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  normalizeEmail(email: string): string {
    return email.toLowerCase().trim()
  }

  // Bounce and complaint handling
  async handleBounce(messageId: string, bounceReason: string): Promise<void> {
    // This would typically update the database and potentially unsubscribe the user
    console.log(`Email bounced: ${messageId} - ${bounceReason}`)
    // Implementation would depend on your specific requirements
  }

  async handleComplaint(messageId: string, complaintReason: string): Promise<void> {
    // This would typically unsubscribe the user and flag for review
    console.log(`Email complaint: ${messageId} - ${complaintReason}`)
    // Implementation would depend on your specific requirements
  }
}