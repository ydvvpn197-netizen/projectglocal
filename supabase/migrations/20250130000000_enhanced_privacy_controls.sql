-- Enhanced Privacy Controls Migration
-- Date: 2025-01-30
-- Description: Add comprehensive privacy controls including data export, consent management, and data retention policies

-- Create data export requests table
CREATE TABLE IF NOT EXISTS data_export_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('full', 'profile', 'activity', 'analytics')),
    format TEXT NOT NULL CHECK (format IN ('json', 'csv', 'pdf')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    download_url TEXT,
    file_size BIGINT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consent templates table
CREATE TABLE IF NOT EXISTS consent_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL UNIQUE,
    purpose TEXT NOT NULL,
    description TEXT NOT NULL,
    legal_basis TEXT NOT NULL CHECK (legal_basis IN ('consent', 'legitimate_interest', 'contract', 'legal_obligation')),
    data_categories TEXT[] DEFAULT '{}',
    processing_activities TEXT[] DEFAULT '{}',
    retention_period INTEGER DEFAULT 365, -- in days
    required BOOLEAN DEFAULT false,
    default_granted BOOLEAN DEFAULT false,
    expires_after_days INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consent records table
CREATE TABLE IF NOT EXISTS consent_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    purpose TEXT NOT NULL,
    granted BOOLEAN NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    legal_basis TEXT NOT NULL CHECK (legal_basis IN ('consent', 'legitimate_interest', 'contract', 'legal_obligation')),
    data_categories TEXT[] DEFAULT '{}',
    processing_activities TEXT[] DEFAULT '{}',
    retention_period INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category)
);

-- Create consent audit log table
CREATE TABLE IF NOT EXISTS consent_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('granted', 'revoked', 'expired')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Create data retention policies table
CREATE TABLE IF NOT EXISTS data_retention_policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    retention_period INTEGER NOT NULL, -- in days
    auto_delete BOOLEAN DEFAULT false,
    legal_basis TEXT NOT NULL,
    exceptions TEXT[] DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create privacy settings table
CREATE TABLE IF NOT EXISTS privacy_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'followers', 'private')),
    show_location BOOLEAN DEFAULT true,
    show_contact_info BOOLEAN DEFAULT true,
    show_activity BOOLEAN DEFAULT true,
    allow_messages_from TEXT DEFAULT 'all' CHECK (allow_messages_from IN ('all', 'followers', 'none')),
    analytics_enabled BOOLEAN DEFAULT true,
    personalization_enabled BOOLEAN DEFAULT true,
    marketing_consent BOOLEAN DEFAULT false,
    data_sharing_consent BOOLEAN DEFAULT false,
    location_tracking BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_data_export_requests_user_id ON data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_status ON data_export_requests(status);
CREATE INDEX IF NOT EXISTS idx_consent_records_user_id ON consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_category ON consent_records(category);
CREATE INDEX IF NOT EXISTS idx_consent_records_granted ON consent_records(granted);
CREATE INDEX IF NOT EXISTS idx_consent_audit_log_user_id ON consent_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_audit_log_timestamp ON consent_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_privacy_settings_user_id ON privacy_settings(user_id);

-- Enable RLS on all tables
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for data_export_requests
CREATE POLICY "Users can view their own export requests" ON data_export_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own export requests" ON data_export_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own export requests" ON data_export_requests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own export requests" ON data_export_requests
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for consent_records
CREATE POLICY "Users can view their own consent records" ON consent_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own consent records" ON consent_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consent records" ON consent_records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own consent records" ON consent_records
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for consent_audit_log
CREATE POLICY "Users can view their own audit log" ON consent_audit_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create audit log entries" ON consent_audit_log
    FOR INSERT WITH CHECK (true);

-- RLS Policies for privacy_settings
CREATE POLICY "Users can view their own privacy settings" ON privacy_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own privacy settings" ON privacy_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own privacy settings" ON privacy_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own privacy settings" ON privacy_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Insert default consent templates
INSERT INTO consent_templates (category, purpose, description, legal_basis, data_categories, processing_activities, retention_period, required, default_granted, expires_after_days) VALUES
('Analytics', 'Improve app performance and user experience', 'Collect anonymous usage data to improve app functionality and user experience', 'legitimate_interest', ARRAY['usage_data', 'performance_metrics'], ARRAY['analytics', 'performance_monitoring'], 365, false, true, 365),
('Marketing', 'Send promotional content and updates', 'Send marketing emails and promotional content about new features and services', 'consent', ARRAY['email', 'preferences'], ARRAY['email_marketing', 'promotional_content'], 365, false, false, 365),
('Location', 'Provide location-based services', 'Use location data to provide relevant local content and services', 'consent', ARRAY['location_data', 'coordinates'], ARRAY['location_services', 'local_recommendations'], 30, false, false, 365),
('Personalization', 'Provide personalized content and recommendations', 'Use user behavior data to provide personalized content and recommendations', 'consent', ARRAY['behavior_data', 'preferences'], ARRAY['content_personalization', 'recommendations'], 90, false, true, 365),
('Data Sharing', 'Share data with third-party services', 'Share anonymized data with third-party services for analytics and improvement', 'consent', ARRAY['anonymized_data', 'usage_patterns'], ARRAY['third_party_sharing', 'analytics'], 180, false, false, 365);

