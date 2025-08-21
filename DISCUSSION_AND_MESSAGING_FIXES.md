# Discussion and Messaging Fixes

## Issues Fixed

### 1. Discussion Submission Foreign Key Constraint Error

**Problem**: Users were getting a foreign key constraint violation error when trying to submit discussion requests to artists. The error was "Key is not present in table 'artists'".

**Root Cause**: 
- The `artist_discussions` table had incorrect foreign key constraints
- The `user_id` field was referencing `profiles.user_id` instead of `auth.users.id`
- The code was using the wrong ID values (user_id instead of artist.id)

**Fixes Applied**:

#### Database Schema Fixes:
1. **Fixed Foreign Key Constraints**:
   - Dropped the incorrect constraint: `artist_discussions_user_id_profiles_fkey`
   - Ensured `artist_discussions.user_id` references `auth.users(id)`
   - Ensured `artist_discussions.artist_id` references `artists(id)`

#### Code Fixes:
1. **ArtistProfile.tsx**:
   - Fixed `fetchDiscussions()` to get the correct `artist_id` from the `artists` table
   - Fixed `handleSubmitDiscussion()` to use the correct `artist_id` when creating discussions
   - Added proper artist record lookup before using `artist_id`
   - Added better error handling with specific error messages

2. **ArtistModerationPanel.tsx**:
   - Fixed `fetchModerationData()` to use the correct `artist_id`
   - Fixed `handleApproveDiscussion()` and `handleRejectDiscussion()` to use correct `artist_id`
   - Added proper artist record lookup in all functions

### 2. Messaging Functionality Issue

**Problem**: The "Message" button on artist profiles was not working properly.

**Root Cause**: 
- Incorrect SQL query construction in the chat conversation lookup
- Wrong status value being used for new conversations

**Fixes Applied**:

#### Code Fixes:
1. **ArtistProfile.tsx**:
   - Fixed the SQL query in the message button click handler
   - Changed conversation status from 'pending' to 'active' (matching the schema)
   - Added proper error handling with user-friendly toast messages
   - Fixed the `.or()` query to properly find existing conversations between users

## Database Schema Verification

### Foreign Key Constraints:
- ✅ `artist_discussions.user_id` → `auth.users(id)`
- ✅ `artist_discussions.artist_id` → `artists(id)`
- ✅ `artist_discussion_moderation_notifications.artist_id` → `artists(id)`
- ✅ `artist_discussion_moderation_notifications.discussion_id` → `artist_discussions(id)`

### Table Structure:
- ✅ `chat_conversations.booking_id` is nullable (allows direct messaging without bookings)
- ✅ `chat_conversations.status` accepts 'active' and 'closed' values

## Testing Recommendations

1. **Discussion Submission**:
   - Test submitting a discussion request to an artist
   - Verify the discussion appears in the artist's moderation panel
   - Test approving/rejecting discussions

2. **Messaging**:
   - Test clicking the "Message" button on an artist profile
   - Verify the chat conversation is created and user is redirected
   - Test sending messages in the conversation

3. **Error Handling**:
   - Test with invalid artist IDs
   - Test with non-existent users
   - Verify proper error messages are displayed

## Files Modified

1. `src/pages/ArtistProfile.tsx`
2. `src/components/ArtistModerationPanel.tsx`
3. `supabase/migrations/20250822000000_fix_artist_discussions_foreign_key.sql`

## Status

✅ **FIXED**: Discussion submission foreign key constraint error
✅ **FIXED**: Messaging functionality on artist profiles
✅ **FIXED**: Error handling and user feedback
✅ **FIXED**: Database schema constraints

Both issues should now be resolved. Users can successfully submit discussion requests to artists and start chat conversations with them.
