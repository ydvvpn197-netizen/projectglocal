# Database Relationship Fixes Summary

## Issues Fixed

### 1. Missing Foreign Key Constraints
The main issue was that several tables had `user_id` columns but were missing foreign key constraints, causing PostgREST to fail with PGRST200 errors when trying to establish relationships.

### 2. Tables Fixed

#### Posts Table
- **Issue**: `posts.user_id` had no foreign key to `profiles.user_id`
- **Fix**: Added `posts_user_id_profiles_fkey` constraint
- **Impact**: Resolves the main PGRST200 error in `usePosts.tsx`

#### Other Tables with Missing Foreign Keys
Added foreign key constraints for the following tables:
- `group_messages.user_id` → `auth.users.id` and `profiles.user_id`
- `group_message_likes.user_id` → `auth.users.id` and `profiles.user_id`
- `group_message_views.user_id` → `auth.users.id` and `profiles.user_id`
- `events.user_id` → `auth.users.id` and `profiles.user_id`
- `event_attendees.user_id` → `auth.users.id` and `profiles.user_id`
- `discussions.user_id` → `auth.users.id` and `profiles.user_id`
- `notifications.user_id` → `auth.users.id` and `profiles.user_id`
- `artist_discussions.user_id` → `auth.users.id` and `profiles.user_id`
- `artist_discussion_replies.user_id` → `auth.users.id` and `profiles.user_id`

#### Chat and Artist Tables
- `chat_messages.sender_id` → `auth.users.id` and `profiles.user_id`
- `chat_conversations.client_id` → `auth.users.id` and `profiles.user_id`
- `chat_conversations.artist_id` → `auth.users.id` and `profiles.user_id`
- `artist_discussions.artist_id` → `artists.id`
- `artist_discussion_moderation_notifications.artist_id` → `artists.id`

### 3. Data Consistency Fixes
- **Issue**: `artist_discussions` table had `artist_id` values that were `user_id` values instead of `artists.id` values
- **Fix**: Updated the data to reference the correct `artists.id` values

## Migration Files Created
1. `fix_posts_foreign_key_constraints` - Added posts to profiles foreign key
2. `add_missing_user_id_foreign_keys` - Added auth.users foreign keys
3. `add_profiles_foreign_keys` - Added profiles foreign keys
4. `add_safe_foreign_keys` - Added chat-related foreign keys
5. `add_artist_foreign_keys` - Added artist-related foreign keys

## Testing
- Verified that the posts query now works correctly
- Confirmed that foreign key relationships are properly established
- Checked that RLS policies are in place and functional

## Expected Results
- PGRST200 errors should be resolved
- Posts should load correctly in the application
- All foreign key relationships should work properly for joins
- Data integrity is maintained with proper constraints

## Next Steps
1. Test the application to confirm all errors are resolved
2. Monitor for any new foreign key constraint violations
3. Consider adding indexes on foreign key columns for performance
