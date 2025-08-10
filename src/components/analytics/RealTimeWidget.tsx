'use client';

import React from 'react';
import { 
  EyeIcon, 
  ChatBubbleLeftRightIcon, 
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { RealTimeMetrics } from '../../types/analytics';
import { clsx } from 'clsx';
import { format } from 'date-fns';

interface RealTimeWidgetProps {
  metrics: RealTimeMetrics;
  loading?: boolean;
}

export function RealTimeWidget({ metrics, loading = false }: RealTimeWidgetProps) {
  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm:ss');
  };

  if (loading && !metrics) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-blue-400 rounded w-32"></div>
            <div className="h-5 bg-blue-400 rounded w-20"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-blue-400 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Live</span>
          </div>
          <h3 className="text-lg font-semibold">Real-Time Activity</h3>
        </div>
        
        <div className="flex items-center space-x-1 text-sm opacity-75">
          <ClockIcon className="h-4 w-4" />
          <span>Updated {formatTime(metrics.timestamp)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Visitors */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{metrics.active_visitors}</div>
              <div className="text-sm opacity-75">Active Visitors</div>
            </div>
            <EyeIcon className="h-8 w-8 opacity-75" />
          </div>
          <div className="mt-2 text-xs opacity-60">
            Last hour
          </div>
        </div>

        {/* Live Chats */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{metrics.live_chats}</div>
              <div className="text-sm opacity-75">Live Chats</div>
            </div>
            <ChatBubbleLeftRightIcon className="h-8 w-8 opacity-75" />
          </div>
          <div className="mt-2 text-xs opacity-60">
            Active sessions
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Recent Events</div>
            <ArrowPathIcon className="h-4 w-4 opacity-75" />
          </div>
          
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {metrics.recent_events.length > 0 ? (
              metrics.recent_events.slice(0, 3).map((event, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="opacity-75 capitalize">
                    {event.event_action.replace(/_/g, ' ')}
                  </span>
                  <span className="opacity-60">
                    {format(new Date(event.created_at), 'HH:mm')}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs opacity-60">No recent activity</div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      {metrics.recent_events.length > 3 && (
        <div className="mt-4 pt-4 border-t border-white border-opacity-20">
          <div className="text-sm font-medium mb-2">Activity Feed</div>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {metrics.recent_events.slice(3, 8).map((event, index) => (
              <div key={index} className="flex items-center justify-between text-xs opacity-75">
                <span className="capitalize">
                  {event.event_action.replace(/_/g, ' ')}
                </span>
                <span className="opacity-60">
                  {format(new Date(event.created_at), 'HH:mm:ss')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}