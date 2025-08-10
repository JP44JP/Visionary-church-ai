import { Database } from './supabase';

// Type aliases for better readability
export type Event = Database['public']['Tables']['events']['Row'];
export type EventInsert = Database['public']['Tables']['events']['Insert'];
export type EventUpdate = Database['public']['Tables']['events']['Update'];

export type EventRegistration = Database['public']['Tables']['event_registrations']['Row'];
export type EventRegistrationInsert = Database['public']['Tables']['event_registrations']['Insert'];
export type EventRegistrationUpdate = Database['public']['Tables']['event_registrations']['Update'];

export type EventVolunteer = Database['public']['Tables']['event_volunteers']['Row'];
export type EventVolunteerInsert = Database['public']['Tables']['event_volunteers']['Insert'];
export type EventVolunteerUpdate = Database['public']['Tables']['event_volunteers']['Update'];

export type EventResource = Database['public']['Tables']['event_resources']['Row'];
export type EventResourceInsert = Database['public']['Tables']['event_resources']['Insert'];
export type EventResourceUpdate = Database['public']['Tables']['event_resources']['Update'];

export type EventCommunication = Database['public']['Tables']['event_communications']['Row'];
export type EventCommunicationInsert = Database['public']['Tables']['event_communications']['Insert'];
export type EventCommunicationUpdate = Database['public']['Tables']['event_communications']['Update'];

export type EventAttendance = Database['public']['Tables']['event_attendance']['Row'];
export type EventAttendanceInsert = Database['public']['Tables']['event_attendance']['Insert'];
export type EventAttendanceUpdate = Database['public']['Tables']['event_attendance']['Update'];

// Event type enums
export type EventType = Database['public']['Enums']['event_type'];
export type CostType = Database['public']['Enums']['cost_type'];
export type AudienceType = Database['public']['Enums']['audience_type'];
export type EventStatus = Database['public']['Enums']['event_status'];
export type RegistrationType = Database['public']['Enums']['registration_type'];
export type RegistrationStatus = Database['public']['Enums']['registration_status'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];
export type VolunteerStatus = Database['public']['Enums']['volunteer_status'];
export type ResourceType = Database['public']['Enums']['resource_type'];
export type BookingStatus = Database['public']['Enums']['booking_status'];
export type CommunicationType = Database['public']['Enums']['communication_type'];
export type CommunicationChannel = Database['public']['Enums']['communication_channel'];
export type CommunicationStatus = Database['public']['Enums']['communication_status'];
export type AttendanceStatus = Database['public']['Enums']['attendance_status'];
export type CheckInMethod = Database['public']['Enums']['check_in_method'];

// Extended interfaces for API responses
export interface EventWithDetails extends Event {
  registrations: EventRegistration[];
  volunteers: EventVolunteer[];
  resources: EventResource[];
  communications: EventCommunication[];
  attendance: EventAttendance[];
  creator: {
    id: string;
    full_name: string | null;
    email: string;
  };
  church: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface EventRegistrationWithDetails extends EventRegistration {
  event: Event;
  user?: {
    id: string;
    full_name: string | null;
    email: string;
    phone: string | null;
  };
  visitor?: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
  };
}

export interface EventVolunteerWithDetails extends EventVolunteer {
  event: Event;
  user: {
    id: string;
    full_name: string | null;
    email: string;
    phone: string | null;
  };
}

// Recurrence pattern interface
export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // Every X days/weeks/months/years
  byWeekDay?: number[]; // 0 = Sunday, 1 = Monday, etc.
  byMonthDay?: number[]; // Day of month (1-31)
  byMonth?: number[]; // Month (1-12)
  until?: string; // End date
  count?: number; // Number of occurrences
}

// Event settings interface
export interface EventSettings {
  allowWaitlist: boolean;
  sendReminders: boolean;
  reminderSchedule: {
    days: number;
    hours: number;
  }[];
  customFields: {
    id: string;
    name: string;
    type: 'text' | 'email' | 'phone' | 'number' | 'select' | 'multiselect' | 'textarea' | 'checkbox';
    required: boolean;
    options?: string[];
  }[];
  cancellationPolicy: {
    allowCancellation: boolean;
    deadlineHours: number;
    refundPolicy: string;
  };
  checkInSettings: {
    enableQRCode: boolean;
    enableManualCheckIn: boolean;
    enableMobileApp: boolean;
    requireCheckOut: boolean;
  };
}

