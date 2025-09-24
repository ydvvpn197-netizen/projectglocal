-- Fix RLS policy for artist_discussions table
-- The current policy incorrectly uses artist_id = auth.uid() but artist_id references artists.id, not auth.users.id

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view approved discussions and their own pending ones" ON public.artist_discussions;

-- Create the correct policy that checks if the current user is the artist
CREATE POLICY "Users can view approved discussions and their own pending ones" 
ON public.artist_discussions 
FOR SELECT 
USING (
  status = 'approved' OR 
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.artists 
    WHERE artists.user_id = auth.uid() 
    AND artists.id = artist_discussions.artist_id
  )
);

-- Also fix the update policy
DROP POLICY IF EXISTS "Artists can update discussions on their profile" ON public.artist_discussions;

CREATE POLICY "Artists can update discussions on their profile" 
ON public.artist_discussions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.artists 
    WHERE artists.user_id = auth.uid() 
    AND artists.id = artist_discussions.artist_id
  )
);
