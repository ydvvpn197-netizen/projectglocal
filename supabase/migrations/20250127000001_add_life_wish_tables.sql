-- Life Wish Feature - Database Schema
-- This migration creates all necessary tables for the Life Wish/Legacy feature

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE life_wish_visibility AS ENUM (
  'public', 'private', 'family'
);

CREATE TYPE life_wish_category AS ENUM (
  'legacy', 'values', 'memories', 'advice', 'other'
);

CREATE TYPE family_access_status AS ENUM (
  'pending', 'approved', 'denied'
);

-- Life Wishes Table
CREATE TABLE public.life_wishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  visibility life_wish_visibility NOT NULL DEFAULT 'private',
  category life_wish_category NOT NULL DEFAULT 'other',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Life Wish Timeline Table
CREATE TABLE public.life_wish_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wish_id UUID NOT NULL REFERENCES public.life_wishes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT FALSE
);

-- Memorial Profiles Table
CREATE TABLE public.memorial_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  is_memorial BOOLEAN DEFAULT FALSE,
  memorial_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Access Table (for accessing family members' private wishes)
CREATE TABLE public.family_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  status family_access_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, profile_id)
);

-- Create indexes for performance
CREATE INDEX idx_life_wishes_user_id ON public.life_wishes(user_id);
CREATE INDEX idx_life_wishes_visibility ON public.life_wishes(visibility);
CREATE INDEX idx_life_wishes_category ON public.life_wishes(category);
CREATE INDEX idx_life_wishes_tags ON public.life_wishes USING GIN(tags);
CREATE INDEX idx_life_wishes_created_at ON public.life_wishes(created_at);
CREATE INDEX idx_life_wishes_is_active ON public.life_wishes(is_active);

CREATE INDEX idx_life_wish_timeline_wish_id ON public.life_wish_timeline(wish_id);
CREATE INDEX idx_life_wish_timeline_user_id ON public.life_wish_timeline(user_id);
CREATE INDEX idx_life_wish_timeline_timestamp ON public.life_wish_timeline(timestamp);

CREATE INDEX idx_memorial_profiles_user_id ON public.memorial_profiles(user_id);
CREATE INDEX idx_memorial_profiles_is_memorial ON public.memorial_profiles(is_memorial);

CREATE INDEX idx_family_access_user_id ON public.family_access(user_id);
CREATE INDEX idx_family_access_profile_id ON public.family_access(profile_id);
CREATE INDEX idx_family_access_status ON public.family_access(status);

-- Enable Row Level Security
ALTER TABLE public.life_wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_wish_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memorial_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for life_wishes
CREATE POLICY "Users can view their own life wishes"
  ON public.life_wishes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public life wishes"
  ON public.life_wishes FOR SELECT
  USING (visibility = 'public' AND is_active = TRUE);

CREATE POLICY "Users can view family life wishes if they have access"
  ON public.life_wishes FOR SELECT
  USING (
    visibility = 'family' AND is_active = TRUE AND (
      auth.uid() = user_id OR
      EXISTS (
        SELECT 1 FROM public.family_access 
        WHERE user_id = auth.uid() 
        AND profile_id = life_wishes.user_id 
        AND status = 'approved'
      )
    )
  );

CREATE POLICY "Users can insert their own life wishes"
  ON public.life_wishes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own life wishes"
  ON public.life_wishes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own life wishes"
  ON public.life_wishes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for life_wish_timeline
CREATE POLICY "Users can view timeline entries for their wishes"
  ON public.life_wish_timeline FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.life_wishes 
      WHERE id = wish_id 
      AND (
        user_id = auth.uid() OR
        (visibility = 'public' AND is_active = TRUE) OR
        (visibility = 'family' AND EXISTS (
          SELECT 1 FROM public.family_access 
          WHERE user_id = auth.uid() 
          AND profile_id = life_wishes.user_id 
          AND status = 'approved'
        ))
      )
    )
  );

CREATE POLICY "Users can insert timeline entries for their wishes"
  ON public.life_wish_timeline FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.life_wishes 
      WHERE id = wish_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own timeline entries"
  ON public.life_wish_timeline FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timeline entries"
  ON public.life_wish_timeline FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for memorial_profiles
CREATE POLICY "Users can view their own memorial profile"
  ON public.memorial_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public memorial profiles"
  ON public.memorial_profiles FOR SELECT
  USING (is_memorial = TRUE);

CREATE POLICY "Users can insert their own memorial profile"
  ON public.memorial_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memorial profile"
  ON public.memorial_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memorial profile"
  ON public.memorial_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for family_access
CREATE POLICY "Users can view their own family access requests"
  ON public.family_access FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = profile_id);

CREATE POLICY "Users can insert family access requests"
  ON public.family_access FOR INSERT
  WITH CHECK (auth.uid() = user_id AND user_id != profile_id);

CREATE POLICY "Users can update family access requests for their profile"
  ON public.family_access FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own family access requests"
  ON public.family_access FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_life_wishes_updated_at
  BEFORE UPDATE ON public.life_wishes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memorial_profiles_updated_at
  BEFORE UPDATE ON public.memorial_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_access_updated_at
  BEFORE UPDATE ON public.family_access
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to encrypt sensitive content (optional)
CREATE OR REPLACE FUNCTION encrypt_life_wish_content()
RETURNS TRIGGER AS $$
BEGIN
  -- For private wishes, we could encrypt the content
  -- This is a placeholder for future encryption implementation
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for content encryption (disabled for now)
-- CREATE TRIGGER trigger_encrypt_life_wish_content
--   BEFORE INSERT OR UPDATE ON public.life_wishes
--   FOR EACH ROW EXECUTE FUNCTION encrypt_life_wish_content();

-- Add comments for documentation
COMMENT ON TABLE public.life_wishes IS 'Stores user life wishes and legacy content';
COMMENT ON TABLE public.life_wish_timeline IS 'Stores timeline entries for life wishes';
COMMENT ON TABLE public.memorial_profiles IS 'Stores memorial profile information';
COMMENT ON TABLE public.family_access IS 'Manages family access to private life wishes';

COMMENT ON COLUMN public.life_wishes.visibility IS 'Visibility level: public, private, or family-only';
COMMENT ON COLUMN public.life_wishes.category IS 'Category of the life wish for organization';
COMMENT ON COLUMN public.life_wishes.tags IS 'Array of tags for categorization and search';
COMMENT ON COLUMN public.life_wishes.is_active IS 'Soft delete flag';
COMMENT ON COLUMN public.life_wish_timeline.is_public IS 'Whether timeline entry is public';
COMMENT ON COLUMN public.memorial_profiles.is_memorial IS 'Whether this is a memorial profile';
COMMENT ON COLUMN public.memorial_profiles.memorial_date IS 'Date when person passed away';
COMMENT ON COLUMN public.family_access.relationship IS 'Relationship to the profile owner';
COMMENT ON COLUMN public.family_access.status IS 'Status of the access request';

-- Create view for public memorial feed
CREATE VIEW public.memorial_feed AS
SELECT 
  mp.id,
  mp.user_id,
  mp.display_name,
  mp.bio,
  mp.avatar_url,
  mp.is_memorial,
  mp.memorial_date,
  mp.created_at,
  COUNT(lw.id) as wish_count
FROM public.memorial_profiles mp
LEFT JOIN public.life_wishes lw ON mp.user_id = lw.user_id AND lw.visibility = 'public' AND lw.is_active = TRUE
WHERE mp.is_memorial = TRUE
GROUP BY mp.id, mp.user_id, mp.display_name, mp.bio, mp.avatar_url, mp.is_memorial, mp.memorial_date, mp.created_at
ORDER BY mp.created_at DESC;

-- Grant access to the view
GRANT SELECT ON public.memorial_feed TO authenticated;
GRANT SELECT ON public.memorial_feed TO anon;
