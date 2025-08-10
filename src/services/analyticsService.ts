import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { 
  AnalyticsEvent, 
  AnalyticsSession, 
  DashboardMetrics, 
  VisitorJourneyStage,
  CommunicationAnalytics,
  ChatAnalytics,
  EventAnalytics,
  GrowthAnalytics,
  AnalyticsGoal,
  GoalCompletion,
  AnalyticsPeriod,
  AnalyticsFilter,
  ExportFormat
} from '../types/analytics';

export class AnalyticsService {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  // =============================================================================
  // EVENT TRACKING
  // =============================================================================

  async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('analytics_events')
        .insert(event);

      if (error) {
        console.error('Error tracking analytics event:', error);
        throw error;
      }
    } catch (error) {
      console.error('Analytics tracking failed:', error);
      // Don't throw error to prevent breaking user experience
    }
  }

  async trackPageView(data: {
    church_id: string;
    session_id: string;
    user_id?: string;
    page_url: string;
    page_title?: string;
    page_type?: string;
    referrer_url?: string;
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('analytics_page_views')
        .insert(data);

      if (error) throw error;
    } catch (error) {
      console.error('Page view tracking failed:', error);
    }
  }

  async trackSession(session: Omit<AnalyticsSession, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('analytics_sessions')
        .insert(session)
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Session tracking failed:', error);
      throw error;
    }
  }

  async updateSession(sessionId: string, updates: Partial<AnalyticsSession>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('analytics_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Session update failed:', error);
    }
  }

  async trackVisitorJourney(stage: Omit<VisitorJourneyStage, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('visitor_journey_stages')
        .insert(stage);

      if (error) throw error;
    } catch (error) {
      console.error('Visitor journey tracking failed:', error);
    }
  }

  // =============================================================================
  // DASHBOARD METRICS
  // =============================================================================

  async getDashboardMetrics(
    churchId: string, 
    period: AnalyticsPeriod = '30d',
    filters?: AnalyticsFilter
  ): Promise<DashboardMetrics> {
    try {
      // Check cache first
      const cached = await this.getCachedMetrics(churchId, 'dashboard_summary', period);
      if (cached && !this.isCacheExpired(cached.generated_at, period)) {
        return cached.cache_data as DashboardMetrics;
      }

      const { startDate, endDate } = this.getPeriodDates(period);
      
      // High-level KPIs
      const kpis = await this.getKPIs(churchId, startDate, endDate, filters);
      
      // Visitor journey funnel
      const funnel = await this.getVisitorFunnel(churchId, startDate, endDate, filters);
      
      // Communication performance
      const communications = await this.getCommunicationMetrics(churchId, startDate, endDate, filters);
      
      // Event performance
      const events = await this.getEventMetrics(churchId, startDate, endDate, filters);
      
      // Growth trends
      const growth = await this.getGrowthTrends(churchId, startDate, endDate, filters);
      
      // Chat performance
      const chat = await this.getChatMetrics(churchId, startDate, endDate, filters);

      const metrics: DashboardMetrics = {
        kpis,
        funnel,
        communications,
        events,
        growth,
        chat,
        period,
        generated_at: new Date().toISOString(),
        filters
      };

      // Cache the results
      await this.cacheMetrics(churchId, 'dashboard_summary', metrics, period);

      return metrics;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  private async getKPIs(
    churchId: string, 
    startDate: string, 
    endDate: string, 
    filters?: AnalyticsFilter
  ) {
    let query = this.supabase
      .from('analytics_events')
      .select('*')
      .eq('church_id', churchId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (filters?.source) {
      query = query.eq('custom_dimension_1', filters.source);
    }

    const { data: events, error } = await query;
    if (error) throw error;

    const totalVisitors = new Set(events?.map(e => e.visitor_id).filter(Boolean)).size;
    const chatSessions = events?.filter(e => e.event_action === 'chat_started').length || 0;
    const visitConversions = events?.filter(e => e.event_action === 'visit_scheduled').length || 0;
    const memberConversions = events?.filter(e => e.event_action === 'member_joined').length || 0;
    
    // Get previous period for comparison
    const { startDate: prevStart, endDate: prevEnd } = this.getPreviousPeriod(startDate, endDate);
    const { data: prevEvents } = await this.supabase
      .from('analytics_events')
      .select('*')
      .eq('church_id', churchId)
      .gte('created_at', prevStart)
      .lte('created_at', prevEnd);

    const prevTotalVisitors = new Set(prevEvents?.map(e => e.visitor_id).filter(Boolean)).size;
    const prevChatSessions = prevEvents?.filter(e => e.event_action === 'chat_started').length || 0;
    
    return {
      total_visitors: totalVisitors,
      chat_sessions: chatSessions,
      visit_conversions: visitConversions,
      member_conversions: memberConversions,
      chat_to_visit_rate: chatSessions > 0 ? (visitConversions / chatSessions * 100) : 0,
      visit_to_member_rate: visitConversions > 0 ? (memberConversions / visitConversions * 100) : 0,
      visitor_growth: prevTotalVisitors > 0 ? 
        ((totalVisitors - prevTotalVisitors) / prevTotalVisitors * 100) : 0,
      chat_growth: prevChatSessions > 0 ? 
        ((chatSessions - prevChatSessions) / prevChatSessions * 100) : 0
    };
  }

  private async getVisitorFunnel(
    churchId: string, 
    startDate: string, 
    endDate: string, 
    filters?: AnalyticsFilter
  ) {
    const { data, error } = await this.supabase
      .from('visitor_journey_stages')
      .select('stage, stage_action')
      .eq('church_id', churchId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;

    const funnel = data?.reduce((acc: Record<string, number>, item) => {
      acc[item.stage] = (acc[item.stage] || 0) + 1;
      return acc;
    }, {}) || {};

    return {
      awareness: funnel.awareness || 0,
      interest: funnel.interest || 0,
      consideration: funnel.consideration || 0,
      conversion: funnel.conversion || 0,
      retention: funnel.retention || 0,
      advocacy: funnel.advocacy || 0,
      drop_off_rates: this.calculateDropOffRates(funnel)
    };
  }

  private async getCommunicationMetrics(
    churchId: string, 
    startDate: string, 
    endDate: string, 
    filters?: AnalyticsFilter
  ) {
    const { data, error } = await this.supabase
      .from('communication_analytics')
      .select('*')
      .eq('church_id', churchId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;

    const byType = data?.reduce((acc: Record<string, any>, comm) => {
      const type = comm.communication_type;
      if (!acc[type]) {
        acc[type] = {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          unsubscribed: 0
        };
      }
      
      acc[type].sent += 1;
      if (comm.delivered_at) acc[type].delivered += 1;
      if (comm.opened_at) acc[type].opened += 1;
      if (comm.clicked_at) acc[type].clicked += 1;
      if (comm.bounced_at) acc[type].bounced += 1;
      if (comm.unsubscribed_at) acc[type].unsubscribed += 1;
      
      return acc;
    }, {}) || {};

    // Calculate rates
    Object.keys(byType).forEach(type => {
      const metrics = byType[type];
      metrics.delivery_rate = metrics.sent > 0 ? (metrics.delivered / metrics.sent * 100) : 0;
      metrics.open_rate = metrics.delivered > 0 ? (metrics.opened / metrics.delivered * 100) : 0;
      metrics.click_rate = metrics.opened > 0 ? (metrics.clicked / metrics.opened * 100) : 0;
      metrics.bounce_rate = metrics.sent > 0 ? (metrics.bounced / metrics.sent * 100) : 0;
      metrics.unsubscribe_rate = metrics.sent > 0 ? (metrics.unsubscribed / metrics.sent * 100) : 0;
    });

    return byType;
  }

  private async getEventMetrics(
    churchId: string, 
    startDate: string, 
    endDate: string, 
    filters?: AnalyticsFilter
  ) {
    const { data, error } = await this.supabase
      .from('event_analytics')
      .select(`
        *,
        events (
          title,
          event_type,
          start_date
        )
      `)
      .eq('church_id', churchId)
      .gte('last_calculated', startDate)
      .lte('last_calculated', endDate);

    if (error) throw error;

    return {
      total_events: data?.length || 0,
      total_registrations: data?.reduce((sum, e) => sum + (e.total_registrations || 0), 0) || 0,
      total_attendance: data?.reduce((sum, e) => sum + (e.total_attendance || 0), 0) || 0,
      avg_attendance_rate: data && data.length > 0 ? 
        data.reduce((sum, e) => sum + (e.check_in_rate || 0), 0) / data.length : 0,
      popular_event_types: this.getPopularEventTypes(data || []),
      upcoming_events: await this.getUpcomingEvents(churchId)
    };
  }

  private async getChatMetrics(
    churchId: string, 
    startDate: string, 
    endDate: string, 
    filters?: AnalyticsFilter
  ) {
    const { data, error } = await this.supabase
      .from('chat_analytics')
      .select('*')
      .eq('church_id', churchId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;

    const totalSessions = data?.length || 0;
    const avgSatisfaction = totalSessions > 0 ? 
      data?.reduce((sum, c) => sum + (c.satisfaction_rating || 0), 0)! / totalSessions : 0;
    const avgResponseTime = totalSessions > 0 ?
      data?.reduce((sum, c) => sum + (c.avg_response_time || 0), 0)! / totalSessions : 0;
    const conversionRate = totalSessions > 0 ?
      (data?.filter(c => c.conversion_occurred).length || 0) / totalSessions * 100 : 0;

    return {
      total_sessions: totalSessions,
      avg_satisfaction: avgSatisfaction,
      avg_response_time: avgResponseTime,
      conversion_rate: conversionRate,
      escalation_rate: totalSessions > 0 ?
        (data?.filter(c => c.escalated_to_human).length || 0) / totalSessions * 100 : 0,
      common_intents: this.getCommonIntents(data || [])
    };
  }

  private async getGrowthTrends(
    churchId: string, 
    startDate: string, 
    endDate: string, 
    filters?: AnalyticsFilter
  ) {
    const { data, error } = await this.supabase
      .from('growth_analytics')
      .select('*')
      .eq('church_id', churchId)
      .gte('metric_date', startDate)
      .lte('metric_date', endDate)
      .order('metric_date');

    if (error) throw error;

    return {
      daily_trends: data || [],
      total_growth: this.calculateGrowthRate(data || []),
      retention_trend: data?.map(d => ({ date: d.metric_date, value: d.retention_rate })) || [],
      conversion_trend: data?.map(d => ({ 
        date: d.metric_date, 
        value: d.visit_scheduled > 0 ? (d.visits_completed / d.visit_scheduled * 100) : 0 
      })) || []
    };
  }

  // =============================================================================
  // REAL-TIME ANALYTICS
  // =============================================================================

  async getRealTimeMetrics(churchId: string) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

    const [activeVisitors, recentEvents, liveChats] = await Promise.all([
      this.getActiveVisitors(churchId, hourAgo),
      this.getRecentEvents(churchId, today),
      this.getLiveChats(churchId)
    ]);

    return {
      active_visitors: activeVisitors,
      recent_events: recentEvents,
      live_chats: liveChats,
      timestamp: now.toISOString()
    };
  }

  private async getActiveVisitors(churchId: string, since: string) {
    const { data, error } = await this.supabase
      .from('analytics_sessions')
      .select('session_id')
      .eq('church_id', churchId)
      .gte('session_start', since)
      .is('session_end', null);

    if (error) throw error;
    return data?.length || 0;
  }

  private async getRecentEvents(churchId: string, today: string) {
    const { data, error } = await this.supabase
      .from('analytics_events')
      .select('event_action, created_at')
      .eq('church_id', churchId)
      .gte('created_at', today)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  }

  private async getLiveChats(churchId: string) {
    const { data, error } = await this.supabase
      .from('chat_sessions')
      .select('id, created_at')
      .eq('church_id', churchId)
      .eq('status', 'active');

    if (error) throw error;
    return data?.length || 0;
  }

  // =============================================================================
  // GOAL TRACKING
  // =============================================================================

  async createGoal(goal: Omit<AnalyticsGoal, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const { data, error } = await this.supabase
      .from('analytics_goals')
      .insert(goal)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  async trackGoalCompletion(completion: Omit<GoalCompletion, 'id' | 'created_at'>): Promise<void> {
    const { error } = await this.supabase
      .from('goal_completions')
      .insert(completion);

    if (error) throw error;
  }

  async getGoalCompletions(
    churchId: string, 
    goalId?: string, 
    period?: AnalyticsPeriod
  ): Promise<GoalCompletion[]> {
    let query = this.supabase
      .from('goal_completions')
      .select('*')
      .eq('church_id', churchId);

    if (goalId) {
      query = query.eq('goal_id', goalId);
    }

    if (period) {
      const { startDate } = this.getPeriodDates(period);
      query = query.gte('created_at', startDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  // =============================================================================
  // REPORT GENERATION
  // =============================================================================

  async generateReport(
    churchId: string,
    reportType: 'summary' | 'detailed' | 'custom',
    period: AnalyticsPeriod,
    filters?: AnalyticsFilter,
    format: ExportFormat = 'json'
  ): Promise<any> {
    const metrics = await this.getDashboardMetrics(churchId, period, filters);
    
    switch (reportType) {
      case 'summary':
        return this.generateSummaryReport(metrics, format);
      case 'detailed':
        return this.generateDetailedReport(churchId, period, filters, format);
      case 'custom':
        return this.generateCustomReport(churchId, period, filters, format);
      default:
        throw new Error('Invalid report type');
    }
  }

  private async generateSummaryReport(metrics: DashboardMetrics, format: ExportFormat) {
    const report = {
      title: 'Analytics Summary Report',
      generated_at: new Date().toISOString(),
      period: metrics.period,
      summary: {
        kpis: metrics.kpis,
        funnel_overview: metrics.funnel,
        communication_summary: Object.entries(metrics.communications).map(([type, data]) => ({
          type,
          sent: (data as any).sent,
          open_rate: (data as any).open_rate,
          click_rate: (data as any).click_rate
        }))
      }
    };

    switch (format) {
      case 'pdf':
        return this.exportToPDF(report);
      case 'excel':
        return this.exportToExcel(report);
      default:
        return report;
    }
  }

  private async generateDetailedReport(
    churchId: string,
    period: AnalyticsPeriod,
    filters?: AnalyticsFilter,
    format: ExportFormat = 'json'
  ) {
    // Implement detailed report generation
    // This would include more granular data and charts
    const metrics = await this.getDashboardMetrics(churchId, period, filters);
    
    const detailedData = {
      overview: metrics,
      visitor_details: await this.getVisitorDetails(churchId, period),
      communication_details: await this.getCommunicationDetails(churchId, period),
      event_details: await this.getEventDetails(churchId, period),
      prayer_details: await this.getPrayerDetails(churchId, period)
    };

    return format === 'json' ? detailedData : this.formatReport(detailedData, format);
  }

  // =============================================================================
  // CACHE MANAGEMENT
  // =============================================================================

  private async getCachedMetrics(churchId: string, cacheKey: string, period: AnalyticsPeriod) {
    const { data, error } = await this.supabase
      .from('analytics_dashboard_cache')
      .select('*')
      .eq('church_id', churchId)
      .eq('cache_key', `${cacheKey}_${period}`)
      .single();

    if (error || !data) return null;
    return data;
  }

  private async cacheMetrics(
    churchId: string, 
    cacheKey: string, 
    data: any, 
    period: AnalyticsPeriod,
    expiryMinutes: number = 15
  ) {
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    
    const { error } = await this.supabase
      .from('analytics_dashboard_cache')
      .upsert({
        church_id: churchId,
        cache_key: `${cacheKey}_${period}`,
        cache_data: data,
        expires_at: expiresAt.toISOString(),
        generated_at: new Date().toISOString()
      });

    if (error) console.error('Cache storage failed:', error);
  }

  private isCacheExpired(generatedAt: string, period: AnalyticsPeriod): boolean {
    const cacheAge = Date.now() - new Date(generatedAt).getTime();
    const maxAge = period === '1d' ? 5 * 60 * 1000 : // 5 minutes for daily
                   period === '7d' ? 15 * 60 * 1000 : // 15 minutes for weekly
                   30 * 60 * 1000; // 30 minutes for monthly+
    
    return cacheAge > maxAge;
  }

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  private getPeriodDates(period: AnalyticsPeriod) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString()
    };
  }

  private getPreviousPeriod(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = end.getTime() - start.getTime();

    return {
      startDate: new Date(start.getTime() - duration).toISOString(),
      endDate: start.toISOString()
    };
  }

  private calculateDropOffRates(funnel: Record<string, number>) {
    const stages = ['awareness', 'interest', 'consideration', 'conversion'];
    const dropOff: Record<string, number> = {};

    for (let i = 0; i < stages.length - 1; i++) {
      const current = funnel[stages[i]] || 0;
      const next = funnel[stages[i + 1]] || 0;
      dropOff[`${stages[i]}_to_${stages[i + 1]}`] = 
        current > 0 ? ((current - next) / current * 100) : 0;
    }

    return dropOff;
  }

  private calculateGrowthRate(data: any[]) {
    if (data.length < 2) return 0;
    
    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    
    const latestTotal = latest.new_visitors + latest.returning_visitors;
    const previousTotal = previous.new_visitors + previous.returning_visitors;
    
    return previousTotal > 0 ? 
      ((latestTotal - previousTotal) / previousTotal * 100) : 0;
  }

  private getPopularEventTypes(eventData: any[]) {
    const typeCounts = eventData.reduce((acc, event) => {
      const type = event.events?.event_type || 'unknown';
      acc[type] = (acc[type] || 0) + (event.total_attendance || 0);
      return acc;
    }, {});

    return Object.entries(typeCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }

  private getCommonIntents(chatData: any[]) {
    const intentCounts: Record<string, number> = {};
    
    chatData.forEach(chat => {
      if (chat.detected_intents) {
        chat.detected_intents.forEach((intent: string) => {
          intentCounts[intent] = (intentCounts[intent] || 0) + 1;
        });
      }
    });

    return Object.entries(intentCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([intent, count]) => ({ intent, count }));
  }

  private async getUpcomingEvents(churchId: string) {
    const { data, error } = await this.supabase
      .from('events')
      .select('id, title, start_date, event_type')
      .eq('church_id', churchId)
      .eq('status', 'published')
      .gte('start_date', new Date().toISOString().split('T')[0])
      .order('start_date')
      .limit(5);

    if (error) throw error;
    return data || [];
  }

  private async getVisitorDetails(churchId: string, period: AnalyticsPeriod) {
    // Implementation for detailed visitor analytics
    return {};
  }

  private async getCommunicationDetails(churchId: string, period: AnalyticsPeriod) {
    // Implementation for detailed communication analytics
    return {};
  }

  private async getEventDetails(churchId: string, period: AnalyticsPeriod) {
    // Implementation for detailed event analytics
    return {};
  }

  private async getPrayerDetails(churchId: string, period: AnalyticsPeriod) {
    // Implementation for detailed prayer analytics
    return {};
  }

  private formatReport(data: any, format: ExportFormat) {
    switch (format) {
      case 'pdf':
        return this.exportToPDF(data);
      case 'excel':
        return this.exportToExcel(data);
      default:
        return data;
    }
  }

  private exportToPDF(data: any) {
    // Implementation for PDF export
    // Would use jsPDF or similar library
    throw new Error('PDF export not yet implemented');
  }

  private exportToExcel(data: any) {
    // Implementation for Excel export
    // Would use xlsx or similar library
    throw new Error('Excel export not yet implemented');
  }
}