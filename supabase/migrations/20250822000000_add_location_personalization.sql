-- Migration: Add Location-Based Personalization
-- Date: 2025-08-22
-- Description: Add location tracking and personalization features

-- Add location columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS location_name TEXT,
ADD COLUMN IF NOT EXISTS location_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS location_auto_detect BOOLEAN DEFAULT true;

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    location_radius_km INTEGER DEFAULT 50,
    location_categories TEXT[] DEFAULT '{}',
    location_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create content_location table for tagging content with location
CREATE TABLE IF NOT EXISTS content_location (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_type TEXT NOT NULL, -- 'post', 'event', 'review', 'poll', 'artist'
    content_id UUID NOT NULL,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_name TEXT,
    location_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location_lat, location_lng) WHERE location_enabled = true;
CREATE INDEX IF NOT EXISTS idx_content_location_coords ON content_location(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_content_location_type_id ON content_location(content_type, content_id);

-- Add RLS policies for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON user_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for content_location
ALTER TABLE content_location ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view content locations" ON content_location
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert content locations" ON content_location
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Content owners can update content locations" ON content_location
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM posts WHERE id = content_id AND user_id = auth.uid()
            UNION ALL
            SELECT 1 FROM events WHERE id = content_id AND organizer_id = auth.uid()
            UNION ALL
            SELECT 1 FROM reviews WHERE id = content_id AND user_id = auth.uid()
            UNION ALL
            SELECT 1 FROM polls WHERE id = content_id AND user_id = auth.uid()
            UNION ALL
            SELECT 1 FROM artists WHERE id = content_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Content owners can delete content locations" ON content_location
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM posts WHERE id = content_id AND user_id = auth.uid()
            UNION ALL
            SELECT 1 FROM events WHERE id = content_id AND organizer_id = auth.uid()
            UNION ALL
            SELECT 1 FROM reviews WHERE id = content_id AND user_id = auth.uid()
            UNION ALL
            SELECT 1 FROM polls WHERE id = content_id AND user_id = auth.uid()
            UNION ALL
            SELECT 1 FROM artists WHERE id = content_id AND user_id = auth.uid()
        )
    );

-- Create function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL,
    lng1 DECIMAL,
    lat2 DECIMAL,
    lng2 DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    RETURN (
        6371 * acos(
            cos(radians(lat1)) * cos(radians(lat2)) * 
            cos(radians(lng2) - radians(lng1)) + 
            sin(radians(lat1)) * sin(radians(lat2))
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to get nearby content
CREATE OR REPLACE FUNCTION get_nearby_content(
    user_lat DECIMAL,
    user_lng DECIMAL,
    radius_km INTEGER DEFAULT 50,
    content_type_filter TEXT DEFAULT NULL
) RETURNS TABLE (
    content_type TEXT,
    content_id UUID,
    distance_km DECIMAL,
    location_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cl.content_type,
        cl.content_id,
        calculate_distance(user_lat, user_lng, cl.location_lat, cl.location_lng) as distance_km,
        cl.location_name
    FROM content_location cl
    WHERE cl.location_lat IS NOT NULL 
        AND cl.location_lng IS NOT NULL
        AND calculate_distance(user_lat, user_lng, cl.location_lat, cl.location_lng) <= radius_km
        AND (content_type_filter IS NULL OR cl.content_type = content_type_filter)
    ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to update user location
CREATE OR REPLACE FUNCTION update_user_location(
    p_user_id UUID,
    p_lat DECIMAL,
    p_lng DECIMAL,
    p_location_name TEXT DEFAULT NULL,
    p_auto_detect BOOLEAN DEFAULT true
) RETURNS VOID AS $$
BEGIN
    UPDATE profiles 
    SET 
        location_lat = p_lat,
        location_lng = p_lng,
        location_name = COALESCE(p_location_name, location_name),
        location_enabled = true,
        location_auto_detect = p_auto_detect,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Insert or update user preferences if they don't exist
    INSERT INTO user_preferences (user_id, location_radius_km, location_notifications)
    VALUES (p_user_id, 50, true)
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_location_updated_at
    BEFORE UPDATE ON content_location
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update delete_user_account function to include new tables
CREATE OR REPLACE FUNCTION delete_user_account(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Delete from new tables
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
    
    -- Continue with existing deletions...
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
