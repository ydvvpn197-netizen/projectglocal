# TheGlocal Database Setup Guide

This guide provides comprehensive instructions for setting up the complete database schema for TheGlocal project with all features including authentication, content management, news system, monetization, and community features.

## 🚀 Quick Start

### Prerequisites
- Supabase project set up
- Supabase CLI installed
- Access to your Supabase project

### 1. Run Database Migrations

Run the following migrations in order:

```bash
# Navigate to your project directory
cd your-project-directory

# Run migrations in order
supabase db reset
supabase migration up
```

Or run the migrations manually in your Supabase dashboard:

1. `20250101000001_complete_database_schema.sql`
2. `20250101000002_database_functions_and_triggers.sql`
3. `20250101000003_row_level_security_policies.sql`
4. `20250101000004_initial_data_and_setup.sql`
5. `20250101000005_admin_setup_and_auth_config.sql`

### 2. Verify Setup

Run the verification script:

```sql
-- Check system health
SELECT public.get_system_health();

-- Verify admin setup
SELECT public.verify_admin_setup();

-- Check database setup
SELECT public.verify_database_setup();
```

### 3. Create Super Admin

1. Create your first user account through the application
2. Use the admin setup page to promote the user to super admin
3. Verify the setup is complete

## 📊 Database Schema Overview

### Core Tables

#### User Management
- **`profiles`** - User profile information
- **`roles`** - User roles (user, moderator, admin, super_admin)
- **`interests`** - Available interests/categories
- **`user_interests`** - User interest associations
- **`user_preferences`** - User preferences for personalization

#### Content Management
- **`posts`** - Main content table (posts, events, services, discussions)
- **`services`** - Service marketplace listings
- **`service_bookings`** - Service booking records
- **`follows`** - User follow relationships
- **`likes`** - Post likes
- **`comments`** - Post comments with threading
- **`comment_likes`** - Comment likes

#### News System
- **`news_cache`** - Cached news articles with AI summaries
- **`news_likes`** - News article likes
- **`news_comments`** - News article comments
- **`news_shares`** - News article shares
- **`news_polls`** - News polls
- **`news_poll_votes`** - Poll votes
- **`news_events`** - User interaction tracking for personalization

#### Community Features
- **`user_points`** - User point totals
- **`point_transactions`** - Point transaction history
- **`community_leaderboard`** - Community leaderboard
- **`user_behavior`** - User behavior tracking

#### Monetization
- **`payments`** - Payment records
- **`subscriptions`** - User subscriptions

#### Admin & System
- **`audit_logs`** - Admin action audit trail
- **`system_settings`** - System configuration
- **`notifications`** - User notifications

## 🔐 Security Features

### Row Level Security (RLS)
All tables have RLS enabled with comprehensive policies:

- **Users** can only access their own data
- **Admins** can manage content and users
- **Super Admins** have full system access
- **Public** access for appropriate content (posts, news, etc.)

### Role-Based Access Control (RBAC)
Four user roles with hierarchical permissions:

1. **`user`** - Basic user permissions
2. **`moderator`** - Content moderation permissions
3. **`admin`** - Administrative permissions
4. **`super_admin`** - Full system access

### Security Functions
- `is_authenticated()` - Check if user is logged in
- `is_admin()` - Check if user is admin or super admin
- `is_super_admin()` - Check if user is super admin
- `has_permission()` - Check specific permissions

## 🎯 Key Features

### 1. User Management
- Complete user profiles with verification and premium status
- Role-based access control
- User preferences and interests
- Activity tracking

### 2. Content Management
- Posts, events, services, and discussions
- Rich media support (images, videos)
- Location-based content
- Featured content system

### 3. News System
- AI-powered news aggregation
- Trending algorithm with time decay
- Personalization based on user behavior
- Real-time interactions (likes, comments, shares)

### 4. Monetization
- User verification subscriptions
- Premium user plans
- Featured event payments
- Service marketplace with bookings

### 5. Community Features
- Points and rewards system
- Community leaderboard
- User behavior tracking
- Social interactions

### 6. Admin Dashboard
- Comprehensive admin statistics
- User management
- Content moderation
- System configuration
- Audit logging

## 🔧 Database Functions

### User Management
- `handle_new_user()` - Auto-assign roles on signup
- `get_user_role()` - Get user role
- `promote_to_super_admin()` - Promote user to super admin
- `update_user_profile()` - Update user profile

### Content Management
- `update_post_counts()` - Update like/comment counts
- `award_points_for_action()` - Award points for user actions

### News System
- `calculate_trending_score()` - Calculate trending scores
- `generate_article_id()` - Generate SHA-256 article IDs

### Community Features
- `add_user_points()` - Add points to users
- `update_leaderboard_rank()` - Update leaderboard rankings

### Monetization
- `handle_successful_payment()` - Process successful payments
- `log_admin_action()` - Log admin actions

### System Functions
- `get_system_health()` - Get system health status
- `run_maintenance()` - Clean up expired data
- `verify_admin_setup()` - Verify admin setup

## 📈 Performance Optimizations

### Indexes
Comprehensive indexing strategy for optimal performance:

- User lookups and authentication
- Content queries and filtering
- News system performance
- Community features
- Admin dashboard queries

### Caching
- News cache with 15-minute TTL
- System settings caching
- User preference caching

### Maintenance
- Automated cleanup of expired data
- Regular leaderboard updates
- Performance monitoring

## 🚨 Important Security Notes

### Super Admin Protection
- Only super admins can delete tables/schemas
- Last super admin cannot be demoted
- Super admin actions are logged
- Database structure changes require super admin privileges

### Data Protection
- All user data is protected by RLS
- Sensitive operations are logged
- Payment data is encrypted
- User behavior data is anonymized

### Best Practices
- Use service role key only in backend
- Never expose admin functions to frontend
- Regularly review audit logs
- Monitor system health

## 🧪 Testing

### Test Database Setup
```sql
-- Run the fresh database setup script
\i scripts/fresh-database-setup.sql

-- Verify all features work
SELECT public.get_system_health();
```

### Test User Creation
1. Create a test user through the application
2. Verify profile and role creation
3. Test user permissions
4. Test admin functions

### Test Features
- User registration and authentication
- Content creation and management
- News system functionality
- Payment processing
- Community features
- Admin dashboard

## 📝 Maintenance

### Regular Maintenance
```sql
-- Run maintenance (cleanup expired data)
SELECT public.run_maintenance();

-- Update leaderboard ranks
SELECT public.refresh_all_leaderboard_ranks();

-- Check system health
SELECT public.get_system_health();
```

### Monitoring
- Monitor audit logs for suspicious activity
- Check system health regularly
- Review user activity and engagement
- Monitor payment processing

## 🆘 Troubleshooting

### Common Issues

#### Migration Errors
- Ensure migrations run in order
- Check for existing tables/conflicts
- Verify Supabase permissions

#### RLS Policy Issues
- Check user authentication
- Verify role assignments
- Review policy logic

#### Performance Issues
- Check index usage
- Monitor query performance
- Review system health

### Support
- Check system health: `SELECT public.get_system_health();`
- Verify admin setup: `SELECT public.verify_admin_setup();`
- Review audit logs for errors
- Check Supabase logs

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions Guide](https://supabase.com/docs/guides/database/functions)

---

**Note**: This database setup provides a complete, production-ready foundation for TheGlocal project with all features implemented and secured. Make sure to test thoroughly before deploying to production.
