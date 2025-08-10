import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data Processing Agreement | VisionaryChurch.ai',
  description: 'Data Processing Agreement for GDPR compliance between VisionaryChurch.ai and church customers.',
}

export default function DataProcessingAgreement() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-8 sm:px-10 sm:py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Data Processing Agreement (DPA)</h1>
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-sm text-gray-500 mb-8">
                <strong>Effective Date:</strong> August 10, 2025<br/>
                <strong>Version:</strong> 2.0
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Background and Scope</h2>
                <p>
                  This Data Processing Agreement ("DPA") forms part of the VisionaryChurch.ai Terms of Service and governs 
                  the processing of Personal Data by VisionaryChurch.ai, Inc. ("Processor" or "VisionaryChurch.ai") on behalf 
                  of the subscribing church organization ("Controller" or "Church").
                </p>
                <p>
                  This DPA is designed to comply with the EU General Data Protection Regulation (GDPR), the UK Data Protection 
                  Act 2018, the California Consumer Privacy Act (CCPA), and other applicable privacy laws.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">1.1 Definitions</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>"Personal Data"</strong> means any information relating to an identified or identifiable natural person</li>
                  <li><strong>"Processing"</strong> means any operation performed on Personal Data, including collection, storage, use, and deletion</li>
                  <li><strong>"Data Subject"</strong> means the individual whose Personal Data is being processed</li>
                  <li><strong>"Services"</strong> means the VisionaryChurch.ai platform and related services</li>
                  <li><strong>"Sub-processor"</strong> means any third party appointed by the Processor to process Personal Data</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Data Processing Details</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">2.1 Subject Matter and Duration</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Subject Matter:</strong> Provision of visitor management and communication services for religious organizations</li>
                  <li><strong>Duration:</strong> For the term of the service agreement and 90 days thereafter for data retention and deletion</li>
                  <li><strong>Nature of Processing:</strong> Collection, storage, organization, structuring, use, disclosure, and deletion</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">2.2 Purpose of Processing</h3>
                <p>Personal Data is processed for the following purposes:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Visitor registration and check-in management</li>
                  <li>Prayer request collection and coordination</li>
                  <li>Communication and follow-up sequences</li>
                  <li>Event management and attendance tracking</li>
                  <li>Analytics and reporting for church growth insights</li>
                  <li>AI-powered chat responses and spiritual guidance</li>
                  <li>Platform security and fraud prevention</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">2.3 Categories of Personal Data</h3>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold mb-2">Standard Personal Data:</h4>
                  <ul className="list-disc pl-6 text-sm">
                    <li>Contact information (name, email, phone, address)</li>
                    <li>Demographic information (age, family status)</li>
                    <li>Visit history and interaction records</li>
                    <li>Communication preferences and settings</li>
                    <li>Event registration and attendance data</li>
                    <li>Technical data (IP address, device information, usage logs)</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold mb-2 text-blue-900">Special Categories of Personal Data:</h4>
                  <ul className="list-disc pl-6 text-sm text-blue-800">
                    <li>Religious beliefs and denominational affiliations</li>
                    <li>Health information contained in prayer requests</li>
                    <li>Spiritual counseling and pastoral care records</li>
                    <li>Confession-related communications (where applicable)</li>
                  </ul>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">2.4 Categories of Data Subjects</h3>
                <ul className="list-disc pl-6">
                  <li><strong>Church Visitors:</strong> Individuals visiting church services or events</li>
                  <li><strong>Church Members:</strong> Registered members of the congregation</li>
                  <li><strong>Church Staff:</strong> Pastors, administrators, and other church employees</li>
                  <li><strong>Volunteers:</strong> Individuals serving in various church ministries</li>
                  <li><strong>Prayer Requesters:</strong> Individuals submitting prayer requests</li>
                  <li><strong>Event Participants:</strong> Individuals registered for church events and programs</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Processor Obligations</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">3.1 Processing Instructions</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Process Personal Data only on documented instructions from the Controller</li>
                  <li>Immediately inform the Controller if instructions appear to infringe applicable privacy laws</li>
                  <li>Not process Personal Data for own purposes or disclose to unauthorized parties</li>
                  <li>Implement and maintain appropriate technical and organizational measures</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">3.2 Confidentiality and Staff</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Ensure all personnel processing Personal Data are bound by confidentiality obligations</li>
                  <li>Provide regular training on privacy and data protection requirements</li>
                  <li>Limit access to Personal Data to personnel who need it for legitimate business purposes</li>
                  <li>Maintain records of all personnel with access to Personal Data</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">3.3 Security Measures</h3>
                <p>The Processor shall implement and maintain appropriate technical and organizational measures:</p>
                
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold mb-2 text-green-900">Technical Measures:</h4>
                  <ul className="list-disc pl-6 text-sm text-green-800">
                    <li>AES-256 encryption for data at rest</li>
                    <li>TLS 1.3 encryption for data in transit</li>
                    <li>Multi-factor authentication for administrative access</li>
                    <li>Role-based access controls and permissions</li>
                    <li>Regular security updates and patch management</li>
                    <li>Network security and intrusion detection systems</li>
                    <li>Secure backup and disaster recovery procedures</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold mb-2 text-yellow-900">Organizational Measures:</h4>
                  <ul className="list-disc pl-6 text-sm text-yellow-800">
                    <li>Written information security policies and procedures</li>
                    <li>Regular staff training on data protection and security</li>
                    <li>Access management and authorization procedures</li>
                    <li>Incident response and data breach notification procedures</li>
                    <li>Regular security assessments and audits</li>
                    <li>Vendor management and due diligence processes</li>
                    <li>Physical security controls for data centers and offices</li>
                  </ul>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">3.4 Data Subject Rights</h3>
                <p>The Processor shall assist the Controller in responding to Data Subject requests:</p>
                <ul className="list-disc pl-6">
                  <li>Provide technical and organizational measures to enable Data Subject rights</li>
                  <li>Respond to Controller requests within 10 business days</li>
                  <li>Implement data portability tools and export functionality</li>
                  <li>Facilitate data deletion and rectification requests</li>
                  <li>Maintain audit logs of all Data Subject rights exercises</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Sub-processors</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.1 Authorized Sub-processors</h3>
                <p>
                  The Controller provides general written authorization for the engagement of Sub-processors. The current 
                  list of Sub-processors is maintained below and updated regularly.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-semibold">Sub-processor</th>
                        <th className="text-left py-2 font-semibold">Service</th>
                        <th className="text-left py-2 font-semibold">Location</th>
                        <th className="text-left py-2 font-semibold">Safeguards</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Supabase, Inc.</td>
                        <td className="py-2">Database and authentication</td>
                        <td className="py-2">United States</td>
                        <td className="py-2">SCCs, SOC 2</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">OpenAI, L.L.C.</td>
                        <td className="py-2">AI processing services</td>
                        <td className="py-2">United States</td>
                        <td className="py-2">SCCs, Enterprise Agreement</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">SendGrid, Inc.</td>
                        <td className="py-2">Email delivery</td>
                        <td className="py-2">United States</td>
                        <td className="py-2">SCCs, ISO 27001</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Twilio Inc.</td>
                        <td className="py-2">SMS and communications</td>
                        <td className="py-2">United States</td>
                        <td className="py-2">SCCs, SOC 2</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Stripe, Inc.</td>
                        <td className="py-2">Payment processing</td>
                        <td className="py-2">United States</td>
                        <td className="py-2">SCCs, PCI DSS</td>
                      </tr>
                      <tr>
                        <td className="py-2">Vercel Inc.</td>
                        <td className="py-2">Hosting and CDN</td>
                        <td className="py-2">Global</td>
                        <td className="py-2">SCCs, ISO 27001</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.2 Sub-processor Requirements</h3>
                <p>All Sub-processors must:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Provide sufficient guarantees of appropriate technical and organizational measures</li>
                  <li>Be bound by written agreements imposing the same data protection obligations as this DPA</li>
                  <li>Process Personal Data only for the specific purposes outlined in their agreement</li>
                  <li>Implement appropriate security measures for the type of data being processed</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.3 Changes to Sub-processors</h3>
                <ul className="list-disc pl-6">
                  <li>The Processor will provide 30 days' notice of any new Sub-processors</li>
                  <li>Controllers may object to new Sub-processors within 15 days of notice</li>
                  <li>If a Controller objects, the Processor will either not engage the Sub-processor or provide alternative solutions</li>
                  <li>The current Sub-processor list is available at visionarychurch.ai/subprocessors</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibent text-gray-900 mb-4">5. International Data Transfers</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">5.1 Transfer Mechanisms</h3>
                <p>
                  Personal Data may be transferred to countries outside the European Economic Area (EEA) or other 
                  data protection jurisdictions. Such transfers are protected by:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Standard Contractual Clauses:</strong> EU-approved standard contractual clauses (SCCs) with all relevant Sub-processors</li>
                  <li><strong>Adequacy Decisions:</strong> Where the European Commission has determined adequate protection exists</li>
                  <li><strong>Binding Corporate Rules:</strong> For transfers within our corporate group</li>
                  <li><strong>Derogations:</strong> Only in specific circumstances as permitted by law</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">5.2 Additional Safeguards</h3>
                <p>For transfers to the United States and other third countries, we implement additional safeguards:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Technical measures such as encryption and pseudonymization</li>
                  <li>Contractual restrictions on government access to data</li>
                  <li>Regular assessments of the legal and practical situation in destination countries</li>
                  <li>Suspension of transfers if adequate protection cannot be ensured</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">5.3 Transfer Impact Assessment</h3>
                <p>
                  We regularly conduct Transfer Impact Assessments (TIAs) to evaluate the level of protection in 
                  destination countries and implement appropriate additional measures where necessary.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Personal Data Breach Notification</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.1 Notification to Controller</h3>
                <p>In the event of a Personal Data breach, the Processor shall:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Immediate notification:</strong> Notify the Controller without undue delay, and in any case within 24 hours of becoming aware</li>
                  <li><strong>Detailed information:</strong> Provide all relevant information about the nature, scope, and consequences of the breach</li>
                  <li><strong>Remedial measures:</strong> Describe measures taken or proposed to address the breach and mitigate adverse effects</li>
                  <li><strong>Regular updates:</strong> Provide updates as the investigation progresses and new information becomes available</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.2 Assistance with Notifications</h3>
                <p>The Processor shall assist the Controller with:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Notifications to supervisory authorities within 72 hours</li>
                  <li>Communications to affected Data Subjects where required</li>
                  <li>Documentation and evidence for regulatory investigations</li>
                  <li>Technical and organizational measures to prevent future breaches</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.3 Incident Response</h3>
                <p>Our incident response process includes:</p>
                <ul className="list-disc pl-6">
                  <li><strong>Detection:</strong> 24/7 monitoring and automated alert systems</li>
                  <li><strong>Assessment:</strong> Immediate evaluation of the scope and potential impact</li>
                  <li><strong>Containment:</strong> Steps to prevent further unauthorized access or data loss</li>
                  <li><strong>Investigation:</strong> Forensic analysis to determine the cause and extent of the breach</li>
                  <li><strong>Recovery:</strong> Restoration of services and implementation of additional safeguards</li>
                  <li><strong>Lessons Learned:</strong> Post-incident review and process improvements</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Protection Impact Assessments</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">7.1 DPIA Support</h3>
                <p>
                  The Processor shall provide reasonable assistance to the Controller when conducting Data Protection 
                  Impact Assessments (DPIAs), including:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Technical information about processing operations and security measures</li>
                  <li>Risk assessments for high-risk processing activities</li>
                  <li>Documentation of safeguards and mitigation measures</li>
                  <li>Consultation support if required by supervisory authorities</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">7.2 High-Risk Processing</h3>
                <p>We assist with DPIAs for processing that may result in high risk, such as:</p>
                <ul className="list-disc pl-6">
                  <li>Processing of special categories of Personal Data (religious beliefs, health data)</li>
                  <li>Automated decision-making and profiling activities</li>
                  <li>Large-scale processing of sensitive personal information</li>
                  <li>Processing that involves vulnerable individuals (children, elderly)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Audits and Inspections</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">8.1 Audit Rights</h3>
                <p>
                  The Controller has the right to conduct audits and inspections to verify compliance with this DPA. 
                  The Processor shall:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Make available all information necessary to demonstrate compliance</li>
                  <li>Allow for and contribute to audits conducted by the Controller or authorized auditors</li>
                  <li>Provide reasonable access to personnel, documentation, and systems</li>
                  <li>Respond to audit findings and implement corrective measures</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">8.2 Third-Party Certifications</h3>
                <p>In lieu of individual audits, the Processor maintains the following certifications:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>SOC 2 Type II:</strong> Annual security and availability assessments</li>
                  <li><strong>ISO 27001:</strong> Information security management system certification</li>
                  <li><strong>Privacy Shield (legacy):</strong> Historical framework for EU-US data transfers</li>
                  <li><strong>GDPR Compliance:</strong> Regular assessments by qualified data protection lawyers</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">8.3 Audit Frequency</h3>
                <ul className="list-disc pl-6">
                  <li>Controllers may conduct audits annually or upon reasonable suspicion of non-compliance</li>
                  <li>Audits must be conducted with reasonable notice (minimum 30 days)</li>
                  <li>Controllers are responsible for their own audit costs unless non-compliance is found</li>
                  <li>Emergency audits may be conducted without notice in case of suspected data breaches</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Data Deletion and Return</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">9.1 End of Processing</h3>
                <p>
                  At the end of the provision of Services, the Processor shall, at the choice of the Controller:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Return:</strong> All Personal Data to the Controller in a commonly used, machine-readable format</li>
                  <li><strong>Deletion:</strong> Securely delete all Personal Data and certify deletion in writing</li>
                  <li><strong>Mixed approach:</strong> Return specific datasets and delete the remainder</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">9.2 Data Retention</h3>
                <p>Personal Data may be retained beyond the service term only:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>To the extent required by applicable law or regulation</li>
                  <li>For legitimate business purposes (e.g., billing disputes, legal claims)</li>
                  <li>With specific written instructions from the Controller</li>
                  <li>In anonymized form for statistical or research purposes</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">9.3 Secure Deletion</h3>
                <p>When deleting Personal Data, the Processor ensures:</p>
                <ul className="list-disc pl-6">
                  <li><strong>Complete removal:</strong> Data is deleted from all systems, including backups</li>
                  <li><strong>Secure methods:</strong> Use of cryptographic erasure and physical destruction where appropriate</li>
                  <li><strong>Verification:</strong> Confirmation that data cannot be recovered or reconstructed</li>
                  <li><strong>Certification:</strong> Written confirmation of deletion provided to the Controller</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Liability and Indemnification</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">10.1 Liability Allocation</h3>
                <p>
                  Each party shall be liable under applicable privacy laws for damage it causes by processing Personal 
                  Data in violation of legal obligations. The liability of each party is limited to damage directly 
                  attributable to its processing activities.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">10.2 Joint Liability</h3>
                <p>
                  Where both parties are involved in the same processing operation and are both responsible for damage, 
                  each party shall be held liable for the entire damage to enable effective compensation of the Data Subject.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">10.3 Indemnification</h3>
                <p>Each party shall indemnify the other for:</p>
                <ul className="list-disc pl-6">
                  <li>Claims arising from that party's breach of this DPA</li>
                  <li>Regulatory fines and penalties resulting from non-compliance</li>
                  <li>Legal costs associated with defending against privacy-related claims</li>
                  <li>Compensation paid to Data Subjects for privacy violations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Term and Termination</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">11.1 Term</h3>
                <p>
                  This DPA shall commence on the effective date and remain in force for as long as the Processor 
                  processes Personal Data on behalf of the Controller.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">11.2 Termination</h3>
                <p>This DPA may be terminated:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Automatically upon termination of the main service agreement</li>
                  <li>By either party for material breach with 30 days' notice and opportunity to cure</li>
                  <li>By the Controller immediately if the Processor breaches data protection obligations</li>
                  <li>By mutual written agreement of the parties</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">11.3 Survival</h3>
                <p>The following provisions shall survive termination:</p>
                <ul className="list-disc pl-6">
                  <li>Data deletion and return obligations</li>
                  <li>Confidentiality and security obligations</li>
                  <li>Liability and indemnification provisions</li>
                  <li>Audit rights for a period of 3 years</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Miscellaneous</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">12.1 Governing Law</h3>
                <p>
                  This DPA shall be governed by the laws of the jurisdiction where the Controller is established. 
                  For Controllers in multiple jurisdictions, the law of the Controller's primary establishment shall apply.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">12.2 Amendments</h3>
                <p>
                  This DPA may be amended only by written agreement of both parties or as required by changes in 
                  applicable privacy laws.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">12.3 Severability</h3>
                <p>
                  If any provision of this DPA is held invalid or unenforceable, the remainder shall remain in full 
                  force and effect, and the invalid provision shall be replaced by a valid provision that achieves 
                  the same purpose.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">12.4 Entire Agreement</h3>
                <p>
                  This DPA, together with the main service agreement, constitutes the entire agreement between the 
                  parties regarding the processing of Personal Data.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">VisionaryChurch.ai (Processor)</h3>
                  <p>
                    <strong>Legal Department</strong><br/>
                    VisionaryChurch.ai, Inc.<br/>
                    123 Technology Way<br/>
                    San Francisco, CA 94105<br/>
                    United States
                  </p>
                  <p className="mt-2">
                    Email: <a href="mailto:dpa@visionarychurch.ai" className="text-blue-600 hover:text-blue-800">dpa@visionarychurch.ai</a><br/>
                    Phone: +1-800-VISIONARY<br/>
                    Data Protection Officer: <a href="mailto:dpo@visionarychurch.ai" className="text-blue-600 hover:text-blue-800">dpo@visionarychurch.ai</a>
                  </p>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    This Data Processing Agreement is effective as of the date first written above and supersedes all 
                    prior data processing agreements between the parties.
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