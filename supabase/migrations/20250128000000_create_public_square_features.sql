-- Create Public Square Features Migration
-- This migration adds tables and functionality for the digital public square

-- Government Authorities Table
CREATE TABLE IF NOT EXISTS government_authorities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    contact_info JSONB,
    response_rate INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Government Article Tags Table
CREATE TABLE IF NOT EXISTS government_article_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
    government_authority_id UUID NOT NULL REFERENCES government_authorities(id) ON DELETE CASCADE,
    tagged_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'responded', 'resolved')),
    response_content TEXT,
    response_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id, government_authority_id)
);

-- Community Discussions Table
CREATE TABLE IF NOT EXISTS community_discussions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_government_response BOOLEAN DEFAULT false,
    government_authority VARCHAR(255),
    parent_discussion_id UUID REFERENCES community_discussions(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Discussion Replies Table
CREATE TABLE IF NOT EXISTS community_discussion_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discussion_id UUID NOT NULL REFERENCES community_discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Discussion Interactions Table
CREATE TABLE IF NOT EXISTS community_discussion_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discussion_id UUID REFERENCES community_discussions(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES community_discussion_replies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('like', 'dislike', 'flag')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(discussion_id, user_id, interaction_type),
    UNIQUE(reply_id, user_id, interaction_type),
    CHECK (
        (discussion_id IS NOT NULL AND reply_id IS NULL) OR 
        (discussion_id IS NULL AND reply_id IS NOT NULL)
    )
);

-- Virtual Protests Table
CREATE TABLE IF NOT EXISTS virtual_protests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    issue_category VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_authority_id UUID REFERENCES government_authorities(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'resolved', 'cancelled')),
    participants_count INTEGER DEFAULT 0,
    signatures_count INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Virtual Protest Participants Table
CREATE TABLE IF NOT EXISTS virtual_protest_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    protest_id UUID NOT NULL REFERENCES virtual_protests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    participation_type VARCHAR(50) DEFAULT 'supporter' CHECK (participation_type IN ('supporter', 'organizer', 'volunteer')),
    anonymous BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(protest_id, user_id)
);

-- Virtual Protest Signatures Table
CREATE TABLE IF NOT EXISTS virtual_protest_signatures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    protest_id UUID NOT NULL REFERENCES virtual_protests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    signature_data JSONB,
    anonymous BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(protest_id, user_id)
);

