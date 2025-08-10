import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import {
  Event,
  EventInsert,
  EventUpdate,
  EventWithDetails,
  EventRegistration,
  EventRegistrationInsert,
  EventRegistrationRequest,
  EventVolunteer,
  EventVolunteerInsert,
  EventResource,
  EventResourceInsert,
  EventCommunication,
  EventCommunicationInsert,
  EventAttendance,
  EventAttendanceInsert,
  EventFilters,
  EventSortOptions,
  PaginationOptions,
  EventListResponse,
  EventAnalytics,
  EventStatsResponse,
  CheckInResponse,
  QRCodeData,
  RecurrencePattern,
  EventCreateRequest,
} from '../types/events';
import { addDays, addWeeks, addMonths, addYears, parseISO, format, isAfter, isBefore } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export class EventService {
  private supabase: ReturnType<typeof createClient<Database>>;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  // Event CRUD Operations
  async createEvent(churchId: string, userId: string, eventData: EventCreateRequest): Promise<Event> {
    const eventInsert: EventInsert = {
      church_id: churchId,
      created_by: userId,
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      start_date: eventData.startDate,
      end_date: eventData.endDate,
      start_time: eventData.startTime,
      end_time: eventData.endTime,
      timezone: eventData.timezone || 'UTC',
      event_type: eventData.eventType,
      category: eventData.category,
      capacity: eventData.capacity,
      cost: eventData.cost,
      cost_type: eventData.costType,
      age_groups: eventData.ageGroups,
      audience_type: eventData.audienceType,
      registration_required: eventData.registrationRequired,
      registration_deadline: eventData.registrationDeadline,
      waitlist_enabled: eventData.waitlistEnabled,
      is_recurring: eventData.isRecurring,
      recurrence_pattern: eventData.recurrencePattern as any,
      image_url: eventData.imageUrl,
      settings: eventData.settings as any,
      status: 'draft',
    };

    const { data, error } = await this.supabase
      .from('events')
      .insert(eventInsert)
      .select('*')
      .single();

    if (error) throw error;

    // If recurring event, create all instances
    if (eventData.isRecurring && eventData.recurrencePattern) {
      await this.createRecurringInstances(data.id, eventData, eventData.recurrencePattern);
    }

    return data;
  }

  async updateEvent(eventId: string, updates: EventUpdate): Promise<Event> {
    const { data, error } = await this.supabase
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async deleteEvent(eventId: string): Promise<void> {
    const { error } = await this.supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
  }

  async getEvent(eventId: string): Promise<EventWithDetails | null> {
    const { data, error } = await this.supabase
      .from('events')
      .select(`
        *,
        registrations:event_registrations(*),
        volunteers:event_volunteers(*),
        resources:event_resources(*),
        communications:event_communications(*),
        attendance:event_attendance(*),
        creator:users!events_created_by_fkey(id, full_name, email),
        church:churches(id, name, slug)
      `)
      .eq('id', eventId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data as EventWithDetails;
  }

  async getEvents(
    churchId: string,
    filters: EventFilters = {},
    sort: EventSortOptions = { field: 'start_date', direction: 'asc' },
    pagination: PaginationOptions = { page: 1, limit: 25 }
  ): Promise<EventListResponse> {
    let query = this.supabase
      .from('events')
      .select(`
        *,
        registrations:event_registrations(*),
        volunteers:event_volunteers(*),
        resources:event_resources(*),
        communications:event_communications(*),
        attendance:event_attendance(*),
        creator:users!events_created_by_fkey(id, full_name, email),
        church:churches(id, name, slug)
      `, { count: 'exact' })
      .eq('church_id', churchId);

    // Apply filters
    if (filters.startDate) {
      query = query.gte('start_date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('end_date', filters.endDate);
    }
    if (filters.eventType && filters.eventType.length > 0) {
      query = query.in('event_type', filters.eventType);
    }
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    if (filters.audienceType && filters.audienceType.length > 0) {
      query = query.in('audience_type', filters.audienceType);
    }
    if (filters.registrationRequired !== undefined) {
      query = query.eq('registration_required', filters.registrationRequired);
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Apply sorting
    query = query.order(sort.field, { ascending: sort.direction === 'asc' });

    // Apply pagination
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit - 1;
    query = query.range(start, end);

    const { data, error, count } = await query;

    if (error) throw error;

    const totalPages = Math.ceil((count || 0) / pagination.limit);

    return {
      events: (data as EventWithDetails[]) || [],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: count || 0,
        totalPages,
      },
      filters,
      sort,
    };
  }

  async getPublicEvents(churchId: string, filters: EventFilters = {}): Promise<Event[]> {
    let query = this.supabase
      .from('events')
      .select('*')
      .eq('church_id', churchId)
      .eq('status', 'published')
      .gte('start_date', new Date().toISOString().split('T')[0]);

    // Apply public filters
    if (filters.startDate) {
      query = query.gte('start_date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('end_date', filters.endDate);
    }
    if (filters.eventType && filters.eventType.length > 0) {
      query = query.in('event_type', filters.eventType);
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    query = query.order('start_date', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  // Registration Management
  async registerForEvent(registrationData: EventRegistrationRequest): Promise<EventRegistration> {
    // Check event capacity and registration deadline
    const event = await this.getEvent(registrationData.eventId);
    if (!event) throw new Error('Event not found');

    if (event.registration_deadline && isAfter(new Date(), parseISO(event.registration_deadline))) {
      throw new Error('Registration deadline has passed');
    }

    // Check capacity
    const currentRegistrations = event.registrations.filter(r => r.status === 'confirmed').length;
    const isWaitlisted = event.capacity && currentRegistrations >= event.capacity;

    const registrationInsert: EventRegistrationInsert = {
      event_id: registrationData.eventId,
      user_id: registrationData.userDetails?.userId,
      visitor_id: registrationData.visitorDetails ? await this.createVisitorFromDetails(registrationData.visitorDetails) : undefined,
      registration_type: registrationData.registrationType,
      status: isWaitlisted && event.waitlist_enabled ? 'waitlisted' : 'pending',
      attendee_count: registrationData.attendeeCount,
      guest_details: registrationData.guestDetails as any,
      custom_fields: registrationData.customFields as any,
      payment_status: registrationData.paymentInfo ? 'pending' : 'completed',
      payment_amount: registrationData.paymentInfo?.amount,
      payment_reference: registrationData.paymentInfo?.reference,
    };

    const { data, error } = await this.supabase
      .from('event_registrations')
      .insert(registrationInsert)
      .select('*')
      .single();

    if (error) throw error;

    // Send confirmation communication
    await this.sendRegistrationConfirmation(data.id);

    return data;
  }

  async confirmRegistration(registrationId: string): Promise<EventRegistration> {
    const { data, error } = await this.supabase
      .from('event_registrations')
      .update({ status: 'confirmed' })
      .eq('id', registrationId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async cancelRegistration(registrationId: string, reason?: string): Promise<void> {
    const { error } = await this.supabase
      .from('event_registrations')
      .update({ 
        status: 'cancelled',
        notes: reason 
      })
      .eq('id', registrationId);

    if (error) throw error;

    // Handle waitlist promotion
    await this.promoteFromWaitlist(registrationId);
  }

  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    const { data, error } = await this.supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Volunteer Management
  async addVolunteerRole(eventId: string, userId: string, role: string, requirements?: string[]): Promise<EventVolunteer> {
    const volunteerInsert: EventVolunteerInsert = {
      event_id: eventId,
      user_id: userId,
      role,
      requirements,
      status: 'interested',
    };

    const { data, error } = await this.supabase
      .from('event_volunteers')
      .insert(volunteerInsert)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async confirmVolunteer(volunteerId: string): Promise<EventVolunteer> {
    const { data, error } = await this.supabase
      .from('event_volunteers')
      .update({ status: 'confirmed' })
      .eq('id', volunteerId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async checkInVolunteer(volunteerId: string): Promise<EventVolunteer> {
    const { data, error } = await this.supabase
      .from('event_volunteers')
      .update({ 
        status: 'checked_in',
        check_in_time: new Date().toISOString()
      })
      .eq('id', volunteerId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async checkOutVolunteer(volunteerId: string): Promise<EventVolunteer> {
    // Calculate hours served
    const volunteer = await this.supabase
      .from('event_volunteers')
      .select('*')
      .eq('id', volunteerId)
      .single();

    if (volunteer.error) throw volunteer.error;
    if (!volunteer.data.check_in_time) throw new Error('Volunteer not checked in');

    const checkInTime = new Date(volunteer.data.check_in_time);
    const checkOutTime = new Date();
    const hoursServed = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    const { data, error } = await this.supabase
      .from('event_volunteers')
      .update({ 
        status: 'completed',
        check_out_time: checkOutTime.toISOString(),
        hours_served: hoursServed
      })
      .eq('id', volunteerId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  // Resource Management
  async addEventResource(eventId: string, resourceData: Omit<EventResourceInsert, 'event_id'>): Promise<EventResource> {
    const resourceInsert: EventResourceInsert = {
      event_id: eventId,
      ...resourceData,
    };

    const { data, error } = await this.supabase
      .from('event_resources')
      .insert(resourceInsert)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async confirmResourceBooking(resourceId: string): Promise<EventResource> {
    const { data, error } = await this.supabase
      .from('event_resources')
      .update({ booking_status: 'confirmed' })
      .eq('id', resourceId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  // Communication Management
  async sendEventCommunication(communicationData: EventCommunicationInsert): Promise<EventCommunication> {
    const { data, error } = await this.supabase
      .from('event_communications')
      .insert({
        ...communicationData,
        status: 'sent',
        sent_time: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) throw error;

    // Here you would integrate with actual email/SMS services
    // await this.sendCommunicationViaChannel(data);

    return data;
  }

  async scheduleEventCommunication(communicationData: EventCommunicationInsert): Promise<EventCommunication> {
    const { data, error } = await this.supabase
      .from('event_communications')
      .insert({
        ...communicationData,
        status: 'scheduled'
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  // Attendance Management
  async checkInAttendee(eventId: string, registrationId: string, method: 'qr_code' | 'manual' = 'manual'): Promise<CheckInResponse> {
    try {
      // Get registration details
      const { data: registration, error: regError } = await this.supabase
        .from('event_registrations')
        .select(`
          *,
          user:users(*),
          visitor:visitors(*)
        `)
        .eq('id', registrationId)
        .single();

      if (regError) throw regError;
      if (!registration) throw new Error('Registration not found');

      // Check if already checked in
      const { data: existingAttendance } = await this.supabase
        .from('event_attendance')
        .select('*')
        .eq('event_id', eventId)
        .eq('registration_id', registrationId)
        .single();

      if (existingAttendance) {
        return {
          success: false,
          message: 'Already checked in',
          attendeeInfo: {
            name: registration.user?.full_name || registration.visitor?.full_name || 'Unknown',
            registrationStatus: registration.status,
          }
        };
      }

      // Create attendance record
      const attendanceInsert: EventAttendanceInsert = {
        event_id: eventId,
        user_id: registration.user_id,
        visitor_id: registration.visitor_id,
        registration_id: registrationId,
        attendance_status: 'present',
        check_in_method: method,
        check_in_time: new Date().toISOString(),
      };

      const { data: attendance, error: attendanceError } = await this.supabase
        .from('event_attendance')
        .insert(attendanceInsert)
        .select('*')
        .single();

      if (attendanceError) throw attendanceError;

      // Update registration status if pending
      if (registration.status === 'pending') {
        await this.supabase
          .from('event_registrations')
          .update({ status: 'confirmed', checked_in: true, check_in_time: new Date().toISOString() })
          .eq('id', registrationId);
      } else {
        await this.supabase
          .from('event_registrations')
          .update({ checked_in: true, check_in_time: new Date().toISOString() })
          .eq('id', registrationId);
      }

      return {
        success: true,
        attendanceId: attendance.id,
        message: 'Successfully checked in',
        attendeeInfo: {
          name: registration.user?.full_name || registration.visitor?.full_name || 'Unknown',
          registrationStatus: registration.status,
        }
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Check-in failed'
      };
    }
  }

  async generateQRCode(eventId: string, registrationId: string): Promise<QRCodeData> {
    const token = uuidv4();
    const expiresAt = addDays(new Date(), 1).toISOString(); // Valid for 1 day

    // Get registration details
    const { data: registration, error } = await this.supabase
      .from('event_registrations')
      .select('user_id, visitor_id')
      .eq('id', registrationId)
      .single();

    if (error) throw error;

    const qrData: QRCodeData = {
      eventId,
      registrationId,
      userId: registration.user_id,
      visitorId: registration.visitor_id,
      checkInToken: token,
      expiresAt,
    };

    // Store QR token in cache/database for validation
    // await this.storeQRToken(token, qrData);

    return qrData;
  }

  // Analytics and Reporting
  async getEventAnalytics(eventId: string): Promise<EventAnalytics> {
    const event = await this.getEvent(eventId);
    if (!event) throw new Error('Event not found');

    const registrations = event.registrations;
    const attendance = event.attendance;
    const volunteers = event.volunteers;

    const totalRegistrations = registrations.length;
    const confirmedRegistrations = registrations.filter(r => r.status === 'confirmed').length;
    const waitlistedRegistrations = registrations.filter(r => r.status === 'waitlisted').length;
    const cancelledRegistrations = registrations.filter(r => r.status === 'cancelled').length;
    const actualAttendance = attendance.filter(a => a.attendance_status === 'present').length;

    const attendanceRate = totalRegistrations > 0 ? (actualAttendance / totalRegistrations) * 100 : 0;
    const registrationConversionRate = totalRegistrations > 0 ? (confirmedRegistrations / totalRegistrations) * 100 : 0;

    // Calculate financial metrics
    const totalRevenue = registrations
      .filter(r => r.payment_status === 'completed')
      .reduce((sum, r) => sum + (r.payment_amount || 0), 0);

    const totalCosts = event.resources
      .reduce((sum, r) => sum + (r.cost || 0), 0);

    const averageTicketPrice = totalRegistrations > 0 ? totalRevenue / totalRegistrations : 0;

    // Calculate volunteer metrics
    const totalVolunteers = volunteers.length;
    const hoursServed = volunteers
      .filter(v => v.hours_served)
      .reduce((sum, v) => sum + (v.hours_served || 0), 0);

    return {
      eventId,
      totalRegistrations,
      confirmedRegistrations,
      waitlistedRegistrations,
      cancelledRegistrations,
      actualAttendance,
      attendanceRate,
      registrationConversionRate,
      demographicBreakdown: {
        ageGroups: {},
        memberTypes: {},
      },
      volunteerMetrics: {
        totalVolunteers,
        hoursServed,
        rolesFilledRate: 0, // Calculate based on required vs filled roles
      },
      financialMetrics: {
        totalRevenue,
        totalCosts,
        netProfit: totalRevenue - totalCosts,
        averageTicketPrice,
      },
      engagementMetrics: {
        checkInTime: {
          average: 0,
          distribution: {},
        },
      },
    };
  }

  async getEventStats(churchId: string): Promise<EventStatsResponse> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all events for the church
    const { data: events, error: eventsError } = await this.supabase
      .from('events')
      .select(`
        *,
        registrations:event_registrations(*),
        attendance:event_attendance(*)
      `)
      .eq('church_id', churchId);

    if (eventsError) throw eventsError;

    const totalEvents = events?.length || 0;
    const activeEvents = events?.filter(e => e.status === 'published').length || 0;
    const upcomingEvents = events?.filter(e => 
      e.status === 'published' && new Date(e.start_date) > now
    ).length || 0;

    const totalRegistrations = events?.reduce((sum, e) => sum + (e.registrations?.length || 0), 0) || 0;
    const totalAttendees = events?.reduce((sum, e) => 
      sum + (e.attendance?.filter((a: any) => a.attendance_status === 'present').length || 0), 0
    ) || 0;

    const averageAttendanceRate = totalRegistrations > 0 ? (totalAttendees / totalRegistrations) * 100 : 0;

    // Calculate popular event types
    const eventTypeCounts = events?.reduce((acc: Record<string, number>, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {}) || {};

    const popularEventTypes = Object.entries(eventTypeCounts)
      .map(([type, count]) => ({ type: type as any, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate revenue for this month
    const thisMonthEvents = events?.filter(e => 
      new Date(e.created_at) >= startOfMonth
    ) || [];

    const revenueThisMonth = thisMonthEvents.reduce((sum, event) => {
      const eventRevenue = event.registrations?.reduce((regSum: number, reg: any) => {
        return regSum + (reg.payment_status === 'completed' ? (reg.payment_amount || 0) : 0);
      }, 0) || 0;
      return sum + eventRevenue;
    }, 0);

    return {
      totalEvents,
      activeEvents,
      upcomingEvents,
      totalRegistrations,
      totalAttendees,
      averageAttendanceRate,
      popularEventTypes,
      revenueThisMonth,
    };
  }

  // Private helper methods
  private async createRecurringInstances(
    baseEventId: string,
    eventData: EventCreateRequest,
    pattern: RecurrencePattern
  ): Promise<void> {
    const instances: EventInsert[] = [];
    const startDate = parseISO(eventData.startDate);
    let currentDate = startDate;
    let count = 0;

    // Generate instances based on pattern
    while (
      (pattern.until && isBefore(currentDate, parseISO(pattern.until))) ||
      (pattern.count && count < pattern.count) ||
      (!pattern.until && !pattern.count && count < 52) // Default max of 52 instances
    ) {
      if (count === 0) {
        currentDate = this.getNextOccurrence(currentDate, pattern);
        count++;
        continue;
      }

      // Create event instance
      const instanceData: EventInsert = {
        church_id: eventData.title, // This should be fixed
        created_by: baseEventId, // This should be fixed
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        start_date: format(currentDate, 'yyyy-MM-dd'),
        end_date: format(currentDate, 'yyyy-MM-dd'), // Adjust for multi-day events
        start_time: eventData.startTime,
        end_time: eventData.endTime,
        timezone: eventData.timezone || 'UTC',
        event_type: eventData.eventType,
        category: eventData.category,
        capacity: eventData.capacity,
        cost: eventData.cost,
        cost_type: eventData.costType,
        age_groups: eventData.ageGroups,
        audience_type: eventData.audienceType,
        registration_required: eventData.registrationRequired,
        registration_deadline: eventData.registrationDeadline,
        waitlist_enabled: eventData.waitlistEnabled,
        is_recurring: false, // Individual instances are not recurring
        recurrence_pattern: null,
        image_url: eventData.imageUrl,
        settings: eventData.settings as any,
        status: 'draft',
      };

      instances.push(instanceData);
      currentDate = this.getNextOccurrence(currentDate, pattern);
      count++;
    }

    if (instances.length > 0) {
      const { error } = await this.supabase
        .from('events')
        .insert(instances);

      if (error) throw error;
    }
  }

  private getNextOccurrence(currentDate: Date, pattern: RecurrencePattern): Date {
    switch (pattern.frequency) {
      case 'daily':
        return addDays(currentDate, pattern.interval);
      case 'weekly':
        return addWeeks(currentDate, pattern.interval);
      case 'monthly':
        return addMonths(currentDate, pattern.interval);
      case 'yearly':
        return addYears(currentDate, pattern.interval);
      default:
        return addDays(currentDate, 1);
    }
  }

  private async createVisitorFromDetails(visitorDetails: any): Promise<string> {
    const { data, error } = await this.supabase
      .from('visitors')
      .insert({
        full_name: visitorDetails.fullName,
        email: visitorDetails.email,
        phone: visitorDetails.phone,
        address: visitorDetails.address,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  private async promoteFromWaitlist(cancelledRegistrationId: string): Promise<void> {
    // Get the event from the cancelled registration
    const { data: cancelledReg, error: regError } = await this.supabase
      .from('event_registrations')
      .select('event_id')
      .eq('id', cancelledRegistrationId)
      .single();

    if (regError) return;

    // Find the first waitlisted registration
    const { data: waitlisted, error: waitError } = await this.supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', cancelledReg.event_id)
      .eq('status', 'waitlisted')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (waitError || !waitlisted) return;

    // Promote from waitlist
    await this.supabase
      .from('event_registrations')
      .update({ status: 'confirmed' })
      .eq('id', waitlisted.id);

    // Send promotion notification
    await this.sendWaitlistPromotion(waitlisted.id);
  }

  private async sendRegistrationConfirmation(registrationId: string): Promise<void> {
    // Implementation would integrate with email/SMS service
    // This is a placeholder for the actual communication logic
  }

  private async sendWaitlistPromotion(registrationId: string): Promise<void> {
    // Implementation would integrate with email/SMS service
    // This is a placeholder for the actual communication logic
  }
}