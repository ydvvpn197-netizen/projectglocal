-- Fix ambiguous column reference in get_group_messages_with_details function
CREATE OR REPLACE FUNCTION public.get_group_messages_with_details(group_id_param uuid)
 RETURNS TABLE(id uuid, group_id uuid, user_id uuid, content text, parent_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, is_edited boolean, user_display_name text, user_avatar_url text, likes_count integer, is_liked_by_user boolean, replies_count integer, views_count integer)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
    SELECT gml.message_id, COUNT(*) as likes_count
    FROM public.group_message_likes gml
    GROUP BY gml.message_id
  ) like_counts ON gm.id = like_counts.message_id
  LEFT JOIN (
    SELECT gml.message_id, true as is_liked
    FROM public.group_message_likes gml
    WHERE gml.user_id = auth.uid()
  ) user_likes ON gm.id = user_likes.message_id
  LEFT JOIN (
    SELECT gm_replies.parent_id, COUNT(*) as replies_count
    FROM public.group_messages gm_replies
    WHERE gm_replies.parent_id IS NOT NULL
    GROUP BY gm_replies.parent_id
  ) reply_counts ON gm.id = reply_counts.parent_id
  LEFT JOIN (
    SELECT gmv.message_id, COUNT(*) as views_count
    FROM public.group_message_views gmv
    GROUP BY gmv.message_id
  ) view_counts ON gm.id = view_counts.message_id
  WHERE gm.group_id = group_id_param
    AND EXISTS (
      SELECT 1 FROM public.group_members gm_check
      WHERE gm_check.group_id = group_id_param AND gm_check.user_id = auth.uid()
    )
  ORDER BY gm.created_at DESC;
END;
$function$;