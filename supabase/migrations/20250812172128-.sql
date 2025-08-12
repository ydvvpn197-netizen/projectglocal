-- Create foreign key relationship between group_members and profiles
-- Check if unique constraint exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_user_id_unique'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
    END IF;
END $$;

-- Add foreign key constraint between group_members.user_id and profiles.user_id
ALTER TABLE public.group_members 
DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;

ALTER TABLE public.group_members 
ADD CONSTRAINT group_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Drop the policy that depends on the role column
DROP POLICY IF EXISTS "Group admins can view admin records" ON public.group_admins;
DROP POLICY IF EXISTS "Group admins can insert admin records" ON public.group_admins;

-- Update the role enum to include viewer, editor, admin
DROP TYPE IF EXISTS group_role CASCADE;
CREATE TYPE public.group_role AS ENUM ('viewer', 'member', 'editor', 'admin');

-- Remove the default first
ALTER TABLE public.group_members 
ALTER COLUMN role DROP DEFAULT;

-- Temporarily change role column to text
ALTER TABLE public.group_members 
ALTER COLUMN role TYPE TEXT;

-- Update to use the enum
ALTER TABLE public.group_members 
ALTER COLUMN role TYPE public.group_role USING role::public.group_role;

-- Set new default role
ALTER TABLE public.group_members 
ALTER COLUMN role SET DEFAULT 'member'::public.group_role;

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
      AND gm.role = 'admin'::public.group_role
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
      AND gm.role = 'admin'::public.group_role
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);

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
LIMIT 5;