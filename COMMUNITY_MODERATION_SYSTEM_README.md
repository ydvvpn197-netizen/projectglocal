# Community Moderation Tools Implementation

## Overview

This implementation provides a comprehensive community-driven moderation system with transparent processes and community feedback integration. The system enables users to report content, provides transparency into moderation actions, and allows community feedback on moderation quality.

## Features Implemented

### 1. Community Reporting Interface
- **Component**: `CommunityReportingInterface.tsx`
- **Purpose**: Allows users to report content with detailed reasons and evidence
- **Features**:
  - Multiple report reasons (spam, harassment, misinformation, etc.)
  - Priority levels (low, medium, high, urgent)
  - Evidence upload support
  - Detailed description field
  - Real-time form validation

### 2. Transparency Dashboard
- **Component**: `CommunityTransparencyDashboard.tsx`
- **Purpose**: Public dashboard showing moderation statistics and actions
- **Features**:
  - Moderation statistics (total reports, response time, resolution rate)
  - Community trust score
  - Public moderation logs
  - Community feedback display
  - Analytics and insights

### 3. Community Feedback System
- **Component**: `CommunityFeedbackForm.tsx`
- **Purpose**: Allows community members to provide feedback on moderation quality
- **Features**:
  - Multiple feedback types (moderation quality, response time, transparency, guidelines)
  - 5-star rating system
  - Optional comments
  - Anonymous feedback support

### 4. Database Schema
- **Migration**: `20250127000002_add_community_moderation_tables.sql`
- **Tables**:
  - `community_reports`: User-submitted reports
  - `moderation_transparency_logs`: Public moderation actions
  - `community_feedback`: User feedback on moderation
  - `community_moderation_settings`: Configuration settings

### 5. Service Layer
- **Service**: `communityReportingService.ts`
- **Features**:
  - Report submission and management
  - Statistics calculation
  - Transparency log management
  - Community feedback handling
  - User report history

### 6. Integration Components
- **Hook**: `useCommunityReporting.ts`
- **Button**: `ReportButton.tsx`
- **Page**: `CommunityTransparency.tsx`

## Database Tables

### community_reports
```sql
- id: UUID (Primary Key)
- reporter_id: UUID (References auth.users)
- content_type: TEXT (post, comment, event, user, business, group)
- content_id: UUID
- reason: TEXT (spam, inappropriate, harassment, etc.)
- description: TEXT
- evidence: TEXT[]
- priority: TEXT (low, medium, high, urgent)
- status: TEXT (pending, under_review, resolved, dismissed, escalated)
- content_title: TEXT
- content_preview: TEXT
- assigned_moderator_id: UUID (References admin_users)
- resolution_notes: TEXT
- action_taken: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### moderation_transparency_logs
```sql
- id: UUID (Primary Key)
- action_type: TEXT (report_resolved, content_removed, user_warned, etc.)
- content_type: TEXT
- content_id: UUID
- reason: TEXT
- moderator_notes: TEXT
- action_taken: TEXT
- community_impact: TEXT (positive, neutral, negative)
- timestamp: TIMESTAMP
```

### community_feedback
```sql
- id: UUID (Primary Key)
- feedback_type: TEXT (moderation_quality, response_time, transparency, community_guidelines)
- rating: INTEGER (1-5)
- comment: TEXT
- submitted_by: UUID (References auth.users)
- timestamp: TIMESTAMP
```

## Row Level Security (RLS)

### community_reports
- Users can view/insert/update their own reports
- Admins can view/update all reports
- Pending reports can be updated by reporters

### moderation_transparency_logs
- Public read access for transparency
- Admin-only write access

### community_feedback
- Public read access for transparency
- Users can insert/update their own feedback

### community_moderation_settings
- Public read access for public settings
- Admin-only access for all settings

## API Endpoints

### Report Management
```typescript
// Submit a report
communityReportingService.submitReport(data: SubmitReportData): Promise<CommunityReport>

