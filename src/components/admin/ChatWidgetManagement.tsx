'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChatBubbleLeftRightIcon,
  CogIcon,
  EyeIcon,
  PencilIcon,
  ChartBarIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { TextArea } from '@/components/ui/TextArea'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'

interface ChatConversation {
  id: string
  visitor: {
    name: string
    email?: string
    id?: string
  }
  startTime: Date
  endTime?: Date
  messageCount: number
  status: 'active' | 'ended' | 'transferred'
  summary: string
  satisfaction?: number
  tags: string[]
}

interface AITemplate {
  id: string
  name: string
  trigger: string
  response: string
  isActive: boolean
  usageCount: number
}

const sampleConversations: ChatConversation[] = [
  {
    id: '1',
    visitor: { name: 'Sarah Johnson', email: 'sarah@email.com' },
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    messageCount: 15,
    status: 'ended',
    summary: 'Inquired about children\'s ministry programs and service times',
    satisfaction: 5,
    tags: ['children', 'services', 'first-time']
  },
  {
    id: '2',
    visitor: { name: 'Mike Davis' },
    startTime: new Date(Date.now() - 30 * 60 * 1000),
    messageCount: 8,
    status: 'active',
    summary: 'Asking about baptism requirements and process',
    tags: ['baptism', 'membership']
  },
  {
    id: '3',
    visitor: { name: 'Jennifer Brown', email: 'jennifer@email.com' },
    startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
    messageCount: 22,
    status: 'ended',
    summary: 'Requested prayer for family situation, showed interest in small groups',
    satisfaction: 4,
    tags: ['prayer', 'small-groups', 'family']
  }
]

const sampleTemplates: AITemplate[] = [
  {
    id: '1',
    name: 'Welcome Greeting',
    trigger: 'welcome',
    response: 'Welcome to Grace Community Church! I\'m here to help answer any questions you might have about our services, programs, or how to get connected.',
    isActive: true,
    usageCount: 156
  },
  {
    id: '2',
    name: 'Service Times',
    trigger: 'service times',
    response: 'We have three services on Sundays: 8:30 AM (Traditional), 10:00 AM (Contemporary), and 11:30 AM (Family Service). We also have Wednesday evening services at 7:00 PM.',
    isActive: true,
    usageCount: 89
  },
  {
    id: '3',
    name: 'Children\'s Ministry',
    trigger: 'children|kids|nursery',
    response: 'We love kids at Grace Community! We offer nursery care for infants through age 2, and children\'s church for ages 3-12 during all Sunday services. Would you like more information about our children\'s programs?',
    isActive: true,
    usageCount: 67
  }
]

const ChatWidgetManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('conversations')
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)
  const [showConversationModal, setShowConversationModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<AITemplate | null>(null)
  const [newTemplate, setNewTemplate] = useState({ name: '', trigger: '', response: '' })

  const tabs = [
    { id: 'conversations', label: 'Conversations', icon: ChatBubbleLeftRightIcon },
    { id: 'templates', label: 'AI Templates', icon: PencilIcon },
    { id: 'settings', label: 'Widget Settings', icon: CogIcon },
    { id: 'analytics', label: 'Performance', icon: ChartBarIcon }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'ended':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      case 'transferred':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date()
    const minutes = Math.floor((endTime.getTime() - start.getTime()) / (1000 * 60))
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
          <svg
            key={star}
            className={cn(
              'h-4 w-4',
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  const renderConversations = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Conversations</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {sampleConversations.length} conversations
          </span>
        </div>
      </div>

      {sampleConversations.map((conversation, index) => (
        <motion.div
          key={conversation.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => {
            setSelectedConversation(conversation)
            setShowConversationModal(true)
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {conversation.visitor.name}
                </h4>
                <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getStatusColor(conversation.status))}>
                  {conversation.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {conversation.summary}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
                <span>{conversation.messageCount} messages</span>
                <span>{formatDuration(conversation.startTime, conversation.endTime)}</span>
                <span>{conversation.startTime.toLocaleTimeString()}</span>
                {conversation.satisfaction && (
                  <div className="flex items-center space-x-1">
                    {renderStars(conversation.satisfaction)}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {conversation.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <EyeIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Response Templates</h3>
        <Button
          onClick={() => {
            setEditingTemplate(null)
            setNewTemplate({ name: '', trigger: '', response: '' })
            setShowTemplateModal(true)
          }}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Template
        </Button>
      </div>

      <div className="space-y-4">
        {sampleTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {template.name}
                  </h4>
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    template.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  )}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span className="font-medium">Trigger:</span> {template.trigger}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {template.response}
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Used {template.usageCount} times
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => {
                    setEditingTemplate(template)
                    setNewTemplate({
                      name: template.name,
                      trigger: template.trigger,
                      response: template.response
                    })
                    setShowTemplateModal(true)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
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

  const renderSettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Widget Configuration</h3>
        
        <div className="space-y-6">
          {/* Basic Settings */}
          <Card className="p-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Basic Settings</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Widget Title
                </label>
                <Input
                  defaultValue="Chat with us!"
                  placeholder="Enter widget title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Welcome Message
                </label>
                <Input
                  defaultValue="Hi! How can we help you today?"
                  placeholder="Enter welcome message"
                />
              </div>
            </div>
          </Card>

          {/* Appearance */}
          <Card className="p-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Appearance</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Color
                </label>
                <input
                  type="color"
                  defaultValue="#3B82F6"
                  className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Position
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>Bottom Right</option>
                  <option>Bottom Left</option>
                  <option>Top Right</option>
                  <option>Top Left</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Size
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>Medium</option>
                  <option>Small</option>
                  <option>Large</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Advanced Settings */}
          <Card className="p-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Advanced Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Auto-open widget</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Automatically open chat after page load</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:ring-offset-2">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform translate-x-1" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Collect email addresses</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Request visitor email before starting chat</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-brand-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:ring-offset-2">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform translate-x-6" />
                </button>
              </div>
            </div>
          </Card>

          {/* Embed Code */}
          <Card className="p-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Embed Code</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Copy and paste this code into your website's HTML, preferably before the closing &lt;/body&gt; tag.
            </p>
            <div className="relative">
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto">
{`<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://widget.visionarychurch.ai/embed.js';
    script.setAttribute('data-church-id', 'your-church-id');
    document.head.appendChild(script);
  })();
</script>`}
              </pre>
              <button
                onClick={() => {
                  // Copy to clipboard functionality
                  console.log('Copied to clipboard')
                }}
                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Analytics</h3>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Conversations</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">1,247</p>
            </div>
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Response Time</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">2.3s</p>
            </div>
            <ClockIcon className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Satisfaction Score</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">4.8</p>
            </div>
            <div className="text-yellow-400">
              {renderStars(5)}
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">23%</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chat Widget Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor conversations, manage AI responses, and configure your chat widget
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
      <div className="mt-6">
        {activeTab === 'conversations' && renderConversations()}
        {activeTab === 'templates' && renderTemplates()}
        {activeTab === 'settings' && renderSettings()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>

      {/* Conversation Detail Modal */}
      {selectedConversation && (
        <Modal
          isOpen={showConversationModal}
          onClose={() => setShowConversationModal(false)}
          title={`Conversation with ${selectedConversation.visitor.name}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className={cn('px-3 py-1 rounded-full text-sm font-medium', getStatusColor(selectedConversation.status))}>
                {selectedConversation.status}
              </span>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {formatDuration(selectedConversation.startTime, selectedConversation.endTime)}
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">{selectedConversation.summary}</p>
            </div>

            {selectedConversation.satisfaction && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Satisfaction Rating</h4>
                {renderStars(selectedConversation.satisfaction)}
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {selectedConversation.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Template Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title={editingTemplate ? 'Edit Template' : 'Add New Template'}
      >
        <div className="space-y-4">
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
              Trigger Keywords (regex supported)
            </label>
            <Input
              value={newTemplate.trigger}
              onChange={(e) => setNewTemplate({ ...newTemplate, trigger: e.target.value })}
              placeholder="e.g., service times|worship|schedule"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Response Template
            </label>
            <TextArea
              value={newTemplate.response}
              onChange={(e) => setNewTemplate({ ...newTemplate, response: e.target.value })}
              placeholder="Enter the AI response template"
              rows={4}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => setShowTemplateModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => {
              // Save template logic
              setShowTemplateModal(false)
            }}>
              {editingTemplate ? 'Update' : 'Create'} Template
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ChatWidgetManagement