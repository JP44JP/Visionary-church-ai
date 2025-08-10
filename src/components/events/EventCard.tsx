'use client';

import React from 'react';
import { Event, EventStatus } from '../../types/events';
import { CalendarIcon, MapPinIcon, UsersIcon, ClockIcon } from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';

interface EventCardProps {
  event: Event;
  onRegister?: (eventId: string) => void;
  onEdit?: (eventId: string) => void;
  onView?: (eventId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

const statusColors: Record<EventStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  postponed: 'bg-yellow-100 text-yellow-800',
};

const eventTypeColors: Record<string, string> = {
  worship: 'bg-purple-100 text-purple-800',
  bible_study: 'bg-blue-100 text-blue-800',
  prayer: 'bg-indigo-100 text-indigo-800',
  fellowship: 'bg-green-100 text-green-800',
  outreach: 'bg-orange-100 text-orange-800',
  youth: 'bg-pink-100 text-pink-800',
  children: 'bg-yellow-100 text-yellow-800',
  ministry: 'bg-teal-100 text-teal-800',
  special: 'bg-red-100 text-red-800',
  conference: 'bg-gray-100 text-gray-800',
  retreat: 'bg-emerald-100 text-emerald-800',
  wedding: 'bg-rose-100 text-rose-800',
  funeral: 'bg-slate-100 text-slate-800',
  other: 'bg-neutral-100 text-neutral-800',
};

export default function EventCard({
  event,
  onRegister,
  onEdit,
  onView,
  showActions = true,
  compact = false,
}: EventCardProps) {
  const startDateTime = parseISO(`${event.start_date}T${event.start_time}`);
  const endDateTime = parseISO(`${event.end_date}T${event.end_time}`);
  
  const formatDate = (date: Date) => {
    return format(date, 'MMM d, yyyy');
  };

  const formatTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  const isRegistrationOpen = () => {
    if (!event.registration_required) return false;
    if (event.status !== 'published') return false;
    if (event.registration_deadline && new Date() > parseISO(event.registration_deadline)) {
      return false;
    }
    return true;
  };

  const isPaid = event.cost_type === 'paid' && event.cost && event.cost > 0;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
                {event.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${eventTypeColors[event.event_type] || eventTypeColors.other}`}>
                {event.event_type.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <h3 className={`font-semibold text-gray-900 ${compact ? 'text-lg' : 'text-xl'}`}>
              {event.title}
            </h3>
          </div>
          {event.image_url && (
            <img
              src={event.image_url}
              alt={event.title}
              className={`rounded-lg object-cover ${compact ? 'w-16 h-16' : 'w-20 h-20'}`}
            />
          )}
        </div>

        {/* Description */}
        {!compact && event.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Event Details */}
        <div className={`space-y-2 mb-4 flex-grow ${compact ? 'text-sm' : ''}`}>
          <div className="flex items-center gap-2 text-gray-600">
            <CalendarIcon className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} flex-shrink-0`} />
            <span>
              {formatDate(startDateTime)}
              {event.start_date !== event.end_date && ` - ${formatDate(endDateTime)}`}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <ClockIcon className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} flex-shrink-0`} />
            <span>
              {formatTime(startDateTime)} - {formatTime(endDateTime)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <MapPinIcon className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} flex-shrink-0`} />
            <span className="truncate">{event.location}</span>
          </div>

          {event.capacity && (
            <div className="flex items-center gap-2 text-gray-600">
              <UsersIcon className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} flex-shrink-0`} />
              <span>Capacity: {event.capacity}</span>
            </div>
          )}

          {isPaid && (
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <span className="text-lg">$</span>
              <span>${event.cost}</span>
            </div>
          )}

          {event.cost_type === 'free' && (
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <span>Free Event</span>
            </div>
          )}

          {(event.cost_type === 'donation' || event.cost_type === 'suggested_donation') && (
            <div className="flex items-center gap-2 text-blue-600 font-medium">
              <span>
                {event.cost_type === 'donation' ? 'Donation' : 'Suggested Donation'}
                {event.cost && `: $${event.cost}`}
              </span>
            </div>
          )}
        </div>

        {/* Registration Status */}
        {event.registration_required && (
          <div className="mb-4">
            {event.registration_deadline && (
              <p className="text-xs text-gray-500 mb-2">
                Registration deadline: {format(parseISO(event.registration_deadline), 'MMM d, yyyy h:mm a')}
              </p>
            )}
            {!isRegistrationOpen() && (
              <p className="text-sm text-red-600 font-medium">
                Registration closed
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-4 border-t border-gray-100">
            {onView && (
              <button
                onClick={() => onView(event.id)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                View Details
              </button>
            )}

            {onEdit && (
              <button
                onClick={() => onEdit(event.id)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Edit
              </button>
            )}

            {onRegister && isRegistrationOpen() && (
              <button
                onClick={() => onRegister(event.id)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Register
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}