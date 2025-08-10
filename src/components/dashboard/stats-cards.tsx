'use client'

import { 
  UserGroupIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ChartBarSquareIcon
} from '@heroicons/react/24/outline'

interface StatsCardsProps {
  churchId: string
}

export function StatsCards({ churchId }: StatsCardsProps) {
  // TODO: Fetch real data from API
  const stats = [
    {
      title: 'Total Visitors',
      value: '147',
      change: '+12%',
      changeType: 'increase' as const,
      icon: UserGroupIcon,
      color: 'blue'
    },
    {
      title: 'Scheduled Visits',
      value: '23',
      change: '+3',
      changeType: 'increase' as const,
      icon: CalendarIcon,
      color: 'green'
    },
    {
      title: 'Chat Sessions',
      value: '89',
      change: '+8%',
      changeType: 'increase' as const,
      icon: ChatBubbleLeftRightIcon,
      color: 'purple'
    },
    {
      title: 'Conversion Rate',
      value: '32%',
      change: '+2%',
      changeType: 'increase' as const,
      icon: ChartBarSquareIcon,
      color: 'orange'
    }
  ]

  const colorClasses = {
    blue: {
      bg: 'bg-blue-500',
      text: 'text-blue-600',
      lightBg: 'bg-blue-50'
    },
    green: {
      bg: 'bg-green-500',
      text: 'text-green-600',
      lightBg: 'bg-green-50'
    },
    purple: {
      bg: 'bg-purple-500',
      text: 'text-purple-600',
      lightBg: 'bg-purple-50'
    },
    orange: {
      bg: 'bg-orange-500',
      text: 'text-orange-600',
      lightBg: 'bg-orange-50'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const colors = colorClasses[stat.color as keyof typeof colorClasses]
        
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${colors.lightBg}`}>
                <stat.icon className={`w-6 h-6 ${colors.text}`} />
              </div>
              <div className={`text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}