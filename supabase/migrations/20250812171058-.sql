-- First, let's see what groups exist and check if Local Photographers group exists
SELECT id, name, created_by FROM public.groups WHERE name ILIKE '%photographer%';

-- Create admin tracking table
CREATE TABLE IF NOT EXISTS public.group_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  joined_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Enable RLS on group_admins table
ALTER TABLE public.group_admins ENABLE ROW LEVEL SECURITY;

-- Create policies for group_admins table
CREATE POLICY "Group admins can view admin records"
  ON public.group_admins
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.group_members gm 
      WHERE gm.group_id = group_admins.group_id 
      AND gm.user_id = auth.uid() 
      AND gm.role = 'admin'
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
      AND gm.role = 'admin'
    )
  );

-- Insert Local Photographers group if it doesn't exist
INSERT INTO public.groups (name, description, category, created_by)
SELECT 
  'Local Photographers',
  'A community for photographers in the local area to share tips, organize shoots, and showcase their work.',
  'photography',
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM public.groups WHERE name = 'Local Photographers'
);

-- Get the group ID for Local Photographers
DO $$
DECLARE
  photographers_group_id UUID;
  current_user_id UUID;
  user_display_name TEXT;
BEGIN
  -- Get the group ID
  SELECT id INTO photographers_group_id 
  FROM public.groups 
  WHERE name = 'Local Photographers' 
  LIMIT 1;
  
  -- Get current user (assuming first user for now - you'll need to replace this with actual user ID)
  SELECT id INTO current_user_id 
  FROM auth.users 
  LIMIT 1;
  
  -- Get user's display name from profiles
  SELECT COALESCE(display_name, username, 'Admin User') INTO user_display_name
  FROM public.profiles 
  WHERE user_id = current_user_id;
  
  -- Insert or update group membership as admin
  INSERT INTO public.group_members (group_id, user_id, role, joined_at)
  VALUES (photographers_group_id, current_user_id, 'admin', now())
  ON CONFLICT (group_id, user_id) 
  DO UPDATE SET role = 'admin', joined_at = now();
  
  -- Insert into group_admins tracking table
  INSERT INTO public.group_admins (group_id, group_name, user_id, username, joined_date)
  VALUES (
    photographers_group_id, 
    'Local Photographers', 
    current_user_id, 
    user_display_name,
    now()
  )
  ON CONFLICT (group_id, user_id) 
  DO UPDATE SET 
    username = user_display_name,
    joined_date = now();
    
END $$;