-- ============================================================================
-- PERFORMANCE OPTIMIZATIONS MIGRATION
-- ============================================================================
-- This migration adds performance optimizations and monitoring
-- Date: 2025-01-28
-- Version: 1.0.0

-- ============================================================================
-- CREATE PERFORMANCE MONITORING TABLES
-- ============================================================================

-- Performance metrics table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,4) NOT NULL,
  metric_unit TEXT DEFAULT 'ms',
  page_url TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Performance recommendations table
CREATE TABLE IF NOT EXISTS public.performance_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recommendation_type TEXT NOT NULL,
  recommendation_text TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  is_implemented BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  implemented_at TIMESTAMP WITH TIME ZONE
);

-- Bundle analysis table
CREATE TABLE IF NOT EXISTS public.bundle_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_name TEXT NOT NULL,
  bundle_size INTEGER NOT NULL,
  chunk_count INTEGER NOT NULL,
  compression_ratio DECIMAL(5,2),
  load_time DECIMAL(10,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- CREATE PERFORMANCE INDEXES
-- ============================================================================

-- Performance metrics indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON public.performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_name ON public.performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON public.performance_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_session_id ON public.performance_metrics(session_id);

-- Performance recommendations indexes
CREATE INDEX IF NOT EXISTS idx_performance_recommendations_user_id ON public.performance_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_recommendations_priority ON public.performance_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_performance_recommendations_is_implemented ON public.performance_recommendations(is_implemented);

-- Bundle analysis indexes
CREATE INDEX IF NOT EXISTS idx_bundle_analysis_bundle_name ON public.bundle_analysis(bundle_name);
CREATE INDEX IF NOT EXISTS idx_bundle_analysis_created_at ON public.bundle_analysis(created_at DESC);

-- ============================================================================
-- CREATE PERFORMANCE FUNCTIONS
-- ============================================================================

-- Function to record performance metrics
CREATE OR REPLACE FUNCTION public.record_performance_metric(
  metric_name_param TEXT,
  metric_value_param DECIMAL(10,4),
  metric_unit_param TEXT DEFAULT 'ms',
  page_url_param TEXT DEFAULT NULL,
  session_id_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  metric_id UUID;
BEGIN
  INSERT INTO public.performance_metrics (
    user_id,
    session_id,
    metric_name,
    metric_value,
    metric_unit,
    page_url,
    user_agent,
    ip_address
  ) VALUES (
    auth.uid(),
    session_id_param,
    metric_name_param,
    metric_value_param,
    metric_unit_param,
    page_url_param,
    current_setting('request.headers', true)::json->>'user-agent',
    inet_client_addr()
  ) RETURNING id INTO metric_id;
  
  RETURN metric_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get performance recommendations
CREATE OR REPLACE FUNCTION public.get_performance_recommendations(user_uuid UUID DEFAULT NULL)
RETURNS TABLE (
  recommendation_type TEXT,
  recommendation_text TEXT,
  priority TEXT,
  is_implemented BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.recommendation_type,
    pr.recommendation_text,
    pr.priority,
    pr.is_implemented
  FROM public.performance_recommendations pr
  WHERE (user_uuid IS NULL OR pr.user_id = user_uuid)
  ORDER BY 
    CASE pr.priority 
      WHEN 'critical' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'low' THEN 4
    END,
    pr.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to analyze bundle performance
CREATE OR REPLACE FUNCTION public.analyze_bundle_performance()
RETURNS TABLE (
  bundle_name TEXT,
  avg_size DECIMAL(10,2),
  avg_load_time DECIMAL(10,4),
  recommendation_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ba.bundle_name,
    AVG(ba.bundle_size) as avg_size,
    AVG(ba.load_time) as avg_load_time,
    COUNT(pr.id) as recommendation_count
  FROM public.bundle_analysis ba
  LEFT JOIN public.performance_recommendations pr ON pr.recommendation_type = 'bundle_optimization'
  GROUP BY ba.bundle_name
  ORDER BY avg_size DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old performance data
CREATE OR REPLACE FUNCTION public.cleanup_old_performance_data()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete performance metrics older than 30 days
  DELETE FROM public.performance_metrics 
  WHERE created_at < (now() - interval '30 days');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Delete old bundle analysis data
  DELETE FROM public.bundle_analysis 
  WHERE created_at < (now() - interval '7 days');
  
  GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CREATE PERFORMANCE TRIGGERS
-- ============================================================================

-- Trigger to automatically create performance recommendations
CREATE OR REPLACE FUNCTION public.auto_performance_recommendations()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for slow LCP (Largest Contentful Paint)
  IF NEW.metric_name = 'LCP' AND NEW.metric_value > 2500 THEN
    INSERT INTO public.performance_recommendations (
      user_id,
      recommendation_type,
      recommendation_text,
      priority
    ) VALUES (
      NEW.user_id,
      'lcp_optimization',
      'Optimize Largest Contentful Paint - consider image optimization and critical CSS',
      'high'
    ) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Check for high CLS (Cumulative Layout Shift)
  IF NEW.metric_name = 'CLS' AND NEW.metric_value > 0.1 THEN
    INSERT INTO public.performance_recommendations (
      user_id,
      recommendation_type,
      recommendation_text,
      priority
    ) VALUES (
      NEW.user_id,
      'cls_optimization',
      'Improve Cumulative Layout Shift - ensure images have dimensions and avoid dynamic content',
      'medium'
    ) ON CONFLICT DO NOTHING;
  END IF;
  
  -- Check for slow FID (First Input Delay)
  IF NEW.metric_name = 'FID' AND NEW.metric_value > 100 THEN
    INSERT INTO public.performance_recommendations (
      user_id,
      recommendation_type,
      recommendation_text,
      priority
    ) VALUES (
      NEW.user_id,
      'fid_optimization',
      'Reduce First Input Delay - minimize JavaScript execution time',
      'high'
    ) ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS auto_performance_recommendations_trigger ON public.performance_metrics;
CREATE TRIGGER auto_performance_recommendations_trigger
  AFTER INSERT ON public.performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_performance_recommendations();

-- ============================================================================
-- CREATE RLS POLICIES FOR PERFORMANCE TABLES
-- ============================================================================

-- Enable RLS on performance tables
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_analysis ENABLE ROW LEVEL SECURITY;

-- Performance metrics policies
CREATE POLICY "Users can view own performance metrics" ON public.performance_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own performance metrics" ON public.performance_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can manage performance metrics" ON public.performance_metrics
  FOR ALL USING (true);

-- Performance recommendations policies
CREATE POLICY "Users can view own performance recommendations" ON public.performance_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own performance recommendations" ON public.performance_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can manage performance recommendations" ON public.performance_recommendations
  FOR ALL USING (true);

-- Bundle analysis policies
CREATE POLICY "Anyone can view bundle analysis" ON public.bundle_analysis
  FOR SELECT USING (true);

CREATE POLICY "System can manage bundle analysis" ON public.bundle_analysis
  FOR ALL USING (true);

-- ============================================================================
-- CREATE PERFORMANCE VIEWS
-- ============================================================================

-- View for performance dashboard
CREATE OR REPLACE VIEW public.performance_dashboard AS
SELECT 
  pm.metric_name,
  AVG(pm.metric_value) as avg_value,
  MIN(pm.metric_value) as min_value,
  MAX(pm.metric_value) as max_value,
  COUNT(*) as measurement_count,
  DATE_TRUNC('day', pm.created_at) as measurement_date
FROM public.performance_metrics pm
WHERE pm.created_at >= (now() - interval '7 days')
GROUP BY pm.metric_name, DATE_TRUNC('day', pm.created_at)
ORDER BY measurement_date DESC, pm.metric_name;

-- View for performance recommendations summary
CREATE OR REPLACE VIEW public.performance_recommendations_summary AS
SELECT 
  pr.recommendation_type,
  pr.priority,
  COUNT(*) as recommendation_count,
  COUNT(*) FILTER (WHERE pr.is_implemented = true) as implemented_count,
  ROUND(
    (COUNT(*) FILTER (WHERE pr.is_implemented = true)::DECIMAL / COUNT(*)) * 100, 
    2
  ) as implementation_rate
FROM public.performance_recommendations pr
GROUP BY pr.recommendation_type, pr.priority
ORDER BY 
  CASE pr.priority 
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  recommendation_count DESC;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions for performance functions
GRANT EXECUTE ON FUNCTION public.record_performance_metric(TEXT, DECIMAL, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_performance_recommendations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.analyze_bundle_performance() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_performance_data() TO service_role;

-- Grant permissions for views
GRANT SELECT ON public.performance_dashboard TO authenticated;
GRANT SELECT ON public.performance_recommendations_summary TO authenticated;

-- ============================================================================
-- INSERT DEFAULT PERFORMANCE SETTINGS
-- ============================================================================

-- Insert performance monitoring settings
INSERT INTO public.system_settings (key, value, description) 
VALUES 
  ('performance_monitoring_enabled', 'true', 'Enable performance monitoring'),
  ('performance_metrics_retention_days', '30', 'Number of days to retain performance metrics'),
  ('performance_recommendations_enabled', 'true', 'Enable automatic performance recommendations'),
  ('bundle_analysis_enabled', 'true', 'Enable bundle size analysis'),
  ('performance_cleanup_schedule', 'daily', 'Schedule for cleaning up old performance data')
ON CONFLICT (key) DO NOTHING;
