'use client'

import Button from '../ui/Button'

export function CTA() {
  return (
    <section className="py-24 bg-gradient-to-r from-primary-600 to-church-purple">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
          Ready to Transform Your Church's Visitor Experience?
        </h2>
        <p className="text-xl text-primary-100 max-w-3xl mx-auto mb-8">
          Join hundreds of churches already using VisionaryChurch.ai to grow their congregations.
          Start your free trial today and see the difference AI can make.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="secondary" size="lg">
            Start Free 14-Day Trial
          </Button>
          <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600">
            Schedule a Demo
          </Button>
        </div>

        <div className="mt-8 text-primary-100">
          <p className="text-sm">
            No credit card required • Setup in 5 minutes • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}