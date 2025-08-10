import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GDPR Compliance | VisionaryChurch.ai',
  description: 'Our commitment to GDPR compliance and data protection for European users.',
}

export default function GDPRCompliance() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-8 sm:px-10 sm:py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">GDPR Compliance Guide</h1>
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-sm text-gray-500 mb-8">
                <strong>Last Updated:</strong> August 10, 2025
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                <p>
                  The General Data Protection Regulation (GDPR) is a comprehensive privacy law that applies to organizations 
                  processing personal data of individuals in the European Union. VisionaryChurch.ai is committed to full GDPR 
                  compliance and helping churches understand their obligations when using our platform.
                </p>
                <p>
                  This guide explains how we comply with GDPR requirements and what steps churches should take to ensure their 
                  own compliance when using our services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Our Role Under GDPR</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">2.1 Data Processor</h3>
                <p>
                  VisionaryChurch.ai acts as a <strong>Data Processor</strong> when processing personal data on behalf of churches. 
                  This means we process data according to the church's instructions and have specific obligations under GDPR.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">2.2 Data Controller</h3>
                <p>
                  Churches using our platform are typically <strong>Data Controllers</strong>, meaning they determine the purposes 
                  and means of processing personal data. They have primary responsibility for GDPR compliance.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">2.3 Joint Controllers</h3>
                <p>
                  In some cases, we may be Joint Controllers with churches, particularly for certain analytics and platform 
                  improvement activities. These arrangements are documented in our Data Processing Agreement.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Lawful Bases for Processing</h2>
                
                <div className="bg-blue-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">3.1 Consent (Article 6(1)(a))</h3>
                  <p className="text-blue-800">
                    <strong>When we use it:</strong> For marketing communications, optional analytics, and non-essential features
                  </p>
                  <p className="text-blue-800">
                    <strong>Requirements:</strong> Must be freely given, specific, informed, and unambiguous
                  </p>
                  <p className="text-blue-800">
                    <strong>Withdrawal:</strong> Users can withdraw consent at any time through their account settings
                  </p>
                </div>

                <div className="bg-green-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">3.2 Contract (Article 6(1)(b))</h3>
                  <p className="text-green-800">
                    <strong>When we use it:</strong> For account management, service delivery, and subscription processing
                  </p>
                  <p className="text-green-800">
                    <strong>Requirements:</strong> Processing must be necessary for contract performance
                  </p>
                  <p className="text-green-800">
                    <strong>Examples:</strong> User authentication, billing, core platform functionality
                  </p>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3">3.3 Legitimate Interests (Article 6(1)(f))</h3>
                  <p className="text-yellow-800">
                    <strong>When we use it:</strong> For security monitoring, fraud prevention, and service improvement
                  </p>
                  <p className="text-yellow-800">
                    <strong>Requirements:</strong> Must balance our interests against individual rights and freedoms
                  </p>
                  <p className="text-yellow-800">
                    <strong>Assessments:</strong> We conduct Legitimate Interest Assessments (LIAs) for these purposes
                  </p>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">3.4 Legal Obligation (Article 6(1)(c))</h3>
                  <p className="text-purple-800">
                    <strong>When we use it:</strong> For tax compliance, regulatory reporting, and legal requests
                  </p>
                  <p className="text-purple-800">
                    <strong>Examples:</strong> Financial record keeping, response to lawful requests from authorities
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Special Categories of Personal Data</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.1 Religious Belief Data</h3>
                <p>
                  Churches often process data revealing religious beliefs, which receives special protection under GDPR Article 9. 
                  We help churches comply with these requirements:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Explicit Consent:</strong> Required for processing religious belief data</li>
                  <li><strong>Religious Organization Exception:</strong> Churches may rely on Article 9(2)(d) for legitimate religious activities</li>
                  <li><strong>Enhanced Security:</strong> Additional technical and organizational measures for special category data</li>
                  <li><strong>Limited Purpose:</strong> Processing restricted to legitimate religious activities</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.2 Health Data in Prayer Requests</h3>
                <p>
                  Prayer requests may contain health information, which is also a special category. Our approach:
                </p>
                <ul className="list-disc pl-6">
                  <li>Clear consent mechanisms for health-related prayer requests</li>
                  <li>Secure processing with end-to-end encryption</li>
                  <li>Access controls limiting who can view sensitive requests</li>
                  <li>Option for anonymous or pseudonymous prayer submissions</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Individual Rights Under GDPR</h2>
                
                <div className="grid gap-6 mb-6">
                  <div className="border border-gray-200 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">5.1 Right of Access (Article 15)</h3>
                    <p className="text-sm text-gray-600 mb-2"><strong>Response Time:</strong> Within 1 month</p>
                    <p>Individuals can request a copy of their personal data and information about how it's processed.</p>
                    <p className="text-sm mt-2"><strong>How to request:</strong> Account dashboard → Data Export or email privacy@visionarychurch.ai</p>
                  </div>

                  <div className="border border-gray-200 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">5.2 Right to Rectification (Article 16)</h3>
                    <p className="text-sm text-gray-600 mb-2"><strong>Response Time:</strong> Within 1 month</p>
                    <p>Individuals can request correction of inaccurate or incomplete personal data.</p>
                    <p className="text-sm mt-2"><strong>How to request:</strong> Account settings → Edit Profile or contact church administrators</p>
                  </div>

                  <div className="border border-gray-200 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">5.3 Right to Erasure (Article 17)</h3>
                    <p className="text-sm text-gray-600 mb-2"><strong>Response Time:</strong> Within 1 month</p>
                    <p>Individuals can request deletion of their personal data in certain circumstances.</p>
                    <p className="text-sm mt-2"><strong>How to request:</strong> Account settings → Delete Account or email privacy@visionarychurch.ai</p>
                  </div>

                  <div className="border border-gray-200 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">5.4 Right to Restrict Processing (Article 18)</h3>
                    <p className="text-sm text-gray-600 mb-2"><strong>Response Time:</strong> Within 1 month</p>
                    <p>Individuals can request limitations on how their data is processed.</p>
                    <p className="text-sm mt-2"><strong>How to request:</strong> Contact privacy@visionarychurch.ai or church administrators</p>
                  </div>

                  <div className="border border-gray-200 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">5.5 Right to Data Portability (Article 20)</h3>
                    <p className="text-sm text-gray-600 mb-2"><strong>Response Time:</strong> Within 1 month</p>
                    <p>Individuals can request their data in a structured, machine-readable format.</p>
                    <p className="text-sm mt-2"><strong>Available formats:</strong> CSV, JSON, XML exports from account dashboard</p>
                  </div>

                  <div className="border border-gray-200 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">5.6 Right to Object (Article 21)</h3>
                    <p className="text-sm text-gray-600 mb-2"><strong>Response Time:</strong> Within 1 month</p>
                    <p>Individuals can object to processing based on legitimate interests or direct marketing.</p>
                    <p className="text-sm mt-2"><strong>How to request:</strong> Communication preferences in account settings</p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Technical and Organizational Measures</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.1 Technical Safeguards</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Encryption:</strong> AES-256 encryption at rest, TLS 1.3 in transit</li>
                  <li><strong>Access Controls:</strong> Role-based permissions and multi-factor authentication</li>
                  <li><strong>Pseudonymization:</strong> Where possible, we process pseudonymized data</li>
                  <li><strong>Data Minimization:</strong> We collect only necessary data for specified purposes</li>
                  <li><strong>Automated Deletion:</strong> Data automatically deleted according to retention schedules</li>
                  <li><strong>Backup Security:</strong> Encrypted backups with separate access controls</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.2 Organizational Measures</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Staff Training:</strong> Regular GDPR and privacy training for all employees</li>
                  <li><strong>Data Protection Officer:</strong> Designated DPO for GDPR compliance oversight</li>
                  <li><strong>Privacy by Design:</strong> Privacy considerations built into all new features</li>
                  <li><strong>Vendor Management:</strong> GDPR compliance requirements for all service providers</li>
                  <li><strong>Incident Response:</strong> Procedures for detecting and responding to data breaches</li>
                  <li><strong>Regular Audits:</strong> Internal and external privacy assessments</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.3 Audit and Monitoring</h3>
                <ul className="list-disc pl-6">
                  <li>Comprehensive logging of all data access and processing activities</li>
                  <li>Regular security assessments and penetration testing</li>
                  <li>Automated monitoring for unusual data access patterns</li>
                  <li>Annual GDPR compliance reviews and updates</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. International Data Transfers</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">7.1 Transfer Mechanisms</h3>
                <p>
                  When transferring personal data outside the EU/EEA, we use appropriate safeguards:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Standard Contractual Clauses (SCCs):</strong> EU-approved contract terms with service providers</li>
                  <li><strong>Adequacy Decisions:</strong> Transfers to countries with adequate protection levels</li>
                  <li><strong>Binding Corporate Rules:</strong> For transfers within our corporate group</li>
                  <li><strong>Explicit Consent:</strong> Where other mechanisms are not available</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">7.2 Service Provider Locations</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-semibold">Service Provider</th>
                        <th className="text-left py-2 font-semibold">Location</th>
                        <th className="text-left py-2 font-semibold">Transfer Mechanism</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Supabase</td>
                        <td className="py-2">US (AWS regions)</td>
                        <td className="py-2">Standard Contractual Clauses</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">OpenAI</td>
                        <td className="py-2">United States</td>
                        <td className="py-2">Standard Contractual Clauses</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">SendGrid</td>
                        <td className="py-2">United States</td>
                        <td className="py-2">Standard Contractual Clauses</td>
                      </tr>
                      <tr>
                        <td className="py-2">Vercel</td>
                        <td className="py-2">Global CDN</td>
                        <td className="py-2">Standard Contractual Clauses</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Breach Procedures</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">8.1 Detection and Assessment</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Automated monitoring systems alert us to potential breaches</li>
                  <li>Immediate assessment of the scope and severity of any incident</li>
                  <li>Determination of whether personal data is involved and at risk</li>
                  <li>Classification of breach type and potential impact</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">8.2 Notification Requirements</h3>
                <div className="bg-red-50 p-6 rounded-lg mb-4">
                  <h4 className="font-semibold text-red-900 mb-2">Supervisory Authority Notification</h4>
                  <p className="text-red-800 mb-2"><strong>Timeline:</strong> Within 72 hours of becoming aware of the breach</p>
                  <p className="text-red-800">Required unless the breach is unlikely to result in risk to individual rights and freedoms</p>
                </div>

                <div className="bg-orange-50 p-6 rounded-lg mb-4">
                  <h4 className="font-semibold text-orange-900 mb-2">Individual Notification</h4>
                  <p className="text-orange-800 mb-2"><strong>Timeline:</strong> Without undue delay</p>
                  <p className="text-orange-800">Required when breach is likely to result in high risk to individual rights and freedoms</p>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">8.3 Church Notification</h3>
                <p>We will notify affected churches:</p>
                <ul className="list-disc pl-6">
                  <li><strong>Immediately:</strong> Upon discovery of any breach affecting their data</li>
                  <li><strong>Details provided:</strong> Nature of breach, data involved, potential impact, remedial actions</li>
                  <li><strong>Support offered:</strong> Assistance with their own notification obligations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Church Compliance Obligations</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">9.1 Data Controller Responsibilities</h3>
                <p>Churches using our platform must:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Privacy Policy:</strong> Maintain a clear, comprehensive privacy policy</li>
                  <li><strong>Lawful Basis:</strong> Identify and document lawful bases for all processing activities</li>
                  <li><strong>Consent Management:</strong> Obtain and manage valid consent where required</li>
                  <li><strong>Data Minimization:</strong> Collect only necessary data for specified purposes</li>
                  <li><strong>Records:</strong> Maintain records of processing activities</li>
                  <li><strong>Staff Training:</strong> Train staff on GDPR requirements and data handling</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">9.2 Special Considerations for Churches</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Religious Activities:</strong> Leverage GDPR exemptions for legitimate religious activities</li>
                  <li><strong>Pastoral Care:</strong> Understand special protections for pastoral communications</li>
                  <li><strong>Children's Data:</strong> Implement appropriate safeguards for children's information</li>
                  <li><strong>Volunteers:</strong> Train volunteers on data protection requirements</li>
                  <li><strong>Events:</strong> Ensure proper consent for event photography and data collection</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">9.3 Data Processing Agreement</h3>
                <p>
                  Churches must execute a Data Processing Agreement (DPA) with us that includes:
                </p>
                <ul className="list-disc pl-6">
                  <li>Subject matter and duration of processing</li>
                  <li>Nature and purpose of processing</li>
                  <li>Types of personal data and categories of data subjects</li>
                  <li>Obligations and rights of the church as data controller</li>
                  <li>Technical and organizational security measures</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Compliance Tools and Resources</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">10.1 Built-in Compliance Features</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Consent Management:</strong> Granular consent collection and withdrawal tools</li>
                  <li><strong>Data Export:</strong> One-click data portability in multiple formats</li>
                  <li><strong>Deletion Tools:</strong> Automated and manual data deletion capabilities</li>
                  <li><strong>Access Logs:</strong> Comprehensive audit trails of data access</li>
                  <li><strong>Privacy Dashboard:</strong> Central location for all privacy-related settings</li>
                  <li><strong>Cookie Management:</strong> Granular cookie consent and preference management</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">10.2 Compliance Documentation</h3>
                <p>We provide churches with:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Standard Data Processing Agreement templates</li>
                  <li>Privacy policy templates tailored for churches</li>
                  <li>Consent form examples and best practices</li>
                  <li>GDPR training materials for church staff</li>
                  <li>Incident response procedures and templates</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">10.3 Ongoing Support</h3>
                <ul className="list-disc pl-6">
                  <li>Regular compliance updates and newsletters</li>
                  <li>Webinars on GDPR best practices for churches</li>
                  <li>Direct support from our Data Protection Officer</li>
                  <li>Annual compliance reviews and recommendations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
                
                <div className="bg-blue-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Data Protection Officer</h3>
                  <p className="text-blue-800">Email: <a href="mailto:dpo@visionarychurch.ai" className="text-blue-600 hover:text-blue-800">dpo@visionarychurch.ai</a></p>
                  <p className="text-blue-800">Phone: +1-800-VISIONARY (Option 3 for DPO)</p>
                  <p className="text-blue-800">
                    Mail: Data Protection Officer<br/>
                    VisionaryChurch.ai, Inc.<br/>
                    123 Technology Way<br/>
                    San Francisco, CA 94105<br/>
                    United States
                  </p>
                </div>

                <div className="bg-green-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">EU Representative</h3>
                  <p className="text-green-800">
                    For EU residents, our European representative can be contacted at:
                  </p>
                  <p className="text-green-800">
                    Email: <a href="mailto:eu-rep@visionarychurch.ai" className="text-green-600 hover:text-green-800">eu-rep@visionarychurch.ai</a><br/>
                    Phone: +49-800-VISIONARY<br/>
                    Address: EU Privacy Representative<br/>
                    Privacy Partners GmbH<br/>
                    Maximilianstrasse 13<br/>
                    80539 Munich, Germany
                  </p>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3">Supervisory Authority</h3>
                  <p className="text-yellow-800">
                    If you have concerns about our data processing that we cannot resolve, you have the right to lodge 
                    a complaint with a supervisory authority. You can find your local authority at:
                  </p>
                  <p className="text-yellow-800 mt-2">
                    <a href="https://edpb.europa.eu/about-edpb/board/members_en" className="text-yellow-600 hover:text-yellow-800">
                      European Data Protection Board - Member Authorities
                    </a>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}