-- Create Community Polls System Migration
-- This migration adds tables for community polling functionality

-- Community Polls Table
CREATE TABLE IF NOT EXISTS community_polls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
    visibility VARCHAR(50) DEFAULT 'public' CHECK (visibility IN ('public', 'community', 'private')),
    government_tagged BOOLEAN DEFAULT false,
    government_authority VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    community_impact_score INTEGER DEFAULT 0,
    discussion_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll Options Table
CREATE TABLE IF NOT EXISTS poll_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID NOT NULL REFERENCES community_polls(id) ON DELETE CASCADE,
    text VARCHAR(500) NOT NULL,
    vote_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll Votes Table
CREATE TABLE IF NOT EXISTS poll_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID NOT NULL REFERENCES community_polls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(poll_id, user_id)
);

-- Poll Discussions Table
CREATE TABLE IF NOT EXISTS poll_discussions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID NOT NULL REFERENCES community_polls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll Discussion Interactions Table
CREATE TABLE IF NOT EXISTS poll_discussion_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discussion_id UUID NOT NULL REFERENCES poll_discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('like', 'dislike', 'flag')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(discussion_id, user_id, interaction_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_polls_created_by ON community_polls(created_by);
CREATE INDEX IF NOT EXISTS idx_community_polls_category ON community_polls(category);
CREATE INDEX IF NOT EXISTS idx_community_polls_location ON community_polls(location);
CREATE INDEX IF NOT EXISTS idx_community_polls_status ON community_polls(status);
CREATE INDEX IF NOT EXISTS idx_community_polls_visibility ON community_polls(visibility);
CREATE INDEX IF NOT EXISTS idx_community_polls_created_at ON community_polls(created_at);
CREATE INDEX IF NOT EXISTS idx_community_polls_expires_at ON community_polls(expires_at);

CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON poll_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_option_id ON poll_votes(option_id);

CREATE INDEX IF NOT EXISTS idx_poll_discussions_poll_id ON poll_discussions(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_discussions_user_id ON poll_discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_poll_discussions_created_at ON poll_discussions(created_at);

CREATE INDEX IF NOT EXISTS idx_poll_discussion_interactions_discussion_id ON poll_discussion_interactions(discussion_id);
CREATE INDEX IF NOT EXISTS idx_poll_discussion_interactions_user_id ON poll_discussion_interactions(user_id);

-- Create updated_at triggers
CREATE TRIGGER update_community_polls_updated_at 
    BEFORE UPDATE ON community_polls 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_poll_options_updated_at 
    BEFORE UPDATE ON poll_options 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_poll_discussions_updated_at 
    BEFORE UPDATE ON poll_discussions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function for updating poll option vote counts
CREATE OR REPLACE FUNCTION update_poll_option_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE poll_options 
        SET vote_count = (
            SELECT COUNT(*) 
            FROM poll_votes 
            WHERE option_id = NEW.option_id
        )
        WHERE id = NEW.option_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE poll_options 
        SET vote_count = (
            SELECT COUNT(*) 
            FROM poll_votes 
            WHERE option_id = OLD.option_id
        )
        WHERE id = OLD.option_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_poll_option_vote_count_trigger
    AFTER INSERT OR DELETE ON poll_votes
    FOR EACH ROW EXECUTE FUNCTION update_poll_option_vote_count();

-- Create function for updating poll discussion counts
CREATE OR REPLACE FUNCTION update_poll_discussion_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_polls 
        SET discussion_count = (
            SELECT COUNT(*) 
            FROM poll_discussions 
            WHERE poll_id = NEW.poll_id
        )
        WHERE id = NEW.poll_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_polls 
        SET discussion_count = (
            SELECT COUNT(*) 
            FROM poll_discussions 
            WHERE poll_id = OLD.poll_id
        )
        WHERE id = OLD.poll_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_poll_discussion_count_trigger
    AFTER INSERT OR DELETE ON poll_discussions
    FOR EACH ROW EXECUTE FUNCTION update_poll_discussion_count();

-- Create function for updating poll discussion likes count
CREATE OR REPLACE FUNCTION update_poll_discussion_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE poll_discussions 
        SET likes_count = (
            SELECT COUNT(*) 
            FROM poll_discussion_interactions 
            WHERE discussion_id = NEW.discussion_id 
            AND interaction_type = 'like'
        )
        WHERE id = NEW.discussion_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE poll_discussions 
        SET likes_count = (
            SELECT COUNT(*) 
            FROM poll_discussion_interactions 
            WHERE discussion_id = OLD.discussion_id 
            AND interaction_type = 'like'
        )
        WHERE id = OLD.discussion_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_poll_discussion_likes_count_trigger
    AFTER INSERT OR DELETE ON poll_discussion_interactions
    FOR EACH ROW EXECUTE FUNCTION update_poll_discussion_likes_count();

-- Enable Row Level Security
ALTER TABLE community_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_discussion_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Community Polls - Users can view public/community polls, create their own, update their own
CREATE POLICY "Community polls are viewable based on visibility" ON community_polls
    FOR SELECT USING (
        visibility = 'public' OR 
        (visibility = 'community' AND auth.uid() IS NOT NULL) OR
        (visibility = 'private' AND auth.uid() = created_by)
    );

CREATE POLICY "Users can create community polls" ON community_polls
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own community polls" ON community_polls
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own community polls" ON community_polls
    FOR DELETE USING (auth.uid() = created_by);

-- Poll Options - Users can view all options for polls they can see
CREATE POLICY "Poll options are viewable for accessible polls" ON poll_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM community_polls 
            WHERE id = poll_id AND (
                visibility = 'public' OR 
                (visibility = 'community' AND auth.uid() IS NOT NULL) OR
                (visibility = 'private' AND auth.uid() = created_by)
            )
        )
    );