-- Enhanced News Articles Table (add new columns)
ALTER TABLE news_articles 
ADD COLUMN IF NOT EXISTS government_tags TEXT[],
ADD COLUMN IF NOT EXISTS community_impact_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS verified_facts BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS fact_check_status VARCHAR(50) DEFAULT 'pending' CHECK (fact_check_status IN ('verified', 'disputed', 'pending'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_government_article_tags_article_id ON government_article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_government_article_tags_authority_id ON government_article_tags(government_authority_id);
CREATE INDEX IF NOT EXISTS idx_government_article_tags_status ON government_article_tags(status);

CREATE INDEX IF NOT EXISTS idx_community_discussions_article_id ON community_discussions(article_id);
CREATE INDEX IF NOT EXISTS idx_community_discussions_user_id ON community_discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_community_discussions_parent_id ON community_discussions(parent_discussion_id);
CREATE INDEX IF NOT EXISTS idx_community_discussions_created_at ON community_discussions(created_at);

CREATE INDEX IF NOT EXISTS idx_community_discussion_replies_discussion_id ON community_discussion_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_community_discussion_replies_user_id ON community_discussion_replies(user_id);

CREATE INDEX IF NOT EXISTS idx_virtual_protests_location ON virtual_protests(location);
CREATE INDEX IF NOT EXISTS idx_virtual_protests_status ON virtual_protests(status);
CREATE INDEX IF NOT EXISTS idx_virtual_protests_created_at ON virtual_protests(created_at);
CREATE INDEX IF NOT EXISTS idx_virtual_protests_organizer_id ON virtual_protests(organizer_id);

CREATE INDEX IF NOT EXISTS idx_virtual_protest_participants_protest_id ON virtual_protest_participants(protest_id);
CREATE INDEX IF NOT EXISTS idx_virtual_protest_participants_user_id ON virtual_protest_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_virtual_protest_signatures_protest_id ON virtual_protest_signatures(protest_id);
CREATE INDEX IF NOT EXISTS idx_virtual_protest_signatures_user_id ON virtual_protest_signatures(user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_government_authorities_updated_at 
    BEFORE UPDATE ON government_authorities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_government_article_tags_updated_at 
    BEFORE UPDATE ON government_article_tags 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_discussions_updated_at 
    BEFORE UPDATE ON community_discussions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_discussion_replies_updated_at 
    BEFORE UPDATE ON community_discussion_replies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_virtual_protests_updated_at 
    BEFORE UPDATE ON virtual_protests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create functions for counting interactions
CREATE OR REPLACE FUNCTION update_discussion_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_discussions 
        SET likes_count = (
            SELECT COUNT(*) 
            FROM community_discussion_interactions 
            WHERE discussion_id = NEW.discussion_id 
            AND interaction_type = 'like'
        )
        WHERE id = NEW.discussion_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_discussions 
        SET likes_count = (
            SELECT COUNT(*) 
            FROM community_discussion_interactions 
            WHERE discussion_id = OLD.discussion_id 
            AND interaction_type = 'like'
        )
        WHERE id = OLD.discussion_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_discussion_likes_count_trigger
    AFTER INSERT OR DELETE ON community_discussion_interactions
    FOR EACH ROW EXECUTE FUNCTION update_discussion_likes_count();

-- Create function for updating protest participant counts
CREATE OR REPLACE FUNCTION update_protest_participants_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE virtual_protests 
        SET participants_count = (
            SELECT COUNT(*) 
            FROM virtual_protest_participants 
            WHERE protest_id = NEW.protest_id
        )
        WHERE id = NEW.protest_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE virtual_protests 
        SET participants_count = (
            SELECT COUNT(*) 
            FROM virtual_protest_participants 
            WHERE protest_id = OLD.protest_id
        )
        WHERE id = OLD.protest_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_protest_participants_count_trigger
    AFTER INSERT OR DELETE ON virtual_protest_participants
    FOR EACH ROW EXECUTE FUNCTION update_protest_participants_count();

-- Create function for updating protest signatures count
CREATE OR REPLACE FUNCTION update_protest_signatures_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE virtual_protests 
        SET signatures_count = (
            SELECT COUNT(*) 
            FROM virtual_protest_signatures 
            WHERE protest_id = NEW.protest_id
        )
        WHERE id = NEW.protest_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE virtual_protests 
        SET signatures_count = (
            SELECT COUNT(*) 
            FROM virtual_protest_signatures 
            WHERE protest_id = OLD.protest_id
        )
        WHERE id = OLD.protest_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_protest_signatures_count_trigger
    AFTER INSERT OR DELETE ON virtual_protest_signatures
    FOR EACH ROW EXECUTE FUNCTION update_protest_signatures_count();

-- Insert sample government authorities
INSERT INTO government_authorities (name, department, contact_info, response_rate, verified) VALUES
('Municipal Corporation', 'Local Government', '{"email": "info@municipal.gov.in", "phone": "+91-11-23456789"}', 85, true),
('Public Works Department', 'Infrastructure', '{"email": "pwd@gov.in", "phone": "+91-11-23456790"}', 72, true),
('Health Department', 'Public Health', '{"email": "health@gov.in", "phone": "+91-11-23456791"}', 90, true),
('Education Department', 'Education', '{"email": "education@gov.in", "phone": "+91-11-23456792"}', 78, true),
('Environment Department', 'Environment', '{"email": "environment@gov.in", "phone": "+91-11-23456793"}', 65, true),
('Transport Department', 'Transportation', '{"email": "transport@gov.in", "phone": "+91-11-23456794"}', 70, true),
('Police Department', 'Law Enforcement', '{"email": "police@gov.in", "phone": "+91-11-23456795"}', 88, true),
('Water Board', 'Water Supply', '{"email": "water@gov.in", "phone": "+91-11-23456796"}', 75, true)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE government_authorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE government_article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_discussion_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_protests ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_protest_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_protest_signatures ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Government Authorities - Public read access
CREATE POLICY "Government authorities are viewable by everyone" ON government_authorities
    FOR SELECT USING (true);

-- Government Article Tags - Users can create tags, view all tags
CREATE POLICY "Users can view government article tags" ON government_article_tags
    FOR SELECT USING (true);

CREATE POLICY "Users can create government article tags" ON government_article_tags
    FOR INSERT WITH CHECK (auth.uid() = tagged_by);

CREATE POLICY "Users can update their own government article tags" ON government_article_tags
    FOR UPDATE USING (auth.uid() = tagged_by);

-- Community Discussions - Users can view all, create their own, update their own
CREATE POLICY "Community discussions are viewable by everyone" ON community_discussions
    FOR SELECT USING (true);

CREATE POLICY "Users can create community discussions" ON community_discussions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own community discussions" ON community_discussions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own community discussions" ON community_discussions
    FOR DELETE USING (auth.uid() = user_id);

-- Community Discussion Replies - Users can view all, create their own, update their own
CREATE POLICY "Community discussion replies are viewable by everyone" ON community_discussion_replies
    FOR SELECT USING (true);

CREATE POLICY "Users can create community discussion replies" ON community_discussion_replies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own community discussion replies" ON community_discussion_replies
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own community discussion replies" ON community_discussion_replies
    FOR DELETE USING (auth.uid() = user_id);

-- Community Discussion Interactions - Users can view all, create their own, update their own
CREATE POLICY "Community discussion interactions are viewable by everyone" ON community_discussion_interactions
    FOR SELECT USING (true);

CREATE POLICY "Users can create community discussion interactions" ON community_discussion_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own community discussion interactions" ON community_discussion_interactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own community discussion interactions" ON community_discussion_interactions
    FOR DELETE USING (auth.uid() = user_id);

-- Virtual Protests - Users can view all, create their own, update their own
CREATE POLICY "Virtual protests are viewable by everyone" ON virtual_protests
    FOR SELECT USING (true);

CREATE POLICY "Users can create virtual protests" ON virtual_protests
    FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update their own virtual protests" ON virtual_protests
    FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Users can delete their own virtual protests" ON virtual_protests
    FOR DELETE USING (auth.uid() = organizer_id);

-- Virtual Protest Participants - Users can view all, create their own, update their own
CREATE POLICY "Virtual protest participants are viewable by everyone" ON virtual_protest_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can create virtual protest participants" ON virtual_protest_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own virtual protest participants" ON virtual_protest_participants
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own virtual protest participants" ON virtual_protest_participants
    FOR DELETE USING (auth.uid() = user_id);

-- Virtual Protest Signatures - Users can view all, create their own, update their own
CREATE POLICY "Virtual protest signatures are viewable by everyone" ON virtual_protest_signatures
    FOR SELECT USING (true);

CREATE POLICY "Users can create virtual protest signatures" ON virtual_protest_signatures
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own virtual protest signatures" ON virtual_protest_signatures
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own virtual protest signatures" ON virtual_protest_signatures
    FOR DELETE USING (auth.uid() = user_id);
