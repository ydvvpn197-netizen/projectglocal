-- Migration: Fix Community Issues
-- Date: 2025-01-01
-- Description: Fix community leaderboard, group members, and related issues

-- Ensure community_leaderboard table exists and has proper structure
CREATE TABLE IF NOT EXISTS public.community_leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  total_points INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Ensure user_points table exists
CREATE TABLE IF NOT EXISTS public.user_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Ensure point_transactions table exists
CREATE TABLE IF NOT EXISTS public.point_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (
    transaction_type IN (
      'post_like_received',
      'post_like_given', 
      'comment_like_received',
      'comment_like_given',
      'post_created',
      'comment_created',
      'event_organized',
      'event_attended',
      'post_shared',
      'poll_created',
      'poll_voted',
      'post_deleted',
      'comment_deleted',
      'event_deleted',
      'poll_deleted'
    )
  ),
  reference_id UUID,
  reference_type TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure community_groups table exists
CREATE TABLE IF NOT EXISTS public.community_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT true,
  allow_anonymous_posts BOOLEAN DEFAULT false,
  require_approval BOOLEAN DEFAULT false,
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  latitude NUMERIC,
  longitude NUMERIC,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, location_city)
);

-- Ensure group_members table exists (not community_group_members)
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_leaderboard_rank ON public.community_leaderboard(rank);
CREATE INDEX IF NOT EXISTS idx_community_leaderboard_points ON public.community_leaderboard(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON public.user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_total_points ON public.user_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_rank ON public.user_points(rank);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON public.point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_type ON public.point_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON public.point_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_groups_category ON public.community_groups(category);
CREATE INDEX IF NOT EXISTS idx_community_groups_location ON public.community_groups(location_city, location_state);

-- Enable Row Level Security
ALTER TABLE public.community_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_leaderboard
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON public.community_leaderboard;
CREATE POLICY "Anyone can view leaderboard" ON public.community_leaderboard
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can update leaderboard" ON public.community_leaderboard;
CREATE POLICY "System can update leaderboard" ON public.community_leaderboard
  FOR ALL USING (true);

-- RLS Policies for user_points
DROP POLICY IF EXISTS "Users can view their own points" ON public.user_points;
CREATE POLICY "Users can view their own points" ON public.user_points
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view all points for leaderboard" ON public.user_points;
CREATE POLICY "Users can view all points for leaderboard" ON public.user_points
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can insert user points" ON public.user_points;
CREATE POLICY "System can insert user points" ON public.user_points
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "System can update user points" ON public.user_points;
CREATE POLICY "System can update user points" ON public.user_points
  FOR UPDATE USING (true);

-- RLS Policies for point_transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.point_transactions;
CREATE POLICY "Users can view their own transactions" ON public.point_transactions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert transactions" ON public.point_transactions;
CREATE POLICY "System can insert transactions" ON public.point_transactions
  FOR INSERT WITH CHECK (true);

-- RLS Policies for community_groups
DROP POLICY IF EXISTS "Users can view public groups" ON public.community_groups;
CREATE POLICY "Users can view public groups" ON public.community_groups
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.community_groups;
CREATE POLICY "Authenticated users can create groups" ON public.community_groups
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- RLS Policies for group_members
DROP POLICY IF EXISTS "Users can join public groups" ON public.group_members;
CREATE POLICY "Users can join public groups" ON public.group_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.community_groups 
      WHERE id = group_id AND is_public = true
    )
  );

DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
CREATE POLICY "Users can view group members" ON public.group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_groups 
      WHERE id = group_id AND is_public = true
    )
  );

