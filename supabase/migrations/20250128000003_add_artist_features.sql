-- Create artist followers table
CREATE TABLE IF NOT EXISTS artist_followers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  follower_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(artist_id, follower_id)
);

-- Create artist posts table
CREATE TABLE IF NOT EXISTS artist_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video', 'audio')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES artist_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create post comments table
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES artist_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post shares table
CREATE TABLE IF NOT EXISTS post_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES artist_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create artist services table
CREATE TABLE IF NOT EXISTS artist_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL, -- Price in paise (Indian currency)
  currency TEXT DEFAULT 'INR',
  category TEXT NOT NULL,
  duration_hours INTEGER DEFAULT 1,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service bookings table
CREATE TABLE IF NOT EXISTS service_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES artist_services(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_hours INTEGER NOT NULL,
  total_amount INTEGER NOT NULL, -- Amount in paise
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'refunded')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service reviews table
CREATE TABLE IF NOT EXISTS service_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES artist_services(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES service_bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(booking_id) -- One review per booking
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_artist_followers_artist_id ON artist_followers(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_followers_follower_id ON artist_followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_artist_posts_artist_id ON artist_posts(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_posts_created_at ON artist_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_post_id ON post_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_artist_services_artist_id ON artist_services(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_services_category ON artist_services(category);
CREATE INDEX IF NOT EXISTS idx_artist_services_available ON artist_services(is_available);
CREATE INDEX IF NOT EXISTS idx_service_bookings_service_id ON service_bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_customer_id ON service_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_status ON service_bookings(status);
CREATE INDEX IF NOT EXISTS idx_service_reviews_service_id ON service_reviews(service_id);

-- Enable RLS
ALTER TABLE artist_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for artist_followers
CREATE POLICY "Anyone can view artist followers" ON artist_followers
  FOR SELECT USING (true);

CREATE POLICY "Users can follow artists" ON artist_followers
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow artists" ON artist_followers
  FOR DELETE USING (auth.uid() = follower_id);

-- RLS Policies for artist_posts
CREATE POLICY "Anyone can view artist posts" ON artist_posts
  FOR SELECT USING (true);

CREATE POLICY "Artists can create posts" ON artist_posts
  FOR INSERT WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Artists can update their own posts" ON artist_posts
  FOR UPDATE USING (auth.uid() = artist_id);

CREATE POLICY "Artists can delete their own posts" ON artist_posts
  FOR DELETE USING (auth.uid() = artist_id);

-- RLS Policies for post_likes
CREATE POLICY "Anyone can view post likes" ON post_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" ON post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for post_comments
CREATE POLICY "Anyone can view post comments" ON post_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON post_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON post_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON post_comments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for post_shares
CREATE POLICY "Anyone can view post shares" ON post_shares
  FOR SELECT USING (true);

CREATE POLICY "Users can share posts" ON post_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unshare posts" ON post_shares
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for artist_services
CREATE POLICY "Anyone can view available artist services" ON artist_services
  FOR SELECT USING (is_available = true);

CREATE POLICY "Artists can create services" ON artist_services
  FOR INSERT WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Artists can update their own services" ON artist_services
  FOR UPDATE USING (auth.uid() = artist_id);

CREATE POLICY "Artists can delete their own services" ON artist_services
  FOR DELETE USING (auth.uid() = artist_id);

-- RLS Policies for service_bookings
CREATE POLICY "Users can view their own bookings" ON service_bookings
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() IN (
    SELECT artist_id FROM artist_services WHERE id = service_id
  ));

CREATE POLICY "Users can create bookings" ON service_bookings
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own bookings" ON service_bookings
  FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() IN (
    SELECT artist_id FROM artist_services WHERE id = service_id
  ));

-- RLS Policies for service_reviews
CREATE POLICY "Anyone can view service reviews" ON service_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their bookings" ON service_reviews
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own reviews" ON service_reviews
  FOR UPDATE USING (auth.uid() = customer_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_artist_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update the updated_at timestamp
CREATE TRIGGER update_artist_posts_updated_at
  BEFORE UPDATE ON artist_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_artist_tables_updated_at();

CREATE TRIGGER update_post_comments_updated_at
  BEFORE UPDATE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_artist_tables_updated_at();

CREATE TRIGGER update_artist_services_updated_at
  BEFORE UPDATE ON artist_services
  FOR EACH ROW
  EXECUTE FUNCTION update_artist_tables_updated_at();

CREATE TRIGGER update_service_bookings_updated_at
  BEFORE UPDATE ON service_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_artist_tables_updated_at();

-- Add comments for documentation
COMMENT ON TABLE artist_followers IS 'Followers of artists for engagement tracking';
COMMENT ON TABLE artist_posts IS 'Posts created by artists to engage with followers';
COMMENT ON TABLE post_likes IS 'Likes on artist posts';
COMMENT ON TABLE post_comments IS 'Comments on artist posts with threading support';
COMMENT ON TABLE post_shares IS 'Shares of artist posts';
COMMENT ON TABLE artist_services IS 'Services offered by artists for booking';
COMMENT ON TABLE service_bookings IS 'Bookings made by customers for artist services';
COMMENT ON TABLE service_reviews IS 'Reviews and ratings for completed service bookings';
COMMENT ON COLUMN artist_services.price IS 'Price in paise (Indian currency smallest unit)';
COMMENT ON COLUMN service_bookings.total_amount IS 'Total amount in paise (Indian currency smallest unit)';
