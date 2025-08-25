# Community Points System

A comprehensive real-time points earning system for The Glocal community platform that rewards user engagement and participation.

## 🎯 Overview

The Community Points System automatically tracks and rewards user activities across the platform, encouraging engagement through a gamified experience. Users earn points for various actions and can see their ranking on the community leaderboard.

## 🏆 Point Earning Activities

| Activity | Points | Description |
|----------|--------|-------------|
| **Post Creation** | +2 | Creating a new community post |
| **Comment Creation** | +1 | Adding a comment to a post |
| **Post Like (Given)** | +1 | Liking someone else's post |
| **Post Like (Received)** | +1 | Receiving a like on your post |
| **Comment Like (Given)** | +1 | Liking someone else's comment |
| **Comment Like (Received)** | +1 | Receiving a like on your comment |
| **Event Organization** | +10 | Creating and organizing an event |
| **Event Attendance** | +1 | Attending an event |
| **Post Sharing** | +2 | Sharing a post on social media |
| **Poll Creation** | +2 | Creating a community poll |
| **Poll Voting** | +1 | Voting in a poll |

## 🗂️ Database Schema

### Core Tables

#### `user_points`
Stores total points and rank for each user.
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- total_points (INTEGER, Default: 0)
- rank (INTEGER, Default: 0)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `point_transactions`
Tracks all point earning/spending activities.
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- points (INTEGER, Positive for earning, negative for spending)
- transaction_type (TEXT, Enum of activity types)
- reference_id (UUID, Optional reference to related content)
- reference_type (TEXT, 'post', 'comment', 'event', 'poll')
- description (TEXT, Human-readable description)
- created_at (TIMESTAMP)
```

#### `community_leaderboard`
Cached leaderboard data for performance.
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- display_name (TEXT)
- avatar_url (TEXT)
- total_points (INTEGER)
- rank (INTEGER)
- last_updated (TIMESTAMP)
```

## 🔧 Implementation Details

### Database Functions

#### `add_user_points()`
Main function for adding/removing points from users.
- Creates user_points record if it doesn't exist
- Updates total points
- Records transaction
- Updates leaderboard rank

#### `update_leaderboard_rank()`
Calculates and updates user rank based on total points.
- Recalculates rank for all users
- Updates community_leaderboard table
- Maintains real-time ranking

#### `refresh_all_leaderboard_ranks()`
Admin function to refresh all user ranks.
- Useful for maintenance and data consistency

### Database Triggers

Automatic point awarding through PostgreSQL triggers:

- **Post Votes**: `trigger_post_vote_points()`
- **Comment Votes**: `trigger_comment_vote_points()`
- **Post Creation/Deletion**: `trigger_post_points()`
- **Comment Creation/Deletion**: `trigger_comment_points()`
- **Poll Votes**: `trigger_poll_vote_points()`

### Real-time Updates

The system uses Supabase real-time subscriptions to provide instant updates:
- User points changes
- Leaderboard updates
- Transaction history

## 🎨 UI Components

### CommunityLeaderboard
- Displays top users with filtering options (Top 5, 20, 50, 100, 1000)
- Real-time updates
- User position highlighting
- Responsive design with expand/collapse

### UserPointsDisplay
- Shows user's current points and rank
- Compact and detailed views
- Transaction history dialog
- Points breakdown by activity type

### PointsTestPanel
- Development/testing component
- Manual point addition
- System status monitoring
- Quick test scenarios

## 🚀 Usage

### Basic Integration

```tsx
import { usePoints } from '@/hooks/usePoints';
import { CommunityLeaderboard } from '@/components/CommunityLeaderboard';
import { UserPointsDisplay } from '@/components/UserPointsDisplay';

function MyComponent() {
  const { userPoints, leaderboard, refreshUserPoints } = usePoints();
  
  return (
    <div>
      <UserPointsDisplay />
      <CommunityLeaderboard />
    </div>
  );
}
```

### Manual Point Addition

```tsx
import { PointsService } from '@/services/pointsService';

// Add points for custom activity
await PointsService.addPoints(
  userId,
  5,
  'post_created',
  postId,
  'post',
  'Created an amazing post'
);
```

### Event Integration

```tsx
// Event attendance points (automatic)
await PointsService.handleEventAttendance(eventId, userId);

// Event organization points (automatic)
await PointsService.handleEventOrganization(eventId, userId);
```

## 🔄 Real-time Features

### Automatic Point Awarding
- Post likes/unlikes
- Comment likes/unlikes
- Post creation/deletion
- Comment creation/deletion
- Poll voting
- Event attendance

### Live Updates
- Points display updates instantly
- Leaderboard refreshes automatically
- Rank changes are reflected immediately
- Transaction history updates in real-time

## 🎯 Point System Rules

### Earning Points
- **Positive engagement**: All constructive activities earn points
- **Reciprocal rewards**: Both giver and receiver get points for likes
- **Content creation**: Higher rewards for creating content vs consuming
- **Community building**: Events and polls get bonus points

