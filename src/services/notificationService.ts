// Notification Service for Email, SMS, and Push Notifications
import { z } from 'zod';
import sgMail from '@sendgrid/mail';
import twilio from 'twilio';
import { config } from '../config';
import { prisma, redis, logger } from '../app';
import { ValidationError, ServiceUnavailableError, NotFoundError } from '../utils/errors';
import { Queue, Job } from 'bullmq';

// Validation schemas
export const emailTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  subject: z.string().min(1).max(255),
  bodyHtml: z.string().min(1),
  bodyText: z.string().optional(),
  variables: z.array(z.string()).default([]),
  category: z.string().optional()
});

export const sendEmailSchema = z.object({
  to: z.string().email(),
  templateId: z.string().uuid().optional(),
  subject: z.string().min(1).max(255).optional(),
  bodyHtml: z.string().optional(),
  bodyText: z.string().optional(),
  variables: z.record(z.any()).default({}),
  scheduledFor: z.date().optional(),
  priority: z.enum(['low', 'normal', 'high']).default('normal')
});

export const sendSMSSchema = z.object({
  to: z.string().min(10).max(15),
  message: z.string().min(1).max(1600),
  scheduledFor: z.date().optional(),
  priority: z.enum(['low', 'normal', 'high']).default('normal')
});

export const emailSequenceSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  triggerEvent: z.string().min(1),
  triggerConditions: z.record(z.any()).default({}),
  startDelayDays: z.number().min(0).default(0),
  isActive: z.boolean().default(true)
});

export const sequenceEmailSchema = z.object({
  sequenceId: z.string().uuid(),
  name: z.string().min(1).max(255),
  subject: z.string().min(1).max(255),
  bodyHtml: z.string().min(1),
  bodyText: z.string().optional(),
  delayDays: z.number().min(0).default(0),
  orderIndex: z.number().min(0),
  sendConditions: z.record(z.any()).default({}),
  isActive: z.boolean().default(true)
});

interface EmailJobData {
  tenantId: string;
  to: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  templateId?: string;
  variables?: Record<string, any>;
  priority: 'low' | 'normal' | 'high';
  scheduledFor?: Date;
}

interface SMSJobData {
  tenantId: string;
  to: string;
  message: string;
  priority: 'low' | 'normal' | 'high';
  scheduledFor?: Date;
}

export class NotificationService {
  private static instance: NotificationService;
  private emailQueue: Queue<EmailJobData>;
  private smsQueue: Queue<SMSJobData>;
  private twilioClient: twilio.Twilio | null = null;
  
  private constructor() {
    // Initialize SendGrid
    if (config.email.sendgrid.apiKey) {
      sgMail.setApiKey(config.email.sendgrid.apiKey);
    }
    
    // Initialize Twilio
    if (config.sms.twilio.accountSid && config.sms.twilio.authToken) {
      this.twilioClient = twilio(
        config.sms.twilio.accountSid,
        config.sms.twilio.authToken
      );
    }
    
    // Initialize queues
    this.emailQueue = new Queue<EmailJobData>('email-notifications', {
      connection: { host: 'localhost', port: 6379 }, // Redis connection
      defaultJobOptions: config.queues.email.defaultJobOptions
    });
    
    this.smsQueue = new Queue<SMSJobData>('sms-notifications', {
      connection: { host: 'localhost', port: 6379 }, // Redis connection
      defaultJobOptions: config.queues.sms.defaultJobOptions
    });
    
    this.setupWorkers();
  }
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
  
  /**
   * Setup queue workers
   */
  private setupWorkers(): void {
    // Email worker
    this.emailQueue.process(async (job: Job<EmailJobData>) => {
      await this.processEmailJob(job.data);
    });
    
    // SMS worker
    this.smsQueue.process(async (job: Job<SMSJobData>) => {
      await this.processSMSJob(job.data);
    });
  }
  
  /**
   * Process email job
   */
  private async processEmailJob(data: EmailJobData): Promise<void> {
    try {
      if (!config.email.sendgrid.apiKey) {
        throw new ServiceUnavailableError('SendGrid not configured');
      }
      
      // Check rate limiting
      const rateLimitKey = `email_rate_limit:${data.tenantId}`;
      const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
      const hourlyKey = `${rateLimitKey}:${currentHour}`;
      
      const emailCount = await redis.incr(hourlyKey);
      if (emailCount === 1) {
        await redis.expire(hourlyKey, 3600); // 1 hour TTL
      }
      
      if (emailCount > config.rateLimits.api.email.max) {
        throw new Error(`Email rate limit exceeded for tenant ${data.tenantId}`);
      }
      
      // Render template variables if provided
      let { subject, bodyHtml, bodyText } = data;
      
      if (data.variables && Object.keys(data.variables).length > 0) {
        subject = this.renderTemplate(subject, data.variables);
        bodyHtml = this.renderTemplate(bodyHtml, data.variables);
        if (bodyText) {
          bodyText = this.renderTemplate(bodyText, data.variables);
        }
      }
      
      // Send email via SendGrid
      const msg = {
        to: data.to,
        from: {
          email: config.email.from.email,
          name: config.email.from.name
        },
        subject,
        html: bodyHtml,
        text: bodyText || this.htmlToText(bodyHtml),
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true }
        }
      };
      
