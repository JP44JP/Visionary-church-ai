// Visit Planning System API Implementation
// Comprehensive church visit scheduling and management system

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { addDays, format, isAfter, isBefore, parse, startOfDay } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface ServiceTime {
  id: string;
  name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  description?: string;
  service_type: string;
  capacity: number;
  is_visitor_friendly: boolean;
  special_notes?: string;
  location: string;
  is_active: boolean;
  requires_registration: boolean;
  registration_deadline_hours: number;
}

interface VisitPlan {
  id: string;
  service_time_id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone?: string;
  planned_date: string;
  party_size: number;
  adults_count: number;
  children_count: number;
  children_ages: number[];
  special_needs?: string;
  dietary_restrictions?: string;
  wheelchair_accessible: boolean;
  parking_assistance: boolean;
  childcare_needed: boolean;
  preferred_contact_method: 'email' | 'phone' | 'sms';
  contact_time_preference?: string;
  status: 'planned' | 'confirmed' | 'attended' | 'no_show' | 'cancelled' | 'rescheduled';
  lead_source: string;
  referrer_name?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  chat_conversation_id?: string;
  created_at: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string;
  location: string;
  attendees: string[];
}

interface VisitAnalytics {
  totalVisits: number;
  confirmedVisits: number;
  attendedVisits: number;
  noShows: number;
  conversionRate: number;
  averagePartySize: number;
  popularServices: { name: string; count: number }[];
  leadSources: { source: string; count: number }[];
}

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const serviceTimeSchema = z.object({
  name: z.string().min(1).max(255),
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  description: z.string().optional(),
  service_type: z.enum(['worship', 'bible_study', 'prayer', 'youth', 'children']),
  capacity: z.number().int().positive().default(200),
  is_visitor_friendly: z.boolean().default(true),
  special_notes: z.string().optional(),
  location: z.string().default('Main Sanctuary'),
  requires_registration: z.boolean().default(false),
  registration_deadline_hours: z.number().int().min(0).default(0)
});

const visitPlanSchema = z.object({
  service_time_id: z.string().uuid(),
  visitor_name: z.string().min(1).max(255),
  visitor_email: z.string().email(),
  visitor_phone: z.string().optional(),
  planned_date: z.string().date(),
  party_size: z.number().int().positive().max(20),
  adults_count: z.number().int().min(1).max(20),
  children_count: z.number().int().min(0).max(15),
  children_ages: z.array(z.number().int().min(0).max(18)).default([]),
  special_needs: z.string().max(1000).optional(),
  dietary_restrictions: z.string().max(500).optional(),
  wheelchair_accessible: z.boolean().default(false),
  parking_assistance: z.boolean().default(false),
  childcare_needed: z.boolean().default(false),
  preferred_contact_method: z.enum(['email', 'phone', 'sms']).default('email'),
  contact_time_preference: z.string().max(50).optional(),
  referrer_name: z.string().max(255).optional(),
  lead_source: z.string().max(50).default('website'),
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
  chat_conversation_id: z.string().uuid().optional()
});

const visitUpdateSchema = z.object({
  status: z.enum(['planned', 'confirmed', 'attended', 'no_show', 'cancelled', 'rescheduled']).optional(),
  attended_date: z.string().date().optional(),
  satisfaction_rating: z.number().int().min(1).max(5).optional(),
  feedback: z.string().max(2000).optional(),
  interested_in_membership: z.boolean().optional(),
  interested_in_ministries: z.array(z.string()).optional(),
  follow_up_notes: z.string().max(2000).optional(),
  next_contact_date: z.string().date().optional()
});

const availabilityQuerySchema = z.object({
  start_date: z.string().date(),
  end_date: z.string().date().optional(),
  service_type: z.string().optional(),
  visitor_friendly_only: z.boolean().default(true)
});

// =============================================================================
// VISIT PLANNING SERVICE CLASS
// =============================================================================

