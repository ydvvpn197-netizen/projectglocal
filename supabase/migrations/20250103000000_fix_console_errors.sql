-- Migration: Fix Console Errors and Missing Tables
-- Date: 2025-01-03
-- Description: Fix notification subscription errors, 404/400 errors, and database relationship issues

-- 1. Create general_notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.general_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('announcement', 'event', 'community', 'system')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  target_audience TEXT CHECK (target_audience IN ('all', 'new_users', 'existing_users')),
  action_url TEXT,
  action_text TEXT
);

-- 2. Create personal_notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.personal_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'booking_request', 'booking_accepted', 'booking_declined', 
    'message_request', 'new_follower', 'event_reminder', 
    'event_update', 'event_created', 'event_updated', 'event_cancelled',
    'poll_result', 'review_reply', 'group_invite', 'discussion_request',
    'discussion_approved', 'discussion_rejected', 'payment_received',
    'payment_failed', 'system_announcement'
  )),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data JSONB,
  action_url TEXT,
  action_text TEXT
);

-- 3. Ensure artist_bookings table exists with proper structure
CREATE TABLE IF NOT EXISTS public.artist_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_location TEXT NOT NULL,
  event_description TEXT NOT NULL,
  budget_min DECIMAL(10,2) NOT NULL,
  budget_max DECIMAL(10,2),
  contact_info TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Ensure chat_conversations table exists with proper structure
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.artist_bookings(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Ensure chat_messages table exists with proper structure
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Enable RLS on all tables
ALTER TABLE public.general_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for general_notifications
DROP POLICY IF EXISTS "Anyone can view active general notifications" ON public.general_notifications;
CREATE POLICY "Anyone can view active general notifications" ON public.general_notifications
  FOR SELECT USING (is_active = true);

-- 8. Create RLS policies for personal_notifications
DROP POLICY IF EXISTS "Users can view their own personal notifications" ON public.personal_notifications;
DROP POLICY IF EXISTS "Users can update their own personal notifications" ON public.personal_notifications;
DROP POLICY IF EXISTS "Users can insert their own personal notifications" ON public.personal_notifications;
DROP POLICY IF EXISTS "Users can create notifications for others" ON public.personal_notifications;

CREATE POLICY "Users can view their own personal notifications" ON public.personal_notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own personal notifications" ON public.personal_notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own personal notifications" ON public.personal_notifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can create notifications for others" ON public.personal_notifications
  FOR INSERT WITH CHECK (true);

-- 9. Create RLS policies for artist_bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.artist_bookings;
DROP POLICY IF EXISTS "Artists can view bookings for them" ON public.artist_bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.artist_bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.artist_bookings;
DROP POLICY IF EXISTS "Artists can update bookings for them" ON public.artist_bookings;

CREATE POLICY "Users can view their own bookings" ON public.artist_bookings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Artists can view bookings for them" ON public.artist_bookings
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.artists WHERE artists.user_id = auth.uid() AND artists.id = artist_bookings.artist_id));

CREATE POLICY "Users can create bookings" ON public.artist_bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own bookings" ON public.artist_bookings
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Artists can update bookings for them" ON public.artist_bookings
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.artists WHERE artists.user_id = auth.uid() AND artists.id = artist_bookings.artist_id));

-- 10. Create RLS policies for chat_conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Artists can create conversations" ON public.chat_conversations;

CREATE POLICY "Users can view their own conversations" ON public.chat_conversations
  FOR SELECT USING (client_id = auth.uid() OR artist_id = auth.uid());

CREATE POLICY "Users can create conversations" ON public.chat_conversations
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Artists can create conversations" ON public.chat_conversations
  FOR INSERT WITH CHECK (artist_id = auth.uid());

-- 11. Create RLS policies for chat_messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.chat_messages;

CREATE POLICY "Users can view messages in their conversations" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations 
      WHERE chat_conversations.id = chat_messages.conversation_id 
      AND (chat_conversations.client_id = auth.uid() OR chat_conversations.artist_id = auth.uid())
    )
  );

CREATE POLICY "Users can create messages in their conversations" ON public.chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.chat_conversations 
      WHERE chat_conversations.id = chat_messages.conversation_id 
      AND (chat_conversations.client_id = auth.uid() OR chat_conversations.artist_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages" ON public.chat_messages
  FOR UPDATE USING (sender_id = auth.uid());

-- 12. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_personal_notifications_user_id ON public.personal_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_notifications_read ON public.personal_notifications(read);
CREATE INDEX IF NOT EXISTS idx_general_notifications_active ON public.general_notifications(is_active);
CREATE INDEX IF NOT EXISTS idx_artist_bookings_user_id ON public.artist_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_bookings_artist_id ON public.artist_bookings(artist_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_client_id ON public.chat_conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_artist_id ON public.chat_conversations(artist_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);

-- 13. Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_artist_bookings_updated_at ON public.artist_bookings;
CREATE TRIGGER update_artist_bookings_updated_at
    BEFORE UPDATE ON public.artist_bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_conversations_updated_at ON public.chat_conversations;
CREATE TRIGGER update_chat_conversations_updated_at
    BEFORE UPDATE ON public.chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON public.chat_messages;
CREATE TRIGGER update_chat_messages_updated_at
    BEFORE UPDATE ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
