// Visit Confirmation Component
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  CheckCircleIcon, 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon,
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface VisitConfirmationProps {
  token?: string;
  visitId?: string;
}

interface VisitPlan {
  id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone?: string;
  planned_date: string;
  party_size: number;
  adults_count: number;
  children_count: number;
  status: string;
  service_times: {
    name: string;
    start_time: string;
    end_time: string;
    location: string;
    special_notes?: string;
  };
  special_needs?: string;
  dietary_restrictions?: string;
  wheelchair_accessible: boolean;
  parking_assistance: boolean;
  childcare_needed: boolean;
}

export default function VisitConfirmation({ token, visitId }: VisitConfirmationProps) {
  const [visit, setVisit] = useState<VisitPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (token) {
      confirmVisitByToken();
    } else if (visitId) {
      loadVisitDetails();
    }
  }, [token, visitId]);

  const confirmVisitByToken = async () => {
    try {
      const response = await fetch(`/api/visits/confirm/${token}`);
      const data = await response.json();

      if (data.success) {
        setVisit(data.data);
        setConfirmed(true);
        toast.success('Visit confirmed successfully!');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error confirming visit:', error);
      setError(error.message || 'Failed to confirm visit');
    } finally {
      setLoading(false);
    }
  };

  const loadVisitDetails = async () => {
    try {
      const response = await fetch(`/api/visits/${visitId}`);
      const data = await response.json();

      if (data.success) {
        setVisit(data.data);
        setConfirmed(data.data.status === 'confirmed');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error loading visit details:', error);
      setError(error.message || 'Failed to load visit details');
    } finally {
      setLoading(false);
    }
  };

  const confirmVisit = async () => {
    if (!visitId) return;

    setConfirming(true);
    try {
      const response = await fetch(`/api/visits/${visitId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'confirmed' }),
      });

      const data = await response.json();

      if (data.success) {
        setVisit(data.data);
        setConfirmed(true);
        toast.success('Visit confirmed successfully!');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error confirming visit:', error);
      toast.error(error.message || 'Failed to confirm visit');
    } finally {
      setConfirming(false);
    }
  };

  const downloadCalendar = async () => {
    if (!visit) return;

    try {
      const response = await fetch(`/api/visits/${visit.id}/calendar`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `church-visit-${visit.id}.ics`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Calendar file downloaded!');
      } else {
        throw new Error('Failed to download calendar');
      }
    } catch (error) {
      console.error('Error downloading calendar:', error);
      toast.error('Failed to download calendar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading visit details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Visit Not Found</h1>
          <p className="text-gray-600">The visit you're looking for could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          {confirmed ? (
            <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
          ) : (
            <CalendarIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {confirmed ? 'Visit Confirmed!' : 'Confirm Your Visit'}
          </h1>
          <p className="text-lg text-gray-600">
            {confirmed 
              ? "Thank you for confirming your visit. We're excited to meet you!"
              : "Please review your visit details and confirm your attendance."
            }
          </p>
        </div>

        {/* Visit Details Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-blue-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Visit Details</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Service Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Service Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{visit.service_times.name}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(visit.planned_date), 'EEEE, MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <ClockIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-gray-900">
                        {visit.service_times.start_time} - {visit.service_times.end_time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-gray-900">{visit.service_times.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <UserGroupIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{visit.visitor_name}</p>
                      <p className="text-sm text-gray-600">
                        Party of {visit.party_size} ({visit.adults_count} adults, {visit.children_count} children)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <p className="text-gray-900">{visit.visitor_email}</p>
                  </div>

                  {visit.visitor_phone && (
                    <div className="flex items-center">
                      <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <p className="text-gray-900">{visit.visitor_phone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Special Notes */}
            {visit.service_times.special_notes && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Service Notes</h4>
                <p className="text-blue-800 text-sm">{visit.service_times.special_notes}</p>
              </div>
            )}

            {/* Special Accommodations */}
            {(visit.special_needs || visit.wheelchair_accessible || visit.parking_assistance || visit.childcare_needed) && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Special Accommodations</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    {visit.wheelchair_accessible && (
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2" />
                        Wheelchair accessible seating requested
                      </div>
                    )}
                    {visit.parking_assistance && (
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2" />
                        Parking assistance requested
                      </div>
                    )}
                    {visit.childcare_needed && (
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2" />
                        Childcare requested
                      </div>
                    )}
                    {visit.special_needs && (
                      <div className="text-sm text-gray-700">
                        <p className="font-medium mb-1">Additional requests:</p>
                        <p>{visit.special_needs}</p>
                      </div>
                    )}
                    {visit.dietary_restrictions && (
                      <div className="text-sm text-gray-700">
                        <p className="font-medium mb-1">Dietary restrictions:</p>
                        <p>{visit.dietary_restrictions}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Visit Status</h3>
                  <div className="flex items-center mt-2">
                    {confirmed ? (
                      <>
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-green-600 font-medium">Confirmed</span>
                      </>
                    ) : (
                      <>
                        <ClockIcon className="w-5 h-5 text-yellow-600 mr-2" />
                        <span className="text-yellow-600 font-medium">Awaiting Confirmation</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={downloadCalendar}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Add to Calendar
                  </button>

                  {!confirmed && (
                    <button
                      onClick={confirmVisit}
                      disabled={confirming}
                      className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {confirming ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Confirming...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          Confirm My Visit
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What to Expect */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">What to Expect</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <MapPinIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-2">Easy to Find</h3>
                <p className="text-sm text-gray-600">
                  Look for our welcoming team members who will help you find parking and get oriented.
                </p>
              </div>

              <div className="text-center">
                <UserGroupIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-2">Friendly Welcome</h3>
                <p className="text-sm text-gray-600">
                  Our volunteer team will greet you at the door and help answer any questions you might have.
                </p>
              </div>

              <div className="text-center">
                <ClockIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-2">Come as You Are</h3>
                <p className="text-sm text-gray-600">
                  We believe church should be accessible to everyone. Dress comfortably and feel at home.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                Have questions before your visit? We're here to help!
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href="tel:+1234567890"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <PhoneIcon className="w-4 h-4 mr-1" />
                  Call us
                </a>
                <a
                  href="mailto:info@church.com"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <EnvelopeIcon className="w-4 h-4 mr-1" />
                  Email us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}