-- Create government authorities table
CREATE TABLE IF NOT EXISTS government_authorities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('local', 'state', 'national')),
  contact_email TEXT,
  contact_phone TEXT,
  jurisdiction TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create government polls table
CREATE TABLE IF NOT EXISTS government_polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  category TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_votes INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT false,
  tagged_authorities UUID[] DEFAULT '{}'
);

-- Create poll options table
CREATE TABLE IF NOT EXISTS poll_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES government_polls(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  option_index INTEGER NOT NULL,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create poll votes table
CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES government_polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id) -- One vote per user per poll
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_government_authorities_level ON government_authorities(level);
CREATE INDEX IF NOT EXISTS idx_government_authorities_active ON government_authorities(is_active);
CREATE INDEX IF NOT EXISTS idx_government_polls_created_by ON government_polls(created_by);
CREATE INDEX IF NOT EXISTS idx_government_polls_active ON government_polls(is_active);
CREATE INDEX IF NOT EXISTS idx_government_polls_expires_at ON government_polls(expires_at);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON poll_votes(user_id);

-- Enable RLS
ALTER TABLE government_authorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE government_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for government_authorities
CREATE POLICY "Anyone can view active government authorities" ON government_authorities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage government authorities" ON government_authorities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND user_type = 'admin'
    )
  );

-- RLS Policies for government_polls
CREATE POLICY "Anyone can view active government polls" ON government_polls
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create government polls" ON government_polls
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own government polls" ON government_polls
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own government polls" ON government_polls
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for poll_options
CREATE POLICY "Anyone can view poll options" ON poll_options
  FOR SELECT USING (true);

CREATE POLICY "Users can create poll options for their polls" ON poll_options
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM government_polls 
      WHERE id = poll_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update poll options for their polls" ON poll_options
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM government_polls 
      WHERE id = poll_id 
      AND created_by = auth.uid()
    )
  );

-- RLS Policies for poll_votes
CREATE POLICY "Users can view their own votes" ON poll_votes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create votes" ON poll_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON poll_votes
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to update poll vote counts
CREATE OR REPLACE FUNCTION update_poll_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total votes for the poll
  UPDATE government_polls 
  SET total_votes = (
    SELECT COUNT(*) 
    FROM poll_votes 
    WHERE poll_id = COALESCE(NEW.poll_id, OLD.poll_id)
  )
  WHERE id = COALESCE(NEW.poll_id, OLD.poll_id);
  
  -- Update individual option vote counts
  UPDATE poll_options 
  SET votes = (
    SELECT COUNT(*) 
    FROM poll_votes 
    WHERE poll_id = COALESCE(NEW.poll_id, OLD.poll_id)
    AND option_index = poll_options.option_index
  )
  WHERE poll_id = COALESCE(NEW.poll_id, OLD.poll_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update vote counts when votes are added/updated/deleted
CREATE TRIGGER update_poll_vote_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON poll_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_poll_vote_counts();

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_government_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update the updated_at timestamp
CREATE TRIGGER update_government_authorities_updated_at
  BEFORE UPDATE ON government_authorities
  FOR EACH ROW
  EXECUTE FUNCTION update_government_tables_updated_at();

CREATE TRIGGER update_government_polls_updated_at
  BEFORE UPDATE ON government_polls
  FOR EACH ROW
  EXECUTE FUNCTION update_government_tables_updated_at();

-- Insert sample government authorities
INSERT INTO government_authorities (name, department, level, jurisdiction, contact_email, description) VALUES
  ('Municipal Corporation', 'Local Administration', 'local', 'Delhi', 'info@mcd.gov.in', 'Local municipal administration for Delhi'),
  ('Delhi Development Authority', 'Urban Planning', 'local', 'Delhi', 'info@dda.org.in', 'Urban planning and development authority'),
  ('Delhi Police', 'Law Enforcement', 'local', 'Delhi', 'info@delhipolice.gov.in', 'Local law enforcement agency'),
  ('Delhi Transport Corporation', 'Public Transport', 'local', 'Delhi', 'info@dtc.gov.in', 'Public bus transport service'),
  ('Delhi Jal Board', 'Water Supply', 'local', 'Delhi', 'info@delhijalboard.nic.in', 'Water supply and sewage management'),
  ('Government of Delhi', 'State Administration', 'state', 'Delhi', 'info@delhi.gov.in', 'State government administration'),
  ('Delhi State Transport', 'Transport', 'state', 'Delhi', 'info@dst.gov.in', 'State transport services'),
  ('Ministry of Urban Development', 'Urban Development', 'national', 'India', 'info@moud.gov.in', 'National urban development ministry'),
  ('Ministry of Road Transport', 'Transport', 'national', 'India', 'info@morth.gov.in', 'National road transport ministry'),
  ('Ministry of Environment', 'Environment', 'national', 'India', 'info@moef.gov.in', 'National environment ministry')
ON CONFLICT DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE government_authorities IS 'Government authorities that can be tagged in polls for local issues';
COMMENT ON TABLE government_polls IS 'Polls created by users to discuss local issues with government authorities';
COMMENT ON TABLE poll_options IS 'Options available for voting in government polls';
COMMENT ON TABLE poll_votes IS 'Votes cast by users on government polls';
COMMENT ON COLUMN government_polls.tagged_authorities IS 'Array of government authority IDs tagged in this poll';
COMMENT ON COLUMN government_polls.is_anonymous IS 'Whether voting in this poll is anonymous';
COMMENT ON COLUMN poll_votes.is_anonymous IS 'Whether this vote was cast anonymously';
