-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_category TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  location TEXT,
  helpful_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create review_votes table for helpful votes
CREATE TABLE IF NOT EXISTS public.review_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Create review_replies table
CREATE TABLE IF NOT EXISTS public.review_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reply_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create polls table
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  options JSONB NOT NULL, -- Array of {id: string, text: string, votes: number}
  total_votes INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create poll_votes table
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_business_category ON public.reviews(business_category);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON public.review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON public.review_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_review_replies_review_id ON public.review_replies(review_id);
CREATE INDEX IF NOT EXISTS idx_polls_user_id ON public.polls(user_id);
CREATE INDEX IF NOT EXISTS idx_polls_is_active ON public.polls(is_active);
CREATE INDEX IF NOT EXISTS idx_polls_expires_at ON public.polls(expires_at);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON public.poll_votes(user_id);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Users can view all reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for review_votes
CREATE POLICY "Users can view all review votes" ON public.review_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own review votes" ON public.review_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own review votes" ON public.review_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own review votes" ON public.review_votes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for review_replies
CREATE POLICY "Users can view all review replies" ON public.review_replies
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own review replies" ON public.review_replies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own review replies" ON public.review_replies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own review replies" ON public.review_replies
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for polls
CREATE POLICY "Users can view all active polls" ON public.polls
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create their own polls" ON public.polls
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own polls" ON public.polls
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own polls" ON public.polls
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for poll_votes
CREATE POLICY "Users can view all poll votes" ON public.poll_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own poll votes" ON public.poll_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own poll votes" ON public.poll_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own poll votes" ON public.poll_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Functions to update counts
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reviews 
    SET helpful_count = helpful_count + 1 
    WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reviews 
    SET helpful_count = helpful_count - 1 
    WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_review_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reviews 
    SET replies_count = replies_count + 1 
    WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reviews 
    SET replies_count = replies_count - 1 
    WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_poll_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update the option votes in the poll
    UPDATE public.polls 
    SET options = jsonb_set(
      options, 
      ARRAY[(
        SELECT position - 1 
        FROM jsonb_array_elements(options) WITH ORDINALITY arr(elem, position) 
        WHERE elem->>'id' = NEW.option_id
      )::text, 'votes'], 
      to_jsonb((COALESCE((options->>(
        SELECT position - 1 
        FROM jsonb_array_elements(options) WITH ORDINALITY arr(elem, position) 
        WHERE elem->>'id' = NEW.option_id
      )::text)->>'votes')::integer, 0) + 1)
    ),
    total_votes = total_votes + 1
    WHERE id = NEW.poll_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update the option votes in the poll
    UPDATE public.polls 
    SET options = jsonb_set(
      options, 
      ARRAY[(
        SELECT position - 1 
        FROM jsonb_array_elements(options) WITH ORDINALITY arr(elem, position) 
        WHERE elem->>'id' = OLD.option_id
      )::text, 'votes'], 
      to_jsonb((COALESCE((options->>(
        SELECT position - 1 
        FROM jsonb_array_elements(options) WITH ORDINALITY arr(elem, position) 
        WHERE elem->>'id' = OLD.option_id
      )::text)->>'votes')::integer, 0) - 1)
    ),
    total_votes = total_votes - 1
    WHERE id = OLD.poll_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_review_helpful_count
  AFTER INSERT OR DELETE ON public.review_votes
  FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

CREATE TRIGGER trigger_update_review_replies_count
  AFTER INSERT OR DELETE ON public.review_replies
  FOR EACH ROW EXECUTE FUNCTION update_review_replies_count();

CREATE TRIGGER trigger_update_poll_vote_count
  AFTER INSERT OR DELETE ON public.poll_votes
  FOR EACH ROW EXECUTE FUNCTION update_poll_vote_count();

-- Update the delete_user_account function to include new tables
CREATE OR REPLACE FUNCTION delete_user_account(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete in order to respect foreign key constraints
  
  -- 1. Delete chat messages
  DELETE FROM chat_messages 
  WHERE conversation_id IN (
    SELECT id FROM chat_conversations 
    WHERE client_id = user_id OR artist_id = user_id
  );
  
  -- 2. Delete chat conversations
  DELETE FROM chat_conversations 
  WHERE client_id = user_id OR artist_id = user_id;
  
  -- 3. Delete notifications
  DELETE FROM notifications 
  WHERE user_id = user_id;
  
  -- 4. Delete artist bookings
  DELETE FROM artist_bookings 
  WHERE user_id = user_id OR artist_id IN (
    SELECT id FROM artists WHERE user_id = user_id
  );
  
  -- 5. Delete artist discussions
  DELETE FROM artist_discussions 
  WHERE artist_id IN (
    SELECT id FROM artists WHERE user_id = user_id
  );
  
  -- 6. Delete artists record
  DELETE FROM artists 
  WHERE user_id = user_id;
  
  -- 7. Delete comments
  DELETE FROM comments 
  WHERE user_id = user_id;
  
  -- 8. Delete likes
  DELETE FROM likes 
  WHERE user_id = user_id;
  
  -- 9. Delete follows
  DELETE FROM follows 
  WHERE follower_id = user_id OR following_id = user_id;
  
  -- 10. Delete posts
  DELETE FROM posts 
  WHERE user_id = user_id;
  
  -- 11. Delete events (if user created any)
  DELETE FROM events 
  WHERE created_by = user_id;
  
  -- 12. Delete groups (if user created any)
  DELETE FROM groups 
  WHERE created_by = user_id;
  
  -- 13. Delete discussions (if user created any)
  DELETE FROM discussions 
  WHERE created_by = user_id;
  
  -- 14. Delete poll votes
  DELETE FROM poll_votes 
  WHERE user_id = user_id;
  
  -- 15. Delete polls
  DELETE FROM polls 
  WHERE user_id = user_id;
  
  -- 16. Delete review votes
  DELETE FROM review_votes 
  WHERE user_id = user_id;
  
  -- 17. Delete review replies
  DELETE FROM review_replies 
  WHERE user_id = user_id;
  
  -- 18. Delete reviews
  DELETE FROM reviews 
  WHERE user_id = user_id;
  
  -- 19. Finally delete the profile
  DELETE FROM profiles 
  WHERE user_id = user_id;
  
END;
$$;
