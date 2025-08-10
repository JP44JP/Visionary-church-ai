'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CogIcon,
  UserIcon,
  PaintBrushIcon,
  BellIcon,
  LinkIcon,
  ShieldCheckIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { TextArea } from '@/components/ui/TextArea'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface ChurchInfo {
  name: string
  slug: string
  description: string
  website: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  logo: string
  banner: string
  timezone: string
}

interface ServiceTime {
  id: string
  name: string
  dayOfWeek: number
  time: string
  description: string
  isActive: boolean
}

interface StaffMember {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'church_admin' | 'staff' | 'prayer_team_leader' | 'prayer_team_member' | 'counselor'
  permissions: string[]
  isActive: boolean
  lastLogin?: Date
  inviteStatus: 'pending' | 'accepted' | 'expired'
}

interface BrandingSettings {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: 'Inter' | 'Montserrat' | 'Open Sans' | 'Roboto'
  logoStyle: 'text' | 'image' | 'combined'
  customCSS: string
}

interface NotificationSettings {
  emailNotifications: {
    newVisitors: boolean
    prayerRequests: boolean
    eventRegistrations: boolean
    systemAlerts: boolean
  }
  smsNotifications: {
    urgentPrayers: boolean
    systemAlerts: boolean
  }
  pushNotifications: {
    chatMessages: boolean
    newVisitors: boolean
    systemAlerts: boolean
  }
}

interface IntegrationSettings {
  email: {
    provider: 'sendgrid' | 'mailgun' | 'smtp'
    apiKey: string
    fromEmail: string
    fromName: string
  }
  sms: {
    provider: 'twilio' | 'vonage'
    accountSid: string
    authToken: string
    phoneNumber: string
  }
  payment: {
    provider: 'stripe' | 'paypal'
    publicKey: string
    secretKey: string
    webhookSecret: string
  }
  analytics: {
    googleAnalytics: string
    facebookPixel: string
  }
}

const sampleChurchInfo: ChurchInfo = {
  name: 'Grace Community Church',
  slug: 'grace-community',
  description: 'A welcoming community where faith, hope, and love come together. Join us as we grow in Christ and serve our community.',
  website: 'https://gracecommunity.org',
  email: 'info@gracecommunity.org',
  phone: '(555) 123-4567',
  address: {
    street: '123 Faith Street',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    country: 'United States'
  },
  logo: '/images/church-logo.png',
  banner: '/images/church-banner.jpg',
  timezone: 'America/Chicago'
}

const sampleServiceTimes: ServiceTime[] = [
  {
    id: '1',
    name: 'Early Service',
    dayOfWeek: 0,
    time: '08:30',
    description: 'Traditional worship service',
    isActive: true
  },
  {
    id: '2',
    name: 'Main Service',
    dayOfWeek: 0,
    time: '11:00',
    description: 'Contemporary worship with full band',
    isActive: true
  },
  {
    id: '3',
    name: 'Evening Service',
    dayOfWeek: 0,
    time: '18:00',
    description: 'Casual evening service',
    isActive: true
  },
  {
    id: '4',
    name: 'Wednesday Prayer',
    dayOfWeek: 3,
    time: '19:00',
    description: 'Mid-week prayer and fellowship',
    isActive: true
  }
]

const sampleStaff: StaffMember[] = [
  {
    id: '1',
    name: 'Pastor John Smith',
    email: 'pastor@gracecommunity.org',
    role: 'super_admin',
    permissions: ['all'],
    isActive: true,
    lastLogin: new Date('2024-08-15T14:30:00Z'),
    inviteStatus: 'accepted'
  },
  {
    id: '2',
    name: 'Mary Johnson',
    email: 'mary@gracecommunity.org',
    role: 'church_admin',
    permissions: ['manage_visitors', 'manage_events', 'manage_prayer_requests', 'view_analytics'],
    isActive: true,
    lastLogin: new Date('2024-08-15T10:15:00Z'),
    inviteStatus: 'accepted'
  },
  {
    id: '3',
    name: 'David Wilson',
    email: 'david@gracecommunity.org',
    role: 'staff',
    permissions: ['manage_visitors', 'view_analytics'],
    isActive: true,
    lastLogin: new Date('2024-08-14T16:45:00Z'),
    inviteStatus: 'accepted'
  },
  {
    id: '4',
    name: 'Sarah Lee',
    email: 'sarah@gracecommunity.org',
    role: 'prayer_team_leader',
    permissions: ['manage_prayer_requests', 'assign_prayer_requests'],
    isActive: true,
    inviteStatus: 'pending'
  }
]

const ChurchSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [churchInfo, setChurchInfo] = useState(sampleChurchInfo)
  const [serviceTimes, setServiceTimes] = useState(sampleServiceTimes)
  const [staff, setStaff] = useState(sampleStaff)
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({})

  const tabs = [
    { id: 'general', label: 'General', icon: CogIcon },
    { id: 'services', label: 'Service Times', icon: ClockIcon },
    { id: 'staff', label: 'Staff & Permissions', icon: UserIcon },
    { id: 'branding', label: 'Branding', icon: PaintBrushIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'integrations', label: 'Integrations', icon: LinkIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon }
  ]

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  const roleOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'church_admin', label: 'Church Admin' },
    { value: 'staff', label: 'Staff Member' },
    { value: 'prayer_team_leader', label: 'Prayer Team Leader' },
    { value: 'prayer_team_member', label: 'Prayer Team Member' },
    { value: 'counselor', label: 'Counselor' }
  ]

  const getRoleBadgeColor = (role: StaffMember['role']) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'church_admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'staff':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'prayer_team_leader':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'prayer_team_member':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'counselor':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const renderGeneralSettings = () => (
    <div className="space-y-8">
      {/* Church Information */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Church Information</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(prev => ({ ...prev, general: !prev.general }))}
          >
            {isEditing.general ? (
              <>
                <CheckIcon className="h-4 w-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </>
            )}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Church Name
              </label>
              <Input
                value={churchInfo.name}
                onChange={(e) => setChurchInfo(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing.general}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL Slug
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                  visionarychurch.ai/
                </span>
                <Input
                  value={churchInfo.slug}
                  onChange={(e) => setChurchInfo(prev => ({ ...prev, slug: e.target.value }))}
                  disabled={!isEditing.general}
                  className="rounded-l-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              <Input
                value={churchInfo.website}
                onChange={(e) => setChurchInfo(prev => ({ ...prev, website: e.target.value }))}
                disabled={!isEditing.general}
                placeholder="https://your-church.org"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <Input
                value={churchInfo.email}
                onChange={(e) => setChurchInfo(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing.general}
                type="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone
              </label>
              <Input
                value={churchInfo.phone}
                onChange={(e) => setChurchInfo(prev => ({ ...prev, phone: e.target.value }))}
                disabled={!isEditing.general}
                type="tel"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <TextArea
                value={churchInfo.description}
                onChange={(e) => setChurchInfo(prev => ({ ...prev, description: e.target.value }))}
                disabled={!isEditing.general}
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <div className="space-y-2">
                <Input
                  value={churchInfo.address.street}
                  onChange={(e) => setChurchInfo(prev => ({
                    ...prev,
                    address: { ...prev.address, street: e.target.value }
                  }))}
                  disabled={!isEditing.general}
                  placeholder="Street Address"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={churchInfo.address.city}
                    onChange={(e) => setChurchInfo(prev => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value }
                    }))}
                    disabled={!isEditing.general}
                    placeholder="City"
                  />
                  <Input
                    value={churchInfo.address.state}
                    onChange={(e) => setChurchInfo(prev => ({
                      ...prev,
                      address: { ...prev.address, state: e.target.value }
                    }))}
                    disabled={!isEditing.general}
                    placeholder="State"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={churchInfo.address.zipCode}
                    onChange={(e) => setChurchInfo(prev => ({
                      ...prev,
                      address: { ...prev.address, zipCode: e.target.value }
                    }))}
                    disabled={!isEditing.general}
                    placeholder="ZIP Code"
                  />
                  <Input
                    value={churchInfo.address.country}
                    onChange={(e) => setChurchInfo(prev => ({
                      ...prev,
                      address: { ...prev.address, country: e.target.value }
                    }))}
                    disabled={!isEditing.general}
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Timezone */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timezone</h3>
        <Select
          options={[
            { value: 'America/New_York', label: 'Eastern Time (ET)' },
            { value: 'America/Chicago', label: 'Central Time (CT)' },
            { value: 'America/Denver', label: 'Mountain Time (MT)' },
            { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
            { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
            { value: 'America/Anchorage', label: 'Alaska Time (AKST)' },
            { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' }
          ]}
          value={churchInfo.timezone}
          onChange={(e) => setChurchInfo(prev => ({ ...prev, timezone: e.target.value }))}
        />
      </Card>
    </div>
  )

  const renderServiceTimes = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Service Times</h3>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Service Time
        </Button>
      </div>

      <div className="space-y-4">
        {serviceTimes.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Service Name
                    </label>
                    <Input
                      value={service.name}
                      onChange={(e) => {
                        setServiceTimes(prev => prev.map(s => 
                          s.id === service.id ? { ...s, name: e.target.value } : s
                        ))
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Day
                    </label>
                    <Select
                      options={dayNames.map((day, index) => ({ value: index.toString(), label: day }))}
                      value={service.dayOfWeek.toString()}
                      onChange={(e) => {
                        setServiceTimes(prev => prev.map(s => 
                          s.id === service.id ? { ...s, dayOfWeek: parseInt(e.target.value) } : s
                        ))
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Time
                    </label>
                    <Input
                      type="time"
                      value={service.time}
                      onChange={(e) => {
                        setServiceTimes(prev => prev.map(s => 
                          s.id === service.id ? { ...s, time: e.target.value } : s
                        ))
                      }}
                    />
                  </div>
                  <div className="flex items-end space-x-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`active-${service.id}`}
                        checked={service.isActive}
                        onChange={(e) => {
                          setServiceTimes(prev => prev.map(s => 
                            s.id === service.id ? { ...s, isActive: e.target.checked } : s
                          ))
                        }}
                        className="mr-2"
                      />
                      <label htmlFor={`active-${service.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                        Active
                      </label>
                    </div>
                    <Button variant="outline" size="sm">
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <TextArea
                  value={service.description}
                  onChange={(e) => {
                    setServiceTimes(prev => prev.map(s => 
                      s.id === service.id ? { ...s, description: e.target.value } : s
                    ))
                  }}
                  rows={2}
                />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderStaffManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Staff & Permissions</h3>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Invite Staff Member
        </Button>
      </div>

      <div className="space-y-4">
        {staff.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {member.name.split(' ').map(n => n.charAt(0)).join('')}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </h4>
                      <Badge className={getRoleBadgeColor(member.role)}>
                        {member.role.replace('_', ' ')}
                      </Badge>
                      {member.inviteStatus === 'pending' && (
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          Invite Pending
                        </Badge>
                      )}
                      <span className={cn(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        member.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      )}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-4 w-4 mr-2" />
                        {member.email}
                      </div>
                      {member.lastLogin && (
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          Last login: {member.lastLogin.toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Permissions:</h5>
                      <div className="flex flex-wrap gap-1">
                        {member.permissions.includes('all') ? (
                          <Badge className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            All Permissions
                          </Badge>
                        ) : (
                          member.permissions.map(permission => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission.replace('_', ' ')}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="outline" size="sm">
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  {member.role !== 'super_admin' && (
                    <Button variant="outline" size="sm">
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderBrandingSettings = () => (
    <div className="space-y-8">
      {/* Color Scheme */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Color Scheme</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Primary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                defaultValue="#3B82F6"
                className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
              />
              <Input defaultValue="#3B82F6" className="flex-1" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Secondary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                defaultValue="#9333EA"
                className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
              />
              <Input defaultValue="#9333EA" className="flex-1" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Accent Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                defaultValue="#F59E0B"
                className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
              />
              <Input defaultValue="#F59E0B" className="flex-1" />
            </div>
          </div>
        </div>
      </Card>

      {/* Typography */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Typography</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Font Family
            </label>
            <Select
              options={[
                { value: 'Inter', label: 'Inter (Recommended)' },
                { value: 'Montserrat', label: 'Montserrat' },
                { value: 'Open Sans', label: 'Open Sans' },
                { value: 'Roboto', label: 'Roboto' }
              ]}
              defaultValue="Inter"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Logo Style
            </label>
            <Select
              options={[
                { value: 'text', label: 'Text Only' },
                { value: 'image', label: 'Image Only' },
                { value: 'combined', label: 'Text + Image' }
              ]}
              defaultValue="combined"
            />
          </div>
        </div>
      </Card>

      {/* Logo and Images */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Logo and Images</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Church Logo
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <CameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Upload your church logo
              </p>
              <Button variant="outline" size="sm">
                Choose File
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Banner Image
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <CameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Upload banner image
              </p>
              <Button variant="outline" size="sm">
                Choose File
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Custom CSS */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Custom CSS</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Add custom CSS to further customize your church's appearance
        </p>
        <TextArea
          placeholder="/* Add your custom CSS here */"
          rows={8}
          className="font-mono text-sm"
        />
      </Card>
    </div>
  )

  const renderIntegrations = () => (
    <div className="space-y-8">
      {/* Email Integration */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <EnvelopeIcon className="h-6 w-6 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Integration</h3>
          </div>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Connected
          </Badge>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Provider
            </label>
            <Select
              options={[
                { value: 'sendgrid', label: 'SendGrid' },
                { value: 'mailgun', label: 'Mailgun' },
                { value: 'smtp', label: 'Custom SMTP' }
              ]}
              defaultValue="sendgrid"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Email
            </label>
            <Input defaultValue="noreply@gracecommunity.org" type="email" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Key
            </label>
            <div className="relative">
              <Input
                type={showPassword.email ? 'text' : 'password'}
                defaultValue="sg.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({ ...prev, email: !prev.email }))}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showPassword.email ? (
                  <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Name
            </label>
            <Input defaultValue="Grace Community Church" />
          </div>
        </div>
      </Card>

      {/* SMS Integration */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <PhoneIcon className="h-6 w-6 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SMS Integration</h3>
          </div>
          <Badge variant="outline">
            Not Connected
          </Badge>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SMS Provider
            </label>
            <Select
              options={[
                { value: 'twilio', label: 'Twilio' },
                { value: 'vonage', label: 'Vonage' }
              ]}
              defaultValue="twilio"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <Input placeholder="+1 (555) 123-4567" type="tel" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Account SID
            </label>
            <Input placeholder="Enter your Account SID" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Auth Token
            </label>
            <div className="relative">
              <Input
                type={showPassword.sms ? 'text' : 'password'}
                placeholder="Enter your Auth Token"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({ ...prev, sms: !prev.sms }))}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showPassword.sms ? (
                  <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Integration */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <CogIcon className="h-6 w-6 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Integration</h3>
          </div>
          <Badge variant="outline">
            Not Connected
          </Badge>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Provider
            </label>
            <Select
              options={[
                { value: 'stripe', label: 'Stripe' },
                { value: 'paypal', label: 'PayPal' }
              ]}
              defaultValue="stripe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Public Key
            </label>
            <Input placeholder="pk_live_..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Secret Key
            </label>
            <div className="relative">
              <Input
                type={showPassword.payment ? 'text' : 'password'}
                placeholder="sk_live_..."
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({ ...prev, payment: !prev.payment }))}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showPassword.payment ? (
                  <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Webhook Secret
            </label>
            <div className="relative">
              <Input
                type={showPassword.webhook ? 'text' : 'password'}
                placeholder="whsec_..."
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({ ...prev, webhook: !prev.webhook }))}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showPassword.webhook ? (
                  <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Church Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure your church information, staff, and integrations
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
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
        {activeTab === 'general' && renderGeneralSettings()}
        {activeTab === 'services' && renderServiceTimes()}
        {activeTab === 'staff' && renderStaffManagement()}
        {activeTab === 'branding' && renderBrandingSettings()}
        {activeTab === 'notifications' && (
          <div className="text-center py-20">
            <div className="mx-auto h-24 w-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
              <BellIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Notification Settings</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Advanced notification preferences and settings coming soon!
            </p>
          </div>
        )}
        {activeTab === 'integrations' && renderIntegrations()}
        {activeTab === 'security' && (
          <div className="text-center py-20">
            <div className="mx-auto h-24 w-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
              <ShieldCheckIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Security Settings</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Two-factor authentication, audit logs, and security settings coming soon!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChurchSettings