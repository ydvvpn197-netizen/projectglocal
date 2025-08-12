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

-- Drop existing foreign key if exists
ALTER TABLE public.group_members 
DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;

-- Add foreign key constraint between group_members.user_id and profiles.user_id
ALTER TABLE public.group_members 
ADD CONSTRAINT group_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Update the role enum to include viewer, editor, admin
DROP TYPE IF EXISTS group_role CASCADE;
CREATE TYPE public.group_role AS ENUM ('viewer', 'member', 'editor', 'admin');

-- Temporarily change role column to text
ALTER TABLE public.group_members 
ALTER COLUMN role TYPE TEXT;

-- Update to use the enum
ALTER TABLE public.group_members 
ALTER COLUMN role TYPE public.group_role USING role::public.group_role;

-- Set default role
ALTER TABLE public.group_members 
ALTER COLUMN role SET DEFAULT 'member'::public.group_role;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);