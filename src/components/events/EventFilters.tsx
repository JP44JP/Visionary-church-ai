'use client';

import React from 'react';
import { EventFilters as EventFiltersType, EventType, EventStatus, AudienceType, CostType } from '../../types/events';
import { format } from 'date-fns';

interface EventFiltersProps {
  filters: EventFiltersType;
  onFiltersChange: (filters: EventFiltersType) => void;
}

const eventTypes: { value: EventType; label: string }[] = [
  { value: 'worship', label: 'Worship' },
  { value: 'bible_study', label: 'Bible Study' },
  { value: 'prayer', label: 'Prayer' },
  { value: 'fellowship', label: 'Fellowship' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'youth', label: 'Youth' },
  { value: 'children', label: 'Children' },
  { value: 'ministry', label: 'Ministry' },
  { value: 'special', label: 'Special Event' },
  { value: 'conference', label: 'Conference' },
  { value: 'retreat', label: 'Retreat' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'funeral', label: 'Funeral' },
  { value: 'other', label: 'Other' },
];

const eventStatuses: { value: EventStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
  { value: 'postponed', label: 'Postponed' },
];

const audienceTypes: { value: AudienceType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'members', label: 'Members' },
  { value: 'visitors', label: 'Visitors' },
  { value: 'youth', label: 'Youth' },
  { value: 'children', label: 'Children' },
  { value: 'adults', label: 'Adults' },
  { value: 'seniors', label: 'Seniors' },
  { value: 'families', label: 'Families' },
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
];

const costTypes: { value: CostType; label: string }[] = [
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
  { value: 'donation', label: 'Donation' },
  { value: 'suggested_donation', label: 'Suggested Donation' },
];

export default function EventFilters({ filters, onFiltersChange }: EventFiltersProps) {
  const updateFilter = <K extends keyof EventFiltersType>(
    key: K,
    value: EventFiltersType[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const updateArrayFilter = <T extends string>(
    key: keyof EventFiltersType,
    value: T,
    checked: boolean
  ) => {
    const currentArray = (filters[key] as T[]) || [];
    let newArray: T[];

    if (checked) {
      newArray = [...currentArray, value];
    } else {
      newArray = currentArray.filter((item) => item !== value);
    }

    onFiltersChange({
      ...filters,
      [key]: newArray.length > 0 ? newArray : undefined,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && 
    (Array.isArray(value) ? value.length > 0 : true)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        {hasFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            id="search"
            placeholder="Event title or description..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Date Range */}
        <div className="md:col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              placeholder="Start date"
              value={filters.startDate || ''}
              onChange={(e) => updateFilter('startDate', e.target.value || undefined)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="date"
              placeholder="End date"
              value={filters.endDate || ''}
              onChange={(e) => updateFilter('endDate', e.target.value || undefined)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            id="location"
            placeholder="Event location..."
            value={filters.location || ''}
            onChange={(e) => updateFilter('location', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Registration Required */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Registration
          </label>
          <select
            value={filters.registrationRequired === undefined ? '' : filters.registrationRequired.toString()}
            onChange={(e) => {
              const value = e.target.value;
              updateFilter('registrationRequired', value === '' ? undefined : value === 'true');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Events</option>
            <option value="true">Registration Required</option>
            <option value="false">No Registration</option>
          </select>
        </div>

        {/* Cost Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cost Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              min="0"
              step="0.01"
              value={filters.cost?.min || ''}
              onChange={(e) => {
                const value = e.target.value ? parseFloat(e.target.value) : undefined;
                updateFilter('cost', {
                  ...filters.cost,
                  min: value,
                });
              }}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Max"
              min="0"
              step="0.01"
              value={filters.cost?.max || ''}
              onChange={(e) => {
                const value = e.target.value ? parseFloat(e.target.value) : undefined;
                updateFilter('cost', {
                  ...filters.cost,
                  max: value,
                });
              }}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Checkboxes Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Event Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Event Type
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {eventTypes.map((type) => (
              <label key={type.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(filters.eventType || []).includes(type.value)}
                  onChange={(e) => updateArrayFilter('eventType', type.value, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Event Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Status
          </label>
          <div className="space-y-2">
            {eventStatuses.map((status) => (
              <label key={status.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(filters.status || []).includes(status.value)}
                  onChange={(e) => updateArrayFilter('status', status.value, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{status.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Audience Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Audience
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {audienceTypes.map((audience) => (
              <label key={audience.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(filters.audienceType || []).includes(audience.value)}
                  onChange={(e) => updateArrayFilter('audienceType', audience.value, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{audience.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Cost Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Cost Type
          </label>
          <div className="space-y-2">
            {costTypes.map((costType) => (
              <label key={costType.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(filters.cost?.type || []).includes(costType.value)}
                  onChange={(e) => {
                    const currentTypes = filters.cost?.type || [];
                    let newTypes: CostType[];
                    
                    if (e.target.checked) {
                      newTypes = [...currentTypes, costType.value];
                    } else {
                      newTypes = currentTypes.filter(type => type !== costType.value);
                    }
                    
                    updateFilter('cost', {
                      ...filters.cost,
                      type: newTypes.length > 0 ? newTypes : undefined,
                    });
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{costType.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}