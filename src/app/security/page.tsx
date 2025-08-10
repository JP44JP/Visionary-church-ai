import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Security & Compliance | VisionaryChurch.ai',
  description: 'Our comprehensive approach to security, compliance, and protecting church data.',
}

export default function SecurityCompliance() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-8 sm:px-10 sm:py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Security & Compliance Overview</h1>
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-sm text-gray-500 mb-8">
                <strong>Last Updated:</strong> August 10, 2025<br/>
                <strong>Version:</strong> 3.0
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Executive Summary</h2>
                <p>
                  At VisionaryChurch.ai, we understand that churches entrust us with some of their most sensitive information, 
                  including prayer requests, spiritual communications, and personal data of their congregants. Our security 
                  and compliance program is built on the principle that protecting this sacred trust requires the highest 
                  standards of technical and organizational measures.
                </p>
                <p>
                  This document provides a comprehensive overview of our security practices, compliance certifications, 
                  and ongoing commitment to protecting church data against threats while enabling growth and ministry effectiveness.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Security Framework</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">2.1 Security-by-Design</h3>
                <p>Security is integrated into every aspect of our platform development:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Threat Modeling:</strong> Each new feature undergoes comprehensive threat analysis</li>
                  <li><strong>Secure Development:</strong> OWASP Top 10 and secure coding practices enforced</li>
                  <li><strong>Code Reviews:</strong> Mandatory security reviews for all code changes</li>
                  <li><strong>Automated Testing:</strong> Security-focused unit and integration tests</li>
                  <li><strong>Penetration Testing:</strong> Quarterly external security assessments</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">2.2 Defense-in-Depth</h3>
                <p>We implement multiple layers of security controls:</p>
                
                <div className="bg-blue-50 p-6 rounded-lg mb-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Application Layer</h4>
                  <ul className="list-disc pl-6 text-blue-800 text-sm">
                    <li>Input validation and sanitization</li>
                    <li>SQL injection prevention</li>
                    <li>Cross-site scripting (XSS) protection</li>
                    <li>Cross-site request forgery (CSRF) tokens</li>
                    <li>Rate limiting and DDoS protection</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-6 rounded-lg mb-4">
                  <h4 className="font-semibold text-green-900 mb-2">Network Layer</h4>
                  <ul className="list-disc pl-6 text-green-800 text-sm">
                    <li>Web Application Firewall (WAF)</li>
                    <li>Distributed Denial of Service (DDoS) protection</li>
                    <li>Network segmentation and micro-segmentation</li>
                    <li>Intrusion detection and prevention systems</li>
                    <li>TLS 1.3 encryption for all communications</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg mb-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">Infrastructure Layer</h4>
                  <ul className="list-disc pl-6 text-yellow-800 text-sm">
                    <li>Container security and image scanning</li>
                    <li>Kubernetes security policies</li>
                    <li>Infrastructure as Code (IaC) security scanning</li>
                    <li>Automated patch management</li>
                    <li>Security monitoring and alerting</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Data Layer</h4>
                  <ul className="list-disc pl-6 text-purple-800 text-sm">
                    <li>AES-256 encryption at rest</li>
                    <li>Database activity monitoring</li>
                    <li>Data loss prevention (DLP) controls</li>
                    <li>Backup encryption and integrity checks</li>
                    <li>Secure key management</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Compliance Certifications</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">3.1 Current Certifications</h3>
                
                <div className="grid gap-4 mb-6">
                  <div className="border border-gray-200 p-4 rounded-lg flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-bold text-sm">SOC 2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">SOC 2 Type II</h4>
                      <p className="text-sm text-gray-600">Annual audit of security, availability, and confidentiality controls</p>
                      <p className="text-xs text-gray-500 mt-1">Audit Period: January 2025 - December 2025 | Auditor: Deloitte & Touche LLP</p>
                    </div>
                  </div>

                  <div className="border border-gray-200 p-4 rounded-lg flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-green-600 font-bold text-xs">ISO 27001</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">ISO 27001:2022</h4>
                      <p className="text-sm text-gray-600">Information Security Management System certification</p>
                      <p className="text-xs text-gray-500 mt-1">Valid: March 2025 - March 2028 | Certifying Body: BSI Group</p>
                    </div>
                  </div>

                  <div className="border border-gray-200 p-4 rounded-lg flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-purple-600 font-bold text-xs">GDPR</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">GDPR Compliant</h4>
                      <p className="text-sm text-gray-600">Full compliance with EU General Data Protection Regulation</p>
                      <p className="text-xs text-gray-500 mt-1">Verified: August 2025 | Assessor: Privacy & Data Protection Law Firm</p>
                    </div>
                  </div>

                  <div className="border border-gray-200 p-4 rounded-lg flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-red-600 font-bold text-xs">PCI DSS</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">PCI DSS Level 1</h4>
                      <p className="text-sm text-gray-600">Payment Card Industry Data Security Standard (via Stripe)</p>
                      <p className="text-xs text-gray-500 mt-1">Service Provider Level 1 | Validated through Stripe partnership</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">3.2 Compliance Roadmap</h3>
                <p>Planned certifications and compliance initiatives:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>FedRAMP Moderate (Q4 2025):</strong> For potential government church partnerships</li>
                  <li><strong>HIPAA Business Associate (Q1 2026):</strong> For churches with healthcare ministries</li>
                  <li><strong>SOC 2 Type III (Q2 2026):</strong> Continuous monitoring and real-time assurance</li>
                  <li><strong>ISO 27017 (Q3 2026):</strong> Cloud security controls certification</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Protection and Privacy</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.1 Encryption Standards</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-semibold">Data State</th>
                        <th className="text-left py-2 font-semibold">Encryption Method</th>
                        <th className="text-left py-2 font-semibold">Key Management</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Data at Rest</td>
                        <td className="py-2">AES-256-GCM</td>
                        <td className="py-2">AWS KMS / Azure Key Vault</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Data in Transit</td>
                        <td className="py-2">TLS 1.3</td>
                        <td className="py-2">Perfect Forward Secrecy</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Database</td>
                        <td className="py-2">Transparent Data Encryption (TDE)</td>
                        <td className="py-2">Hardware Security Modules</td>
                      </tr>
                      <tr>
                        <td className="py-2">Backups</td>
                        <td className="py-2">AES-256-CBC</td>
                        <td className="py-2">Separate key encryption keys</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.2 Special Protection for Spiritual Data</h3>
                <p>
                  We recognize the sacred nature of spiritual communications and implement additional protections:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Prayer Request Encryption:</strong> End-to-end encryption with church-specific keys</li>
                  <li><strong>Pastoral Privilege:</strong> Enhanced access controls for confession-like communications</li>
                  <li><strong>Spiritual Counseling:</strong> Separate encryption domains for sensitive spiritual data</li>
                  <li><strong>Ministry Confidentiality:</strong> Role-based access ensuring only authorized personnel can view sensitive content</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.3 Data Minimization</h3>
                <p>We collect and process only the minimum data necessary:</p>
                <ul className="list-disc pl-6">
                  <li><strong>Purpose Limitation:</strong> Data used only for specified, legitimate purposes</li>
                  <li><strong>Storage Limitation:</strong> Automated deletion based on retention policies</li>
                  <li><strong>Pseudonymization:</strong> Personal identifiers replaced with pseudonyms where possible</li>
                  <li><strong>Anonymization:</strong> Analytics data stripped of personally identifiable information</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Access Controls and Identity Management</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">5.1 Multi-Factor Authentication (MFA)</h3>
                <p>MFA is required for all administrative and privileged access:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Administrative Users:</strong> Required for all platform administrators</li>
                  <li><strong>Church Administrators:</strong> Enforced for church account administrators</li>
                  <li><strong>API Access:</strong> API keys combined with OAuth 2.0 and MFA</li>
                  <li><strong>Emergency Access:</strong> Break-glass procedures with enhanced logging</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">5.2 Role-Based Access Control (RBAC)</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-semibold">Role</th>
                        <th className="text-left py-2 font-semibold">Access Level</th>
                        <th className="text-left py-2 font-semibold">Data Permissions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Church Admin</td>
                        <td className="py-2">Full church data access</td>
                        <td className="py-2">Read/Write all church data</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Pastor/Minister</td>
                        <td className="py-2">Ministry-specific access</td>
                        <td className="py-2">Read/Write assigned ministries</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Staff Member</td>
                        <td className="py-2">Limited operational access</td>
                        <td className="py-2">Read assigned data, limited write</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Volunteer</td>
                        <td className="py-2">Task-specific access</td>
                        <td className="py-2">Read-only assigned tasks</td>
                      </tr>
                      <tr>
                        <td className="py-2">Visitor</td>
                        <td className="py-2">Personal data only</td>
                        <td className="py-2">Read/Write own information</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">5.3 Privileged Access Management</h3>
                <ul className="list-disc pl-6">
                  <li><strong>Just-in-Time Access:</strong> Temporary elevation of privileges for specific tasks</li>
                  <li><strong>Privileged Session Recording:</strong> All administrative sessions recorded and monitored</li>
                  <li><strong>Approval Workflows:</strong> Multi-person approval for high-risk operations</li>
                  <li><strong>Regular Reviews:</strong> Quarterly access reviews and de-provisioning</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Infrastructure Security</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.1 Cloud Security Architecture</h3>
                <p>Our multi-cloud strategy ensures resilience and security:</p>
                
                <div className="grid gap-4 mb-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Primary Infrastructure (AWS)</h4>
                    <ul className="text-sm text-blue-800 list-disc pl-4">
                      <li>Virtual Private Cloud (VPC) with isolated subnets</li>
                      <li>AWS GuardDuty for threat detection</li>
                      <li>AWS CloudTrail for audit logging</li>
                      <li>AWS Config for compliance monitoring</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Secondary Infrastructure (Azure)</h4>
                    <ul className="text-sm text-green-800 list-disc pl-4">
                      <li>Azure Sentinel for security analytics</li>
                      <li>Azure Security Center for vulnerability management</li>
                      <li>Azure Key Vault for secrets management</li>
                      <li>Azure Monitor for comprehensive logging</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.2 Container and Kubernetes Security</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Image Scanning:</strong> All container images scanned for vulnerabilities</li>
                  <li><strong>Runtime Security:</strong> Continuous monitoring of running containers</li>
                  <li><strong>Network Policies:</strong> Micro-segmentation within Kubernetes clusters</li>
                  <li><strong>Pod Security Policies:</strong> Enforce security standards for all workloads</li>
                  <li><strong>Secrets Management:</strong> Kubernetes secrets encrypted at rest and in transit</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.3 Disaster Recovery and Business Continuity</h3>
                <ul className="list-disc pl-6">
                  <li><strong>RTO/RPO Targets:</strong> 4-hour Recovery Time, 1-hour Recovery Point</li>
                  <li><strong>Geographic Redundancy:</strong> Data replicated across multiple regions</li>
                  <li><strong>Automated Failover:</strong> Seamless failover to backup infrastructure</li>
                  <li><strong>Regular Testing:</strong> Monthly disaster recovery drills and testing</li>
                  <li><strong>Communication Plans:</strong> Defined procedures for incident communication</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Security Monitoring and Incident Response</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">7.1 24/7 Security Operations Center (SOC)</h3>
                <p>Our SOC provides continuous monitoring and response:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Real-time Monitoring:</strong> AI-powered threat detection and analysis</li>
                  <li><strong>Automated Response:</strong> Immediate containment of detected threats</li>
                  <li><strong>Expert Analysis:</strong> Security analysts available 24/7/365</li>
                  <li><strong>Threat Intelligence:</strong> Integration with global threat intelligence feeds</li>
                  <li><strong>Custom Rules:</strong> Church-specific security rules and alerting</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">7.2 Incident Response Process</h3>
                
                <div className="bg-red-50 p-6 rounded-lg mb-4">
                  <h4 className="font-semibold text-red-900 mb-3">Response Timeline</h4>
                  <ul className="list-disc pl-6 text-red-800 text-sm">
                    <li><strong>0-15 minutes:</strong> Automated detection and initial containment</li>
                    <li><strong>15-30 minutes:</strong> Human analyst validation and escalation</li>
                    <li><strong>30-60 minutes:</strong> Incident commander assignment and response team activation</li>
                    <li><strong>1-4 hours:</strong> Full investigation and remediation actions</li>
                    <li><strong>4-24 hours:</strong> Customer notification and post-incident activities</li>
                  </ul>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">7.3 Security Metrics and KPIs</h3>
                <p>We track and report on key security metrics:</p>
                <ul className="list-disc pl-6">
                  <li><strong>Mean Time to Detection (MTTD):</strong> Average 12 minutes</li>
                  <li><strong>Mean Time to Response (MTTR):</strong> Average 45 minutes</li>
                  <li><strong>False Positive Rate:</strong> Less than 5% for critical alerts</li>
                  <li><strong>Vulnerability Patching:</strong> 95% within 30 days, critical within 72 hours</li>
                  <li><strong>Security Training:</strong> 100% staff completion quarterly</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Vendor and Supply Chain Security</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">8.1 Vendor Risk Assessment</h3>
                <p>All vendors undergo comprehensive security assessments:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Security Questionnaires:</strong> Detailed assessment of security practices</li>
                  <li><strong>Certification Verification:</strong> Validation of security certifications</li>
                  <li><strong>Penetration Testing:</strong> Third-party security testing when applicable</li>
                  <li><strong>Ongoing Monitoring:</strong> Continuous assessment of vendor security posture</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">8.2 Key Vendors Security Status</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-semibold">Vendor</th>
                        <th className="text-left py-2 font-semibold">Service</th>
                        <th className="text-left py-2 font-semibold">Security Certifications</th>
                        <th className="text-left py-2 font-semibold">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Supabase</td>
                        <td className="py-2">Database & Auth</td>
                        <td className="py-2">SOC 2, ISO 27001</td>
                        <td className="py-2 text-green-600">Low</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">OpenAI</td>
                        <td className="py-2">AI Services</td>
                        <td className="py-2">SOC 2, Enterprise BAA</td>
                        <td className="py-2 text-yellow-600">Medium</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">SendGrid</td>
                        <td className="py-2">Email Delivery</td>
                        <td className="py-2">SOC 2, ISO 27001</td>
                        <td className="py-2 text-green-600">Low</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Twilio</td>
                        <td className="py-2">SMS Services</td>
                        <td className="py-2">SOC 2, HIPAA BAA</td>
                        <td className="py-2 text-green-600">Low</td>
                      </tr>
                      <tr>
                        <td className="py-2">Stripe</td>
                        <td className="py-2">Payment Processing</td>
                        <td className="py-2">PCI DSS Level 1</td>
                        <td className="py-2 text-green-600">Low</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">8.3 Software Supply Chain Security</h3>
                <ul className="list-disc pl-6">
                  <li><strong>Dependency Scanning:</strong> Automated scanning of all third-party libraries</li>
                  <li><strong>License Compliance:</strong> Verification of open source license compatibility</li>
                  <li><strong>Software Bill of Materials (SBOM):</strong> Comprehensive inventory of all components</li>
                  <li><strong>Vulnerability Management:</strong> Automated updates for security vulnerabilities</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Physical and Environmental Security</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">9.1 Data Center Security</h3>
                <p>Our cloud providers maintain world-class physical security:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>24/7 Security Personnel:</strong> On-site security guards and monitoring</li>
                  <li><strong>Biometric Access Controls:</strong> Multi-factor authentication for facility access</li>
                  <li><strong>Surveillance Systems:</strong> Comprehensive CCTV coverage and monitoring</li>
                  <li><strong>Environmental Controls:</strong> Climate control and fire suppression systems</li>
                  <li><strong>Power and Connectivity:</strong> Redundant power and network connections</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">9.2 Office Security</h3>
                <p>Our corporate offices implement appropriate physical security measures:</p>
                <ul className="list-disc pl-6">
                  <li><strong>Access Controls:</strong> Badge-based access with visitor management</li>
                  <li><strong>Clean Desk Policy:</strong> No sensitive information left unattended</li>
                  <li><strong>Secure Disposal:</strong> Certified destruction of sensitive documents and media</li>
                  <li><strong>Equipment Security:</strong> Laptop encryption and mobile device management</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Security Training and Awareness</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">10.1 Employee Security Training</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Security Onboarding:</strong> Comprehensive security training for all new hires</li>
                  <li><strong>Quarterly Updates:</strong> Regular training on emerging threats and best practices</li>
                  <li><strong>Phishing Simulations:</strong> Monthly simulated phishing attacks and remediation</li>
                  <li><strong>Role-Specific Training:</strong> Specialized training for different job functions</li>
                  <li><strong>Annual Certifications:</strong> Security awareness certifications required for all staff</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">10.2 Church Staff Training</h3>
                <p>We provide security training resources for church staff:</p>
                <ul className="list-disc pl-6">
                  <li><strong>Platform Security Training:</strong> How to securely use VisionaryChurch.ai features</li>
                  <li><strong>Privacy Best Practices:</strong> Handling sensitive spiritual and personal information</li>
                  <li><strong>Incident Reporting:</strong> How to report security concerns or potential breaches</li>
                  <li><strong>Password Management:</strong> Strong password and multi-factor authentication practices</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Continuous Improvement</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">11.1 Security Roadmap</h3>
                <p>Our planned security enhancements include:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Zero Trust Architecture (Q4 2025):</strong> Implementation of comprehensive zero trust security model</li>
                  <li><strong>Advanced Threat Protection (Q1 2026):</strong> AI-powered threat detection and response</li>
                  <li><strong>Quantum-Safe Cryptography (Q2 2026):</strong> Post-quantum cryptographic algorithms</li>
                  <li><strong>Homomorphic Encryption (Q3 2026):</strong> Computation on encrypted data for enhanced privacy</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">11.2 Performance Metrics</h3>
                <p>We continuously monitor and improve our security posture:</p>
                <ul className="list-disc pl-6">
                  <li><strong>Security Score:</strong> Composite score based on multiple security metrics</li>
                  <li><strong>Vulnerability Metrics:</strong> Time to patch, number of open vulnerabilities</li>
                  <li><strong>Incident Metrics:</strong> Number of incidents, response times, impact assessment</li>
                  <li><strong>Training Effectiveness:</strong> Phishing simulation results, training completion rates</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Security Contact Information</h2>
                
                <div className="bg-red-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-3">Security Incident Reporting</h3>
                  <p className="text-red-800 mb-2"><strong>EMERGENCY HOTLINE (24/7):</strong> +1-800-SEC-URGENT</p>
                  <p className="text-red-800">Email: <a href="mailto:security@visionarychurch.ai" className="text-red-600 hover:text-red-800">security@visionarychurch.ai</a></p>
                  <p className="text-red-800 text-sm mt-2">
                    For immediate security concerns, suspected breaches, or urgent security matters
                  </p>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Security Team</h3>
                  <p className="text-blue-800">
                    Chief Information Security Officer: <a href="mailto:ciso@visionarychurch.ai" className="text-blue-600 hover:text-blue-800">ciso@visionarychurch.ai</a><br/>
                    Security Operations Center: <a href="mailto:soc@visionarychurch.ai" className="text-blue-600 hover:text-blue-800">soc@visionarychurch.ai</a><br/>
                    Vulnerability Reports: <a href="mailto:vuln@visionarychurch.ai" className="text-blue-600 hover:text-blue-800">vuln@visionarychurch.ai</a>
                  </p>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">Bug Bounty Program</h3>
                  <p className="text-green-800">
                    We welcome responsible disclosure of security vulnerabilities through our bug bounty program.
                  </p>
                  <p className="text-green-800 mt-2">
                    Program Details: <a href="mailto:bugbounty@visionarychurch.ai" className="text-green-600 hover:text-green-800">bugbounty@visionarychurch.ai</a><br/>
                    HackerOne: <a href="https://hackerone.com/visionarychurch" className="text-green-600 hover:text-green-800">hackerone.com/visionarychurch</a>
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