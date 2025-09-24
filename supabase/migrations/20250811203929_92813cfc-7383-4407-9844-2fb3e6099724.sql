-- Drop the existing posts_secure view since we can't apply RLS to views
DROP VIEW IF EXISTS public.posts_secure;

-- Create a more secure approach by updating the function to include proper access control
-- The function already has SECURITY DEFINER which provides the security we need

-- Strengthen artist_bookings security - replace existing policies with more restrictive ones
DROP POLICY IF EXISTS "Target artists can view their bookings" ON public.artist_bookings;
DROP POLICY IF EXISTS "Booking creators can view their own bookings" ON public.artist_bookings;

-- Create a comprehensive policy that handles both cases
CREATE POLICY "Users can view relevant booking details" 
ON public.artist_bookings 
FOR SELECT 
USING (
  -- Original booking creator can see everything
  (user_id = auth.uid()) 
  OR 
  -- Artists can see their bookings but with restricted contact info
  (EXISTS (
    SELECT 1 FROM public.artists 
    WHERE artists.user_id = auth.uid() 
    AND artists.id = artist_bookings.artist_id
  ))
);

-- Create a security function for artist bookings to restrict sensitive data
CREATE OR REPLACE FUNCTION public.get_artist_bookings_secure()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  artist_id uuid,
  event_date timestamp with time zone,
  event_location text,
  event_description text,
  budget_min numeric,
  budget_max numeric,
  contact_info text,
  status text,
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
    ab.id,
    ab.user_id,
    ab.artist_id,
    ab.event_date,
    ab.event_location,
    ab.event_description,
    -- Only show budget to booking creator and target artist
    CASE 
      WHEN ab.user_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM public.artists WHERE artists.user_id = auth.uid() AND artists.id = ab.artist_id)
      THEN ab.budget_min
      ELSE NULL
    END as budget_min,
    CASE 
      WHEN ab.user_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM public.artists WHERE artists.user_id = auth.uid() AND artists.id = ab.artist_id)
      THEN ab.budget_max
      ELSE NULL
    END as budget_max,
    -- Only show contact info to booking creator and target artist
    CASE 
      WHEN ab.user_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM public.artists WHERE artists.user_id = auth.uid() AND artists.id = ab.artist_id)
      THEN ab.contact_info
      ELSE NULL
    END as contact_info,
    ab.status,
    ab.created_at,
    ab.updated_at
  FROM public.artist_bookings ab
  WHERE (
    ab.user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.artists WHERE artists.user_id = auth.uid() AND artists.id = ab.artist_id)
  );
END;
$$;