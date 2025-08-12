-- Create notifications table for artist bookings and other app notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'booking_request', 'booking_accepted', 'booking_rejected', 'message', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional data like booking_id, artist_id, etc.
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (user_id = auth.uid());

-- Create chat conversations table
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL,
  client_id UUID NOT NULL, -- The person who made the booking
  artist_id UUID NOT NULL, -- The artist being booked
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'closed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on chat conversations
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Users can view conversations they are part of
CREATE POLICY "Users can view their own conversations" 
ON public.chat_conversations 
FOR SELECT 
USING (client_id = auth.uid() OR artist_id = auth.uid());

-- Users can create conversations for their bookings
CREATE POLICY "Users can create conversations for their bookings" 
ON public.chat_conversations 
FOR INSERT 
WITH CHECK (client_id = auth.uid() OR artist_id = auth.uid());

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'image', 'file'
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on chat messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages in conversations they are part of
CREATE POLICY "Users can view messages in their conversations" 
ON public.chat_messages 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.chat_conversations cc 
  WHERE cc.id = conversation_id 
  AND (cc.client_id = auth.uid() OR cc.artist_id = auth.uid())
));

-- Users can send messages in conversations they are part of
CREATE POLICY "Users can send messages in their conversations" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.chat_conversations cc 
    WHERE cc.id = conversation_id 
    AND (cc.client_id = auth.uid() OR cc.artist_id = auth.uid())
  )
);

-- Add artist skills to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS artist_skills TEXT[],
ADD COLUMN IF NOT EXISTS hourly_rate_min NUMERIC,
ADD COLUMN IF NOT EXISTS hourly_rate_max NUMERIC,
ADD COLUMN IF NOT EXISTS portfolio_urls TEXT[],
ADD COLUMN IF NOT EXISTS availability_schedule JSONB;

-- Create trigger for updating timestamps
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();