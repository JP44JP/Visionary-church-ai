'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  HeartIcon,
  CalendarDaysIcon,
  EnvelopeIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  MegaphoneIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import AdminDashboard from '@/components/admin/AdminDashboard'
import ChatWidgetManagement from '@/components/admin/ChatWidgetManagement'
import VisitorManagement from '@/components/admin/VisitorManagement'
import CommunicationCenter from '@/components/admin/CommunicationCenter'
import PrayerRequestDashboard from '@/components/admin/PrayerRequestDashboard'
import EventAdministration from '@/components/admin/EventAdministration'
import ChurchSettings from '@/components/admin/ChurchSettings'
import ReportsAnalytics from '@/components/admin/ReportsAnalytics'

interface NavigationItem {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  component: React.ComponentType
  badge?: string
}

const navigation: NavigationItem[] = [
  { 
    id: 'dashboard', 
    name: 'Dashboard', 
    icon: ChartBarIcon, 
    component: AdminDashboard 
  },
  { 
    id: 'chat-widget', 
    name: 'Chat Widget', 
    icon: ChatBubbleLeftRightIcon, 
    component: ChatWidgetManagement,
    badge: '3'
  },
  { 
    id: 'visitors', 
    name: 'Visitors', 
    icon: UserGroupIcon, 
    component: VisitorManagement,
    badge: '12'
  },
  { 
    id: 'communication', 
    name: 'Communication', 
    icon: EnvelopeIcon, 
    component: CommunicationCenter 
  },
  { 
    id: 'prayer-requests', 
    name: 'Prayer Requests', 
    icon: HeartIcon, 
    component: PrayerRequestDashboard,
    badge: '7'
  },
  { 
    id: 'events', 
    name: 'Events', 
    icon: CalendarDaysIcon, 
    component: EventAdministration 
  },
  { 
    id: 'reports', 
    name: 'Reports & Analytics', 
    icon: MegaphoneIcon, 
    component: ReportsAnalytics 
  },
  { 
    id: 'settings', 
    name: 'Church Settings', 
    icon: CogIcon, 
    component: ChurchSettings 
  }
]

export default function AdminPage() {
  const [selectedNavId, setSelectedNavId] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const selectedItem = navigation.find(item => item.id === selectedNavId) || navigation[0]

  // Handle sidebar toggle on mobile
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors", darkMode && "dark")}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-r from-brand-primary-500 to-brand-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">VC</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">VisionaryChurch.ai</p>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedNavId(item.id)
                  setSidebarOpen(false)
                }}
                className={cn(
                  'w-full group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200',
                  selectedNavId === item.id
                    ? 'bg-brand-primary-50 text-brand-primary-600 dark:bg-brand-primary-900/50 dark:text-brand-primary-300'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 flex-shrink-0 h-5 w-5',
                    selectedNavId === item.id 
                      ? 'text-brand-primary-600 dark:text-brand-primary-300' 
                      : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                  )}
                />
                <span className="flex-1 text-left">{item.name}</span>
                {item.badge && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-primary-100 text-brand-primary-800 dark:bg-brand-primary-800 dark:text-brand-primary-200">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-brand-primary-100 dark:bg-brand-primary-800 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-brand-primary-600 dark:text-brand-primary-300" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Pastor John</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Grace Community Church</p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="ml-2 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Toggle Dark Mode"
              >
                {darkMode ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white dark:bg-gray-800 shadow-sm px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="font-semibold text-gray-900 dark:text-white">{selectedItem.name}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 relative">
              <BellIcon className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {darkMode ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          <motion.div
            key={selectedNavId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <selectedItem.component />
          </motion.div>
        </main>
      </div>
    </div>
  )
}