### Point Deduction
- **Content deletion**: Points are deducted when content is deleted
- **Spam prevention**: System prevents point farming through validation
- **Fair play**: Automatic detection of gaming attempts

### Rank Calculation
- **Real-time ranking**: Ranks update immediately with point changes
- **Tie handling**: Users with same points get same rank
- **Performance optimized**: Cached leaderboard for fast loading

## 🛠️ Development

### Testing
Use the PointsTestPanel component for testing:
```tsx
// Only shows in development mode
{process.env.NODE_ENV === 'development' && (
  <PointsTestPanel />
)}
```

### Database Migration
Run the migration to set up the points system:
```bash
supabase db push
```

### Monitoring
- Check `point_transactions` table for activity
- Monitor `community_leaderboard` for ranking issues
- Use `user_points` for individual user data

## 🔒 Security & Performance

### Row Level Security (RLS)
- Users can only view their own transactions
- Leaderboard is publicly readable
- Admin functions require proper permissions

### Performance Optimizations
- Indexed queries for fast leaderboard loading
- Cached leaderboard data
- Efficient rank calculation
- Real-time subscriptions for live updates

### Anti-Gaming Measures
- Rate limiting on point-earning activities
- Validation of legitimate user actions
- Monitoring for unusual point patterns
- Automatic detection of spam behavior

## 📊 Analytics & Insights

### Available Metrics
- Total points earned by user
- Points breakdown by activity type
- Community ranking position
- Transaction history with timestamps
- Leaderboard statistics

### Admin Functions
```tsx
// Get points statistics
const stats = await PointsService.getPointsStatistics();

// Refresh all ranks
await PointsService.refreshLeaderboardRanks();

// Get user's detailed breakdown
const summary = await PointsService.getCurrentUserPointsSummary();
```

## 🎨 Styling

The points system uses consistent styling with the rest of the application:

```css
/* Points-specific styles */
.community-leaderboard {
  @apply bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200;
}

.user-points-display {
  @apply bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200;
}

/* Rank badges */
.rank-1 { @apply bg-gradient-to-r from-yellow-400 to-yellow-600 text-white; }
.rank-2 { @apply bg-gradient-to-r from-gray-300 to-gray-500 text-white; }
.rank-3 { @apply bg-gradient-to-r from-amber-500 to-amber-700 text-white; }
```

## 🔮 Future Enhancements

### Planned Features
- **Achievement badges**: Unlockable badges for milestones
- **Point multipliers**: Special events with bonus points
- **Leaderboard seasons**: Time-based competitions
- **Point redemption**: Exchange points for rewards
- **Team challenges**: Group-based point competitions

### Technical Improvements
- **Advanced analytics**: Detailed engagement insights
- **Machine learning**: Smart point allocation
- **Gamification**: More interactive elements
- **Mobile optimization**: Enhanced mobile experience

## 🐛 Troubleshooting

### Common Issues

**Points not updating**
- Check database triggers are active
- Verify user authentication
- Check for transaction errors in logs

**Leaderboard not refreshing**
- Ensure real-time subscriptions are working
- Check database function permissions
- Verify cache invalidation

**Rank calculation issues**
- Run `refresh_all_leaderboard_ranks()`
- Check for data consistency
- Verify index performance

### Debug Tools
- Use PointsTestPanel for manual testing
- Check browser console for errors
- Monitor Supabase logs
- Use database queries for verification

## 📝 API Reference

### PointsService Methods

```typescript
// Core functions
getCurrentUserPoints(): Promise<UserPoints | null>
getLeaderboard(filters?: LeaderboardFilters): Promise<CommunityLeaderboardEntry[]>
getPointHistory(userId: string, filters?: PointHistoryFilters): Promise<PointTransaction[]>

// Point management
addPoints(userId: string, points: number, type: PointTransactionType, ...): Promise<boolean>
handleEventAttendance(eventId: string, userId: string): Promise<boolean>
handleEventOrganization(eventId: string, userId: string): Promise<boolean>
handlePollCreation(pollId: string, userId: string): Promise<boolean>
handlePostSharing(postId: string, userId: string): Promise<boolean>

// Admin functions
refreshLeaderboardRanks(): Promise<boolean>
getPointsStatistics(): Promise<PointsStatistics>
```

### usePoints Hook

```typescript
const {
  userPoints,           // Current user's points data
  leaderboard,          // Community leaderboard
  pointHistory,         // User's transaction history
  loading,              // Loading states
  error,                // Error states
  refreshUserPoints,    // Refresh user data
  refreshLeaderboard,   // Refresh leaderboard
  addPoints,            // Manual point addition
  // ... other methods
} = usePoints();
```

## 🤝 Contributing

When contributing to the points system:

1. **Test thoroughly**: Use PointsTestPanel for testing
2. **Follow patterns**: Maintain consistency with existing code
3. **Update documentation**: Keep this README current
4. **Consider performance**: Optimize for real-time updates
5. **Security first**: Validate all user inputs

## 📄 License

This points system is part of The Glocal platform and follows the same licensing terms.
