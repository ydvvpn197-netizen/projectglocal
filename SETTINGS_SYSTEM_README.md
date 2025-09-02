# Settings System Documentation

## Overview

The Settings system has been completely rebuilt to provide a fully functional, modular, and maintainable solution for managing user preferences and account settings. The system is built with TypeScript, follows React best practices, and integrates seamlessly with the existing Supabase backend.

## Architecture

### Core Components

1. **UserSettingsService** (`src/services/userSettingsService.ts`)
   - Central service for all settings operations
   - Handles database interactions for profiles and notification settings
   - Provides methods for updating, fetching, and managing user settings

2. **useUserSettings Hook** (`src/hooks/useUserSettings.tsx`)
   - Custom React hook for managing settings state
   - Provides methods for updating different types of settings
   - Handles loading states, error handling, and optimistic updates

3. **Settings Page** (`src/pages/Settings.tsx`)
   - Main settings interface with tabbed navigation
   - Integrates all settings components
   - Provides global save/reset functionality

### Modular Settings Components

1. **ProfileSettings** (`src/components/ProfileSettings.tsx`)
   - Manages personal information, contact details, and location
   - Supports avatar upload and preview
   - Handles artist-specific fields when applicable

2. **NotificationSettings** (`src/components/NotificationSettings.tsx`)
   - Comprehensive notification preferences management
   - Includes quiet hours configuration
   - Supports granular control over different notification types

3. **PrivacySettings** (`src/components/PrivacySettings.tsx`)
   - Privacy controls and data sharing preferences
   - Profile visibility settings
   - Message and contact permissions

4. **SecuritySettings** (`src/components/SecuritySettings.tsx`)
   - Password change with strength validation
   - Two-factor authentication settings
   - Security alerts and notifications

5. **LocationSettings** (`src/components/LocationSettings.tsx`)
   - Location preferences and real-time location settings
   - Travel radius and location-based features

## Features

### Profile Management
- **Personal Information**: First name, last name, display name, bio
- **Contact Details**: Phone number, website, email (read-only)
- **Location**: City, state, country with map integration
- **Artist Profile**: Skills, experience, rates, portfolio (when applicable)
- **Avatar Management**: Upload, preview, and crop functionality

### Notification Preferences
- **General**: Email and push notification toggles
- **Specific Types**: 
  - Booking updates
  - Messages and conversations
  - Follower activity
  - Event notifications
  - Discussion activity
  - Payment updates
  - System messages
  - Marketing communications
- **Quiet Hours**: Configurable time-based notification pausing
- **Granular Control**: Individual toggles for each notification type

### Privacy Controls
- **Profile Visibility**: Public/private profile settings
- **Information Sharing**: Control what information is visible to others
- **Message Permissions**: Who can send direct messages
- **Search & Discovery**: Control profile discoverability
- **Data Sharing**: Analytics and personalization preferences

### Security Features
- **Password Management**: Secure password change with strength validation
- **Two-Factor Authentication**: Enhanced account security
- **Login Notifications**: Alerts for new device access
- **Session Management**: Control active sessions across devices
- **Security Alerts**: Suspicious activity and account change notifications

## Database Schema

### Profiles Table
```sql
-- Core profile fields
user_id, display_name, bio, first_name, last_name
phone_number, website_url, avatar_url
location_city, location_state, location_country
real_time_location_enabled, latitude, longitude

-- Artist-specific fields
artist_skills, hourly_rate_min, hourly_rate_max
portfolio_urls, experience_years, education
certifications, languages, travel_radius
```

### User Notification Settings Table
```sql
-- Notification preferences
email_notifications, push_notifications
booking_notifications, message_notifications
follower_notifications, event_notifications
discussion_notifications, payment_notifications
system_notifications, marketing_notifications

-- Quiet hours
quiet_hours_enabled, quiet_hours_start, quiet_hours_end
```

## Usage Examples

