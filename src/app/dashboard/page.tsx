'use client'

import React, { useState } from 'react'
import { Tab } from '@headlessui/react'
import {
  ChartBarIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard'
import VisitorManagement from '@/components/dashboard/VisitorManagement'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Analytics', icon: ChartBarIcon, component: AnalyticsDashboard },
  { name: 'Visitors', icon: UserGroupIcon, component: VisitorManagement },
  { name: 'Conversations', icon: ChatBubbleLeftRightIcon, component: () => <ComingSoon title="Chat Conversations" /> },
  { name: 'Settings', icon: CogIcon, component: () => <ComingSoon title="Settings" /> },
]

const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
  <div className="text-center py-20">
    <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
      <CogIcon className="h-12 w-12 text-gray-400" />
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-4">{title} Coming Soon</h2>
    <p className="text-gray-600 max-w-md mx-auto">
      We're working hard to bring you this feature. Stay tuned for updates!
    </p>
  </div>
)

export default function DashboardPage() {
  const [selectedIndex, setSelectedIndex] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white shadow-sm">
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-6 pb-5">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-r from-primary-500 to-church-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">VC</span>
                </div>
                <span className="text-xl font-bold text-gray-900">VisionaryChurch</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="mt-5 flex-1 px-3 space-y-1">
              {navigation.map((item, index) => (
                <button
                  key={item.name}
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-lg w-full text-left transition-colors duration-200',
                    index === selectedIndex
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 flex-shrink-0 h-5 w-5',
                      index === selectedIndex ? 'text-primary-600' : 'text-gray-400'
                    )}
                  />
                  {item.name}
                </button>
              ))}
            </nav>

            {/* User Info */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-600">JD</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">John Doe</p>
                  <p className="text-xs text-gray-500">Grace Community</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white shadow-sm px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-gradient-to-r from-primary-500 to-church-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">VC</span>
              </div>
              <span className="font-bold text-gray-900">Dashboard</span>
            </div>
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
            <Tab.List className="lg:hidden bg-white border-b border-gray-200 px-4 overflow-x-auto">
              <div className="flex space-x-8">
                {navigation.map((item, index) => (
                  <Tab
                    key={item.name}
                    className={({ selected }) =>
                      cn(
                        'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none transition-colors duration-200',
                        selected
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      )
                    }
                  >
                    {item.name}
                  </Tab>
                ))}
              </div>
            </Tab.List>

            <Tab.Panels className="flex-1">
              {navigation.map((item, index) => (
                <Tab.Panel key={item.name} className="p-6 lg:p-8">
                  <item.component />
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>

          {/* Desktop Content */}
          <div className="hidden lg:block flex-1 p-8">
            {React.createElement(navigation[selectedIndex].component)}
          </div>
        </div>
      </div>
    </div>
  )
}