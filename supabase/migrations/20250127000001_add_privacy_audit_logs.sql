-- Create privacy_audit_logs table for tracking privacy-related actions
CREATE TABLE IF NOT EXISTS privacy_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'identity_reveal', 
        'identity_hide', 
        'privacy_setting_change', 
        'anonymous_post', 
        'data_access', 
        'data_deletion'
    )),
    resource_type TEXT NOT NULL CHECK (resource_type IN (
        'profile', 
        'post', 
        'comment', 
        'event', 
        'service', 
        'message'
    )),
    resource_id TEXT,
    old_value JSONB,
    new_value JSONB,
    ip_address TEXT,
    user_agent TEXT,
    location TEXT,
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_privacy_audit_logs_user_id ON privacy_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_audit_logs_action_type ON privacy_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_privacy_audit_logs_timestamp ON privacy_audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_privacy_audit_logs_resource ON privacy_audit_logs(resource_type, resource_id);

-- Enable RLS
ALTER TABLE privacy_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own privacy audit logs" ON privacy_audit_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own privacy audit logs" ON privacy_audit_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to automatically log privacy actions
CREATE OR REPLACE FUNCTION log_privacy_action(
    p_action_type TEXT,
    p_resource_type TEXT,
    p_resource_id TEXT DEFAULT NULL,
    p_old_value JSONB DEFAULT NULL,
    p_new_value JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO privacy_audit_logs (
        user_id,
        action_type,
        resource_type,
        resource_id,
        old_value,
        new_value,
        metadata,
        ip_address,
        user_agent,
        location
    ) VALUES (
        auth.uid(),
        p_action_type,
        p_resource_type,
        p_resource_id,
        p_old_value,
        p_new_value,
        p_metadata,
        NULL, -- IP address would be set by the application
        NULL, -- User agent would be set by the application
        NULL  -- Location would be set by the application
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically log profile changes
CREATE OR REPLACE FUNCTION log_profile_privacy_changes() RETURNS TRIGGER AS $$
BEGIN
    -- Log privacy setting changes
    IF OLD.anonymous_posting_enabled IS DISTINCT FROM NEW.anonymous_posting_enabled THEN
        PERFORM log_privacy_action(
            'privacy_setting_change',
            'profile',
            NEW.user_id::TEXT,
            jsonb_build_object('anonymous_posting_enabled', OLD.anonymous_posting_enabled),
            jsonb_build_object('anonymous_posting_enabled', NEW.anonymous_posting_enabled),
            jsonb_build_object('setting', 'anonymous_posting_enabled')
        );
    END IF;

    IF OLD.location_sharing_level IS DISTINCT FROM NEW.location_sharing_level THEN
        PERFORM log_privacy_action(
            'privacy_setting_change',
            'profile',
            NEW.user_id::TEXT,
            jsonb_build_object('location_sharing_level', OLD.location_sharing_level),
            jsonb_build_object('location_sharing_level', NEW.location_sharing_level),
            jsonb_build_object('setting', 'location_sharing_level')
        );
    END IF;

    IF OLD.profile_visibility IS DISTINCT FROM NEW.profile_visibility THEN
        PERFORM log_privacy_action(
            'privacy_setting_change',
            'profile',
            NEW.user_id::TEXT,
            jsonb_build_object('profile_visibility', OLD.profile_visibility),
            jsonb_build_object('profile_visibility', NEW.profile_visibility),
            jsonb_build_object('setting', 'profile_visibility')
        );
    END IF;

    IF OLD.data_collection_consent IS DISTINCT FROM NEW.data_collection_consent THEN
        PERFORM log_privacy_action(
            'privacy_setting_change',
            'profile',
            NEW.user_id::TEXT,
            jsonb_build_object('data_collection_consent', OLD.data_collection_consent),
            jsonb_build_object('data_collection_consent', NEW.data_collection_consent),
            jsonb_build_object('setting', 'data_collection_consent')
        );
    END IF;

    IF OLD.marketing_emails IS DISTINCT FROM NEW.marketing_emails THEN
        PERFORM log_privacy_action(
            'privacy_setting_change',
            'profile',
            NEW.user_id::TEXT,
            jsonb_build_object('marketing_emails', OLD.marketing_emails),
            jsonb_build_object('marketing_emails', NEW.marketing_emails),
            jsonb_build_object('setting', 'marketing_emails')
        );
    END IF;

    IF OLD.analytics_tracking IS DISTINCT FROM NEW.analytics_tracking THEN
        PERFORM log_privacy_action(
            'privacy_setting_change',
            'profile',
            NEW.user_id::TEXT,
            jsonb_build_object('analytics_tracking', OLD.analytics_tracking),
            jsonb_build_object('analytics_tracking', NEW.analytics_tracking),
            jsonb_build_object('setting', 'analytics_tracking')
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS trigger_log_profile_privacy_changes ON profiles;
CREATE TRIGGER trigger_log_profile_privacy_changes
    AFTER UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION log_profile_privacy_changes();

-- Create function to get privacy audit summary
CREATE OR REPLACE FUNCTION get_privacy_audit_summary(p_user_id UUID)
RETURNS TABLE (
    total_actions BIGINT,
    identity_reveals BIGINT,
    privacy_changes BIGINT,
    anonymous_posts BIGINT,
    data_accesses BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_actions,
        COUNT(*) FILTER (WHERE action_type = 'identity_reveal') as identity_reveals,
        COUNT(*) FILTER (WHERE action_type = 'privacy_setting_change') as privacy_changes,
        COUNT(*) FILTER (WHERE action_type = 'anonymous_post') as anonymous_posts,
        COUNT(*) FILTER (WHERE action_type = 'data_access') as data_accesses
    FROM privacy_audit_logs
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON privacy_audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION log_privacy_action TO authenticated;
GRANT EXECUTE ON FUNCTION get_privacy_audit_summary TO authenticated;
