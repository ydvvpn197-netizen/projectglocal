-- Fix ambiguous column references in RLS policies

-- Drop and recreate the group_members policies with explicit table references
DROP POLICY IF EXISTS "Users can view group memberships where they are members" ON public.group_members;

CREATE POLICY "Users can view group memberships where they are members"
  ON public.group_members FOR SELECT
  USING (
    public.group_members.user_id = auth.uid() OR 
    public.group_members.group_id IN (
      SELECT gm.group_id FROM public.group_members gm WHERE gm.user_id = auth.uid()
    )
  );

-- Drop and recreate the groups policy with explicit table references  
DROP POLICY IF EXISTS "Users can view groups they have joined" ON public.groups;

CREATE POLICY "Users can view groups they have joined"
  ON public.groups FOR SELECT
  USING (
    public.groups.id IN (
      SELECT gm.group_id FROM public.group_members gm WHERE gm.user_id = auth.uid()
    ) OR 
    public.groups.created_by = auth.uid()
  );

-- Fix group messages policies with explicit table references
DROP POLICY IF EXISTS "Users can view messages in their groups" ON public.group_messages;
DROP POLICY IF EXISTS "Users can post messages in their groups" ON public.group_messages;

CREATE POLICY "Users can view messages in their groups"
  ON public.group_messages FOR SELECT
  USING (
    public.group_messages.group_id IN (
      SELECT gm.group_id FROM public.group_members gm WHERE gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can post messages in their groups"
  ON public.group_messages FOR INSERT
  WITH CHECK (
    public.group_messages.user_id = auth.uid() AND 
    public.group_messages.group_id IN (
      SELECT gm.group_id FROM public.group_members gm WHERE gm.user_id = auth.uid()
    )
  );