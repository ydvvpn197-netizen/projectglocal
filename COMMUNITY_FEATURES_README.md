# Community Review and Poll Features

This document describes the implementation of the comprehensive review system and community polls feature for the Local Social Hub platform.

## Overview

The Community page now includes two major interactive features:
1. **Local Business Reviews** - Users can write, read, and interact with business reviews
2. **Community Polls** - Users can create and participate in community polls

## Features Implemented

### 🏪 Local Business Reviews

#### **Write Review Feature**
- **Location**: Community page → "Local Reviews" tab → "Write Review" button
- **Functionality**: 
  - Comprehensive review form with business name, category, rating, and review text
  - Star rating system (1-5 stars) with interactive hover effects
  - Business category selection (Restaurant, Café, Retail, Service, etc.)
  - Optional location field
  - Form validation with error handling
  - Character limit and minimum requirements

#### **Review Display**
- **Review Cards**: Show business name, category, rating, review text, and author info
- **Interactive Elements**:
  - Helpful votes (thumbs up) with real-time count updates
  - Reply functionality to engage with reviews
  - Author avatars and timestamps
  - Category badges with color coding
- **User Actions**:
  - Mark reviews as helpful/unhelpful
  - Add replies to reviews
  - Delete own reviews
  - View review statistics

#### **Review Categories**
- Restaurant, Café, Retail Store, Service Business
- Entertainment, Health & Wellness, Beauty & Spa
- Automotive, Home & Garden, Fitness & Sports
- Education, Professional Services, Other

### 📊 Community Polls

#### **Create Poll Feature**
- **Location**: Community page → "Community Polls" tab → "Create Poll" button
- **Functionality**:
  - Poll title and optional description
  - Dynamic option management (2-10 options)
  - Add/remove poll options with validation
  - Optional expiration date setting
  - Form validation for unique options and minimum requirements

#### **Poll Display**
- **Poll Cards**: Show poll title, description, options, and voting results
- **Interactive Elements**:
  - Real-time vote counting and percentage display
  - Progress bars for visual vote representation
  - User vote tracking and "Your vote" badges
  - Time remaining display for polls with expiration
  - Author information and creation date
- **User Actions**:
  - Vote on polls (one vote per user)
  - Share polls with others
  - Delete own polls
  - View poll statistics

#### **Poll Features**
- **Voting System**: One vote per user per poll
- **Expiration Options**: 1 day, 3 days, 1 week, 2 weeks, 1 month
- **Option Management**: 2-10 options per poll
- **Real-time Updates**: Vote counts update immediately
- **Sharing**: Copy poll links or use native sharing

## Database Schema

### Reviews Tables
```sql
-- Main reviews table
reviews (
  id, user_id, business_name, business_category, rating,
  review_text, location, helpful_count, replies_count,
  created_at, updated_at
)

-- Review votes for helpful marking
review_votes (
  id, review_id, user_id, is_helpful, created_at
)

-- Review replies
review_replies (
  id, review_id, user_id, reply_text, created_at, updated_at
)
```

### Polls Tables
```sql
-- Main polls table
polls (
  id, user_id, title, description, options (JSONB),
  total_votes, expires_at, is_active, created_at, updated_at
)

-- Poll votes
poll_votes (
  id, poll_id, user_id, option_id, created_at
)
```

## Technical Implementation

### Frontend Components

#### **Review Components**
- `WriteReviewDialog.tsx` - Comprehensive review creation form
- `ReviewCard.tsx` - Display and interaction with reviews
- `useReviews.tsx` - Custom hook for review management

#### **Poll Components**
- `CreatePollDialog.tsx` - Poll creation form with dynamic options
- `PollCard.tsx` - Display and interaction with polls
- `usePolls.tsx` - Custom hook for poll management

### Backend Features

#### **Database Functions**
- **Triggers**: Automatic count updates for helpful votes, replies, and poll votes
- **RLS Policies**: Secure access control for all tables
- **Indexes**: Optimized queries for performance

#### **Real-time Features**
- **Vote Counting**: Automatic updates when users vote
- **Helpful Counts**: Real-time helpful vote tracking
- **Reply Counts**: Automatic reply counting

### Security & Validation

