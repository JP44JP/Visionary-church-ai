'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PlayIcon, CheckIcon } from '@heroicons/react/24/solid'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

const HeroSection: React.FC = () => {
  const [showVideo, setShowVideo] = useState(false)

  const benefits = [
    'Turn website visitors into church members',
    'AI-powered visitor engagement',
    'Seamless calendar integration',
    'Real-time conversation tracking'
  ]

  return (
    <section className="relative bg-gradient-to-br from-primary-50 to-church-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-church-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 mb-6">
              <span className="w-2 h-2 bg-primary-400 rounded-full mr-2 animate-pulse"></span>
              AI-Powered Church Growth
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Connect Your{' '}
              <span className="bg-gradient-to-r from-primary-600 to-church-600 bg-clip-text text-transparent">
                Community
              </span>
              <br />
              Like Never Before
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Transform your website visitors into engaged church members with our intelligent AI assistant. 
              Streamline visit planning, answer questions, and build meaningful connections automatically.
            </p>

            {/* Benefits */}
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="flex items-center text-gray-700"
                >
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button size="xl" className="shadow-lg">
                Start Free Trial
              </Button>
              <Button 
                variant="outline" 
                size="xl"
                onClick={() => setShowVideo(true)}
                className="shadow-sm"
              >
                <PlayIcon className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="text-sm text-gray-500">
              <p>Trusted by 500+ churches nationwide</p>
            </div>
          </motion.div>

          {/* Hero Image/Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 lg:p-8">
              {/* Chat Interface Preview */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 pb-4 border-b">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-church-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">AI</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Church Assistant</p>
                    <p className="text-sm text-green-500">Online</p>
                  </div>
                </div>
                
                {/* Sample Messages */}
                <div className="space-y-3">
                  <div className="flex">
                    <div className="bg-gray-100 rounded-2xl px-4 py-2 max-w-xs">
                      <p className="text-sm text-gray-700">Hi! What time are your Sunday services?</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="bg-primary-600 text-white rounded-2xl px-4 py-2 max-w-xs">
                      <p className="text-sm">We have services at 9 AM and 11 AM. Would you like me to help you plan a visit?</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="bg-gray-100 rounded-2xl px-4 py-2 max-w-xs">
                      <p className="text-sm text-gray-700">Yes, that would be great!</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="bg-primary-600 text-white rounded-2xl px-4 py-2 max-w-xs">
                      <p className="text-sm">Perfect! Let me gather some details to make your visit special...</p>
                    </div>
                  </div>
                </div>
                
                {/* Typing Indicator */}
                <div className="flex">
                  <div className="bg-gray-100 rounded-2xl px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Stats */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600">85%</p>
                  <p className="text-xs text-gray-600">Conversion Rate</p>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">24/7</p>
                  <p className="text-xs text-gray-600">Available</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      <Modal
        isOpen={showVideo}
        onClose={() => setShowVideo(false)}
        title="Product Demo"
        size="xl"
      >
        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
          <div className="text-white text-center">
            <PlayIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-300">Demo video placeholder</p>
            <p className="text-sm text-gray-500 mt-2">
              Video content would be embedded here
            </p>
          </div>
        </div>
      </Modal>
    </section>
  )
}

export default HeroSection