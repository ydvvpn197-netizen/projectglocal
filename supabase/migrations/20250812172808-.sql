-- Create foreign key relationship between group_members and profiles
-- Add foreign key constraint between group_members.user_id and profiles.user_id
ALTER TABLE public.group_members 
DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;

ALTER TABLE public.group_members 
ADD CONSTRAINT group_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add role column back if it doesn't exist (using existing group_role type)
ALTER TABLE public.group_members 
ADD COLUMN IF NOT EXISTS role group_role DEFAULT 'member'::group_role NOT NULL;

-- Update existing records to have admin role for the Local Photographers group admin
UPDATE public.group_members 
SET role = 'admin'::group_role 
WHERE user_id = '249c6002-f3d1-44dd-a82e-82f282dad576'::uuid
AND group_id IN (SELECT id FROM public.groups WHERE name = 'Local Photographers');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);

-- Recreate the policies for group_admins table
CREATE POLICY "Group admins can view admin records"
  ON public.group_admins
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.group_members gm 
      WHERE gm.group_id = group_admins.group_id 
      AND gm.user_id = auth.uid() 
      AND gm.role = 'admin'::group_role
    )
  );

CREATE POLICY "Group admins can insert admin records"
  ON public.group_admins
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members gm 
      WHERE gm.group_id = group_admins.group_id 
      AND gm.user_id = auth.uid() 
      AND gm.role = 'admin'::group_role
    )
  );

-- Test the relationship
SELECT 
    gm.id,
    gm.group_id,
    gm.user_id,
    gm.role,
    gm.joined_at,
    p.display_name,
    p.avatar_url,
    p.username
FROM public.group_members gm
JOIN public.profiles p ON gm.user_id = p.user_id
WHERE gm.group_id IN (SELECT id FROM public.groups WHERE name = 'Local Photographers');