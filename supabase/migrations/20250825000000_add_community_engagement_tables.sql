-- Community Engagement (Reddit-like) Tables Migration
-- This migration adds tables for community groups, posts, voting, comments, and polls

-- Create community_groups table (enhanced version of existing groups)
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

-- Create group_members table (enhanced version)
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Create community_posts table (enhanced version of discussions)
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'discussion' CHECK (post_type IN ('discussion', 'question', 'announcement', 'event', 'poll')),
  is_anonymous BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  latitude NUMERIC,
  longitude NUMERIC,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post_votes table
CREATE TABLE IF NOT EXISTS public.post_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 0, 1)), -- -1: downvote, 0: no vote, 1: upvote
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create post_comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  depth INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comment_votes table
CREATE TABLE IF NOT EXISTS public.comment_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 0, 1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Create community_polls table (enhanced version)
CREATE TABLE IF NOT EXISTS public.community_polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of {id: string, text: string, votes: number}
  total_votes INTEGER DEFAULT 0,
  is_multiple_choice BOOLEAN DEFAULT false,
  is_anonymous BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create poll_votes table (enhanced version)
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.community_polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_options JSONB NOT NULL, -- Array of option IDs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- Create post_views table for tracking views
CREATE TABLE IF NOT EXISTS public.post_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_groups_category ON public.community_groups(category);
CREATE INDEX IF NOT EXISTS idx_community_groups_location ON public.community_groups(location_city, location_state);
CREATE INDEX IF NOT EXISTS idx_community_groups_created_at ON public.community_groups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_role ON public.group_members(role);
CREATE INDEX IF NOT EXISTS idx_community_posts_group_id ON public.community_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_score ON public.community_posts(score DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_post_type ON public.community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_post_votes_post_id ON public.post_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_votes_user_id ON public.post_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON public.post_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_score ON public.post_comments(score DESC);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON public.post_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comment_votes_comment_id ON public.comment_votes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_votes_user_id ON public.comment_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_polls_post_id ON public.community_polls(post_id);
CREATE INDEX IF NOT EXISTS idx_community_polls_is_active ON public.community_polls(is_active);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON public.poll_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON public.post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user_id ON public.post_views(user_id);

-- Enable Row Level Security
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_groups
CREATE POLICY "Users can view public groups" ON public.community_groups
  FOR SELECT USING (is_public = true);

CREATE POLICY "Group members can view private groups" ON public.community_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_id = community_groups.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create groups" ON public.community_groups
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group admins can update groups" ON public.community_groups
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_id = community_groups.id AND user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for group_members
CREATE POLICY "Group members can view other members" ON public.group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm 
      WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join public groups" ON public.group_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.community_groups 
      WHERE id = group_id AND is_public = true
    )
  );

CREATE POLICY "Users can leave groups" ON public.group_members
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for community_posts
CREATE POLICY "Users can view posts in public groups" ON public.community_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_groups 
      WHERE id = group_id AND is_public = true
    )
  );

CREATE POLICY "Group members can view posts in private groups" ON public.community_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_id = community_posts.group_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can create posts" ON public.community_posts
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_id = community_posts.group_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own posts" ON public.community_posts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own posts" ON public.community_posts
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for post_votes
CREATE POLICY "Users can view post votes" ON public.post_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own post votes" ON public.post_votes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own post votes" ON public.post_votes
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for post_comments
CREATE POLICY "Users can view comments on public posts" ON public.post_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_posts cp
      JOIN public.community_groups cg ON cp.group_id = cg.id
      WHERE cp.id = post_comments.post_id AND cg.is_public = true
    )
  );

CREATE POLICY "Group members can view comments on private posts" ON public.post_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_posts cp
      JOIN public.group_members gm ON cp.group_id = gm.group_id
      WHERE cp.id = post_comments.post_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can create comments" ON public.post_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.community_posts cp
      JOIN public.group_members gm ON cp.group_id = gm.group_id
      WHERE cp.id = post_comments.post_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own comments" ON public.post_comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON public.post_comments
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for comment_votes
CREATE POLICY "Users can view comment votes" ON public.comment_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own comment votes" ON public.comment_votes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own comment votes" ON public.comment_votes
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for community_polls
CREATE POLICY "Users can view polls in public groups" ON public.community_polls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_posts cp
      JOIN public.community_groups cg ON cp.group_id = cg.id
      WHERE cp.id = community_polls.post_id AND cg.is_public = true
    )
  );

CREATE POLICY "Group members can view polls in private groups" ON public.community_polls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_posts cp
      JOIN public.group_members gm ON cp.group_id = gm.group_id
      WHERE cp.id = community_polls.post_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can create polls" ON public.community_polls
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.community_posts cp
      JOIN public.group_members gm ON cp.group_id = gm.group_id
      WHERE cp.id = community_polls.post_id AND gm.user_id = auth.uid()
    )
  );

-- RLS Policies for poll_votes
CREATE POLICY "Users can view poll votes" ON public.poll_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own poll votes" ON public.poll_votes
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for post_views
CREATE POLICY "Users can view post views" ON public.post_views
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own post views" ON public.post_views
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_community_groups_updated_at
  BEFORE UPDATE ON public.community_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_votes_updated_at
  BEFORE UPDATE ON public.post_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_comments_updated_at
  BEFORE UPDATE ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comment_votes_updated_at
  BEFORE UPDATE ON public.comment_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_polls_updated_at
  BEFORE UPDATE ON public.community_polls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update post score
CREATE OR REPLACE FUNCTION update_post_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.community_posts 
  SET score = upvotes - downvotes
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update comment score
CREATE OR REPLACE FUNCTION update_comment_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.post_comments 
  SET score = upvotes - downvotes
  WHERE id = NEW.comment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update comment depth
CREATE OR REPLACE FUNCTION update_comment_depth()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.depth := 0;
  ELSE
    SELECT depth + 1 INTO NEW.depth
    FROM public.post_comments
    WHERE id = NEW.parent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for score updates
CREATE TRIGGER update_post_score_trigger
  AFTER INSERT OR UPDATE ON public.post_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_score();

CREATE TRIGGER update_comment_score_trigger
  AFTER INSERT OR UPDATE ON public.comment_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_score();

CREATE TRIGGER update_comment_depth_trigger
  BEFORE INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_depth();

-- Create function to get posts with ranking (Reddit-like algorithm)
CREATE OR REPLACE FUNCTION get_ranked_posts(
  p_group_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_sort_by TEXT DEFAULT 'hot'
)
RETURNS TABLE(
  id UUID,
  group_id UUID,
  user_id UUID,
  title TEXT,
  content TEXT,
  post_type TEXT,
  is_anonymous BOOLEAN,
  is_pinned BOOLEAN,
  is_locked BOOLEAN,
  upvotes INTEGER,
  downvotes INTEGER,
  score INTEGER,
  comment_count INTEGER,
  view_count INTEGER,
  author_name TEXT,
  author_avatar TEXT,
  group_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  rank_score NUMERIC
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.id,
    cp.group_id,
    cp.user_id,
    cp.title,
    cp.content,
    cp.post_type,
    cp.is_anonymous,
    cp.is_pinned,
    cp.is_locked,
    cp.upvotes,
    cp.downvotes,
    cp.score,
    cp.comment_count,
    cp.view_count,
    CASE 
      WHEN cp.is_anonymous THEN 'Anonymous'
      ELSE p.display_name
    END as author_name,
    CASE 
      WHEN cp.is_anonymous THEN NULL
      ELSE p.avatar_url
    END as author_avatar,
    cg.name as group_name,
    cp.created_at,
    CASE 
      WHEN p_sort_by = 'hot' THEN 
        -- Reddit hot algorithm: (log10(z) + y/45000) * sign(x)
        -- where z = abs(score), y = seconds since creation, x = score
        (LOG(ABS(GREATEST(cp.score, 1))) + EXTRACT(EPOCH FROM (NOW() - cp.created_at)) / 45000) * SIGN(cp.score)
      WHEN p_sort_by = 'top' THEN cp.score::NUMERIC
      WHEN p_sort_by = 'new' THEN EXTRACT(EPOCH FROM cp.created_at)::NUMERIC
      WHEN p_sort_by = 'rising' THEN 
        -- Rising: posts with high upvote ratio and recent activity
        (cp.upvotes::NUMERIC / NULLIF(cp.upvotes + cp.downvotes, 0)) * EXTRACT(EPOCH FROM (NOW() - cp.created_at))
      ELSE cp.score::NUMERIC
    END as rank_score
  FROM public.community_posts cp
  LEFT JOIN public.profiles p ON cp.user_id = p.id
  LEFT JOIN public.community_groups cg ON cp.group_id = cg.id
  WHERE (p_group_id IS NULL OR cp.group_id = p_group_id)
    AND cp.is_locked = false
  ORDER BY 
    cp.is_pinned DESC,
    rank_score DESC,
    cp.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;
