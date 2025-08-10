'use client';

import React from 'react';
import { 
  UsersIcon, 
  ChatBubbleLeftRightIcon, 
  CalendarDaysIcon,
  UserPlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { KPIMetrics } from '../../types/analytics';
import { clsx } from 'clsx';

interface KPICardsProps {
  metrics: KPIMetrics;
  loading?: boolean;
}

interface KPICard {
  title: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  color: string;
  format?: 'number' | 'percentage' | 'decimal';
}

export function KPICards({ metrics, loading = false }: KPICardsProps) {
  const formatValue = (value: number, format: 'number' | 'percentage' | 'decimal' = 'number'): string => {
    switch (format) {
      case 'percentage':
        return `${Math.round(value * 10) / 10}%`;
      case 'decimal':
        return value.toFixed(1);
      default:
        return value.toLocaleString();
    }
  };

  const formatChange = (change: number): { text: string; positive: boolean } => {
    const isPositive = change >= 0;
    const absChange = Math.abs(change);
    return {
      text: `${isPositive ? '+' : '-'}${formatValue(absChange, 'percentage')}`,
      positive: isPositive
    };
  };

  const cards: KPICard[] = [
    {
      title: 'Total Visitors',
      value: metrics.total_visitors,
      change: metrics.visitor_growth,
      changeLabel: 'vs previous period',
      icon: UsersIcon,
      color: 'blue',
      format: 'number'
    },
    {
      title: 'Chat Sessions',
      value: metrics.chat_sessions,
      change: metrics.chat_growth,
      changeLabel: 'vs previous period',
      icon: ChatBubbleLeftRightIcon,
      color: 'green',
      format: 'number'
    },
    {
      title: 'Visit Conversions',
      value: metrics.visit_conversions,
      icon: CalendarDaysIcon,
      color: 'purple',
      format: 'number'
    },
    {
      title: 'New Members',
      value: metrics.member_conversions,
      icon: UserPlusIcon,
      color: 'indigo',
      format: 'number'
    },
    {
      title: 'Chat → Visit Rate',
      value: formatValue(metrics.chat_to_visit_rate, 'percentage'),
      icon: ArrowTrendingUpIcon,
      color: 'emerald',
      format: 'percentage'
    },
    {
      title: 'Visit → Member Rate',
      value: formatValue(metrics.visit_to_member_rate, 'percentage'),
      icon: ArrowTrendingUpIcon,
      color: 'rose',
      format: 'percentage'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const change = card.change !== undefined ? formatChange(card.change) : null;
        
        return (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium">{card.title}</p>
                <p className={clsx(
                  'text-2xl font-bold mt-1',
                  `text-${card.color}-600`
                )}>
                  {typeof card.value === 'string' ? card.value : formatValue(card.value, card.format)}
                </p>
                
                {change && (
                  <div className="flex items-center mt-2">
                    {change.positive ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={clsx(
                      'text-sm font-medium',
                      change.positive ? 'text-green-600' : 'text-red-600'
                    )}>
                      {change.text}
                    </span>
                    {card.changeLabel && (
                      <span className="text-xs text-gray-500 ml-1">
                        {card.changeLabel}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className={clsx(
                'h-12 w-12 rounded-lg flex items-center justify-center',
                `bg-${card.color}-100`
              )}>
                <Icon className={clsx('h-6 w-6', `text-${card.color}-600`)} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}