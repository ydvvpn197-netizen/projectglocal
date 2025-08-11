-- Enable RLS on posts_secure view
ALTER TABLE public.posts_secure ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for posts_secure view to match posts table security
CREATE POLICY "Users can view posts from their area via secure view" 
ON public.posts_secure 
FOR SELECT 
USING ((user_id = auth.uid()) OR public.users_in_same_area(auth.uid(), user_id));

-- Strengthen artist_bookings security - add policy to restrict budget visibility
CREATE POLICY "Artists can view booking budget details" 
ON public.artist_bookings 
FOR SELECT 
USING (
  -- Original booking creator can see everything
  (user_id = auth.uid()) 
  OR 
  -- Artists can see budget details for their bookings
  (EXISTS (
    SELECT 1 FROM public.artists 
    WHERE artists.user_id = auth.uid() 
    AND artists.id = artist_bookings.artist_id
  ))
);

-- Update existing artist booking policies to be more restrictive
DROP POLICY IF EXISTS "Target artists can view their bookings" ON public.artist_bookings;
DROP POLICY IF EXISTS "Booking creators can view their own bookings" ON public.artist_bookings;

-- Replace with the new comprehensive policy above