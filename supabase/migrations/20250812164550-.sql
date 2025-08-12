-- Drop all problematic group_members policies
DROP POLICY IF EXISTS "Group members can view other members" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;

-- Create simpler, non-recursive policies for group_members
CREATE POLICY "Users can view group memberships where they are members"
  ON public.group_members FOR SELECT
  USING (user_id = auth.uid() OR group_id IN (
    SELECT gm.group_id FROM public.group_members gm WHERE gm.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own group memberships"
  ON public.group_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own group memberships"
  ON public.group_members FOR DELETE
  USING (user_id = auth.uid());

-- Also fix the groups policy to be simpler
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;

CREATE POLICY "Users can view groups they have joined"
  ON public.groups FOR SELECT
  USING (id IN (
    SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
  ) OR created_by = auth.uid());

-- Fix group messages policies to avoid recursion
DROP POLICY IF EXISTS "Group members can view messages" ON public.group_messages;
DROP POLICY IF EXISTS "Group members can post messages" ON public.group_messages;

CREATE POLICY "Users can view messages in their groups"
  ON public.group_messages FOR SELECT
  USING (group_id IN (
    SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can post messages in their groups"
  ON public.group_messages FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND 
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );