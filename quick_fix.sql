-- Quick Fix for Community Join Issues
-- Run this in your Supabase SQL Editor

-- 1. Check current state
SELECT 'Current Groups:' as info;
SELECT id, name, is_public, created_at FROM community_groups ORDER BY created_at DESC LIMIT 5;

SELECT 'Current Group Members:' as info;
SELECT gm.id, gm.group_id, gm.user_id, cg.name as group_name 
FROM group_members gm 
LEFT JOIN community_groups cg ON gm.group_id = cg.id 
ORDER BY gm.created_at DESC LIMIT 5;

-- 2. Clean up any orphaned records
DELETE FROM group_members 
WHERE group_id NOT IN (SELECT id FROM community_groups);

-- 3. Ensure foreign key constraints are correct
ALTER TABLE group_members 
DROP CONSTRAINT IF EXISTS group_members_group_id_fkey;

ALTER TABLE group_members 
ADD CONSTRAINT group_members_group_id_fkey 
FOREIGN KEY (group_id) REFERENCES community_groups(id) ON DELETE CASCADE;

ALTER TABLE group_members 
DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;

ALTER TABLE group_members 
ADD CONSTRAINT group_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Create a test group if none exist
INSERT INTO community_groups (name, description, category, created_by, location_city, location_state, location_country, is_public, member_count, post_count)
SELECT 
  'Test Community',
  'A test community for debugging',
  'General',
  (SELECT id FROM auth.users LIMIT 1),
  'Test City',
  'TS',
  'Test Country',
  true,
  0,
  0
WHERE NOT EXISTS (SELECT 1 FROM community_groups LIMIT 1);

-- 5. Fix RLS policies
DROP POLICY IF EXISTS "Users can join public groups" ON group_members;
CREATE POLICY "Users can join public groups" ON group_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM community_groups 
      WHERE id = group_id AND is_public = true
    )
  );

DROP POLICY IF EXISTS "Group members can view other members" ON group_members;
CREATE POLICY "Group members can view other members" ON group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members gm 
      WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid()
    )
  );

-- 6. Grant permissions
GRANT ALL ON community_groups TO authenticated;
GRANT ALL ON group_members TO authenticated;

-- 7. Verify the fix
SELECT 'After Fix - Groups:' as info;
SELECT id, name, is_public FROM community_groups ORDER BY created_at DESC LIMIT 5;

SELECT 'After Fix - Group Members:' as info;
SELECT COUNT(*) as total_members FROM group_members;
