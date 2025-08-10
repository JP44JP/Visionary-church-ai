'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  TrendingUpIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import type { AnalyticsData } from '@/types'

interface AnalyticsDashboardProps {
  data?: AnalyticsData
  loading?: boolean
}

const defaultData: AnalyticsData = {
  totalVisitors: 247,
  confirmedVisits: 189,
  conversionRate: 76.5,
  averagePartySize: 2.3,
  monthlyGrowth: 23.4,
  popularServices: [
    {
      service: {
        id: '1',
        dayOfWeek: 0,
        time: '11:00',
        name: 'Second Service',
        description: 'Contemporary worship'
      },
      count: 89
    },
    {
      service: {
        id: '2',
        dayOfWeek: 0,
        time: '09:00',
        name: 'First Service',
        description: 'Traditional worship'
      },
      count: 67
    }
  ],
  weeklyStats: [
    { week: 'Week 1', visitors: 45, conversions: 34 },
    { week: 'Week 2', visitors: 52, conversions: 41 },
    { week: 'Week 3', visitors: 67, conversions: 52 },
    { week: 'Week 4', visitors: 83, conversions: 62 }
  ]
}

const StatCard: React.FC<{
  title: string
  value: string | number
  change?: number
  icon: React.ComponentType<{ className?: string }>
  color: string
}> = ({ title, value, change, icon: Icon, color }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change !== undefined && (
            <div className={cn(
              'flex items-center mt-2 text-sm',
              change >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {change >= 0 ? (
                <ArrowUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 mr-1" />
              )}
              {Math.abs(change)}% vs last month
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

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  data = defaultData,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your church's visitor engagement and growth</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Visitors"
          value={data.totalVisitors}
          change={data.monthlyGrowth}
          icon={UserGroupIcon}
          color="bg-primary-100 text-primary-600"
        />
        <StatCard
          title="Confirmed Visits"
          value={data.confirmedVisits}
          change={18.2}
          icon={CalendarDaysIcon}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          title="Conversion Rate"
          value={`${data.conversionRate}%`}
          change={5.4}
          icon={TrendingUpIcon}
          color="bg-church-100 text-church-600"
        />
        <StatCard
          title="Avg. Party Size"
          value={data.averagePartySize}
          icon={ChatBubbleLeftRightIcon}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Weekly Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Visitor Trends</h3>
          <div className="space-y-4">
            {data.weeklyStats.map((week, index) => {
              const conversionRate = Math.round((week.conversions / week.visitors) * 100)
              return (
                <div key={week.week} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-600 w-16">{week.week}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900">{week.visitors} visitors</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-sm text-green-600">{week.conversions} converted</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">{conversionRate}%</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${conversionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Popular Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Most Popular Services</h3>
          <div className="space-y-4">
            {data.popularServices.map((item, index) => {
              const percentage = Math.round((item.count / data.totalVisitors) * 100)
              const getDayName = (dayOfWeek: number) => {
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                return days[dayOfWeek]
              }
              const formatTime = (time: string) => {
                const [hours, minutes] = time.split(':')
                const hour12 = parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours)
                const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM'
                return `${hour12 === 0 ? 12 : hour12}:${minutes} ${ampm}`
              }

              return (
                <div key={item.service.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.service.name}</p>
                      <p className="text-sm text-gray-600">
                        {getDayName(item.service.dayOfWeek)} {formatTime(item.service.time)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{item.count} visitors</p>
                      <p className="text-sm text-gray-500">{percentage}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-church-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Additional Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-primary-50 to-church-50 rounded-xl p-8"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Key Insights</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-2">
              {Math.round(data.monthlyGrowth)}%
            </div>
            <p className="text-sm text-gray-600">
              Monthly visitor growth rate
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {Math.round((data.confirmedVisits / data.totalVisitors) * 100)}%
            </div>
            <p className="text-sm text-gray-600">
              Visitors who attend services
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-church-600 mb-2">
              {data.averagePartySize}
            </div>
            <p className="text-sm text-gray-600">
              Average group size per visit
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AnalyticsDashboard