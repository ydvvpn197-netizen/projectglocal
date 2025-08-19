-- Create a function to delete all user-related data
CREATE OR REPLACE FUNCTION delete_user_account(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete in order to respect foreign key constraints
  
  -- 1. Delete chat messages
  DELETE FROM chat_messages 
  WHERE conversation_id IN (
    SELECT id FROM chat_conversations 
    WHERE client_id = user_id OR artist_id = user_id
  );
  
  -- 2. Delete chat conversations
  DELETE FROM chat_conversations 
  WHERE client_id = user_id OR artist_id = user_id;
  
  -- 3. Delete notifications
  DELETE FROM notifications 
  WHERE user_id = user_id;
  
  -- 4. Delete artist bookings
  DELETE FROM artist_bookings 
  WHERE user_id = user_id OR artist_id IN (
    SELECT id FROM artists WHERE user_id = user_id
  );
  
  -- 5. Delete artist discussions
  DELETE FROM artist_discussions 
  WHERE artist_id IN (
    SELECT id FROM artists WHERE user_id = user_id
  );
  
  -- 6. Delete artists record
  DELETE FROM artists 
  WHERE user_id = user_id;
  
  -- 7. Delete comments
  DELETE FROM comments 
  WHERE user_id = user_id;
  
  -- 8. Delete likes
  DELETE FROM likes 
  WHERE user_id = user_id;
  
  -- 9. Delete follows
  DELETE FROM follows 
  WHERE follower_id = user_id OR following_id = user_id;
  
  -- 10. Delete posts
  DELETE FROM posts 
  WHERE user_id = user_id;
  
  -- 11. Delete events (if user created any)
  DELETE FROM events 
  WHERE created_by = user_id;
  
  -- 12. Delete groups (if user created any)
  DELETE FROM groups 
  WHERE created_by = user_id;
  
  -- 13. Delete discussions (if user created any)
  DELETE FROM discussions 
  WHERE created_by = user_id;
  
  -- 14. Finally delete the profile
  DELETE FROM profiles 
  WHERE user_id = user_id;
  
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;
