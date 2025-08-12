-- Create groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_members table  
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create group_messages table
CREATE TABLE public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.group_messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_edited BOOLEAN DEFAULT false
);

-- Create group_message_likes table
CREATE TABLE public.group_message_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.group_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Create group_message_views table (to track who has seen messages)
CREATE TABLE public.group_message_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.group_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_message_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_message_views ENABLE ROW LEVEL SECURITY;

-- RLS policies for groups
CREATE POLICY "Users can view groups they are members of" 
  ON public.groups FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = groups.id AND user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can create groups" 
  ON public.groups FOR INSERT 
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group creators can update their groups" 
  ON public.groups FOR UPDATE 
  USING (created_by = auth.uid());

-- RLS policies for group_members
CREATE POLICY "Group members can view other members" 
  ON public.group_members FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid()
  ));

CREATE POLICY "Users can join groups" 
  ON public.group_members FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave groups" 
  ON public.group_members FOR DELETE 
  USING (user_id = auth.uid());

-- RLS policies for group_messages
CREATE POLICY "Group members can view messages" 
  ON public.group_messages FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = group_messages.group_id AND user_id = auth.uid()
  ));

CREATE POLICY "Group members can post messages" 
  ON public.group_messages FOR INSERT 
  WITH CHECK (
    user_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_id = group_messages.group_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages" 
  ON public.group_messages FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own messages" 
  ON public.group_messages FOR DELETE 
  USING (user_id = auth.uid());

-- RLS policies for group_message_likes
CREATE POLICY "Group members can view likes" 
  ON public.group_message_likes FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.group_messages gm
    JOIN public.group_members gmem ON gm.group_id = gmem.group_id
    WHERE gm.id = group_message_likes.message_id AND gmem.user_id = auth.uid()
  ));

CREATE POLICY "Group members can like messages" 
  ON public.group_message_likes FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unlike their own likes" 
  ON public.group_message_likes FOR DELETE 
  USING (user_id = auth.uid());

-- RLS policies for group_message_views
CREATE POLICY "Message owners can view who has seen their messages" 
  ON public.group_message_views FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.group_messages 
    WHERE id = group_message_views.message_id AND user_id = auth.uid()
  ));

CREATE POLICY "Group members can track their own message views" 
  ON public.group_message_views FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Create triggers for updated_at
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_messages_updated_at
  BEFORE UPDATE ON public.group_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get group messages with user info and interactions
CREATE OR REPLACE FUNCTION public.get_group_messages_with_details(group_id_param UUID)
RETURNS TABLE(
  id UUID,
  group_id UUID,
  user_id UUID,
  content TEXT,
  parent_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  is_edited BOOLEAN,
  user_display_name TEXT,
  user_avatar_url TEXT,
  likes_count INTEGER,
  is_liked_by_user BOOLEAN,
  replies_count INTEGER,
  views_count INTEGER
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gm.id,
    gm.group_id,
    gm.user_id,
    gm.content,
    gm.parent_id,
    gm.created_at,
    gm.updated_at,
    gm.is_edited,
    p.display_name as user_display_name,
    p.avatar_url as user_avatar_url,
    COALESCE(like_counts.likes_count, 0)::INTEGER as likes_count,
    COALESCE(user_likes.is_liked, false) as is_liked_by_user,
    COALESCE(reply_counts.replies_count, 0)::INTEGER as replies_count,
    COALESCE(view_counts.views_count, 0)::INTEGER as views_count
  FROM public.group_messages gm
  LEFT JOIN public.profiles p ON gm.user_id = p.user_id
  LEFT JOIN (
    SELECT message_id, COUNT(*) as likes_count
    FROM public.group_message_likes
    GROUP BY message_id
  ) like_counts ON gm.id = like_counts.message_id
  LEFT JOIN (
    SELECT message_id, true as is_liked
    FROM public.group_message_likes
    WHERE user_id = auth.uid()
  ) user_likes ON gm.id = user_likes.message_id
  LEFT JOIN (
    SELECT parent_id, COUNT(*) as replies_count
    FROM public.group_messages
    WHERE parent_id IS NOT NULL
    GROUP BY parent_id
  ) reply_counts ON gm.id = reply_counts.parent_id
  LEFT JOIN (
    SELECT message_id, COUNT(*) as views_count
    FROM public.group_message_views
    GROUP BY message_id
  ) view_counts ON gm.id = view_counts.message_id
  WHERE gm.group_id = group_id_param
    AND EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_id = group_id_param AND user_id = auth.uid()
    )
  ORDER BY gm.created_at DESC;
END;
$$;