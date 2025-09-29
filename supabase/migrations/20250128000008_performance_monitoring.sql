-- Performance Monitoring Tables
-- This migration creates tables for storing performance metrics, alerts, and reports

-- Performance reports table
CREATE TABLE IF NOT EXISTS performance_reports (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metrics JSONB NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  alerts JSONB DEFAULT '[]'::jsonb,
  recommendations TEXT[] DEFAULT '{}',
  user_agent TEXT,
  url TEXT,
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance alerts table
CREATE TABLE IF NOT EXISTS performance_alerts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('warning', 'error', 'critical')),
  metric TEXT NOT NULL,
  value DECIMAL NOT NULL,
  threshold DECIMAL NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance sessions table
CREATE TABLE IF NOT EXISTS performance_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  user_agent TEXT,
  url TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  screen_resolution TEXT,
  connection_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance metrics summary table
CREATE TABLE IF NOT EXISTS performance_metrics_summary (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  metric_name TEXT NOT NULL,
  avg_value DECIMAL NOT NULL,
  min_value DECIMAL NOT NULL,
  max_value DECIMAL NOT NULL,
  p50_value DECIMAL NOT NULL,
  p75_value DECIMAL NOT NULL,
  p95_value DECIMAL NOT NULL,
  p99_value DECIMAL NOT NULL,
  sample_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(date, metric_name)
);

