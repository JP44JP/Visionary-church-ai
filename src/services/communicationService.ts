import { EventCommunication, CommunicationType, CommunicationChannel, CommunicationTemplate } from '../types/events';
import { config } from '../config';

export interface EmailData {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SMSData {
  to: string;
  from: string;
  body: string;
}

export interface NotificationData {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export class CommunicationService {
  private templates: Map<string, CommunicationTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // Registration confirmation templates
    this.templates.set('registration_confirmation_email', {
      type: 'announcement',
      channel: 'email',
      subject: 'Event Registration Confirmed - {{eventTitle}}',
      content: `
        <h2>Registration Confirmed!</h2>
        <p>Dear {{attendeeName}},</p>
        <p>Your registration for <strong>{{eventTitle}}</strong> has been confirmed.</p>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Event Details:</h3>
          <p><strong>Date:</strong> {{eventDate}}</p>
          <p><strong>Time:</strong> {{eventTime}}</p>
          <p><strong>Location:</strong> {{eventLocation}}</p>
          {{#if eventCost}}<p><strong>Cost:</strong> ${{eventCost}}</p>{{/if}}
        </div>
        
        {{#if qrCode}}
        <div style="text-align: center; margin: 20px 0;">
          <h3>Your Check-in QR Code:</h3>
          <img src="{{qrCodeUrl}}" alt="Check-in QR Code" style="max-width: 200px;" />
          <p><em>Please bring this QR code for quick check-in at the event.</em></p>
        </div>
        {{/if}}
        
        <p>We look forward to seeing you there!</p>
        <p>Blessings,<br>{{churchName}} Team</p>
      `,
      variables: ['attendeeName', 'eventTitle', 'eventDate', 'eventTime', 'eventLocation', 'eventCost', 'qrCodeUrl', 'churchName']
    });

    this.templates.set('registration_confirmation_sms', {
      type: 'announcement',
      channel: 'sms',
      subject: '',
      content: 'Hi {{attendeeName}}! Your registration for {{eventTitle}} on {{eventDate}} at {{eventTime}} is confirmed. Location: {{eventLocation}}. See you there! - {{churchName}}',
      variables: ['attendeeName', 'eventTitle', 'eventDate', 'eventTime', 'eventLocation', 'churchName']
    });

    // Reminder templates
    this.templates.set('event_reminder_email', {
      type: 'reminder',
      channel: 'email',
      subject: 'Reminder: {{eventTitle}} is {{timeUntil}}',
      content: `
        <h2>Event Reminder</h2>
        <p>Dear {{attendeeName}},</p>
        <p>This is a friendly reminder that <strong>{{eventTitle}}</strong> is {{timeUntil}}!</p>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Event Details:</h3>
          <p><strong>Date:</strong> {{eventDate}}</p>
          <p><strong>Time:</strong> {{eventTime}}</p>
          <p><strong>Location:</strong> {{eventLocation}}</p>
        </div>
        
        {{#if lastMinuteUpdates}}
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 8px;">
          <h4>📢 Important Updates:</h4>
          <p>{{lastMinuteUpdates}}</p>
        </div>
        {{/if}}
        
        <p>We're excited to see you there!</p>
        <p>Blessings,<br>{{churchName}} Team</p>
      `,
      variables: ['attendeeName', 'eventTitle', 'timeUntil', 'eventDate', 'eventTime', 'eventLocation', 'lastMinuteUpdates', 'churchName']
    });

    this.templates.set('event_reminder_sms', {
      type: 'reminder',
      channel: 'sms',
      subject: '',
      content: 'Reminder: {{eventTitle}} is {{timeUntil}} at {{eventLocation}}. {{eventTime}} on {{eventDate}}. See you there! - {{churchName}}',
      variables: ['eventTitle', 'timeUntil', 'eventLocation', 'eventTime', 'eventDate', 'churchName']
    });

    // Waitlist promotion templates
    this.templates.set('waitlist_promotion_email', {
      type: 'announcement',
      channel: 'email',
      subject: 'Great News! You\'re off the waitlist for {{eventTitle}}',
      content: `
        <h2>You're In! 🎉</h2>
        <p>Dear {{attendeeName}},</p>
        <p>Great news! A spot has opened up for <strong>{{eventTitle}}</strong> and you've been moved from the waitlist to confirmed!</p>
        
        <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Event Details:</h3>
          <p><strong>Date:</strong> {{eventDate}}</p>
          <p><strong>Time:</strong> {{eventTime}}</p>
          <p><strong>Location:</strong> {{eventLocation}}</p>
        </div>
        
        <p><strong>Please confirm your attendance by {{confirmationDeadline}} to secure your spot.</strong></p>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="{{confirmationUrl}}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Confirm Attendance
          </a>
        </div>
        
        <p>We're thrilled you can join us!</p>
        <p>Blessings,<br>{{churchName}} Team</p>
      `,
      variables: ['attendeeName', 'eventTitle', 'eventDate', 'eventTime', 'eventLocation', 'confirmationDeadline', 'confirmationUrl', 'churchName']
    });