export class VisitPlanningService {
  private supabase: ReturnType<typeof createClient>;
  
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // Get available service times
  async getAvailableServices(query: z.infer<typeof availabilityQuerySchema>) {
    const validated = availabilityQuerySchema.parse(query);
    
    let supabaseQuery = this.supabase
      .from('service_times')
      .select('*')
      .eq('is_active', true)
      .order('day_of_week')
      .order('start_time');

    if (validated.visitor_friendly_only) {
      supabaseQuery = supabaseQuery.eq('is_visitor_friendly', true);
    }

    if (validated.service_type) {
      supabaseQuery = supabaseQuery.eq('service_type', validated.service_type);
    }

    const { data: services, error } = await supabaseQuery;
    
    if (error) throw error;

    // Calculate next occurrence dates for each service
    const startDate = new Date(validated.start_date);
    const endDate = validated.end_date ? new Date(validated.end_date) : addDays(startDate, 90);
    
    const servicesWithDates = services.map(service => {
      const nextOccurrences = this.getNextServiceOccurrences(service, startDate, endDate);
      return {
        ...service,
        next_occurrences: nextOccurrences
      };
    });

    // Get current capacity for each service date
    const servicesWithCapacity = await Promise.all(
      servicesWithDates.map(async (service) => {
        const occurrencesWithCapacity = await Promise.all(
          service.next_occurrences.map(async (occurrence) => {
            const { count } = await this.supabase
              .from('visit_plans')
              .select('party_size', { count: 'exact' })
              .eq('service_time_id', service.id)
              .eq('planned_date', occurrence.date)
              .in('status', ['planned', 'confirmed']);

            const bookedCapacity = count || 0;
            
            return {
              ...occurrence,
              available_spots: Math.max(0, service.capacity - bookedCapacity),
              is_full: bookedCapacity >= service.capacity
            };
          })
        );

        return {
          ...service,
          next_occurrences: occurrencesWithCapacity
        };
      })
    );

    return servicesWithCapacity;
  }

  // Create a new visit plan
  async createVisitPlan(data: z.infer<typeof visitPlanSchema>, metadata?: any) {
    const validated = visitPlanSchema.parse(data);
    
    // Validate service exists and is available
    const { data: service, error: serviceError } = await this.supabase
      .from('service_times')
      .select('*')
      .eq('id', validated.service_time_id)
      .eq('is_active', true)
      .single();

    if (serviceError || !service) {
      throw new Error('Service time not found or inactive');
    }

    // Check capacity
    const { count: currentBookings } = await this.supabase
      .from('visit_plans')
      .select('party_size', { count: 'exact' })
      .eq('service_time_id', validated.service_time_id)
      .eq('planned_date', validated.planned_date)
      .in('status', ['planned', 'confirmed']);

    if ((currentBookings || 0) + validated.party_size > service.capacity) {
      throw new Error('Service is at capacity for the selected date');
    }

    // Check registration deadline
    if (service.requires_registration && service.registration_deadline_hours > 0) {
      const plannedDateTime = new Date(`${validated.planned_date}T${service.start_time}`);
      const deadlineTime = new Date(plannedDateTime.getTime() - (service.registration_deadline_hours * 60 * 60 * 1000));
      
      if (new Date() > deadlineTime) {
        throw new Error(`Registration deadline has passed. Please register at least ${service.registration_deadline_hours} hours in advance.`);
      }
    }

    // Create visit plan
    const { data: visitPlan, error } = await this.supabase
      .from('visit_plans')
      .insert({
        ...validated,
        user_agent: metadata?.userAgent,
        ip_address: metadata?.ipAddress
      })
      .select()
      .single();

    if (error) throw error;

    // Send confirmation email
    await this.sendVisitConfirmation(visitPlan.id);

    // Schedule reminders
    await this.scheduleVisitReminders(visitPlan.id);

    return visitPlan;
  }

