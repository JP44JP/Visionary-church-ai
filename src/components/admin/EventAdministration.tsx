'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarDaysIcon,
  PlusIcon,
  UserGroupIcon,
  MapPinIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  CameraIcon,
  StarIcon,
  TicketIcon
} from '@heroicons/react/24/outline'
import { cn, formatDate, formatDateTime, formatTime } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { TextArea } from '@/components/ui/TextArea'
import { Modal } from '@/components/ui/Modal'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface Event {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  startTime: string
  endTime?: string
  location: string
  category: 'service' | 'study' | 'social' | 'outreach' | 'youth' | 'children' | 'ministry'
  status: 'draft' | 'published' | 'active' | 'completed' | 'cancelled'
  capacity?: number
  registrationRequired: boolean
  registrationDeadline?: Date
  price?: number
  isRecurring: boolean
  recurrencePattern?: {
    frequency: 'weekly' | 'monthly' | 'yearly'
    interval: number
    endDate?: Date
  }
  organizer: {
    name: string
    email: string
    phone?: string
  }
  volunteers: string[]
  resources: {
    rooms: string[]
    equipment: string[]
    materials: string[]
  }
  imageUrl?: string
  tags: string[]
  registration: {
    count: number
    confirmed: number
    waitlist: number
  }
  visibility: 'public' | 'members_only' | 'private'
  createdAt: Date
  updatedAt: Date
}

const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Sunday Morning Service',
    description: 'Join us for our weekly Sunday morning worship service with inspiring music, biblical teaching, and fellowship.',
    startDate: new Date('2024-08-18'),
    endDate: new Date('2024-08-18'),
    startTime: '11:00',
    endTime: '12:30',
    location: 'Main Sanctuary',
    category: 'service',
    status: 'published',
    capacity: 500,
    registrationRequired: false,
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      interval: 1
    },
    organizer: {
      name: 'Pastor John Smith',
      email: 'pastor@gracecommunity.org',
      phone: '(555) 123-4567'
    },
    volunteers: ['Mary Johnson', 'David Wilson', 'Sarah Lee'],
    resources: {
      rooms: ['Main Sanctuary', 'Children\'s Hall', 'Nursery'],
      equipment: ['Sound System', 'Projectors', 'Live Stream Setup'],
      materials: ['Bulletins', 'Communion Elements', 'Welcome Bags']
    },
    imageUrl: '/images/sunday-service.jpg',
    tags: ['worship', 'weekly', 'family-friendly'],
    registration: {
      count: 0,
      confirmed: 0,
      waitlist: 0
    },
    visibility: 'public',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-15')
  },
  {
    id: '2',
    title: 'Youth Group Retreat',
    description: 'A weekend retreat for high school students focusing on faith, friendship, and fun activities in the great outdoors.',
    startDate: new Date('2024-08-23'),
    endDate: new Date('2024-08-25'),
    startTime: '18:00',
    endTime: '15:00',
    location: 'Camp Wilderness',
    category: 'youth',
    status: 'published',
    capacity: 50,
    registrationRequired: true,
    registrationDeadline: new Date('2024-08-20'),
    price: 150,
    isRecurring: false,
    organizer: {
      name: 'Mike Davis',
      email: 'mike@gracecommunity.org',
      phone: '(555) 987-6543'
    },
    volunteers: ['Jennifer Brown', 'Tom Wilson', 'Lisa Chen'],
    resources: {
      rooms: ['Cabins A-F'],
      equipment: ['Sound Equipment', 'Sports Gear', 'Cooking Equipment'],
      materials: ['Study Materials', 'Activity Supplies', 'First Aid Kit']
    },
    imageUrl: '/images/youth-retreat.jpg',
    tags: ['youth', 'retreat', 'weekend', 'outdoor'],
    registration: {
      count: 32,
      confirmed: 28,
      waitlist: 4
    },
    visibility: 'members_only',
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-08-01')
  },
  {
    id: '3',
    title: 'Community Food Drive',
    description: 'Help us collect and distribute food to families in need in our community. Every donation makes a difference!',
    startDate: new Date('2024-08-19'),
    endDate: new Date('2024-08-19'),
    startTime: '09:00',
    endTime: '16:00',
    location: 'Church Parking Lot',
    category: 'outreach',
    status: 'published',
    registrationRequired: false,
    isRecurring: false,
    organizer: {
      name: 'Community Outreach Team',
      email: 'outreach@gracecommunity.org'
    },
    volunteers: ['Robert Johnson', 'Maria Garcia', 'James Kim', 'Anna Thompson'],
    resources: {
      rooms: ['Fellowship Hall'],
      equipment: ['Tables', 'Boxes', 'Scales', 'Loading Equipment'],
      materials: ['Flyers', 'Volunteer T-shirts', 'Distribution Lists']
    },
    tags: ['outreach', 'community', 'food-drive', 'volunteer'],
    registration: {
      count: 0,
      confirmed: 0,
      waitlist: 0
    },
    visibility: 'public',
    createdAt: new Date('2024-07-15'),
    updatedAt: new Date('2024-08-05')
  },
  {
    id: '4',
    title: 'Marriage Enrichment Workshop',
    description: 'A special workshop for couples looking to strengthen their marriage with practical tools and biblical wisdom.',
    startDate: new Date('2024-08-24'),
    endDate: new Date('2024-08-24'),
    startTime: '19:00',
    endTime: '21:30',
    location: 'Fellowship Hall',
    category: 'ministry',
    status: 'published',
    capacity: 30,
    registrationRequired: true,
    registrationDeadline: new Date('2024-08-22'),
    price: 25,
    isRecurring: false,
    organizer: {
      name: 'Dr. Susan Miller',
      email: 'susan@gracecommunity.org'
    },
    volunteers: ['John Smith', 'Karen Davis'],
    resources: {
      rooms: ['Fellowship Hall'],
      equipment: ['Projector', 'Sound System', 'Tables and Chairs'],
      materials: ['Workbooks', 'Name Tags', 'Refreshments']
    },
    tags: ['marriage', 'couples', 'workshop', 'ministry'],
    registration: {
      count: 18,
      confirmed: 16,
      waitlist: 2
    },
    visibility: 'members_only',
    createdAt: new Date('2024-07-01'),
    updatedAt: new Date('2024-08-10')
  },
  {
    id: '5',
    title: 'Children\'s Easter Egg Hunt',
    description: 'A fun Easter celebration for children with egg hunting, games, and special activities. Family-friendly event!',
    startDate: new Date('2024-03-31'),
    endDate: new Date('2024-03-31'),
    startTime: '14:00',
    endTime: '16:00',
    location: 'Church Grounds',
    category: 'children',
    status: 'completed',
    capacity: 200,
    registrationRequired: true,
    registrationDeadline: new Date('2024-03-29'),
    isRecurring: true,
    recurrencePattern: {
      frequency: 'yearly',
      interval: 1
    },
    organizer: {
      name: 'Children\'s Ministry Team',
      email: 'children@gracecommunity.org'
    },
    volunteers: ['Mary Johnson', 'Lisa Brown', 'Tom Wilson', 'Jennifer Lee', 'David Kim'],
    resources: {
      rooms: ['Church Grounds', 'Fellowship Hall'],
      equipment: ['Sound System', 'Games Equipment', 'Decorations'],
      materials: ['Easter Eggs', 'Candy', 'Prizes', 'Activity Sheets']
    },
    tags: ['children', 'easter', 'family', 'celebration'],
    registration: {
      count: 156,
      confirmed: 156,
      waitlist: 0
    },
    visibility: 'public',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-31')
  }
]

