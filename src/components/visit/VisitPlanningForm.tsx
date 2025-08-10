'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import {
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  HeartIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { cn } from '@/lib/utils'
import type { ServiceTime, Visitor } from '@/types'

interface VisitPlanningFormProps {
  services?: ServiceTime[]
  onSubmit?: (data: Partial<Visitor>) => void
  onSuccess?: () => void
}

const defaultServices: ServiceTime[] = [
  {
    id: '1',
    dayOfWeek: 0, // Sunday
    time: '09:00',
    name: 'First Service',
    description: 'Traditional worship with hymns and choir'
  },
  {
    id: '2',
    dayOfWeek: 0, // Sunday
    time: '11:00',
    name: 'Second Service',
    description: 'Contemporary worship with modern music'
  },
  {
    id: '3',
    dayOfWeek: 3, // Wednesday
    time: '19:00',
    name: 'Evening Service',
    description: 'Casual midweek gathering'
  }
]

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  partySize: number
  kidsCount: number
  selectedServiceId: string
  specialNeeds: string
  interests: string[]
}

const VisitPlanningForm: React.FC<VisitPlanningFormProps> = ({
  services = defaultServices,
  onSubmit,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    getValues
  } = useForm<FormData>({
    defaultValues: {
      partySize: 2,
      kidsCount: 0,
      interests: []
    }
  })

  const totalSteps = 3
  const selectedServiceId = watch('selectedServiceId')
  const selectedService = services.find(s => s.id === selectedServiceId)

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[dayOfWeek]
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour12 = parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours)
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM'
    return `${hour12 === 0 ? 12 : hour12}:${minutes} ${ampm}`
  }

  const interestOptions = [
    'Small Groups',
    'Youth Ministry',
    'Children\'s Programs',
    'Music Ministry',
    'Community Outreach',
    'Bible Study',
    'Volunteer Opportunities',
    'Senior Ministry'
  ]

  const onFormSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const visitorData: Partial<Visitor> = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      partySize: data.partySize,
      kidsCount: data.kidsCount,
      selectedService: selectedService!,
      visitDate: getNextServiceDate(selectedService!),
      status: 'pending',
      notes: `Special needs: ${data.specialNeeds || 'None'}\nInterests: ${data.interests.join(', ') || 'None'}`
    }
    
    onSubmit?.(visitorData)
    setIsSubmitting(false)
    setIsSubmitted(true)
    onSuccess?.()
  }

  const getNextServiceDate = (service: ServiceTime): Date => {
    const today = new Date()
    const daysUntilService = (service.dayOfWeek + 7 - today.getDay()) % 7 || 7
    const nextServiceDate = new Date(today)
    nextServiceDate.setDate(today.getDate() + daysUntilService)
    return nextServiceDate
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInterestChange = (interest: string, checked: boolean) => {
    const currentInterests = getValues('interests') || []
    if (checked) {
      setValue('interests', [...currentInterests, interest])
    } else {
      setValue('interests', currentInterests.filter(i => i !== interest))
    }
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          We Can't Wait to Meet You!
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Thank you for planning your visit. We've sent a confirmation email with all the details, 
          including directions and what to expect.
        </p>
        <div className="bg-primary-50 rounded-2xl p-6 max-w-md mx-auto mb-8">
          <h3 className="font-semibold text-primary-900 mb-2">Your Visit Details</h3>
          {selectedService && (
            <div className="text-sm text-primary-800">
              <p><strong>{selectedService.name}</strong></p>
              <p>{getDayName(selectedService.dayOfWeek)} at {formatTime(selectedService.time)}</p>
              <p>{getNextServiceDate(selectedService).toLocaleDateString()}</p>
            </div>
          )}
        </div>
        <Button onClick={() => window.location.reload()}>
          Plan Another Visit
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <AnimatePresence mode="wait">
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <CalendarDaysIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Choose Your Service
                </h2>
                <p className="text-gray-600">
                  Select the service you'd like to attend for your first visit.
                </p>
              </div>

              <div className="grid gap-4">
                {services.map((service) => (
                  <label
                    key={service.id}
                    className={cn(
                      'relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
                      selectedServiceId === service.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                    )}
                  >
                    <input
                      type="radio"
                      value={service.id}
                      {...register('selectedServiceId', { required: 'Please select a service' })}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {formatTime(service.time)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                      <p className="text-sm font-medium text-primary-600">
                        {getDayName(service.dayOfWeek)}s
                      </p>
                    </div>
                    {selectedServiceId === service.id && (
                      <CheckCircleIcon className="h-5 w-5 text-primary-600 ml-4" />
                    )}
                  </label>
                ))}
              </div>
              
              {errors.selectedServiceId && (
                <p className="text-red-600 text-sm">{errors.selectedServiceId.message}</p>
              )}
            </motion.div>
          )}

          {/* Step 2: Party Information */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <UserGroupIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Tell Us About Your Group
                </h2>
                <p className="text-gray-600">
                  Help us prepare for your visit and ensure we have everything ready.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Select
                  label="How many people will be attending?"
                  options={Array.from({ length: 10 }, (_, i) => ({
                    value: (i + 1).toString(),
                    label: `${i + 1} ${i === 0 ? 'person' : 'people'}`
                  }))}
                  {...register('partySize', { required: 'Please select party size' })}
                  error={errors.partySize?.message}
                />

                <Select
                  label="How many children will you bring?"
                  options={Array.from({ length: 6 }, (_, i) => ({
                    value: i.toString(),
                    label: i === 0 ? 'No children' : `${i} ${i === 1 ? 'child' : 'children'}`
                  }))}
                  {...register('kidsCount')}
                  error={errors.kidsCount?.message}
                />
              </div>

              <Input
                label="Special needs or accommodations"
                placeholder="Wheelchair access, hearing assistance, dietary restrictions, etc."
                {...register('specialNeeds')}
              />

              <div>
                <label className="label mb-4">What are you interested in learning about?</label>
                <div className="grid md:grid-cols-2 gap-3">
                  {interestOptions.map((interest) => (
                    <label key={interest} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        onChange={(e) => handleInterestChange(interest, e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Contact Information */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <HeartIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  We're Excited to Meet You!
                </h2>
                <p className="text-gray-600">
                  Just a few details so we can send you confirmation and directions.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  {...register('firstName', { required: 'First name is required' })}
                  error={errors.firstName?.message}
                />

                <Input
                  label="Last Name"
                  {...register('lastName', { required: 'Last name is required' })}
                  error={errors.lastName?.message}
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address'
                  }
                })}
                error={errors.email?.message}
              />

              <Input
                label="Phone Number"
                type="tel"
                {...register('phone', { required: 'Phone number is required' })}
                error={errors.phone?.message}
              />

              {selectedService && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Visit Summary</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Service:</strong> {selectedService.name}</p>
                    <p><strong>Time:</strong> {getDayName(selectedService.dayOfWeek)} at {formatTime(selectedService.time)}</p>
                    <p><strong>Date:</strong> {getNextServiceDate(selectedService).toLocaleDateString()}</p>
                    <p><strong>Party Size:</strong> {watch('partySize')} people</p>
                    {watch('kidsCount') > 0 && (
                      <p><strong>Children:</strong> {watch('kidsCount')}</p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            type="button"
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={currentStep === 1 && !selectedServiceId}
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              loading={isSubmitting}
            >
              Confirm Visit
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default VisitPlanningForm