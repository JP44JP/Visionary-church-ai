'use client';

import { useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface AnalyticsEvent {
  event_name: string;
  event_category: string;
  event_action: string;
  event_label?: string;
  event_value?: number;
  custom_dimension_1?: string;
  custom_dimension_2?: string;
  custom_dimension_3?: string;
  custom_dimension_4?: string;
  custom_dimension_5?: string;
}

interface TrackingOptions {
  churchId?: string;
  userId?: string;
  visitorId?: string;
  sessionId?: string;
}

export function useAnalyticsTracking(options: TrackingOptions = {}) {
  const sessionId = useRef<string>();
  const visitorId = useRef<string>();
  const eventQueue = useRef<AnalyticsEvent[]>([]);
  const flushTimer = useRef<NodeJS.Timeout>();

  // Initialize session and visitor IDs
  useEffect(() => {
    if (!sessionId.current) {
      sessionId.current = options.sessionId || uuidv4();
    }
    
    if (!visitorId.current) {
      // Try to get existing visitor ID from localStorage
      const stored = localStorage.getItem('vc_visitor_id');
      visitorId.current = options.visitorId || stored || uuidv4();
      
      if (!stored && !options.visitorId) {
        localStorage.setItem('vc_visitor_id', visitorId.current);
      }
    }
  }, [options.sessionId, options.visitorId]);

  // Flush event queue
  const flushEvents = useCallback(async () => {
    if (!options.churchId || eventQueue.current.length === 0) {
      return;
    }

    const eventsToSend = [...eventQueue.current];
    eventQueue.current = [];

    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-church-id': options.churchId,
        },
        body: JSON.stringify({
          events: eventsToSend.map(event => ({
            ...event,
            session_id: sessionId.current,
            user_id: options.userId,
            visitor_id: visitorId.current,
            page_url: window.location.href,
            referrer_url: document.referrer || undefined,
            user_agent: navigator.userAgent,
          }))
        }),
      });
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue events for retry
      eventQueue.current.unshift(...eventsToSend);
    }
  }, [options.churchId, options.userId]);

  // Track event
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    if (!options.churchId) {
      console.warn('Analytics tracking: churchId is required');
      return;
    }

    eventQueue.current.push(event);

    // Clear existing timer
    if (flushTimer.current) {
      clearTimeout(flushTimer.current);
    }

    // Flush events after a short delay (batch processing)
    flushTimer.current = setTimeout(flushEvents, 1000);
  }, [options.churchId, flushEvents]);

  // Convenience tracking methods
  const trackPageView = useCallback((path?: string, title?: string) => {
    trackEvent({
      event_name: 'page_view',
      event_category: 'engagement',
      event_action: 'view',
      event_label: path || window.location.pathname,
      custom_dimension_1: title || document.title,
    });
  }, [trackEvent]);

  const trackChatStart = useCallback((source?: string) => {
    trackEvent({
      event_name: 'chat_started',
      event_category: 'engagement',
      event_action: 'chat_started',
      event_label: source,
      custom_dimension_1: source,
    });
  }, [trackEvent]);

  const trackVisitScheduled = useCallback((visitType: string, source?: string) => {
    trackEvent({
      event_name: 'visit_scheduled',
      event_category: 'conversion',
      event_action: 'visit_scheduled',
      event_label: visitType,
      event_value: 1,
      custom_dimension_1: source,
      custom_dimension_2: visitType,
    });
  }, [trackEvent]);

  const trackPrayerRequest = useCallback((category: string, urgency: string) => {
    trackEvent({
      event_name: 'prayer_request',
      event_category: 'engagement',
      event_action: 'prayer_request_submitted',
      event_label: category,
      custom_dimension_1: category,
      custom_dimension_2: urgency,
    });
  }, [trackEvent]);

  const trackEventRegistration = useCallback((eventType: string, eventId: string) => {
    trackEvent({
      event_name: 'event_registration',
      event_category: 'conversion',
      event_action: 'event_registered',
      event_label: eventType,
      event_value: 1,
      custom_dimension_1: eventType,
      custom_dimension_2: eventId,
    });
  }, [trackEvent]);

  const trackFormSubmission = useCallback((formType: string, success: boolean, errorType?: string) => {
    trackEvent({
      event_name: 'form_submission',
      event_category: 'engagement',
      event_action: success ? 'form_submitted' : 'form_error',
      event_label: formType,
      event_value: success ? 1 : 0,
      custom_dimension_1: formType,
      custom_dimension_2: success ? 'success' : 'error',
      custom_dimension_3: errorType,
    });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string, resultsCount: number) => {
    trackEvent({
      event_name: 'search',
      event_category: 'engagement',
      event_action: 'search_performed',
      event_label: query,
      event_value: resultsCount,
      custom_dimension_1: query,
      custom_dimension_2: resultsCount.toString(),
    });
  }, [trackEvent]);

  const trackDownload = useCallback((fileName: string, fileType: string) => {
    trackEvent({
      event_name: 'download',
      event_category: 'engagement',
      event_action: 'file_downloaded',
      event_label: fileName,
      custom_dimension_1: fileName,
      custom_dimension_2: fileType,
    });
  }, [trackEvent]);

  const trackVideoPlay = useCallback((videoTitle: string, duration?: number) => {
    trackEvent({
      event_name: 'video_play',
      event_category: 'engagement',
      event_action: 'video_started',
      event_label: videoTitle,
      event_value: duration,
      custom_dimension_1: videoTitle,
    });
  }, [trackEvent]);

  const trackNewsletterSignup = useCallback((source?: string) => {
    trackEvent({
      event_name: 'newsletter_signup',
      event_category: 'conversion',
      event_action: 'newsletter_subscribed',
      event_value: 1,
      custom_dimension_1: source,
    });
  }, [trackEvent]);

  const trackSocialShare = useCallback((platform: string, content: string) => {
    trackEvent({
      event_name: 'social_share',
      event_category: 'engagement',
      event_action: 'content_shared',
      event_label: platform,
      custom_dimension_1: platform,
      custom_dimension_2: content,
    });
  }, [trackEvent]);

  // Track session duration on unmount
  useEffect(() => {
    const startTime = Date.now();
    
    return () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      if (duration > 5) { // Only track sessions longer than 5 seconds
        trackEvent({
          event_name: 'session_duration',
          event_category: 'engagement',
          event_action: 'session_ended',
          event_value: duration,
        });
      }
      
      // Flush remaining events
      flushEvents();
    };
  }, [trackEvent, flushEvents]);

  // Flush events on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (eventQueue.current.length > 0) {
        // Use sendBeacon for reliable event sending during page unload
        if (navigator.sendBeacon && options.churchId) {
          const eventsToSend = eventQueue.current.map(event => ({
            ...event,
            session_id: sessionId.current,
            user_id: options.userId,
            visitor_id: visitorId.current,
            page_url: window.location.href,
            referrer_url: document.referrer || undefined,
            user_agent: navigator.userAgent,
          }));

          navigator.sendBeacon(
            '/api/analytics/events',
            JSON.stringify({
              events: eventsToSend,
              churchId: options.churchId
            })
          );
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [options.churchId, options.userId]);

  return {
    trackEvent,
    trackPageView,
    trackChatStart,
    trackVisitScheduled,
    trackPrayerRequest,
    trackEventRegistration,
    trackFormSubmission,
    trackSearch,
    trackDownload,
    trackVideoPlay,
    trackNewsletterSignup,
    trackSocialShare,
    sessionId: sessionId.current,
    visitorId: visitorId.current,
  };
}