    // Event update templates
    this.templates.set('event_update_email', {
      type: 'update',
      channel: 'email',
      subject: 'Important Update: {{eventTitle}}',
      content: `
        <h2>Event Update</h2>
        <p>Dear {{attendeeName}},</p>
        <p>We have an important update regarding <strong>{{eventTitle}}</strong>:</p>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>📢 Update:</h3>
          <p>{{updateMessage}}</p>
        </div>
        
        {{#if newEventDetails}}
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Updated Event Details:</h3>
          <p><strong>Date:</strong> {{eventDate}}</p>
          <p><strong>Time:</strong> {{eventTime}}</p>
          <p><strong>Location:</strong> {{eventLocation}}</p>
        </div>
        {{/if}}
        
        <p>Thank you for your understanding. We look forward to seeing you!</p>
        <p>Blessings,<br>{{churchName}} Team</p>
      `,
      variables: ['attendeeName', 'eventTitle', 'updateMessage', 'newEventDetails', 'eventDate', 'eventTime', 'eventLocation', 'churchName']
    });

    // Event cancellation templates
    this.templates.set('event_cancellation_email', {
      type: 'cancellation',
      channel: 'email',
      subject: 'Event Cancelled: {{eventTitle}}',
      content: `
        <h2>Event Cancellation Notice</h2>
        <p>Dear {{attendeeName}},</p>
        <p>We regret to inform you that <strong>{{eventTitle}}</strong> scheduled for {{eventDate}} has been cancelled.</p>
        
        <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Reason:</h3>
          <p>{{cancellationReason}}</p>
        </div>
        
        {{#if refundInfo}}
        <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Refund Information:</h3>
          <p>{{refundInfo}}</p>
        </div>
        {{/if}}
        
        {{#if rescheduledInfo}}
        <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Rescheduled Date:</h3>
          <p>{{rescheduledInfo}}</p>
        </div>
        {{/if}}
        
        <p>We sincerely apologize for any inconvenience this may cause.</p>
        <p>Blessings,<br>{{churchName}} Team</p>
      `,
      variables: ['attendeeName', 'eventTitle', 'eventDate', 'cancellationReason', 'refundInfo', 'rescheduledInfo', 'churchName']
    });

    // Thank you and feedback templates
    this.templates.set('post_event_thanks_email', {
      type: 'thank_you',
      channel: 'email',
      subject: 'Thank you for joining us at {{eventTitle}}!',
      content: `
        <h2>Thank You! 🙏</h2>
        <p>Dear {{attendeeName}},</p>
        <p>Thank you for being part of <strong>{{eventTitle}}</strong>! Your presence made the event special.</p>
        
        {{#if eventHighlights}}
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Event Highlights:</h3>
          <p>{{eventHighlights}}</p>
        </div>
        {{/if}}
        
        <div style="text-align: center; margin: 20px 0;">
          <h3>We'd Love Your Feedback!</h3>
          <p>Help us make our events even better by sharing your thoughts.</p>
          <a href="{{feedbackUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Share Feedback
          </a>
        </div>
        
        {{#if upcomingEvents}}
        <div style="background: #e7f3ff; border: 1px solid #b3d7ff; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Upcoming Events You Might Enjoy:</h3>
          {{upcomingEvents}}
        </div>
        {{/if}}
        
        <p>Blessings,<br>{{churchName}} Team</p>
      `,
      variables: ['attendeeName', 'eventTitle', 'eventHighlights', 'feedbackUrl', 'upcomingEvents', 'churchName']
    });

    // Volunteer-specific templates
    this.templates.set('volunteer_confirmation_email', {
      type: 'announcement',
      channel: 'email',
      subject: 'Volunteer Confirmed: {{eventTitle}}',
      content: `
        <h2>Volunteer Confirmation</h2>
        <p>Dear {{volunteerName}},</p>
        <p>Thank you for volunteering for <strong>{{eventTitle}}</strong>! Your service is greatly appreciated.</p>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Volunteer Details:</h3>
          <p><strong>Role:</strong> {{volunteerRole}}</p>
          <p><strong>Event Date:</strong> {{eventDate}}</p>
          <p><strong>Arrival Time:</strong> {{arrivalTime}}</p>
          <p><strong>Location:</strong> {{eventLocation}}</p>
          {{#if volunteerRequirements}}<p><strong>Requirements:</strong> {{volunteerRequirements}}</p>{{/if}}
        </div>
        
        {{#if contactInfo}}
        <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Contact Information:</h3>
          <p>{{contactInfo}}</p>
        </div>
        {{/if}}
        
        <p>Thank you for your heart to serve!</p>
        <p>Blessings,<br>{{churchName}} Team</p>
      `,
      variables: ['volunteerName', 'eventTitle', 'volunteerRole', 'eventDate', 'arrivalTime', 'eventLocation', 'volunteerRequirements', 'contactInfo', 'churchName']
    });
  }