#### **Form Validation**
- **Reviews**: Business name required, minimum 10 characters for review text
- **Polls**: Title required (min 5 chars), at least 2 unique options
- **Voting**: One vote per user per poll, can change vote
- **Helpful Votes**: One helpful vote per user per review

#### **Data Integrity**
- **Foreign Key Constraints**: Proper relationships between tables
- **Cascade Deletes**: Clean data removal when users delete content
- **Unique Constraints**: Prevent duplicate votes and helpful marks

## User Experience Features

### **Review System**
- **Star Rating**: Interactive 5-star rating with hover effects
- **Category Badges**: Color-coded business categories
- **Helpful Voting**: Thumbs up system with real-time updates
- **Reply System**: Engage with reviews through replies
- **Author Information**: User avatars and names
- **Timestamps**: Relative time display (Today, Yesterday, etc.)

### **Poll System**
- **Dynamic Options**: Add/remove poll options during creation
- **Visual Results**: Progress bars and percentage displays
- **Vote Tracking**: Clear indication of user's vote
- **Expiration Display**: Time remaining for polls with deadlines
- **Sharing**: Easy poll sharing functionality

### **Community Integration**
- **Tabbed Interface**: Organized sections for Discussions, Polls, and Reviews
- **Empty States**: Helpful messages when no content exists
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages

## Usage Instructions

### **Writing a Review**
1. Navigate to Community → Local Reviews tab
2. Click "Write Review" button
3. Fill in business name and select category
4. Rate the business (1-5 stars)
5. Write your review (minimum 10 characters)
6. Optionally add location
7. Click "Post Review"

### **Creating a Poll**
1. Navigate to Community → Community Polls tab
2. Click "Create Poll" button
3. Enter poll title and optional description
4. Add poll options (minimum 2, maximum 10)
5. Optionally set expiration date
6. Click "Create Poll"

### **Voting on Polls**
1. Browse available polls in Community Polls tab
2. Click on an option to select it
3. Click "Vote" button to submit
4. View real-time results and percentages

### **Interacting with Reviews**
1. Browse reviews in Local Reviews tab
2. Click thumbs up to mark as helpful
3. Click reply button to add a response
4. View helpful counts and reply counts

## Performance Optimizations

### **Database**
- **Indexes**: Optimized queries for user_id, created_at, and category
- **Triggers**: Efficient count updates without additional queries
- **RLS**: Secure and performant row-level security

### **Frontend**
- **Lazy Loading**: Components load only when needed
- **State Management**: Efficient state updates with custom hooks
- **Real-time Updates**: Immediate UI feedback for user actions

## Future Enhancements

### **Review System**
- **Photo Uploads**: Allow users to add photos to reviews
- **Review Moderation**: Admin tools for review management
- **Business Verification**: Verified business badges
- **Review Analytics**: Business performance metrics

### **Poll System**
- **Multiple Choice**: Allow multiple option selection
- **Poll Templates**: Pre-made poll templates
- **Poll Analytics**: Detailed voting statistics
- **Poll Embedding**: Embed polls in other pages

### **Community Features**
- **Review/Poll Notifications**: Notify users of new content
- **Trending Content**: Highlight popular reviews and polls
- **Search & Filtering**: Advanced search capabilities
- **Mobile Optimization**: Enhanced mobile experience

## Deployment Notes

1. **Database Migration**: Run the new migration file first
2. **Component Updates**: Deploy updated components
3. **Hook Integration**: Ensure custom hooks are properly imported
4. **Testing**: Test review and poll creation/voting flows
5. **Monitoring**: Monitor database performance with new tables

## Support & Troubleshooting

### **Common Issues**
- **Vote Not Recording**: Check user authentication and RLS policies
- **Count Not Updating**: Verify trigger functions are working
- **Form Validation**: Ensure all required fields are filled

### **Debug Steps**
1. Check browser console for errors
2. Verify database connection and permissions
3. Test RLS policies with different user roles
4. Monitor database logs for trigger execution

## Conclusion

The Community Review and Poll features provide a comprehensive platform for user engagement and community building. The implementation includes robust database design, secure access controls, and an intuitive user interface that encourages participation and interaction.