      await sgMail.send(msg);
      
      // Log successful delivery
      await this.logEmailDelivery(
        data.tenantId,
        data.to,
        data.templateId || null,
        'sent',
        null
      );
      
      logger.info('Email sent successfully', {
        tenantId: data.tenantId,
        to: data.to,
        subject,
        templateId: data.templateId
      });
      
    } catch (error) {
      // Log failed delivery
      await this.logEmailDelivery(
        data.tenantId,
        data.to,
        data.templateId || null,
        'failed',
        error.message
      );
      
      logger.error('Email sending failed', {
        tenantId: data.tenantId,
        to: data.to,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Process SMS job
   */
  private async processSMSJob(data: SMSJobData): Promise<void> {
    try {
      if (!this.twilioClient) {
        throw new ServiceUnavailableError('Twilio not configured');
      }
      
      // Check rate limiting
      const rateLimitKey = `sms_rate_limit:${data.tenantId}`;
      const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
      const hourlyKey = `${rateLimitKey}:${currentHour}`;
      
      const smsCount = await redis.incr(hourlyKey);
      if (smsCount === 1) {
        await redis.expire(hourlyKey, 3600); // 1 hour TTL
      }
      
      if (smsCount > config.rateLimits.api.sms.max) {
        throw new Error(`SMS rate limit exceeded for tenant ${data.tenantId}`);
      }
      
      // Send SMS via Twilio
      const message = await this.twilioClient.messages.create({
        body: data.message,
        from: config.sms.twilio.phoneNumber,
        to: data.to
      });
      
      // Log successful delivery
      await this.logSMSDelivery(
        data.tenantId,
        data.to,
        data.message,
        'sent',
        message.sid
      );
      
      logger.info('SMS sent successfully', {
        tenantId: data.tenantId,
        to: data.to,
        sid: message.sid
      });
      
    } catch (error) {
      // Log failed delivery
      await this.logSMSDelivery(
        data.tenantId,
        data.to,
        data.message,
        'failed',
        null,
        error.message
      );
      
      logger.error('SMS sending failed', {
        tenantId: data.tenantId,
        to: data.to,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Send email (queue for processing)
   */
  async sendEmail(
    tenantId: string,
    emailData: z.infer<typeof sendEmailSchema>
  ): Promise<{ jobId: string }> {
    try {
      let { subject, bodyHtml, bodyText } = emailData;
      
      // If template ID is provided, get template data
      if (emailData.templateId) {
        const template = await this.getEmailTemplate(tenantId, emailData.templateId);
        subject = template.subject;
        bodyHtml = template.bodyHtml;
        bodyText = template.bodyText || undefined;
      }
      
      if (!subject || !bodyHtml) {
        throw new ValidationError('Subject and body are required');
      }
      
      const jobData: EmailJobData = {
        tenantId,
        to: emailData.to,
        subject,
        bodyHtml,
        bodyText,
        templateId: emailData.templateId,
        variables: emailData.variables,
        priority: emailData.priority,
        scheduledFor: emailData.scheduledFor
      };
      
      const jobOptions: any = {};
      
      // Set priority
      if (emailData.priority === 'high') {
        jobOptions.priority = 10;
      } else if (emailData.priority === 'low') {
        jobOptions.priority = 1;
      } else {
        jobOptions.priority = 5;
      }
      
      // Set delay for scheduled emails
      if (emailData.scheduledFor) {
        const delay = emailData.scheduledFor.getTime() - Date.now();
        if (delay > 0) {
          jobOptions.delay = delay;
        }
      }
      
      const job = await this.emailQueue.add('send-email', jobData, jobOptions);
      
      return { jobId: job.id };
      
    } catch (error) {
      logger.error('Error queuing email:', error);
      throw error;
    }
  }
  
  /**
   * Send SMS (queue for processing)
   */
  async sendSMS(
    tenantId: string,
    smsData: z.infer<typeof sendSMSSchema>
  ): Promise<{ jobId: string }> {
    try {
      if (!config.features.smsNotifications) {
        throw new ServiceUnavailableError('SMS notifications are disabled');
      }
      
      const jobData: SMSJobData = {
        tenantId,
        to: smsData.to,
        message: smsData.message,
        priority: smsData.priority,
        scheduledFor: smsData.scheduledFor
      };
      
      const jobOptions: any = {};
      
      // Set priority
      if (smsData.priority === 'high') {
        jobOptions.priority = 10;
      } else if (smsData.priority === 'low') {
        jobOptions.priority = 1;
      } else {
        jobOptions.priority = 5;
      }
      
      // Set delay for scheduled SMS
      if (smsData.scheduledFor) {
        const delay = smsData.scheduledFor.getTime() - Date.now();
        if (delay > 0) {
          jobOptions.delay = delay;
        }
      }
      
      const job = await this.smsQueue.add('send-sms', jobData, jobOptions);
      
      return { jobId: job.id };
      
    } catch (error) {
      logger.error('Error queuing SMS:', error);
      throw error;
    }
  }
  
  /**
   * Create email template
   */
  async createEmailTemplate(
    tenantId: string,
    templateData: z.infer<typeof emailTemplateSchema>
  ): Promise<any> {
    try {
      // Get tenant schema name
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { schemaName: true }
      });
      
      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }
      
      // Create template
      const template = await prisma.$executeRaw`
        INSERT INTO ${tenant.schemaName}.email_templates (
          name, subject, body_html, body_text, variables, category
        ) VALUES (
          ${templateData.name}, ${templateData.subject}, 
          ${templateData.bodyHtml}, ${templateData.bodyText || null},
          ${JSON.stringify(templateData.variables)}, ${templateData.category || null}
        ) RETURNING *
      `;
      
      return template;
      
    } catch (error) {
      logger.error('Error creating email template:', error);
      throw error;
    }
  }
  
  /**
   * Get email template
   */
  async getEmailTemplate(tenantId: string, templateId: string): Promise<any> {
    try {
      // Get tenant schema name
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { schemaName: true }
      });
      
      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }
      
      // Get template
      const templates = await prisma.$queryRaw`
        SELECT * FROM ${tenant.schemaName}.email_templates
        WHERE id = ${templateId}
      `;
      
      if (!Array.isArray(templates) || templates.length === 0) {
        throw new NotFoundError('Email template not found');
      }
      
      return templates[0];
      
    } catch (error) {
      logger.error('Error getting email template:', error);
      throw error;
    }
  }
  
  /**
   * Create email sequence
   */
  async createEmailSequence(
    tenantId: string,
    sequenceData: z.infer<typeof emailSequenceSchema>
  ): Promise<any> {
    try {
      // Get tenant schema name
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { schemaName: true }
      });
      
      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }
      
      // Create sequence
      const sequence = await prisma.$executeRaw`
        INSERT INTO ${tenant.schemaName}.email_sequences (
          name, description, trigger_event, trigger_conditions, 
          start_delay_days, is_active
        ) VALUES (
          ${sequenceData.name}, ${sequenceData.description || null},
          ${sequenceData.triggerEvent}, ${JSON.stringify(sequenceData.triggerConditions)},
          ${sequenceData.startDelayDays}, ${sequenceData.isActive}
        ) RETURNING *
      `;
      
      return sequence;
      
    } catch (error) {
      logger.error('Error creating email sequence:', error);
      throw error;
    }
  }
  
  /**
   * Add email to sequence
   */
  async addEmailToSequence(
    tenantId: string,
    emailData: z.infer<typeof sequenceEmailSchema>
  ): Promise<any> {
    try {
      // Get tenant schema name
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { schemaName: true }
      });
      
      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }
      
      // Add email to sequence
      const email = await prisma.$executeRaw`
        INSERT INTO ${tenant.schemaName}.sequence_emails (
          sequence_id, name, subject, body_html, body_text,
          delay_days, order_index, send_conditions, is_active
        ) VALUES (
          ${emailData.sequenceId}, ${emailData.name}, ${emailData.subject},
          ${emailData.bodyHtml}, ${emailData.bodyText || null},
          ${emailData.delayDays}, ${emailData.orderIndex},
          ${JSON.stringify(emailData.sendConditions)}, ${emailData.isActive}
        ) RETURNING *
      `;
      
      return email;
      
    } catch (error) {
      logger.error('Error adding email to sequence:', error);
      throw error;
    }
  }
  
  /**
   * Trigger email sequence for a member
   */
  async triggerSequence(
    tenantId: string,
    memberId: string,
    triggerEvent: string,
    variables: Record<string, any> = {}
  ): Promise<void> {
    try {
      // Get tenant schema name
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { schemaName: true }
      });
      
      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }
      
      // Get active sequences for this trigger event
      const sequences = await prisma.$queryRaw`
        SELECT * FROM ${tenant.schemaName}.email_sequences
        WHERE trigger_event = ${triggerEvent} AND is_active = true
      `;
      
      if (!Array.isArray(sequences) || sequences.length === 0) {
        return; // No sequences to trigger
      }
      
      // Get member details
      const members = await prisma.$queryRaw`
        SELECT email, first_name, last_name FROM ${tenant.schemaName}.members
        WHERE id = ${memberId}
      `;
      
      if (!Array.isArray(members) || members.length === 0) {
        throw new NotFoundError('Member not found');
      }
      
      const member = members[0] as any;
      
      // Schedule emails for each sequence
      for (const sequence of sequences as any[]) {
        // Get emails in sequence
        const emails = await prisma.$queryRaw`
          SELECT * FROM ${tenant.schemaName}.sequence_emails
          WHERE sequence_id = ${sequence.id} AND is_active = true
          ORDER BY order_index
        `;
        
        if (!Array.isArray(emails) || emails.length === 0) {
          continue;
        }
        
        // Schedule each email in the sequence
        for (const email of emails as any[]) {
          const scheduledFor = new Date(
            Date.now() + 
            (sequence.start_delay_days * 24 * 60 * 60 * 1000) + 
            (email.delay_days * 24 * 60 * 60 * 1000)
          );
          
          const emailVariables = {
            ...variables,
            member_first_name: member.first_name,
            member_last_name: member.last_name,
            member_email: member.email
          };
          
          await this.sendEmail(tenantId, {
            to: member.email,
            subject: email.subject,
            bodyHtml: email.body_html,
            bodyText: email.body_text,
            variables: emailVariables,
            scheduledFor,
            priority: 'normal'
          });
        }
      }
      
    } catch (error) {
      logger.error('Error triggering sequence:', error);
      throw error;
    }
  }
  
  /**
   * Get notification delivery history
   */
  async getDeliveryHistory(
    tenantId: string,
    type: 'email' | 'sms',
    filters: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<any> {
    try {
      const { status, startDate, endDate, page = 1, limit = 25 } = filters;
      const offset = (page - 1) * limit;
      
      let whereConditions: string[] = [`type = '${type}'`];
      let params: any[] = [];
      let paramIndex = 1;
      
      if (status) {
        whereConditions.push(`status = $${paramIndex}`);
        params.push(status);
        paramIndex++;
      }
      
      if (startDate) {
        whereConditions.push(`created_at >= $${paramIndex}`);
        params.push(startDate);
        paramIndex++;
      }
      
      if (endDate) {
        whereConditions.push(`created_at <= $${paramIndex}`);
        params.push(endDate);
        paramIndex++;
      }
      
      const whereClause = whereConditions.join(' AND ');
      
      // Get total count
      const countResult = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count
        FROM shared.notification_logs
        WHERE tenant_id = $1 AND ${whereClause}
      `, tenantId, ...params);
      
      const total = parseInt((countResult as any)[0].count);
      
      // Get delivery history
      const history = await prisma.$queryRawUnsafe(`
        SELECT *
        FROM shared.notification_logs
        WHERE tenant_id = $1 AND ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}
      `, tenantId, ...params, limit, offset);
      
      return {
        history,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
      
    } catch (error) {
      logger.error('Error getting delivery history:', error);
      throw error;
    }
  }
  
  /**
   * Utility methods
   */
  private renderTemplate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }
  
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  private async logEmailDelivery(
    tenantId: string,
    to: string,
    templateId: string | null,
    status: string,
    error: string | null
  ): Promise<void> {
    try {
      await prisma.$executeRaw`
        INSERT INTO shared.notification_logs (
          tenant_id, type, recipient, template_id, status, error_message
        ) VALUES (
          ${tenantId}, 'email', ${to}, ${templateId}, ${status}, ${error}
        )
      `;
    } catch (logError) {
      logger.error('Error logging email delivery:', logError);
    }
  }
  
  private async logSMSDelivery(
    tenantId: string,
    to: string,
    message: string,
    status: string,
    externalId: string | null,
    error: string | null = null
  ): Promise<void> {
    try {
      await prisma.$executeRaw`
        INSERT INTO shared.notification_logs (
          tenant_id, type, recipient, message_content, status, 
          external_id, error_message
        ) VALUES (
          ${tenantId}, 'sms', ${to}, ${message}, ${status}, 
          ${externalId}, ${error}
        )
      `;
    } catch (logError) {
      logger.error('Error logging SMS delivery:', logError);
    }
  }
}

export default NotificationService;