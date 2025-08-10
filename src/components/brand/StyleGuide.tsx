'use client'

import React from 'react'
import Logo from './Logo'

const StyleGuide: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-16">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-5xl font-display font-bold gradient-text mb-4">
          VisionaryChurch.ai Brand Guide
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Our brand identity reflects innovation, trust, and spiritual sensitivity. 
          Every element is designed to connect with forward-thinking churches while honoring traditional values.
        </p>
      </div>

      {/* Brand Values */}
      <section>
        <h2 className="text-3xl font-display font-bold mb-8">Brand Values</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Innovation",
              description: "Cutting-edge AI technology that enhances church ministry",
              color: "bg-brand-primary-500",
              icon: "🚀"
            },
            {
              title: "Trust",
              description: "Reliable, secure platform that churches can depend on",
              color: "bg-brand-secondary-500", 
              icon: "🛡️"
            },
            {
              title: "Community",
              description: "Fostering connections and building stronger congregations",
              color: "bg-brand-supporting-500",
              icon: "🤝"
            },
            {
              title: "Growth",
              description: "Empowering churches to reach and engage more people",
              color: "bg-brand-accent-500",
              icon: "🌱"
            }
          ].map((value) => (
            <div key={value.title} className="card-brand p-6 text-center">
              <div className={`w-12 h-12 ${value.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <span className="text-2xl">{value.icon}</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
              <p className="text-gray-600 text-sm">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Logo System */}
      <section>
        <h2 className="text-3xl font-display font-bold mb-8">Logo System</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Full Logo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Full Logo</h3>
            <div className="card p-8 bg-gray-50 flex items-center justify-center">
              <Logo variant="full" size="lg" />
            </div>
            <p className="text-sm text-gray-600">Primary logo for headers, marketing materials</p>
          </div>

          {/* Icon Only */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Icon Only</h3>
            <div className="card p-8 bg-gray-50 flex items-center justify-center">
              <Logo variant="icon" size="lg" />
            </div>
            <p className="text-sm text-gray-600">For favicons, app icons, social profiles</p>
          </div>

          {/* Stacked Version */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stacked</h3>
            <div className="card p-8 bg-gray-50 flex items-center justify-center">
              <Logo variant="stacked" size="md" />
            </div>
            <p className="text-sm text-gray-600">For square formats, business cards</p>
          </div>

          {/* Dark Background */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">On Dark</h3>
            <div className="card p-8 bg-gray-900 flex items-center justify-center">
              <Logo variant="full" size="lg" theme="light" />
            </div>
            <p className="text-sm text-gray-600">For dark backgrounds, footers</p>
          </div>
        </div>
      </section>

      {/* Color Palette */}
      <section>
        <h2 className="text-3xl font-display font-bold mb-8">Color Palette</h2>
        
        {/* Primary Colors */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Primary Brand Colors</h3>
          <div className="grid md:grid-cols-4 gap-6">
            
            {/* Celestial Blue */}
            <div className="space-y-3">
              <h4 className="font-medium">Celestial Blue</h4>
              <div className="space-y-2">
                {[
                  { name: 'Blue 50', value: '#EFF6FF', class: 'bg-brand-primary-50' },
                  { name: 'Blue 500', value: '#3B82F6', class: 'bg-brand-primary-500' },
                  { name: 'Blue 600', value: '#2563EB', class: 'bg-brand-primary-600' },
                  { name: 'Blue 900', value: '#1E3A8A', class: 'bg-brand-primary-900' }
                ].map((color) => (
                  <div key={color.name} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded ${color.class}`}></div>
                    <div className="flex-1">
                      <div className="font-mono text-xs">{color.value}</div>
                      <div className="text-xs text-gray-500">{color.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sacred Purple */}
            <div className="space-y-3">
              <h4 className="font-medium">Sacred Purple</h4>
              <div className="space-y-2">
                {[
                  { name: 'Purple 50', value: '#FAF5FF', class: 'bg-brand-secondary-50' },
                  { name: 'Purple 500', value: '#A855F7', class: 'bg-brand-secondary-500' },
                  { name: 'Purple 600', value: '#9333EA', class: 'bg-brand-secondary-600' },
                  { name: 'Purple 900', value: '#581C87', class: 'bg-brand-secondary-900' }
                ].map((color) => (
                  <div key={color.name} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded ${color.class}`}></div>
                    <div className="flex-1">
                      <div className="font-mono text-xs">{color.value}</div>
                      <div className="text-xs text-gray-500">{color.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Divine Gold */}
            <div className="space-y-3">
              <h4 className="font-medium">Divine Gold</h4>
              <div className="space-y-2">
                {[
                  { name: 'Gold 50', value: '#FFFBEB', class: 'bg-brand-accent-50' },
                  { name: 'Gold 500', value: '#F59E0B', class: 'bg-brand-accent-500' },
                  { name: 'Gold 600', value: '#D97706', class: 'bg-brand-accent-600' },
                  { name: 'Gold 900', value: '#78350F', class: 'bg-brand-accent-900' }
                ].map((color) => (
                  <div key={color.name} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded ${color.class}`}></div>
                    <div className="flex-1">
                      <div className="font-mono text-xs">{color.value}</div>
                      <div className="text-xs text-gray-500">{color.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Peaceful Teal */}
            <div className="space-y-3">
              <h4 className="font-medium">Peaceful Teal</h4>
              <div className="space-y-2">
                {[
                  { name: 'Teal 50', value: '#F0FDFA', class: 'bg-brand-supporting-50' },
                  { name: 'Teal 500', value: '#14B8A6', class: 'bg-brand-supporting-500' },
                  { name: 'Teal 600', value: '#0D9488', class: 'bg-brand-supporting-600' },
                  { name: 'Teal 900', value: '#134E4A', class: 'bg-brand-supporting-900' }
                ].map((color) => (
                  <div key={color.name} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded ${color.class}`}></div>
                    <div className="flex-1">
                      <div className="font-mono text-xs">{color.value}</div>
                      <div className="text-xs text-gray-500">{color.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Color Usage */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <div className="card p-6 border-l-4 border-brand-primary-500">
            <h4 className="font-semibold text-brand-primary-700 mb-2">Primary Blue</h4>
            <p className="text-sm text-gray-600">
              Trust, innovation, main CTAs, links, primary actions
            </p>
          </div>
          <div className="card p-6 border-l-4 border-brand-secondary-500">
            <h4 className="font-semibold text-brand-secondary-700 mb-2">Sacred Purple</h4>
            <p className="text-sm text-gray-600">
              Worship features, reverence, premium offerings, spirituality
            </p>
          </div>
          <div className="card p-6 border-l-4 border-brand-accent-500">
            <h4 className="font-semibold text-brand-accent-700 mb-2">Divine Gold</h4>
            <p className="text-sm text-gray-600">
              Growth metrics, success states, highlights, achievements
            </p>
          </div>
          <div className="card p-6 border-l-4 border-brand-supporting-500">
            <h4 className="font-semibold text-brand-supporting-700 mb-2">Peaceful Teal</h4>
            <p className="text-sm text-gray-600">
              Community features, calm states, secondary actions
            </p>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="text-3xl font-display font-bold mb-8">Typography</h2>
        <div className="space-y-8">
          
          {/* Font Families */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Primary Font - Inter</h3>
              <div className="card p-6 bg-gray-50">
                <div className="font-sans space-y-2">
                  <p className="text-3xl font-light">Inter Light</p>
                  <p className="text-2xl font-normal">Inter Regular</p>
                  <p className="text-2xl font-medium">Inter Medium</p>
                  <p className="text-2xl font-semibold">Inter Semibold</p>
                  <p className="text-2xl font-bold">Inter Bold</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Used for UI text, body copy, navigation</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Display Font - Outfit</h3>
              <div className="card p-6 bg-gray-50">
                <div className="font-display space-y-2">
                  <p className="text-3xl font-light">Outfit Light</p>
                  <p className="text-2xl font-normal">Outfit Regular</p>
                  <p className="text-2xl font-medium">Outfit Medium</p>
                  <p className="text-2xl font-semibold">Outfit Semibold</p>
                  <p className="text-2xl font-bold">Outfit Bold</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Used for headlines, hero text, marketing copy</p>
            </div>
          </div>

          {/* Typography Scale */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Typography Scale</h3>
            <div className="space-y-6">
              <div className="card p-6 bg-gray-50 space-y-4">
                <h1 className="text-6xl font-display font-bold">Display XL</h1>
                <h2 className="text-5xl font-display font-bold">Display Large</h2>
                <h3 className="text-4xl font-display font-bold">Display Medium</h3>
                <h4 className="text-3xl font-display font-semibold">Heading 1</h4>
                <h5 className="text-2xl font-display font-semibold">Heading 2</h5>
                <h6 className="text-xl font-display font-semibold">Heading 3</h6>
                <p className="text-lg">Large body text</p>
                <p className="text-base">Regular body text</p>
                <p className="text-sm">Small text</p>
                <p className="text-xs">Caption text</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Button System */}
      <section>
        <h2 className="text-3xl font-display font-bold mb-8">Button System</h2>
        <div className="space-y-8">
          
          {/* Button Variants */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Button Variants</h3>
            <div className="flex flex-wrap gap-4">
              <button className="btn-brand btn-md">Brand Primary</button>
              <button className="btn-primary btn-md">Primary</button>
              <button className="btn-secondary btn-md">Secondary</button>
              <button className="btn-outline-brand btn-md">Outline Brand</button>
              <button className="btn-outline btn-md">Outline</button>
              <button className="btn-ghost btn-md">Ghost</button>
            </div>
          </div>

          {/* Church Context Buttons */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Church Context Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <button className="btn-worship btn-md">Worship</button>
              <button className="btn-community btn-md">Community</button>
              <button className="btn-growth btn-md">Growth</button>
            </div>
          </div>

          {/* Button Sizes */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Button Sizes</h3>
            <div className="flex items-center gap-4">
              <button className="btn-brand btn-xs">Extra Small</button>
              <button className="btn-brand btn-sm">Small</button>
              <button className="btn-brand btn-md">Medium</button>
              <button className="btn-brand btn-lg">Large</button>
              <button className="btn-brand btn-xl">Extra Large</button>
            </div>
          </div>
        </div>
      </section>

      {/* Component Examples */}
      <section>
        <h2 className="text-3xl font-display font-bold mb-8">Component Examples</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Standard Card */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Standard Card</h3>
            <p className="text-gray-600 mb-4">Clean, professional card design with subtle shadows and rounded corners.</p>
            <button className="btn-primary btn-sm">Learn More</button>
          </div>

          {/* Brand Card */}
          <div className="card-brand">
            <h3 className="text-lg font-semibold mb-2">Brand Card</h3>
            <p className="text-gray-600 mb-4">Enhanced card with brand gradient and accent borders.</p>
            <button className="btn-brand btn-sm">Get Started</button>
          </div>

          {/* Interactive Card */}
          <div className="card-interactive">
            <h3 className="text-lg font-semibold mb-2">Interactive Card</h3>
            <p className="text-gray-600 mb-4">Hover effects and brand color transitions for engaging interactions.</p>
            <button className="btn-outline-brand btn-sm">Explore</button>
          </div>
        </div>
      </section>

      {/* Usage Guidelines */}
      <section>
        <h2 className="text-3xl font-display font-bold mb-8">Usage Guidelines</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Do's */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-green-700">✅ Do</h3>
            <div className="card border-l-4 border-green-500 p-6 space-y-3">
              <ul className="space-y-2 text-gray-700">
                <li>• Use consistent spacing and typography hierarchy</li>
                <li>• Maintain color contrast ratios for accessibility</li>
                <li>• Apply brand colors meaningfully and purposefully</li>
                <li>• Keep logo proportions and clear space</li>
                <li>• Use animations subtly to enhance UX</li>
                <li>• Test components across different screen sizes</li>
                <li>• Respect church traditions while embracing innovation</li>
              </ul>
            </div>
          </div>

          {/* Don'ts */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-red-700">❌ Don't</h3>
            <div className="card border-l-4 border-red-500 p-6 space-y-3">
              <ul className="space-y-2 text-gray-700">
                <li>• Stretch or distort the logo</li>
                <li>• Use brand colors on insufficient contrast backgrounds</li>
                <li>• Mix multiple button styles in the same context</li>
                <li>• Override typography hierarchy without purpose</li>
                <li>• Use animations that distract from content</li>
                <li>• Combine too many accent colors in one view</li>
                <li>• Use language that excludes or alienates</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default StyleGuide