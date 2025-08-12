-- Create foreign key relationship between group_members and profiles
-- First, let's check if the constraint already exists
ALTER TABLE public.group_members 
DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;

-- Add foreign key constraint between group_members.user_id and profiles.user_id
ALTER TABLE public.group_members 
ADD CONSTRAINT group_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Create the role enum if it doesn't exist
CREATE TYPE public.group_role AS ENUM ('viewer', 'member', 'editor', 'admin');

-- Add role column back if it doesn't exist
ALTER TABLE public.group_members 
ADD COLUMN IF NOT EXISTS role public.group_role DEFAULT 'member'::public.group_role NOT NULL;

-- Update existing records to have admin role for the Local Photographers group admin
UPDATE public.group_members 
SET role = 'admin'::public.group_role 
WHERE user_id = '249c6002-f3d1-44dd-a82e-82f282dad576'::uuid
AND group_id IN (SELECT id FROM public.groups WHERE name = 'Local Photographers');

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
WHERE gm.group_id IN (SELECT id FROM public.groups WHERE name = 'Local Photographers');