// Visit Email Service - Handles all visit-related email communications
import nodemailer from 'nodemailer';
import { format, addDays } from 'date-fns';

interface EmailConfig {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  from: {
    name: string;
    email: string;
  };
}

interface VisitData {
  id: string;
  visitor_name: string;
  visitor_email: string;
  planned_date: string;
  party_size: number;
  adults_count: number;
  children_count: number;
  service_times: {
    name: string;
    start_time: string;
    end_time: string;
    location: string;
    special_notes?: string;
  };
  confirmation_token?: string;
  special_needs?: string;
  wheelchair_accessible?: boolean;
  parking_assistance?: boolean;
  childcare_needed?: boolean;
}

interface ChurchInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

export class VisitEmailService {
  private transporter: nodemailer.Transporter;
  private emailConfig: EmailConfig;
  private churchInfo: ChurchInfo;

  constructor(emailConfig: EmailConfig, churchInfo: ChurchInfo) {
    this.emailConfig = emailConfig;
    this.churchInfo = churchInfo;
    
    this.transporter = nodemailer.createTransporter({
      host: emailConfig.smtp.host,
      port: emailConfig.smtp.port,
      secure: emailConfig.smtp.secure,
      auth: emailConfig.smtp.auth,
    });
  }

  // Send initial visit confirmation email
  async sendVisitConfirmation(visit: VisitData): Promise<boolean> {
    try {
      const confirmationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/visits/confirm/${visit.confirmation_token}`;
      const calendarUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/visits/${visit.id}/calendar`;
      
      const htmlContent = this.generateConfirmationEmailHTML(visit, confirmationUrl, calendarUrl);
      const textContent = this.generateConfirmationEmailText(visit, confirmationUrl);

      const mailOptions = {
        from: `${this.emailConfig.from.name} <${this.emailConfig.from.email}>`,
        to: visit.visitor_email,
        subject: `Visit Confirmation - ${this.churchInfo.name}`,
        html: htmlContent,
        text: textContent,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending visit confirmation email:', error);
      return false;
    }
  }

  // Send visit reminder email
  async sendVisitReminder(visit: VisitData, daysUntilVisit: number): Promise<boolean> {
    try {
      const htmlContent = this.generateReminderEmailHTML(visit, daysUntilVisit);
      const textContent = this.generateReminderEmailText(visit, daysUntilVisit);

      let subject: string;
      if (daysUntilVisit === 0) {
        subject = `Today's Visit - ${this.churchInfo.name}`;
      } else if (daysUntilVisit === 1) {
        subject = `Tomorrow's Visit - ${this.churchInfo.name}`;
      } else {
        subject = `Visit Reminder - ${daysUntilVisit} Days to Go!`;
      }

      const mailOptions = {
        from: `${this.emailConfig.from.name} <${this.emailConfig.from.email}>`,
        to: visit.visitor_email,
        subject,
        html: htmlContent,
        text: textContent,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending visit reminder email:', error);
      return false;
    }
  }

  // Send follow-up email after visit
  async sendPostVisitFollowUp(visit: VisitData, attended: boolean): Promise<boolean> {
    try {
      const htmlContent = attended 
        ? this.generateThankYouEmailHTML(visit)
        : this.generateMissedVisitEmailHTML(visit);
      
      const textContent = attended
        ? this.generateThankYouEmailText(visit)
        : this.generateMissedVisitEmailText(visit);

      const subject = attended
        ? `Thank You for Visiting ${this.churchInfo.name}!`
        : `We Missed You at ${this.churchInfo.name}`;

      const mailOptions = {
        from: `${this.emailConfig.from.name} <${this.emailConfig.from.email}>`,
        to: visit.visitor_email,
        subject,
        html: htmlContent,
        text: textContent,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending follow-up email:', error);
      return false;
    }
  }

  // Generate confirmation email HTML
  private generateConfirmationEmailHTML(visit: VisitData, confirmationUrl: string, calendarUrl: string): string {
    const visitDate = format(new Date(visit.planned_date), 'EEEE, MMMM d, yyyy');
    const accommodations = this.getAccommodationsList(visit);

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Visit Confirmation - ${this.churchInfo.name}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #ffffff; }
            .visit-details { background: #F8FAFC; border-left: 4px solid #3B82F6; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .button:hover { background: #1E40AF; }
            .footer { background: #F1F5F9; padding: 20px; text-align: center; font-size: 14px; color: #64748B; }
            .accommodations { background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 6px; padding: 15px; margin: 15px 0; }
            .contact-info { text-align: center; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Welcome to ${this.churchInfo.name}!</h1>
            <p>Your visit has been planned successfully</p>
        </div>

        <div class="content">
            <p>Dear ${visit.visitor_name},</p>
            
            <p>Thank you for planning to visit ${this.churchInfo.name}! We're excited to meet you and welcome you to our church family.</p>

            <div class="visit-details">
                <h3>📅 Your Visit Details</h3>
                <p><strong>Service:</strong> ${visit.service_times.name}</p>
                <p><strong>Date:</strong> ${visitDate}</p>
                <p><strong>Time:</strong> ${visit.service_times.start_time} - ${visit.service_times.end_time}</p>
                <p><strong>Location:</strong> ${visit.service_times.location}</p>
                <p><strong>Party Size:</strong> ${visit.party_size} people (${visit.adults_count} adults, ${visit.children_count} children)</p>
                
                ${visit.service_times.special_notes ? `
                <div style="background: #EBF8FF; padding: 15px; border-radius: 6px; margin-top: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #1E40AF;">Service Notes:</h4>
                    <p style="margin: 0;">${visit.service_times.special_notes}</p>
                </div>
                ` : ''}
                
                ${accommodations.length > 0 ? `
                <div class="accommodations">
                    <h4 style="margin: 0 0 10px 0; color: #92400E;">Special Accommodations:</h4>
                    <ul style="margin: 0;">
                        ${accommodations.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationUrl}" class="button" style="background: #059669; margin-right: 10px;">
                    ✅ Confirm My Visit
                </a>
                <a href="${calendarUrl}" class="button">
                    📅 Add to Calendar
                </a>
            </div>

            <h3>🏛️ What to Expect</h3>
            <ul>
                <li><strong>Arrive 15-20 minutes early</strong> to find parking and get oriented</li>
                <li><strong>Look for our welcome team</strong> in bright shirts who will greet you</li>
                <li><strong>Dress comfortably</strong> - we welcome people as they are</li>
                <li><strong>Children are welcome</strong> - we have programs for all ages</li>
            </ul>

            <h3>📍 Directions & Parking</h3>
            <p>We're located at:</p>
            <p style="background: #F8FAFC; padding: 15px; border-radius: 6px;">
                <strong>${this.churchInfo.address}</strong><br>
                Free parking is available in our main lot and street parking nearby.
            </p>

            <div class="contact-info">
                <h3>Questions Before Your Visit?</h3>
                <p>We're here to help! Contact us at:</p>
                <p>📞 <a href="tel:${this.churchInfo.phone}">${this.churchInfo.phone}</a></p>
                <p>📧 <a href="mailto:${this.churchInfo.email}">${this.churchInfo.email}</a></p>
                <p>🌐 <a href="${this.churchInfo.website}">${this.churchInfo.website}</a></p>
            </div>

            <p>We can't wait to meet you and share this special time together!</p>
            
            <p>Blessings,<br>The ${this.churchInfo.name} Team</p>
        </div>

        <div class="footer">
            <p>&copy; 2024 ${this.churchInfo.name}. All rights reserved.</p>
            <p>${this.churchInfo.address}</p>
        </div>
    </body>
    </html>
    `;
  }

  // Generate confirmation email text version
  private generateConfirmationEmailText(visit: VisitData, confirmationUrl: string): string {
    const visitDate = format(new Date(visit.planned_date), 'EEEE, MMMM d, yyyy');
    const accommodations = this.getAccommodationsList(visit);

    return `
Welcome to ${this.churchInfo.name}!

Dear ${visit.visitor_name},

Thank you for planning to visit ${this.churchInfo.name}! We're excited to meet you and welcome you to our church family.

YOUR VISIT DETAILS:
- Service: ${visit.service_times.name}
- Date: ${visitDate}
- Time: ${visit.service_times.start_time} - ${visit.service_times.end_time}
- Location: ${visit.service_times.location}
- Party Size: ${visit.party_size} people (${visit.adults_count} adults, ${visit.children_count} children)

${visit.service_times.special_notes ? `
SERVICE NOTES:
${visit.service_times.special_notes}
` : ''}

${accommodations.length > 0 ? `
SPECIAL ACCOMMODATIONS:
${accommodations.map(item => `- ${item}`).join('\n')}
` : ''}

PLEASE CONFIRM YOUR VISIT:
${confirmationUrl}

WHAT TO EXPECT:
- Arrive 15-20 minutes early to find parking and get oriented
- Look for our welcome team in bright shirts who will greet you
- Dress comfortably - we welcome people as they are
- Children are welcome - we have programs for all ages

LOCATION:
${this.churchInfo.address}
Free parking is available in our main lot and street parking nearby.

QUESTIONS?
Phone: ${this.churchInfo.phone}
Email: ${this.churchInfo.email}
Website: ${this.churchInfo.website}

We can't wait to meet you and share this special time together!

Blessings,
The ${this.churchInfo.name} Team

---
© 2024 ${this.churchInfo.name}
${this.churchInfo.address}
    `;
  }

  // Generate reminder email HTML
  private generateReminderEmailHTML(visit: VisitData, daysUntilVisit: number): string {
    const visitDate = format(new Date(visit.planned_date), 'EEEE, MMMM d, yyyy');
    let reminderMessage = '';
    let urgencyColor = '#3B82F6';

    if (daysUntilVisit === 0) {
      reminderMessage = "Your visit is TODAY!";
      urgencyColor = '#DC2626';
    } else if (daysUntilVisit === 1) {
      reminderMessage = "Your visit is TOMORROW!";
      urgencyColor = '#EA580C';
    } else {
      reminderMessage = `Your visit is in ${daysUntilVisit} days`;
      urgencyColor = '#3B82F6';
    }

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Visit Reminder - ${this.churchInfo.name}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background: ${urgencyColor}; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #ffffff; }
            .reminder-box { background: #FEF3C7; border: 2px solid ${urgencyColor}; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .visit-details { background: #F8FAFC; border-left: 4px solid #3B82F6; padding: 20px; margin: 20px 0; }
            .footer { background: #F1F5F9; padding: 20px; text-align: center; font-size: 14px; color: #64748B; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Visit Reminder</h1>
            <h2>${reminderMessage}</h2>
        </div>

        <div class="content">
            <p>Hi ${visit.visitor_name},</p>

            <div class="reminder-box">
                <h3 style="color: ${urgencyColor}; margin: 0 0 15px 0;">${reminderMessage}</h3>
                <p style="font-size: 18px; margin: 0;">${visitDate} at ${visit.service_times.start_time}</p>
            </div>

            ${daysUntilVisit === 0 ? `
            <p><strong>We're excited to see you today!</strong> Here's everything you need to know for your visit:</p>
            ` : `
            <p>We're looking forward to welcoming you to ${this.churchInfo.name}! Here's a reminder of your visit details:</p>
            `}

            <div class="visit-details">
                <h3>📅 Visit Details</h3>
                <p><strong>Service:</strong> ${visit.service_times.name}</p>
                <p><strong>Date:</strong> ${visitDate}</p>
                <p><strong>Time:</strong> ${visit.service_times.start_time} - ${visit.service_times.end_time}</p>
                <p><strong>Location:</strong> ${visit.service_times.location}</p>
                <p><strong>Address:</strong> ${this.churchInfo.address}</p>
            </div>

            ${daysUntilVisit <= 1 ? `
            <h3>🚗 Getting Here ${daysUntilVisit === 0 ? 'Today' : 'Tomorrow'}</h3>
            <ul>
                <li><strong>Plan to arrive 15-20 minutes early</strong> for parking and orientation</li>
                <li><strong>Free parking</strong> available in our main lot and nearby streets</li>
                <li><strong>Look for our welcome team</strong> in bright shirts at the entrance</li>
                <li><strong>Bring this email</strong> or have your confirmation ready</li>
            </ul>
            ` : ''}

            <h3>❓ Need Help?</h3>
            <p>If you have any questions or need to make changes to your visit:</p>
            <p>📞 Call us at <a href="tel:${this.churchInfo.phone}">${this.churchInfo.phone}</a></p>
            <p>📧 Email us at <a href="mailto:${this.churchInfo.email}">${this.churchInfo.email}</a></p>

            <p>We can't wait to meet you!</p>
            
            <p>Blessings,<br>The ${this.churchInfo.name} Team</p>
        </div>

        <div class="footer">
            <p>&copy; 2024 ${this.churchInfo.name}. All rights reserved.</p>
        </div>
    </body>
    </html>
    `;
  }

  // Generate reminder email text version
  private generateReminderEmailText(visit: VisitData, daysUntilVisit: number): string {
    const visitDate = format(new Date(visit.planned_date), 'EEEE, MMMM d, yyyy');
    let reminderMessage = '';

    if (daysUntilVisit === 0) {
      reminderMessage = "Your visit is TODAY!";
    } else if (daysUntilVisit === 1) {
      reminderMessage = "Your visit is TOMORROW!";
    } else {
      reminderMessage = `Your visit is in ${daysUntilVisit} days`;
    }

    return `
VISIT REMINDER - ${this.churchInfo.name}

Hi ${visit.visitor_name},

${reminderMessage}
${visitDate} at ${visit.service_times.start_time}

VISIT DETAILS:
- Service: ${visit.service_times.name}
- Date: ${visitDate}
- Time: ${visit.service_times.start_time} - ${visit.service_times.end_time}
- Location: ${visit.service_times.location}
- Address: ${this.churchInfo.address}

${daysUntilVisit <= 1 ? `
GETTING HERE ${daysUntilVisit === 0 ? 'TODAY' : 'TOMORROW'}:
- Plan to arrive 15-20 minutes early for parking and orientation
- Free parking available in our main lot and nearby streets
- Look for our welcome team in bright shirts at the entrance
- Bring this email or have your confirmation ready
` : ''}

NEED HELP?
Phone: ${this.churchInfo.phone}
Email: ${this.churchInfo.email}

We can't wait to meet you!

Blessings,
The ${this.churchInfo.name} Team

---
© 2024 ${this.churchInfo.name}
    `;
  }

  // Generate thank you email HTML (for attended visits)
  private generateThankYouEmailHTML(visit: VisitData): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You for Visiting - ${this.churchInfo.name}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #ffffff; }
            .highlight-box { background: #D1FAE5; border: 1px solid #059669; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .footer { background: #F1F5F9; padding: 20px; text-align: center; font-size: 14px; color: #64748B; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Thank You for Visiting!</h1>
            <p>It was wonderful to meet you</p>
        </div>

        <div class="content">
            <p>Dear ${visit.visitor_name},</p>

            <p>Thank you so much for visiting ${this.churchInfo.name}! It was truly a joy to meet you and have you worship with us. We hope you felt welcomed and that the service was meaningful to you.</p>

            <div class="highlight-box">
                <h3 style="color: #047857; margin: 0 0 15px 0;">🎉 What's Next?</h3>
                <p style="margin: 0;">We'd love to help you take the next step in your journey with us. Here are some ways to get more connected:</p>
            </div>

            <h3>🤝 Get Connected</h3>
            <ul>
                <li><strong>Join us again next week</strong> - Same time, same place!</li>
                <li><strong>Connect with our Pastor</strong> - Schedule a coffee chat</li>
                <li><strong>Explore our ministries</strong> - Find your place to serve and grow</li>
                <li><strong>Join a small group</strong> - Build meaningful relationships</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${this.churchInfo.website}/connect" class="button">
                    🔗 Connect With Us
                </a>
                <a href="${this.churchInfo.website}/ministries" class="button">
                    🎯 Explore Ministries
                </a>
            </div>

            <h3>📅 Upcoming Events</h3>
            <p>Stay tuned for information about upcoming events and opportunities to get involved in our church community.</p>

            <h3>💬 We'd Love Your Feedback</h3>
            <p>Your experience matters to us! We'd appreciate any feedback about your visit to help us serve future visitors better.</p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${this.churchInfo.website}/feedback" class="button" style="background: #3B82F6;">
                    💭 Share Your Feedback
                </a>
            </div>

            <p>Thank you again for visiting us. We're praying for you and hope to see you again soon!</p>

            <p>With gratitude and blessings,<br>The ${this.churchInfo.name} Team</p>

            <div style="background: #F8FAFC; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
                <p><strong>Questions or want to connect?</strong></p>
                <p>📞 <a href="tel:${this.churchInfo.phone}">${this.churchInfo.phone}</a></p>
                <p>📧 <a href="mailto:${this.churchInfo.email}">${this.churchInfo.email}</a></p>
            </div>
        </div>

        <div class="footer">
            <p>&copy; 2024 ${this.churchInfo.name}. All rights reserved.</p>
        </div>
    </body>
    </html>
    `;
  }

  // Generate thank you email text version
  private generateThankYouEmailText(visit: VisitData): string {
    return `
Thank You for Visiting ${this.churchInfo.name}!

Dear ${visit.visitor_name},

Thank you so much for visiting ${this.churchInfo.name}! It was truly a joy to meet you and have you worship with us. We hope you felt welcomed and that the service was meaningful to you.

WHAT'S NEXT?
We'd love to help you take the next step in your journey with us. Here are some ways to get more connected:

GET CONNECTED:
- Join us again next week - Same time, same place!
- Connect with our Pastor - Schedule a coffee chat
- Explore our ministries - Find your place to serve and grow
- Join a small group - Build meaningful relationships

UPCOMING EVENTS:
Stay tuned for information about upcoming events and opportunities to get involved in our church community.

WE'D LOVE YOUR FEEDBACK:
Your experience matters to us! We'd appreciate any feedback about your visit to help us serve future visitors better.

Visit: ${this.churchInfo.website}/feedback

Thank you again for visiting us. We're praying for you and hope to see you again soon!

With gratitude and blessings,
The ${this.churchInfo.name} Team

Questions or want to connect?
Phone: ${this.churchInfo.phone}
Email: ${this.churchInfo.email}
Website: ${this.churchInfo.website}

---
© 2024 ${this.churchInfo.name}
    `;
  }

  // Generate missed visit email HTML (for no-shows)
  private generateMissedVisitEmailHTML(visit: VisitData): string {
    const newVisitUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/visit-planning`;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>We Missed You - ${this.churchInfo.name}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #ffffff; }
            .highlight-box { background: #EDE9FE; border: 1px solid #7C3AED; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; background: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .footer { background: #F1F5F9; padding: 20px; text-align: center; font-size: 14px; color: #64748B; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>We Missed You!</h1>
            <p>Our door is always open</p>
        </div>

        <div class="content">
            <p>Dear ${visit.visitor_name},</p>

            <p>We noticed that you weren't able to make it to your planned visit to ${this.churchInfo.name} on ${format(new Date(visit.planned_date), 'EEEE, MMMM d')}. We completely understand that life happens and plans sometimes change!</p>

            <div class="highlight-box">
                <h3 style="color: #5B21B6; margin: 0 0 15px 0;">💜 You're Always Welcome</h3>
                <p style="margin: 0;">Our doors are always open, and we'd love to have you visit us anytime. No appointment necessary!</p>
            </div>

            <h3>🗓️ Plan Another Visit</h3>
            <p>If you'd like to plan another visit, we make it easy:</p>
            <ul>
                <li><strong>Choose any service time</strong> that works for your schedule</li>
                <li><strong>No pressure</strong> - just come as you are</li>
                <li><strong>Bring family and friends</strong> - everyone is welcome</li>
                <li><strong>Ask questions</strong> - our team is here to help</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${newVisitUrl}" class="button">
                    📅 Plan Another Visit
                </a>
            </div>

            <h3>⏰ Our Service Times</h3>
            <p>You can join us any week at these times:</p>
            <ul>
                <li>Sunday Morning: 9:00 AM & 11:00 AM</li>
                <li>Wednesday Evening: 7:00 PM (Bible Study)</li>
            </ul>

            <h3>💙 We're Here for You</h3>
            <p>Whether you have questions about faith, need prayer, or just want to talk, we're here. Our community is built on love, acceptance, and genuine care for one another.</p>

            <div style="background: #F8FAFC; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
                <p><strong>Need to talk or have questions?</strong></p>
                <p>📞 <a href="tel:${this.churchInfo.phone}">${this.churchInfo.phone}</a></p>
                <p>📧 <a href="mailto:${this.churchInfo.email}">${this.churchInfo.email}</a></p>
                <p>🌐 <a href="${this.churchInfo.website}">${this.churchInfo.website}</a></p>
            </div>

            <p>We hope to see you soon, but know that you're in our thoughts and prayers regardless.</p>

            <p>Blessings and grace,<br>The ${this.churchInfo.name} Team</p>
        </div>

        <div class="footer">
            <p>&copy; 2024 ${this.churchInfo.name}. All rights reserved.</p>
        </div>
    </body>
    </html>
    `;
  }

  // Generate missed visit email text version
  private generateMissedVisitEmailText(visit: VisitData): string {
    const newVisitUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/visit-planning`;

    return `
We Missed You at ${this.churchInfo.name}!

Dear ${visit.visitor_name},

We noticed that you weren't able to make it to your planned visit to ${this.churchInfo.name} on ${format(new Date(visit.planned_date), 'EEEE, MMMM d')}. We completely understand that life happens and plans sometimes change!

YOU'RE ALWAYS WELCOME
Our doors are always open, and we'd love to have you visit us anytime. No appointment necessary!

PLAN ANOTHER VISIT
If you'd like to plan another visit, we make it easy:
- Choose any service time that works for your schedule
- No pressure - just come as you are
- Bring family and friends - everyone is welcome
- Ask questions - our team is here to help

Plan another visit: ${newVisitUrl}

OUR SERVICE TIMES:
- Sunday Morning: 9:00 AM & 11:00 AM
- Wednesday Evening: 7:00 PM (Bible Study)

WE'RE HERE FOR YOU
Whether you have questions about faith, need prayer, or just want to talk, we're here. Our community is built on love, acceptance, and genuine care for one another.

CONTACT US:
Phone: ${this.churchInfo.phone}
Email: ${this.churchInfo.email}
Website: ${this.churchInfo.website}

We hope to see you soon, but know that you're in our thoughts and prayers regardless.

Blessings and grace,
The ${this.churchInfo.name} Team

---
© 2024 ${this.churchInfo.name}
    `;
  }

  // Helper method to get accommodations list
  private getAccommodationsList(visit: VisitData): string[] {
    const accommodations: string[] = [];
    
    if (visit.wheelchair_accessible) {
      accommodations.push('Wheelchair accessible seating');
    }
    
    if (visit.parking_assistance) {
      accommodations.push('Parking assistance');
    }
    
    if (visit.childcare_needed) {
      accommodations.push('Childcare during service');
    }
    
    if (visit.special_needs) {
      accommodations.push(`Special request: ${visit.special_needs}`);
    }
    
    return accommodations;
  }

  // Test email configuration
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email configuration test failed:', error);
      return false;
    }
  }
}

export default VisitEmailService;