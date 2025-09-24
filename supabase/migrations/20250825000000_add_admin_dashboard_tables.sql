-- Migration: Add Admin Dashboard Tables and Functions
-- Date: 2025-08-25
-- Description: Implement comprehensive admin dashboard infrastructure

-- Create admin_roles table
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES admin_roles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret TEXT,
    ip_whitelist TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create admin_actions table for audit trail
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    action_data JSONB,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content_reports table
CREATE TABLE IF NOT EXISTS content_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content_type TEXT NOT NULL, -- 'post', 'event', 'review', 'comment', 'artist'
    content_id UUID NOT NULL,
    report_reason TEXT NOT NULL,
    report_details TEXT,
    report_status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
    reviewed_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create platform_analytics table
CREATE TABLE IF NOT EXISTS platform_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, metric_name)
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    setting_type TEXT NOT NULL, -- 'string', 'number', 'boolean', 'json', 'array'
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role_id ON admin_users(role_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_user_id ON admin_actions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_content_reports_content_type_id ON content_reports(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(report_status);
CREATE INDEX IF NOT EXISTS idx_content_reports_created_at ON content_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_date ON platform_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_metric_name ON platform_analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- Enable RLS on all tables
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_roles
CREATE POLICY "Admin users can view roles" ON admin_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Super admins can manage roles" ON admin_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            JOIN admin_roles ar ON au.role_id = ar.id
            WHERE au.user_id = auth.uid() 
            AND au.is_active = true
            AND ar.name = 'super_admin'
        )
    );

-- RLS Policies for admin_users
CREATE POLICY "Admin users can view other admins" ON admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can view their own admin profile" ON admin_users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage admin users" ON admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            JOIN admin_roles ar ON au.role_id = ar.id
            WHERE au.user_id = auth.uid() 
            AND au.is_active = true
            AND ar.name = 'super_admin'
        )
    );

-- RLS Policies for admin_actions
CREATE POLICY "Admin users can view actions" ON admin_actions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admin users can insert their own actions" ON admin_actions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- RLS Policies for content_reports
CREATE POLICY "Users can view their own reports" ON content_reports
    FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can insert reports" ON content_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admin users can view all reports" ON content_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admin users can update reports" ON content_reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- RLS Policies for platform_analytics
CREATE POLICY "Admin users can view analytics" ON platform_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admin users can manage analytics" ON platform_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- RLS Policies for system_settings
CREATE POLICY "Public settings are viewable by all" ON system_settings
    FOR SELECT USING (is_public = true);

CREATE POLICY "Admin users can view all settings" ON system_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Super admins can manage settings" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            JOIN admin_roles ar ON au.role_id = ar.id
            WHERE au.user_id = auth.uid() 
            AND au.is_active = true
            AND ar.name = 'super_admin'
        )
    );

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_admin_roles_updated_at
    BEFORE UPDATE ON admin_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_reports_updated_at
    BEFORE UPDATE ON content_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to check admin permissions
CREATE OR REPLACE FUNCTION check_admin_permission(
    required_permission TEXT,
    user_uuid UUID DEFAULT auth.uid()
) RETURNS BOOLEAN AS $$
DECLARE
    user_permissions JSONB;
BEGIN
    SELECT ar.permissions INTO user_permissions
    FROM admin_users au
    JOIN admin_roles ar ON au.role_id = ar.id
    WHERE au.user_id = user_uuid AND au.is_active = true;
    
    IF user_permissions IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN user_permissions ? required_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
    action_type TEXT,
    resource_type TEXT,
    resource_id TEXT DEFAULT NULL,
    action_data JSONB DEFAULT NULL,
    success BOOLEAN DEFAULT true,
    error_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    admin_user_id UUID;
    action_id UUID;
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id
    FROM admin_users
    WHERE user_id = auth.uid() AND is_active = true;
    
    -- Insert action log
    INSERT INTO admin_actions (
        admin_user_id,
        action_type,
        resource_type,
        resource_id,
        action_data,
        ip_address,
        user_agent,
        success,
        error_message
    ) VALUES (
        admin_user_id,
        action_type,
        resource_type,
        resource_id,
        action_data,
        inet_client_addr(),
        current_setting('request.headers')::json->>'user-agent',
        success,
        error_message
    ) RETURNING id INTO action_id;
    
    RETURN action_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user analytics
