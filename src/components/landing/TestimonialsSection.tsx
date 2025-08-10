'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { StarIcon } from '@heroicons/react/24/solid'
import type { Testimonial } from '@/types'

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Pastor Michael Johnson',
    role: 'Senior Pastor',
    church: 'Grace Community Church',
    content: 'VisionaryChurch AI has completely transformed how we connect with visitors. We\'ve seen a 300% increase in first-time visitor follow-through since implementing it. The AI conversations feel natural and truly represent our church values.',
    rating: 5,
    avatar: '/api/placeholder/64/64'
  },
  {
    id: '2',
    name: 'Sarah Williams',
    role: 'Outreach Director',
    church: 'First Baptist Downtown',
    content: 'The analytics dashboard gives us incredible insights into our visitor engagement. We can see exactly what questions people ask most and optimize our communication strategy. It\'s like having a dedicated outreach team working 24/7.',
    rating: 5,
    avatar: '/api/placeholder/64/64'
  },
  {
    id: '3',
    name: 'Pastor David Chen',
    role: 'Lead Pastor',
    church: 'New Life Fellowship',
    content: 'What impressed me most is how the AI understands our specific theology and ministry focus. It doesn\'t give generic responses - it truly represents our church\'s heart and vision to every visitor.',
    rating: 5,
    avatar: '/api/placeholder/64/64'
  },
  {
    id: '4',
    name: 'Maria Rodriguez',
    role: 'Communications Manager',
    church: 'Hope Valley Church',
    content: 'The setup was incredibly easy and our congregation loves the modern touch it brings to our website. Visitors appreciate getting immediate answers to their questions, especially about childcare and accessibility.',
    rating: 5,
    avatar: '/api/placeholder/64/64'
  },
  {
    id: '5',
    name: 'Pastor James Thompson',
    role: 'Senior Pastor',
    church: 'Community Bible Church',
    content: 'Since implementing VisionaryChurch AI, we\'ve welcomed 40% more first-time visitors to our services. The personal touch it adds to our digital presence has been a game-changer for our church growth.',
    rating: 5,
    avatar: '/api/placeholder/64/64'
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    role: 'Ministry Coordinator',
    church: 'Crossroads Fellowship',
    content: 'The ministry matching feature is brilliant. New visitors are automatically connected with relevant small groups and volunteer opportunities based on their interests. It\'s streamlined our entire visitor integration process.',
    rating: 5,
    avatar: '/api/placeholder/64/64'
  }
]

const TestimonialsSection: React.FC = () => {
  return (
    <section id="testimonials" className="py-20 bg-white">
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
            Trusted by{' '}
            <span className="bg-gradient-to-r from-primary-600 to-church-600 bg-clip-text text-transparent">
              Church Leaders
            </span>{' '}
            Nationwide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how churches of all sizes are using VisionaryChurch AI to grow their communities 
            and create meaningful connections with visitors.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
            <div className="text-gray-600">Churches</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">50K+</div>
            <div className="text-gray-600">Conversations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">85%</div>
            <div className="text-gray-600">Conversion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">4.9/5</div>
            <div className="text-gray-600">Customer Rating</div>
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-church-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-semibold text-sm">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-primary-600">{testimonial.church}</div>
                </div>
              </div>
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
          <div className="bg-gradient-to-r from-primary-600 to-church-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Join 500+ Churches Growing Their Community
            </h3>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Start your free trial today and see how VisionaryChurch AI can transform 
              your church's visitor experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
                Start Free Trial
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
                Schedule Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default TestimonialsSection