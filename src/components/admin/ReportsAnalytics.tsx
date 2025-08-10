'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  FunnelIcon,
  DocumentChartBarIcon,
  TableCellsIcon,
  ChartPieIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface AnalyticsData {
  visitors: {
    total: number
    thisMonth: number
    growth: number
    conversion: number
    sources: Array<{
      source: string
      count: number
      percentage: number
    }>
  }
  chatWidget: {
    totalSessions: number
    avgDuration: number
    satisfactionScore: number
    commonQuestions: Array<{
      question: string
      count: number
    }>
    conversionRate: number
  }
  events: {
    totalEvents: number
    totalRegistrations: number
    avgAttendance: number
    upcomingEvents: number
    popularCategories: Array<{
      category: string
      count: number
    }>
  }
  prayerRequests: {
    total: number
    thisMonth: number
    avgResponseTime: number
    satisfactionScore: number
    categories: Array<{
      category: string
      count: number
      percentage: number
    }>
  }
  communication: {
    emailsSent: number
    openRate: number
    clickRate: number
    smssSent: number
    deliveryRate: number
  }
}

interface Report {
  id: string
  name: string
  description: string
  type: 'visitor' | 'event' | 'communication' | 'prayer' | 'financial' | 'custom'
  format: 'pdf' | 'excel' | 'csv'
  schedule: 'manual' | 'daily' | 'weekly' | 'monthly'
  lastGenerated?: Date
  createdBy: string
  isActive: boolean
}

const sampleAnalytics: AnalyticsData = {
  visitors: {
    total: 1247,
    thisMonth: 89,
    growth: 23.5,
    conversion: 76.8,
    sources: [
      { source: 'Website', count: 456, percentage: 36.6 },
      { source: 'Referral', count: 321, percentage: 25.7 },
      { source: 'Social Media', count: 234, percentage: 18.8 },
      { source: 'Walk-in', count: 156, percentage: 12.5 },
      { source: 'Phone', count: 80, percentage: 6.4 }
    ]
  },
  chatWidget: {
    totalSessions: 2458,
    avgDuration: 4.2,
    satisfactionScore: 4.6,
    conversionRate: 28.5,
    commonQuestions: [
      { question: 'Service times', count: 456 },
      { question: 'Children\'s ministry', count: 289 },
      { question: 'Location and directions', count: 234 },
      { question: 'Small groups', count: 178 },
      { question: 'Baptism information', count: 123 }
    ]
  },
  events: {
    totalEvents: 47,
    totalRegistrations: 1893,
    avgAttendance: 85.2,
    upcomingEvents: 12,
    popularCategories: [
      { category: 'Service', count: 52 },
      { category: 'Social', count: 23 },
      { category: 'Study', count: 18 },
      { category: 'Youth', count: 15 },
      { category: 'Children', count: 12 }
    ]
  },
  prayerRequests: {
    total: 342,
    thisMonth: 28,
    avgResponseTime: 2.4,
    satisfactionScore: 4.8,
    categories: [
      { category: 'Healing', count: 89, percentage: 26.0 },
      { category: 'Family', count: 67, percentage: 19.6 },
      { category: 'Guidance', count: 54, percentage: 15.8 },
      { category: 'Financial', count: 43, percentage: 12.6 },
      { category: 'Thanksgiving', count: 35, percentage: 10.2 },
      { category: 'Other', count: 54, percentage: 15.8 }
    ]
  },
  communication: {
    emailsSent: 15647,
    openRate: 24.6,
    clickRate: 3.8,
    smssSent: 2834,
    deliveryRate: 98.2
  }
}