  // Send email communication
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      if (!config.email.sendgrid.apiKey) {
        console.log('Email sending disabled - no SendGrid API key');
        return false;
      }

      // Here you would integrate with SendGrid or your email service
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(config.email.sendgrid.apiKey);
      // await sgMail.send(emailData);

      console.log(`Email sent to ${emailData.to}: ${emailData.subject}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Send SMS communication
  async sendSMS(smsData: SMSData): Promise<boolean> {
    try {
      if (!config.sms.twilio.accountSid || !config.sms.twilio.authToken) {
        console.log('SMS sending disabled - no Twilio credentials');
        return false;
      }

      // Here you would integrate with Twilio
      // const twilio = require('twilio');
      // const client = twilio(config.sms.twilio.accountSid, config.sms.twilio.authToken);
      // await client.messages.create(smsData);

      console.log(`SMS sent to ${smsData.to}: ${smsData.body}`);
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  // Send push notification
  async sendPushNotification(notificationData: NotificationData): Promise<boolean> {
    try {
      // Here you would integrate with Firebase Cloud Messaging or similar
      console.log(`Push notification sent to user ${notificationData.userId}: ${notificationData.title}`);
      return true;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return false;
    }
  }

  // Get communication template
  getTemplate(templateKey: string): CommunicationTemplate | undefined {
    return this.templates.get(templateKey);
  }

  // Render template with variables
  renderTemplate(templateKey: string, variables: Record<string, any>): { subject: string; content: string } | null {
    const template = this.getTemplate(templateKey);
    if (!template) return null;

    let subject = template.subject;
    let content = template.content;

    // Simple template rendering (in production, use a proper template engine like Handlebars)
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, String(value || ''));
      content = content.replace(regex, String(value || ''));
    });

    // Handle conditional blocks (basic implementation)
    content = this.handleConditionals(content, variables);

    return { subject, content };
  }

  // Basic conditional handling for templates
  private handleConditionals(content: string, variables: Record<string, any>): string {
    // Handle {{#if variable}} blocks
    const ifRegex = /{{#if (\w+)}}([\s\S]*?){{\/if}}/g;
    content = content.replace(ifRegex, (match, varName, blockContent) => {
      return variables[varName] ? blockContent : '';
    });

    return content;
  }

  // Send communication based on type
  async sendEventCommunication(
    communication: EventCommunication,
    recipients: Array<{ email?: string; phone?: string; userId?: string; name?: string }>,
    variables: Record<string, any>
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      try {
        const recipientVariables = {
          ...variables,
          attendeeName: recipient.name || 'Friend',
        };

        const rendered = this.renderTemplate(
          `${communication.communication_type}_${communication.channel}`,
          recipientVariables
        );

        if (!rendered) {
          console.error(`Template not found: ${communication.communication_type}_${communication.channel}`);
          failed++;
          continue;
        }

        let success = false;

        switch (communication.channel) {
          case 'email':
            if (recipient.email) {
              success = await this.sendEmail({
                to: recipient.email,
                from: config.email.from.email,
                subject: rendered.subject,
                html: rendered.content,
              });
            }
            break;
          case 'sms':
            if (recipient.phone) {
              success = await this.sendSMS({
                to: recipient.phone,
                from: config.sms.twilio.phoneNumber || '',
                body: rendered.content,
              });
            }
            break;
          case 'push_notification':
            if (recipient.userId) {
              success = await this.sendPushNotification({
                userId: recipient.userId,
                title: rendered.subject,
                body: rendered.content,
              });
            }
            break;
        }

        if (success) {
          sent++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Failed to send communication to recipient:`, error);
        failed++;
      }
    }

    return { sent, failed };
  }

  // Schedule communication (this would integrate with a job queue)
  async scheduleCommunication(
    communication: EventCommunication,
    recipients: Array<{ email?: string; phone?: string; userId?: string; name?: string }>,
    variables: Record<string, any>,
    scheduledTime: Date
  ): Promise<string> {
    // In a real implementation, this would add the communication to a job queue
    const jobId = `comm_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    console.log(`Communication scheduled for ${scheduledTime.toISOString()}`);
    console.log(`Job ID: ${jobId}`);
    console.log(`Recipients: ${recipients.length}`);
    
    return jobId;
  }
}