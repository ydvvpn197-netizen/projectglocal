-- First, let's check the current structure of group_members and profiles tables
\d group_members;
\d profiles;

-- Create foreign key relationship between group_members and profiles
-- First, ensure we have a unique constraint on profiles.user_id if not already present
ALTER TABLE public.profiles 
ADD CONSTRAINT IF NOT EXISTS profiles_user_id_unique UNIQUE (user_id);

-- Add foreign key constraint between group_members.user_id and profiles.user_id
ALTER TABLE public.group_members 
DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;

ALTER TABLE public.group_members 
ADD CONSTRAINT group_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Update the role enum to include viewer, editor, admin
DROP TYPE IF EXISTS group_role CASCADE;
CREATE TYPE public.group_role AS ENUM ('viewer', 'member', 'editor', 'admin');

-- Update group_members table to use the new enum
ALTER TABLE public.group_members 
ALTER COLUMN role TYPE TEXT;

-- Now update to use the enum
ALTER TABLE public.group_members 
ALTER COLUMN role TYPE public.group_role USING role::public.group_role;

-- Set default role
ALTER TABLE public.group_members 
ALTER COLUMN role SET DEFAULT 'member'::public.group_role;

-- Update existing admin role to use new enum if needed
UPDATE public.group_members 
SET role = 'admin'::public.group_role 
WHERE role::text = 'admin';

-- Update any existing 'member' roles
UPDATE public.group_members 
SET role = 'member'::public.group_role 
WHERE role::text = 'member';

-- Create an index for better performance on user_id lookups
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);

-- Test the relationship by checking current group members with profiles
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