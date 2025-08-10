'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PaperAirplaneIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentDuplicateIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { cn, formatDate, formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { TextArea } from '@/components/ui/TextArea'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Card } from '@/components/ui/Card'
import { Tabs } from '@/components/ui/Tabs'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'welcome' | 'follow_up' | 'event' | 'newsletter' | 'prayer' | 'general'
  isActive: boolean
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

interface CommunicationSequence {
  id: string
  name: string
  description: string
  trigger: 'new_visitor' | 'visit_confirmed' | 'visit_attended' | 'no_show' | 'manual'
  steps: SequenceStep[]
  isActive: boolean
  enrolledCount: number
  completionRate: number
  createdAt: Date
}

interface SequenceStep {
  id: string
  order: number
  type: 'email' | 'sms' | 'task'
  delay: number // in hours
  templateId?: string
  subject?: string
  content: string
  conditions?: {
    field: string
    operator: 'equals' | 'contains' | 'greater_than'
    value: string
  }[]
}

interface Campaign {
  id: string
  name: string
  type: 'email' | 'sms'
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused'
  subject?: string
  content: string
  recipients: {
    type: 'all' | 'segment' | 'manual'
    count: number
    criteria?: any
  }
  scheduledAt?: Date
  sentAt?: Date
  stats: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
  }
}

const sampleTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome New Visitor',
    subject: 'Welcome to Grace Community Church!',
    content: `Dear {firstName},

Thank you for visiting Grace Community Church! We're so glad you joined us and hope you felt welcomed into our church family.

We'd love to connect with you and answer any questions you might have about our church, programs, or how to get more involved.

Next Steps:
- Join us again this Sunday at {serviceTime}
- Check out our newcomer's class next week
- Connect with our pastor for a personal welcome

Blessings,
The Grace Community Team

P.S. Don't forget to pick up your welcome gift at the information desk!`,
    type: 'welcome',
    isActive: true,
    usageCount: 89,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-10')
  },
  {
    id: '2',
    name: 'Follow-up After Visit',
    subject: 'How was your visit to Grace Community?',
    content: `Hi {firstName},

We hope you enjoyed your visit to Grace Community Church last Sunday! Your presence added to our worship experience.

We'd love to hear about your experience and answer any questions you might have. Would you be interested in:
- Learning more about our small groups?
- Meeting with our pastor?
- Getting involved in our ministries?

Please don't hesitate to reach out - we're here to help you feel at home.

Grace and peace,
Pastor John Smith`,
    type: 'follow_up',
    isActive: true,
    usageCount: 156,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-05')
  },
  {
    id: '3',
    name: 'Event Invitation',
    subject: 'You\'re invited: {eventName}',
    content: `Dear {firstName},

You're cordially invited to join us for {eventName}!

Event Details:
📅 Date: {eventDate}
🕒 Time: {eventTime}
📍 Location: {eventLocation}

{eventDescription}

We'd love to see you there! Please RSVP by {rsvpDate}.

Looking forward to seeing you,
Grace Community Church`,
    type: 'event',
    isActive: true,
    usageCount: 45,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  }
]

const sampleSequences: CommunicationSequence[] = [
  {
    id: '1',
    name: 'New Visitor Welcome Series',
    description: 'Automated welcome sequence for first-time visitors',
    trigger: 'new_visitor',
    isActive: true,
    enrolledCount: 234,
    completionRate: 78,
    createdAt: new Date('2024-01-01'),
    steps: [
      {
        id: '1',
        order: 1,
        type: 'email',
        delay: 2,
        templateId: '1',
        subject: 'Welcome to Grace Community!',
        content: 'Welcome email content...'
      },
      {
        id: '2',
        order: 2,
        type: 'email',
        delay: 72,
        templateId: '2',
        subject: 'How was your visit?',
        content: 'Follow-up email content...'
      },
      {
        id: '3',
        order: 3,
        type: 'task',
        delay: 168,
        content: 'Personal phone call from pastor'
      }
    ]
  },
  {
    id: '2',
    name: 'Post-Visit Follow-up',
    description: 'Follow-up sequence after confirmed visit attendance',
    trigger: 'visit_attended',
    isActive: true,
    enrolledCount: 189,
    completionRate: 85,
    createdAt: new Date('2024-01-15'),
    steps: [
      {
        id: '1',
        order: 1,
        type: 'email',
        delay: 24,
        subject: 'Thank you for visiting!',
        content: 'Thank you email content...'
      },
      {
        id: '2',
        order: 2,
        type: 'sms',
        delay: 168,
        content: 'Hi {firstName}! Hope to see you again this Sunday. Any questions? Reply STOP to opt out.'
      }
    ]
  }
]

const sampleCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Easter Sunday Invitation',
    type: 'email',
    status: 'completed',
    subject: 'Celebrate Easter with Grace Community',
    content: 'Join us for a special Easter celebration...',
    recipients: {
      type: 'all',
      count: 1247
    },
    sentAt: new Date('2024-03-15'),
    stats: {
      sent: 1247,
      delivered: 1198,
      opened: 567,
      clicked: 89,
      bounced: 49
    }
  },
  {
    id: '2',
    name: 'New Member Class Reminder',
    type: 'sms',
    status: 'scheduled',
    content: 'Reminder: New Member Class tomorrow at 10 AM. See you there!',
    recipients: {
      type: 'segment',
      count: 23
    },
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    stats: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0
    }
  }
]

const CommunicationCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('campaigns')
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showSequenceModal, setShowSequenceModal] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [editingSequence, setEditingSequence] = useState<CommunicationSequence | null>(null)
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'general' as EmailTemplate['type']
  })
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'email' as Campaign['type'],
    subject: '',
    content: '',
    recipientType: 'all' as 'all' | 'segment' | 'manual'
  })

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'sending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'paused':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'sending':
        return <ArrowPathIcon className="h-4 w-4 text-blue-500 animate-spin" />
      case 'scheduled':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />
      case 'paused':
        return <ExclamationCircleIcon className="h-4 w-4 text-orange-500" />
      default:
        return <DocumentDuplicateIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeIcon = (type: 'email' | 'sms') => {
    return type === 'email' ? 
      <EnvelopeIcon className="h-4 w-4" /> : 
      <ChatBubbleLeftRightIcon className="h-4 w-4" />
  }

  const renderCampaigns = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Communication Campaigns</h3>
        <Button onClick={() => setShowCampaignModal(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sent</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {sampleCampaigns.reduce((sum, c) => sum + c.stats.sent, 0)}
              </p>
            </div>
            <PaperAirplaneIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open Rate</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {Math.round((sampleCampaigns.reduce((sum, c) => sum + c.stats.opened, 0) / 
                 sampleCampaigns.reduce((sum, c) => sum + c.stats.sent, 0)) * 100) || 0}%
              </p>
            </div>
            <EyeIcon className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Click Rate</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {Math.round((sampleCampaigns.reduce((sum, c) => sum + c.stats.clicked, 0) / 
                 sampleCampaigns.reduce((sum, c) => sum + c.stats.sent, 0)) * 100) || 0}%
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Campaigns</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {sampleCampaigns.filter(c => c.status === 'scheduled' || c.status === 'sending').length}
              </p>
            </div>
            <ArrowPathIcon className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {sampleCampaigns.map((campaign, index) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(campaign.type)}
                    <h4 className="font-medium text-gray-900 dark:text-white">{campaign.name}</h4>
                  </div>
                  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(campaign.status))}>
                    {getStatusIcon(campaign.status)}
                    <span className="ml-1 capitalize">{campaign.status}</span>
                  </span>
                </div>
                
                {campaign.subject && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{campaign.subject}</p>
                )}
                
                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-500">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    {campaign.recipients.count} recipients
                  </div>
                  {campaign.scheduledAt && (
                    <div className="flex items-center">
                      <CalendarDaysIcon className="h-4 w-4 mr-1" />
                      Scheduled: {formatDateTime(campaign.scheduledAt)}
                    </div>
                  )}
                  {campaign.sentAt && (
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Sent: {formatDateTime(campaign.sentAt)}
                    </div>
                  )}
                </div>

                {campaign.status === 'completed' && campaign.stats.sent > 0 && (
                  <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Sent:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{campaign.stats.sent}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Delivered:</span>
                      <span className="ml-2 font-medium text-green-600">{campaign.stats.delivered}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Opened:</span>
                      <span className="ml-2 font-medium text-blue-600">{campaign.stats.opened}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Clicked:</span>
                      <span className="ml-2 font-medium text-purple-600">{campaign.stats.clicked}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Templates</h3>
        <Button onClick={() => {
          setEditingTemplate(null)
          setNewTemplate({ name: '', subject: '', content: '', type: 'general' })
          setShowTemplateModal(true)
        }}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sampleTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    template.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  )}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{template.subject}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
                  <span className="capitalize">{template.type.replace('_', ' ')}</span>
                  <span>Used {template.usageCount} times</span>
                  <span>Updated {formatDate(template.updatedAt)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button 
                  onClick={() => {
                    setEditingTemplate(template)
                    setNewTemplate({
                      name: template.name,
                      subject: template.subject,
                      content: template.content,
                      type: template.type
                    })
                    setShowTemplateModal(true)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm text-gray-700 dark:text-gray-300 max-h-32 overflow-y-auto">
              {template.content.substring(0, 200)}...
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderSequences = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Automation Sequences</h3>
        <Button onClick={() => setShowSequenceModal(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Sequence
        </Button>
      </div>

      <div className="space-y-4">
        {sampleSequences.map((sequence, index) => (
          <motion.div
            key={sequence.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{sequence.name}</h4>
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    sequence.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  )}>
                    {sequence.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{sequence.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Trigger:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">
                      {sequence.trigger.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Enrolled:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {sequence.enrolledCount}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Completion:</span>
                    <span className="ml-2 font-medium text-green-600">
                      {sequence.completionRate}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">Sequence Steps:</h5>
                  {sequence.steps.map((step, stepIndex) => (
                    <div key={step.id} className="flex items-center space-x-3 text-sm">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center text-xs font-medium">
                        {step.order}
                      </div>
                      <div className="flex items-center space-x-2">
                        {step.type === 'email' ? <EnvelopeIcon className="h-4 w-4 text-gray-400" /> : 
                         step.type === 'sms' ? <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-400" /> :
                         <ClockIcon className="h-4 w-4 text-gray-400" />}
                        <span className="text-gray-700 dark:text-gray-300">
                          {step.type === 'task' ? step.content : step.subject || 'Email/SMS'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        +{step.delay}h
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const tabs = [
    { id: 'campaigns', label: 'Campaigns', icon: PaperAirplaneIcon },
    { id: 'templates', label: 'Templates', icon: DocumentDuplicateIcon },
    { id: 'sequences', label: 'Automation', icon: ArrowPathIcon },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Communication Center</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage email campaigns, templates, and automated sequences
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
        {activeTab === 'campaigns' && renderCampaigns()}
        {activeTab === 'templates' && renderTemplates()}
        {activeTab === 'sequences' && renderSequences()}
        {activeTab === 'analytics' && (
          <div className="text-center py-20">
            <div className="mx-auto h-24 w-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
              <ChartBarIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Communication Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Detailed analytics and reporting for your communication campaigns coming soon!
            </p>
          </div>
        )}
      </div>

      {/* Template Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title={editingTemplate ? 'Edit Template' : 'Create New Template'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Template Name
              </label>
              <Input
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                placeholder="Enter template name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <Select
                options={[
                  { value: 'welcome', label: 'Welcome' },
                  { value: 'follow_up', label: 'Follow-up' },
                  { value: 'event', label: 'Event' },
                  { value: 'newsletter', label: 'Newsletter' },
                  { value: 'prayer', label: 'Prayer' },
                  { value: 'general', label: 'General' }
                ]}
                value={newTemplate.type}
                onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value as EmailTemplate['type'] })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject Line
            </label>
            <Input
              value={newTemplate.subject}
              onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
              placeholder="Enter email subject"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Content
            </label>
            <TextArea
              value={newTemplate.content}
              onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
              placeholder="Enter email content. Use {firstName}, {lastName}, etc. for personalization"
              rows={8}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowTemplateModal(false)}>
              {editingTemplate ? 'Update' : 'Create'} Template
            </Button>
          </div>
        </div>
      </Modal>

      {/* Campaign Modal */}
      <Modal
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        title="Create New Campaign"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Campaign Name
              </label>
              <Input
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                placeholder="Enter campaign name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <Select
                options={[
                  { value: 'email', label: 'Email' },
                  { value: 'sms', label: 'SMS' }
                ]}
                value={newCampaign.type}
                onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value as Campaign['type'] })}
              />
            </div>
          </div>
          {newCampaign.type === 'email' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject Line
              </label>
              <Input
                value={newCampaign.subject}
                onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                placeholder="Enter email subject"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content
            </label>
            <TextArea
              value={newCampaign.content}
              onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
              placeholder={newCampaign.type === 'email' ? 'Enter email content' : 'Enter SMS message (160 chars max)'}
              rows={newCampaign.type === 'email' ? 6 : 3}
              maxLength={newCampaign.type === 'sms' ? 160 : undefined}
            />
            {newCampaign.type === 'sms' && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {newCampaign.content.length}/160 characters
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recipients
            </label>
            <Select
              options={[
                { value: 'all', label: 'All Contacts' },
                { value: 'segment', label: 'Specific Segment' },
                { value: 'manual', label: 'Manual Selection' }
              ]}
              value={newCampaign.recipientType}
              onChange={(e) => setNewCampaign({ ...newCampaign, recipientType: e.target.value as typeof newCampaign.recipientType })}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={() => setShowCampaignModal(false)}>
              Save as Draft
            </Button>
            <Button onClick={() => setShowCampaignModal(false)}>
              Send Now
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default CommunicationCenter