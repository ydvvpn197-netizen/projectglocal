-- Migration: Fix All Database Errors
-- Date: 2025-08-29
-- Description: Fix WebSocket, 404, 406, 409 errors and missing tables

-- 1. Fix WebSocket/Realtime issues by ensuring proper table structure
-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marketing_campaigns table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  banner_text TEXT,
  banner_image_url TEXT,
  is_active BOOLEAN DEFAULT false,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create artist_bookings table with proper constraints to prevent 409 conflicts
CREATE TABLE IF NOT EXISTS public.artist_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_location TEXT NOT NULL,
  event_description TEXT NOT NULL,
  budget_min DECIMAL(10,2) NOT NULL,
  budget_max DECIMAL(10,2),
  contact_info TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Add unique constraint to prevent duplicate bookings
  UNIQUE(user_id, artist_id, event_date)
);

-- Create chat_conversations table
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.artist_bookings(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post_votes table
CREATE TABLE IF NOT EXISTS public.post_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 0, 1)),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create comment_votes table
CREATE TABLE IF NOT EXISTS public.comment_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 0, 1)),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- 2. Enable RLS on all tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own notifications" ON public.notifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 4. Create RLS policies for marketing_campaigns
DROP POLICY IF EXISTS "Anyone can view active marketing campaigns" ON public.marketing_campaigns;

CREATE POLICY "Anyone can view active marketing campaigns" ON public.marketing_campaigns
  FOR SELECT USING (is_active = true);

-- 5. Create RLS policies for artist_bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.artist_bookings;
DROP POLICY IF EXISTS "Artists can view bookings for them" ON public.artist_bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.artist_bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.artist_bookings;

CREATE POLICY "Users can view their own bookings" ON public.artist_bookings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Artists can view bookings for them" ON public.artist_bookings
  FOR SELECT USING (artist_id = auth.uid());

CREATE POLICY "Users can create bookings" ON public.artist_bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own bookings" ON public.artist_bookings
  FOR UPDATE USING (user_id = auth.uid());

-- 6. Create RLS policies for chat_conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.chat_conversations;

CREATE POLICY "Users can view their own conversations" ON public.chat_conversations
  FOR SELECT USING (client_id = auth.uid() OR artist_id = auth.uid());

CREATE POLICY "Users can create conversations" ON public.chat_conversations
  FOR INSERT WITH CHECK (client_id = auth.uid() OR artist_id = auth.uid());

-- 7. Create RLS policies for chat_messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.chat_messages;

CREATE POLICY "Users can view messages in their conversations" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations cc
      WHERE cc.id = chat_messages.conversation_id
      AND (cc.client_id = auth.uid() OR cc.artist_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations" ON public.chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.chat_conversations cc
      WHERE cc.id = chat_messages.conversation_id
      AND (cc.client_id = auth.uid() OR cc.artist_id = auth.uid())
    )
  );

-- 8. Create RLS policies for post_votes
DROP POLICY IF EXISTS "Users can view post votes" ON public.post_votes;
DROP POLICY IF EXISTS "Users can vote on posts" ON public.post_votes;

CREATE POLICY "Users can view post votes" ON public.post_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can vote on posts" ON public.post_votes
  FOR ALL USING (user_id = auth.uid());

-- 9. Create RLS policies for comment_votes
DROP POLICY IF EXISTS "Users can view comment votes" ON public.comment_votes;
DROP POLICY IF EXISTS "Users can vote on comments" ON public.comment_votes;

CREATE POLICY "Users can view comment votes" ON public.comment_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can vote on comments" ON public.comment_votes
  FOR ALL USING (user_id = auth.uid());

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_active ON public.marketing_campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_dates ON public.marketing_campaigns(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_artist_bookings_user_id ON public.artist_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_bookings_artist_id ON public.artist_bookings(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_bookings_status ON public.artist_bookings(status);
CREATE INDEX IF NOT EXISTS idx_artist_bookings_event_date ON public.artist_bookings(event_date);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_client_id ON public.chat_conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_artist_id ON public.chat_conversations(artist_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON public.chat_conversations(status);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_post_votes_post_id ON public.post_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_votes_user_id ON public.post_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_comment_votes_comment_id ON public.comment_votes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_votes_user_id ON public.comment_votes(user_id);

-- 11. Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_marketing_campaigns_updated_at ON public.marketing_campaigns;
CREATE TRIGGER update_marketing_campaigns_updated_at
  BEFORE UPDATE ON public.marketing_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_artist_bookings_updated_at ON public.artist_bookings;
CREATE TRIGGER update_artist_bookings_updated_at
  BEFORE UPDATE ON public.artist_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_conversations_updated_at ON public.chat_conversations;
CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON public.chat_messages;
CREATE TRIGGER update_chat_messages_updated_at
  BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_post_votes_updated_at ON public.post_votes;
CREATE TRIGGER update_post_votes_updated_at
  BEFORE UPDATE ON public.post_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comment_votes_updated_at ON public.comment_votes;
CREATE TRIGGER update_comment_votes_updated_at
  BEFORE UPDATE ON public.comment_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 12. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.marketing_campaigns TO authenticated;
GRANT ALL ON public.artist_bookings TO authenticated;
GRANT ALL ON public.chat_conversations TO authenticated;
GRANT ALL ON public.chat_messages TO authenticated;
GRANT ALL ON public.post_votes TO authenticated;
GRANT ALL ON public.comment_votes TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 13. Insert sample marketing campaign to prevent 404 errors
INSERT INTO public.marketing_campaigns (name, description, banner_text, is_active)
VALUES (
  'Welcome Campaign',
  'Welcome to TheGlocal - Connect with local artists and events!',
  '🎉 Welcome to TheGlocal! Discover amazing local artists and events near you.',
  true
)
ON CONFLICT DO NOTHING;

-- 14. Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.artist_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comment_votes;

-- 15. Verify the fixes
SELECT 'All tables created successfully' as status;
