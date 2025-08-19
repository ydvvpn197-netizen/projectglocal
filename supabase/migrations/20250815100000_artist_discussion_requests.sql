-- Create table for discussion requests on artist profiles
CREATE TABLE IF NOT EXISTS public.artist_discussion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_user_id UUID NOT NULL,
  requester_user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_artist_discussion_requests_artist ON public.artist_discussion_requests(artist_user_id);
CREATE INDEX IF NOT EXISTS idx_artist_discussion_requests_requester ON public.artist_discussion_requests(requester_user_id);
CREATE INDEX IF NOT EXISTS idx_artist_discussion_requests_status ON public.artist_discussion_requests(status);

-- Enable RLS
ALTER TABLE public.artist_discussion_requests ENABLE ROW LEVEL SECURITY;

-- Policies
-- Requesters can insert their own requests
CREATE POLICY IF NOT EXISTS "Requesters can insert their own requests"
ON public.artist_discussion_requests
FOR INSERT
WITH CHECK (requester_user_id = auth.uid());

-- Artist or requester can view a request
CREATE POLICY IF NOT EXISTS "Artist and requester can view requests"
ON public.artist_discussion_requests
FOR SELECT
USING (artist_user_id = auth.uid() OR requester_user_id = auth.uid());

-- Artist can update status of their requests; requester cannot change after creation
CREATE POLICY IF NOT EXISTS "Artist can update their requests"
ON public.artist_discussion_requests
FOR UPDATE
USING (artist_user_id = auth.uid());

-- Update timestamp trigger
CREATE TRIGGER update_artist_discussion_requests_updated_at
BEFORE UPDATE ON public.artist_discussion_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Extend posts visibility to include followed users
CREATE OR REPLACE FUNCTION public.get_posts_with_restricted_contact()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  type post_type,
  title text,
  content text,
  location_city text,
  location_state text,
  location_country text,
  latitude numeric,
  longitude numeric,
  event_date timestamp with time zone,
  event_location text,
  price_range text,
  contact_info text,
  tags text[],
  image_urls text[],
  likes_count integer,
  comments_count integer,
  status post_status,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) 
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path TO ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.type,
    p.title,
    p.content,
    p.location_city,
    p.location_state,
    p.location_country,
    p.latitude,
    p.longitude,
    p.event_date,
    p.event_location,
    p.price_range,
    CASE 
      WHEN p.user_id = auth.uid() THEN p.contact_info
      ELSE NULL
    END as contact_info,
    p.tags,
    p.image_urls,
    p.likes_count,
    p.comments_count,
    p.status,
    p.created_at,
    p.updated_at
  FROM public.posts p
  WHERE (
    p.user_id = auth.uid()
    OR public.users_in_same_area(auth.uid(), p.user_id)
    OR EXISTS (
      SELECT 1 FROM public.follows f 
      WHERE f.follower_id = auth.uid() AND f.following_id = p.user_id
    )
  );
END;
$$;

