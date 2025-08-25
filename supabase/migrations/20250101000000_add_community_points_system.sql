-- Community Points System Migration
-- This migration adds tables for tracking user points, transactions, and leaderboards

-- Create user_points table to store total points for each user
CREATE TABLE IF NOT EXISTS public.user_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create point_transactions table to track all point earning/spending activities
CREATE TABLE IF NOT EXISTS public.point_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL, -- Positive for earning, negative for spending
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
  reference_id UUID, -- ID of the related post, comment, event, etc.
  reference_type TEXT, -- 'post', 'comment', 'event', 'poll'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_leaderboard table for caching leaderboard data
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
CREATE INDEX IF NOT EXISTS idx_user_points_rank ON public.user_points(rank);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON public.point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_type ON public.point_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON public.point_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_transactions_reference ON public.point_transactions(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_community_leaderboard_rank ON public.community_leaderboard(rank);
CREATE INDEX IF NOT EXISTS idx_community_leaderboard_points ON public.community_leaderboard(total_points DESC);

-- Enable Row Level Security
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_points
CREATE POLICY "Users can view their own points" ON public.user_points
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view all points for leaderboard" ON public.user_points
  FOR SELECT USING (true);

CREATE POLICY "System can insert user points" ON public.user_points
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update user points" ON public.user_points
  FOR UPDATE USING (true);

-- RLS Policies for point_transactions
CREATE POLICY "Users can view their own transactions" ON public.point_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert transactions" ON public.point_transactions
  FOR INSERT WITH CHECK (true);

-- RLS Policies for community_leaderboard
CREATE POLICY "Anyone can view leaderboard" ON public.community_leaderboard
  FOR SELECT USING (true);

CREATE POLICY "System can update leaderboard" ON public.community_leaderboard
  FOR ALL USING (true);

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
    
    UPDATE public.user_points 
    SET rank = v_rank 
    WHERE user_id = v_user_record.user_id;
    
    PERFORM update_leaderboard_rank(v_user_record.user_id, v_user_record.total_points);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle post like points
CREATE OR REPLACE FUNCTION handle_post_like_points(
  p_post_id UUID,
  p_liker_id UUID,
  p_author_id UUID,
  p_is_like BOOLEAN
) RETURNS BOOLEAN AS $$
BEGIN
  IF p_is_like THEN
    -- Give points to both users
    PERFORM add_user_points(p_liker_id, 1, 'post_like_given', p_post_id, 'post', 'Liked a post');
    PERFORM add_user_points(p_author_id, 1, 'post_like_received', p_post_id, 'post', 'Post received a like');
  ELSE
    -- Remove points from both users
    PERFORM add_user_points(p_liker_id, -1, 'post_like_given', p_post_id, 'post', 'Unliked a post');
    PERFORM add_user_points(p_author_id, -1, 'post_like_received', p_post_id, 'post', 'Post lost a like');
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle comment like points
CREATE OR REPLACE FUNCTION handle_comment_like_points(
  p_comment_id UUID,
  p_liker_id UUID,
  p_author_id UUID,
  p_is_like BOOLEAN
) RETURNS BOOLEAN AS $$
BEGIN
  IF p_is_like THEN
    -- Give points to both users
    PERFORM add_user_points(p_liker_id, 1, 'comment_like_given', p_comment_id, 'comment', 'Liked a comment');
    PERFORM add_user_points(p_author_id, 1, 'comment_like_received', p_comment_id, 'comment', 'Comment received a like');
  ELSE
    -- Remove points from both users
    PERFORM add_user_points(p_liker_id, -1, 'comment_like_given', p_comment_id, 'comment', 'Unliked a comment');
    PERFORM add_user_points(p_author_id, -1, 'comment_like_received', p_comment_id, 'comment', 'Comment lost a like');
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle post creation/deletion points
CREATE OR REPLACE FUNCTION handle_post_points(
  p_post_id UUID,
  p_user_id UUID,
  p_is_creation BOOLEAN
) RETURNS BOOLEAN AS $$
BEGIN
  IF p_is_creation THEN
    PERFORM add_user_points(p_user_id, 2, 'post_created', p_post_id, 'post', 'Created a new post');
  ELSE
    PERFORM add_user_points(p_user_id, -2, 'post_deleted', p_post_id, 'post', 'Deleted a post');
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle comment creation/deletion points
CREATE OR REPLACE FUNCTION handle_comment_points(
  p_comment_id UUID,
  p_user_id UUID,
  p_is_creation BOOLEAN
) RETURNS BOOLEAN AS $$
BEGIN
  IF p_is_creation THEN
    PERFORM add_user_points(p_user_id, 1, 'comment_created', p_comment_id, 'comment', 'Created a new comment');
  ELSE
    PERFORM add_user_points(p_user_id, -1, 'comment_deleted', p_comment_id, 'comment', 'Deleted a comment');
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle event points
CREATE OR REPLACE FUNCTION handle_event_points(
  p_event_id UUID,
  p_user_id UUID,
  p_action TEXT -- 'organized', 'attended', 'deleted'
) RETURNS BOOLEAN AS $$
BEGIN
  CASE p_action
    WHEN 'organized' THEN
      PERFORM add_user_points(p_user_id, 10, 'event_organized', p_event_id, 'event', 'Organized an event');
    WHEN 'attended' THEN
      PERFORM add_user_points(p_user_id, 1, 'event_attended', p_event_id, 'event', 'Attended an event');
    WHEN 'deleted' THEN
      PERFORM add_user_points(p_user_id, -10, 'event_deleted', p_event_id, 'event', 'Deleted an event');
  END CASE;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle poll points
CREATE OR REPLACE FUNCTION handle_poll_points(
  p_poll_id UUID,
  p_user_id UUID,
  p_action TEXT -- 'created', 'voted', 'deleted'
) RETURNS BOOLEAN AS $$
BEGIN
  CASE p_action
    WHEN 'created' THEN
      PERFORM add_user_points(p_user_id, 2, 'poll_created', p_poll_id, 'poll', 'Created a poll');
    WHEN 'voted' THEN
      PERFORM add_user_points(p_user_id, 1, 'poll_voted', p_poll_id, 'poll', 'Voted in a poll');
    WHEN 'deleted' THEN
      PERFORM add_user_points(p_user_id, -2, 'poll_deleted', p_poll_id, 'poll', 'Deleted a poll');
  END CASE;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle sharing points
CREATE OR REPLACE FUNCTION handle_share_points(
  p_post_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  PERFORM add_user_points(p_user_id, 2, 'post_shared', p_post_id, 'post', 'Shared a post');
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically handle points for existing actions

-- Trigger for post votes (likes)
CREATE OR REPLACE FUNCTION trigger_post_vote_points() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- New vote
    PERFORM handle_post_like_points(NEW.post_id, NEW.user_id, 
      (SELECT user_id FROM public.community_posts WHERE id = NEW.post_id), 
      NEW.vote_type = 1);
  ELSIF TG_OP = 'UPDATE' THEN
    -- Vote changed
    IF OLD.vote_type != NEW.vote_type THEN
      -- Remove old vote points
      PERFORM handle_post_like_points(OLD.post_id, OLD.user_id, 
        (SELECT user_id FROM public.community_posts WHERE id = OLD.post_id), 
        OLD.vote_type = 1);
      -- Add new vote points
      PERFORM handle_post_like_points(NEW.post_id, NEW.user_id, 
        (SELECT user_id FROM public.community_posts WHERE id = NEW.post_id), 
        NEW.vote_type = 1);
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    -- Vote removed
    PERFORM handle_post_like_points(OLD.post_id, OLD.user_id, 
      (SELECT user_id FROM public.community_posts WHERE id = OLD.post_id), 
      OLD.vote_type = 1);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for comment votes (likes)
CREATE OR REPLACE FUNCTION trigger_comment_vote_points() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM handle_comment_like_points(NEW.comment_id, NEW.user_id, 
      (SELECT user_id FROM public.post_comments WHERE id = NEW.comment_id), 
      NEW.vote_type = 1);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type != NEW.vote_type THEN
      PERFORM handle_comment_like_points(OLD.comment_id, OLD.user_id, 
        (SELECT user_id FROM public.post_comments WHERE id = OLD.comment_id), 
        OLD.vote_type = 1);
      PERFORM handle_comment_like_points(NEW.comment_id, NEW.user_id, 
        (SELECT user_id FROM public.post_comments WHERE id = NEW.comment_id), 
        NEW.vote_type = 1);
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM handle_comment_like_points(OLD.comment_id, OLD.user_id, 
      (SELECT user_id FROM public.post_comments WHERE id = OLD.comment_id), 
      OLD.vote_type = 1);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for post creation/deletion
CREATE OR REPLACE FUNCTION trigger_post_points() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM handle_post_points(NEW.id, NEW.user_id, TRUE);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM handle_post_points(OLD.id, OLD.user_id, FALSE);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for comment creation/deletion
CREATE OR REPLACE FUNCTION trigger_comment_points() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM handle_comment_points(NEW.id, NEW.user_id, TRUE);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM handle_comment_points(OLD.id, OLD.user_id, FALSE);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for poll votes
CREATE OR REPLACE FUNCTION trigger_poll_vote_points() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM handle_poll_points(NEW.poll_id, NEW.user_id, 'voted');
  ELSIF TG_OP = 'DELETE' THEN
    -- Note: We don't remove points for poll vote deletion as it's rare
    NULL;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the triggers
DROP TRIGGER IF EXISTS post_vote_points_trigger ON public.post_votes;
CREATE TRIGGER post_vote_points_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.post_votes
  FOR EACH ROW EXECUTE FUNCTION trigger_post_vote_points();

DROP TRIGGER IF EXISTS comment_vote_points_trigger ON public.comment_votes;
CREATE TRIGGER comment_vote_points_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.comment_votes
  FOR EACH ROW EXECUTE FUNCTION trigger_comment_vote_points();

DROP TRIGGER IF EXISTS post_points_trigger ON public.community_posts;
CREATE TRIGGER post_points_trigger
  AFTER INSERT OR DELETE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION trigger_post_points();

DROP TRIGGER IF EXISTS comment_points_trigger ON public.post_comments;
CREATE TRIGGER comment_points_trigger
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION trigger_comment_points();

DROP TRIGGER IF EXISTS poll_vote_points_trigger ON public.poll_votes;
CREATE TRIGGER poll_vote_points_trigger
  AFTER INSERT OR DELETE ON public.poll_votes
  FOR EACH ROW EXECUTE FUNCTION trigger_poll_vote_points();

-- Initialize user_points for existing users
INSERT INTO public.user_points (user_id, total_points)
SELECT id, 0 FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Refresh all leaderboard ranks
SELECT refresh_all_leaderboard_ranks();
