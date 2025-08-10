'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  HeartIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  TagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  CalendarDaysIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { cn, formatDate, getRelativeTime } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { TextArea } from '@/components/ui/TextArea'
import { Modal } from '@/components/ui/Modal'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { PrayerRequest, PrayerTeam, PrayerTeamMember } from '@/types'

const samplePrayerRequests: PrayerRequest[] = [
  {
    id: '1',
    church_id: 'church_1',
    requester_name: 'Sarah Johnson',
    requester_email: 'sarah@email.com',
    requester_phone: '(555) 123-4567',
    title: 'Healing for my mother',
    description: 'My mother was recently diagnosed with cancer and is starting chemotherapy. Please pray for her healing, strength, and peace during this difficult time.',
    category: 'healing',
    urgency: 'urgent',
    privacy_level: 'prayer_team_only',
    status: 'assigned',
    is_anonymous: false,
    allow_updates: true,
    tags: ['cancer', 'family', 'healing'],
    metadata: {
      source: 'web_form',
      has_sensitive_info: true,
      estimated_duration: '3-6 months'
    },
    assigned_team_members: ['member_1', 'member_2'],
    created_at: new Date('2024-08-15T10:30:00Z').toISOString(),
    updated_at: new Date('2024-08-15T14:20:00Z').toISOString()
  },
  {
    id: '2',
    church_id: 'church_1',
    requester_name: 'Michael Davis',
    requester_email: 'mike.davis@email.com',
    title: 'Job opportunity',
    description: 'I\'ve been unemployed for 3 months and have an important interview tomorrow. Please pray for God\'s will and guidance in this opportunity.',
    category: 'employment',
    urgency: 'routine',
    privacy_level: 'public',
    status: 'in_progress',
    is_anonymous: false,
    allow_updates: true,
    tags: ['employment', 'guidance'],
    metadata: {
      source: 'chat_widget',
      has_sensitive_info: false,
      follow_up_date: new Date('2024-08-16').toISOString()
    },
    assigned_team_members: ['member_3'],
    created_at: new Date('2024-08-14T16:45:00Z').toISOString(),
    updated_at: new Date('2024-08-15T09:10:00Z').toISOString()
  },
  {
    id: '3',
    church_id: 'church_1',
    requester_name: 'Anonymous',
    title: 'Marriage struggles',
    description: 'Please pray for my marriage. We are going through a very difficult time and considering separation. I need wisdom and healing for our relationship.',
    category: 'relationships',
    urgency: 'emergency',
    privacy_level: 'leadership_only',
    status: 'praying',
    is_anonymous: true,
    allow_updates: false,
    tags: ['marriage', 'relationships', 'crisis'],
    metadata: {
      source: 'phone',
      has_sensitive_info: true,
      estimated_duration: 'ongoing'
    },
    assigned_team_members: ['member_1', 'member_4'],
    created_at: new Date('2024-08-13T20:15:00Z').toISOString(),
    updated_at: new Date('2024-08-15T11:30:00Z').toISOString()
  },
  {
    id: '4',
    church_id: 'church_1',
    requester_name: 'Jennifer Brown',
    requester_email: 'jennifer@email.com',
    requester_phone: '(555) 987-6543',
    title: 'Thanksgiving for answered prayer',
    description: 'I want to thank everyone who prayed for my son\'s recovery. He is now doing much better after his surgery and the doctors are very pleased with his progress!',
    category: 'thanksgiving',
    urgency: 'routine',
    privacy_level: 'public',
    status: 'answered',
    is_anonymous: false,
    allow_updates: true,
    tags: ['thanksgiving', 'children', 'surgery'],
    metadata: {
      source: 'email',
      has_sensitive_info: false
    },
    assigned_team_members: ['member_2'],
    created_at: new Date('2024-08-10T14:20:00Z').toISOString(),
    updated_at: new Date('2024-08-15T16:45:00Z').toISOString()
  },
  {
    id: '5',
    church_id: 'church_1',
    requester_name: 'Robert Wilson',
    requester_phone: '(555) 456-7890',
    title: 'Financial hardship',
    description: 'Lost my job last month and struggling to pay bills and rent. Please pray for provision and new employment opportunities.',
    category: 'financial',
    urgency: 'urgent',
    privacy_level: 'prayer_team_only',
    status: 'submitted',
    is_anonymous: false,
    allow_updates: true,
    tags: ['employment', 'financial', 'provision'],
    metadata: {
      source: 'in_person',
      has_sensitive_info: true,
      follow_up_date: new Date('2024-08-18').toISOString()
    },
    assigned_team_members: [],
    created_at: new Date('2024-08-15T09:00:00Z').toISOString(),
    updated_at: new Date('2024-08-15T09:00:00Z').toISOString()
  }
]

