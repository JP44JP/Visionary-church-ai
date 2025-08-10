'use client'

import React from 'react'
import StyleGuide from '@/components/brand/StyleGuide'
import VoiceGuide from '@/components/brand/VoiceGuide'

export default function BrandDemoPage() {
  const [activeTab, setActiveTab] = React.useState<'style' | 'voice'>('style')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-display font-bold text-gray-900">
              VisionaryChurch.ai Brand System
            </h1>
            
            {/* Tab Navigation */}
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setActiveTab('style')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'style'
                    ? 'bg-white text-brand-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Visual Identity
              </button>
              <button
                onClick={() => setActiveTab('voice')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'voice'
                    ? 'bg-white text-brand-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Voice & Messaging
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        {activeTab === 'style' && <StyleGuide />}
        {activeTab === 'voice' && <VoiceGuide />}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-600 text-sm">
            This brand system is designed to create consistent, meaningful experiences 
            across all VisionaryChurch.ai touchpoints.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            For questions or brand asset requests, contact: brand@visionarychurch.ai
          </p>
        </div>
      </div>
    </div>
  )
}