-- Performance thresholds table
CREATE TABLE IF NOT EXISTS performance_thresholds (
  id SERIAL PRIMARY KEY,
  metric_name TEXT UNIQUE NOT NULL,
  warning_threshold DECIMAL NOT NULL,
  error_threshold DECIMAL NOT NULL,
  critical_threshold DECIMAL NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance recommendations table
CREATE TABLE IF NOT EXISTS performance_recommendations (
  id SERIAL PRIMARY KEY,
  metric_name TEXT NOT NULL,
  condition TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance alerts history table
CREATE TABLE IF NOT EXISTS performance_alerts_history (
  id SERIAL PRIMARY KEY,
  alert_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'resolved', 'dismissed')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_performance_reports_timestamp ON performance_reports(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_reports_user_id ON performance_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_reports_session_id ON performance_reports(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_reports_score ON performance_reports(score);

CREATE INDEX IF NOT EXISTS idx_performance_alerts_timestamp ON performance_alerts(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_type ON performance_alerts(type);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_metric ON performance_alerts(metric);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_resolved ON performance_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_user_id ON performance_alerts(user_id);

CREATE INDEX IF NOT EXISTS idx_performance_sessions_user_id ON performance_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_sessions_start ON performance_sessions(session_start);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_summary_date ON performance_metrics_summary(date);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_summary_metric ON performance_metrics_summary(metric_name);

-- Insert default performance thresholds
INSERT INTO performance_thresholds (metric_name, warning_threshold, error_threshold, critical_threshold, description) VALUES
('lcp', 2500, 4000, 6000, 'Largest Contentful Paint - time to render the largest content element'),
('fid', 100, 300, 500, 'First Input Delay - time from first user interaction to browser response'),
('cls', 0.1, 0.25, 0.4, 'Cumulative Layout Shift - visual stability of the page'),
('fcp', 1800, 3000, 5000, 'First Contentful Paint - time to render the first content'),
('ttfb', 800, 1800, 3000, 'Time to First Byte - server response time'),
('bundleSize', 500, 1000, 2000, 'JavaScript bundle size in KB'),
('memoryUsage', 100, 200, 400, 'Memory usage in MB'),
('apiResponseTime', 1000, 2000, 5000, 'API response time in milliseconds')
ON CONFLICT (metric_name) DO NOTHING;

-- Insert default performance recommendations
INSERT INTO performance_recommendations (metric_name, condition, recommendation, priority) VALUES
('lcp', 'value > 2500', 'Optimize Largest Contentful Paint - consider image optimization and critical CSS', 1),
('lcp', 'value > 4000', 'Critical LCP issue - implement aggressive image optimization and lazy loading', 5),
('fid', 'value > 100', 'Reduce First Input Delay - minimize JavaScript execution time', 2),
('fid', 'value > 300', 'Critical FID issue - implement code splitting and reduce main thread blocking', 5),
('cls', 'value > 0.1', 'Improve Cumulative Layout Shift - ensure images have dimensions and avoid dynamic content', 2),
('cls', 'value > 0.25', 'Critical CLS issue - implement layout stability measures', 5),
('fcp', 'value > 1800', 'Optimize First Contentful Paint - reduce render-blocking resources', 1),
('fcp', 'value > 3000', 'Critical FCP issue - implement critical CSS and optimize resource loading', 4),
('ttfb', 'value > 800', 'Improve Time to First Byte - optimize server response time', 2),
('ttfb', 'value > 1800', 'Critical TTFB issue - implement server-side caching and optimization', 4),
('bundleSize', 'value > 500', 'Reduce bundle size - implement code splitting and remove unused dependencies', 2),
('bundleSize', 'value > 1000', 'Critical bundle size issue - implement aggressive code splitting and tree shaking', 4),
('memoryUsage', 'value > 100', 'Optimize memory usage - check for memory leaks and optimize data structures', 2),
('memoryUsage', 'value > 200', 'Critical memory usage - implement memory profiling and optimization', 4),
('apiResponseTime', 'value > 1000', 'Optimize API response times - implement caching and optimize database queries', 2),
('apiResponseTime', 'value > 2000', 'Critical API response time - implement aggressive caching and query optimization', 4)
ON CONFLICT DO NOTHING;

-- Functions for performance monitoring

-- Function to get performance metrics summary
CREATE OR REPLACE FUNCTION get_performance_metrics_summary(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '7 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  metric_name TEXT,
  avg_value DECIMAL,
  min_value DECIMAL,
  max_value DECIMAL,
  p50_value DECIMAL,
  p75_value DECIMAL,
  p95_value DECIMAL,
  p99_value DECIMAL,
  sample_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pms.metric_name,
    pms.avg_value,
    pms.min_value,
    pms.max_value,
    pms.p50_value,
    pms.p75_value,
    pms.p95_value,
    pms.p99_value,
    pms.sample_count::BIGINT
  FROM performance_metrics_summary pms
  WHERE pms.date BETWEEN start_date AND end_date
  ORDER BY pms.metric_name;
END;
$$ LANGUAGE plpgsql;

-- Function to get performance alerts summary
CREATE OR REPLACE FUNCTION get_performance_alerts_summary(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  metric_name TEXT,
  alert_count BIGINT,
  critical_count BIGINT,
  error_count BIGINT,
  warning_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.metric,
    COUNT(*) as alert_count,
    COUNT(*) FILTER (WHERE pa.type = 'critical') as critical_count,
    COUNT(*) FILTER (WHERE pa.type = 'error') as error_count,
    COUNT(*) FILTER (WHERE pa.type = 'warning') as warning_count
  FROM performance_alerts pa
  WHERE pa.timestamp BETWEEN start_date AND end_date
  GROUP BY pa.metric
  ORDER BY alert_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get performance score trend
CREATE OR REPLACE FUNCTION get_performance_score_trend(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  date DATE,
  avg_score DECIMAL,
  min_score INTEGER,
  max_score INTEGER,
  sample_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(pr.timestamp) as date,
    AVG(pr.score) as avg_score,
    MIN(pr.score) as min_score,
    MAX(pr.score) as max_score,
    COUNT(*) as sample_count
  FROM performance_reports pr
  WHERE pr.timestamp BETWEEN start_date AND end_date
  GROUP BY DATE(pr.timestamp)
  ORDER BY date;
END;
$$ LANGUAGE plpgsql;

-- Function to resolve performance alerts
CREATE OR REPLACE FUNCTION resolve_performance_alert(
  alert_id TEXT,
  user_id UUID DEFAULT NULL,
  notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update the alert
  UPDATE performance_alerts 
  SET resolved = TRUE 
  WHERE id = alert_id;
  
  -- Add to history
  INSERT INTO performance_alerts_history (alert_id, action, user_id, notes)
  VALUES (alert_id, 'resolved', user_id, notes);
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to dismiss performance alerts
CREATE OR REPLACE FUNCTION dismiss_performance_alert(
  alert_id TEXT,
  user_id UUID DEFAULT NULL,
  notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Add to history
  INSERT INTO performance_alerts_history (alert_id, action, user_id, notes)
  VALUES (alert_id, 'dismissed', user_id, notes);
  
  -- Delete the alert
  DELETE FROM performance_alerts WHERE id = alert_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to update performance thresholds
CREATE OR REPLACE FUNCTION update_performance_thresholds(
  metric_name TEXT,
  warning_threshold DECIMAL,
  error_threshold DECIMAL,
  critical_threshold DECIMAL,
  description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO performance_thresholds (metric_name, warning_threshold, error_threshold, critical_threshold, description)
  VALUES (metric_name, warning_threshold, error_threshold, critical_threshold, description)
  ON CONFLICT (metric_name) 
  DO UPDATE SET 
    warning_threshold = EXCLUDED.warning_threshold,
    error_threshold = EXCLUDED.error_threshold,
    critical_threshold = EXCLUDED.critical_threshold,
    description = COALESCE(EXCLUDED.description, performance_thresholds.description),
    updated_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get performance recommendations for a metric
CREATE OR REPLACE FUNCTION get_performance_recommendations(
  metric_name TEXT,
  metric_value DECIMAL
)
RETURNS TABLE (
  recommendation TEXT,
  priority INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.recommendation,
    pr.priority
  FROM performance_recommendations pr
  WHERE pr.metric_name = metric_name
    AND pr.active = TRUE
    AND (
      (pr.condition LIKE '%>%' AND metric_value > CAST(SPLIT_PART(pr.condition, '>', 2) AS DECIMAL)) OR
      (pr.condition LIKE '%<%' AND metric_value < CAST(SPLIT_PART(pr.condition, '<', 2) AS DECIMAL)) OR
      (pr.condition LIKE '%=%' AND metric_value = CAST(SPLIT_PART(pr.condition, '=', 2) AS DECIMAL))
    )
  ORDER BY pr.priority DESC, pr.id;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old performance data
CREATE OR REPLACE FUNCTION cleanup_old_performance_data(
  days_to_keep INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Delete old performance reports
  DELETE FROM performance_reports 
  WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Delete old resolved alerts
  DELETE FROM performance_alerts 
  WHERE resolved = TRUE 
    AND timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
  
  -- Delete old alert history
  DELETE FROM performance_alerts_history 
  WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
  
  -- Delete old sessions
  DELETE FROM performance_sessions 
  WHERE session_start < NOW() - INTERVAL '1 day' * days_to_keep;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for performance monitoring tables

-- Enable RLS
ALTER TABLE performance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_alerts_history ENABLE ROW LEVEL SECURITY;

-- Performance reports policies
CREATE POLICY "Users can view their own performance reports" ON performance_reports
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can insert their own performance reports" ON performance_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Admins can view all performance reports" ON performance_reports
  FOR SELECT USING (is_admin());

-- Performance alerts policies
CREATE POLICY "Users can view their own performance alerts" ON performance_alerts
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can insert their own performance alerts" ON performance_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Admins can view all performance alerts" ON performance_alerts
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update performance alerts" ON performance_alerts
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete performance alerts" ON performance_alerts
  FOR DELETE USING (is_admin());

-- Performance sessions policies
CREATE POLICY "Users can view their own performance sessions" ON performance_sessions
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can insert their own performance sessions" ON performance_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Admins can view all performance sessions" ON performance_sessions
  FOR SELECT USING (is_admin());

-- Performance metrics summary policies
CREATE POLICY "Anyone can view performance metrics summary" ON performance_metrics_summary
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage performance metrics summary" ON performance_metrics_summary
  FOR ALL USING (is_admin());

-- Performance thresholds policies
CREATE POLICY "Anyone can view performance thresholds" ON performance_thresholds
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage performance thresholds" ON performance_thresholds
  FOR ALL USING (is_admin());

-- Performance recommendations policies
CREATE POLICY "Anyone can view performance recommendations" ON performance_recommendations
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage performance recommendations" ON performance_recommendations
  FOR ALL USING (is_admin());

-- Performance alerts history policies
CREATE POLICY "Users can view their own performance alerts history" ON performance_alerts_history
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can insert their own performance alerts history" ON performance_alerts_history
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Admins can view all performance alerts history" ON performance_alerts_history
  FOR SELECT USING (is_admin());

-- Triggers for performance monitoring

-- Trigger to update performance_thresholds updated_at
CREATE OR REPLACE FUNCTION update_performance_thresholds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER performance_thresholds_updated_at
  BEFORE UPDATE ON performance_thresholds
  FOR EACH ROW
  EXECUTE FUNCTION update_performance_thresholds_updated_at();

-- Trigger to update performance_recommendations updated_at
CREATE OR REPLACE FUNCTION update_performance_recommendations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER performance_recommendations_updated_at
  BEFORE UPDATE ON performance_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_performance_recommendations_updated_at();

-- Trigger to automatically resolve old alerts
CREATE OR REPLACE FUNCTION auto_resolve_old_alerts()
RETURNS TRIGGER AS $$
BEGIN
  -- Resolve alerts older than 24 hours
  UPDATE performance_alerts 
  SET resolved = TRUE 
  WHERE resolved = FALSE 
    AND timestamp < NOW() - INTERVAL '24 hours';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_resolve_old_alerts_trigger
  AFTER INSERT ON performance_alerts
  FOR EACH STATEMENT
  EXECUTE FUNCTION auto_resolve_old_alerts();

-- Comments
COMMENT ON TABLE performance_reports IS 'Stores performance monitoring reports with metrics and scores';
COMMENT ON TABLE performance_alerts IS 'Stores performance alerts when metrics exceed thresholds';
COMMENT ON TABLE performance_sessions IS 'Tracks user sessions for performance monitoring';
COMMENT ON TABLE performance_metrics_summary IS 'Aggregated performance metrics by date';
COMMENT ON TABLE performance_thresholds IS 'Configurable thresholds for performance metrics';
COMMENT ON TABLE performance_recommendations IS 'Recommendations for performance improvements';
COMMENT ON TABLE performance_alerts_history IS 'History of performance alert actions';

COMMENT ON FUNCTION get_performance_metrics_summary IS 'Get performance metrics summary for a date range';
COMMENT ON FUNCTION get_performance_alerts_summary IS 'Get performance alerts summary for a date range';
COMMENT ON FUNCTION get_performance_score_trend IS 'Get performance score trend over time';
COMMENT ON FUNCTION resolve_performance_alert IS 'Resolve a performance alert';
COMMENT ON FUNCTION dismiss_performance_alert IS 'Dismiss a performance alert';
COMMENT ON FUNCTION update_performance_thresholds IS 'Update performance thresholds for a metric';
COMMENT ON FUNCTION get_performance_recommendations IS 'Get performance recommendations for a metric and value';
COMMENT ON FUNCTION cleanup_old_performance_data IS 'Clean up old performance data';
