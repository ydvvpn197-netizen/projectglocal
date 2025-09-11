-- Create Privacy Settings Migration
-- This migration adds tables for user privacy settings

-- User Privacy Settings Table
CREATE TABLE IF NOT EXISTS user_privacy_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_privacy_settings_user_id ON user_privacy_settings(user_id);

-- Create updated_at trigger
CREATE TRIGGER update_user_privacy_settings_updated_at 
    BEFORE UPDATE ON user_privacy_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_privacy_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- User Privacy Settings - Users can view and update their own settings
CREATE POLICY "Users can view their own privacy settings" ON user_privacy_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own privacy settings" ON user_privacy_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own privacy settings" ON user_privacy_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own privacy settings" ON user_privacy_settings
    FOR DELETE USING (auth.uid() = user_id);
