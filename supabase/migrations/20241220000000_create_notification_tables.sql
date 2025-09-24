-- Create general_notifications table for non-logged-in users
CREATE TABLE IF NOT EXISTS general_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('announcement', 'event', 'community', 'system')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  target_audience TEXT CHECK (target_audience IN ('all', 'new_users', 'existing_users')),
  action_url TEXT,
  action_text TEXT,
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create personal_notifications table for logged-in users
CREATE TABLE IF NOT EXISTS personal_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'booking_request', 'booking_accepted', 'booking_declined', 
    'message_request', 'new_follower', 'event_reminder', 
    'event_update', 'event_created', 'event_updated', 'event_cancelled',
    'poll_result', 'review_reply', 'group_invite', 
    'discussion_request', 'discussion_approved', 'discussion_rejected',
    'payment_received', 'payment_failed', 'system_announcement'
  )),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB,
  action_url TEXT,
  action_text TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_general_notifications_active ON general_notifications(is_active, created_at);
CREATE INDEX IF NOT EXISTS idx_general_notifications_expires ON general_notifications(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_general_notifications_priority ON general_notifications(priority, created_at);
CREATE INDEX IF NOT EXISTS idx_general_notifications_type ON general_notifications(type, created_at);

CREATE INDEX IF NOT EXISTS idx_personal_notifications_user_id ON personal_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_notifications_read ON personal_notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_personal_notifications_created_at ON personal_notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_personal_notifications_type ON personal_notifications(user_id, type, created_at DESC);

-- Create RLS policies for general_notifications (read-only for all users)
ALTER TABLE general_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "General notifications are viewable by everyone" ON general_notifications
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "General notifications can be created by authenticated users" ON general_notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "General notifications can be updated by creator or admin" ON general_notifications
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for personal_notifications
ALTER TABLE personal_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON personal_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" ON personal_notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON personal_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON personal_notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for general_notifications
CREATE TRIGGER update_general_notifications_updated_at 
  BEFORE UPDATE ON general_notifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample general notifications
INSERT INTO general_notifications (title, message, type, priority, target_audience, action_url, action_text) VALUES
(
  'Welcome to The Glocal! 🎉',
  'Join our community to discover amazing local events, connect with artists, and build meaningful relationships with your neighbors.',
  'announcement',
  'high',
  'all',
  '/signin',
  'Get Started'
),
(
  'New Feature: Artist Booking System',
  'You can now book local artists directly through our platform. Support local talent and make your events unforgettable!',
  'system',
  'medium',
  'all',
  '/book-artist',
  'Book an Artist'
),
(
  'Community Guidelines Updated',
  'We''ve updated our community guidelines to ensure a safe and welcoming environment for everyone.',
  'system',
  'low',
  'existing_users',
  '/community-guidelines',
  'Read Guidelines'
),
(
  'Holiday Event Special',
  'Discover amazing holiday events in your area. From music performances to community gatherings, there''s something for everyone!',
  'event',
  'medium',
  'all',
  '/events',
  'Browse Events'
);

-- Create function to create personal notification
CREATE OR REPLACE FUNCTION create_personal_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_data JSONB DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_action_text TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO personal_notifications (
    user_id, title, message, type, data, action_url, action_text
  ) VALUES (
    p_user_id, p_title, p_message, p_type, p_data, p_action_url, p_action_text
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON general_notifications TO authenticated;
GRANT ALL ON personal_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION create_personal_notification TO authenticated;
