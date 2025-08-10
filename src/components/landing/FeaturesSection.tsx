'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Intelligent Chat Assistant',
    description: 'AI-powered conversations that understand your church and can answer questions about services, beliefs, and community activities.',
    icon: ChatBubbleLeftRightIcon,
    color: 'primary'
  },
  {
    name: 'Seamless Visit Planning',
    description: 'Automatically collect visitor information, preferences, and schedule their first visit with calendar integration.',
    icon: CalendarDaysIcon,
    color: 'church'
  },
  {
    name: 'Analytics Dashboard',
    description: 'Track visitor engagement, conversion rates, and popular service times to optimize your outreach strategy.',
    icon: ChartBarIcon,
    color: 'green'
  },
  {
    name: 'Custom Configuration',
    description: 'Tailor the experience to match your church brand, values, and specific service offerings.',
    icon: CogIcon,
    color: 'purple'
  },
  {
    name: 'Community Building',
    description: 'Connect visitors with small groups, ministries, and volunteer opportunities that match their interests.',
    icon: UserGroupIcon,
    color: 'indigo'
  },
  {
    name: 'Smart Automation',
    description: 'Automated follow-ups, reminders, and personalized messages to nurture visitor relationships.',
    icon: SparklesIcon,
    color: 'pink'
  }
]

const colorMap = {
  primary: 'text-primary-600 bg-primary-100',
  church: 'text-church-600 bg-church-100',
  green: 'text-green-600 bg-green-100',
  purple: 'text-purple-600 bg-purple-100',
  indigo: 'text-indigo-600 bg-indigo-100',
  pink: 'text-pink-600 bg-pink-100'
}

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-primary-600 to-church-600 bg-clip-text text-transparent">
              Grow Your Church
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools you need to engage visitors, 
            streamline communication, and build a thriving church community.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200"
            >
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl ${colorMap[feature.color as keyof typeof colorMap]} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-6 w-6" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                {feature.name}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-church-50 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary-50 to-church-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Church's Online Presence?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join hundreds of churches already using VisionaryChurch AI to connect with their community 
              and grow their congregation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">Start Free Trial</button>
              <button className="btn-outline">Schedule Demo</button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturesSection