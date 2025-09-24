-- Create Legal Assistant tables
-- Legal chat sessions table
CREATE TABLE IF NOT EXISTS legal_chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Legal chat messages table
CREATE TABLE IF NOT EXISTS legal_chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES legal_chat_sessions(id) ON DELETE CASCADE,
    message_type TEXT NOT NULL CHECK (message_type IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Legal drafts table
CREATE TABLE IF NOT EXISTS legal_drafts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES legal_chat_sessions(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    document_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'final')),
    file_urls JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE legal_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for legal_chat_sessions
CREATE POLICY "Users can view their own legal chat sessions" ON legal_chat_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own legal chat sessions" ON legal_chat_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own legal chat sessions" ON legal_chat_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own legal chat sessions" ON legal_chat_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for legal_chat_messages
CREATE POLICY "Users can view messages from their own sessions" ON legal_chat_messages
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM legal_chat_sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in their own sessions" ON legal_chat_messages
    FOR INSERT WITH CHECK (
        session_id IN (
            SELECT id FROM legal_chat_sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update messages in their own sessions" ON legal_chat_messages
    FOR UPDATE USING (
        session_id IN (
            SELECT id FROM legal_chat_sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete messages in their own sessions" ON legal_chat_messages
    FOR DELETE USING (
        session_id IN (
            SELECT id FROM legal_chat_sessions WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for legal_drafts
CREATE POLICY "Users can view their own legal drafts" ON legal_drafts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own legal drafts" ON legal_drafts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own legal drafts" ON legal_drafts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own legal drafts" ON legal_drafts
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_legal_chat_sessions_user_id ON legal_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_chat_sessions_updated_at ON legal_chat_sessions(updated_at);
CREATE INDEX IF NOT EXISTS idx_legal_chat_messages_session_id ON legal_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_legal_chat_messages_created_at ON legal_chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_legal_drafts_user_id ON legal_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_drafts_updated_at ON legal_drafts(updated_at);
CREATE INDEX IF NOT EXISTS idx_legal_drafts_document_type ON legal_drafts(document_type);
CREATE INDEX IF NOT EXISTS idx_legal_drafts_status ON legal_drafts(status);
