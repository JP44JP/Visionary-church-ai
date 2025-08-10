'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  TagIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { cn, formatDate, getRelativeTime } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'

interface ExtendedVisitor {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  address?: string
  visitDate: Date
  status: 'pending' | 'confirmed' | 'attended' | 'cancelled' | 'no_show'
  source: 'website' | 'phone' | 'walk_in' | 'referral' | 'social_media'
  partySize: number
  kidsCount: number
  ageGroup?: 'under_18' | '18_25' | '26_35' | '36_50' | '51_65' | 'over_65'
  interests: string[]
  followUpStatus: 'not_contacted' | 'contacted' | 'scheduled' | 'completed'
  leadScore: number
  assignedStaff?: string
  notes: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  lastContactDate?: Date
}

const sampleVisitors: ExtendedVisitor[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    address: '123 Oak Street, Springfield, IL',
    visitDate: new Date('2024-08-18'),
    status: 'confirmed',
    source: 'website',
    partySize: 2,
    kidsCount: 1,
    ageGroup: '26_35',
    interests: ['children_ministry', 'small_groups', 'worship'],
    followUpStatus: 'contacted',
    leadScore: 85,
    assignedStaff: 'John Smith',
    notes: 'First time visitor interested in children\'s ministry. Has 5-year-old daughter.',
    tags: ['first_time', 'children', 'high_interest'],
    createdAt: new Date('2024-08-10'),
    updatedAt: new Date('2024-08-12'),
    lastContactDate: new Date('2024-08-12')
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Davis',
    email: 'mike.davis@email.com',
    phone: '(555) 987-6543',
    visitDate: new Date('2024-08-18'),
    status: 'pending',
    source: 'referral',
    partySize: 1,
    kidsCount: 0,
    ageGroup: '36_50',
    interests: ['men_ministry', 'community_service'],
    followUpStatus: 'not_contacted',
    leadScore: 60,
    notes: 'Referred by Tom Wilson. Interested in men\'s ministry and community outreach.',
    tags: ['referral', 'mens_ministry'],
    createdAt: new Date('2024-08-11'),
    updatedAt: new Date('2024-08-11')
  },
  {
    id: '3',
    firstName: 'Jennifer',
    lastName: 'Brown',
    email: 'jennifer.brown@email.com',
    phone: '(555) 456-7890',
    address: '456 Maple Ave, Springfield, IL',
    visitDate: new Date('2024-08-11'),
    status: 'attended',
    source: 'social_media',
    partySize: 3,
    kidsCount: 2,
    ageGroup: '26_35',
    interests: ['family_ministry', 'youth_programs', 'music'],
    followUpStatus: 'scheduled',
    leadScore: 92,
    assignedStaff: 'Mary Johnson',
    notes: 'Wonderful family! Kids loved the children\'s program. Very engaged during service.',
    tags: ['family', 'music', 'highly_engaged'],
    createdAt: new Date('2024-08-05'),
    updatedAt: new Date('2024-08-11'),
    lastContactDate: new Date('2024-08-11')
  },
  {
    id: '4',
    firstName: 'Robert',
    lastName: 'Wilson',
    email: 'robert.wilson@email.com',
    phone: '(555) 321-0987',
    visitDate: new Date('2024-08-04'),
    status: 'no_show',
    source: 'phone',
    partySize: 1,
    kidsCount: 0,
    ageGroup: 'over_65',
    interests: ['senior_ministry'],
    followUpStatus: 'contacted',
    leadScore: 30,
    notes: 'Called to follow up. Had a family emergency that prevented attendance.',
    tags: ['seniors', 'follow_up_needed'],
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-08-05'),
    lastContactDate: new Date('2024-08-05')
  }
]

