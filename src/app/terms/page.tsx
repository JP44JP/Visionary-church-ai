import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | VisionaryChurch.ai',
  description: 'Terms and conditions for using VisionaryChurch.ai services and platform.',
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-8 sm:px-10 sm:py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-sm text-gray-500 mb-8">
                <strong>Last Updated:</strong> August 10, 2025
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
                <p>
                  These Terms of Service ("Terms") constitute a legally binding agreement between you and VisionaryChurch.ai, Inc. 
                  ("VisionaryChurch.ai," "we," "us," or "our") governing your use of our AI-powered visitor management platform 
                  and related services (collectively, the "Services").
                </p>
                <p>
                  By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy. If you do not 
                  agree to these Terms, you may not access or use our Services.
                </p>
                <p>
                  These Terms are specifically designed for churches, religious organizations, and spiritual communities 
                  ("Churches") and their members, visitors, and staff ("Users").
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Services</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">2.1 Platform Features</h3>
                <p>VisionaryChurch.ai provides a comprehensive visitor management platform that includes:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Visitor Tracking:</strong> Registration, check-in/check-out, and interaction history</li>
                  <li><strong>Prayer Request Management:</strong> Secure collection, categorization, and response coordination</li>
                  <li><strong>AI-Powered Chat:</strong> Automated responses for common inquiries and spiritual guidance</li>
                  <li><strong>Communication Tools:</strong> Email and SMS automation, follow-up sequences</li>
                  <li><strong>Event Management:</strong> Registration, attendance tracking, and post-event analytics</li>
                  <li><strong>Analytics Dashboard:</strong> Insights into visitor engagement and church growth metrics</li>
                  <li><strong>Multi-Tenant Architecture:</strong> Separate, secure environments for each church organization</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">2.2 Service Availability</h3>
                <p>
                  We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. Scheduled maintenance will be 
                  announced in advance when possible. We reserve the right to modify, suspend, or discontinue any feature of 
                  our Services with reasonable notice.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">3.1 Account Creation</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>You must provide accurate, complete, and current information when registering</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                  <li>You must be at least 18 years old to create an account as a church administrator</li>
                  <li>Each church organization must have authorized personnel create and manage accounts</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">3.2 Account Security</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>You are responsible for all activities that occur under your account</li>
                  <li>You must immediately notify us of any unauthorized use of your account</li>
                  <li>We recommend using strong passwords and enabling multi-factor authentication</li>
                  <li>You must not share your account credentials with unauthorized persons</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">3.3 Account Types and Roles</h3>
                <ul className="list-disc pl-6">
                  <li><strong>Church Administrator:</strong> Full access to church's data and settings</li>
                  <li><strong>Staff Member:</strong> Limited access based on assigned roles and permissions</li>
                  <li><strong>Volunteer:</strong> Basic access to assigned functions and data</li>
                  <li><strong>Visitor:</strong> Self-service access to personal information and preferences</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use Policy</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.1 Permitted Uses</h3>
                <p>You may use our Services for:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Legitimate church operations and visitor management</li>
                  <li>Spiritual care and pastoral communication</li>
                  <li>Event planning and community outreach</li>
                  <li>Prayer request coordination and response</li>
                  <li>Analytics and reporting for church growth and ministry effectiveness</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.2 Prohibited Uses</h3>
                <p>You may not use our Services to:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights of others</li>
                  <li>Transmit harmful, offensive, or inappropriate content</li>
                  <li>Spam or send unsolicited commercial communications</li>
                  <li>Attempt to gain unauthorized access to our systems or other users' data</li>
                  <li>Use the platform for non-religious commercial purposes</li>
                  <li>Share or sell access to other organizations without authorization</li>
                  <li>Discriminate against individuals based on protected characteristics</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.3 Religious Freedom and Expression</h3>
                <p>
                  We respect the diverse theological perspectives and practices of different denominations and faith traditions. 
                  Churches are free to use our platform in accordance with their religious beliefs and practices, provided such 
                  use complies with applicable laws and does not harm others.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Subscription Plans and Billing</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">5.1 Subscription Tiers</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Starter Plan:</strong> Basic visitor management for small churches (up to 100 visitors)</li>
                  <li><strong>Growth Plan:</strong> Enhanced features for growing congregations (up to 500 visitors)</li>
                  <li><strong>Ministry Plan:</strong> Advanced tools for established churches (up to 2,000 visitors)</li>
                  <li><strong>Enterprise Plan:</strong> Custom solutions for large organizations (unlimited visitors)</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">5.2 Billing Terms</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Subscriptions are billed monthly or annually in advance</li>
                  <li>Annual subscriptions receive a discount compared to monthly billing</li>
                  <li>All fees are in U.S. Dollars unless otherwise specified</li>
                  <li>Payment processing is handled by Stripe, our PCI-compliant payment processor</li>
                  <li>Churches are responsible for applicable taxes in their jurisdiction</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">5.3 Free Trial and Non-Profit Discounts</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>New customers receive a 30-day free trial of all features</li>
                  <li>Qualified 501(c)(3) religious organizations receive a 20% discount</li>
                  <li>Special pricing available for churches in developing countries</li>
                  <li>Volume discounts for church networks and denominations</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">5.4 Cancellation and Refunds</h3>
                <ul className="list-disc pl-6">
                  <li>You may cancel your subscription at any time from your account settings</li>
                  <li>Cancellation takes effect at the end of your current billing period</li>
                  <li>No refunds for partial months or unused features</li>
                  <li>Data export tools available for 30 days after cancellation</li>
                  <li>Account data is permanently deleted 90 days after cancellation</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Ownership and Privacy</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.1 Church Data Ownership</h3>
                <p>
                  Churches retain full ownership of their data, including visitor information, prayer requests, communication 
                  records, and analytics. We act as a data processor under applicable privacy laws.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.2 Pastoral Privilege and Confidentiality</h3>
                <p>
                  We recognize the sacred nature of pastoral communications and implement special protections:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Enhanced encryption for prayer requests and spiritual counseling records</li>
                  <li>Restricted access controls for sensitive spiritual communications</li>
                  <li>Compliance with pastoral privilege and confession confidentiality requirements</li>
                  <li>Training for our staff on handling religious communications</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.3 Data Processing Agreement</h3>
                <p>
                  Our Data Processing Agreement (DPA) is incorporated by reference and governs how we handle personal data on 
                  behalf of churches. This includes GDPR compliance measures and security safeguards.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property Rights</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">7.1 Our Intellectual Property</h3>
                <p>
                  The Services, including all software, designs, text, graphics, and other content, are owned by 
                  VisionaryChurch.ai and protected by intellectual property laws. You receive a limited, non-exclusive, 
                  non-transferable license to use our Services.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">7.2 User Content</h3>
                <p>
                  Churches retain ownership of all content they upload, including sermons, materials, and communications. 
                  By using our Services, you grant us a limited license to process and store this content as necessary 
                  to provide our Services.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">7.3 AI-Generated Content</h3>
                <p>
                  Content generated by our AI features is provided "as is" for informational purposes. Churches should 
                  review and approve all AI-generated responses before sharing with congregants. We make no warranties 
                  about the theological accuracy of AI-generated content.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Service Level Agreement (SLA)</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">8.1 Uptime Commitment</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Starter/Growth Plans:</strong> 99.5% monthly uptime</li>
                  <li><strong>Ministry Plan:</strong> 99.9% monthly uptime</li>
                  <li><strong>Enterprise Plan:</strong> 99.95% monthly uptime with dedicated support</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">8.2 Support Response Times</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Critical Issues:</strong> 4 hours for Ministry/Enterprise, 24 hours for others</li>
                  <li><strong>High Priority:</strong> 24 hours for Ministry/Enterprise, 48 hours for others</li>
                  <li><strong>General Support:</strong> 48 hours for all plans</li>
                  <li><strong>Enhancement Requests:</strong> 5 business days response</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">8.3 SLA Credits</h3>
                <p>
                  If we fail to meet our uptime commitments, eligible customers may receive service credits as outlined 
                  in our SLA documentation.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Third-Party Integrations</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">9.1 Authorized Integrations</h3>
                <p>Our platform integrates with various third-party services:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Communication:</strong> SendGrid (email), Twilio (SMS), Vonage (phone)</li>
                  <li><strong>AI Services:</strong> OpenAI for chat responses and content processing</li>
                  <li><strong>Payment Processing:</strong> Stripe for subscription and donation processing</li>
                  <li><strong>Authentication:</strong> Google, Facebook OAuth for user sign-in</li>
                  <li><strong>Analytics:</strong> Vercel Analytics for usage insights</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">9.2 Third-Party Terms</h3>
                <p>
                  Your use of integrated third-party services is subject to their respective terms of service and privacy 
                  policies. We encourage you to review these policies to understand how your data is handled.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">9.3 Integration Reliability</h3>
                <p>
                  While we strive to maintain reliable integrations, we cannot guarantee the availability or performance of 
                  third-party services. We will provide reasonable notice of any planned changes to integrations.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Disclaimers and Limitations of Liability</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">10.1 Service Disclaimers</h3>
                <p>
                  OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, 
                  INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND 
                  NON-INFRINGEMENT.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">10.2 AI and Automated Content</h3>
                <p>
                  AI-generated responses and automated content are for informational purposes only and should not be considered 
                  as professional theological, legal, or medical advice. Churches should review all automated responses before 
                  sharing with congregants.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">10.3 Limitation of Liability</h3>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY TO YOU SHALL NOT EXCEED THE AMOUNT PAID BY YOU 
                  FOR THE SERVICES IN THE 12 MONTHS PRECEDING THE CLAIM. WE SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, 
                  SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">10.4 Religious Exemptions</h3>
                <p>
                  Nothing in these Terms shall be construed to limit the religious freedom or autonomy of churches in their 
                  spiritual practices, theological positions, or internal governance, subject to applicable laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Indemnification</h2>
                <p>
                  You agree to indemnify, defend, and hold harmless VisionaryChurch.ai, its officers, directors, employees, 
                  and agents from and against any claims, liabilities, damages, losses, and expenses arising out of or in any 
                  way connected with:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Your use of our Services</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any rights of another person or entity</li>
                  <li>Any content you submit or make available through our Services</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Termination</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">12.1 Termination by You</h3>
                <p>
                  You may terminate your account at any time by canceling your subscription through your account settings 
                  or by contacting our support team.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">12.2 Termination by Us</h3>
                <p>We may terminate or suspend your access to our Services if:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>You violate these Terms or our Acceptable Use Policy</li>
                  <li>Your account remains inactive for more than 12 months</li>
                  <li>You fail to pay fees when due (after 30-day grace period)</li>
                  <li>We are required to do so by law or legal process</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">12.3 Effect of Termination</h3>
                <ul className="list-disc pl-6">
                  <li>Access to Services will cease immediately</li>
                  <li>Data export tools available for 30 days</li>
                  <li>Account data permanently deleted after 90 days</li>
                  <li>Outstanding fees remain due and payable</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Dispute Resolution</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">13.1 Informal Resolution</h3>
                <p>
                  Before initiating formal proceedings, we encourage you to contact our support team to resolve any disputes 
                  informally. We are committed to working with churches to address concerns in a spirit of cooperation and 
                  understanding.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">13.2 Binding Arbitration</h3>
                <p>
                  Any disputes that cannot be resolved informally shall be resolved through binding arbitration in accordance 
                  with the Commercial Arbitration Rules of the American Arbitration Association, taking place in San Francisco, 
                  California.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">13.3 Class Action Waiver</h3>
                <p>
                  You agree to resolve disputes with us only on an individual basis and not to bring class action lawsuits or 
                  participate in class arbitrations.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Governing Law and Jurisdiction</h2>
                <p>
                  These Terms are governed by the laws of the State of California, United States, without regard to conflict 
                  of law principles. Any legal proceedings not subject to arbitration shall be brought exclusively in the state 
                  or federal courts located in San Francisco, California.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Changes to Terms</h2>
                <p>
                  We may modify these Terms from time to time. When we make material changes, we will:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Provide at least 30 days' notice before changes take effect</li>
                  <li>Email notifications to all account administrators</li>
                  <li>Post updates on our website and in your account dashboard</li>
                  <li>Highlight key changes in a summary format</li>
                </ul>
                <p>
                  Your continued use of our Services after changes take effect constitutes acceptance of the new Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Miscellaneous</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">16.1 Entire Agreement</h3>
                <p>
                  These Terms, together with our Privacy Policy and Data Processing Agreement, constitute the entire agreement 
                  between you and VisionaryChurch.ai regarding our Services.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">16.2 Severability</h3>
                <p>
                  If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full 
                  force and effect.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">16.3 Assignment</h3>
                <p>
                  You may not assign or transfer these Terms without our written consent. We may assign these Terms in connection 
                  with a merger, acquisition, or sale of assets.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">16.4 Force Majeure</h3>
                <p>
                  Neither party shall be liable for any failure to perform due to causes beyond their reasonable control, 
                  including natural disasters, government actions, or network failures.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">17. Contact Information</h2>
                <p>
                  For questions about these Terms of Service, please contact us:
                </p>
                
                <div className="bg-gray-50 p-6 rounded-lg mt-4">
                  <p><strong>VisionaryChurch.ai Legal Team</strong></p>
                  <p>Email: <a href="mailto:legal@visionarychurch.ai" className="text-blue-600 hover:text-blue-800">legal@visionarychurch.ai</a></p>
                  <p>Phone: 1-800-VISIONARY (1-800-847-4662)</p>
                  <p>Mail: Legal Department<br/>
                     VisionaryChurch.ai, Inc.<br/>
                     123 Technology Way<br/>
                     San Francisco, CA 94105<br/>
                     United States</p>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg mt-6">
                  <p className="font-semibold">For Church-Specific Questions:</p>
                  <p>Email: <a href="mailto:churches@visionarychurch.ai" className="text-blue-600 hover:text-blue-800">churches@visionarychurch.ai</a></p>
                  <p>Our team includes former pastors and church administrators who understand the unique needs of religious organizations.</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}