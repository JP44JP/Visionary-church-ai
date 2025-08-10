'use client'

import React from 'react'

const VoiceGuide: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-16">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-5xl font-display font-bold gradient-text mb-4">
          Brand Voice & Messaging
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Our voice reflects the intersection of cutting-edge technology and timeless spiritual values. 
          We speak with confidence, warmth, and respect for the sacred mission of every church.
        </p>
      </div>

      {/* Brand Personality */}
      <section>
        <h2 className="text-3xl font-display font-bold mb-8">Brand Personality</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              trait: "Innovative",
              description: "Forward-thinking and cutting-edge",
              example: "\"Revolutionary AI that understands your congregation\"",
              color: "border-brand-primary-500 bg-brand-primary-50"
            },
            {
              trait: "Trustworthy", 
              description: "Reliable and secure",
              example: "\"Your data is protected with enterprise-grade security\"",
              color: "border-brand-supporting-500 bg-brand-supporting-50"
            },
            {
              trait: "Approachable",
              description: "Friendly and accessible",
              example: "\"Getting started is as simple as a Sunday morning welcome\"",
              color: "border-brand-accent-500 bg-brand-accent-50"
            },
            {
              trait: "Respectful",
              description: "Honors church traditions",
              example: "\"Technology that serves your ministry, not the other way around\"",
              color: "border-brand-secondary-500 bg-brand-secondary-50"
            },
            {
              trait: "Empowering",
              description: "Enables growth and connection",
              example: "\"Watch your community flourish with intelligent engagement\"",
              color: "border-brand-primary-500 bg-brand-primary-50"
            },
            {
              trait: "Professional",
              description: "Competent and polished",
              example: "\"Built for churches who take their digital presence seriously\"",
              color: "border-gray-500 bg-gray-50"
            }
          ].map((item) => (
            <div key={item.trait} className={`card p-6 border-l-4 ${item.color}`}>
              <h3 className="text-lg font-semibold mb-2">{item.trait}</h3>
              <p className="text-gray-600 text-sm mb-3">{item.description}</p>
              <div className="text-sm italic text-gray-500">
                {item.example}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tone of Voice */}
      <section>
        <h2 className="text-3xl font-display font-bold mb-8">Tone of Voice Spectrum</h2>
        <div className="space-y-8">
          {[
            {
              spectrum: "Formal ←→ Conversational",
              position: "65%", // More conversational
              description: "Professional but warm, like a knowledgeable friend",
              examples: {
                avoid: "\"The aforementioned functionality enables optimization of visitor conversion metrics.\"",
                prefer: "\"This feature helps turn more visitors into active church members.\""
              }
            },
            {
              spectrum: "Serious ←→ Playful", 
              position: "35%", // More serious
              description: "Respectfully engaging, appropriate for sacred contexts",
              examples: {
                avoid: "\"Our AI is totally awesome and will blow your mind! 🤯\"",
                prefer: "\"Our AI technology thoughtfully engages visitors with meaningful conversations.\""
              }
            },
            {
              spectrum: "Technical ←→ Simple",
              position: "70%", // More simple
              description: "Clear and accessible, avoiding unnecessary jargon",
              examples: {
                avoid: "\"Leverage our machine learning algorithms to optimize engagement matrices.\"",
                prefer: "\"Smart conversations that help visitors feel welcome and connected.\""
              }
            },
            {
              spectrum: "Reserved ←→ Enthusiastic",
              position: "60%", // Moderately enthusiastic
              description: "Genuinely excited about church growth, but not overwhelming",
              examples: {
                avoid: "\"VisionaryChurch.ai provides software solutions for religious organizations.\"",
                prefer: "\"We're passionate about helping churches build stronger, more connected communities.\""
              }
            }
          ].map((tone, index) => (
            <div key={index} className="card p-6">
              <h3 className="text-lg font-semibold mb-4">{tone.spectrum}</h3>
              <div className="relative mb-4">
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-gradient-brand rounded-full transition-all duration-300"
                    style={{ width: tone.position }}
                  ></div>
                </div>
                <div 
                  className="absolute top-0 w-4 h-4 bg-brand-primary-600 rounded-full transform -translate-y-1 -translate-x-2"
                  style={{ left: tone.position }}
                ></div>
              </div>
              <p className="text-gray-600 mb-4">{tone.description}</p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="text-red-700 font-medium mb-1">❌ Avoid:</div>
                  <div className="text-red-600 italic">{tone.examples.avoid}</div>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="text-green-700 font-medium mb-1">✅ Prefer:</div>
                  <div className="text-green-600 italic">{tone.examples.prefer}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Messages */}
      <section>
        <h2 className="text-3xl font-display font-bold mb-8">Key Messages</h2>
        
        {/* Value Propositions */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Core Value Propositions</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-brand p-6">
              <h4 className="font-semibold text-brand-primary-700 mb-3">Primary Message</h4>
              <p className="text-lg font-medium mb-2">
                "Turn website visitors into active church members with intelligent, personalized engagement."
              </p>
              <p className="text-sm text-gray-600">
                Use for: Hero sections, main CTAs, elevator pitches
              </p>
            </div>
            
            <div className="card p-6 border-l-4 border-brand-secondary-500">
              <h4 className="font-semibold text-brand-secondary-700 mb-3">Supporting Message</h4>
              <p className="text-lg font-medium mb-2">
                "AI-powered church management that respects your mission and amplifies your ministry."
              </p>
              <p className="text-sm text-gray-600">
                Use for: Feature descriptions, about sections, marketing materials
              </p>
            </div>
          </div>
        </div>

        {/* Feature Messaging */}
        <div className="space-y-6 mt-8">
          <h3 className="text-xl font-semibold">Feature Messaging Framework</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                feature: "AI Chat Widget",
                benefit: "24/7 visitor engagement",
                message: "Your church never sleeps. Neither does our AI.",
                context: "Always available, always welcoming"
              },
              {
                feature: "Visit Planning",
                benefit: "Streamlined first-time visitor experience", 
                message: "Make every first impression count.",
                context: "From curiosity to commitment"
              },
              {
                feature: "Prayer Requests",
                benefit: "Connected spiritual community",
                message: "Technology that brings hearts together.",
                context: "Sacred connections, digital simplicity"
              },
              {
                feature: "Analytics",
                benefit: "Data-driven ministry decisions",
                message: "See your impact, guide your mission.",
                context: "Wisdom through insights"
              }
            ].map((item) => (
              <div key={item.feature} className="card p-4 bg-gray-50">
                <h4 className="font-semibold text-sm mb-2">{item.feature}</h4>
                <p className="text-xs text-gray-600 mb-2">{item.benefit}</p>
                <div className="text-sm font-medium text-brand-primary-600 mb-1">
                  "{item.message}"
                </div>
                <div className="text-xs text-gray-500 italic">
                  {item.context}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Types & Examples */}
      <section>
        <h2 className="text-3xl font-display font-bold mb-8">Content Types & Examples</h2>
        
        {/* Website Copy */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Website Copy</h3>
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Headlines */}
              <div className="card p-6">
                <h4 className="font-semibold mb-3 text-brand-primary-700">Headlines</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-medium mb-1">Hero:</div>
                    <div className="text-sm">"Transform Church Visitors Into Lifelong Members"</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-medium mb-1">Feature:</div>
                    <div className="text-sm">"AI That Understands Your Congregation"</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-medium mb-1">Benefit:</div>
                    <div className="text-sm">"Never Miss a Connection Opportunity"</div>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="card p-6">
                <h4 className="font-semibold mb-3 text-brand-secondary-700">Call-to-Actions</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-medium mb-1">Primary:</div>
                    <div className="text-sm">"Start Your Free Trial"</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-medium mb-1">Secondary:</div>
                    <div className="text-sm">"See It in Action"</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-medium mb-1">Soft:</div>
                    <div className="text-sm">"Learn More About Our Mission"</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Communication */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Email Communication</h3>
            <div className="card p-6 bg-gray-50">
              <h4 className="font-semibold mb-3">Welcome Email Example</h4>
              <div className="bg-white p-4 rounded border space-y-3 text-sm">
                <p><strong>Subject:</strong> Welcome to VisionaryChurch.ai - Your Ministry Transformation Begins</p>
                
                <p>Dear [Pastor Name],</p>
                
                <p>Welcome to the VisionaryChurch.ai family! We're honored to be part of your church's digital ministry journey.</p>
                
                <p>Your free trial gives you full access to our AI-powered engagement platform. Here's what you can explore:</p>
                
                <ul className="list-disc pl-5 space-y-1">
                  <li>Set up your intelligent chat widget in under 5 minutes</li>
                  <li>Create personalized visitor follow-up sequences</li>
                  <li>Launch your first prayer request campaign</li>
                </ul>
                
                <p>Questions? Reply to this email - a real person (not our AI!) will get back to you within 24 hours.</p>
                
                <p>Blessings,<br/>The VisionaryChurch.ai Team</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voice Do's and Don'ts */}
      <section>
        <h2 className="text-3xl font-display font-bold mb-8">Voice Guidelines</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Do's */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-green-700">✅ Voice Do's</h3>
            <div className="card border-l-4 border-green-500 p-6 space-y-4">
              {[
                {
                  guideline: "Use inclusive language",
                  example: "\"Every church family\" instead of \"All churches\""
                },
                {
                  guideline: "Show understanding of church culture",
                  example: "\"We know Sunday mornings are sacred\" shows we get it"
                },
                {
                  guideline: "Lead with benefits, not features",
                  example: "\"Build deeper connections\" not \"Advanced AI algorithms\""
                },
                {
                  guideline: "Use active voice",
                  example: "\"Our platform helps you grow\" not \"Growth is facilitated\""
                },
                {
                  guideline: "Be specific with outcomes",
                  example: "\"Increase visitor return rate by 40%\" with real numbers"
                }
              ].map((item, index) => (
                <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                  <div className="font-medium text-green-800 mb-1">{item.guideline}</div>
                  <div className="text-sm text-gray-600 italic">{item.example}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Don'ts */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-red-700">❌ Voice Don'ts</h3>
            <div className="card border-l-4 border-red-500 p-6 space-y-4">
              {[
                {
                  guideline: "Don't use overly technical jargon",
                  example: "Avoid \"machine learning optimization\" - say \"smart technology\""
                },
                {
                  guideline: "Don't be pushy or aggressive",
                  example: "Not \"You MUST try this!\" - instead \"We'd love to show you\""
                },
                {
                  guideline: "Don't ignore the sacred context",
                  example: "Avoid casual references that might seem irreverent"
                },
                {
                  guideline: "Don't promise unrealistic outcomes",
                  example: "Not \"Transform overnight\" - say \"meaningful progress\""
                },
                {
                  guideline: "Don't use empty superlatives",
                  example: "Skip \"revolutionary game-changer\" - focus on real benefits"
                }
              ].map((item, index) => (
                <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                  <div className="font-medium text-red-800 mb-1">{item.guideline}</div>
                  <div className="text-sm text-gray-600 italic">{item.example}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Context-Specific Messaging */}
      <section>
        <h2 className="text-3xl font-display font-bold mb-8">Context-Specific Messaging</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              context: "Small Churches (50-200)",
              tone: "Personal, supportive, cost-conscious",
              message: "\"Grow your close-knit community with personal touch at scale\"",
              focus: ["Personal relationships", "Budget-friendly", "Easy to use", "Time-saving"]
            },
            {
              context: "Medium Churches (200-1000)", 
              tone: "Professional, growth-focused, efficiency-minded",
              message: "\"Scale your ministry impact without losing the personal connection\"",
              focus: ["Growth management", "Efficiency", "Scaling systems", "Team collaboration"]
            },
            {
              context: "Large Churches (1000+)",
              tone: "Strategic, data-driven, enterprise-focused", 
              message: "\"Enterprise-grade solutions for your expanding digital ministry\"",
              focus: ["Advanced analytics", "Integration capabilities", "Multi-campus support", "Custom solutions"]
            }
          ].map((item) => (
            <div key={item.context} className="card-brand p-6">
              <h3 className="font-semibold text-brand-primary-700 mb-2">{item.context}</h3>
              <p className="text-sm text-gray-600 mb-3">Tone: {item.tone}</p>
              <div className="text-sm font-medium text-brand-secondary-600 mb-4 italic">
                {item.message}
              </div>
              <div>
                <div className="text-xs font-medium text-gray-700 mb-2">Key Focus Areas:</div>
                <div className="flex flex-wrap gap-1">
                  {item.focus.map((focus) => (
                    <span key={focus} className="text-xs px-2 py-1 bg-brand-primary-100 text-brand-primary-700 rounded">
                      {focus}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default VoiceGuide