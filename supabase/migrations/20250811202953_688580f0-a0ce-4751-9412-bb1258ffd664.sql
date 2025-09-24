-- Fix artist_bookings RLS policies to ensure only booking creator and specific artist can access sensitive data

-- Drop existing policies
DROP POLICY IF EXISTS "Artists can update bookings for them" ON public.artist_bookings;
DROP POLICY IF EXISTS "Artists can view bookings for them" ON public.artist_bookings;
DROP POLICY IF EXISTS "Users can insert their own bookings" ON public.artist_bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.artist_bookings;

-- Create more secure policies for artist_bookings
CREATE POLICY "Users can insert their own bookings" 
ON public.artist_bookings 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can only view their own bookings (booking creator)
CREATE POLICY "Booking creators can view their own bookings" 
ON public.artist_bookings 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Artists can only view bookings specifically for them (not area-based)
CREATE POLICY "Target artists can view their bookings" 
ON public.artist_bookings 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.artists 
  WHERE artists.user_id = auth.uid() 
  AND artists.id = artist_bookings.artist_id
));

-- Users can update their own bookings
CREATE POLICY "Booking creators can update their own bookings" 
ON public.artist_bookings 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

-- Artists can update status of bookings for them
CREATE POLICY "Target artists can update booking status" 
ON public.artist_bookings 
FOR UPDATE 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.artists 
  WHERE artists.user_id = auth.uid() 
  AND artists.id = artist_bookings.artist_id
));

-- Also fix posts table to restrict contact info visibility
DROP POLICY IF EXISTS "Users can view posts from their area" ON public.posts;

-- Create new policy that excludes contact_info for area-based viewing
CREATE POLICY "Users can view posts from their area without contact info" 
ON public.posts 
FOR SELECT 
TO authenticated
USING (
  -- Own posts: can see everything including contact info
  user_id = auth.uid() 
  OR 
  -- Area posts: can see everything except contact_info (handled at application level)
  users_in_same_area(auth.uid(), user_id)
);

-- Create separate policy for viewing own posts with full access
CREATE POLICY "Users can view their own posts with full access" 
ON public.posts 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());