const VisitorManagement: React.FC = () => {
  const [visitors, setVisitors] = useState(sampleVisitors)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [followUpFilter, setFollowUpFilter] = useState('all')
  const [selectedVisitors, setSelectedVisitors] = useState<string[]>([])
  const [selectedVisitor, setSelectedVisitor] = useState<ExtendedVisitor | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showBulkActionModal, setShowBulkActionModal] = useState(false)
  const [bulkAction, setBulkAction] = useState('')
  const [sortField, setSortField] = useState<keyof ExtendedVisitor>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'attended', label: 'Attended' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no_show', label: 'No Show' }
  ]

  const sourceOptions = [
    { value: 'all', label: 'All Sources' },
    { value: 'website', label: 'Website' },
    { value: 'phone', label: 'Phone' },
    { value: 'walk_in', label: 'Walk-in' },
    { value: 'referral', label: 'Referral' },
    { value: 'social_media', label: 'Social Media' }
  ]

  const followUpOptions = [
    { value: 'all', label: 'All Follow-up' },
    { value: 'not_contacted', label: 'Not Contacted' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' }
  ]

  const getStatusIcon = (status: ExtendedVisitor['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'attended':
        return <CheckCircleIcon className="h-4 w-4 text-blue-500" />
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4 text-red-500" />
      case 'no_show':
        return <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />
      default:
        return <ClockIcon className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: ExtendedVisitor['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'attended':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'no_show':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    }
  }

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getSourceIcon = (source: ExtendedVisitor['source']) => {
    switch (source) {
      case 'website':
        return '🌐'
      case 'phone':
        return '📞'
      case 'walk_in':
        return '🚶'
      case 'referral':
        return '👥'
      case 'social_media':
        return '📱'
      default:
        return '❓'
    }
  }

  const filteredAndSortedVisitors = visitors
    .filter(visitor => {
      const matchesSearch = 
        visitor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (visitor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (visitor.phone?.includes(searchTerm) ?? false)
      
      const matchesStatus = statusFilter === 'all' || visitor.status === statusFilter
      const matchesSource = sourceFilter === 'all' || visitor.source === sourceFilter
      const matchesFollowUp = followUpFilter === 'all' || visitor.followUpStatus === followUpFilter
      
      return matchesSearch && matchesStatus && matchesSource && matchesFollowUp
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  const handleVisitorSelect = (visitorId: string, selected: boolean) => {
    if (selected) {
      setSelectedVisitors(prev => [...prev, visitorId])
    } else {
      setSelectedVisitors(prev => prev.filter(id => id !== visitorId))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedVisitors(filteredAndSortedVisitors.map(v => v.id))
    } else {
      setSelectedVisitors([])
    }
  }

  const handleBulkAction = (action: string) => {
    setBulkAction(action)
    setShowBulkActionModal(true)
  }

  const handleStatusUpdate = (visitorId: string, newStatus: ExtendedVisitor['status']) => {
    setVisitors(prev => prev.map(visitor => 
      visitor.id === visitorId 
        ? { ...visitor, status: newStatus, updatedAt: new Date() }
        : visitor
    ))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Visitor Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track all your church visitors and prospects
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Visitor
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Visitors</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{visitors.length}</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {visitors.filter(v => new Date(v.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </p>
            </div>
            <CalendarDaysIcon className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Follow-up</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {visitors.filter(v => v.followUpStatus === 'not_contacted').length}
              </p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {Math.round((visitors.filter(v => v.status === 'attended').length / visitors.length) * 100)}%
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search visitors..."
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
            options={sourceOptions}
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          />
          <Select
            options={followUpOptions}
            value={followUpFilter}
            onChange={(e) => setFollowUpFilter(e.target.value)}
          />
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <FunnelIcon className="h-4 w-4 mr-1" />
              More Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedVisitors.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedVisitors.length} visitor{selectedVisitors.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('email')}
              >
                <EnvelopeIcon className="h-4 w-4 mr-1" />
                Send Email
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('tag')}
              >
                <TagIcon className="h-4 w-4 mr-1" />
                Add Tags
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('status')}
              >
                Update Status
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Visitors Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left">
                  <Checkbox
                    checked={selectedVisitors.length === filteredAndSortedVisitors.length && filteredAndSortedVisitors.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Visitor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Visit Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Follow-up
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Lead Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedVisitors.map((visitor, index) => (
                <motion.tr
                  key={visitor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Checkbox
                      checked={selectedVisitors.includes(visitor.id)}
                      onChange={(checked) => handleVisitorSelect(visitor.id, checked)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {visitor.firstName.charAt(0)}{visitor.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {visitor.firstName} {visitor.lastName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{visitor.email}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">{visitor.phone}</p>
                        {visitor.address && (
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 mt-1">
                            <MapPinIcon className="h-3 w-3 mr-1" />
                            {visitor.address}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {visitor.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(visitor.status))}>
                      {getStatusIcon(visitor.status)}
                      <span className="ml-1 capitalize">{visitor.status.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    <div>
                      <p>{formatDate(visitor.visitDate)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Party: {visitor.partySize} | Kids: {visitor.kidsCount}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    <div className="flex items-center">
                      <span className="mr-2">{getSourceIcon(visitor.source)}</span>
                      <span className="capitalize">{visitor.source.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="space-y-1">
                      <span className={cn(
                        'inline-flex px-2 py-1 rounded-full text-xs font-medium',
                        visitor.followUpStatus === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : visitor.followUpStatus === 'not_contacted'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      )}>
                        {visitor.followUpStatus.replace('_', ' ')}
                      </span>
                      {visitor.lastContactDate && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {getRelativeTime(visitor.lastContactDate)}
                        </p>
                      )}
                      {visitor.assignedStaff && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Assigned: {visitor.assignedStaff}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className={cn('font-bold', getLeadScoreColor(visitor.leadScore))}>
                      {visitor.leadScore}
                    </div>
                    <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                      <div
                        className={cn(
                          'h-1 rounded-full',
                          visitor.leadScore >= 80 ? 'bg-green-500' :
                          visitor.leadScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        )}
                        style={{ width: `${visitor.leadScore}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedVisitor(visitor)
                          setShowDetailModal(true)
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                      >
                        <EllipsisVerticalIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedVisitors.length === 0 && (
          <div className="text-center py-12">
            <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No visitors found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || sourceFilter !== 'all' || followUpFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Visitors will appear here once they submit visit requests.'}
            </p>
          </div>
        )}
      </Card>

      {/* Visitor Detail Modal */}
      {selectedVisitor && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`${selectedVisitor.firstName} ${selectedVisitor.lastName}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Status and Lead Score */}
            <div className="flex items-center justify-between">
              <div className={cn('inline-flex items-center px-3 py-2 rounded-full', getStatusColor(selectedVisitor.status))}>
                {getStatusIcon(selectedVisitor.status)}
                <span className="ml-2 font-medium capitalize">{selectedVisitor.status.replace('_', ' ')}</span>
              </div>
              <div className="text-right">
                <div className={cn('text-2xl font-bold', getLeadScoreColor(selectedVisitor.leadScore))}>
                  {selectedVisitor.leadScore}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Lead Score</div>
              </div>
            </div>

            {/* Contact and Visit Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Email:</span> {selectedVisitor.email || 'Not provided'}</p>
                  <p><span className="font-medium">Phone:</span> {selectedVisitor.phone || 'Not provided'}</p>
                  {selectedVisitor.address && (
                    <p><span className="font-medium">Address:</span> {selectedVisitor.address}</p>
                  )}
                  <p><span className="font-medium">Age Group:</span> {selectedVisitor.ageGroup?.replace('_', '-') || 'Not specified'}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Visit Details</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Visit Date:</span> {formatDate(selectedVisitor.visitDate)}</p>
                  <p><span className="font-medium">Party Size:</span> {selectedVisitor.partySize}</p>
                  <p><span className="font-medium">Children:</span> {selectedVisitor.kidsCount}</p>
                  <p><span className="font-medium">Source:</span> {getSourceIcon(selectedVisitor.source)} {selectedVisitor.source.replace('_', ' ')}</p>
                  <p><span className="font-medium">Submitted:</span> {formatDate(selectedVisitor.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Interests */}
            {selectedVisitor.interests.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedVisitor.interests.map(interest => (
                    <span key={interest} className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                      {interest.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up Status */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Follow-up Status</h4>
              <div className="flex items-center space-x-4">
                <span className={cn(
                  'inline-flex px-3 py-1 rounded-full text-sm font-medium',
                  selectedVisitor.followUpStatus === 'completed' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : selectedVisitor.followUpStatus === 'not_contacted'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                )}>
                  {selectedVisitor.followUpStatus.replace('_', ' ')}
                </span>
                {selectedVisitor.assignedStaff && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Assigned to: {selectedVisitor.assignedStaff}
                  </span>
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {selectedVisitor.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Notes */}
            {selectedVisitor.notes && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Notes</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedVisitor.notes}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline">
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline">
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button>
                Update Status
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default VisitorManagement