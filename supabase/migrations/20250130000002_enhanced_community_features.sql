-- Migration: Enhanced Community Features
-- Date: 2025-01-30
-- Description: Add enhanced community features including event discussions, polls, and artist engagement

-- Create event_discussions table for event-specific discussions
CREATE TABLE IF NOT EXISTS public.event_discussions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES public.anonymous_sessions(session_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  anonymous_username TEXT,
  parent_id UUID REFERENCES public.event_discussions(id) ON DELETE CASCADE,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  depth INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_moderated BOOLEAN DEFAULT FALSE,
  moderation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_discussion_votes table
CREATE TABLE IF NOT EXISTS public.event_discussion_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID NOT NULL REFERENCES public.event_discussions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES public.anonymous_sessions(session_id) ON DELETE CASCADE,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 0, 1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(discussion_id, user_id),
  UNIQUE(discussion_id, session_id)
);

-- Create community_polls table (enhanced version)
CREATE TABLE IF NOT EXISTS public.community_polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  anonymous_post_id UUID REFERENCES public.anonymous_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES public.anonymous_sessions(session_id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  description TEXT,
  options JSONB NOT NULL, -- Array of {id: string, text: string, votes: number, color?: string}
  total_votes INTEGER DEFAULT 0,
  is_multiple_choice BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  allow_comments BOOLEAN DEFAULT TRUE,
  show_results_before_voting BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create poll_votes table (enhanced version)
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.community_polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES public.anonymous_sessions(session_id) ON DELETE CASCADE,
  selected_options JSONB NOT NULL, -- Array of option IDs
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id),
  UNIQUE(poll_id, session_id)
);

-- Create poll_comments table
CREATE TABLE IF NOT EXISTS public.poll_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.community_polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES public.anonymous_sessions(session_id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.poll_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  anonymous_username TEXT,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  depth INTEGER DEFAULT 0,
  is_moderated BOOLEAN DEFAULT FALSE,
  moderation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create artist_engagements table for artist-follower interactions
CREATE TABLE IF NOT EXISTS public.artist_engagements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES public.anonymous_sessions(session_id) ON DELETE CASCADE,
  engagement_type TEXT NOT NULL CHECK (engagement_type IN ('follow', 'unfollow', 'like', 'comment', 'share', 'bookmark', 'message')),
  content_id UUID, -- ID of the content being engaged with
  content_type TEXT, -- Type of content (post, event, service, etc.)
  is_anonymous BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create artist_followers table
CREATE TABLE IF NOT EXISTS public.artist_followers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES public.anonymous_sessions(session_id) ON DELETE CASCADE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  notification_preferences JSONB DEFAULT '{"new_posts": true, "events": true, "services": true, "messages": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(artist_id, follower_id),
  UNIQUE(artist_id, session_id)
);

-- Create artist_portfolio table
CREATE TABLE IF NOT EXISTS public.artist_portfolio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  media_urls JSONB DEFAULT '[]', -- Array of media URLs
  media_type TEXT CHECK (media_type IN ('image', 'video', 'audio', 'document')),
  category TEXT,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create artist_portfolio_likes table
CREATE TABLE IF NOT EXISTS public.artist_portfolio_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES public.artist_portfolio(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES public.anonymous_sessions(session_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(portfolio_id, user_id),
  UNIQUE(portfolio_id, session_id)
);

-- Create local_events table (enhanced version)
CREATE TABLE IF NOT EXISTS public.local_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('community', 'cultural', 'sports', 'educational', 'business', 'social', 'religious', 'political', 'environmental', 'health', 'other')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location_name TEXT,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  city TEXT,
  state TEXT,
  country TEXT,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  registration_required BOOLEAN DEFAULT FALSE,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  is_free BOOLEAN DEFAULT TRUE,
  ticket_price INTEGER DEFAULT 0, -- Price in paise
  currency TEXT DEFAULT 'inr',
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  social_media JSONB DEFAULT '{}',
  tags TEXT[],
  is_public BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'cancelled', 'completed', 'postponed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_attendees table
CREATE TABLE IF NOT EXISTS public.event_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.local_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES public.anonymous_sessions(session_id) ON DELETE CASCADE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  anonymous_name TEXT,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attending', 'not_attending', 'waitlist')),
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id),
  UNIQUE(event_id, session_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_discussions_event_id ON public.event_discussions(event_id);
CREATE INDEX IF NOT EXISTS idx_event_discussions_user_id ON public.event_discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_event_discussions_session_id ON public.event_discussions(session_id);
CREATE INDEX IF NOT EXISTS idx_event_discussions_parent_id ON public.event_discussions(parent_id);
CREATE INDEX IF NOT EXISTS idx_event_discussions_score ON public.event_discussions(score);
CREATE INDEX IF NOT EXISTS idx_event_discussion_votes_discussion_id ON public.event_discussion_votes(discussion_id);
CREATE INDEX IF NOT EXISTS idx_community_polls_post_id ON public.community_polls(post_id);
CREATE INDEX IF NOT EXISTS idx_community_polls_anonymous_post_id ON public.community_polls(anonymous_post_id);
CREATE INDEX IF NOT EXISTS idx_community_polls_user_id ON public.community_polls(user_id);
CREATE INDEX IF NOT EXISTS idx_community_polls_session_id ON public.community_polls(session_id);
CREATE INDEX IF NOT EXISTS idx_community_polls_is_active ON public.community_polls(is_active);
CREATE INDEX IF NOT EXISTS idx_community_polls_expires_at ON public.community_polls(expires_at);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON public.poll_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_session_id ON public.poll_votes(session_id);
CREATE INDEX IF NOT EXISTS idx_poll_comments_poll_id ON public.poll_comments(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_comments_user_id ON public.poll_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_poll_comments_session_id ON public.poll_comments(session_id);
CREATE INDEX IF NOT EXISTS idx_artist_engagements_artist_id ON public.artist_engagements(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_engagements_follower_id ON public.artist_engagements(follower_id);
CREATE INDEX IF NOT EXISTS idx_artist_engagements_session_id ON public.artist_engagements(session_id);
CREATE INDEX IF NOT EXISTS idx_artist_engagements_engagement_type ON public.artist_engagements(engagement_type);
CREATE INDEX IF NOT EXISTS idx_artist_followers_artist_id ON public.artist_followers(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_followers_follower_id ON public.artist_followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_artist_followers_session_id ON public.artist_followers(session_id);
CREATE INDEX IF NOT EXISTS idx_artist_portfolio_artist_id ON public.artist_portfolio(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_portfolio_is_public ON public.artist_portfolio(is_public);
CREATE INDEX IF NOT EXISTS idx_artist_portfolio_is_featured ON public.artist_portfolio(is_featured);
CREATE INDEX IF NOT EXISTS idx_artist_portfolio_likes_portfolio_id ON public.artist_portfolio_likes(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_artist_portfolio_likes_user_id ON public.artist_portfolio_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_portfolio_likes_session_id ON public.artist_portfolio_likes(session_id);
CREATE INDEX IF NOT EXISTS idx_local_events_organizer_id ON public.local_events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_local_events_start_date ON public.local_events(start_date);
CREATE INDEX IF NOT EXISTS idx_local_events_city ON public.local_events(city);
CREATE INDEX IF NOT EXISTS idx_local_events_state ON public.local_events(state);
CREATE INDEX IF NOT EXISTS idx_local_events_event_type ON public.local_events(event_type);
CREATE INDEX IF NOT EXISTS idx_local_events_is_public ON public.local_events(is_public);
CREATE INDEX IF NOT EXISTS idx_local_events_is_featured ON public.local_events(is_featured);
CREATE INDEX IF NOT EXISTS idx_local_events_status ON public.local_events(status);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON public.event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON public.event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_session_id ON public.event_attendees(session_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_status ON public.event_attendees(status);

-- Enable RLS on new tables
ALTER TABLE public.event_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_discussion_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_portfolio_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for event_discussions
CREATE POLICY "Anyone can view public event discussions" ON public.event_discussions
  FOR SELECT USING (is_moderated = false);

CREATE POLICY "Users can create event discussions" ON public.event_discussions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
  );

CREATE POLICY "Users can update their own event discussions" ON public.event_discussions
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
  );

-- Create RLS policies for event_discussion_votes
CREATE POLICY "Users can manage their own event discussion votes" ON public.event_discussion_votes
  FOR ALL USING (
    auth.uid() = user_id OR 
    session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
  );

-- Create RLS policies for community_polls
CREATE POLICY "Anyone can view public polls" ON public.community_polls
  FOR SELECT USING (is_public = true AND is_active = true);

CREATE POLICY "Users can create polls" ON public.community_polls
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
  );

CREATE POLICY "Users can update their own polls" ON public.community_polls
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
  );

-- Create RLS policies for poll_votes
CREATE POLICY "Users can manage their own poll votes" ON public.poll_votes
  FOR ALL USING (
    auth.uid() = user_id OR 
    session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
  );

-- Create RLS policies for poll_comments
CREATE POLICY "Anyone can view non-moderated poll comments" ON public.poll_comments
  FOR SELECT USING (is_moderated = false);

CREATE POLICY "Users can create poll comments" ON public.poll_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
  );

CREATE POLICY "Users can update their own poll comments" ON public.poll_comments
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
  );

-- Create RLS policies for artist_engagements
CREATE POLICY "Users can manage their own artist engagements" ON public.artist_engagements
  FOR ALL USING (
    auth.uid() = follower_id OR 
    session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
  );

-- Create RLS policies for artist_followers
CREATE POLICY "Users can view artist followers" ON public.artist_followers
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own artist follows" ON public.artist_followers
  FOR ALL USING (
    auth.uid() = follower_id OR 
    session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
  );

-- Create RLS policies for artist_portfolio
CREATE POLICY "Anyone can view public artist portfolio" ON public.artist_portfolio
  FOR SELECT USING (is_public = true);

CREATE POLICY "Artists can manage their own portfolio" ON public.artist_portfolio
  FOR ALL USING (auth.uid() = artist_id);

-- Create RLS policies for artist_portfolio_likes
CREATE POLICY "Users can manage their own portfolio likes" ON public.artist_portfolio_likes
  FOR ALL USING (
    auth.uid() = user_id OR 
    session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
  );

-- Create RLS policies for local_events
CREATE POLICY "Anyone can view public events" ON public.local_events
  FOR SELECT USING (is_public = true AND status = 'active');

CREATE POLICY "Users can create events" ON public.local_events
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their own events" ON public.local_events
  FOR UPDATE USING (auth.uid() = organizer_id);

-- Create RLS policies for event_attendees
CREATE POLICY "Anyone can view event attendees" ON public.event_attendees
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own event attendance" ON public.event_attendees
  FOR ALL USING (
    auth.uid() = user_id OR 
    session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
  );

-- Create triggers for updated_at
CREATE TRIGGER update_event_discussions_updated_at BEFORE UPDATE ON public.event_discussions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_discussion_votes_updated_at BEFORE UPDATE ON public.event_discussion_votes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_polls_updated_at BEFORE UPDATE ON public.community_polls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_poll_votes_updated_at BEFORE UPDATE ON public.poll_votes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_poll_comments_updated_at BEFORE UPDATE ON public.poll_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_engagements_updated_at BEFORE UPDATE ON public.artist_engagements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_followers_updated_at BEFORE UPDATE ON public.artist_followers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_portfolio_updated_at BEFORE UPDATE ON public.artist_portfolio
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_local_events_updated_at BEFORE UPDATE ON public.local_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_attendees_updated_at BEFORE UPDATE ON public.event_attendees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update poll vote counts
CREATE OR REPLACE FUNCTION update_poll_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.community_polls
    SET total_votes = (
      SELECT COUNT(*) FROM public.poll_votes WHERE poll_id = NEW.poll_id
    )
    WHERE id = NEW.poll_id;
    
    -- Update option vote counts
    UPDATE public.community_polls
    SET options = (
      SELECT jsonb_agg(
        jsonb_set(option, '{votes}', to_jsonb(
          (SELECT COUNT(*) FROM public.poll_votes 
           WHERE poll_id = NEW.poll_id 
           AND selected_options ? (option->>'id'))
        ))
      )
      FROM jsonb_array_elements(options) AS option
    )
    WHERE id = NEW.poll_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for poll vote counts
CREATE TRIGGER update_poll_vote_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.poll_votes
  FOR EACH ROW EXECUTE FUNCTION update_poll_vote_counts();

-- Create function to update event attendee count
CREATE OR REPLACE FUNCTION update_event_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.local_events
    SET current_attendees = (
      SELECT COUNT(*) FROM public.event_attendees 
      WHERE event_id = NEW.event_id AND status IN ('registered', 'attending')
    )
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.local_events
    SET current_attendees = (
      SELECT COUNT(*) FROM public.event_attendees 
      WHERE event_id = OLD.event_id AND status IN ('registered', 'attending')
    )
    WHERE id = OLD.event_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for event attendee count
CREATE TRIGGER update_event_attendee_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.event_attendees
  FOR EACH ROW EXECUTE FUNCTION update_event_attendee_count();