const sampleTeamMembers: PrayerTeamMember[] = [
  {
    id: 'member_1',
    user_id: 'user_1',
    team_id: 'team_1',
    role: 'leader',
    specialties: ['healing', 'grief', 'family'],
    availability: {
      schedule: {
        monday: { available: true, start_time: '09:00', end_time: '17:00' },
        tuesday: { available: true, start_time: '09:00', end_time: '17:00' },
        wednesday: { available: true, start_time: '09:00', end_time: '17:00' },
        thursday: { available: true, start_time: '09:00', end_time: '17:00' },
        friday: { available: true, start_time: '09:00', end_time: '17:00' },
        saturday: { available: false },
        sunday: { available: true, start_time: '08:00', end_time: '12:00' }
      },
      timezone: 'America/Chicago',
      on_call_available: true,
      max_emergency_requests: 3
    },
    current_load: 4,
    max_capacity: 8,
    is_active: true,
    phone: '(555) 111-2222',
    email: 'mary.leader@church.com',
    emergency_contact: true,
    joined_at: new Date('2024-01-01').toISOString(),
    user: {
      id: 'user_1',
      email: 'mary.leader@church.com',
      full_name: 'Mary Johnson',
      role: 'prayer_team_leader',
      created_at: new Date('2024-01-01').toISOString(),
      updated_at: new Date('2024-01-01').toISOString()
    }
  },
  {
    id: 'member_2',
    user_id: 'user_2',
    team_id: 'team_1',
    role: 'member',
    specialties: ['thanksgiving', 'spiritual_growth', 'family'],
    availability: {
      schedule: {
        monday: { available: true, start_time: '18:00', end_time: '21:00' },
        tuesday: { available: true, start_time: '18:00', end_time: '21:00' },
        wednesday: { available: false },
        thursday: { available: true, start_time: '18:00', end_time: '21:00' },
        friday: { available: false },
        saturday: { available: true, start_time: '10:00', end_time: '14:00' },
        sunday: { available: true, start_time: '14:00', end_time: '17:00' }
      },
      timezone: 'America/Chicago',
      on_call_available: false,
      max_emergency_requests: 1
    },
    current_load: 2,
    max_capacity: 5,
    is_active: true,
    email: 'john.member@church.com',
    emergency_contact: false,
    joined_at: new Date('2024-02-15').toISOString(),
    user: {
      id: 'user_2',
      email: 'john.member@church.com',
      full_name: 'John Smith',
      role: 'prayer_team_member',
      created_at: new Date('2024-02-15').toISOString(),
      updated_at: new Date('2024-02-15').toISOString()
    }
  }
]