CREATE POLICY "Users can create poll options for their own polls" ON poll_options
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM community_polls 
            WHERE id = poll_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update poll options for their own polls" ON poll_options
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM community_polls 
            WHERE id = poll_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete poll options for their own polls" ON poll_options
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM community_polls 
            WHERE id = poll_id AND created_by = auth.uid()
        )
    );

-- Poll Votes - Users can view all votes, create their own, update their own
CREATE POLICY "Poll votes are viewable for accessible polls" ON poll_votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM community_polls 
            WHERE id = poll_id AND (
                visibility = 'public' OR 
                (visibility = 'community' AND auth.uid() IS NOT NULL) OR
                (visibility = 'private' AND auth.uid() = created_by)
            )
        )
    );

CREATE POLICY "Users can create poll votes" ON poll_votes
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM community_polls 
            WHERE id = poll_id AND (
                visibility = 'public' OR 
                (visibility = 'community' AND auth.uid() IS NOT NULL) OR
                (visibility = 'private' AND auth.uid() = created_by)
            )
        )
    );

CREATE POLICY "Users can update their own poll votes" ON poll_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own poll votes" ON poll_votes
    FOR DELETE USING (auth.uid() = user_id);

-- Poll Discussions - Users can view discussions for accessible polls, create their own, update their own
CREATE POLICY "Poll discussions are viewable for accessible polls" ON poll_discussions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM community_polls 
            WHERE id = poll_id AND (
                visibility = 'public' OR 
                (visibility = 'community' AND auth.uid() IS NOT NULL) OR
                (visibility = 'private' AND auth.uid() = created_by)
            )
        )
    );

CREATE POLICY "Users can create poll discussions" ON poll_discussions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM community_polls 
            WHERE id = poll_id AND (
                visibility = 'public' OR 
                (visibility = 'community' AND auth.uid() IS NOT NULL) OR
                (visibility = 'private' AND auth.uid() = created_by)
            )
        )
    );

CREATE POLICY "Users can update their own poll discussions" ON poll_discussions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own poll discussions" ON poll_discussions
    FOR DELETE USING (auth.uid() = user_id);

-- Poll Discussion Interactions - Users can view all interactions, create their own, update their own
CREATE POLICY "Poll discussion interactions are viewable for accessible polls" ON poll_discussion_interactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM poll_discussions pd
            JOIN community_polls cp ON pd.poll_id = cp.id
            WHERE pd.id = discussion_id AND (
                cp.visibility = 'public' OR 
                (cp.visibility = 'community' AND auth.uid() IS NOT NULL) OR
                (cp.visibility = 'private' AND auth.uid() = cp.created_by)
            )
        )
    );

CREATE POLICY "Users can create poll discussion interactions" ON poll_discussion_interactions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM poll_discussions pd
            JOIN community_polls cp ON pd.poll_id = cp.id
            WHERE pd.id = discussion_id AND (
                cp.visibility = 'public' OR 
                (cp.visibility = 'community' AND auth.uid() IS NOT NULL) OR
                (cp.visibility = 'private' AND auth.uid() = cp.created_by)
            )
        )
    );

CREATE POLICY "Users can update their own poll discussion interactions" ON poll_discussion_interactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own poll discussion interactions" ON poll_discussion_interactions
    FOR DELETE USING (auth.uid() = user_id);
