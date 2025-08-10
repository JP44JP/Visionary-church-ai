'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUpIcon, TrendingDownIcon } from '@heroicons/react/24/outline';
import { GrowthTrendMetrics, AnalyticsPeriod } from '../../types/analytics';
import { format, parseISO } from 'date-fns';
import { clsx } from 'clsx';

interface GrowthTrendsProps {
  data: GrowthTrendMetrics;
  period: AnalyticsPeriod;
  loading?: boolean;
}

export function GrowthTrends({ data, period, loading = false }: GrowthTrendsProps) {
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    switch (period) {
      case '1d':
        return format(date, 'HH:mm');
      case '7d':
        return format(date, 'MMM d');
      case '30d':
      case '90d':
        return format(date, 'MMM d');
      case '1y':
        return format(date, 'MMM yyyy');
      default:
        return format(date, 'MMM d');
    }
  };

  const chartData = data.daily_trends.map(trend => ({
    date: trend.metric_date,
    visitors: trend.new_visitors + trend.returning_visitors,
    newVisitors: trend.new_visitors,
    returningVisitors: trend.returning_visitors,
    conversions: trend.visit_scheduled,
    members: trend.member_growth,
    formattedDate: formatDate(trend.metric_date)
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-medium">{entry.value.toLocaleString()}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Trends</h3>
        <div className="text-center py-12">
          <p className="text-gray-500">No growth data available for the selected period</p>
        </div>
      </div>
    );
  }

  const totalGrowth = data.total_growth;
  const isPositiveGrowth = totalGrowth >= 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Growth Trends</h3>
          <p className="text-sm text-gray-600">
            Visitor growth and conversion trends over time
          </p>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-2">
            {isPositiveGrowth ? (
              <TrendingUpIcon className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDownIcon className="h-5 w-5 text-red-500" />
            )}
            <span className={clsx(
              'text-lg font-semibold',
              isPositiveGrowth ? 'text-green-600' : 'text-red-600'
            )}>
              {isPositiveGrowth ? '+' : ''}{totalGrowth.toFixed(1)}%
            </span>
          </div>
          <div className="text-xs text-gray-500">Total growth</div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-lg font-semibold text-blue-600">
            {chartData.reduce((sum, item) => sum + item.visitors, 0).toLocaleString()}
          </div>
          <div className="text-xs text-blue-800">Total Visitors</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-semibold text-green-600">
            {chartData.reduce((sum, item) => sum + item.newVisitors, 0).toLocaleString()}
          </div>
          <div className="text-xs text-green-800">New Visitors</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-lg font-semibold text-purple-600">
            {chartData.reduce((sum, item) => sum + item.conversions, 0).toLocaleString()}
          </div>
          <div className="text-xs text-purple-800">Conversions</div>
        </div>
        <div className="text-center p-3 bg-amber-50 rounded-lg">
          <div className="text-lg font-semibold text-amber-600">
            {chartData.reduce((sum, item) => sum + Math.max(0, item.members), 0).toLocaleString()}
          </div>
          <div className="text-xs text-amber-800">New Members</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitor Trends */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Visitor Trends</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedDate" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="returningVisitors" 
                stackId="1" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.3}
                name="Returning Visitors"
              />
              <Area 
                type="monotone" 
                dataKey="newVisitors" 
                stackId="1" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.6}
                name="New Visitors"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Trends */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Conversion Trends</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedDate" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="conversions" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Conversions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Retention and Conversion Rate Trends */}
      {(data.retention_trend.length > 0 || data.conversion_trend.length > 0) && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Retention Rate */}
            {data.retention_trend.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Retention Rate</h4>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={data.retention_trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => formatDate(value as string)}
                      formatter={(value: any) => [`${value.toFixed(1)}%`, 'Retention Rate']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Conversion Rate */}
            {data.conversion_trend.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Conversion Rate</h4>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={data.conversion_trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => formatDate(value as string)}
                      formatter={(value: any) => [`${value.toFixed(1)}%`, 'Conversion Rate']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}