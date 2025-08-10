'use client'

import React from 'react'
import Header from '@/components/layout/Header'
import VisitPlanningForm from '@/components/visit/VisitPlanningForm'

export default function VisitPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header showAuth={false} />
      
      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Plan Your Visit
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're excited to welcome you to our church! Let us know when you'd like to visit 
              and we'll make sure everything is ready for you.
            </p>
          </div>

          {/* Visit Planning Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <VisitPlanningForm
              onSubmit={(data) => {
                console.log('Visit planned:', data)
                // Handle form submission
              }}
              onSuccess={() => {
                console.log('Visit planning completed')
              }}
            />
          </div>
        </div>
      </main>
    </div>
  )
}