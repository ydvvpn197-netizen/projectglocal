-- Add user as member to Local Photographers group
DO $$
DECLARE
  photographers_group_id UUID;
  current_user_id UUID;
BEGIN
  -- Get the Local Photographers group ID
  SELECT id INTO photographers_group_id 
  FROM public.groups 
  WHERE name = 'Local Photographers' 
  LIMIT 1;
  
  -- Get the current user ID (first user for now)
  SELECT id INTO current_user_id 
  FROM auth.users 
  LIMIT 1;
  
  -- Insert user as member if not already a member
  INSERT INTO public.group_members (group_id, user_id, role, joined_at)
  VALUES (photographers_group_id, current_user_id, 'member', now())
  ON CONFLICT (group_id, user_id) 
  DO NOTHING;
  
  -- Verify the insertion
  RAISE NOTICE 'User % added as member to Local Photographers group %', current_user_id, photographers_group_id;
END $$;

-- Check current group memberships for Local Photographers
SELECT 
  g.name as group_name,
  gm.user_id,
  gm.role,
  gm.joined_at,
  p.display_name,
  p.username
FROM public.groups g
JOIN public.group_members gm ON g.id = gm.group_id
LEFT JOIN public.profiles p ON gm.user_id = p.user_id
WHERE g.name = 'Local Photographers';