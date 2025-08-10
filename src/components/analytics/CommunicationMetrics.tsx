'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { EnvelopeIcon, DevicePhoneMobileIcon, BellIcon } from '@heroicons/react/24/outline';
import { CommunicationMetrics as CommunicationMetricsType } from '../../types/analytics';
import { clsx } from 'clsx';

interface CommunicationMetricsProps {
  data: CommunicationMetricsType;
  loading?: boolean;
}

const COMMUNICATION_ICONS = {
  email: EnvelopeIcon,
  sms: DevicePhoneMobileIcon,
  push: BellIcon,
  in_app: BellIcon
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export function CommunicationMetrics({ data, loading = false }: CommunicationMetricsProps) {
  const chartData = Object.entries(data).map(([type, metrics]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    sent: metrics.sent,
    delivered: metrics.delivered,
    opened: metrics.opened,
    clicked: metrics.clicked,
    deliveryRate: metrics.delivery_rate,
    openRate: metrics.open_rate,
    clickRate: metrics.click_rate
  }));

  const pieData = chartData.map((item, index) => ({
    name: item.type,
    value: item.sent,
    color: COLORS[index % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">Sent: <span className="font-medium">{data.sent.toLocaleString()}</span></p>
            <p className="text-gray-600">Delivered: <span className="font-medium">{data.delivered.toLocaleString()}</span></p>
            <p className="text-gray-600">Opened: <span className="font-medium">{data.opened.toLocaleString()}</span></p>
            <p className="text-gray-600">Clicked: <span className="font-medium">{data.clicked.toLocaleString()}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication Performance</h3>
        <div className="text-center py-12">
          <p className="text-gray-500">No communication data available</p>
        </div>
      </div>
    );
  }

  const totalSent = chartData.reduce((sum, item) => sum + item.sent, 0);
  const totalDelivered = chartData.reduce((sum, item) => sum + item.delivered, 0);
  const totalOpened = chartData.reduce((sum, item) => sum + item.opened, 0);
  const totalClicked = chartData.reduce((sum, item) => sum + item.clicked, 0);

  const avgDeliveryRate = totalSent > 0 ? (totalDelivered / totalSent * 100) : 0;
  const avgOpenRate = totalDelivered > 0 ? (totalOpened / totalDelivered * 100) : 0;
  const avgClickRate = totalOpened > 0 ? (totalClicked / totalOpened * 100) : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Communication Performance</h3>
          <p className="text-sm text-gray-600">
            Email, SMS, and push notification metrics
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{totalSent.toLocaleString()}</div>
          <div className="text-sm text-blue-800">Total Sent</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{avgDeliveryRate.toFixed(1)}%</div>
          <div className="text-sm text-green-800">Delivery Rate</div>
        </div>
        <div className="text-center p-4 bg-amber-50 rounded-lg">
          <div className="text-2xl font-bold text-amber-600">{avgOpenRate.toFixed(1)}%</div>
          <div className="text-sm text-amber-800">Open Rate</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{avgClickRate.toFixed(1)}%</div>
          <div className="text-sm text-purple-800">Click Rate</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Messages by Type</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sent" fill="#3B82F6" name="Sent" />
              <Bar dataKey="delivered" fill="#10B981" name="Delivered" />
              <Bar dataKey="opened" fill="#F59E0B" name="Opened" />
              <Bar dataKey="clicked" fill="#EF4444" name="Clicked" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Distribution by Channel</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Channel Performance</h4>
        <div className="space-y-3">
          {chartData.map((item, index) => {
            const Icon = COMMUNICATION_ICONS[item.type.toLowerCase() as keyof typeof COMMUNICATION_ICONS] || BellIcon;
            
            return (
              <div key={item.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={clsx(
                    'p-2 rounded-lg',
                    index === 0 ? 'bg-blue-100' :
                    index === 1 ? 'bg-green-100' :
                    index === 2 ? 'bg-amber-100' : 'bg-purple-100'
                  )}>
                    <Icon className={clsx(
                      'h-5 w-5',
                      index === 0 ? 'text-blue-600' :
                      index === 1 ? 'text-green-600' :
                      index === 2 ? 'text-amber-600' : 'text-purple-600'
                    )} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.type}</div>
                    <div className="text-xs text-gray-500">{item.sent.toLocaleString()} sent</div>
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  <div className="flex space-x-4 text-xs">
                    <span className="text-gray-600">
                      Delivery: <span className="font-medium">{item.deliveryRate.toFixed(1)}%</span>
                    </span>
                    <span className="text-gray-600">
                      Open: <span className="font-medium">{item.openRate.toFixed(1)}%</span>
                    </span>
                    <span className="text-gray-600">
                      Click: <span className="font-medium">{item.clickRate.toFixed(1)}%</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}