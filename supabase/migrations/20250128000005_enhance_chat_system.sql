-- Create chat rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_group BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat room participants table
CREATE TABLE IF NOT EXISTS chat_room_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chat_room_id, user_id)
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'audio')),
  media_url TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create message reactions table
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'angry', 'sad', 'wow')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, reaction_type)
);

-- Create typing indicators table
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chat_room_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_by ON chat_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_is_public ON chat_rooms(is_public);
CREATE INDEX IF NOT EXISTS idx_chat_room_participants_room_id ON chat_room_participants(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_participants_user_id ON chat_room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_room_id ON typing_indicators(chat_room_id);

-- Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rooms
CREATE POLICY "Users can view rooms they participate in" ON chat_rooms
  FOR SELECT USING (
    id IN (
      SELECT chat_room_id 
      FROM chat_room_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chat rooms" ON chat_rooms
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room admins can update rooms" ON chat_rooms
  FOR UPDATE USING (
    auth.uid() = created_by OR
    auth.uid() IN (
      SELECT user_id 
      FROM chat_room_participants 
      WHERE chat_room_id = id 
      AND role = 'admin'
    )
  );

CREATE POLICY "Room creators can delete rooms" ON chat_rooms
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for chat_room_participants
CREATE POLICY "Users can view participants of their rooms" ON chat_room_participants
  FOR SELECT USING (
    chat_room_id IN (
      SELECT chat_room_id 
      FROM chat_room_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join public rooms" ON chat_room_participants
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    chat_room_id IN (
      SELECT id FROM chat_rooms WHERE is_public = true
    )
  );

CREATE POLICY "Room admins can add participants" ON chat_room_participants
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id 
      FROM chat_room_participants 
      WHERE chat_room_id = chat_room_participants.chat_room_id 
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can leave rooms" ON chat_room_participants
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their rooms" ON chat_messages
  FOR SELECT USING (
    chat_room_id IN (
      SELECT chat_room_id 
      FROM chat_room_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in their rooms" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    chat_room_id IN (
      SELECT chat_room_id 
      FROM chat_room_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages" ON chat_messages
  FOR UPDATE USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages" ON chat_messages
  FOR DELETE USING (auth.uid() = sender_id);

-- RLS Policies for message_reactions
CREATE POLICY "Users can view reactions in their rooms" ON message_reactions
  FOR SELECT USING (
    message_id IN (
      SELECT cm.id 
      FROM chat_messages cm
      JOIN chat_room_participants crp ON cm.chat_room_id = crp.chat_room_id
      WHERE crp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add reactions to messages" ON message_reactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    message_id IN (
      SELECT cm.id 
      FROM chat_messages cm
      JOIN chat_room_participants crp ON cm.chat_room_id = crp.chat_room_id
      WHERE crp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove their own reactions" ON message_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for typing_indicators
CREATE POLICY "Users can view typing indicators in their rooms" ON typing_indicators
  FOR SELECT USING (
    chat_room_id IN (
      SELECT chat_room_id 
      FROM chat_room_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own typing indicators" ON typing_indicators
  FOR ALL USING (auth.uid() = user_id);

-- Function to update room's updated_at timestamp when messages are added
CREATE OR REPLACE FUNCTION update_chat_room_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_rooms 
  SET updated_at = NOW()
  WHERE id = NEW.chat_room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update room timestamp when messages are added
CREATE TRIGGER update_chat_room_updated_at_trigger
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_room_updated_at();

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update the updated_at timestamp
CREATE TRIGGER update_chat_rooms_updated_at
  BEFORE UPDATE ON chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_tables_updated_at();

CREATE TRIGGER update_chat_messages_updated_at
  BEFORE UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_tables_updated_at();

CREATE TRIGGER update_typing_indicators_updated_at
  BEFORE UPDATE ON typing_indicators
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_tables_updated_at();

-- Function to clean up old typing indicators
CREATE OR REPLACE FUNCTION cleanup_typing_indicators()
RETURNS void AS $$
BEGIN
  DELETE FROM typing_indicators 
  WHERE updated_at < NOW() - INTERVAL '30 seconds';
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE chat_rooms IS 'Chat rooms for community messaging with support for direct messages and group chats';
COMMENT ON TABLE chat_room_participants IS 'Participants in chat rooms with role-based access';
COMMENT ON TABLE chat_messages IS 'Messages in chat rooms with support for anonymous messaging';
COMMENT ON TABLE message_reactions IS 'Reactions to messages (like, love, laugh, etc.)';
COMMENT ON TABLE typing_indicators IS 'Real-time typing indicators for chat rooms';
COMMENT ON COLUMN chat_messages.is_anonymous IS 'Whether the message was sent anonymously';
COMMENT ON COLUMN chat_messages.message_type IS 'Type of message: text, image, file, or audio';
COMMENT ON COLUMN chat_room_participants.role IS 'Role in the chat room: admin or member';
