-- Create artist_discussions table for moderated discussions on artist profiles
CREATE TABLE public.artist_discussions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  artist_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  is_pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create artist_discussion_replies table
CREATE TABLE public.artist_discussion_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.artist_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_discussion_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for artist_discussions
CREATE POLICY "Users can create discussion requests on artist profiles" 
ON public.artist_discussions 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view approved discussions and their own pending ones" 
ON public.artist_discussions 
FOR SELECT 
USING (
  status = 'approved' OR 
  user_id = auth.uid() OR 
  artist_id = auth.uid()
);

CREATE POLICY "Artists can update discussions on their profile" 
ON public.artist_discussions 
FOR UPDATE 
USING (artist_id = auth.uid());

CREATE POLICY "Users can delete their own discussions" 
ON public.artist_discussions 
FOR DELETE 
USING (user_id = auth.uid());

-- RLS Policies for artist_discussion_replies
CREATE POLICY "Users can create replies to approved discussions" 
ON public.artist_discussion_replies 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM public.artist_discussions 
    WHERE id = discussion_id AND status = 'approved'
  )
);

CREATE POLICY "Users can view replies to approved discussions" 
ON public.artist_discussion_replies 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.artist_discussions 
    WHERE id = discussion_id AND status = 'approved'
  )
);

CREATE POLICY "Users can update their own replies" 
ON public.artist_discussion_replies 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own replies" 
ON public.artist_discussion_replies 
FOR DELETE 
USING (user_id = auth.uid());

-- Create artist_discussion_moderation_notifications table
CREATE TABLE public.artist_discussion_moderation_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL,
  discussion_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'discussion_request', -- discussion_request, discussion_approved, discussion_rejected
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.artist_discussion_moderation_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artists can view their own moderation notifications" 
ON public.artist_discussion_moderation_notifications 
FOR SELECT 
USING (artist_id = auth.uid());

CREATE POLICY "Artists can update their own moderation notifications" 
ON public.artist_discussion_moderation_notifications 
FOR UPDATE 
USING (artist_id = auth.uid());

-- Update updated_at trigger
CREATE TRIGGER update_artist_discussions_updated_at
BEFORE UPDATE ON public.artist_discussions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_artist_discussion_replies_updated_at
BEFORE UPDATE ON public.artist_discussion_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update discussion replies count
CREATE OR REPLACE FUNCTION public.update_discussion_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.artist_discussions SET replies_count = replies_count + 1 WHERE id = NEW.discussion_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.artist_discussions SET replies_count = replies_count - 1 WHERE id = OLD.discussion_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update replies count
CREATE TRIGGER update_discussion_replies_count_trigger
AFTER INSERT OR DELETE ON public.artist_discussion_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_discussion_replies_count();