const sampleReports: Report[] = [
  {
    id: '1',
    name: 'Monthly Visitor Report',
    description: 'Comprehensive overview of visitor statistics and trends',
    type: 'visitor',
    format: 'pdf',
    schedule: 'monthly',
    lastGenerated: new Date('2024-08-01'),
    createdBy: 'Admin',
    isActive: true
  },
  {
    id: '2',
    name: 'Event Registration Summary',
    description: 'Summary of all event registrations and attendance',
    type: 'event',
    format: 'excel',
    schedule: 'weekly',
    lastGenerated: new Date('2024-08-12'),
    createdBy: 'Mary Johnson',
    isActive: true
  },
  {
    id: '3',
    name: 'Prayer Request Analytics',
    description: 'Analysis of prayer requests and team response metrics',
    type: 'prayer',
    format: 'pdf',
    schedule: 'monthly',
    lastGenerated: new Date('2024-08-01'),
    createdBy: 'Sarah Lee',
    isActive: true
  },
  {
    id: '4',
    name: 'Communication Performance',
    description: 'Email and SMS campaign performance metrics',
    type: 'communication',
    format: 'excel',
    schedule: 'weekly',
    lastGenerated: new Date('2024-08-14'),
    createdBy: 'David Wilson',
    isActive: true
  },
  {
    id: '5',
    name: 'Quarterly Growth Analysis',
    description: 'Comprehensive analysis of church growth metrics',
    type: 'custom',
    format: 'pdf',
    schedule: 'manual',
    lastGenerated: new Date('2024-07-01'),
    createdBy: 'Pastor John',
    isActive: true
  }
]

const ReportsAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('30')
  const [selectedReportType, setSelectedReportType] = useState('all')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'visitors', label: 'Visitors', icon: UserGroupIcon },
    { id: 'events', label: 'Events', icon: CalendarDaysIcon },
    { id: 'communication', label: 'Communication', icon: ChatBubbleLeftRightIcon },
    { id: 'prayer', label: 'Prayer', icon: HeartIcon },
    { id: 'reports', label: 'Custom Reports', icon: DocumentChartBarIcon }
  ]

  const dateRangeOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '365', label: 'Last year' },
    { value: 'custom', label: 'Custom range' }
  ]

  const MetricCard: React.FC<{
    title: string
    value: string | number
    change?: number
    icon: React.ComponentType<{ className?: string }>
    color: string
    trend?: 'up' | 'down' | 'neutral'
  }> = ({ title, value, change, icon: Icon, color, trend }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {typeof value === 'number' ? formatNumber(value) : value}
          </p>
          {change !== undefined && (
            <div className={cn(
              'flex items-center mt-2 text-sm',
              trend === 'up' ? 'text-green-600 dark:text-green-400' :
              trend === 'down' ? 'text-red-600 dark:text-red-400' :
              'text-gray-600 dark:text-gray-400'
            )}>
              {trend === 'up' && <ArrowUpIcon className="h-4 w-4 mr-1" />}
              {trend === 'down' && <ArrowDownIcon className="h-4 w-4 mr-1" />}
              {Math.abs(change)}% vs previous period
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', color)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  )

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Visitors"
          value={sampleAnalytics.visitors.total}
          change={sampleAnalytics.visitors.growth}
          trend="up"
          icon={UserGroupIcon}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
        />
        <MetricCard
          title="Chat Sessions"
          value={sampleAnalytics.chatWidget.totalSessions}
          change={15.2}
          trend="up"
          icon={ChatBubbleLeftRightIcon}
          color="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
        />
        <MetricCard
          title="Event Registrations"
          value={sampleAnalytics.events.totalRegistrations}
          change={8.7}
          trend="up"
          icon={CalendarDaysIcon}
          color="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
        />
        <MetricCard
          title="Prayer Requests"
          value={sampleAnalytics.prayerRequests.total}
          change={-2.1}
          trend="down"
          icon={HeartIcon}
          color="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Visitor Sources */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Visitor Sources</h3>
          <div className="space-y-4">
            {sampleAnalytics.visitors.sources.map((source, index) => (
              <div key={source.source} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" style={{ 
                    backgroundColor: `hsl(${index * 60}, 70%, 50%)` 
                  }} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {source.source}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {source.count}
                  </span>
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${source.percentage}%`,
                        backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                    {source.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Communication Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Communication Performance</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatNumber(sampleAnalytics.communication.emailsSent)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Emails Sent</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {sampleAnalytics.communication.openRate}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Open Rate</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatNumber(sampleAnalytics.communication.smssSent)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">SMS Sent</p>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {sampleAnalytics.communication.deliveryRate}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Rate</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Insights</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUpIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white">Growing Engagement</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Visitor engagement is up {sampleAnalytics.visitors.growth}% this month
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white">High Satisfaction</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Chat satisfaction score: {sampleAnalytics.chatWidget.satisfactionScore}/5
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <CalendarDaysIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white">Strong Attendance</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Average event attendance: {sampleAnalytics.events.avgAttendance}%
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <HeartIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white">Quick Response</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Avg. prayer response: {sampleAnalytics.prayerRequests.avgResponseTime}h
            </p>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderVisitorAnalytics = () => (
    <div className="space-y-8">
      {/* Visitor Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Visitors"
          value={sampleAnalytics.visitors.total}
          change={sampleAnalytics.visitors.growth}
          trend="up"
          icon={UserGroupIcon}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
        />
        <MetricCard
          title="This Month"
          value={sampleAnalytics.visitors.thisMonth}
          change={12.8}
          trend="up"
          icon={CalendarDaysIcon}
          color="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${sampleAnalytics.visitors.conversion}%`}
          change={4.2}
          trend="up"
          icon={TrendingUpIcon}
          color="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
        />
        <MetricCard
          title="Return Visitors"
          value="34%"
          change={8.1}
          trend="up"
          icon={ArrowUpIcon}
          color="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
        />
      </div>

      {/* Detailed Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Visitor Journey</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Landing Page Views</span>
              <span className="font-medium text-gray-900 dark:text-white">5,247</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Chat Initiated</span>
              <span className="font-medium text-gray-900 dark:text-white">2,458 (47%)</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '47%' }}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Visit Requested</span>
              <span className="font-medium text-gray-900 dark:text-white">1,247 (24%)</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '24%' }}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Visit Attended</span>
              <span className="font-medium text-gray-900 dark:text-white">958 (18%)</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-orange-600 h-2 rounded-full" style={{ width: '18%' }}></div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Age Demographics</h3>
          <div className="space-y-4">
            {[
              { age: 'Under 18', count: 89, percentage: 12.4 },
              { age: '18-25', count: 156, percentage: 21.7 },
              { age: '26-35', count: 234, percentage: 32.6 },
              { age: '36-50', count: 178, percentage: 24.8 },
              { age: '51-65', count: 89, percentage: 12.4 },
              { age: 'Over 65', count: 45, percentage: 6.3 }
            ].map((demo) => (
              <div key={demo.age} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white w-16">
                  {demo.age}
                </span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${demo.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {demo.count}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                    {demo.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )

  const renderCustomReports = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Custom Reports</h3>
        <div className="flex items-center space-x-3">
          <Select
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'visitor', label: 'Visitor Reports' },
              { value: 'event', label: 'Event Reports' },
              { value: 'communication', label: 'Communication Reports' },
              { value: 'prayer', label: 'Prayer Reports' },
              { value: 'custom', label: 'Custom Reports' }
            ]}
            value={selectedReportType}
            onChange={(e) => setSelectedReportType(e.target.value)}
          />
          <Button>
            <DocumentChartBarIcon className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {sampleReports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {report.name}
                  </h4>
                  <Badge className={cn(
                    'capitalize',
                    report.type === 'visitor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    report.type === 'event' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    report.type === 'communication' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    report.type === 'prayer' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  )}>
                    {report.type}
                  </Badge>
                  <Badge variant="outline" className="uppercase">
                    {report.format}
                  </Badge>
                  <Badge className={cn(
                    'capitalize',
                    report.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  )}>
                    {report.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {report.description}
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                  <span>Schedule: {report.schedule}</span>
                  {report.lastGenerated && (
                    <span>Last generated: {formatDate(report.lastGenerated)}</span>
                  )}
                  <span>Created by: {report.createdBy}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Button variant="outline" size="sm">
                  <EyeIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </Button>
                <Button size="sm">
                  Generate
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive insights and analytics for your church operations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select
            options={dateRangeOptions}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          />
          <Button>
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-brand-primary-500 text-brand-primary-600 dark:text-brand-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              )}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'visitors' && renderVisitorAnalytics()}
        {activeTab === 'events' && (
          <div className="text-center py-20">
            <div className="mx-auto h-24 w-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
              <CalendarDaysIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Event Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Detailed event performance and registration analytics coming soon!
            </p>
          </div>
        )}
        {activeTab === 'communication' && (
          <div className="text-center py-20">
            <div className="mx-auto h-24 w-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Communication Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Email and SMS campaign analytics and insights coming soon!
            </p>
          </div>
        )}
        {activeTab === 'prayer' && (
          <div className="text-center py-20">
            <div className="mx-auto h-24 w-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
              <HeartIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Prayer Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Prayer request trends and team performance metrics coming soon!
            </p>
          </div>
        )}
        {activeTab === 'reports' && renderCustomReports()}
      </div>
    </div>
  )
}

export default ReportsAnalytics