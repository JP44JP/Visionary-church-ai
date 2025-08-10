'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAnalyticsTracking } from '../hooks/useAnalyticsTracking';

interface AnalyticsContextType {
  trackEvent: ReturnType<typeof useAnalyticsTracking>['trackEvent'];
  trackPageView: ReturnType<typeof useAnalyticsTracking>['trackPageView'];
  trackChatStart: ReturnType<typeof useAnalyticsTracking>['trackChatStart'];
  trackVisitScheduled: ReturnType<typeof useAnalyticsTracking>['trackVisitScheduled'];
  trackPrayerRequest: ReturnType<typeof useAnalyticsTracking>['trackPrayerRequest'];
  trackEventRegistration: ReturnType<typeof useAnalyticsTracking>['trackEventRegistration'];
  trackFormSubmission: ReturnType<typeof useAnalyticsTracking>['trackFormSubmission'];
  trackSearch: ReturnType<typeof useAnalyticsTracking>['trackSearch'];
  trackDownload: ReturnType<typeof useAnalyticsTracking>['trackDownload'];
  trackVideoPlay: ReturnType<typeof useAnalyticsTracking>['trackVideoPlay'];
  trackNewsletterSignup: ReturnType<typeof useAnalyticsTracking>['trackNewsletterSignup'];
  trackSocialShare: ReturnType<typeof useAnalyticsTracking>['trackSocialShare'];
  sessionId: string | undefined;
  visitorId: string | undefined;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: ReactNode;
  churchId?: string;
  userId?: string;
  enabled?: boolean;
}

export function AnalyticsProvider({ 
  children, 
  churchId, 
  userId, 
  enabled = true 
}: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const analytics = useAnalyticsTracking({
    churchId: enabled ? churchId : undefined,
    userId,
  });

  // Track page views automatically
  useEffect(() => {
    if (!enabled || !churchId) return;
    
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    analytics.trackPageView(url, document.title);
  }, [pathname, searchParams, analytics, enabled, churchId]);

  // Track UTM parameters and referrer information
  useEffect(() => {
    if (!enabled || !churchId) return;

    const params = new URLSearchParams(searchParams.toString());
    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');
    
    if (utmSource || utmMedium || utmCampaign) {
      analytics.trackEvent({
        event_name: 'campaign_visit',
        event_category: 'acquisition',
        event_action: 'utm_tracking',
        event_label: utmCampaign || 'unknown',
        custom_dimension_1: utmSource || 'unknown',
        custom_dimension_2: utmMedium || 'unknown',
        custom_dimension_3: utmCampaign || 'unknown',
      });
    }
  }, [searchParams, analytics, enabled, churchId]);

  // Track scroll depth
  useEffect(() => {
    if (!enabled || !churchId) return;

    let maxScrollDepth = 0;
    let scrollTimer: NodeJS.Timeout;

    const trackScrollDepth = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      if (scrollPercent > maxScrollDepth && scrollPercent > 0) {
        maxScrollDepth = scrollPercent;
        
        // Track milestone scroll depths
        const milestones = [25, 50, 75, 90, 100];
        const milestone = milestones.find(m => scrollPercent >= m && maxScrollDepth >= m);
        
        if (milestone) {
          analytics.trackEvent({
            event_name: 'scroll_depth',
            event_category: 'engagement',
            event_action: 'scroll',
            event_label: `${milestone}%`,
            event_value: milestone,
          });
        }
      }
    };

    const handleScroll = () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(trackScrollDepth, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, [analytics, enabled, churchId]);

  // Track time on page
  useEffect(() => {
    if (!enabled || !churchId) return;

    const startTime = Date.now();

    return () => {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      if (timeOnPage > 5) { // Only track if user spent more than 5 seconds
        analytics.trackEvent({
          event_name: 'time_on_page',
          event_category: 'engagement',
          event_action: 'page_timing',
          event_value: timeOnPage,
          custom_dimension_1: pathname,
        });
      }
    };
  }, [pathname, analytics, enabled, churchId]);

  // Track form interactions
  useEffect(() => {
    if (!enabled || !churchId) return;

    const trackFormInteraction = (event: Event) => {
      const form = event.target as HTMLFormElement;
      const formId = form.id || form.className || 'unknown';
      
      analytics.trackEvent({
        event_name: 'form_interaction',
        event_category: 'engagement',
        event_action: event.type,
        event_label: formId,
        custom_dimension_1: formId,
      });
    };

    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('focus', trackFormInteraction, true);
      form.addEventListener('submit', trackFormInteraction);
    });

    return () => {
      forms.forEach(form => {
        form.removeEventListener('focus', trackFormInteraction, true);
        form.removeEventListener('submit', trackFormInteraction);
      });
    };
  }, [analytics, enabled, churchId]);

  // Track external link clicks
  useEffect(() => {
    if (!enabled || !churchId) return;

    const trackExternalClick = (event: Event) => {
      const link = event.target as HTMLAnchorElement;
      const href = link.href;
      
      if (href && !href.startsWith(window.location.origin)) {
        analytics.trackEvent({
          event_name: 'external_link_click',
          event_category: 'engagement',
          event_action: 'click',
          event_label: href,
          custom_dimension_1: href,
        });
      }
    };

    const links = document.querySelectorAll('a[href^="http"]');
    links.forEach(link => {
      link.addEventListener('click', trackExternalClick);
    });

    // Use MutationObserver to track dynamically added links
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const links = element.querySelectorAll('a[href^="http"]');
            links.forEach(link => {
              link.addEventListener('click', trackExternalClick);
            });
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      links.forEach(link => {
        link.removeEventListener('click', trackExternalClick);
      });
      observer.disconnect();
    };
  }, [analytics, enabled, churchId]);

  // Track file downloads
  useEffect(() => {
    if (!enabled || !churchId) return;

    const trackDownloadClick = (event: Event) => {
      const link = event.target as HTMLAnchorElement;
      const href = link.href;
      
      const downloadExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.mp3', '.mp4', '.mov'];
      const isDownload = downloadExtensions.some(ext => href.toLowerCase().includes(ext));
      
      if (isDownload) {
        const fileName = href.split('/').pop() || 'unknown';
        const fileType = fileName.split('.').pop() || 'unknown';
        analytics.trackDownload(fileName, fileType);
      }
    };

    document.addEventListener('click', trackDownloadClick);
    return () => document.removeEventListener('click', trackDownloadClick);
  }, [analytics, enabled, churchId]);

  // Track video interactions
  useEffect(() => {
    if (!enabled || !churchId) return;

    const trackVideoEvent = (event: Event) => {
      const video = event.target as HTMLVideoElement;
      const videoSrc = video.src || video.currentSrc || 'unknown';
      const videoTitle = video.title || video.getAttribute('data-title') || videoSrc.split('/').pop() || 'unknown';
      
      switch (event.type) {
        case 'play':
          analytics.trackVideoPlay(videoTitle, video.duration);
          break;
        case 'ended':
          analytics.trackEvent({
            event_name: 'video_complete',
            event_category: 'engagement',
            event_action: 'video_completed',
            event_label: videoTitle,
            custom_dimension_1: videoTitle,
          });
          break;
      }
    };

    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      video.addEventListener('play', trackVideoEvent);
      video.addEventListener('ended', trackVideoEvent);
    });

    return () => {
      videos.forEach(video => {
        video.removeEventListener('play', trackVideoEvent);
        video.removeEventListener('ended', trackVideoEvent);
      });
    };
  }, [analytics, enabled, churchId]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

// Hook for conditional analytics (when provider might not be available)
export function useAnalyticsOptional() {
  return useContext(AnalyticsContext);
}