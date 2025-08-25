-- Fix Community Page Errors
-- This script addresses the RLS policy issues and other problems causing errors

-- 1. Ensure group_members table has proper RLS policies
DROP POLICY IF EXISTS "Group members can view other members" ON public.group_members;
DROP POLICY IF EXISTS "Users can join public groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_members;

-- Create comprehensive RLS policies for group_members
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

CREATE POLICY "Group admins can manage members" ON public.group_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id 
      AND gm.user_id = auth.uid() 
      AND gm.role = 'admin'
    )
  );

-- 2. Ensure RLS is enabled on all necessary tables
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_members_user_group ON public.group_members(user_id, group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_role ON public.group_members(role);
CREATE INDEX IF NOT EXISTS idx_community_groups_public ON public.community_groups(is_public);

-- 4. Add a function to check if user can join a group
CREATE OR REPLACE FUNCTION can_join_group(group_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.community_groups 
    WHERE id = group_uuid 
    AND is_public = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant necessary permissions
GRANT EXECUTE ON FUNCTION can_join_group(UUID) TO authenticated;

-- 6. Ensure community_groups has proper RLS policies
DROP POLICY IF EXISTS "Users can view public groups" ON public.community_groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.community_groups;

CREATE POLICY "Users can view public groups" ON public.community_groups
  FOR SELECT USING (is_public = true);

CREATE POLICY "Authenticated users can create groups" ON public.community_groups
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- 7. Add sample data if none exists
INSERT INTO public.community_groups (name, description, category, created_by, location_city, location_state, location_country, is_public, member_count, post_count)
SELECT 
  'Local Artists Network',
  'Connect with local artists and share your work',
  'Arts & Culture',
  (SELECT id FROM auth.users LIMIT 1),
  'New York',
  'NY',
  'USA',
  true,
  0,
  0
WHERE NOT EXISTS (SELECT 1 FROM public.community_groups WHERE name = 'Local Artists Network');

INSERT INTO public.community_groups (name, description, category, created_by, location_city, location_state, location_country, is_public, member_count, post_count)
SELECT 
  'Tech Enthusiasts',
  'Discuss the latest in technology and innovation',
  'Technology',
  (SELECT id FROM auth.users LIMIT 1),
  'San Francisco',
  'CA',
  'USA',
  true,
  0,
  0
WHERE NOT EXISTS (SELECT 1 FROM public.community_groups WHERE name = 'Tech Enthusiasts');

INSERT INTO public.community_groups (name, description, category, created_by, location_city, location_state, location_country, is_public, member_count, post_count)
SELECT 
  'Food Lovers',
  'Share recipes and discover local restaurants',
  'Food & Dining',
  (SELECT id FROM auth.users LIMIT 1),
  'Chicago',
  'IL',
  'USA',
  true,
  0,
  0
WHERE NOT EXISTS (SELECT 1 FROM public.community_groups WHERE name = 'Food Lovers');

-- 8. Update member counts for existing groups
UPDATE public.community_groups 
SET member_count = (
  SELECT COUNT(*) 
  FROM public.group_members 
  WHERE group_id = community_groups.id
)
WHERE member_count IS NULL OR member_count = 0;

-- 9. Ensure all tables have proper foreign key constraints
ALTER TABLE public.group_members 
ADD CONSTRAINT IF NOT EXISTS fk_group_members_group_id 
FOREIGN KEY (group_id) REFERENCES public.community_groups(id) ON DELETE CASCADE;

ALTER TABLE public.group_members 
ADD CONSTRAINT IF NOT EXISTS fk_group_members_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 10. Create a trigger to update member count automatically
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_groups 
    SET member_count = member_count + 1 
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_groups 
    SET member_count = member_count - 1 
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_group_member_count ON public.group_members;
CREATE TRIGGER trigger_update_group_member_count
  AFTER INSERT OR DELETE ON public.group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_group_member_count();