const EventAdministration: React.FC = () => {
  const [events, setEvents] = useState(sampleEvents)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [activeTab, setActiveTab] = useState('events')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'service', label: 'Service' },
    { value: 'study', label: 'Bible Study' },
    { value: 'social', label: 'Social' },
    { value: 'outreach', label: 'Outreach' },
    { value: 'youth', label: 'Youth' },
    { value: 'children', label: 'Children' },
    { value: 'ministry', label: 'Ministry' }
  ]

  const getStatusIcon = (status: Event['status']) => {
    switch (status) {
      case 'draft':
        return <DocumentDuplicateIcon className="h-4 w-4 text-gray-500" />
      case 'published':
        return <EyeIcon className="h-4 w-4 text-blue-500" />
      case 'active':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-purple-500" />
      case 'cancelled':
        return <XMarkIcon className="h-4 w-4 text-red-500" />
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      case 'published':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'completed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getCategoryIcon = (category: Event['category']) => {
    switch (category) {
      case 'service':
        return '⛪'
      case 'study':
        return '📚'
      case 'social':
        return '🎉'
      case 'outreach':
        return '🤝'
      case 'youth':
        return '🎯'
      case 'children':
        return '🎨'
      case 'ministry':
        return '🙏'
      default:
        return '📅'
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const upcomingEvents = events.filter(event => 
    new Date(event.startDate) >= new Date() && event.status !== 'cancelled'
  ).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  const totalRegistrations = events.reduce((sum, event) => sum + event.registration.count, 0)
  const totalCapacity = events.reduce((sum, event) => sum + (event.capacity || 0), 0)

  const renderEvents = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{events.length}</p>
            </div>
            <CalendarDaysIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{upcomingEvents.length}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Registrations</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalRegistrations}</p>
            </div>
            <TicketIcon className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Capacity Utilization</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0}%
              </p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              Calendar
            </button>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingEvent(null)
            setShowEventModal(true)
          }}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search events..."
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
            options={categoryOptions}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
          <Button variant="outline">
            <FunnelIcon className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </Card>

      {/* Events List/Calendar */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-2xl">
                        {getCategoryIcon(event.category)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {event.title}
                      </h4>
                      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(event.status))}>
                        {getStatusIcon(event.status)}
                        <span className="ml-1 capitalize">{event.status}</span>
                      </span>
                      {event.isRecurring && (
                        <Badge variant="outline" className="text-xs">
                          Recurring
                        </Badge>
                      )}
                      {event.registrationRequired && (
                        <Badge className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          Registration Required
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <CalendarDaysIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <div>
                          <p>{formatDate(event.startDate)}</p>
                          {event.startDate.getTime() !== event.endDate.getTime() && (
                            <p className="text-xs">to {formatDate(event.endDate)}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <ClockIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <div>
                          <p>{formatTime(event.startTime)}</p>
                          {event.endTime && (
                            <p className="text-xs">to {formatTime(event.endTime)}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <p className="truncate">{event.location}</p>
                      </div>
                      {event.registrationRequired && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <UserGroupIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          <p>{event.registration.count}{event.capacity && `/${event.capacity}`} registered</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {event.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {event.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                            +{event.tags.length - 3}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="capitalize">{event.category}</span>
                        {event.price && (
                          <span className="ml-2 font-medium text-green-600 dark:text-green-400">
                            ${event.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedEvent(event)
                      setShowDetailModal(true)
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="View Details"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingEvent(event)
                      setShowEventModal(true)
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit Event"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    title="Duplicate Event"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                    title="Share Event"
                  >
                    <ShareIcon className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Event"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No events found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Create your first event to get started.'}
              </p>
              <Button
                className="mt-4"
                onClick={() => {
                  setEditingEvent(null)
                  setShowEventModal(true)
                }}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create First Event
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="mx-auto h-24 w-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
            <CalendarDaysIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Calendar View</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Interactive calendar view for your events is coming soon!
          </p>
        </div>
      )}
    </div>
  )

  const tabs = [
    { id: 'events', label: 'Events', icon: CalendarDaysIcon },
    { id: 'registrations', label: 'Registrations', icon: TicketIcon },
    { id: 'resources', label: 'Resources', icon: CameraIcon },
    { id: 'analytics', label: 'Analytics', icon: StarIcon }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Event Administration</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create, manage, and track all your church events and registrations
          </p>
        </div>
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
        {activeTab === 'events' && renderEvents()}
        {activeTab === 'registrations' && (
          <div className="text-center py-20">
            <div className="mx-auto h-24 w-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
              <TicketIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Registration Management</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Advanced registration management and check-in tools coming soon!
            </p>
          </div>
        )}
        {activeTab === 'resources' && (
          <div className="text-center py-20">
            <div className="mx-auto h-24 w-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
              <CameraIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Resource Management</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Manage rooms, equipment, and materials for your events coming soon!
            </p>
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="text-center py-20">
            <div className="mx-auto h-24 w-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
              <StarIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Event Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Detailed insights and analytics for your events coming soon!
            </p>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={selectedEvent.title}
          size="lg"
        >
          <div className="space-y-6">
            {/* Event Image */}
            {selectedEvent.imageUrl && (
              <div className="w-full h-48 rounded-lg overflow-hidden">
                <img
                  src={selectedEvent.imageUrl}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Status and Category */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={cn('inline-flex items-center px-3 py-2 rounded-full', getStatusColor(selectedEvent.status))}>
                  {getStatusIcon(selectedEvent.status)}
                  <span className="ml-2 font-medium capitalize">{selectedEvent.status}</span>
                </span>
                <Badge>
                  {getCategoryIcon(selectedEvent.category)} {selectedEvent.category}
                </Badge>
                {selectedEvent.price && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    ${selectedEvent.price}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedEvent.visibility}
              </div>
            </div>

            {/* Event Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Event Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>
                      {formatDate(selectedEvent.startDate)}
                      {selectedEvent.startDate.getTime() !== selectedEvent.endDate.getTime() && (
                        ` - ${formatDate(selectedEvent.endDate)}`
                      )}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>
                      {formatTime(selectedEvent.startTime)}
                      {selectedEvent.endTime && ` - ${formatTime(selectedEvent.endTime)}`}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{selectedEvent.location}</span>
                  </div>
                  {selectedEvent.capacity && (
                    <div className="flex items-center">
                      <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Capacity: {selectedEvent.capacity}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Organizer</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {selectedEvent.organizer.name}</p>
                  <p><span className="font-medium">Email:</span> {selectedEvent.organizer.email}</p>
                  {selectedEvent.organizer.phone && (
                    <p><span className="font-medium">Phone:</span> {selectedEvent.organizer.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Description</h4>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300">{selectedEvent.description}</p>
              </div>
            </div>

            {/* Registration Info */}
            {selectedEvent.registrationRequired && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Registration</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedEvent.registration.count}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Registered</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {selectedEvent.registration.confirmed}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Confirmed</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {selectedEvent.registration.waitlist}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Waitlist</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {selectedEvent.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingEvent(selectedEvent)
                  setShowDetailModal(false)
                  setShowEventModal(true)
                }}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Event
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // Share event logic
                }}
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button>
                View Registrations
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create/Edit Event Modal - Placeholder for now */}
      <Modal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        title={editingEvent ? 'Edit Event' : 'Create New Event'}
        size="lg"
      >
        <div className="text-center py-12">
          <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Event Form</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive event creation and editing form coming soon!
          </p>
        </div>
      </Modal>
    </div>
  )
}

export default EventAdministration