'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  HeartIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { cn, formatDate, formatNumber } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  loading?: boolean
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {typeof value === 'number' ? formatNumber(value) : value}
          </p>
          {change !== undefined && (
            <div className={cn(
              'flex items-center mt-2 text-sm',
              change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}>
              {change >= 0 ? (
                <ArrowUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 mr-1" />
              )}
              {Math.abs(change)}% {changeLabel || 'vs last month'}
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', color)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  )
}

interface ActivityItem {
  id: string
  type: 'visitor' | 'prayer' | 'chat' | 'event'
  title: string
  description: string
  timestamp: Date
  status?: 'pending' | 'completed' | 'urgent'
}

const recentActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'visitor',
    title: 'New Visitor Registration',
    description: 'Sarah Johnson registered for Sunday 11:00 AM service',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    status: 'pending'
  },
  {
    id: '2',
    type: 'prayer',
    title: 'Urgent Prayer Request',
    description: 'Request for healing from Michael Davis',
    timestamp: new Date(Date.now() - 32 * 60 * 1000),
    status: 'urgent'
  },
  {
    id: '3',
    type: 'chat',
    title: 'Chat Widget Conversation',
    description: 'Visitor asking about children\'s ministry programs',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    status: 'completed'
  },
  {
    id: '4',
    type: 'event',
    title: 'Event Registration',
    description: '5 new registrations for Youth Group Retreat',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'completed'
  },
  {
    id: '5',
    type: 'visitor',
    title: 'Visit Confirmation',
    description: 'John Smith confirmed attendance for Sunday service',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    status: 'completed'
  }
]

const upcomingEvents = [
  {
    id: '1',
    title: 'Sunday Morning Service',
    time: '11:00 AM',
    date: 'Today',
    attendees: 15,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  },
  {
    id: '2',
    title: 'Bible Study Group',
    time: '7:00 PM',
    date: 'Tomorrow',
    attendees: 8,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  },
  {
    id: '3',
    title: 'Youth Group Retreat',
    time: '9:00 AM',
    date: 'Saturday',
    attendees: 25,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  }
]

const AdminDashboard: React.FC = () => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'visitor':
        return <UserGroupIcon className="h-4 w-4" />
      case 'prayer':
        return <HeartIcon className="h-4 w-4" />
      case 'chat':
        return <ChatBubbleLeftRightIcon className="h-4 w-4" />
      case 'event':
        return <CalendarDaysIcon className="h-4 w-4" />
      default:
        return <ClockIcon className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: ActivityItem['type'], status?: string) => {
    if (status === 'urgent') {
      return 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
    }
    switch (type) {
      case 'visitor':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
      case 'prayer':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
      case 'chat':
        return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
      case 'event':
        return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'urgent':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening at your church today.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Last updated: {formatDate(new Date())}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Today's Visitors"
          value={15}
          change={25}
          changeLabel="vs yesterday"
          icon={UserGroupIcon}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
        />
        <MetricCard
          title="Active Conversations"
          value={8}
          change={12}
          changeLabel="this hour"
          icon={ChatBubbleLeftRightIcon}
          color="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
        />
        <MetricCard
          title="Prayer Requests"
          value={23}
          change={-8}
          changeLabel="vs last week"
          icon={HeartIcon}
          color="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
        />
        <MetricCard
          title="Upcoming Events"
          value={7}
          change={15}
          changeLabel="this month"
          icon={CalendarDaysIcon}
          color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            <button className="text-sm text-brand-primary-600 dark:text-brand-primary-400 hover:text-brand-primary-700 dark:hover:text-brand-primary-300 flex items-center">
              <EyeIcon className="h-4 w-4 mr-1" />
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className={cn('p-2 rounded-lg', getActivityColor(activity.type, activity.status))}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.title}
                    </p>
                    {getStatusIcon(activity.status)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</h3>
            <button className="text-sm text-brand-primary-600 dark:text-brand-primary-400 hover:text-brand-primary-700 dark:hover:text-brand-primary-300 flex items-center">
              <CalendarDaysIcon className="h-4 w-4 mr-1" />
              Manage Events
            </button>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {event.date} at {event.time}
                  </p>
                </div>
                <div className="text-right">
                  <div className={cn('inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', event.color)}>
                    {event.attendees} registered
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-brand-primary-50 to-brand-secondary-50 dark:from-brand-primary-900/20 dark:to-brand-secondary-900/20 rounded-xl p-8"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left group">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                <UserGroupIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">New Visitor</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add manually</p>
              </div>
            </div>
          </button>
          <button className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left group">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Send Message</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Bulk communication</p>
              </div>
            </div>
          </button>
          <button className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left group">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                <CalendarDaysIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Create Event</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">New service or event</p>
              </div>
            </div>
          </button>
          <button className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left group">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 rounded-lg group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800 transition-colors">
                <HeartIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Prayer Teams</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage assignments</p>
              </div>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminDashboard