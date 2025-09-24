-- Minimal Community Features Fix
-- This migration creates only the essential tables and functions without dependencies

-- Create user_points table
CREATE TABLE IF NOT EXISTS public.user_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create point_transactions table
CREATE TABLE IF NOT EXISTS public.point_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_leaderboard table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON public.user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_total_points ON public.user_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON public.point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON public.point_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_leaderboard_rank ON public.community_leaderboard(rank ASC);
CREATE INDEX IF NOT EXISTS idx_community_leaderboard_total_points ON public.community_leaderboard(total_points DESC);

-- Function to add points to a user
CREATE OR REPLACE FUNCTION add_user_points(
  p_user_id UUID,
  p_points INTEGER,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  -- Insert or update user_points
  INSERT INTO public.user_points (user_id, total_points)
  VALUES (p_user_id, p_points)
  ON CONFLICT (user_id)
  DO UPDATE SET 
    total_points = public.user_points.total_points + p_points,
    updated_at = now();
  
  -- Record transaction
  INSERT INTO public.point_transactions (user_id, points, transaction_type, description, metadata)
  VALUES (p_user_id, p_points, p_transaction_type, p_description, p_metadata);
  
  -- Update leaderboard (simplified without profile join)
  INSERT INTO public.community_leaderboard (user_id, total_points)
  SELECT 
    up.user_id,
    up.total_points
  FROM public.user_points up
  WHERE up.user_id = p_user_id
  ON CONFLICT (user_id)
  DO UPDATE SET 
    total_points = EXCLUDED.total_points,
    last_updated = now();
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update leaderboard ranks
CREATE OR REPLACE FUNCTION update_leaderboard_rank() RETURNS VOID AS $$
BEGIN
  UPDATE public.community_leaderboard
  SET rank = subquery.rank
  FROM (
    SELECT 
      user_id,
      ROW_NUMBER() OVER (ORDER BY total_points DESC, last_updated ASC) as rank
    FROM public.community_leaderboard
  ) subquery
  WHERE public.community_leaderboard.user_id = subquery.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to refresh all leaderboard ranks
CREATE OR REPLACE FUNCTION refresh_all_leaderboard_ranks() RETURNS VOID AS $$
BEGIN
  PERFORM update_leaderboard_rank();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policies for user_points
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own points" ON public.user_points
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can update points" ON public.user_points
  FOR ALL USING (true);

-- RLS policies for point_transactions
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON public.point_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions" ON public.point_transactions
  FOR INSERT WITH CHECK (true);

-- RLS policies for community_leaderboard
ALTER TABLE public.community_leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard" ON public.community_leaderboard
  FOR SELECT USING (true);

CREATE POLICY "System can update leaderboard" ON public.community_leaderboard
  FOR ALL USING (true);

-- Insert sample data for testing (simplified)
INSERT INTO public.user_points (user_id, total_points) 
SELECT id, FLOOR(RANDOM() * 1000) + 100
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM public.user_points)
LIMIT 5;

-- Insert sample leaderboard data (simplified)
INSERT INTO public.community_leaderboard (user_id, total_points)
SELECT 
  up.user_id,
  up.total_points
FROM public.user_points up
WHERE up.user_id NOT IN (SELECT user_id FROM public.community_leaderboard);

-- Update ranks
SELECT refresh_all_leaderboard_ranks();