CREATE OR REPLACE FUNCTION get_user_analytics(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
    date DATE,
    new_users INTEGER,
    active_users INTEGER,
    total_users INTEGER,
    user_engagement_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.date,
        COALESCE(nu.new_users, 0) as new_users,
        COALESCE(au.active_users, 0) as active_users,
        COALESCE(tu.total_users, 0) as total_users,
        CASE 
            WHEN tu.total_users > 0 THEN 
                ROUND((au.active_users::NUMERIC / tu.total_users) * 100, 2)
            ELSE 0 
        END as user_engagement_rate
    FROM generate_series(start_date, end_date, '1 day'::interval) d(date)
    LEFT JOIN (
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as new_users
        FROM profiles
        WHERE created_at >= start_date AND created_at <= end_date
        GROUP BY DATE(created_at)
    ) nu ON d.date = nu.date
    LEFT JOIN (
        SELECT 
            DATE(created_at) as date,
            COUNT(DISTINCT user_id) as active_users
        FROM (
            SELECT user_id, created_at FROM posts WHERE created_at >= start_date AND created_at <= end_date
            UNION ALL
            SELECT user_id, created_at FROM events WHERE created_at >= start_date AND created_at <= end_date
            UNION ALL
            SELECT user_id, created_at FROM reviews WHERE created_at >= start_date AND created_at <= end_date
        ) activity
        GROUP BY DATE(created_at)
    ) au ON d.date = au.date
    LEFT JOIN (
        SELECT 
            d.date,
            COUNT(*) as total_users
        FROM generate_series(start_date, end_date, '1 day'::interval) d(date)
        CROSS JOIN LATERAL (
            SELECT COUNT(*) as count
            FROM profiles
            WHERE created_at <= d.date
        ) p
        GROUP BY d.date
    ) tu ON d.date = tu.date
    ORDER BY d.date;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get content analytics
CREATE OR REPLACE FUNCTION get_content_analytics(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
    date DATE,
    content_type TEXT,
    new_content INTEGER,
    total_content INTEGER,
    engagement_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.date,
        ct.content_type,
        COALESCE(nc.new_content, 0) as new_content,
        COALESCE(tc.total_content, 0) as total_content,
        COALESCE(er.engagement_rate, 0) as engagement_rate
    FROM generate_series(start_date, end_date, '1 day'::interval) d(date)
    CROSS JOIN (VALUES ('posts'), ('events'), ('reviews'), ('artists')) ct(content_type)
    LEFT JOIN (
        SELECT 
            DATE(created_at) as date,
            'posts' as content_type,
            COUNT(*) as new_content
        FROM posts
        WHERE created_at >= start_date AND created_at <= end_date
        GROUP BY DATE(created_at)
        UNION ALL
        SELECT 
            DATE(created_at) as date,
            'events' as content_type,
            COUNT(*) as new_content
        FROM events
        WHERE created_at >= start_date AND created_at <= end_date
        GROUP BY DATE(created_at)
        UNION ALL
        SELECT 
            DATE(created_at) as date,
            'reviews' as content_type,
            COUNT(*) as new_content
        FROM reviews
        WHERE created_at >= start_date AND created_at <= end_date
        GROUP BY DATE(created_at)
        UNION ALL
        SELECT 
            DATE(created_at) as date,
            'artists' as content_type,
            COUNT(*) as new_content
        FROM artists
        WHERE created_at >= start_date AND created_at <= end_date
        GROUP BY DATE(created_at)
    ) nc ON d.date = nc.date AND ct.content_type = nc.content_type
    LEFT JOIN (
        SELECT 
            d.date,
            'posts' as content_type,
            COUNT(*) as total_content
        FROM generate_series(start_date, end_date, '1 day'::interval) d(date)
        CROSS JOIN LATERAL (
            SELECT COUNT(*) as count
            FROM posts
            WHERE created_at <= d.date
        ) p
        GROUP BY d.date
        UNION ALL
        SELECT 
            d.date,
            'events' as content_type,
            COUNT(*) as total_content
        FROM generate_series(start_date, end_date, '1 day'::interval) d(date)
        CROSS JOIN LATERAL (
            SELECT COUNT(*) as count
            FROM events
            WHERE created_at <= d.date
        ) e
        GROUP BY d.date
        UNION ALL
        SELECT 
            d.date,
            'reviews' as content_type,
            COUNT(*) as total_content
        FROM generate_series(start_date, end_date, '1 day'::interval) d(date)
        CROSS JOIN LATERAL (
            SELECT COUNT(*) as count
            FROM reviews
            WHERE created_at <= d.date
        ) r
        GROUP BY d.date
        UNION ALL
        SELECT 
            d.date,
            'artists' as content_type,
            COUNT(*) as total_content
        FROM generate_series(start_date, end_date, '1 day'::interval) d(date)
        CROSS JOIN LATERAL (
            SELECT COUNT(*) as count
            FROM artists
            WHERE created_at <= d.date
        ) a
        GROUP BY d.date
    ) tc ON d.date = tc.date AND ct.content_type = tc.content_type
    LEFT JOIN (
        SELECT 
            DATE(created_at) as date,
            'posts' as content_type,
            ROUND(AVG(COALESCE(like_count, 0) + COALESCE(comment_count, 0)), 2) as engagement_rate
        FROM posts
        WHERE created_at >= start_date AND created_at <= end_date
        GROUP BY DATE(created_at)
        UNION ALL
        SELECT 
            DATE(created_at) as date,
            'events' as content_type,
            ROUND(AVG(COALESCE(attendee_count, 0)), 2) as engagement_rate
        FROM events
        WHERE created_at >= start_date AND created_at <= end_date
        GROUP BY DATE(created_at)
        UNION ALL
        SELECT 
            DATE(created_at) as date,
            'reviews' as content_type,
            ROUND(AVG(COALESCE(rating, 0)), 2) as engagement_rate
        FROM reviews
        WHERE created_at >= start_date AND created_at <= end_date
        GROUP BY DATE(created_at)
        UNION ALL
        SELECT 
            DATE(created_at) as date,
            'artists' as content_type,
            ROUND(AVG(COALESCE(booking_count, 0)), 2) as engagement_rate
        FROM artists
        WHERE created_at >= start_date AND created_at <= end_date
        GROUP BY DATE(created_at)
    ) er ON d.date = er.date AND ct.content_type = er.content_type
    ORDER BY d.date, ct.content_type;
END;
$$ LANGUAGE plpgsql STABLE;

-- Insert default admin roles
INSERT INTO admin_roles (name, display_name, description, permissions) VALUES
('super_admin', 'Super Administrator', 'Full system access with all permissions', 
 '{"users": ["view", "create", "update", "delete", "suspend", "ban"], 
   "content": ["view", "moderate", "delete", "feature"], 
   "analytics": ["view", "export"], 
   "settings": ["view", "update"], 
   "admin_users": ["view", "create", "update", "delete"], 
   "roles": ["view", "create", "update", "delete"]}'),
('admin', 'Administrator', 'General administration with most permissions', 
 '{"users": ["view", "update", "suspend"], 
   "content": ["view", "moderate", "delete"], 
   "analytics": ["view"], 
   "settings": ["view"]}'),
('moderator', 'Content Moderator', 'Content moderation and user management', 
 '{"users": ["view", "suspend"], 
   "content": ["view", "moderate", "delete"], 
   "analytics": ["view"]}'),
('analyst', 'Analytics Analyst', 'View analytics and reports only', 
 '{"analytics": ["view", "export"]}')
ON CONFLICT (name) DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('platform_name', '"Glocal"', 'string', 'Platform display name', true),
('platform_description', '"Connect with your local community"', 'string', 'Platform description', true),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', false),
('registration_enabled', 'true', 'boolean', 'Allow new user registrations', false),
('email_verification_required', 'true', 'boolean', 'Require email verification for new users', false),
('max_file_size_mb', '10', 'number', 'Maximum file upload size in MB', false),
('allowed_file_types', '["jpg", "jpeg", "png", "gif", "pdf"]', 'array', 'Allowed file types for uploads', false),
('content_moderation_enabled', 'true', 'boolean', 'Enable automatic content moderation', false),
('location_services_enabled', 'true', 'boolean', 'Enable location-based features', false),
('notification_settings', '{"email": true, "push": true, "sms": false}', 'json', 'Default notification settings', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Update the delete_user_account function to include admin tables
CREATE OR REPLACE FUNCTION delete_user_account(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Delete from admin-related tables
    DELETE FROM admin_actions WHERE admin_user_id IN (
        SELECT id FROM admin_users WHERE user_id = user_uuid
    );
    DELETE FROM admin_users WHERE user_id = user_uuid;
    DELETE FROM content_reports WHERE reporter_id = user_uuid;
    
    -- Continue with existing deletions...
    DELETE FROM news_article_comments WHERE user_id = user_uuid;
    DELETE FROM news_article_bookmarks WHERE user_id = user_uuid;
    DELETE FROM news_article_interactions WHERE user_id = user_uuid;
    DELETE FROM user_news_preferences WHERE user_id = user_uuid;
    DELETE FROM user_preferences WHERE user_id = user_uuid;
    DELETE FROM content_location WHERE content_id IN (
        SELECT id FROM posts WHERE user_id = user_uuid
        UNION ALL
        SELECT id FROM events WHERE organizer_id = user_uuid
        UNION ALL
        SELECT id FROM reviews WHERE user_id = user_uuid
        UNION ALL
        SELECT id FROM polls WHERE user_id = user_uuid
        UNION ALL
        SELECT id FROM artists WHERE user_id = user_uuid
    );
    DELETE FROM message_requests WHERE sender_id = user_uuid OR receiver_id = user_uuid;
    DELETE FROM chat_messages WHERE sender_id = user_uuid;
    DELETE FROM chat_conversations WHERE initiator_id = user_uuid OR participant_id = user_uuid;
    DELETE FROM notifications WHERE user_id = user_uuid OR sender_id = user_uuid;
    DELETE FROM artist_bookings WHERE user_id = user_uuid OR artist_id = user_uuid;
    DELETE FROM artists WHERE user_id = user_uuid;
    DELETE FROM posts WHERE user_id = user_uuid;
    DELETE FROM events WHERE organizer_id = user_uuid;
    DELETE FROM reviews WHERE user_id = user_uuid;
    DELETE FROM polls WHERE user_id = user_uuid;
    DELETE FROM profiles WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
