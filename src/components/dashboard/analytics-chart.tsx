'use client'

interface AnalyticsChartProps {
  churchId: string
}

export function AnalyticsChart({ churchId }: AnalyticsChartProps) {
  // TODO: Implement actual chart with a library like Chart.js or Recharts
  // For now, we'll show a placeholder

  const mockData = [
    { day: 'Mon', visitors: 12, chats: 8 },
    { day: 'Tue', visitors: 15, chats: 12 },
    { day: 'Wed', visitors: 8, chats: 6 },
    { day: 'Thu', visitors: 22, chats: 18 },
    { day: 'Fri', visitors: 18, chats: 14 },
    { day: 'Sat', visitors: 25, chats: 20 },
    { day: 'Sun', visitors: 35, chats: 28 }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Weekly Activity</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
            <span className="text-gray-600">Visitors</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600">Chat Sessions</span>
          </div>
        </div>
      </div>

      {/* Simple Bar Chart Placeholder */}
      <div className="space-y-4">
        {mockData.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-8 text-sm text-gray-600 font-medium">{item.day}</div>
            <div className="flex-1 flex items-center space-x-2">
              {/* Visitors bar */}
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-primary-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(item.visitors / 40) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 w-6">{item.visitors}</span>
            </div>
            <div className="flex-1 flex items-center space-x-2">
              {/* Chats bar */}
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(item.chats / 30) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 w-6">{item.chats}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">135</p>
            <p className="text-sm text-gray-600">Total Visitors This Week</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">106</p>
            <p className="text-sm text-gray-600">Total Chat Sessions</p>
          </div>
        </div>
      </div>
    </div>
  )
}