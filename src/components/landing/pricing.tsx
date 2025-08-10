'use client'

import Button from '../ui/Button'
import { CheckIcon } from '@heroicons/react/24/outline'

export function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      description: 'Perfect for small churches getting started',
      features: [
        'AI Chat Widget',
        'Basic Analytics',
        'Up to 100 visitors/month',
        'Email Support',
        'Visit Scheduling'
      ],
      buttonText: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Growth',
      price: '$79',
      period: '/month',
      description: 'Ideal for growing churches with active outreach',
      features: [
        'Everything in Starter',
        'Advanced Analytics',
        'Up to 500 visitors/month',
        'Priority Support',
        'Custom Branding',
        'SMS Notifications',
        'Multi-staff Access'
      ],
      buttonText: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large churches with advanced needs',
      features: [
        'Everything in Growth',
        'Unlimited Visitors',
        'Dedicated Support',
        'Custom Integrations',
        'Advanced Security',
        'White-label Solution',
        'Training & Onboarding'
      ],
      buttonText: 'Contact Sales',
      popular: false
    }
  ]

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your church's needs. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl border-2 p-8 ${
                plan.popular 
                  ? 'border-primary-500 shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-primary-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <CheckIcon className="w-5 h-5 text-primary-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? 'primary' : 'outline'}
                className="w-full"
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  )
}