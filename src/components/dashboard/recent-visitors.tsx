'use client'

interface RecentVisitorsProps {
  churchId: string
}

export function RecentVisitors({ churchId }: RecentVisitorsProps) {
  // TODO: Fetch real data from API
  const recentVisitors = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      status: 'visit_scheduled',
      lastInteraction: '2 hours ago',
      visitDate: '2024-01-21'
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael@example.com',
      status: 'chat_active',
      lastInteraction: '5 hours ago',
      visitDate: null
    },
    {
      id: '3',
      name: 'Emily Davis',
      email: 'emily@example.com',
      status: 'visit_completed',
      lastInteraction: '1 day ago',
      visitDate: '2024-01-20'
    },
    {
      id: '4',
      name: 'Robert Wilson',
      email: 'robert@example.com',
      status: 'follow_up_needed',
      lastInteraction: '3 days ago',
      visitDate: '2024-01-22'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'visit_scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'chat_active':
        return 'bg-green-100 text-green-800'
      case 'visit_completed':
        return 'bg-purple-100 text-purple-800'
      case 'follow_up_needed':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'visit_scheduled':
        return 'Visit Scheduled'
      case 'chat_active':
        return 'Chat Active'
      case 'visit_completed':
        return 'Visit Completed'
      case 'follow_up_needed':
        return 'Follow-up Needed'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Visitors</h3>
        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {recentVisitors.map((visitor) => (
          <div key={visitor.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {visitor.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-medium text-gray-900">{visitor.name}</p>
                <p className="text-sm text-gray-600">{visitor.email}</p>
                <p className="text-xs text-gray-500">{visitor.lastInteraction}</p>
              </div>
            </div>

            <div className="text-right">
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(visitor.status)}`}>
                {getStatusText(visitor.status)}
              </span>
              {visitor.visitDate && (
                <p className="text-xs text-gray-500 mt-1">Visit: {visitor.visitDate}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {recentVisitors.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No recent visitors</p>
          <p className="text-sm text-gray-400 mt-1">Visitors will appear here when they interact with your church</p>
        </div>
      )}
    </div>
  )
}