'use client';

import React, { useState } from 'react';
import { EventWithDetails, EventFilters, EventSortOptions } from '../../types/events';
import EventCard from './EventCard';
import EventFilters from './EventFilters';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface EventListProps {
  events: EventWithDetails[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  filters: EventFilters;
  sortOptions: EventSortOptions;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onFiltersChange: (filters: EventFilters) => void;
  onSortChange: (sort: EventSortOptions) => void;
  onEventClick?: (eventId: string) => void;
  onEventRegister?: (eventId: string) => void;
  onEventEdit?: (eventId: string) => void;
  showFilters?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

export default function EventList({
  events,
  totalCount,
  currentPage,
  totalPages,
  filters,
  sortOptions,
  loading = false,
  onPageChange,
  onFiltersChange,
  onSortChange,
  onEventClick,
  onEventRegister,
  onEventEdit,
  showFilters = true,
  showActions = true,
  compact = false,
}: EventListProps) {
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const sortOptions_list = [
    { value: 'start_date:asc', label: 'Date (Earliest First)' },
    { value: 'start_date:desc', label: 'Date (Latest First)' },
    { value: 'title:asc', label: 'Title (A-Z)' },
    { value: 'title:desc', label: 'Title (Z-A)' },
    { value: 'created_at:desc', label: 'Recently Added' },
    { value: 'capacity:desc', label: 'Largest Capacity' },
    { value: 'cost:asc', label: 'Price (Low to High)' },
    { value: 'cost:desc', label: 'Price (High to Low)' },
  ];

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [field, direction] = e.target.value.split(':');
    onSortChange({
      field: field as any,
      direction: direction as 'asc' | 'desc',
    });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
            i === currentPage
              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    );

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex items-center justify-between w-full">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">{(currentPage - 1) * 25 + 1}</span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(currentPage * 25, totalCount)}
              </span>{' '}
              of{' '}
              <span className="font-medium">{totalCount}</span>{' '}
              results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              {pages}
            </nav>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Events
          </h2>
          <p className="text-sm text-gray-600">
            {totalCount} event{totalCount !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700">
              Sort by:
            </label>
            <select
              id="sort"
              value={`${sortOptions.field}:${sortOptions.direction}`}
              onChange={handleSortChange}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {sortOptions_list.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Toggle */}
          {showFilters && (
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {showFiltersPanel ? 'Hide Filters' : 'Show Filters'}
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && showFiltersPanel && (
        <div className="bg-gray-50 rounded-lg p-6">
          <EventFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        </div>
      )}

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m0 0V7a2 2 0 012 2v6m0 0v4a2 2 0 01-2 2H10a2 2 0 01-2-2v-4m0 0V9a2 2 0 012-2h4z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No events found</h3>
          <p className="mt-2 text-gray-500">
            {Object.keys(filters).length > 0
              ? 'Try adjusting your filters to see more events.'
              : 'Get started by creating your first event.'}
          </p>
        </div>
      ) : (
        <div className={`grid gap-6 ${
          compact 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onView={onEventClick}
              onRegister={onEventRegister}
              onEdit={onEventEdit}
              showActions={showActions}
              compact={compact}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
}