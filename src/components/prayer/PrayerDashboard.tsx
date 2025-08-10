'use client'

import React, { useState, useEffect } from 'react'
import { PrayerRequest, PrayerAnalytics, PrayerTeam } from '../../types'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Tabs } from '../ui/Tabs'
import { Modal } from '../ui/Modal'
import { PrayerRequestDetail } from './PrayerRequestDetail'
import { PrayerAnalyticsDashboard } from './PrayerAnalyticsDashboard'
import { TeamManagement } from './TeamManagement'

interface PrayerDashboardProps {
  churchId: string
  userRole: string
  userId: string
}

export function PrayerDashboard({ churchId, userRole, userId }: PrayerDashboardProps) {
  const [activeTab, setActiveTab] = useState('requests')
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([])
  const [analytics, setAnalytics] = useState<PrayerAnalytics | null>(null)
  const [teams, setTeams] = useState<PrayerTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<PrayerRequest | null>(null)
  const [filter, setFilter] = useState({
    status: [] as string[],
    category: [] as string[],
    urgency: [] as string[],
    assignedToMe: false
  })

  const isAdmin = ['church_admin', 'prayer_team_leader', 'super_admin'].includes(userRole)
  const isTeamMember = ['prayer_team_member', 'prayer_team_leader'].includes(userRole)

  useEffect(() => {
    loadDashboardData()
  }, [churchId, filter])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadPrayerRequests(),
        isAdmin && loadAnalytics(),
        isAdmin && loadTeams()
      ])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPrayerRequests = async () => {
    try {
      const params = new URLSearchParams()
      
      if (filter.status.length) {
        filter.status.forEach(status => params.append('status', status))
      }
      if (filter.category.length) {
        filter.category.forEach(category => params.append('category', category))
      }
      if (filter.urgency.length) {
        filter.urgency.forEach(urgency => params.append('urgency', urgency))
      }
      if (filter.assignedToMe) {
        params.append('assigned_to', userId)
      }

      const endpoint = isTeamMember 
        ? `/api/prayers/team/${userId}?${params}`
        : `/api/prayers?church_id=${churchId}&${params}`

      const response = await fetch(endpoint)
      const result = await response.json()

      if (result.success) {
        setPrayerRequests(result.data)
      }
    } catch (error) {
      console.error('Error loading prayer requests:', error)
    }
  }

  const loadAnalytics = async () => {
    if (!isAdmin) return

    try {
      const response = await fetch('/api/admin/prayers/analytics')
      const result = await response.json()

      if (result.success) {
        setAnalytics(result.data)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  const loadTeams = async () => {
    if (!isAdmin) return

    try {
      const response = await fetch(`/api/prayers/teams?church_id=${churchId}`)
      const result = await response.json()

      if (result.success) {
        setTeams(result.data)
      }
    } catch (error) {
      console.error('Error loading teams:', error)
    }
  }

  const handleStatusUpdate = async (requestId: string, status: string) => {
    try {
      const response = await fetch(`/api/prayers/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      const result = await response.json()

      if (result.success) {
        setPrayerRequests(prev => 
          prev.map(req => 
            req.id === requestId ? { ...req, status } : req
          )
        )
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const getPriorityColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800'
      case 'urgent': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'assigned': return 'bg-purple-100 text-purple-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'praying': return 'bg-indigo-100 text-indigo-800'
      case 'answered': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const tabs = [
    { id: 'requests', label: 'Prayer Requests', count: prayerRequests.length },
    ...(isAdmin ? [
      { id: 'analytics', label: 'Analytics', count: null },
      { id: 'teams', label: 'Team Management', count: teams.length }
    ] : [])
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Prayer Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage prayer requests and support our community in prayer
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="text-2xl font-bold text-blue-600">{prayerRequests.length}</div>
          <div className="text-sm text-gray-600">Total Requests</div>
        </Card>
        <Card className="p-6">
          <div className="text-2xl font-bold text-yellow-600">
            {prayerRequests.filter(r => r.status === 'assigned' || r.status === 'in_progress').length}
          </div>
          <div className="text-sm text-gray-600">Active Requests</div>
        </Card>
        <Card className="p-6">
          <div className="text-2xl font-bold text-green-600">
            {prayerRequests.filter(r => r.status === 'answered').length}
          </div>
          <div className="text-sm text-gray-600">Answered</div>
        </Card>
        <Card className="p-6">
          <div className="text-2xl font-bold text-red-600">
            {prayerRequests.filter(r => r.urgency === 'emergency').length}
          </div>
          <div className="text-sm text-gray-600">Emergency</div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-6"
      />

      {/* Tab Content */}
      {activeTab === 'requests' && (
        <div>
          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select
                  multiple
                  className="text-sm border-gray-300 rounded-md"
                  value={filter.status}
                  onChange={(e) => setFilter(prev => ({
                    ...prev,
                    status: Array.from(e.target.selectedOptions, option => option.value)
                  }))}
                >
                  <option value="submitted">Submitted</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="praying">Praying</option>
                  <option value="answered">Answered</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Urgency:</label>
                <select
                  multiple
                  className="text-sm border-gray-300 rounded-md"
                  value={filter.urgency}
                  onChange={(e) => setFilter(prev => ({
                    ...prev,
                    urgency: Array.from(e.target.selectedOptions, option => option.value)
                  }))}
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filter.assignedToMe}
                  onChange={(e) => setFilter(prev => ({
                    ...prev,
                    assignedToMe: e.target.checked
                  }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Assigned to me</span>
              </label>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilter({
                  status: [],
                  category: [],
                  urgency: [],
                  assignedToMe: false
                })}
              >
                Clear Filters
              </Button>
            </div>
          </Card>

          {/* Prayer Requests List */}
          <div className="grid gap-4">
            {prayerRequests.map((request) => (
              <Card key={request.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{request.title}</h3>
                      <Badge className={getPriorityColor(request.urgency)}>
                        {request.urgency}
                      </Badge>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {request.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Category: {request.category}</span>
                      <span>•</span>
                      <span>Submitted: {new Date(request.created_at).toLocaleDateString()}</span>
                      {!request.is_anonymous && request.requester_name && (
                        <>
                          <span>•</span>
                          <span>From: {request.requester_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                    >
                      View Details
                    </Button>
                    
                    {(isTeamMember || isAdmin) && (
                      <select
                        value={request.status}
                        onChange={(e) => handleStatusUpdate(request.id, e.target.value)}
                        className="text-sm border-gray-300 rounded-md"
                      >
                        <option value="submitted">Submitted</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="praying">Praying</option>
                        <option value="follow_up_needed">Follow-up Needed</option>
                        <option value="answered">Answered</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="closed">Closed</option>
                      </select>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            
            {prayerRequests.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-gray-600">No prayer requests found matching your filters.</p>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && isAdmin && analytics && (
        <PrayerAnalyticsDashboard analytics={analytics} />
      )}

      {activeTab === 'teams' && isAdmin && (
        <TeamManagement teams={teams} onTeamsUpdate={loadTeams} />
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <Modal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title={selectedRequest.title}
          size="lg"
        >
          <PrayerRequestDetail
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onUpdate={loadPrayerRequests}
          />
        </Modal>
      )}
    </div>
  )
}