// Registration request interface
export interface EventRegistrationRequest {
  eventId: string;
  registrationType: RegistrationType;
  attendeeCount: number;
  userDetails?: {
    userId: string;
  };
  visitorDetails?: {
    fullName: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  guestDetails?: {
    name: string;
    email?: string;
    phone?: string;
    ageGroup?: string;
  }[];
  customFields?: Record<string, any>;
  paymentInfo?: {
    amount: number;
    method: 'credit_card' | 'bank_transfer' | 'cash' | 'waived';
    reference?: string;
  };
}

// Event creation request interface
export interface EventCreateRequest {
  title: string;
  description?: string;
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  timezone?: string;
  eventType: EventType;
  category: string;
  capacity?: number;
  cost?: number;
  costType: CostType;
  ageGroups?: string[];
  audienceType: AudienceType;
  registrationRequired: boolean;
  registrationDeadline?: string;
  waitlistEnabled: boolean;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  imageUrl?: string;
  settings: EventSettings;
}

// Volunteer role definition
export interface VolunteerRole {
  name: string;
  description?: string;
  requirements?: string[];
  capacity?: number;
  skills?: string[];
  timeCommitment?: string;
}

// Event analytics interface
export interface EventAnalytics {
  eventId: string;
  totalRegistrations: number;
  confirmedRegistrations: number;
  waitlistedRegistrations: number;
  cancelledRegistrations: number;
  actualAttendance: number;
  attendanceRate: number;
  registrationConversionRate: number;
  demographicBreakdown: {
    ageGroups: Record<string, number>;
    memberTypes: Record<string, number>;
  };
  volunteerMetrics: {
    totalVolunteers: number;
    hoursServed: number;
    rolesFilledRate: number;
  };
  financialMetrics: {
    totalRevenue: number;
    totalCosts: number;
    netProfit: number;
    averageTicketPrice: number;
  };
  engagementMetrics: {
    emailOpenRate?: number;
    smsDeliveryRate?: number;
    checkInTime: {
      average: number;
      distribution: Record<string, number>;
    };
  };
}

// Event filter interface
export interface EventFilters {
  startDate?: string;
  endDate?: string;
  eventType?: EventType[];
  category?: string[];
  status?: EventStatus[];
  audienceType?: AudienceType[];
  location?: string;
  registrationRequired?: boolean;
  cost?: {
    min?: number;
    max?: number;
    type?: CostType[];
  };
  capacity?: {
    min?: number;
    max?: number;
  };
  search?: string;
}

// Event sort options
export interface EventSortOptions {
  field: 'start_date' | 'title' | 'created_at' | 'updated_at' | 'capacity' | 'cost';
  direction: 'asc' | 'desc';
}

// Pagination interface
export interface PaginationOptions {
  page: number;
  limit: number;
}

// API response interfaces
export interface EventListResponse {
  events: EventWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: EventFilters;
  sort: EventSortOptions;
}

export interface EventStatsResponse {
  totalEvents: number;
  activeEvents: number;
  upcomingEvents: number;
  totalRegistrations: number;
  totalAttendees: number;
  averageAttendanceRate: number;
  popularEventTypes: {
    type: EventType;
    count: number;
  }[];
  revenueThisMonth: number;
}

// Communication template interface
export interface CommunicationTemplate {
  type: CommunicationType;
  channel: CommunicationChannel;
  subject: string;
  content: string;
  variables: string[]; // Available template variables
}

// Check-in response interface
export interface CheckInResponse {
  success: boolean;
  attendanceId?: string;
  message: string;
  attendeeInfo?: {
    name: string;
    registrationStatus: RegistrationStatus;
    ticketType?: string;
    specialNotes?: string;
  };
}

// QR Code data interface
export interface QRCodeData {
  eventId: string;
  registrationId?: string;
  userId?: string;
  visitorId?: string;
  checkInToken: string;
  expiresAt: string;
}

// Event export interface
export interface EventExportData {
  event: EventWithDetails;
  registrations: EventRegistrationWithDetails[];
  attendance: EventAttendance[];
  volunteers: EventVolunteerWithDetails[];
  analytics: EventAnalytics;
}

// Notification preferences interface
export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  pushNotification: boolean;
  reminderTiming: number[]; // Days before event
  communicationTypes: CommunicationType[];
}

// Event series interface (for recurring events)
export interface EventSeries {
  id: string;
  title: string;
  description?: string;
  recurrencePattern: RecurrencePattern;
  events: Event[];
  totalEvents: number;
  completedEvents: number;
  upcomingEvents: number;
}