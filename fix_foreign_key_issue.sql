-- Fix Foreign Key Constraint Issue
-- Run this script in your Supabase SQL Editor

-- 1. First, let's check what groups exist
SELECT id, name, is_public FROM community_groups LIMIT 10;

-- 2. Check if group_members table has any orphaned records
SELECT gm.*, cg.name as group_name 
FROM group_members gm 
LEFT JOIN community_groups cg ON gm.group_id = cg.id 
WHERE cg.id IS NULL;

-- 3. Clean up any orphaned group_members records
DELETE FROM group_members 
WHERE group_id NOT IN (SELECT id FROM community_groups);

-- 4. Ensure the foreign key constraint is properly set up
ALTER TABLE group_members 
DROP CONSTRAINT IF EXISTS group_members_group_id_fkey;

ALTER TABLE group_members 
ADD CONSTRAINT group_members_group_id_fkey 
FOREIGN KEY (group_id) REFERENCES community_groups(id) ON DELETE CASCADE;

-- 5. Create sample groups if none exist
INSERT INTO community_groups (name, description, category, created_by, location_city, location_state, location_country, is_public, member_count, post_count)
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
WHERE NOT EXISTS (SELECT 1 FROM community_groups WHERE name = 'Local Artists Network');

INSERT INTO community_groups (name, description, category, created_by, location_city, location_state, location_country, is_public, member_count, post_count)
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
WHERE NOT EXISTS (SELECT 1 FROM community_groups WHERE name = 'Tech Enthusiasts');

INSERT INTO community_groups (name, description, category, created_by, location_city, location_state, location_country, is_public, member_count, post_count)
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
WHERE NOT EXISTS (SELECT 1 FROM community_groups WHERE name = 'Food Lovers');

-- 6. Verify the groups were created
SELECT id, name, is_public, created_at FROM community_groups ORDER BY created_at DESC;

-- 7. Update member counts for existing groups
UPDATE community_groups 
SET member_count = (
  SELECT COUNT(*) 
  FROM group_members 
  WHERE group_id = community_groups.id
)
WHERE member_count IS NULL OR member_count = 0;

-- 8. Ensure RLS policies are in place
DROP POLICY IF EXISTS "Users can join public groups" ON group_members;
CREATE POLICY "Users can join public groups" ON group_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM community_groups 
      WHERE id = group_id AND is_public = true
    )
  );

-- 9. Grant necessary permissions
GRANT ALL ON community_groups TO authenticated;
GRANT ALL ON group_members TO authenticated;
