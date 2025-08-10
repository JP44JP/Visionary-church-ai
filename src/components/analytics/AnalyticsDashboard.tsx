'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ChartBarIcon, 
  UsersIcon, 
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  TrendingUpIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { DashboardMetrics, AnalyticsPeriod, AnalyticsFilter, RealTimeMetrics } from '../../types/analytics';
import { KPICards } from './KPICards';
import { VisitorFunnelChart } from './charts/VisitorFunnelChart';
import { CommunicationMetrics } from './CommunicationMetrics';
import { EventPerformance } from './EventPerformance';
import { GrowthTrends } from './GrowthTrends';
import { ChatAnalytics } from './ChatAnalytics';
import { RealTimeWidget } from './RealTimeWidget';
import { FilterPanel } from './FilterPanel';
import { ExportModal } from './ExportModal';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { clsx } from 'clsx';

interface AnalyticsDashboardProps {
  churchId: string;
  userRole: string;
}

const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: '1d', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' }
];

export function AnalyticsDashboard({ churchId, userRole }: AnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>('30d');
  const [filters, setFilters] = useState<AnalyticsFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Fetch dashboard metrics
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['analytics-dashboard', churchId, selectedPeriod, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...filters
      });

      const response = await fetch(`/api/analytics/dashboard?${params}`, {
        headers: {
          'x-church-id': churchId
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard metrics');
      }

      const result = await response.json();
      return result.data as DashboardMetrics;
    },
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds if auto-refresh is on
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch real-time metrics
  const {
    data: realTimeMetrics,
    isLoading: realTimeLoading
  } = useQuery({
    queryKey: ['analytics-realtime', churchId],
    queryFn: async () => {
      const response = await fetch('/api/analytics/realtime', {
        headers: {
          'x-church-id': churchId
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch real-time metrics');
      }

      const result = await response.json();
      return result.data as RealTimeMetrics;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000, // 5 seconds
  });

  const handlePeriodChange = (period: AnalyticsPeriod) => {
    setSelectedPeriod(period);
  };

  const handleFiltersChange = (newFilters: AnalyticsFilter) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    refetchMetrics();
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const isAdmin = ['church_admin', 'super_admin'].includes(userRole);
  const canExport = isAdmin || userRole === 'staff';

  if (metricsError) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">
          <ChartBarIcon className="h-12 w-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Failed to load analytics</h3>
          <p className="text-sm text-gray-600 mt-1">
            {metricsError.message || 'Something went wrong while loading the dashboard'}
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={<div className="p-8 text-center text-red-600">Something went wrong with the analytics dashboard.</div>}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Insights and performance metrics for your church
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            {/* Auto-refresh toggle */}
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Auto-refresh</span>
            </label>

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={metricsLoading}
              className={clsx(
                'p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors',
                metricsLoading && 'opacity-50 cursor-not-allowed'
              )}
              title="Refresh data"
            >
              <ArrowPathIcon className={clsx('h-5 w-5', metricsLoading && 'animate-spin')} />
            </button>

            {/* Filters button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                'p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors',
                showFilters && 'bg-blue-50 border-blue-300'
              )}
              title="Filters"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
            </button>

            {/* Export button */}
            {canExport && (
              <button
                onClick={handleExport}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                title="Export data"
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Period selector */}
        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handlePeriodChange(option.value)}
              className={clsx(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                selectedPeriod === option.value
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Filters panel */}
        {showFilters && (
          <FilterPanel
            filters={filters}
            onChange={handleFiltersChange}
            onClose={() => setShowFilters(false)}
          />
        )}

        {/* Loading state */}
        {metricsLoading && !metrics && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Dashboard content */}
        {metrics && (
          <>
            {/* Real-time widget */}
            {realTimeMetrics && (
              <RealTimeWidget 
                metrics={realTimeMetrics} 
                loading={realTimeLoading}
              />
            )}

            {/* KPI Cards */}
            <KPICards metrics={metrics.kpis} loading={metricsLoading} />

            {/* Main dashboard grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Visitor Funnel */}
              <div className="lg:col-span-2">
                <VisitorFunnelChart 
                  data={metrics.funnel} 
                  period={selectedPeriod}
                  loading={metricsLoading}
                />
              </div>

              {/* Communication Metrics */}
              <CommunicationMetrics 
                data={metrics.communications} 
                loading={metricsLoading}
              />

              {/* Event Performance */}
              <EventPerformance 
                data={metrics.events} 
                loading={metricsLoading}
              />

              {/* Growth Trends */}
              <div className="lg:col-span-2">
                <GrowthTrends 
                  data={metrics.growth} 
                  period={selectedPeriod}
                  loading={metricsLoading}
                />
              </div>

              {/* Chat Analytics */}
              <ChatAnalytics 
                data={metrics.chat} 
                loading={metricsLoading}
              />

              {/* Additional insights based on role */}
              {isAdmin && (
                <div className="lg:col-span-1">
                  {/* Admin-specific widgets */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Admin Insights
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Cost per visitor</span>
                        <span className="text-sm font-medium">$2.45</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">ROI</span>
                        <span className="text-sm font-medium text-green-600">+24%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">System uptime</span>
                        <span className="text-sm font-medium">99.9%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <ExportModal
            churchId={churchId}
            period={selectedPeriod}
            filters={filters}
            onClose={() => setShowExportModal(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}