-- Function to add points to a user
CREATE OR REPLACE FUNCTION add_user_points(
  p_user_id UUID,
  p_points INTEGER,
  p_transaction_type TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_points INTEGER;
  v_new_points INTEGER;
BEGIN
  -- Get current points or create new record
  SELECT total_points INTO v_current_points 
  FROM public.user_points 
  WHERE user_id = p_user_id;
  
  IF v_current_points IS NULL THEN
    -- Create new user_points record
    INSERT INTO public.user_points (user_id, total_points)
    VALUES (p_user_id, p_points);
    v_new_points := p_points;
  ELSE
    -- Update existing points
    v_new_points := v_current_points + p_points;
    UPDATE public.user_points 
    SET total_points = v_new_points, updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Record the transaction
  INSERT INTO public.point_transactions (
    user_id, points, transaction_type, reference_id, reference_type, description
  ) VALUES (
    p_user_id, p_points, p_transaction_type, p_reference_id, p_reference_type, p_description
  );
  
  -- Update leaderboard
  PERFORM update_leaderboard_rank(p_user_id, v_new_points);
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update leaderboard ranks
CREATE OR REPLACE FUNCTION update_leaderboard_rank(p_user_id UUID, p_points INTEGER) RETURNS VOID AS $$
DECLARE
  v_rank INTEGER;
  v_display_name TEXT;
  v_avatar_url TEXT;
BEGIN
  -- Calculate rank based on points
  SELECT COUNT(*) + 1 INTO v_rank
  FROM public.user_points 
  WHERE total_points > p_points;
  
  -- Get user profile info
  SELECT display_name, avatar_url INTO v_display_name, v_avatar_url
  FROM public.user_profiles 
  WHERE user_id = p_user_id;
  
  -- Update or insert leaderboard entry
  INSERT INTO public.community_leaderboard (
    user_id, display_name, avatar_url, total_points, rank, last_updated
  ) VALUES (
    p_user_id, v_display_name, v_avatar_url, p_points, v_rank, NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    total_points = EXCLUDED.total_points,
    rank = EXCLUDED.rank,
    last_updated = NOW();
    
  -- Update rank in user_points table
  UPDATE public.user_points 
  SET rank = v_rank 
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to refresh all leaderboard ranks
CREATE OR REPLACE FUNCTION refresh_all_leaderboard_ranks() RETURNS VOID AS $$
DECLARE
  v_user_record RECORD;
  v_rank INTEGER;
  v_display_name TEXT;
  v_avatar_url TEXT;
BEGIN
  -- Update ranks for all users
  FOR v_user_record IN 
    SELECT user_id, total_points 
    FROM public.user_points 
    ORDER BY total_points DESC
  LOOP
    SELECT COUNT(*) + 1 INTO v_rank
    FROM public.user_points 
    WHERE total_points > v_user_record.total_points;
    
    -- Get user profile info
    SELECT display_name, avatar_url INTO v_display_name, v_avatar_url
    FROM public.user_profiles 
    WHERE user_id = v_user_record.user_id;
    
    -- Update leaderboard entry
    INSERT INTO public.community_leaderboard (
      user_id, display_name, avatar_url, total_points, rank, last_updated
    ) VALUES (
      v_user_record.user_id, v_display_name, v_avatar_url, v_user_record.total_points, v_rank, NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      avatar_url = EXCLUDED.avatar_url,
      total_points = EXCLUDED.total_points,
      rank = EXCLUDED.rank,
      last_updated = NOW();
      
    -- Update rank in user_points table
    UPDATE public.user_points 
    SET rank = v_rank 
    WHERE user_id = v_user_record.user_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle event points
CREATE OR REPLACE FUNCTION handle_event_points(
  p_event_id UUID,
  p_user_id UUID,
  p_action TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_points INTEGER;
  v_transaction_type TEXT;
BEGIN
  -- Determine points and transaction type based on action
  CASE p_action
    WHEN 'attended' THEN
      v_points := 50;
      v_transaction_type := 'event_attended';
    WHEN 'organized' THEN
      v_points := 100;
      v_transaction_type := 'event_organized';
    ELSE
      RETURN FALSE;
  END CASE;
  
  -- Add points
  RETURN add_user_points(p_user_id, v_points, v_transaction_type, p_event_id, 'event');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle poll points
CREATE OR REPLACE FUNCTION handle_poll_points(
  p_poll_id UUID,
  p_user_id UUID,
  p_action TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_points INTEGER;
  v_transaction_type TEXT;
BEGIN
  -- Determine points and transaction type based on action
  CASE p_action
    WHEN 'created' THEN
      v_points := 25;
      v_transaction_type := 'poll_created';
    WHEN 'voted' THEN
      v_points := 5;
      v_transaction_type := 'poll_voted';
    ELSE
      RETURN FALSE;
  END CASE;
  
  -- Add points
  RETURN add_user_points(p_user_id, v_points, v_transaction_type, p_poll_id, 'poll');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle share points
CREATE OR REPLACE FUNCTION handle_share_points(
  p_post_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Add points for sharing
  RETURN add_user_points(p_user_id, 10, 'post_shared', p_post_id, 'post');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample data for testing
INSERT INTO public.community_groups (name, description, category, created_by, location_city, location_state, location_country)
VALUES 
  ('Local Artists Network', 'Connect with local artists and share your work', 'Arts & Culture', 
   (SELECT id FROM auth.users LIMIT 1), 'New York', 'NY', 'USA'),
  ('Tech Enthusiasts', 'Discuss the latest in technology and innovation', 'Technology', 
   (SELECT id FROM auth.users LIMIT 1), 'San Francisco', 'CA', 'USA'),
  ('Food Lovers', 'Share recipes and discover local restaurants', 'Food & Dining', 
   (SELECT id FROM auth.users LIMIT 1), 'Chicago', 'IL', 'USA')
ON CONFLICT (name, location_city) DO NOTHING;

-- Initialize leaderboard with existing users
INSERT INTO public.community_leaderboard (user_id, display_name, avatar_url, total_points, rank)
SELECT 
  up.user_id,
  p.display_name,
  p.avatar_url,
  up.total_points,
  up.rank
FROM public.user_points up
LEFT JOIN public.user_profiles p ON up.user_id = p.user_id
ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  avatar_url = EXCLUDED.avatar_url,
  total_points = EXCLUDED.total_points,
  rank = EXCLUDED.rank,
  last_updated = NOW();
