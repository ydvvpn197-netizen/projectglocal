-- Fix infinite recursion in group_members RLS policy
-- Drop the problematic policy
DROP POLICY IF EXISTS "Group members can view other members" ON public.group_members;

-- Create a security definer function to check group membership
CREATE OR REPLACE FUNCTION public.is_group_member(check_group_id UUID, check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = check_group_id AND user_id = check_user_id
  );
$$;

-- Recreate the policy using the security definer function
CREATE POLICY "Group members can view other members" 
  ON public.group_members FOR SELECT 
  USING (public.is_group_member(group_id, auth.uid()));