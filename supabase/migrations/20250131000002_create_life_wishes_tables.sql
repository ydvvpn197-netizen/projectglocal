-- Create Life Wishes tables
-- Life wishes table
CREATE TABLE IF NOT EXISTS life_wishes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    encrypted_content TEXT,
    visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'family')),
    is_encrypted BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Life wish shares table
CREATE TABLE IF NOT EXISTS life_wish_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wish_id UUID REFERENCES life_wishes(id) ON DELETE CASCADE,
    shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_email TEXT,
    share_type TEXT NOT NULL CHECK (share_type IN ('user', 'email')),
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE life_wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_wish_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for life_wishes
CREATE POLICY "Users can view their own life wishes" ON life_wishes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public life wishes" ON life_wishes
    FOR SELECT USING (visibility = 'public');

CREATE POLICY "Users can view family life wishes" ON life_wishes
    FOR SELECT USING (visibility = 'family');

CREATE POLICY "Users can view shared life wishes" ON life_wishes
    FOR SELECT USING (
        id IN (
            SELECT wish_id FROM life_wish_shares 
            WHERE shared_with = auth.uid() OR shared_email = (
                SELECT email FROM auth.users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create their own life wishes" ON life_wishes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own life wishes" ON life_wishes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own life wishes" ON life_wishes
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for life_wish_shares
CREATE POLICY "Users can view shares of their own wishes" ON life_wish_shares
    FOR SELECT USING (auth.uid() = shared_by);

CREATE POLICY "Users can view shares with them" ON life_wish_shares
    FOR SELECT USING (
        auth.uid() = shared_with OR 
        shared_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

CREATE POLICY "Users can create shares for their own wishes" ON life_wish_shares
    FOR INSERT WITH CHECK (
        auth.uid() = shared_by AND
        wish_id IN (SELECT id FROM life_wishes WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update shares of their own wishes" ON life_wish_shares
    FOR UPDATE USING (auth.uid() = shared_by);

CREATE POLICY "Users can delete shares of their own wishes" ON life_wish_shares
    FOR DELETE USING (auth.uid() = shared_by);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_life_wishes_user_id ON life_wishes(user_id);
CREATE INDEX IF NOT EXISTS idx_life_wishes_visibility ON life_wishes(visibility);
CREATE INDEX IF NOT EXISTS idx_life_wishes_created_at ON life_wishes(created_at);
CREATE INDEX IF NOT EXISTS idx_life_wishes_updated_at ON life_wishes(updated_at);
CREATE INDEX IF NOT EXISTS idx_life_wish_shares_wish_id ON life_wish_shares(wish_id);
CREATE INDEX IF NOT EXISTS idx_life_wish_shares_shared_by ON life_wish_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_life_wish_shares_shared_with ON life_wish_shares(shared_with);
CREATE INDEX IF NOT EXISTS idx_life_wish_shares_shared_email ON life_wish_shares(shared_email);
CREATE INDEX IF NOT EXISTS idx_life_wish_shares_created_at ON life_wish_shares(created_at);