// Get user's reports
communityReportingService.getUserReports(userId: string): Promise<CommunityReport[]>
```

### Statistics & Transparency
```typescript
// Get moderation statistics
communityReportingService.getModerationStats(timeRange: 'week' | 'month' | 'quarter'): Promise<ModerationStats>

// Get transparency logs
communityReportingService.getTransparencyLogs(timeRange: 'week' | 'month' | 'quarter'): Promise<TransparencyLog[]>
```

### Community Feedback
```typescript
// Submit feedback
communityReportingService.submitFeedback(data: FeedbackData): Promise<CommunityFeedback>

// Get community feedback
communityReportingService.getCommunityFeedback(timeRange: 'week' | 'month' | 'quarter'): Promise<CommunityFeedback[]>
```

## Usage Examples

### Adding Report Button to Content
```tsx
import ReportButton from '@/components/ReportButton';

// In your component
<ReportButton
  contentType="post"
  contentId={post.id}
  contentTitle={post.title}
  contentPreview={post.content}
  onReportSubmitted={(reportId) => console.log('Report submitted:', reportId)}
/>
```

### Using the Reporting Hook
```tsx
import useCommunityReporting from '@/hooks/useCommunityReporting';

const MyComponent = () => {
  const { submitReport, isReporting, canReport } = useCommunityReporting({
    onReportSubmitted: (reportId) => {
      // Handle successful report submission
    },
    onError: (error) => {
      // Handle errors
    }
  });

  const handleReport = async () => {
    await submitReport({
      content_type: 'post',
      content_id: 'post-123',
      reason: 'spam',
      description: 'This is spam content',
      priority: 'medium'
    });
  };
};
```

### Accessing Transparency Dashboard
```tsx
import CommunityTransparencyDashboard from '@/components/CommunityTransparencyDashboard';

// In your component
<CommunityTransparencyDashboard />
```

## Routes Added

- `/community-transparency` - Main transparency dashboard page

## Key Features

### 1. Community-Driven Moderation
- Users can report content with detailed reasons
- Priority-based reporting system
- Evidence upload support
- Anonymous reporting option

### 2. Transparent Process
- Public moderation logs
- Real-time statistics
- Community trust scoring
- Response time tracking

### 3. Community Feedback Integration
- Feedback on moderation quality
- Multiple feedback categories
- Rating system
- Anonymous feedback support

### 4. Privacy-First Design
- Anonymous reporting options
- Privacy controls
- Data minimization
- User consent management

## Security Considerations

1. **Input Validation**: All user inputs are validated and sanitized
2. **Rate Limiting**: Report submission should be rate-limited
3. **Privacy Protection**: Sensitive information is protected
4. **Access Control**: RLS policies ensure proper access control
5. **Audit Logging**: All actions are logged for transparency

## Performance Optimizations

1. **Database Indexes**: Optimized indexes for common queries
2. **Caching**: Statistics can be cached for better performance
3. **Pagination**: Large datasets are paginated
4. **Lazy Loading**: Components are lazy-loaded where appropriate

## Future Enhancements

1. **AI-Powered Moderation**: Automated content analysis
2. **Community Juries**: Community-based decision making
3. **Appeal System**: User appeal process
4. **Moderation Analytics**: Advanced analytics and insights
5. **Integration APIs**: Third-party moderation service integration

## Testing

The system includes comprehensive error handling and fallback mechanisms:
- Mock data for development
- Graceful error handling
- User-friendly error messages
- Offline support considerations

## Deployment Notes

1. Run the database migration: `20250127000002_add_community_moderation_tables.sql`
2. Ensure RLS policies are properly configured
3. Set up proper indexes for performance
4. Configure rate limiting for report submission
5. Set up monitoring for moderation actions

This implementation provides a complete community moderation system that balances transparency, user privacy, and effective content moderation.
