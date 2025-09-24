-- Fix booking constraints and RLS policies
-- Add missing RLS policy for artists to update bookings

-- Add policy for artists to update bookings for them
DROP POLICY IF EXISTS "Artists can update bookings for them" ON public.artist_bookings;

CREATE POLICY "Artists can update bookings for them" ON public.artist_bookings
  FOR UPDATE USING (artist_id = auth.uid());

-- Add policy for artists to create chat conversations
DROP POLICY IF EXISTS "Artists can create conversations" ON public.chat_conversations;

CREATE POLICY "Artists can create conversations" ON public.chat_conversations
  FOR INSERT WITH CHECK (artist_id = auth.uid());

-- Add policy for users to create notifications
DROP POLICY IF EXISTS "Users can create notifications for others" ON public.notifications;

CREATE POLICY "Users can create notifications for others" ON public.notifications
  FOR INSERT WITH CHECK (true);
