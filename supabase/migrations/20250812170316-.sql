-- Fix infinite recursion in group_members RLS policy
-- The issue is that the SELECT policy on group_members references group_members itself

-- First, create a security definer function to get user's group IDs safely
CREATE OR REPLACE FUNCTION public.get_user_group_ids(check_user_id UUID)
RETURNS UUID[]
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path TO ''
AS $$
  SELECT ARRAY_AGG(group_id) 
  FROM public.group_members 
  WHERE user_id = check_user_id;
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view group memberships where they are members" ON public.group_members;

-- Create a new policy that doesn't cause infinite recursion
CREATE POLICY "Users can view group memberships where they are members"
  ON public.group_members 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    group_id = ANY(public.get_user_group_ids(auth.uid()))
  );