const PrayerRequestDashboard: React.FC = () => {
  const [prayerRequests, setPrayerRequests] = useState(samplePrayerRequests)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [urgencyFilter, setUrgencyFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState<PrayerRequest | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [activeTab, setActiveTab] = useState('requests')

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'praying', label: 'Praying' },
    { value: 'follow_up_needed', label: 'Follow-up Needed' },
    { value: 'answered', label: 'Answered' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'closed', label: 'Closed' }
  ]

  const urgencyOptions = [
    { value: 'all', label: 'All Urgency' },
    { value: 'routine', label: 'Routine' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'emergency', label: 'Emergency' }
  ]

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'healing', label: 'Healing' },
    { value: 'guidance', label: 'Guidance' },
    { value: 'thanksgiving', label: 'Thanksgiving' },
    { value: 'family', label: 'Family' },
    { value: 'financial', label: 'Financial' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'grief', label: 'Grief' },
    { value: 'addiction', label: 'Addiction' },
    { value: 'mental_health', label: 'Mental Health' },
    { value: 'spiritual_growth', label: 'Spiritual Growth' },
    { value: 'salvation', label: 'Salvation' },
    { value: 'employment', label: 'Employment' },
    { value: 'protection', label: 'Protection' },
    { value: 'travel', label: 'Travel' },
    { value: 'other', label: 'Other' }
  ]

  const getStatusIcon = (status: PrayerRequest['status']) => {
    switch (status) {
      case 'submitted':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />
      case 'assigned':
        return <UserIcon className="h-4 w-4 text-blue-500" />
      case 'in_progress':
        return <ClockIcon className="h-4 w-4 text-orange-500" />
      case 'praying':
        return <HeartIcon className="h-4 w-4 text-purple-500" />
      case 'follow_up_needed':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
      case 'answered':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'ongoing':
        return <ClockIcon className="h-4 w-4 text-blue-500" />
      case 'closed':
        return <CheckCircleIcon className="h-4 w-4 text-gray-500" />
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: PrayerRequest['status']) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'assigned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'in_progress':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'praying':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'follow_up_needed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'answered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'ongoing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getUrgencyColor = (urgency: PrayerRequest['urgency']) => {
    switch (urgency) {
      case 'emergency':
        return 'bg-red-500 text-white'
      case 'urgent':
        return 'bg-orange-500 text-white'
      case 'routine':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getPrivacyIcon = (privacyLevel: PrayerRequest['privacy_level']) => {
    switch (privacyLevel) {
      case 'public':
        return '🌍'
      case 'prayer_team_only':
        return '👥'
      case 'leadership_only':
        return '👑'
      case 'private':
        return '🔒'
      default:
        return '❓'
    }
  }

  const filteredRequests = prayerRequests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.requester_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesUrgency = urgencyFilter === 'all' || request.urgency === urgencyFilter
    const matchesCategory = categoryFilter === 'all' || request.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesUrgency && matchesCategory
  })

  const handleStatusUpdate = (requestId: string, newStatus: PrayerRequest['status']) => {
    setPrayerRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { ...request, status: newStatus, updated_at: new Date().toISOString() }
        : request
    ))
  }

  const renderRequests = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{prayerRequests.length}</p>
            </div>
            <HeartIcon className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgent/Emergency</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {prayerRequests.filter(r => r.urgency === 'urgent' || r.urgency === 'emergency').length}
              </p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {prayerRequests.filter(r => r.status === 'in_progress' || r.status === 'praying').length}
              </p>
            </div>
            <ClockIcon className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Answered</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {prayerRequests.filter(r => r.status === 'answered').length}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
          <Select
            options={urgencyOptions}
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
          />
          <Select
            options={categoryOptions}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
          <Button variant="outline">
            <FunnelIcon className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </Card>

      {/* Prayer Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request, index) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              setSelectedRequest(request)
              setShowDetailModal(true)
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 pt-1">
                    <div className={cn('w-3 h-3 rounded-full', getUrgencyColor(request.urgency))} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {request.title}
                      </h4>
                      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(request.status))}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status.replace('_', ' ')}</span>
                      </span>
                      <span className="text-sm">
                        {getPrivacyIcon(request.privacy_level)}
                      </span>
                      {request.is_anonymous && (
                        <Badge variant="outline" className="text-xs">Anonymous</Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {request.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1" />
                          {request.is_anonymous ? 'Anonymous' : request.requester_name}
                        </div>
                        <div className="flex items-center">
                          <TagIcon className="h-4 w-4 mr-1" />
                          <span className="capitalize">{request.category}</span>
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {getRelativeTime(new Date(request.created_at))}
                        </div>
                        {request.assigned_team_members.length > 0 && (
                          <div className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            {request.assigned_team_members.length} assigned
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {request.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {request.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                            +{request.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedRequest(request)
                    setShowAssignModal(true)
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Assign"
                >
                  <UserGroupIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedRequest(request)
                    setShowResponseModal(true)
                  }}
                  className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                  title="Respond"
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedRequest(request)
                    setShowDetailModal(true)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No prayer requests found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Prayer requests will appear here as they are submitted.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )

  const renderTeamManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Prayer Team Management</h3>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Members</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {sampleTeamMembers.filter(m => m.is_active).length}
              </p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Load</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {sampleTeamMembers.reduce((sum, m) => sum + m.current_load, 0)}
              </p>
            </div>
            <ClockIcon className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Capacity</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {sampleTeamMembers.reduce((sum, m) => sum + (m.max_capacity - m.current_load), 0)}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Team Members */}
      <div className="space-y-4">
        {sampleTeamMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-300">
                    {member.user.full_name?.split(' ').map(n => n.charAt(0)).join('')}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {member.user.full_name}
                    </h4>
                    <Badge variant={member.role === 'leader' ? 'default' : 'outline'}>
                      {member.role}
                    </Badge>
                    {member.emergency_contact && (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Emergency Contact
                      </Badge>
                    )}
                    <span className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      member.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    )}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <EnvelopeIcon className="h-4 w-4 mr-2" />
                        {member.email}
                      </div>
                      {member.phone && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <PhoneIcon className="h-4 w-4 mr-2" />
                          {member.phone}
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <CalendarDaysIcon className="h-4 w-4 mr-2" />
                        Joined {formatDate(new Date(member.joined_at))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Load:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {member.current_load}/{member.max_capacity}
                        </span>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                          <div
                            className={cn(
                              'h-2 rounded-full',
                              member.current_load / member.max_capacity > 0.8 ? 'bg-red-500' :
                              member.current_load / member.max_capacity > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                            )}
                            style={{ width: `${(member.current_load / member.max_capacity) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">On-call:</span>
                        <span className={cn(
                          'ml-2 px-2 py-1 rounded text-xs font-medium',
                          member.availability.on_call_available
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        )}>
                          {member.availability.on_call_available ? 'Available' : 'Not Available'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Specialties:</h5>
                    <div className="flex flex-wrap gap-2">
                      {member.specialties.map(specialty => (
                        <span key={specialty} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                          {specialty.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const tabs = [
    { id: 'requests', label: 'Prayer Requests', icon: HeartIcon },
    { id: 'team', label: 'Team Management', icon: UserGroupIcon },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Prayer Request Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage prayer requests, team assignments, and follow-up communications
          </p>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Prayer Request
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors',
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
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'team' && renderTeamManagement()}
        {activeTab === 'analytics' && (
          <div className="text-center py-20">
            <div className="mx-auto h-24 w-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
              <ChartBarIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Prayer Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Detailed analytics and insights for your prayer ministry coming soon!
            </p>
          </div>
        )}
      </div>

      {/* Prayer Request Detail Modal */}
      {selectedRequest && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={selectedRequest.title}
          size="lg"
        >
          <div className="space-y-6">
            {/* Status and Urgency */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={cn('inline-flex items-center px-3 py-2 rounded-full', getStatusColor(selectedRequest.status))}>
                  {getStatusIcon(selectedRequest.status)}
                  <span className="ml-2 font-medium">{selectedRequest.status.replace('_', ' ')}</span>
                </span>
                <Badge className={getUrgencyColor(selectedRequest.urgency)}>
                  {selectedRequest.urgency}
                </Badge>
                <span className="text-lg">
                  {getPrivacyIcon(selectedRequest.privacy_level)}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(new Date(selectedRequest.created_at))}
              </div>
            </div>

            {/* Requester Information */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Requester Information</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-medium">Name:</span> {selectedRequest.is_anonymous ? 'Anonymous' : selectedRequest.requester_name}</p>
                  {!selectedRequest.is_anonymous && selectedRequest.requester_email && (
                    <p><span className="font-medium">Email:</span> {selectedRequest.requester_email}</p>
                  )}
                  {!selectedRequest.is_anonymous && selectedRequest.requester_phone && (
                    <p><span className="font-medium">Phone:</span> {selectedRequest.requester_phone}</p>
                  )}
                </div>
                <div>
                  <p><span className="font-medium">Category:</span> {selectedRequest.category}</p>
                  <p><span className="font-medium">Source:</span> {selectedRequest.metadata.source.replace('_', ' ')}</p>
                  <p><span className="font-medium">Allow Updates:</span> {selectedRequest.allow_updates ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Prayer Request</h4>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300">{selectedRequest.description}</p>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {selectedRequest.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Assignment */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Assignment</h4>
              <div className="space-y-2">
                {selectedRequest.assigned_team_members.length > 0 ? (
                  <div className="flex items-center space-x-2">
                    <UserGroupIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Assigned to {selectedRequest.assigned_team_members.length} team member{selectedRequest.assigned_team_members.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-yellow-600 dark:text-yellow-400">
                      Not yet assigned
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailModal(false)
                  setShowAssignModal(true)
                }}
              >
                <UserGroupIcon className="h-4 w-4 mr-2" />
                Assign
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailModal(false)
                  setShowResponseModal(true)
                }}
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                Respond
              </Button>
              <Button>
                Update Status
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Assignment Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Prayer Request"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Team Members
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {sampleTeamMembers.map(member => (
                <label key={member.id} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                  <input type="checkbox" className="mr-3" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{member.user.full_name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {member.current_load}/{member.max_capacity} requests
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assignment Notes
            </label>
            <TextArea
              placeholder="Add any specific notes for the assigned team members..."
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAssignModal(false)}>
              Assign Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* Response Modal */}
      <Modal
        isOpen={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        title="Respond to Prayer Request"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Response Type
            </label>
            <Select
              options={[
                { value: 'prayer', label: 'Prayer Response' },
                { value: 'encouragement', label: 'Encouragement' },
                { value: 'scripture', label: 'Scripture Reference' },
                { value: 'resource', label: 'Resource/Referral' },
                { value: 'follow_up', label: 'Follow-up Question' }
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Response Message
            </label>
            <TextArea
              placeholder="Enter your response to this prayer request..."
              rows={6}
            />
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="public" className="mr-2" />
            <label htmlFor="public" className="text-sm text-gray-700 dark:text-gray-300">
              Make this response visible to the prayer team
            </label>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={() => setShowResponseModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowResponseModal(false)}>
              Send Response
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PrayerRequestDashboard