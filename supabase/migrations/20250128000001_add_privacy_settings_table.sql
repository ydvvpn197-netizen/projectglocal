-- Create user privacy settings table for anonymous engagement and privacy controls
CREATE TABLE IF NOT EXISTS user_privacy_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Anonymous engagement settings
  allow_anonymous_posts BOOLEAN DEFAULT true,
  allow_anonymous_comments BOOLEAN DEFAULT true,
  allow_anonymous_votes BOOLEAN DEFAULT true,
  allow_anonymous_messaging BOOLEAN DEFAULT false,
  
  -- Username visibility settings
  show_username_in_posts BOOLEAN DEFAULT true,
  show_username_in_comments BOOLEAN DEFAULT true,
  show_username_in_votes BOOLEAN DEFAULT true,
  
  -- Profile visibility settings
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  location_sharing TEXT DEFAULT 'friends' CHECK (location_sharing IN ('public', 'friends', 'private')),
  activity_status TEXT DEFAULT 'public' CHECK (activity_status IN ('public', 'friends', 'private')),
  
  -- Additional privacy settings
  allow_friend_requests BOOLEAN DEFAULT true,
  allow_event_invites BOOLEAN DEFAULT true,
  allow_service_requests BOOLEAN DEFAULT true,
  show_online_status BOOLEAN DEFAULT true,
  show_last_seen BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one settings record per user
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_privacy_settings_user_id ON user_privacy_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_privacy_settings_profile_visibility ON user_privacy_settings(profile_visibility);
CREATE INDEX IF NOT EXISTS idx_user_privacy_settings_location_sharing ON user_privacy_settings(location_sharing);

-- Enable RLS
ALTER TABLE user_privacy_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own privacy settings" ON user_privacy_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own privacy settings" ON user_privacy_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own privacy settings" ON user_privacy_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to automatically create privacy settings for new users
CREATE OR REPLACE FUNCTION create_default_privacy_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_privacy_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default privacy settings when a user signs up
CREATE TRIGGER create_user_privacy_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_privacy_settings();

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_privacy_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update the updated_at timestamp
CREATE TRIGGER update_privacy_settings_updated_at
  BEFORE UPDATE ON user_privacy_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_privacy_settings_updated_at();

-- Add comments for documentation
COMMENT ON TABLE user_privacy_settings IS 'User privacy settings for anonymous engagement and profile visibility controls';
COMMENT ON COLUMN user_privacy_settings.allow_anonymous_posts IS 'Allow user to create posts without revealing identity';
COMMENT ON COLUMN user_privacy_settings.allow_anonymous_comments IS 'Allow user to comment without revealing identity';
COMMENT ON COLUMN user_privacy_settings.allow_anonymous_votes IS 'Allow user to vote without revealing identity';
COMMENT ON COLUMN user_privacy_settings.profile_visibility IS 'Profile visibility level: public, friends, or private';
COMMENT ON COLUMN user_privacy_settings.location_sharing IS 'Location sharing level: public, friends, or private';
COMMENT ON COLUMN user_privacy_settings.activity_status IS 'Activity status visibility level: public, friends, or private';
