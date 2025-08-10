'use client';

import React, { useState } from 'react';
import { EventStatsResponse, EventWithDetails } from '../../types/events';
import { 
  CalendarIcon, 
  UsersIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';
import EventCard from './EventCard';

interface EventDashboardProps {
  stats: EventStatsResponse;
  recentEvents: EventWithDetails[];
  upcomingEvents: EventWithDetails[];
  onCreateEvent: () => void;
  onViewAllEvents: () => void;
  onEventClick: (eventId: string) => void;
  onEventEdit: (eventId: string) => void;
  loading?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'indigo';
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color, 
  subtitle 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-md ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-center">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {change !== undefined && (
              <span className={`ml-2 text-sm font-medium ${
                change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
              }`}>
                {change > 0 && '+'}
                {change}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function EventDashboard({
  stats,
  recentEvents,
  upcomingEvents,
  onCreateEvent,
  onViewAllEvents,
  onEventClick,
  onEventEdit,
  loading = false,
}: EventDashboardProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'recent'>('upcoming');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-96 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your church events and track attendance
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <button
            onClick={onViewAllEvents}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View All Events
          </button>
          <button
            onClick={onCreateEvent}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Event
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Events"
          value={stats.totalEvents}
          icon={CalendarIcon}
          color="blue"
          subtitle={`${stats.activeEvents} active`}
        />
        <StatCard
          title="Upcoming Events"
          value={stats.upcomingEvents}
          icon={ClockIcon}
          color="yellow"
        />
        <StatCard
          title="Total Attendees"
          value={stats.totalAttendees.toLocaleString()}
          icon={UsersIcon}
          color="green"
          subtitle={`${stats.averageAttendanceRate.toFixed(1)}% avg attendance`}
        />
        <StatCard
          title="Revenue This Month"
          value={`$${stats.revenueThisMonth.toLocaleString()}`}
          icon={CurrencyDollarIcon}
          color="indigo"
        />
      </div>

      {/* Popular Event Types */}
      {stats.popularEventTypes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Popular Event Types</h2>
            <ChartPieIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.popularEventTypes.slice(0, 6).map((eventType, index) => (
              <div key={eventType.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-yellow-500' :
                    index === 3 ? 'bg-red-500' :
                    index === 4 ? 'bg-purple-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {eventType.type.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{eventType.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
            {upcomingEvents.length > 3 && (
              <button
                onClick={onViewAllEvents}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All
              </button>
            )}
          </div>
          
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming events</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new event.</p>
              <div className="mt-4">
                <button
                  onClick={onCreateEvent}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Create Event
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.slice(0, 3).map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onView={onEventClick}
                  onEdit={onEventEdit}
                  compact
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Events</h2>
            {recentEvents.length > 3 && (
              <button
                onClick={onViewAllEvents}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All
              </button>
            )}
          </div>
          
          {recentEvents.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent events</h3>
              <p className="mt-1 text-sm text-gray-500">Recent events will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="relative">
                  <EventCard
                    event={event}
                    onView={onEventClick}
                    onEdit={onEventEdit}
                    compact
                  />
                  {/* Event completion indicator */}
                  <div className="absolute top-2 right-2">
                    {event.status === 'completed' && (
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                    {event.status === 'cancelled' && (
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={onCreateEvent}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <PlusIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Create Event</p>
              <p className="text-sm text-gray-500">Plan a new event</p>
            </div>
          </button>

          <button
            onClick={onViewAllEvents}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <CalendarIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">View Calendar</p>
              <p className="text-sm text-gray-500">See all events</p>
            </div>
          </button>

          <button
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <ChartBarIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Analytics</p>
              <p className="text-sm text-gray-500">View reports</p>
            </div>
          </button>

          <button
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <UsersIcon className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Volunteers</p>
              <p className="text-sm text-gray-500">Manage helpers</p>
            </div>
          </button>
        </div>
      </div>

      {/* Alerts and Notifications */}
      {(upcomingEvents.some(e => !e.registrations?.length && e.registration_required) ||
        upcomingEvents.some(e => e.volunteers?.filter(v => v.status === 'confirmed').length === 0)) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Attention Needed</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  {upcomingEvents
                    .filter(e => !e.registrations?.length && e.registration_required)
                    .slice(0, 3)
                    .map(event => (
                      <li key={event.id}>
                        "{event.title}" has no registrations yet
                      </li>
                    ))}
                  {upcomingEvents
                    .filter(e => e.volunteers?.filter(v => v.status === 'confirmed').length === 0)
                    .slice(0, 2)
                    .map(event => (
                      <li key={`vol-${event.id}`}>
                        "{event.title}" needs volunteers
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}