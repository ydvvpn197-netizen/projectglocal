-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  location_name TEXT NOT NULL,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  category TEXT,
  max_attendees INTEGER,
  price NUMERIC DEFAULT 0,
  image_url TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event_attendees table for tracking who's attending events
CREATE TABLE public.event_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'attending' CHECK (status IN ('attending', 'maybe', 'not_attending')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS on events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Enable RLS on event_attendees table
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- RLS policies for events table
CREATE POLICY "Users can view events in their area" 
ON public.events 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  users_in_same_area(auth.uid(), user_id)
);

CREATE POLICY "Users can create their own events" 
ON public.events 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own events" 
ON public.events 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own events" 
ON public.events 
FOR DELETE 
USING (user_id = auth.uid());

-- RLS policies for event_attendees table
CREATE POLICY "Users can view attendees for events they can see" 
ON public.event_attendees 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_attendees.event_id 
    AND (e.user_id = auth.uid() OR users_in_same_area(auth.uid(), e.user_id))
  )
);

CREATE POLICY "Users can attend events" 
ON public.event_attendees 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own attendance" 
ON public.event_attendees 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can remove their own attendance" 
ON public.event_attendees 
FOR DELETE 
USING (user_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get events with attendance data
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
  user_attending boolean
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
    COALESCE(user_attendance.attending, false) as user_attending
  FROM public.events e
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
$function$