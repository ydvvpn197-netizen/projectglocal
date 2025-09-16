import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useABTesting } from './useABTesting';

interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId: string;
  page: string;
  userAgent: string;
  referrer?: string;
}

interface UserEngagementMetrics {
  sessionDuration: number;
  pageViews: number;
  interactions: number;
  taskCompletions: number;
  bounceRate: number;
  conversionRate: number;
}

interface TaskCompletion {
  taskId: string;
  taskName: string;
  completed: boolean;
  duration: number;
  steps: number;
  timestamp: string;
}

class AnalyticsService {
  private sessionId: string;
  private startTime: number;
  private events: AnalyticsEvent[] = [];
  private taskCompletions: TaskCompletion[] = [];
  private pageViews: number = 0;
  private interactions: number = 0;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  track(event: string, properties: Record<string, any> = {}) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        referrer: document.referrer || undefined
      },
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      referrer: document.referrer || undefined
    };

    this.events.push(analyticsEvent);
    
    // Track interactions
    if (this.isInteractionEvent(event)) {
      this.interactions++;
    }

    // Send to analytics service
    this.sendToAnalytics(analyticsEvent);
  }

  private isInteractionEvent(event: string): boolean {
    const interactionEvents = [
      'click', 'submit', 'navigate', 'search', 'create_post', 
      'join_community', 'book_event', 'like', 'comment', 'share'
    ];
    return interactionEvents.includes(event);
  }

  trackPageView(page: string, properties: Record<string, any> = {}) {
    this.pageViews++;
    this.track('page_view', {
      page,
      ...properties
    });
  }

  trackTaskCompletion(taskId: string, taskName: string, steps: number, duration: number) {
    const completion: TaskCompletion = {
      taskId,
      taskName,
      completed: true,
      duration,
      steps,
      timestamp: new Date().toISOString()
    };

    this.taskCompletions.push(completion);
    
    this.track('task_completed', {
      taskId,
      taskName,
      duration,
      steps
    });
  }

  trackTaskAbandonment(taskId: string, taskName: string, steps: number, duration: number) {
    const completion: TaskCompletion = {
      taskId,
      taskName,
      completed: false,
      duration,
      steps,
      timestamp: new Date().toISOString()
    };

    this.taskCompletions.push(completion);
    
    this.track('task_abandoned', {
      taskId,
      taskName,
      duration,
      steps
    });
  }

  getEngagementMetrics(): UserEngagementMetrics {
    const sessionDuration = Date.now() - this.startTime;
    const completedTasks = this.taskCompletions.filter(t => t.completed).length;
    const totalTasks = this.taskCompletions.length;
    
    return {
      sessionDuration,
      pageViews: this.pageViews,
      interactions: this.interactions,
      taskCompletions: completedTasks,
      bounceRate: this.pageViews <= 1 ? 1 : 0, // Simple bounce rate calculation
      conversionRate: totalTasks > 0 ? completedTasks / totalTasks : 0
    };
  }

  private sendToAnalytics(event: AnalyticsEvent) {
    // In production, send to your analytics service
    console.log('Analytics Event:', event);
    
    // Example integrations:
    // - Google Analytics 4
    // - Mixpanel
    // - Amplitude
    // - Custom analytics endpoint
    
    // Example for Google Analytics 4:
    // gtag('event', event.event, event.properties);
    
    // Example for Mixpanel:
    // mixpanel.track(event.event, event.properties);
  }

  // Performance tracking
  trackPerformance(metric: string, value: number, properties: Record<string, any> = {}) {
    this.track('performance_metric', {
      metric,
      value,
      ...properties
    });
  }

  // Error tracking
  trackError(error: Error, context: Record<string, any> = {}) {
    this.track('error', {
      error: error.message,
      stack: error.stack,
      ...context
    });
  }

  // User behavior tracking
  trackUserBehavior(action: string, element: string, properties: Record<string, any> = {}) {
    this.track('user_behavior', {
      action,
      element,
      ...properties
    });
  }
}

