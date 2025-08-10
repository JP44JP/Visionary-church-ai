'use client';

import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  ChatBubbleLeftRightIcon, 
  FaceSmileIcon, 
  ClockIcon,
  ArrowTrendingUpIcon 
} from '@heroicons/react/24/outline';
import { ChatMetrics } from '../../types/analytics';
import { clsx } from 'clsx';

interface ChatAnalyticsProps {
  data: ChatMetrics;
  loading?: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function ChatAnalytics({ data, loading = false }: ChatAnalyticsProps) {
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getSatisfactionColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSatisfactionBg = (rating: number) => {
    if (rating >= 4) return 'bg-green-100';
    if (rating >= 3) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const pieData = data.common_intents.map((intent, index) => ({
    name: intent.intent.charAt(0).toUpperCase() + intent.intent.slice(1).replace(/_/g, ' '),
    value: intent.count,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Chat Analytics</h3>
          <p className="text-sm text-gray-600">
            AI chat widget performance and user satisfaction
          </p>
        </div>
        <ChatBubbleLeftRightIcon className="h-8 w-8 text-gray-400" />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{data.total_sessions}</div>
          <div className="text-sm text-blue-800">Total Sessions</div>
        </div>
        <div className={clsx(
          'text-center p-4 rounded-lg',
          getSatisfactionBg(data.avg_satisfaction)
        )}>
          <div className={clsx('text-2xl font-bold', getSatisfactionColor(data.avg_satisfaction))}>
            {data.avg_satisfaction.toFixed(1)}
          </div>
          <div className={clsx('text-sm', getSatisfactionColor(data.avg_satisfaction))}>
            Satisfaction
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Avg Response Time</div>
              <div className="text-xs text-gray-500">Time to first AI response</div>
            </div>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {formatTime(data.avg_response_time)}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Conversion Rate</div>
              <div className="text-xs text-gray-500">Chats leading to actions</div>
            </div>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {data.conversion_rate.toFixed(1)}%
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <FaceSmileIcon className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Escalation Rate</div>
              <div className="text-xs text-gray-500">Chats escalated to humans</div>
            </div>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {data.escalation_rate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Common Intents */}
      {data.common_intents.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Common Intents</h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pie Chart */}
            <div>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Intent List */}
            <div className="space-y-2">
              {data.common_intents.slice(0, 5).map((intent, index) => (
                <div key={intent.intent} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm text-gray-700 capitalize">
                      {intent.intent.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {intent.count}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({((intent.count / data.total_sessions) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="text-sm font-medium text-blue-900 mb-2">Key Insights</h5>
        <div className="space-y-1 text-xs text-blue-800">
          <p>
            • Average satisfaction: {data.avg_satisfaction.toFixed(1)}/5.0 
            {data.avg_satisfaction >= 4 ? ' (Excellent)' : 
             data.avg_satisfaction >= 3 ? ' (Good)' : ' (Needs Improvement)'}
          </p>
          <p>
            • Response time: {formatTime(data.avg_response_time)}
            {data.avg_response_time <= 5 ? ' (Very Fast)' :
             data.avg_response_time <= 15 ? ' (Fast)' : ' (Could be faster)'}
          </p>
          <p>
            • {data.conversion_rate.toFixed(1)}% of chats lead to conversions
            {data.conversion_rate >= 15 ? ' (Excellent)' :
             data.conversion_rate >= 8 ? ' (Good)' : ' (Room for improvement)'}
          </p>
          {data.escalation_rate < 10 && (
            <p>• Low escalation rate indicates effective AI responses</p>
          )}
        </div>
      </div>

      {data.total_sessions === 0 && (
        <div className="text-center py-8">
          <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No chat data available</p>
        </div>
      )}
    </div>
  );
}