  // Get visit plan details
  async getVisitPlan(id: string) {
    const { data, error } = await this.supabase
      .from('visit_plans')
      .select(`
        *,
        service_times (
          name,
          day_of_week,
          start_time,
          end_time,
          location,
          special_notes
        ),
        visit_confirmation_tokens (
          token,
          expires_at,
          used_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Update visit plan status
  async updateVisitStatus(id: string, updates: z.infer<typeof visitUpdateSchema>) {
    const validated = visitUpdateSchema.parse(updates);
    
    const { data, error } = await this.supabase
      .from('visit_plans')
      .update(validated)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Handle status-specific actions
    if (validated.status === 'attended') {
      await this.createFirstTimeVisitorRecord(id);
      await this.scheduleFollowUp(id);
    } else if (validated.status === 'no_show') {
      await this.scheduleReEngagement(id);
    }

    return data;
  }

  // Confirm visit via token
  async confirmVisit(token: string) {
    // Find and validate token
    const { data: tokenData, error: tokenError } = await this.supabase
      .from('visit_confirmation_tokens')
      .select('*, visit_plans (*)')
      .eq('token', token)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      throw new Error('Invalid or expired confirmation token');
    }

    // Update visit status
    const { data: updatedVisit, error } = await this.supabase
      .from('visit_plans')
      .update({ status: 'confirmed' })
      .eq('id', tokenData.visit_plan_id)
      .select()
      .single();

    if (error) throw error;

    // Mark token as used
    await this.supabase
      .from('visit_confirmation_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    return updatedVisit;
  }

  // Get all visits for admin dashboard
  async getVisitsForAdmin(params: {
    page?: number;
    limit?: number;
    status?: string;
    service_id?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
  }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('visit_plans')
      .select(`
        *,
        service_times (
          name,
          start_time,
          location
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.service_id) {
      query = query.eq('service_time_id', params.service_id);
    }

    if (params.start_date) {
      query = query.gte('planned_date', params.start_date);
    }

    if (params.end_date) {
      query = query.lte('planned_date', params.end_date);
    }

    if (params.search) {
      query = query.or(`visitor_name.ilike.%${params.search}%,visitor_email.ilike.%${params.search}%`);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  }

  // Get visit analytics
  async getVisitAnalytics(startDate: string, endDate: string): Promise<VisitAnalytics> {
    // Basic visit statistics
    const { data: visits } = await this.supabase
      .from('visit_plans')
      .select('*, service_times(name)')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (!visits) return this.getEmptyAnalytics();

    const totalVisits = visits.length;
    const confirmedVisits = visits.filter(v => v.status === 'confirmed').length;
    const attendedVisits = visits.filter(v => v.status === 'attended').length;
    const noShows = visits.filter(v => v.status === 'no_show').length;
    
    const conversionRate = totalVisits > 0 ? (attendedVisits / totalVisits) * 100 : 0;
    const averagePartySize = totalVisits > 0 ? visits.reduce((sum, v) => sum + v.party_size, 0) / totalVisits : 0;

    // Popular services
    const serviceStats = visits.reduce((acc, visit) => {
      const serviceName = visit.service_times?.name || 'Unknown';
      acc[serviceName] = (acc[serviceName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const popularServices = Object.entries(serviceStats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Lead sources
    const sourceStats = visits.reduce((acc, visit) => {
      const source = visit.lead_source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const leadSources = Object.entries(sourceStats)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalVisits,
      confirmedVisits,
      attendedVisits,
      noShows,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averagePartySize: Math.round(averagePartySize * 10) / 10,
      popularServices,
      leadSources
    };
  }

  // Generate calendar integration data (iCal format)
  async generateCalendarData(visitId: string): Promise<string> {
    const visit = await this.getVisitPlan(visitId);
    const service = visit.service_times;
    
    const startDateTime = new Date(`${visit.planned_date}T${service.start_time}`);
    const endDateTime = new Date(`${visit.planned_date}T${service.end_time}`);
    
    const ical = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Church Management//Visit Planning//EN',
      'BEGIN:VEVENT',
      `UID:visit-${visitId}@church.com`,
      `DTSTART:${this.formatDateForICal(startDateTime)}`,
      `DTEND:${this.formatDateForICal(endDateTime)}`,
      `SUMMARY:${service.name} - Church Visit`,
      `DESCRIPTION:Visit planned for ${visit.visitor_name}\\nParty size: ${visit.party_size}\\nSpecial notes: ${service.special_notes || 'None'}`,
      `LOCATION:${service.location}`,
      `ORGANIZER:MAILTO:info@church.com`,
      `ATTENDEE:MAILTO:${visit.visitor_email}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Church visit in 1 hour',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    return ical;
  }

  // Private helper methods
  private getNextServiceOccurrences(service: ServiceTime, startDate: Date, endDate: Date) {
    const occurrences = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      if (currentDate.getDay() === service.day_of_week) {
        occurrences.push({
          date: format(currentDate, 'yyyy-MM-dd'),
          datetime: `${format(currentDate, 'yyyy-MM-dd')}T${service.start_time}`
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return occurrences.slice(0, 12); // Limit to next 12 occurrences
  }

  private async sendVisitConfirmation(visitId: string) {
    // Implementation for sending confirmation email
    // This would integrate with your email service (SendGrid, etc.)
    console.log(`Sending confirmation for visit ${visitId}`);
  }

  private async scheduleVisitReminders(visitId: string) {
    // Implementation for scheduling automated reminders
    console.log(`Scheduling reminders for visit ${visitId}`);
  }

  private async createFirstTimeVisitorRecord(visitId: string) {
    const visit = await this.getVisitPlan(visitId);
    
    await this.supabase
      .from('first_time_visitors')
      .insert({
        visit_plan_id: visitId,
        visitor_name: visit.visitor_name,
        visitor_email: visit.visitor_email,
        visitor_phone: visit.visitor_phone,
        first_visit_date: visit.attended_date || visit.planned_date,
        service_attended: visit.service_times.name
      });
  }

  private async scheduleFollowUp(visitId: string) {
    // Schedule post-visit follow-up
    console.log(`Scheduling follow-up for visit ${visitId}`);
  }

  private async scheduleReEngagement(visitId: string) {
    // Schedule re-engagement for no-shows
    console.log(`Scheduling re-engagement for visit ${visitId}`);
  }

  private formatDateForICal(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  private getEmptyAnalytics(): VisitAnalytics {
    return {
      totalVisits: 0,
      confirmedVisits: 0,
      attendedVisits: 0,
      noShows: 0,
      conversionRate: 0,
      averagePartySize: 0,
      popularServices: [],
      leadSources: []
    };
  }
}

// =============================================================================
// API ROUTE HANDLERS
// =============================================================================

// GET /api/visits/services - Get available service times
export const getAvailableServices = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const visitService = new VisitPlanningService(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const query = availabilityQuerySchema.parse(req.query);
    const services = await visitService.getAvailableServices(query);

    res.status(200).json({
      success: true,
      data: services
    });
  } catch (error: any) {
    console.error('Get services error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to fetch available services'
    });
  }
};

// POST /api/visits/plan - Create new visit plan
export const createVisitPlan = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const visitService = new VisitPlanningService(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const metadata = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    };

    const visitPlan = await visitService.createVisitPlan(req.body, metadata);

    res.status(201).json({
      success: true,
      data: visitPlan,
      message: 'Visit planned successfully! Please check your email for confirmation.'
    });
  } catch (error: any) {
    console.error('Create visit plan error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create visit plan'
    });
  }
};

// GET /api/visits/:id - Get visit details
export const getVisitDetails = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Visit ID is required'
      });
    }

    const visitService = new VisitPlanningService(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const visit = await visitService.getVisitPlan(id);

    res.status(200).json({
      success: true,
      data: visit
    });
  } catch (error: any) {
    console.error('Get visit details error:', error);
    res.status(404).json({
      success: false,
      error: error.message || 'Visit not found'
    });
  }
};

// PUT /api/visits/:id/status - Update visit status
export const updateVisitStatus = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Visit ID is required'
      });
    }

    const visitService = new VisitPlanningService(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const updatedVisit = await visitService.updateVisitStatus(id, req.body);

    res.status(200).json({
      success: true,
      data: updatedVisit,
      message: 'Visit status updated successfully'
    });
  } catch (error: any) {
    console.error('Update visit status error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update visit status'
    });
  }
};

// GET /api/admin/visits - Get all visits for church admin
export const getAdminVisits = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Add authentication/authorization middleware here
    
    const visitService = new VisitPlanningService(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const params = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 25,
      status: req.query.status as string,
      service_id: req.query.service_id as string,
      start_date: req.query.start_date as string,
      end_date: req.query.end_date as string,
      search: req.query.search as string
    };

    const result = await visitService.getVisitsForAdmin(params);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Get admin visits error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch visits'
    });
  }
};

// GET /api/visits/confirm/:token - Confirm visit via email token
export const confirmVisitByToken = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Confirmation token is required'
      });
    }

    const visitService = new VisitPlanningService(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const confirmedVisit = await visitService.confirmVisit(token);

    res.status(200).json({
      success: true,
      data: confirmedVisit,
      message: 'Visit confirmed successfully!'
    });
  } catch (error: any) {
    console.error('Confirm visit error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to confirm visit'
    });
  }
};

// GET /api/visits/:id/calendar - Generate calendar file
export const generateVisitCalendar = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Visit ID is required'
      });
    }

    const visitService = new VisitPlanningService(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const icalData = await visitService.generateCalendarData(id);

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="church-visit-${id}.ics"`);
    res.status(200).send(icalData);
  } catch (error: any) {
    console.error('Generate calendar error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate calendar file'
    });
  }
};

// GET /api/admin/visits/analytics - Get visit analytics
export const getVisitAnalytics = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const startDate = req.query.start_date as string || format(addDays(new Date(), -30), 'yyyy-MM-dd');
    const endDate = req.query.end_date as string || format(new Date(), 'yyyy-MM-dd');

    const visitService = new VisitPlanningService(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const analytics = await visitService.getVisitAnalytics(startDate, endDate);

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch analytics'
    });
  }
};

export default VisitPlanningService;