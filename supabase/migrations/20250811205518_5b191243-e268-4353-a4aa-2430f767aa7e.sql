-- Drop the problematic security definer view
DROP VIEW IF EXISTS public.artist_bookings_public;

-- Create a security definer function instead to safely check permissions
CREATE OR REPLACE FUNCTION public.can_view_booking_details(_booking_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.artist_bookings ab
    WHERE ab.id = _booking_id
    AND (
      ab.user_id = _user_id OR 
      EXISTS (
        SELECT 1 FROM public.artists a 
        WHERE a.user_id = _user_id 
        AND a.id = ab.artist_id
      )
    )
  );
$$;

-- Create a safe view without security definer that uses proper RLS
CREATE OR REPLACE VIEW public.artist_bookings_safe AS
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
  -- Sensitive data is NULL for unauthorized users via RLS policies
  contact_info,
  budget_min,
  budget_max
FROM public.artist_bookings;

-- Enable RLS on the view (inherits from table)
ALTER VIEW public.artist_bookings_safe SET (security_barrier = true);

-- Grant access to the view
GRANT SELECT ON public.artist_bookings_safe TO authenticated;

-- Update the existing secure function to ensure it properly filters sensitive data
CREATE OR REPLACE FUNCTION public.get_artist_bookings_secure()
RETURNS TABLE(
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
STABLE SECURITY DEFINER
SET search_path = ''
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
           public.can_view_booking_details(ab.id, auth.uid())
      THEN ab.budget_min
      ELSE NULL
    END as budget_min,
    CASE 
      WHEN ab.user_id = auth.uid() OR 
           public.can_view_booking_details(ab.id, auth.uid())
      THEN ab.budget_max
      ELSE NULL
    END as budget_max,
    -- Only show contact info to booking creator and target artist
    CASE 
      WHEN ab.user_id = auth.uid() OR 
           public.can_view_booking_details(ab.id, auth.uid())
      THEN ab.contact_info
      ELSE NULL
    END as contact_info,
    ab.status,
    ab.created_at,
    ab.updated_at
  FROM public.artist_bookings ab
  WHERE (
    ab.user_id = auth.uid() OR 
    public.can_view_booking_details(ab.id, auth.uid())
  );
END;
$$;