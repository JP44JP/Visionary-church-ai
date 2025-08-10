'use client'

import React, { useState, useEffect } from 'react'
import { X, Settings, Check, Info } from 'lucide-react'

interface CookiePreferences {
  essential: boolean
  analytics: boolean
  functional: boolean
  marketing: boolean
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    analytics: false,
    functional: false,
    marketing: false
  })

  useEffect(() => {
    // Check if user has already made a choice
    const consentChoice = localStorage.getItem('visionarychurch-cookie-consent')
    if (!consentChoice) {
      setShowBanner(true)
    } else {
      const savedPreferences = JSON.parse(consentChoice)
      setPreferences(savedPreferences)
    }
  }, [])

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('visionarychurch-cookie-consent', JSON.stringify({
      ...prefs,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }))
    setPreferences(prefs)
    setShowBanner(false)
    setShowPreferences(false)
    
    // Dispatch event for analytics and other services to listen to
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { 
      detail: prefs 
    }))
  }

  const acceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      functional: true,
      marketing: true
    })
  }

  const acceptEssential = () => {
    savePreferences({
      essential: true,
      analytics: false,
      functional: false,
      marketing: false
    })
  }

  const handlePreferenceChange = (category: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [category]: category === 'essential' ? true : value // Essential always true
    }))
  }

  const CookieCategory = ({ 
    title, 
    description, 
    category, 
    required = false,
    examples 
  }: { 
    title: string
    description: string
    category: keyof CookiePreferences
    required?: boolean
    examples?: string[]
  }) => (
    <div className="border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          {required && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
              Required
            </span>
          )}
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={preferences[category]}
            onChange={(e) => handlePreferenceChange(category, e.target.checked)}
            disabled={required}
            className="sr-only"
          />
          <div className={`w-11 h-6 rounded-full transition-colors ${
            preferences[category] 
              ? 'bg-blue-600' 
              : 'bg-gray-200'
          } ${required ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
              preferences[category] ? 'translate-x-5' : 'translate-x-0.5'
            } mt-0.5`} />
          </div>
        </label>
      </div>
      <p className="text-sm text-gray-600 mb-2">{description}</p>
      {examples && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Examples:</p>
          <ul className="text-xs text-gray-500 list-disc list-inside space-y-1">
            {examples.map((example, index) => (
              <li key={index}>{example}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  if (!showBanner) return null

  return (
    <>
      {/* Cookie Consent Banner */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg transform transition-transform duration-300 ${
        showBanner ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    We use cookies to enhance your experience
                  </h3>
                  <p className="text-sm text-gray-600">
                    We use cookies to provide essential website functionality, analyze usage to improve our services, 
                    and enhance your experience. You can customize your preferences or accept all cookies.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    By clicking "Accept All" you agree to our{' '}
                    <a href="/cookies" className="text-blue-600 hover:text-blue-800 underline">
                      Cookie Policy
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <button
                onClick={() => setShowPreferences(true)}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Settings className="h-4 w-4 mr-2" />
                Customize
              </button>
              <button
                onClick={acceptEssential}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Essential Only
              </button>
              <button
                onClick={acceptAll}
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Check className="h-4 w-4 mr-2" />
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowPreferences(false)}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900" id="modal-title">
                    Cookie Preferences
                  </h3>
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-600">
                    Manage your cookie preferences below. You can change these settings at any time, 
                    but please note that disabling some cookies may impact your experience on our website.
                  </p>
                </div>

                <div className="space-y-4">
                  <CookieCategory
                    title="Essential Cookies"
                    description="These cookies are necessary for the website to function properly and cannot be disabled. They enable core functionality like security, authentication, and basic site operations."
                    category="essential"
                    required={true}
                    examples={[
                      "User authentication and session management",
                      "Security and fraud prevention",
                      "Website functionality and navigation",
                      "Remembering your cookie preferences"
                    ]}
                  />

                  <CookieCategory
                    title="Analytics Cookies"
                    description="These cookies help us understand how visitors interact with our website by collecting anonymous information about usage patterns, popular pages, and site performance."
                    category="analytics"
                    examples={[
                      "Page views and user interactions",
                      "Website performance metrics",
                      "Error tracking and debugging",
                      "Feature usage analytics"
                    ]}
                  />

                  <CookieCategory
                    title="Functional Cookies"
                    description="These cookies enable enhanced functionality and personalization features. They remember your choices and preferences to provide a more personalized experience."
                    category="functional"
                    examples={[
                      "Language and region preferences",
                      "User interface customizations",
                      "Saved form data and drafts",
                      "Feature tour progress"
                    ]}
                  />

                  <CookieCategory
                    title="Marketing Cookies"
                    description="These cookies are used to deliver relevant advertisements and track the effectiveness of our marketing campaigns. They help us show you content that might be of interest to you."
                    category="marketing"
                    examples={[
                      "Advertising personalization",
                      "Marketing campaign effectiveness",
                      "Social media integration",
                      "Third-party advertising services"
                    ]}
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => savePreferences(preferences)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save Preferences
                </button>
                <button
                  onClick={acceptAll}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Accept All
                </button>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Hook to use cookie preferences in other components
export function useCookiePreferences() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    functional: false,
    marketing: false
  })

  useEffect(() => {
    // Load initial preferences
    const consentChoice = localStorage.getItem('visionarychurch-cookie-consent')
    if (consentChoice) {
      const savedPreferences = JSON.parse(consentChoice)
      setPreferences(savedPreferences)
    }

    // Listen for preference changes
    const handleConsentChange = (event: CustomEvent) => {
      setPreferences(event.detail)
    }

    window.addEventListener('cookieConsentChanged', handleConsentChange as EventListener)
    
    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange as EventListener)
    }
  }, [])

  return preferences
}

// Component for cookie settings page
export function CookieSettings() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    functional: false,
    marketing: false
  })

  useEffect(() => {
    const consentChoice = localStorage.getItem('visionarychurch-cookie-consent')
    if (consentChoice) {
      const savedPreferences = JSON.parse(consentChoice)
      setPreferences(savedPreferences)
    }
  }, [])

  const savePreferences = () => {
    localStorage.setItem('visionarychurch-cookie-consent', JSON.stringify({
      ...preferences,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }))
    
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { 
      detail: preferences 
    }))

    // Show success message
    alert('Cookie preferences saved successfully!')
  }

  const handlePreferenceChange = (category: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [category]: category === 'essential' ? true : value
    }))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Cookie Settings</h1>
        
        <div className="mb-8">
          <p className="text-gray-600">
            Manage your cookie preferences for VisionaryChurch.ai. Changes will take effect immediately 
            and apply to your future visits to our website.
          </p>
        </div>

        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Essential Cookies</h3>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">Required</span>
              </div>
              <div className="w-11 h-6 bg-gray-400 rounded-full relative opacity-50">
                <div className="w-5 h-5 bg-white rounded-full shadow-md transform translate-x-5 mt-0.5" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              These cookies are necessary for the website to function properly and cannot be disabled.
            </p>
            <div className="bg-gray-50 p-3 rounded text-xs text-gray-600">
              <strong>Used for:</strong> Authentication, security, basic site functionality, cookie preferences
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Analytics Cookies</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  preferences.analytics ? 'bg-blue-600' : 'bg-gray-200'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    preferences.analytics ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`} />
                </div>
              </label>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Help us understand how visitors interact with our website through anonymous usage analytics.
            </p>
            <div className="bg-gray-50 p-3 rounded text-xs text-gray-600">
              <strong>Used for:</strong> Page views, user interactions, performance metrics, error tracking
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Functional Cookies</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) => handlePreferenceChange('functional', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  preferences.functional ? 'bg-blue-600' : 'bg-gray-200'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    preferences.functional ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`} />
                </div>
              </label>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Enable enhanced functionality and personalization features for a better user experience.
            </p>
            <div className="bg-gray-50 p-3 rounded text-xs text-gray-600">
              <strong>Used for:</strong> Language preferences, UI customizations, saved form data, feature tours
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Marketing Cookies</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  preferences.marketing ? 'bg-blue-600' : 'bg-gray-200'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    preferences.marketing ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`} />
                </div>
              </label>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Allow us to deliver relevant content and track marketing campaign effectiveness.
            </p>
            <div className="bg-gray-50 p-3 rounded text-xs text-gray-600">
              <strong>Used for:</strong> Personalized content, marketing campaigns, social media integration
            </div>
          </div>
        </div>

        <div className="mt-8 flex space-x-4">
          <button
            onClick={savePreferences}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save Preferences
          </button>
          <button
            onClick={() => setPreferences({
              essential: true,
              analytics: true,
              functional: true,
              marketing: true
            })}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Accept All
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Need more information?</h4>
          <p className="text-sm text-blue-800">
            Visit our{' '}
            <a href="/cookies" className="underline hover:text-blue-900">Cookie Policy</a>{' '}
            for detailed information about how we use cookies, or our{' '}
            <a href="/privacy" className="underline hover:text-blue-900">Privacy Policy</a>{' '}
            for comprehensive information about data protection.
          </p>
        </div>
      </div>
    </div>
  )
}