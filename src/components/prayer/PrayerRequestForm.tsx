'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { PrayerRequestForm as PrayerFormType } from '../../types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { TextArea } from '../ui/TextArea'
import { Select } from '../ui/Select'
import { Checkbox } from '../ui/Checkbox'
import { Alert } from '../ui/Alert'
import { Card } from '../ui/Card'

const prayerRequestSchema = z.object({
  requester_name: z.string().max(100).optional(),
  requester_email: z.string().email('Please enter a valid email').optional(),
  requester_phone: z.string().max(20).optional(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(2000),
  category: z.enum([
    'healing', 'guidance', 'thanksgiving', 'family', 'financial', 
    'relationships', 'grief', 'addiction', 'mental_health', 
    'spiritual_growth', 'salvation', 'protection', 'employment', 
    'travel', 'other'
  ], { required_error: 'Please select a category' }),
  urgency: z.enum(['routine', 'urgent', 'emergency'], { required_error: 'Please select urgency level' }),
  privacy_level: z.enum(['public', 'prayer_team_only', 'leadership_only', 'private']),
  is_anonymous: z.boolean(),
  allow_updates: z.boolean(),
  consent_to_contact: z.boolean(),
  consent_to_store: z.boolean().refine(val => val === true, 'You must consent to store your information')
})

interface PrayerRequestFormProps {
  churchId: string
  onSuccess?: (requestId: string) => void
  onError?: (error: string) => void
  embedded?: boolean
  className?: string
}

const CATEGORY_OPTIONS = [
  { value: 'healing', label: 'Healing' },
  { value: 'guidance', label: 'Guidance & Direction' },
  { value: 'thanksgiving', label: 'Thanksgiving & Praise' },
  { value: 'family', label: 'Family & Relationships' },
  { value: 'financial', label: 'Financial Needs' },
  { value: 'grief', label: 'Grief & Loss' },
  { value: 'addiction', label: 'Addiction & Recovery' },
  { value: 'mental_health', label: 'Mental Health' },
  { value: 'spiritual_growth', label: 'Spiritual Growth' },
  { value: 'salvation', label: 'Salvation' },
  { value: 'protection', label: 'Protection & Safety' },
  { value: 'employment', label: 'Employment & Career' },
  { value: 'travel', label: 'Travel Safety' },
  { value: 'other', label: 'Other' }
]

const URGENCY_OPTIONS = [
  { value: 'routine', label: 'Routine', description: 'Standard prayer request' },
  { value: 'urgent', label: 'Urgent', description: 'Needs prompt attention within 24 hours' },
  { value: 'emergency', label: 'Emergency', description: 'Crisis situation requiring immediate prayer' }
]

const PRIVACY_OPTIONS = [
  { value: 'public', label: 'Public', description: 'Can be shared publicly for prayer' },
  { value: 'prayer_team_only', label: 'Prayer Team Only', description: 'Only prayer team members can see this' },
  { value: 'leadership_only', label: 'Leadership Only', description: 'Only church leadership can see this' },
  { value: 'private', label: 'Private', description: 'Only you and assigned prayer partner can see this' }
]

export function PrayerRequestForm({ 
  churchId, 
  onSuccess, 
  onError,
  embedded = false,
  className = ''
}: PrayerRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue
  } = useForm<PrayerFormType>({
    defaultValues: {
      privacy_level: 'prayer_team_only',
      urgency: 'routine',
      is_anonymous: false,
      allow_updates: true,
      consent_to_contact: false,
      consent_to_store: false
    }
  })

  const isAnonymous = watch('is_anonymous')
  const urgency = watch('urgency')

  const onSubmit = async (data: PrayerFormType) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Validate the form data
      prayerRequestSchema.parse(data)

      const response = await fetch('/api/prayers/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          church_id: churchId
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit prayer request')
      }

      setSubmitSuccess(true)
      reset()
      onSuccess?.(result.data.id)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit prayer request'
      setSubmitError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Prayer Request Submitted</h3>
          <p className="text-gray-600 mb-4">
            Thank you for sharing your prayer request. Our prayer team will be praying for you.
          </p>
          {!isAnonymous && (
            <p className="text-sm text-gray-500">
              You will receive updates on your request via email.
            </p>
          )}
          <Button 
            variant="outline" 
            onClick={() => {
              setSubmitSuccess(false)
              reset()
            }}
            className="mt-4"
          >
            Submit Another Request
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit a Prayer Request</h2>
        <p className="text-gray-600">
          Share your prayer needs with our caring prayer team. All requests are handled with confidentiality and care.
        </p>
      </div>

      {submitError && (
        <Alert variant="error" className="mb-6">
          {submitError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Anonymous Option */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <Checkbox
            {...register('is_anonymous')}
            label="Submit anonymously"
            description="Your name and contact information will not be stored or shared"
          />
        </div>

        {/* Contact Information */}
        {!isAnonymous && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
            
            <Input
              {...register('requester_name')}
              label="Your Name"
              placeholder="Enter your full name"
              error={errors.requester_name?.message}
            />

            <Input
              {...register('requester_email')}
              type="email"
              label="Email Address"
              placeholder="your.email@example.com"
              error={errors.requester_email?.message}
              required
            />

            <Input
              {...register('requester_phone')}
              type="tel"
              label="Phone Number (Optional)"
              placeholder="(555) 123-4567"
              error={errors.requester_phone?.message}
            />
          </div>
        )}

        {/* Prayer Request Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Prayer Request Details</h3>
          
          <Input
            {...register('title')}
            label="Request Title"
            placeholder="Brief description of your prayer need"
            error={errors.title?.message}
            required
          />

          <TextArea
            {...register('description')}
            label="Prayer Request"
            placeholder="Please share the details of your prayer request. Be as specific as you'd like."
            rows={5}
            error={errors.description?.message}
            required
          />

          <Select
            {...register('category')}
            label="Category"
            options={CATEGORY_OPTIONS}
            error={errors.category?.message}
            required
          />
        </div>

        {/* Urgency and Privacy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency Level *
            </label>
            <div className="space-y-2">
              {URGENCY_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-start space-x-3">
                  <input
                    type="radio"
                    value={option.value}
                    {...register('urgency')}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
            {errors.urgency && (
              <p className="mt-1 text-sm text-red-600">{errors.urgency.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privacy Level *
            </label>
            <div className="space-y-2">
              {PRIVACY_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-start space-x-3">
                  <input
                    type="radio"
                    value={option.value}
                    {...register('privacy_level')}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
            {errors.privacy_level && (
              <p className="mt-1 text-sm text-red-600">{errors.privacy_level.message}</p>
            )}
          </div>
        </div>

        {/* Emergency Notice */}
        {urgency === 'emergency' && (
          <Alert variant="warning">
            <strong>Emergency Request:</strong> This will immediately notify our emergency prayer team and leadership. 
            If you are in immediate physical danger, please call 911 or your local emergency services.
          </Alert>
        )}

        {/* Preferences */}
        {!isAnonymous && (
          <div className="space-y-3">
            <Checkbox
              {...register('allow_updates')}
              label="Allow follow-up communication"
              description="Receive updates and follow-up messages about your prayer request"
            />

            <Checkbox
              {...register('consent_to_contact')}
              label="Consent to contact"
              description="Allow our prayer team to contact you via phone or email if needed"
            />
          </div>
        )}

        {/* Required Consent */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <Checkbox
            {...register('consent_to_store')}
            label="I consent to storing my prayer request"
            description="Required: Your prayer request will be stored securely and shared only according to your privacy settings"
            error={errors.consent_to_store?.message}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? 'Submitting Prayer Request...' : 'Submit Prayer Request'}
          </Button>
        </div>

        {/* Privacy Notice */}
        <div className="text-xs text-gray-500 text-center">
          Your privacy is important to us. Prayer requests are handled according to your selected privacy level 
          and are never shared outside our church without explicit consent.
        </div>
      </form>
    </Card>
  )
}