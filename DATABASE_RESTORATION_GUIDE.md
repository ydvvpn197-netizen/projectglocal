# Database Restoration Guide for TheGlocal Project

## 🚨 Critical Issue: Missing Database Tables

Your Supabase database has lost approximately 90-100 tables that were deleted in recent changes. This guide will help you restore your complete database schema and functionality.

## 📋 What Happened

Based on the git history, the issue occurred during recent commits where:
1. Admin authentication system was implemented
2. Database migration files were modified
3. A "restore" commit was made, but it may not have fully restored all tables

## 🔧 Quick Restoration (Recommended)

### Option 1: Automated Restoration Script

1. **Run the PowerShell script (Windows):**
   ```powershell
   .\scripts\restore-database.ps1
   ```

2. **Or run the Node.js script directly:**
   ```bash
   node scripts/restore-database.js
   ```

### Option 2: Manual Supabase Dashboard Restoration

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `scripts/restore-database-complete.sql`
4. Execute the script

## 📊 Expected Database Schema

Your restored database should contain these **30+ tables**:

### Core Tables
- `profiles` - User profiles and information
- `interests` - Available interests/categories
- `user_interests` - User-interest relationships
- `posts` - Community posts and content
- `follows` - User following relationships
- `likes` - Post likes
- `comments` - Post comments

### Artist System
- `artists` - Artist profiles
- `artist_bookings` - Artist booking requests
- `artist_discussions` - Artist discussion threads
- `artist_discussion_replies` - Discussion replies
- `artist_discussion_moderation_notifications` - Moderation alerts

### Event System
- `events` - Community events
- `event_attendees` - Event attendance

### Community Features
- `groups` - Community groups
- `group_members` - Group membership
- `group_admins` - Group administrators
- `group_messages` - Group chat messages
- `group_message_likes` - Message likes
- `group_message_views` - Message views

### Communication
- `chat_conversations` - Private chat conversations
- `chat_messages` - Chat messages
- `discussions` - General discussions

### News System
- `news_cache` - Cached news articles
- `news_likes` - News article likes
- `news_comments` - News comments
- `news_polls` - News polls
- `news_poll_votes` - Poll votes
- `news_shares` - News shares
- `news_events` - News events

### Notifications
- `notifications` - User notifications

## 🔍 Verification Steps

After restoration, verify your database by:

1. **Check table count:**
   ```sql
   SELECT count(*) FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

2. **Verify key tables exist:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

3. **Test basic functionality:**
   - Try creating a user profile
   - Create a post
   - Check if events can be created

## 🛠️ Troubleshooting

### If Restoration Fails

1. **Check Supabase permissions:**
   - Ensure you have the service role key
   - Verify your project URL is correct

2. **Manual table creation:**
   - Use the individual migration files in `supabase/migrations/`
   - Run them in chronological order

3. **Contact support:**
   - If issues persist, check Supabase project logs
   - Verify your project is not in a restricted state

### Common Issues

- **Permission denied:** Check your service role key
- **Table already exists:** The script handles this gracefully
- **Connection timeout:** Check your internet connection and Supabase status

## 📈 Post-Restoration Steps

1. **Update your application:**
   ```bash
   npm run build
   ```

2. **Test all features:**
   - User registration/login
   - Post creation
   - Event management
   - Artist bookings
   - News feed

3. **Monitor for errors:**
   - Check browser console
   - Monitor Supabase logs
   - Test all user flows

## 🔒 Security Considerations

- All tables have Row Level Security (RLS) enabled
- Proper policies are in place for data access
- Service role key should be kept secure
- Regular backups are recommended

## 📞 Support

If you continue to experience issues:

1. Check the Supabase project dashboard for error logs
2. Verify all environment variables are correct
3. Ensure your Supabase project is active and not suspended
4. Review the migration files for any custom modifications

## 🎯 Success Indicators

Your restoration is successful when:
- ✅ All 30+ tables are present
- ✅ RLS policies are active
- ✅ Application loads without database errors
- ✅ Users can create profiles and posts
- ✅ All features work as expected

---

**Note:** This restoration script is based on your current TypeScript types and migration files. It recreates the complete database schema that your application expects.
