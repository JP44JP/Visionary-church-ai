// Visit Planning Form Component
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { format, addDays, parse } from 'date-fns';
import toast from 'react-hot-toast';

interface ServiceTime {
  id: string;
  name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  description?: string;
  service_type: string;
  capacity: number;
  special_notes?: string;
  location: string;
  next_occurrences: {
    date: string;
    datetime: string;
    available_spots: number;
    is_full: boolean;
  }[];
}

interface VisitPlanData {
  service_time_id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone?: string;
  planned_date: string;
  party_size: number;
  adults_count: number;
  children_count: number;
  children_ages: number[];
  special_needs?: string;
  dietary_restrictions?: string;
  wheelchair_accessible: boolean;
  parking_assistance: boolean;
  childcare_needed: boolean;
  preferred_contact_method: 'email' | 'phone' | 'sms';
  contact_time_preference?: string;
  referrer_name?: string;
  lead_source: string;
}

interface VisitPlanningFormProps {
  onSuccess?: (visitPlan: any) => void;
  prefillData?: Partial<VisitPlanData>;
  chatConversationId?: string;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function VisitPlanningForm({ onSuccess, prefillData, chatConversationId }: VisitPlanningFormProps) {
  const [services, setServices] = useState<ServiceTime[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceTime | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm<VisitPlanData>({
    defaultValues: {
      party_size: 1,
      adults_count: 1,
      children_count: 0,
      children_ages: [],
      wheelchair_accessible: false,
      parking_assistance: false,
      childcare_needed: false,
      preferred_contact_method: 'email',
      lead_source: 'website',
      ...prefillData
    }
  });

  const partySize = watch('party_size');
  const childrenCount = watch('children_count');
  const adultsCount = watch('adults_count');

  // Load available services
  useEffect(() => {
    loadServices();
  }, []);

  // Update adults count when party size changes
  useEffect(() => {
    if (partySize && childrenCount !== undefined) {
      const newAdultsCount = Math.max(1, partySize - childrenCount);
      setValue('adults_count', newAdultsCount);
    }
  }, [partySize, childrenCount, setValue]);

  const loadServices = async () => {
    try {
      const startDate = format(new Date(), 'yyyy-MM-dd');
      const endDate = format(addDays(new Date(), 90), 'yyyy-MM-dd');
      
      const response = await fetch(`/api/visits/services?start_date=${startDate}&end_date=${endDate}&visitor_friendly_only=true`);
      const data = await response.json();
      
      if (data.success) {
        setServices(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Failed to load available services');
    }
  };

  const handleServiceSelection = (service: ServiceTime, date: string) => {
    setSelectedService(service);
    setSelectedDate(date);
    setValue('service_time_id', service.id);
    setValue('planned_date', date);
    setStep(2);
  };

  const onSubmit = async (data: VisitPlanData) => {
    setLoading(true);
    try {
      const submitData = {
        ...data,
        chat_conversation_id: chatConversationId
      };

      const response = await fetch('/api/visits/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || 'Visit planned successfully!');
        onSuccess?.(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error creating visit plan:', error);
      toast.error(error.message || 'Failed to plan visit');
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Plan Your Visit</h2>
          <p className="text-lg text-gray-600">Choose a service time that works for you</p>
        </div>

        <div className="space-y-8">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {DAYS_OF_WEEK[service.day_of_week]}s
                      </span>
                      <span className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {service.start_time} - {service.end_time}
                      </span>
                      <span className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {service.location}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {service.service_type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                {service.description && (
                  <p className="mt-2 text-gray-600">{service.description}</p>
                )}
                {service.special_notes && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">{service.special_notes}</p>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Available Dates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {service.next_occurrences.map((occurrence) => (
                    <button
                      key={occurrence.date}
                      onClick={() => handleServiceSelection(service, occurrence.date)}
                      disabled={occurrence.is_full}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        occurrence.is_full
                          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                      }`}
                    >
                      <div className="font-medium">
                        {format(new Date(occurrence.date), 'EEEE, MMM d')}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {occurrence.is_full ? (
                          <span className="text-red-600">Full</span>
                        ) : (
                          <span className="text-green-600">
                            {occurrence.available_spots} spots available
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <button
          onClick={() => setStep(1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to service selection
        </button>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Visit Details</h2>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900">{selectedService?.name}</h3>
            <p className="text-blue-800">
              {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')} at {selectedService?.start_time}
            </p>
            <p className="text-sm text-blue-700">{selectedService?.location}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Contact Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                {...register('visitor_name', { required: 'Name is required' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your full name"
              />
              {errors.visitor_name && (
                <p className="mt-1 text-sm text-red-600">{errors.visitor_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                {...register('visitor_email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
              {errors.visitor_email && (
                <p className="mt-1 text-sm text-red-600">{errors.visitor_email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                {...register('visitor_phone')}
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Contact Method
              </label>
              <select
                {...register('preferred_contact_method')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="sms">Text/SMS</option>
              </select>
            </div>
          </div>
        </div>

        {/* Party Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Party Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Party Size *
              </label>
              <input
                {...register('party_size', {
                  required: 'Party size is required',
                  min: { value: 1, message: 'Minimum 1 person' },
                  max: { value: 20, message: 'Maximum 20 people' }
                })}
                type="number"
                min="1"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.party_size && (
                <p className="mt-1 text-sm text-red-600">{errors.party_size.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adults
              </label>
              <input
                {...register('adults_count', { min: 1 })}
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Children
              </label>
              <input
                {...register('children_count', {
                  min: 0,
                  max: { value: partySize - 1, message: 'Too many children for party size' }
                })}
                type="number"
                min="0"
                max={partySize - 1}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {childrenCount > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Children's Ages
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: childrenCount }, (_, i) => (
                  <div key={i}>
                    <label className="block text-xs text-gray-600 mb-1">Child {i + 1}</label>
                    <Controller
                      name={`children_ages.${i}`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="0"
                          max="18"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Age"
                        />
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Special Needs & Preferences */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Needs & Preferences</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                {...register('wheelchair_accessible')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700">
                I need wheelchair accessible seating
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                {...register('parking_assistance')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700">
                I would like parking assistance
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                {...register('childcare_needed')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700">
                I need childcare during the service
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Needs or Requests
              </label>
              <textarea
                {...register('special_needs')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any special accommodations or requests..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dietary Restrictions (for events with food)
              </label>
              <input
                {...register('dietary_restrictions')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., vegetarian, gluten-free, allergies..."
              />
            </div>
          </div>
        </div>

        {/* How did you hear about us */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How Did You Hear About Us?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <select
                {...register('lead_source')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="website">Website</option>
                <option value="friend">Friend/Referral</option>
                <option value="social_media">Social Media</option>
                <option value="google">Google Search</option>
                <option value="drive_by">Drove by the church</option>
                <option value="community_event">Community Event</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referred by (if applicable)
              </label>
              <input
                {...register('referrer_name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Name of person who referred you"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Planning Your Visit...
              </>
            ) : (
              'Plan My Visit'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}