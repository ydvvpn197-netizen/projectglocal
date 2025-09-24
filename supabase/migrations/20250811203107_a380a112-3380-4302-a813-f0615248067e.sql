-- Create a security definer function to get posts with restricted contact info
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
    -- Only show contact_info to the post owner
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
  WHERE (p.user_id = auth.uid() OR public.users_in_same_area(auth.uid(), p.user_id));
END;
$$;

-- Create a view that uses the security function
CREATE OR REPLACE VIEW public.posts_secure AS
SELECT * FROM public.get_posts_with_restricted_contact();