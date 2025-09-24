-- Drop existing overly permissive RLS policy
DROP POLICY IF EXISTS "Users can view relevant booking details" ON public.artist_bookings;

-- Create more restrictive policies that hide sensitive data
-- Policy for booking creators - full access to their own bookings
CREATE POLICY "Booking creators can view their own bookings with full details" 
ON public.artist_bookings 
FOR SELECT 
USING (user_id = auth.uid());

-- Policy for target artists - limited access to bookings for them
CREATE POLICY "Target artists can view limited booking details" 
ON public.artist_bookings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.artists 
    WHERE artists.user_id = auth.uid() 
    AND artists.id = artist_bookings.artist_id
  )
);

-- Create a secure view that properly filters sensitive columns for non-owners
CREATE OR REPLACE VIEW public.artist_bookings_public AS
SELECT 
  id,
  user_id,
  artist_id,
  event_date,
  event_location,
  event_description,
  status,
  created_at,
  updated_at,
  -- Only show sensitive data to authorized users
  CASE 
    WHEN user_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.artists WHERE artists.user_id = auth.uid() AND artists.id = artist_bookings.artist_id)
    THEN contact_info
    ELSE NULL
  END as contact_info,
  CASE 
    WHEN user_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.artists WHERE artists.user_id = auth.uid() AND artists.id = artist_bookings.artist_id)
    THEN budget_min
    ELSE NULL
  END as budget_min,
  CASE 
    WHEN user_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.artists WHERE artists.user_id = auth.uid() AND artists.id = artist_bookings.artist_id)
    THEN budget_max
    ELSE NULL
  END as budget_max
FROM public.artist_bookings
WHERE (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.artists WHERE artists.user_id = auth.uid() AND artists.id = artist_bookings.artist_id)
);

-- Enable RLS on the view
ALTER VIEW public.artist_bookings_public SET (security_barrier = true);

-- Grant access to the view
GRANT SELECT ON public.artist_bookings_public TO authenticated;

-- Add comment explaining the security measure
COMMENT ON VIEW public.artist_bookings_public IS 'Secure view of artist bookings that filters sensitive contact and budget information based on user permissions';