### Basic Settings Usage
```tsx
import { useUserSettings } from '@/hooks/useUserSettings';

const MyComponent = () => {
  const { 
    settings, 
    loading, 
    saving, 
    updateProfileSettings,
    handleSettingChange 
  } = useUserSettings();

  const handleSave = async () => {
    const result = await updateProfileSettings({
      display_name: 'New Name',
      bio: 'Updated bio'
    });
    
    if (result.success) {
      // Handle success
    }
  };

  return (
    <div>
      <input
        value={settings.display_name || ''}
        onChange={(e) => handleSettingChange('display_name', e.target.value)}
      />
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
};
```

### Component Integration
```tsx
import { ProfileSettings } from '@/components/ProfileSettings';

const SettingsPage = () => {
  return (
    <div>
      <h1>Account Settings</h1>
      <ProfileSettings 
        showAvatar={true} 
        compact={false} 
        onClose={() => {/* handle close */}} 
      />
    </div>
  );
};
```

## State Management

### Local State
Each settings component maintains its own local state to track changes before saving to the database. This provides:
- Immediate UI feedback
- Change detection
- Optimistic updates
- Form validation

### Global State
The `useUserSettings` hook manages global settings state and provides:
- Centralized data fetching
- Consistent error handling
- Loading state management
- Change tracking across components

## Error Handling

### Validation
- **Client-side**: Form validation, password strength checking
- **Server-side**: Database constraints, authentication checks
- **User Feedback**: Toast notifications for success/error states

### Error Recovery
- Automatic retry for network failures
- Graceful degradation for optional features
- Clear error messages for user guidance

## Performance Optimizations

### Lazy Loading
- Settings components are loaded only when needed
- Heavy operations (like avatar processing) are deferred

### Efficient Updates
- Batch updates for multiple setting changes
- Optimistic updates for better perceived performance
- Debounced save operations to reduce API calls

### Caching
- Settings are cached in local state
- Database queries are minimized through smart fetching
- Real-time updates through Supabase subscriptions

## Security Considerations

### Authentication
- All settings operations require valid user authentication
- Session validation on every request
- Secure password change with current password verification

### Data Validation
- Input sanitization and validation
- SQL injection prevention through parameterized queries
- XSS protection through proper escaping

### Privacy Controls
- User-controlled data sharing preferences
- Granular permission system
- Audit trail for sensitive operations

## Testing

### Unit Tests
- Service layer testing with mocked database
- Hook testing with React Testing Library
- Component testing with isolated rendering

### Integration Tests
- End-to-end settings workflow testing
- Database integration testing
- API endpoint validation

### User Acceptance Testing
- Settings modification workflows
- Error handling scenarios
- Cross-browser compatibility

## Future Enhancements

### Planned Features
- **Advanced Privacy**: Data export/import, GDPR compliance tools
- **Enhanced Security**: Biometric authentication, hardware security keys
- **Customization**: Theme settings, layout preferences
- **Integration**: Third-party service connections

### Scalability Improvements
- **Performance**: Virtual scrolling for large settings lists
- **Caching**: Redis-based caching for frequently accessed settings
- **Real-time**: WebSocket updates for collaborative settings

## Troubleshooting

### Common Issues

1. **Settings Not Saving**
   - Check user authentication status
   - Verify database connection
   - Review console for error messages

2. **Component Not Rendering**
   - Ensure proper imports
   - Check component props
   - Verify hook dependencies

3. **Database Errors**
   - Check table schema
   - Verify RLS policies
   - Review migration history

### Debug Mode
Enable debug logging by setting:
```typescript
localStorage.setItem('settings-debug', 'true');
```

## Contributing

### Development Guidelines
1. Follow TypeScript strict mode
2. Use functional components with hooks
3. Implement proper error boundaries
4. Write comprehensive tests
5. Document all public APIs

### Code Style
- Use Prettier for formatting
- Follow ESLint rules
- Maintain consistent naming conventions
- Add JSDoc comments for complex functions

## Support

For technical support or questions about the settings system:
- Check the troubleshooting section above
- Review the component documentation
- Consult the database schema documentation
- Contact the development team

---

*Last updated: [Current Date]*
*Version: 1.0.0*
