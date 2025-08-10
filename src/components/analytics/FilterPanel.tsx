'use client';

import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { AnalyticsFilter } from '../../types/analytics';

interface FilterPanelProps {
  filters: AnalyticsFilter;
  onChange: (filters: AnalyticsFilter) => void;
  onClose: () => void;
}

const FILTER_OPTIONS = {
  source: [
    { value: 'direct', label: 'Direct' },
    { value: 'google', label: 'Google' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'email', label: 'Email' },
    { value: 'referral', label: 'Referral' },
  ],
  medium: [
    { value: 'organic', label: 'Organic' },
    { value: 'cpc', label: 'Paid Search' },
    { value: 'social', label: 'Social Media' },
    { value: 'email', label: 'Email' },
    { value: 'referral', label: 'Referral' },
  ],
  device_type: [
    { value: 'desktop', label: 'Desktop' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'tablet', label: 'Tablet' },
  ],
  country: [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'AU', label: 'Australia' },
  ],
  event_type: [
    { value: 'worship', label: 'Worship' },
    { value: 'bible_study', label: 'Bible Study' },
    { value: 'prayer', label: 'Prayer' },
    { value: 'fellowship', label: 'Fellowship' },
    { value: 'youth', label: 'Youth' },
    { value: 'children', label: 'Children' },
  ],
  user_type: [
    { value: 'member', label: 'Members' },
    { value: 'visitor', label: 'Visitors' },
    { value: 'staff', label: 'Staff' },
  ],
};

export function FilterPanel({ filters, onChange, onClose }: FilterPanelProps) {
  const [tempFilters, setTempFilters] = useState<AnalyticsFilter>(filters);

  const handleFilterChange = (key: keyof AnalyticsFilter, value: string) => {
    setTempFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleApply = () => {
    // Remove undefined values
    const cleanFilters = Object.entries(tempFilters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        acc[key as keyof AnalyticsFilter] = value as any;
      }
      return acc;
    }, {} as AnalyticsFilter);
    
    onChange(cleanFilters);
    onClose();
  };

  const handleClear = () => {
    setTempFilters({});
    onChange({});
    onClose();
  };

  const activeFiltersCount = Object.values(tempFilters).filter(v => v !== undefined && v !== '').length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <p className="text-sm text-gray-600">
            Filter your analytics data by specific criteria
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Source */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Traffic Source
          </label>
          <select
            value={tempFilters.source || ''}
            onChange={(e) => handleFilterChange('source', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All sources</option>
            {FILTER_OPTIONS.source.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Medium */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medium
          </label>
          <select
            value={tempFilters.medium || ''}
            onChange={(e) => handleFilterChange('medium', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All mediums</option>
            {FILTER_OPTIONS.medium.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Campaign */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign
          </label>
          <input
            type="text"
            value={tempFilters.campaign || ''}
            onChange={(e) => handleFilterChange('campaign', e.target.value)}
            placeholder="Enter campaign name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Device Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Device Type
          </label>
          <select
            value={tempFilters.device_type || ''}
            onChange={(e) => handleFilterChange('device_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All devices</option>
            {FILTER_OPTIONS.device_type.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <select
            value={tempFilters.country || ''}
            onChange={(e) => handleFilterChange('country', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All countries</option>
            {FILTER_OPTIONS.country.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* User Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User Type
          </label>
          <select
            value={tempFilters.user_type || ''}
            onChange={(e) => handleFilterChange('user_type', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All users</option>
            {FILTER_OPTIONS.user_type.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Type
          </label>
          <select
            value={tempFilters.event_type || ''}
            onChange={(e) => handleFilterChange('event_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All event types</option>
            {FILTER_OPTIONS.event_type.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {activeFiltersCount > 0 && (
            <span>{activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active</span>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}