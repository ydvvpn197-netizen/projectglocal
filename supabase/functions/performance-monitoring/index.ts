import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PerformanceReport {
  id: string;
  timestamp: string;
  metrics: {
    lcp: number | null;
    fid: number | null;
    cls: number | null;
    fcp: number | null;
    ttfb: number | null;
    bundleSize: number | null;
    loadTime: number | null;
    renderTime: number | null;
    memoryUsage: number | null;
    networkLatency: number | null;
    cacheHitRate: number | null;
    timeToInteractive: number | null;
    firstMeaningfulPaint: number | null;
    speedIndex: number | null;
    apiResponseTime: number | null;
    componentRenderTime: number | null;
    imageLoadTime: number | null;
    fontLoadTime: number | null;
    errorCount: number;
    warningCount: number;
    crashCount: number;
  };
  score: number;
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'critical';
    metric: string;
    value: number;
    threshold: number;
    message: string;
    timestamp: string;
    resolved: boolean;
  }>;
  recommendations: string[];
  userAgent: string;
  url: string;
  sessionId: string;
  userId?: string;
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: string;
  resolved: boolean;
  sessionId: string;
  userId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { method } = req;
    const url = new URL(req.url);
    const path = url.pathname;

    switch (method) {
      case 'POST':
        if (path.endsWith('/report')) {
          return await handlePerformanceReport(req, supabaseClient);
        } else if (path.endsWith('/alert')) {
          return await handlePerformanceAlert(req, supabaseClient);
        } else if (path.endsWith('/session')) {
          return await handlePerformanceSession(req, supabaseClient);
        }
        break;

      case 'GET':
        if (path.endsWith('/metrics')) {
          return await getPerformanceMetrics(req, supabaseClient);
        } else if (path.endsWith('/alerts')) {
          return await getPerformanceAlerts(req, supabaseClient);
        } else if (path.endsWith('/summary')) {
          return await getPerformanceSummary(req, supabaseClient);
        } else if (path.endsWith('/thresholds')) {
          return await getPerformanceThresholds(req, supabaseClient);
        } else if (path.endsWith('/recommendations')) {
          return await getPerformanceRecommendations(req, supabaseClient);
        }
        break;

      case 'PUT':
        if (path.endsWith('/thresholds')) {
          return await updatePerformanceThresholds(req, supabaseClient);
        } else if (path.endsWith('/alert/resolve')) {
          return await resolvePerformanceAlert(req, supabaseClient);
        } else if (path.endsWith('/alert/dismiss')) {
          return await dismissPerformanceAlert(req, supabaseClient);
        }
        break;

      case 'DELETE':
        if (path.endsWith('/cleanup')) {
          return await cleanupPerformanceData(req, supabaseClient);
        }
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Performance monitoring error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handlePerformanceReport(req: Request, supabaseClient: SupabaseClient) {
  try {
    const report: PerformanceReport = await req.json();

    // Validate required fields
    if (!report.id || !report.metrics || !report.score) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert performance report
    const { data, error } = await supabaseClient
      .from('performance_reports')
      .insert({
        id: report.id,
        timestamp: report.timestamp,
        metrics: report.metrics,
        score: report.score,
        alerts: report.alerts,
        recommendations: report.recommendations,
        user_agent: report.userAgent,
        url: report.url,
        session_id: report.sessionId,
        user_id: report.userId
      });

    if (error) {
      console.error('Error inserting performance report:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to insert performance report' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process alerts if any
    if (report.alerts && report.alerts.length > 0) {
      await processPerformanceAlerts(report.alerts, supabaseClient);
    }

    return new Response(
      JSON.stringify({ success: true, id: report.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error handling performance report:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process performance report' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handlePerformanceAlert(req: Request, supabaseClient: SupabaseClient) {
  try {
    const alert: PerformanceAlert = await req.json();

    // Validate required fields
    if (!alert.id || !alert.metric || !alert.message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert performance alert
    const { data, error } = await supabaseClient
      .from('performance_alerts')
      .insert({
        id: alert.id,
        type: alert.type,
        metric: alert.metric,
        value: alert.value,
        threshold: alert.threshold,
        message: alert.message,
        timestamp: alert.timestamp,
        resolved: alert.resolved,
        session_id: alert.sessionId,
        user_id: alert.userId
      });

    if (error) {
      console.error('Error inserting performance alert:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to insert performance alert' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: alert.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error handling performance alert:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process performance alert' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handlePerformanceSession(req: Request, supabaseClient: SupabaseClient) {
  try {
    const session = await req.json();

    // Validate required fields
    if (!session.id || !session.sessionStart) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert performance session
    const { data, error } = await supabaseClient
      .from('performance_sessions')
      .insert({
        id: session.id,
        user_id: session.userId,
        session_start: session.sessionStart,
        session_end: session.sessionEnd,
        user_agent: session.userAgent,
        url: session.url,
        device_type: session.deviceType,
        browser: session.browser,
        os: session.os,
        screen_resolution: session.screenResolution,
        connection_type: session.connectionType
      });

    if (error) {
      console.error('Error inserting performance session:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to insert performance session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: session.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error handling performance session:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process performance session' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getPerformanceMetrics(req: Request, supabaseClient: SupabaseClient) {
  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get('start_date') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = url.searchParams.get('end_date') || new Date().toISOString();

    // Get performance metrics summary
    const { data, error } = await supabaseClient.rpc('get_performance_metrics_summary', {
      start_date: startDate,
      end_date: endDate
    });

    if (error) {
      console.error('Error getting performance metrics:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to get performance metrics' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get performance metrics' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getPerformanceAlerts(req: Request, supabaseClient: SupabaseClient) {
  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get('start_date') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = url.searchParams.get('end_date') || new Date().toISOString();
    const resolved = url.searchParams.get('resolved');

    let query = supabaseClient
      .from('performance_alerts')
      .select('*')
      .gte('timestamp', startDate)
      .lte('timestamp', endDate);

    if (resolved !== null) {
      query = query.eq('resolved', resolved === 'true');
    }

    const { data, error } = await query.order('timestamp', { ascending: false });

    if (error) {
      console.error('Error getting performance alerts:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to get performance alerts' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting performance alerts:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get performance alerts' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getPerformanceSummary(req: Request, supabaseClient: SupabaseClient) {
  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get('start_date') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = url.searchParams.get('end_date') || new Date().toISOString();

    // Get performance score trend
    const { data: scoreTrend, error: scoreError } = await supabaseClient.rpc('get_performance_score_trend', {
      start_date: startDate,
      end_date: endDate
    });

    if (scoreError) {
      console.error('Error getting performance score trend:', scoreError);
    }

    // Get alerts summary
    const { data: alertsSummary, error: alertsError } = await supabaseClient.rpc('get_performance_alerts_summary', {
      start_date: startDate,
      end_date: endDate
    });

    if (alertsError) {
      console.error('Error getting alerts summary:', alertsError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          scoreTrend: scoreTrend || [],
          alertsSummary: alertsSummary || []
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting performance summary:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get performance summary' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getPerformanceThresholds(req: Request, supabaseClient: SupabaseClient) {
  try {
    const { data, error } = await supabaseClient
      .from('performance_thresholds')
      .select('*')
      .order('metric_name');

    if (error) {
      console.error('Error getting performance thresholds:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to get performance thresholds' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting performance thresholds:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get performance thresholds' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getPerformanceRecommendations(req: Request, supabaseClient: SupabaseClient) {
  try {
    const url = new URL(req.url);
    const metricName = url.searchParams.get('metric_name');
    const metricValue = url.searchParams.get('metric_value');

    if (!metricName || !metricValue) {
      return new Response(
        JSON.stringify({ error: 'Missing metric_name or metric_value' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await supabaseClient.rpc('get_performance_recommendations', {
      metric_name: metricName,
      metric_value: parseFloat(metricValue)
    });

    if (error) {
      console.error('Error getting performance recommendations:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to get performance recommendations' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting performance recommendations:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get performance recommendations' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function updatePerformanceThresholds(req: Request, supabaseClient: SupabaseClient) {
  try {
    const { metricName, warningThreshold, errorThreshold, criticalThreshold, description } = await req.json();

    if (!metricName || warningThreshold === undefined || errorThreshold === undefined || criticalThreshold === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await supabaseClient.rpc('update_performance_thresholds', {
      metric_name: metricName,
      warning_threshold: warningThreshold,
      error_threshold: errorThreshold,
      critical_threshold: criticalThreshold,
      description: description
    });

    if (error) {
      console.error('Error updating performance thresholds:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update performance thresholds' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating performance thresholds:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update performance thresholds' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function resolvePerformanceAlert(req: Request, supabaseClient: SupabaseClient) {
  try {
    const { alertId, userId, notes } = await req.json();

    if (!alertId) {
      return new Response(
        JSON.stringify({ error: 'Missing alertId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await supabaseClient.rpc('resolve_performance_alert', {
      alert_id: alertId,
      user_id: userId,
      notes: notes
    });

    if (error) {
      console.error('Error resolving performance alert:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to resolve performance alert' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error resolving performance alert:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to resolve performance alert' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function dismissPerformanceAlert(req: Request, supabaseClient: SupabaseClient) {
  try {
    const { alertId, userId, notes } = await req.json();

    if (!alertId) {
      return new Response(
        JSON.stringify({ error: 'Missing alertId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await supabaseClient.rpc('dismiss_performance_alert', {
      alert_id: alertId,
      user_id: userId,
      notes: notes
    });

    if (error) {
      console.error('Error dismissing performance alert:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to dismiss performance alert' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error dismissing performance alert:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to dismiss performance alert' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function cleanupPerformanceData(req: Request, supabaseClient: SupabaseClient) {
  try {
    const url = new URL(req.url);
    const daysToKeep = parseInt(url.searchParams.get('days_to_keep') || '30');

    const { data, error } = await supabaseClient.rpc('cleanup_old_performance_data', {
      days_to_keep: daysToKeep
    });

    if (error) {
      console.error('Error cleaning up performance data:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to cleanup performance data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, deletedCount: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error cleaning up performance data:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to cleanup performance data' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function processPerformanceAlerts(alerts: PerformanceAlert[], supabaseClient: SupabaseClient) {
  for (const alert of alerts) {
    try {
      await supabaseClient
        .from('performance_alerts')
        .insert({
          id: alert.id,
          type: alert.type,
          metric: alert.metric,
          value: alert.value,
          threshold: alert.threshold,
          message: alert.message,
          timestamp: alert.timestamp,
          resolved: alert.resolved,
          session_id: alert.sessionId,
          user_id: alert.userId
        });
    } catch (error) {
      console.error('Error processing performance alert:', error);
    }
  }
}
