-- Enhance the get_events_with_attendance function to include organizer information
CREATE OR REPLACE FUNCTION public.get_events_with_attendance()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  title text,
  description text,
  event_date date,
  event_time time,
  location_name text,
  location_city text,
  location_state text,
  location_country text,
  latitude numeric,
  longitude numeric,
  category text,
  max_attendees integer,
  price numeric,
  image_url text,
  tags text[],
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  attendees_count integer,
  user_attending boolean,
  organizer_name text,
  organizer_avatar text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.user_id,
    e.title,
    e.description,
    e.event_date,
    e.event_time,
    e.location_name,
    e.location_city,
    e.location_state,
    e.location_country,
    e.latitude,
    e.longitude,
    e.category,
    e.max_attendees,
    e.price,
    e.image_url,
    e.tags,
    e.created_at,
    e.updated_at,
    COALESCE(attendee_counts.count, 0)::INTEGER as attendees_count,
    COALESCE(user_attendance.attending, false) as user_attending,
    COALESCE(p.full_name, p.username, 'Event Organizer') as organizer_name,
    p.avatar_url as organizer_avatar
  FROM public.events e
  LEFT JOIN public.profiles p ON e.user_id = p.id
  LEFT JOIN (
    SELECT event_id, COUNT(*) as count
    FROM public.event_attendees
    WHERE status = 'attending'
    GROUP BY event_id
  ) attendee_counts ON e.id = attendee_counts.event_id
  LEFT JOIN (
    SELECT event_id, true as attending
    FROM public.event_attendees
    WHERE user_id = auth.uid() AND status = 'attending'
  ) user_attendance ON e.id = user_attendance.event_id
  WHERE 
    e.user_id = auth.uid() OR 
    users_in_same_area(auth.uid(), e.user_id)
  ORDER BY e.event_date ASC, e.event_time ASC;
END;
$function$;
