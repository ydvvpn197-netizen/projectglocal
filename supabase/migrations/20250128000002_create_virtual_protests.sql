-- Create Virtual Protests System Migration
-- This migration adds tables for virtual protest functionality

-- Protest Discussions Table
CREATE TABLE IF NOT EXISTS protest_discussions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    protest_id UUID NOT NULL REFERENCES virtual_protests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Protest Discussion Interactions Table
CREATE TABLE IF NOT EXISTS protest_discussion_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discussion_id UUID NOT NULL REFERENCES protest_discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('like', 'dislike', 'flag')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(discussion_id, user_id, interaction_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_protest_discussions_protest_id ON protest_discussions(protest_id);
CREATE INDEX IF NOT EXISTS idx_protest_discussions_user_id ON protest_discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_protest_discussions_created_at ON protest_discussions(created_at);

CREATE INDEX IF NOT EXISTS idx_protest_discussion_interactions_discussion_id ON protest_discussion_interactions(discussion_id);
CREATE INDEX IF NOT EXISTS idx_protest_discussion_interactions_user_id ON protest_discussion_interactions(user_id);

-- Create updated_at trigger
CREATE TRIGGER update_protest_discussions_updated_at 
    BEFORE UPDATE ON protest_discussions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function for updating protest discussion likes count
CREATE OR REPLACE FUNCTION update_protest_discussion_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE protest_discussions 
        SET likes_count = (
            SELECT COUNT(*) 
            FROM protest_discussion_interactions 
            WHERE discussion_id = NEW.discussion_id 
            AND interaction_type = 'like'
        )
        WHERE id = NEW.discussion_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE protest_discussions 
        SET likes_count = (
            SELECT COUNT(*) 
            FROM protest_discussion_interactions 
            WHERE discussion_id = OLD.discussion_id 
            AND interaction_type = 'like'
        )
        WHERE id = OLD.discussion_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_protest_discussion_likes_count_trigger
    AFTER INSERT OR DELETE ON protest_discussion_interactions
    FOR EACH ROW EXECUTE FUNCTION update_protest_discussion_likes_count();

-- Enable Row Level Security
ALTER TABLE protest_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE protest_discussion_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Protest Discussions - Users can view discussions for accessible protests, create their own, update their own
CREATE POLICY "Protest discussions are viewable for accessible protests" ON protest_discussions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM virtual_protests 
            WHERE id = protest_id AND status IN ('active', 'paused')
        )
    );

CREATE POLICY "Users can create protest discussions" ON protest_discussions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM virtual_protests 
            WHERE id = protest_id AND status IN ('active', 'paused')
        )
    );

CREATE POLICY "Users can update their own protest discussions" ON protest_discussions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own protest discussions" ON protest_discussions
    FOR DELETE USING (auth.uid() = user_id);

-- Protest Discussion Interactions - Users can view all interactions, create their own, update their own
CREATE POLICY "Protest discussion interactions are viewable for accessible protests" ON protest_discussion_interactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM protest_discussions pd
            JOIN virtual_protests vp ON pd.protest_id = vp.id
            WHERE pd.id = discussion_id AND vp.status IN ('active', 'paused')
        )
    );

CREATE POLICY "Users can create protest discussion interactions" ON protest_discussion_interactions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM protest_discussions pd
            JOIN virtual_protests vp ON pd.protest_id = vp.id
            WHERE pd.id = discussion_id AND vp.status IN ('active', 'paused')
        )
    );

CREATE POLICY "Users can update their own protest discussion interactions" ON protest_discussion_interactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own protest discussion interactions" ON protest_discussion_interactions
    FOR DELETE USING (auth.uid() = user_id);
