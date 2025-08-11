-- Add user_type column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN user_type TEXT DEFAULT 'user' CHECK (user_type IN ('user', 'artist'));

-- Add index for better performance
CREATE INDEX idx_profiles_user_type ON public.profiles(user_type);

-- Create artists table for artist-specific information
CREATE TABLE public.artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  specialty TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  portfolio_urls TEXT[] DEFAULT '{}',
  hourly_rate_min DECIMAL,
  hourly_rate_max DECIMAL,
  bio TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on artists table
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- Create policies for artists table
CREATE POLICY "Artists can insert their own profile" 
ON public.artists 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Artists can update their own profile" 
ON public.artists 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Artists can view profiles in their area" 
ON public.artists 
FOR SELECT 
USING (users_in_same_area(auth.uid(), user_id));

-- Create trigger for artists updated_at
CREATE TRIGGER update_artists_updated_at
BEFORE UPDATE ON public.artists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add artist bookings table
CREATE TABLE public.artist_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_location TEXT NOT NULL,
  event_description TEXT NOT NULL,
  budget_min DECIMAL,
  budget_max DECIMAL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  contact_info TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on artist_bookings table
ALTER TABLE public.artist_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for artist_bookings table
CREATE POLICY "Users can insert their own bookings" 
ON public.artist_bookings 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own bookings" 
ON public.artist_bookings 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Artists can view bookings for them" 
ON public.artist_bookings 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.artists WHERE artists.user_id = auth.uid() AND artists.id = artist_bookings.artist_id));

CREATE POLICY "Artists can update bookings for them" 
ON public.artist_bookings 
FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.artists WHERE artists.user_id = auth.uid() AND artists.id = artist_bookings.artist_id));

-- Create trigger for artist_bookings updated_at
CREATE TRIGGER update_artist_bookings_updated_at
BEFORE UPDATE ON public.artist_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();