-- Insert default data retention policies
INSERT INTO data_retention_policies (category, description, retention_period, auto_delete, legal_basis, exceptions) VALUES
('Profile Data', 'Basic profile information and user preferences', 365, false, 'legitimate_interest', ARRAY['legal_obligations', 'dispute_resolution']),
('Activity Data', 'Posts, comments, likes, and other user activity', 90, true, 'legitimate_interest', ARRAY['legal_obligations', 'content_moderation']),
('Analytics Data', 'Usage analytics and behavioral data', 30, true, 'legitimate_interest', ARRAY['legal_obligations']),
('Location Data', 'Location tracking and geolocation data', 7, true, 'consent', ARRAY['legal_obligations']),
('Communication Data', 'Messages, emails, and other communications', 180, false, 'legitimate_interest', ARRAY['legal_obligations', 'dispute_resolution']),
('Payment Data', 'Payment information and transaction history', 2555, false, 'legal_obligation', ARRAY['legal_obligations', 'tax_requirements']);

-- Create function to automatically create privacy settings for new users
CREATE OR REPLACE FUNCTION create_default_privacy_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO privacy_settings (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create privacy settings for new users
DROP TRIGGER IF EXISTS create_privacy_settings_trigger ON auth.users;
CREATE TRIGGER create_privacy_settings_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_privacy_settings();

-- Create function to log consent changes
CREATE OR REPLACE FUNCTION log_consent_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the change in audit log
    INSERT INTO consent_audit_log (user_id, category, action, ip_address, user_agent)
    VALUES (
        NEW.user_id,
        NEW.category,
        CASE 
            WHEN NEW.granted AND (OLD.granted IS NULL OR NOT OLD.granted) THEN 'granted'
            WHEN NOT NEW.granted AND OLD.granted THEN 'revoked'
            ELSE 'granted'
        END,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to log consent changes
DROP TRIGGER IF EXISTS log_consent_change_trigger ON consent_records;
CREATE TRIGGER log_consent_change_trigger
    AFTER INSERT OR UPDATE ON consent_records
    FOR EACH ROW
    EXECUTE FUNCTION log_consent_change();

-- Create function to check for expired consents
CREATE OR REPLACE FUNCTION check_expired_consents()
RETURNS void AS $$
BEGIN
    -- Update expired consents
    UPDATE consent_records 
    SET granted = false, revoked_at = NOW(), updated_at = NOW()
    WHERE granted = true 
    AND expires_at IS NOT NULL 
    AND expires_at < NOW();
    
    -- Log expired consents
    INSERT INTO consent_audit_log (user_id, category, action)
    SELECT user_id, category, 'expired'
    FROM consent_records 
    WHERE granted = false 
    AND revoked_at = NOW()
    AND expires_at IS NOT NULL 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up old data based on retention policies
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
DECLARE
    policy_record RECORD;
    cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Loop through all active retention policies
    FOR policy_record IN 
        SELECT * FROM data_retention_policies WHERE active = true AND auto_delete = true
    LOOP
        cutoff_date := NOW() - INTERVAL '1 day' * policy_record.retention_period;
        
        -- Delete data based on category (this would need to be customized for each table)
        CASE policy_record.category
            WHEN 'Analytics Data' THEN
                DELETE FROM user_analytics WHERE created_at < cutoff_date;
            WHEN 'Location Data' THEN
                DELETE FROM user_locations WHERE created_at < cutoff_date;
            WHEN 'Activity Data' THEN
                DELETE FROM post_likes WHERE created_at < cutoff_date;
                DELETE FROM post_comments WHERE created_at < cutoff_date;
            -- Add more cases as needed
        END CASE;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create storage bucket for data exports
INSERT INTO storage.buckets (id, name, public) VALUES ('data-exports', 'data-exports', false);

-- Create storage policy for data exports
CREATE POLICY "Users can access their own data exports" ON storage.objects
    FOR SELECT USING (bucket_id = 'data-exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own data exports" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'data-exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own data exports" ON storage.objects
    FOR DELETE USING (bucket_id = 'data-exports' AND auth.uid()::text = (storage.foldername(name))[1]);
