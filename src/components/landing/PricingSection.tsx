'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { PricingTier } from '@/types'

const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    price: 49,
    period: 'month',
    cta: 'Start Free Trial',
    features: [
      'Up to 100 monthly conversations',
      'Basic visitor form collection',
      'Email notifications',
      'Standard chat widget',
      '2 service time slots',
      'Basic analytics dashboard',
      'Email support'
    ]
  },
  {
    name: 'Growth',
    price: 99,
    period: 'month',
    cta: 'Start Free Trial',
    highlighted: true,
    features: [
      'Up to 500 monthly conversations',
      'Advanced visitor management',
      'Calendar integration',
      'Custom branded widget',
      'Unlimited service times',
      'Advanced analytics & reports',
      'Ministry matching features',
      'SMS notifications',
      'Priority support'
    ]
  },
  {
    name: 'Enterprise',
    price: 199,
    period: 'month',
    cta: 'Contact Sales',
    features: [
      'Unlimited conversations',
      'Multi-campus support',
      'Custom integrations',
      'White-label solution',
      'Advanced automation',
      'Custom AI training',
      'Dedicated account manager',
      'Phone support',
      'Custom reporting',
      'API access'
    ]
  }
]

const PricingSection: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const getPrice = (price: number) => {
    return billingPeriod === 'yearly' ? Math.round(price * 0.8) : price
  }

  const getSavings = (price: number) => {
    return billingPeriod === 'yearly' ? Math.round(price * 0.2 * 12) : 0
  }

  return (
    <section id="pricing" className="py-20 bg-gray-50">
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
            Simple, Transparent{' '}
            <span className="bg-gradient-to-r from-primary-600 to-church-600 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your church. All plans include a 14-day free trial 
            and can be cancelled anytime.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
                billingPeriod === 'monthly'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 relative',
                billingPeriod === 'yearly'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
              )}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                20% off
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-4">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={cn(
                'relative bg-white rounded-2xl shadow-lg border transition-all duration-300',
                tier.highlighted
                  ? 'border-primary-200 ring-2 ring-primary-100 scale-105'
                  : 'border-gray-200 hover:shadow-xl hover:border-primary-100'
              )}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      ${getPrice(tier.price)}
                    </span>
                    <span className="text-gray-600 ml-1">/{tier.period}</span>
                  </div>
                  {billingPeriod === 'yearly' && getSavings(tier.price) > 0 && (
                    <p className="text-green-600 text-sm mt-2">
                      Save ${getSavings(tier.price)}/year
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={tier.highlighted ? 'primary' : 'outline'}
                  size="lg"
                  className="w-full"
                >
                  {tier.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h4>
              <p className="text-gray-600 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">What's included in the free trial?</h4>
              <p className="text-gray-600 text-sm">
                All plans include a 14-day free trial with full access to features. No credit card required to start.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">Do you offer custom pricing?</h4>
              <p className="text-gray-600 text-sm">
                Yes, we offer custom pricing for large churches, denominations, and multi-campus organizations.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">Is my data secure?</h4>
              <p className="text-gray-600 text-sm">
                Absolutely. We use enterprise-grade security and are GDPR compliant. Your data is never shared.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default PricingSection