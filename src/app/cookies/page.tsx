import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy | VisionaryChurch.ai',
  description: 'Information about how VisionaryChurch.ai uses cookies and similar technologies.',
}

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-8 sm:px-10 sm:py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-sm text-gray-500 mb-8">
                <strong>Last Updated:</strong> August 10, 2025
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                <p>
                  This Cookie Policy explains how VisionaryChurch.ai ("we," "us," or "our") uses cookies and similar 
                  technologies when you visit our website at visionarychurch.ai and use our services (collectively, 
                  the "Platform").
                </p>
                <p>
                  This policy should be read together with our Privacy Policy and Terms of Service to understand how 
                  we collect and use your information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. What Are Cookies</h2>
                <p>
                  Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you 
                  visit a website. They help websites remember information about your visit, such as your preferred 
                  language, login status, and other settings.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">2.1 Types of Technologies We Use</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Cookies:</strong> Small text files stored on your device</li>
                  <li><strong>Local Storage:</strong> Browser storage for larger amounts of data</li>
                  <li><strong>Session Storage:</strong> Temporary storage cleared when you close your browser</li>
                  <li><strong>Web Beacons:</strong> Small graphics used to track email opens and website analytics</li>
                  <li><strong>Pixels:</strong> Tiny images used for tracking and analytics purposes</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Cookies</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">3.1 Essential Cookies (Always Active)</h3>
                <p>These cookies are necessary for our website to function properly and cannot be disabled:</p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-semibold">Cookie Name</th>
                        <th className="text-left py-2 font-semibold">Purpose</th>
                        <th className="text-left py-2 font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">sb-access-token</td>
                        <td className="py-2">User authentication and session management</td>
                        <td className="py-2">1 hour</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">sb-refresh-token</td>
                        <td className="py-2">Maintain user sessions across visits</td>
                        <td className="py-2">30 days</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">church-context</td>
                        <td className="py-2">Remember which church organization you're accessing</td>
                        <td className="py-2">Session</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">csrf-token</td>
                        <td className="py-2">Security protection against cross-site request forgery</td>
                        <td className="py-2">Session</td>
                      </tr>
                      <tr>
                        <td className="py-2">cookie-consent</td>
                        <td className="py-2">Remember your cookie preferences</td>
                        <td className="py-2">1 year</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">3.2 Analytics Cookies (Opt-in Required)</h3>
                <p>These cookies help us understand how visitors interact with our website:</p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-semibold">Service</th>
                        <th className="text-left py-2 font-semibold">Purpose</th>
                        <th className="text-left py-2 font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Vercel Analytics</td>
                        <td className="py-2">Page views, user interactions, performance metrics</td>
                        <td className="py-2">24 months</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Vercel Speed Insights</td>
                        <td className="py-2">Website performance and loading times</td>
                        <td className="py-2">24 months</td>
                      </tr>
                      <tr>
                        <td className="py-2">Custom Analytics</td>
                        <td className="py-2">Church-specific usage patterns and feature adoption</td>
                        <td className="py-2">12 months</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">3.3 Functional Cookies (Opt-in Required)</h3>
                <p>These cookies enhance your user experience:</p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-semibold">Purpose</th>
                        <th className="text-left py-2 font-semibold">Examples</th>
                        <th className="text-left py-2 font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">User Preferences</td>
                        <td className="py-2">Language, theme, dashboard layout</td>
                        <td className="py-2">1 year</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Form Data</td>
                        <td className="py-2">Save draft prayer requests and messages</td>
                        <td className="py-2">7 days</td>
                      </tr>
                      <tr>
                        <td className="py-2">Feature Tours</td>
                        <td className="py-2">Remember completed onboarding steps</td>
                        <td className="py-2">6 months</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">3.4 Third-Party Integration Cookies</h3>
                <p>Cookies from our integrated services (only when you use these features):</p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-semibold">Service</th>
                        <th className="text-left py-2 font-semibold">Purpose</th>
                        <th className="text-left py-2 font-semibold">Privacy Policy</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Google OAuth</td>
                        <td className="py-2">Sign in with Google functionality</td>
                        <td className="py-2"><a href="https://policies.google.com/privacy" className="text-blue-600 hover:text-blue-800">Google Privacy</a></td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Stripe</td>
                        <td className="py-2">Payment processing and fraud prevention</td>
                        <td className="py-2"><a href="https://stripe.com/privacy" className="text-blue-600 hover:text-blue-800">Stripe Privacy</a></td>
                      </tr>
                      <tr>
                        <td className="py-2">OpenAI</td>
                        <td className="py-2">AI chat functionality (no tracking cookies)</td>
                        <td className="py-2"><a href="https://openai.com/privacy" className="text-blue-600 hover:text-blue-800">OpenAI Privacy</a></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cookie Consent Management</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.1 Granular Consent</h3>
                <p>We provide granular control over cookie categories:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Essential:</strong> Cannot be disabled (required for basic functionality)</li>
                  <li><strong>Analytics:</strong> Can be enabled/disabled for usage tracking</li>
                  <li><strong>Functional:</strong> Can be enabled/disabled for enhanced features</li>
                  <li><strong>Third-Party:</strong> Controlled by your use of integrated features</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.2 Consent Banner</h3>
                <p>
                  When you first visit our website, you'll see a cookie consent banner that allows you to:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Accept all cookies for full functionality</li>
                  <li>Accept only essential cookies</li>
                  <li>Customize your preferences by category</li>
                  <li>Learn more about each cookie type</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.3 Changing Your Preferences</h3>
                <p>You can update your cookie preferences at any time by:</p>
                <ul className="list-disc pl-6">
                  <li>Clicking the "Cookie Settings" link in our website footer</li>
                  <li>Accessing cookie preferences in your account settings</li>
                  <li>Using your browser's cookie management tools</li>
                  <li>Contacting our support team for assistance</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Browser Controls</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">5.1 Browser Cookie Settings</h3>
                <p>Most browsers allow you to control cookies through their settings:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Chrome</h4>
                    <p className="text-sm">Settings → Privacy and Security → Cookies and other site data</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Firefox</h4>
                    <p className="text-sm">Preferences → Privacy & Security → Cookies and Site Data</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Safari</h4>
                    <p className="text-sm">Preferences → Privacy → Manage Website Data</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Edge</h4>
                    <p className="text-sm">Settings → Cookies and site permissions → Cookies and site data</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">5.2 Do Not Track</h3>
                <p>
                  We respect Do Not Track (DNT) signals from your browser. When DNT is enabled, we will:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Disable non-essential analytics and tracking</li>
                  <li>Use only essential cookies required for functionality</li>
                  <li>Limit data collection to what's necessary for service provision</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">5.3 Impact of Disabling Cookies</h3>
                <p>
                  If you disable cookies, some features may not work properly:
                </p>
                <ul className="list-disc pl-6">
                  <li><strong>All cookies disabled:</strong> You won't be able to log in or use our services</li>
                  <li><strong>Analytics cookies disabled:</strong> We can't improve your experience based on usage data</li>
                  <li><strong>Functional cookies disabled:</strong> You'll lose personalized settings and preferences</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Mobile App Data Collection</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.1 Mobile Identifiers</h3>
                <p>
                  Our mobile applications may use device identifiers and local storage instead of traditional cookies:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Device ID:</strong> Unique identifier for your device</li>
                  <li><strong>App Storage:</strong> Local data storage for app functionality</li>
                  <li><strong>Push Tokens:</strong> For sending notifications (with your permission)</li>
                  <li><strong>Crash Analytics:</strong> Anonymous error reporting to improve app stability</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.2 Mobile Controls</h3>
                <p>You can control mobile data collection through:</p>
                <ul className="list-disc pl-6">
                  <li>App permission settings on your device</li>
                  <li>In-app privacy settings</li>
                  <li>Device-level advertising controls</li>
                  <li>App deletion (removes all stored data)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibent text-gray-900 mb-4">7. Children's Privacy</h2>
                <p>
                  We do not knowingly collect personal information from children under 13 through cookies or other 
                  tracking technologies. If a church uses our services for children's programs:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Parental consent is required before any data collection</li>
                  <li>Only essential cookies are used for safety and basic functionality</li>
                  <li>No behavioral tracking or analytics for children under 13</li>
                  <li>Enhanced security measures for children's data</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Considerations</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">8.1 GDPR Compliance (EU)</h3>
                <p>
                  For visitors from the European Union, we comply with GDPR requirements:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Explicit consent required for non-essential cookies</li>
                  <li>Clear information about cookie purposes and data processing</li>
                  <li>Easy withdrawal of consent at any time</li>
                  <li>Data protection by design and by default</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">8.2 CCPA Compliance (California)</h3>
                <p>
                  For California residents, we provide additional controls:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Right to know what personal information is collected via cookies</li>
                  <li>Right to opt-out of the "sale" of personal information (we don't sell data)</li>
                  <li>Right to delete personal information stored in cookies</li>
                  <li>Non-discrimination for exercising privacy rights</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Updates to This Policy</h2>
                <p>
                  We may update this Cookie Policy from time to time to reflect changes in our practices or applicable laws. 
                  When we make significant changes:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>We'll update the "Last Updated" date at the top of this policy</li>
                  <li>We'll notify you through our website banner or email</li>
                  <li>We'll ask for renewed consent if required by law</li>
                  <li>We'll provide a summary of key changes</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Us</h2>
                <p>
                  If you have questions about our use of cookies or this Cookie Policy, please contact us:
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

                <div className="bg-blue-50 p-6 rounded-lg mt-6">
                  <p className="font-semibold">Cookie Preferences Center:</p>
                  <p>
                    You can manage your cookie preferences at any time by visiting our 
                    <a href="#cookie-settings" className="text-blue-600 hover:text-blue-800 ml-1">Cookie Settings</a> page 
                    or clicking the cookie preference link in our website footer.
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