-- Enhance events table with additional fields
ALTER TABLE events ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';
ALTER TABLE events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'cancelled', 'completed'));
ALTER TABLE events ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE events ADD COLUMN IF NOT EXISTS current_attendees INTEGER DEFAULT 0;

-- Create event attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'attending' CHECK (status IN ('attending', 'maybe', 'not_attending')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create event discussions table
CREATE TABLE IF NOT EXISTS event_discussions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES event_discussions(id) ON DELETE CASCADE,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event likes table
CREATE TABLE IF NOT EXISTS event_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create event shares table
CREATE TABLE IF NOT EXISTS event_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_price ON events(price);
CREATE INDEX IF NOT EXISTS idx_events_current_attendees ON events(current_attendees);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_status ON event_attendees(status);
CREATE INDEX IF NOT EXISTS idx_event_discussions_event_id ON event_discussions(event_id);
CREATE INDEX IF NOT EXISTS idx_event_discussions_user_id ON event_discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_event_discussions_parent_comment_id ON event_discussions(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_event_likes_event_id ON event_likes(event_id);
CREATE INDEX IF NOT EXISTS idx_event_likes_user_id ON event_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_event_shares_event_id ON event_shares(event_id);
CREATE INDEX IF NOT EXISTS idx_event_shares_user_id ON event_shares(user_id);

-- Enable RLS
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_attendees
CREATE POLICY "Anyone can view event attendees" ON event_attendees
  FOR SELECT USING (true);

CREATE POLICY "Users can join events" ON event_attendees
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attendance" ON event_attendees
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave events" ON event_attendees
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for event_discussions
CREATE POLICY "Anyone can view event discussions" ON event_discussions
  FOR SELECT USING (true);

CREATE POLICY "Users can create event discussions" ON event_discussions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own discussions" ON event_discussions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own discussions" ON event_discussions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for event_likes
CREATE POLICY "Anyone can view event likes" ON event_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like events" ON event_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike events" ON event_likes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for event_shares
CREATE POLICY "Anyone can view event shares" ON event_shares
  FOR SELECT USING (true);

CREATE POLICY "Users can share events" ON event_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unshare events" ON event_shares
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update event attendee count
CREATE OR REPLACE FUNCTION update_event_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update current_attendees count for the event
  UPDATE events 
  SET current_attendees = (
    SELECT COUNT(*) 
    FROM event_attendees 
    WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
    AND status = 'attending'
  )
  WHERE id = COALESCE(NEW.event_id, OLD.event_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update attendee count when attendees change
CREATE TRIGGER update_event_attendee_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON event_attendees
  FOR EACH ROW
  EXECUTE FUNCTION update_event_attendee_count();

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_event_discussions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update the updated_at timestamp
CREATE TRIGGER update_event_discussions_updated_at
  BEFORE UPDATE ON event_discussions
  FOR EACH ROW
  EXECUTE FUNCTION update_event_discussions_updated_at();

-- Add comments for documentation
COMMENT ON TABLE event_attendees IS 'Users who are attending, maybe attending, or not attending events';
COMMENT ON TABLE event_discussions IS 'Discussions and comments on events with threading support';
COMMENT ON TABLE event_likes IS 'Likes on events';
COMMENT ON TABLE event_shares IS 'Shares of events';
COMMENT ON COLUMN events.price IS 'Event price in paise (Indian currency smallest unit)';
COMMENT ON COLUMN events.current_attendees IS 'Current number of attendees (automatically updated)';
COMMENT ON COLUMN events.tags IS 'Array of tags for categorizing events';
COMMENT ON COLUMN events.status IS 'Event status: draft, published, cancelled, or completed';
COMMENT ON COLUMN event_discussions.is_anonymous IS 'Whether the discussion was posted anonymously';
COMMENT ON COLUMN event_attendees.status IS 'Attendance status: attending, maybe, or not_attending';
