'use client'

import { motion } from 'framer-motion'
import { 
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  UserGroupIcon,
  BellIcon,
  ShieldCheckIcon,
  SparklesIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline'

export function Features() {
  const features = [
    {
      name: 'AI Chat Widget',
      description: 'Engage visitors 24/7 with intelligent conversations that answer questions and capture leads.',
      icon: ChatBubbleLeftRightIcon,
      color: 'from-blue-500 to-cyan-500',
      benefits: ['24/7 availability', 'Natural conversations', 'Lead capture', 'Multi-language support']
    },
    {
      name: 'Smart Visit Planning',
      description: 'Convert chat conversations into scheduled visits with automated follow-ups and reminders.',
      icon: CalendarDaysIcon,
      color: 'from-purple-500 to-pink-500',
      benefits: ['Automated scheduling', 'Email reminders', 'Staff notifications', 'Calendar integration']
    },
    {
      name: 'Analytics Dashboard',
      description: 'Track visitor engagement, conversion rates, and church growth with detailed insights.',
      icon: ChartBarIcon,
      color: 'from-green-500 to-emerald-500',
      benefits: ['Real-time metrics', 'Conversion tracking', 'Growth insights', 'Custom reports']
    },
    {
      name: 'Member Management',
      description: 'Organize visitor information, track engagement history, and nurture relationships.',
      icon: UserGroupIcon,
      color: 'from-orange-500 to-red-500',
      benefits: ['Visitor profiles', 'Engagement history', 'Automated follow-ups', 'Relationship tracking']
    },
    {
      name: 'Smart Notifications',
      description: 'Get instant alerts for new visitors, scheduled visits, and important church activities.',
      icon: BellIcon,
      color: 'from-indigo-500 to-purple-500',
      benefits: ['Instant alerts', 'Custom triggers', 'Multi-channel delivery', 'Priority filtering']
    },
    {
      name: 'Secure & Compliant',
      description: 'Enterprise-grade security with GDPR compliance and data protection built-in.',
      icon: ShieldCheckIcon,
      color: 'from-teal-500 to-blue-500',
      benefits: ['End-to-end encryption', 'GDPR compliant', 'Regular backups', 'Privacy controls']
    }
  ]

  const aiCapabilities = [
    {
      title: 'Natural Language Processing',
      description: 'Understands visitor questions in natural language and provides helpful responses.',
      icon: SparklesIcon
    },
    {
      title: 'Intent Recognition',
      description: 'Identifies visitor intentions and routes them to appropriate resources or staff.',
      icon: ChatBubbleLeftRightIcon
    },
    {
      title: 'Mobile Optimized',
      description: 'Works seamlessly across all devices with responsive design and touch-friendly interface.',
      icon: DevicePhoneMobileIcon
    }
  ]

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            Everything You Need to{' '}
            <span className="gradient-text">Grow Your Church</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform combines AI technology with proven church growth strategies 
            to help you connect with visitors and build lasting relationships.
          </p>
        </motion.div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 h-full">
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-6`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.name}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Benefits */}
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-3"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-church-purple/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Capabilities Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary-50 to-church-purple/10 rounded-3xl p-8 md:p-12"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-4">
              Powered by Advanced AI Technology
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI doesn't just respond to visitors—it understands them, learns from interactions, 
              and continuously improves to serve your church better.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {aiCapabilities.map((capability, index) => (
              <motion.div
                key={capability.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex p-4 rounded-2xl bg-white shadow-sm mb-4">
                  <capability.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {capability.title}
                </h4>
                <p className="text-gray-600">
                  {capability.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Ready to Transform Your Visitor Experience?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of churches already using VisionaryChurch.ai to grow their congregations 
            and build meaningful connections with every visitor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary">
              Start Your Free Trial
            </button>
            <button className="btn-outline">
              Schedule a Demo
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}