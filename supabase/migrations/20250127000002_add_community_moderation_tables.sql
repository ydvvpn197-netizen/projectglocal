-- Community Moderation System Migration
-- This migration adds tables for community-driven moderation tools

-- Create community_reports table
CREATE TABLE IF NOT EXISTS community_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'event', 'user', 'business', 'group')),
    content_id UUID NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN (
        'spam', 'inappropriate', 'harassment', 'misinformation', 
        'copyright', 'hate_speech', 'violence', 'privacy', 'other'
    )),
    description TEXT NOT NULL,
    evidence TEXT[] DEFAULT '{}',
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'under_review', 'resolved', 'dismissed', 'escalated'
    )),
    content_title TEXT,
    content_preview TEXT,
    assigned_moderator_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    action_taken TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create moderation_transparency_logs table
CREATE TABLE IF NOT EXISTS moderation_transparency_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'report_submitted', 'report_resolved', 'content_removed', 
        'user_warned', 'user_suspended', 'appeal_processed'
    )),
    content_type TEXT NOT NULL,
    content_id UUID NOT NULL,
    reason TEXT NOT NULL,
    moderator_notes TEXT,
    action_taken TEXT NOT NULL,
    community_impact TEXT NOT NULL CHECK (community_impact IN ('positive', 'neutral', 'negative')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_feedback table
CREATE TABLE IF NOT EXISTS community_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feedback_type TEXT NOT NULL CHECK (feedback_type IN (
        'moderation_quality', 'response_time', 'transparency', 'community_guidelines'
    )),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_moderation_settings table
CREATE TABLE IF NOT EXISTS community_moderation_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_reports_reporter_id ON community_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_content_type_id ON community_reports(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_status ON community_reports(status);
CREATE INDEX IF NOT EXISTS idx_community_reports_priority ON community_reports(priority);
CREATE INDEX IF NOT EXISTS idx_community_reports_created_at ON community_reports(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_moderation_logs_action_type ON moderation_transparency_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_timestamp ON moderation_transparency_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_content_type_id ON moderation_transparency_logs(content_type, content_id);

CREATE INDEX IF NOT EXISTS idx_community_feedback_type ON community_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_community_feedback_timestamp ON community_feedback(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_community_feedback_submitted_by ON community_feedback(submitted_by);

-- Create RLS policies for community_reports
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;

-- Users can view their own reports
CREATE POLICY "Users can view own reports" ON community_reports
    FOR SELECT USING (auth.uid() = reporter_id);

-- Users can insert their own reports
CREATE POLICY "Users can insert own reports" ON community_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Users can update their own pending reports
CREATE POLICY "Users can update own pending reports" ON community_reports
    FOR UPDATE USING (auth.uid() = reporter_id AND status = 'pending');

-- Admins can view all reports
CREATE POLICY "Admins can view all reports" ON community_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

-- Admins can update all reports
CREATE POLICY "Admins can update all reports" ON community_reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

-- Create RLS policies for moderation_transparency_logs
ALTER TABLE moderation_transparency_logs ENABLE ROW LEVEL SECURITY;

-- Everyone can view transparency logs (public transparency)
CREATE POLICY "Public can view transparency logs" ON moderation_transparency_logs
    FOR SELECT USING (true);

-- Only admins can insert transparency logs
CREATE POLICY "Admins can insert transparency logs" ON moderation_transparency_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

-- Create RLS policies for community_feedback
ALTER TABLE community_feedback ENABLE ROW LEVEL SECURITY;

-- Users can view all feedback (for transparency)
CREATE POLICY "Users can view all feedback" ON community_feedback
    FOR SELECT USING (true);

-- Users can insert their own feedback
CREATE POLICY "Users can insert own feedback" ON community_feedback
    FOR INSERT WITH CHECK (auth.uid() = submitted_by);

-- Users can update their own feedback
CREATE POLICY "Users can update own feedback" ON community_feedback
    FOR UPDATE USING (auth.uid() = submitted_by);

-- Create RLS policies for community_moderation_settings
ALTER TABLE community_moderation_settings ENABLE ROW LEVEL SECURITY;

-- Public can view public settings
CREATE POLICY "Public can view public settings" ON community_moderation_settings
    FOR SELECT USING (is_public = true);

-- Only admins can view all settings
CREATE POLICY "Admins can view all settings" ON community_moderation_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

-- Only admins can insert/update settings
CREATE POLICY "Admins can manage settings" ON community_moderation_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

-- Insert default community moderation settings
INSERT INTO community_moderation_settings (setting_key, setting_value, description, is_public) VALUES
('moderation_guidelines', '{"version": "1.0", "guidelines": ["Be respectful", "No spam", "No harassment", "No misinformation"]}', 'Community moderation guidelines', true),
('response_time_target', '{"hours": 24}', 'Target response time for reports', true),
('escalation_threshold', '{"reports": 3}', 'Number of reports before escalation', false),
('auto_moderation', '{"enabled": false, "rules": []}', 'Automatic moderation rules', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_community_reports_updated_at 
    BEFORE UPDATE ON community_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_moderation_settings_updated_at 
    BEFORE UPDATE ON community_moderation_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to log moderation actions
CREATE OR REPLACE FUNCTION log_moderation_action()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the action in transparency logs
    INSERT INTO moderation_transparency_logs (
        action_type,
        content_type,
        content_id,
        reason,
        action_taken,
        community_impact
    ) VALUES (
        CASE 
            WHEN NEW.status = 'resolved' THEN 'report_resolved'
            WHEN NEW.status = 'dismissed' THEN 'report_dismissed'
            ELSE 'report_updated'
        END,
        NEW.content_type,
        NEW.content_id,
        NEW.reason,
        COALESCE(NEW.action_taken, 'Status updated to ' || NEW.status),
        CASE 
            WHEN NEW.status = 'resolved' THEN 'positive'
            WHEN NEW.status = 'dismissed' THEN 'neutral'
            ELSE 'neutral'
        END
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to log moderation actions
CREATE TRIGGER log_community_report_actions
    AFTER UPDATE ON community_reports
    FOR EACH ROW 
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION log_moderation_action();
