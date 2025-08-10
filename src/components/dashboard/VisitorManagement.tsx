'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import { cn, formatDate, formatTime } from '@/lib/utils'
import type { Visitor } from '@/types'

interface VisitorManagementProps {
  visitors?: Visitor[]
  loading?: boolean
  onStatusUpdate?: (visitorId: string, status: Visitor['status']) => void
  onSendEmail?: (visitorId: string) => void
  onSendSMS?: (visitorId: string) => void
}

const sampleVisitors: Visitor[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    partySize: 3,
    kidsCount: 2,
    selectedService: {
      id: '1',
      dayOfWeek: 0,
      time: '11:00',
      name: 'Second Service',
      description: 'Contemporary worship'
    },
    visitDate: new Date('2024-08-18'),
    status: 'confirmed',
    notes: 'First time visitors, interested in children\'s ministry',
    createdAt: new Date('2024-08-10'),
    updatedAt: new Date('2024-08-10')
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 987-6543',
    partySize: 1,
    kidsCount: 0,
    selectedService: {
      id: '2',
      dayOfWeek: 0,
      time: '09:00',
      name: 'First Service',
      description: 'Traditional worship'
    },
    visitDate: new Date('2024-08-18'),
    status: 'pending',
    notes: 'Interested in small groups and volunteer opportunities',
    createdAt: new Date('2024-08-11'),
    updatedAt: new Date('2024-08-11')
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Davis',
    email: 'michael.davis@email.com',
    phone: '(555) 456-7890',
    partySize: 2,
    kidsCount: 0,
    selectedService: {
      id: '1',
      dayOfWeek: 0,
      time: '11:00',
      name: 'Second Service',
      description: 'Contemporary worship'
    },
    visitDate: new Date('2024-08-11'),
    status: 'attended',
    notes: 'Enjoyed the service, considering membership',
    createdAt: new Date('2024-08-05'),
    updatedAt: new Date('2024-08-11')
  }
]

const VisitorManagement: React.FC<VisitorManagementProps> = ({
  visitors = sampleVisitors,
  loading = false,
  onStatusUpdate,
  onSendEmail,
  onSendSMS
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'attended', label: 'Attended' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const filteredVisitors = visitors.filter(visitor => {
    const matchesSearch = 
      visitor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || visitor.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: Visitor['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'attended':
        return <CheckCircleIcon className="h-4 w-4 text-blue-500" />
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4 text-red-500" />
      default:
        return <ClockIcon className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: Visitor['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'attended':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const handleStatusChange = (visitor: Visitor, newStatus: Visitor['status']) => {
    onStatusUpdate?.(visitor.id, newStatus)
  }

  const formatServiceTime = (service: any) => {
    const getDayName = (dayOfWeek: number) => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      return days[dayOfWeek]
    }
    const [hours, minutes] = service.time.split(':')
    const hour12 = parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours)
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM'
    return `${getDayName(service.dayOfWeek)} ${hour12 === 0 ? 12 : hour12}:${minutes} ${ampm}`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm border animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-3 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Visitor Management</h1>
          <p className="text-gray-600 mt-1">Manage and track your church visitors</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {filteredVisitors.length} visitor{filteredVisitors.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search visitors by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Visitors List */}
      <div className="space-y-4">
        {filteredVisitors.map((visitor, index) => (
          <motion.div
            key={visitor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {visitor.firstName} {visitor.lastName}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-4 w-4 mr-1" />
                        {visitor.email}
                      </div>
                      <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 mr-1" />
                        {visitor.phone}
                      </div>
                    </div>
                  </div>
                  <div className={cn('px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1', getStatusColor(visitor.status))}>
                    {getStatusIcon(visitor.status)}
                    <span className="capitalize">{visitor.status}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <CalendarDaysIcon className="h-4 w-4 mr-2" />
                    <div>
                      <p className="font-medium">{formatDate(visitor.visitDate)}</p>
                      <p className="text-xs">{formatServiceTime(visitor.selectedService)}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    <div>
                      <p>{visitor.partySize} {visitor.partySize === 1 ? 'person' : 'people'}</p>
                      {visitor.kidsCount > 0 && (
                        <p className="text-xs">{visitor.kidsCount} {visitor.kidsCount === 1 ? 'child' : 'children'}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-600">
                    <p className="font-medium">{visitor.selectedService.name}</p>
                    <p className="text-xs">{visitor.selectedService.description}</p>
                  </div>
                  <div className="text-gray-600">
                    <p className="text-xs">Submitted: {formatDate(visitor.createdAt)}</p>
                    {visitor.notes && (
                      <p className="text-xs truncate">Notes: {visitor.notes}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {/* Quick Actions */}
                {visitor.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(visitor, 'confirmed')}
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(visitor, 'cancelled')}
                    >
                      Cancel
                    </Button>
                  </>
                )}
                
                {visitor.status === 'confirmed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(visitor, 'attended')}
                  >
                    Mark Attended
                  </Button>
                )}

                <div className="flex space-x-1">
                  <button
                    onClick={() => onSendEmail?.(visitor.id)}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    title="Send Email"
                  >
                    <EnvelopeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onSendSMS?.(visitor.id)}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    title="Send SMS"
                  >
                    <PhoneIcon className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setSelectedVisitor(visitor)
                    setShowDetailModal(true)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredVisitors.length === 0 && (
          <div className="text-center py-12">
            <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No visitors found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Visitors will appear here once they submit visit requests.'}
            </p>
          </div>
        )}
      </div>

      {/* Visitor Detail Modal */}
      {selectedVisitor && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`${selectedVisitor.firstName} ${selectedVisitor.lastName}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <div className={cn('px-4 py-2 rounded-full flex items-center space-x-2', getStatusColor(selectedVisitor.status))}>
                {getStatusIcon(selectedVisitor.status)}
                <span className="font-medium capitalize">{selectedVisitor.status}</span>
              </div>
              <div className="text-sm text-gray-600">
                Submitted: {formatDate(selectedVisitor.createdAt)}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Email:</span> {selectedVisitor.email}</p>
                  <p><span className="font-medium">Phone:</span> {selectedVisitor.phone}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Visit Details</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Date:</span> {formatDate(selectedVisitor.visitDate)}</p>
                  <p><span className="font-medium">Service:</span> {selectedVisitor.selectedService.name}</p>
                  <p><span className="font-medium">Time:</span> {formatServiceTime(selectedVisitor.selectedService)}</p>
                  <p><span className="font-medium">Party Size:</span> {selectedVisitor.partySize} people</p>
                  {selectedVisitor.kidsCount > 0 && (
                    <p><span className="font-medium">Children:</span> {selectedVisitor.kidsCount}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedVisitor.notes && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Notes</h4>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4">
                  {selectedVisitor.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => onSendEmail?.(selectedVisitor.id)}>
                Send Email
              </Button>
              <Button variant="outline" onClick={() => onSendSMS?.(selectedVisitor.id)}>
                Send SMS
              </Button>
              {selectedVisitor.status === 'pending' && (
                <Button onClick={() => handleStatusChange(selectedVisitor, 'confirmed')}>
                  Confirm Visit
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default VisitorManagement