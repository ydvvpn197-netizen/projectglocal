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