export const useAnalytics = () => {
  const { user } = useAuth();
  const { trackEvent } = useABTesting();
  const [analytics] = useState(() => new AnalyticsService());

  const track = useCallback((event: string, properties: Record<string, any> = {}) => {
    analytics.track(event, {
      ...properties,
      userId: user?.id,
      userType: user?.user_metadata?.user_type
    });
  }, [analytics, user]);

  const trackPageView = useCallback((page: string, properties: Record<string, any> = {}) => {
    analytics.trackPageView(page, {
      ...properties,
      userId: user?.id,
      userType: user?.user_metadata?.user_type
    });
  }, [analytics, user]);

  const trackTaskCompletion = useCallback((
    taskId: string, 
    taskName: string, 
    steps: number, 
    duration: number
  ) => {
    analytics.trackTaskCompletion(taskId, taskName, steps, duration);
    
    // Also track in AB testing if user is in a test
    trackEvent('task_completion', 'completed', { taskId, taskName, duration });
  }, [analytics, trackEvent]);

  const trackTaskAbandonment = useCallback((
    taskId: string, 
    taskName: string, 
    steps: number, 
    duration: number
  ) => {
    analytics.trackTaskAbandonment(taskId, taskName, steps, duration);
    
    // Also track in AB testing if user is in a test
    trackEvent('task_abandonment', 'abandoned', { taskId, taskName, duration });
  }, [analytics, trackEvent]);

  const trackPerformance = useCallback((metric: string, value: number, properties: Record<string, any> = {}) => {
    analytics.trackPerformance(metric, value, {
      ...properties,
      userId: user?.id
    });
  }, [analytics, user]);

  const trackError = useCallback((error: Error, context: Record<string, any> = {}) => {
    analytics.trackError(error, {
      ...context,
      userId: user?.id,
      page: window.location.pathname
    });
  }, [analytics, user]);

  const trackUserBehavior = useCallback((action: string, element: string, properties: Record<string, any> = {}) => {
    analytics.trackUserBehavior(action, element, {
      ...properties,
      userId: user?.id
    });
  }, [analytics, user]);

  const getEngagementMetrics = useCallback(() => {
    return analytics.getEngagementMetrics();
  }, [analytics]);

  // Track page views on route changes
  useEffect(() => {
    const handleRouteChange = () => {
      trackPageView(window.location.pathname);
    };

    // Track initial page view
    handleRouteChange();

    // Listen for route changes (if using React Router)
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [trackPageView]);

      return {
    track,
    trackPageView,
    trackTaskCompletion,
    trackTaskAbandonment,
    trackPerformance,
    trackError,
    trackUserBehavior,
    getEngagementMetrics
  };
};

// Specific hooks for common tracking patterns
export const useTaskTracking = (taskId: string, taskName: string) => {
  const { trackTaskCompletion, trackTaskAbandonment } = useAnalytics();
  const [startTime] = useState(Date.now());
  const [steps, setSteps] = useState(0);

  const completeTask = useCallback(() => {
    const duration = Date.now() - startTime;
    trackTaskCompletion(taskId, taskName, steps, duration);
  }, [taskId, taskName, steps, startTime, trackTaskCompletion]);

  const abandonTask = useCallback(() => {
    const duration = Date.now() - startTime;
    trackTaskAbandonment(taskId, taskName, steps, duration);
  }, [taskId, taskName, steps, startTime, trackTaskAbandonment]);

  const incrementStep = useCallback(() => {
    setSteps(prev => prev + 1);
  }, []);

      return {
    completeTask,
    abandonTask,
    incrementStep,
    steps
  };
};

export const usePerformanceTracking = () => {
  const { trackPerformance } = useAnalytics();

  const trackPageLoad = useCallback((page: string) => {
    const loadTime = performance.now();
    trackPerformance('page_load_time', loadTime, { page });
  }, [trackPerformance]);

  const trackComponentRender = useCallback((component: string, renderTime: number) => {
    trackPerformance('component_render_time', renderTime, { component });
  }, [trackPerformance]);

  const trackAPIResponse = useCallback((endpoint: string, responseTime: number) => {
    trackPerformance('api_response_time', responseTime, { endpoint });
  }, [trackPerformance]);

  return {
    trackPageLoad,
    trackComponentRender,
    trackAPIResponse
  };
};

export default useAnalytics;