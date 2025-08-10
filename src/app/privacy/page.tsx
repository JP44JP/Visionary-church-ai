import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | VisionaryChurch.ai',
  description: 'Our commitment to protecting your privacy and personal information when using VisionaryChurch.ai services.',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-8 sm:px-10 sm:py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-sm text-gray-500 mb-8">
                <strong>Last Updated:</strong> August 10, 2025
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                <p>
                  VisionaryChurch.ai ("we," "our," or "us") is committed to protecting your privacy and handling your personal 
                  information with care and respect. This Privacy Policy explains how we collect, use, share, and protect your 
                  information when you use our AI-powered visitor management platform designed for churches and religious organizations.
                </p>
                <p>
                  We understand the sacred nature of spiritual communications and the trust placed in religious organizations. 
                  This policy reflects our commitment to maintaining the highest standards of privacy and confidentiality for 
                  both churches and their congregants.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">2.1 Information You Provide</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Account Information:</strong> Name, email address, phone number, church affiliation, role within the organization</li>
                  <li><strong>Visitor Information:</strong> Names, contact details, visit preferences, and interaction history of church visitors</li>
                  <li><strong>Prayer Requests:</strong> Personal prayer requests, spiritual concerns, and related communications</li>
                  <li><strong>Event Information:</strong> Event registrations, attendance records, and participation details</li>
                  <li><strong>Communication Data:</strong> Messages, chat conversations, email content, and SMS communications</li>
                  <li><strong>Payment Information:</strong> Billing details processed through our payment processor (Stripe)</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">2.2 Information We Collect Automatically</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Usage Data:</strong> How you interact with our platform, features used, time spent on different sections</li>
                  <li><strong>Device Information:</strong> IP address, browser type, device identifiers, operating system</li>
                  <li><strong>Log Information:</strong> Access times, pages viewed, errors encountered, referral sources</li>
                  <li><strong>Performance Data:</strong> Response times, system performance metrics, error rates</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">2.3 Information from Third Parties</h3>
                <ul className="list-disc pl-6">
                  <li><strong>Authentication Services:</strong> Information from Google, Facebook, or other OAuth providers when you choose to sign in with these services</li>
                  <li><strong>Integration Partners:</strong> Data from authorized church management systems or other platforms you connect to our service</li>
                  <li><strong>AI Processing:</strong> Processed information from OpenAI for chat responses and content analysis (anonymized where possible)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">3.1 Primary Service Purposes</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Provide and maintain our visitor management platform</li>
                  <li>Process and manage visitor information and interactions</li>
                  <li>Handle prayer requests with appropriate confidentiality</li>
                  <li>Facilitate church-visitor communications</li>
                  <li>Manage event registrations and attendance tracking</li>
                  <li>Generate analytics and insights for church growth</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">3.2 Communication and Support</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Send service-related notifications and updates</li>
                  <li>Provide customer support and technical assistance</li>
                  <li>Send automated follow-up sequences as configured by churches</li>
                  <li>Facilitate AI-powered chat interactions</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">3.3 Platform Improvement</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Analyze usage patterns to improve our services</li>
                  <li>Develop new features and functionality</li>
                  <li>Ensure platform security and prevent abuse</li>
                  <li>Conduct research and analytics (in aggregated, anonymized form)</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">3.4 Legal and Compliance</h3>
                <ul className="list-disc pl-6">
                  <li>Comply with legal obligations and regulations</li>
                  <li>Respond to lawful requests from authorities</li>
                  <li>Protect our rights, property, and safety</li>
                  <li>Prevent fraud and abuse of our services</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.1 Church Organizations</h3>
                <p>
                  Information is shared with the specific church organization that you interact with or that manages your data. 
                  Each church has access to their own visitor data, prayer requests, and communication history.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.2 Service Providers</h3>
                <p>We share information with trusted service providers who help us operate our platform:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Supabase:</strong> Database and authentication services</li>
                  <li><strong>OpenAI:</strong> AI-powered chat responses and content processing</li>
                  <li><strong>SendGrid:</strong> Email delivery services</li>
                  <li><strong>Twilio:</strong> SMS and communication services</li>
                  <li><strong>Stripe:</strong> Payment processing services</li>
                  <li><strong>Vercel:</strong> Hosting and analytics services</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.3 Legal Requirements</h3>
                <p>We may disclose information when required by law or to:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Comply with legal processes or government requests</li>
                  <li>Protect our rights, property, or safety</li>
                  <li>Prevent fraud or investigate suspected illegal activities</li>
                  <li>Enforce our Terms of Service</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.4 Business Transfers</h3>
                <p>
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. 
                  We will notify you of any such change in ownership or control of your personal information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Protection and Security</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">5.1 Security Measures</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>End-to-end encryption for sensitive communications</li>
                  <li>Multi-factor authentication for administrative access</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>SOC 2 Type II compliance (in progress)</li>
                  <li>HTTPS encryption for all data transmission</li>
                  <li>Role-based access controls and data segregation</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">5.2 Data Storage and Processing</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Data is stored in secure, geographically distributed data centers</li>
                  <li>Regular automated backups with secure storage</li>
                  <li>Data processing occurs in compliance with applicable regulations</li>
                  <li>Strict access controls limiting employee access to personal data</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">5.3 Spiritual Data Protections</h3>
                <p>
                  We recognize the sensitive nature of spiritual communications and implement additional protections:
                </p>
                <ul className="list-disc pl-6">
                  <li>Prayer requests are encrypted and access-controlled</li>
                  <li>Pastoral communications receive enhanced confidentiality protections</li>
                  <li>Confession-like communications are treated with utmost privacy</li>
                  <li>Church staff training on handling sensitive spiritual information</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights and Choices</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.1 Access and Correction</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Access your personal information through your account dashboard</li>
                  <li>Update or correct your information at any time</li>
                  <li>Request a copy of all data we have about you</li>
                  <li>Verify the accuracy of your information</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.2 Data Portability</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Export your data in common formats (CSV, JSON)</li>
                  <li>Transfer your information to another service provider</li>
                  <li>Receive a comprehensive data package upon request</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.3 Deletion Rights</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Delete your account and associated personal data</li>
                  <li>Request deletion of specific information</li>
                  <li>Automatic deletion after account closure (within 30 days)</li>
                  <li>Right to be forgotten (subject to legal retention requirements)</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.4 Communication Preferences</h3>
                <ul className="list-disc pl-6">
                  <li>Opt out of marketing communications</li>
                  <li>Control notification preferences</li>
                  <li>Unsubscribe from automated sequences</li>
                  <li>Adjust privacy settings for different data types</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. International Data Transfers</h2>
                <p>
                  Our services are primarily based in the United States, but we may process data in other countries where our 
                  service providers operate. When we transfer data internationally, we ensure appropriate safeguards are in place:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Standard Contractual Clauses (SCCs) with international service providers</li>
                  <li>Adequacy decisions where applicable</li>
                  <li>Binding Corporate Rules for our corporate family</li>
                  <li>Your explicit consent for specific transfers when required</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy (COPPA Compliance)</h2>
                <p>
                  Our services are not intended for children under 13. However, churches may collect information about children 
                  for legitimate purposes such as children's ministry programs. When this occurs:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Parental consent is required before collecting children's information</li>
                  <li>Limited data collection focused on safety and program participation</li>
                  <li>Enhanced security measures for children's data</li>
                  <li>No behavioral advertising targeting children</li>
                  <li>Parents can review, modify, or delete their child's information</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Data Retention</h2>
                <p>We retain your information for as long as necessary to provide our services and comply with legal obligations:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Account Data:</strong> Retained while your account is active and for 3 years after closure</li>
                  <li><strong>Prayer Requests:</strong> Retained according to church policies, typically 7 years</li>
                  <li><strong>Communication Records:</strong> Retained for 3 years for quality assurance</li>
                  <li><strong>Analytics Data:</strong> Aggregated data may be retained indefinitely in anonymized form</li>
                  <li><strong>Financial Records:</strong> Retained for 7 years for tax and legal compliance</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Regional Privacy Rights</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">10.1 European Union (GDPR)</h3>
                <p>If you are located in the EU, you have additional rights under GDPR:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Lawful basis for processing (consent, legitimate interest, contract)</li>
                  <li>Right to object to processing</li>
                  <li>Right to restrict processing</li>
                  <li>Right to data portability</li>
                  <li>Right to lodge a complaint with a supervisory authority</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">10.2 California (CCPA/CPRA)</h3>
                <p>California residents have specific rights under the California Consumer Privacy Act:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Right to know what personal information is collected</li>
                  <li>Right to delete personal information</li>
                  <li>Right to opt-out of the sale of personal information</li>
                  <li>Right to non-discrimination for exercising privacy rights</li>
                  <li>Right to correct inaccurate personal information</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">10.3 Other Jurisdictions</h3>
                <p>
                  We respect privacy rights under applicable laws in Canada (PIPEDA), Brazil (LGPD), and other jurisdictions 
                  where our services are used.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy periodically to reflect changes in our practices or applicable laws. 
                  When we make significant changes, we will:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Notify you by email if you have an account with us</li>
                  <li>Post a prominent notice on our website</li>
                  <li>Update the "Last Updated" date at the top of this policy</li>
                  <li>Provide a summary of key changes</li>
                  <li>Allow you to review and accept material changes before they take effect</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy or how we handle your information, please contact us:
                </p>
                
                <div className="bg-gray-50 p-6 rounded-lg mt-4">
                  <p><strong>VisionaryChurch.ai Privacy Team</strong></p>
                  <p>Email: <a href="mailto:privacy@visionarychurch.ai" className="text-blue-600 hover:text-blue-800">privacy@visionarychurch.ai</a></p>
                  <p>Phone: 1-800-VISIONARY (1-800-847-4662)</p>
                  <p>Mail: Privacy Officer<br/>
                     VisionaryChurch.ai, Inc.<br/>
                     123 Technology Way<br/>
                     San Francisco, CA 94105<br/>
                     United States</p>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-6">Data Protection Officer (EU)</h3>
                <p>
                  For GDPR-related inquiries, you may contact our Data Protection Officer:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg mt-4">
                  <p>Email: <a href="mailto:dpo@visionarychurch.ai" className="text-blue-600 hover:text-blue-800">dpo@visionarychurch.ai</a></p>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-6">Emergency Contact</h3>
                <p>
                  For urgent privacy matters or data breach concerns:
                </p>
                <div className="bg-red-50 p-6 rounded-lg mt-4">
                  <p>Email: <a href="mailto:security@visionarychurch.ai" className="text-red-600 hover:text-red-800">security@visionarychurch.ai</a></p>
                  <p>Phone: 1-800-EMERGENCY (Available 24/7)</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}