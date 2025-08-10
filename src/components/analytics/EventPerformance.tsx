'use client';

import React from 'react';
import { CalendarDaysIcon, UserGroupIcon, TrendingUpIcon } from '@heroicons/react/24/outline';
import { EventMetrics } from '../../types/analytics';
import { format } from 'date-fns';
import { clsx } from 'clsx';

interface EventPerformanceProps {
  data: EventMetrics;
  loading?: boolean;
}

export function EventPerformance({ data, loading = false }: EventPerformanceProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-36 mb-4"></div>
          <div className="space-y-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const registrationRate = data.total_events > 0 ? 
    (data.total_registrations / data.total_events) : 0;
  const attendanceRate = data.total_registrations > 0 ? 
    (data.total_attendance / data.total_registrations * 100) : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Event Performance</h3>
          <p className="text-sm text-gray-600">
            Registration and attendance metrics
          </p>
        </div>
        <CalendarDaysIcon className="h-8 w-8 text-gray-400" />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{data.total_events}</div>
          <div className="text-sm text-blue-800">Total Events</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{attendanceRate.toFixed(1)}%</div>
          <div className="text-sm text-green-800">Attendance Rate</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserGroupIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Registrations</div>
              <div className="text-xs text-gray-500">Total event sign-ups</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {data.total_registrations.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              Avg {registrationRate.toFixed(1)} per event
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUpIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Attendance</div>
              <div className="text-xs text-gray-500">Actual attendees</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {data.total_attendance.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              {data.avg_attendance_rate.toFixed(1)}% avg rate
            </div>
          </div>
        </div>
      </div>

      {/* Popular Event Types */}
      {data.popular_event_types.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Popular Event Types</h4>
          <div className="space-y-2">
            {data.popular_event_types.slice(0, 5).map((eventType, index) => (
              <div key={eventType.type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={clsx(
                    'w-2 h-2 rounded-full',
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-yellow-500' :
                    index === 3 ? 'bg-purple-500' : 'bg-gray-500'
                  )}></div>
                  <span className="text-sm text-gray-700 capitalize">
                    {eventType.type.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {eventType.count.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      {data.upcoming_events.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Upcoming Events</h4>
          <div className="space-y-2">
            {data.upcoming_events.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div>
                  <div className="text-sm font-medium text-gray-900">{event.title}</div>
                  <div className="text-xs text-gray-500 capitalize">
                    {event.event_type.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  {format(new Date(event.start_date), 'MMM d')}
                </div>
              </div>
            ))}
          </div>
          
          {data.upcoming_events.length > 3 && (
            <div className="mt-3 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all {data.upcoming_events.length} events
              </button>
            </div>
          )}
        </div>
      )}

      {data.total_events === 0 && (
        <div className="text-center py-8">
          <CalendarDaysIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No events data available</p>
        </div>
      )}
    </div>
  );
}