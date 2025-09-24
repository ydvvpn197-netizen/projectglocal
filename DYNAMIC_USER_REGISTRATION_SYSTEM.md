# Dynamic User Registration System

## Overview

The Dynamic User Registration System provides automatic profile creation, role-based access control, and comprehensive user management for both regular users and artists. The system automatically creates appropriate user profiles and settings when users sign up, and provides role-based access to platform features.

## Features

### 🚀 Automatic Profile Creation
- **Database Triggers**: Automatically creates user profiles when users sign up
- **Role-Based Profiles**: Creates appropriate profiles for users vs artists
- **Default Settings**: Sets up default notification and privacy settings
- **Fallback Handling**: Manual profile creation if triggers fail

### 👤 User Types
- **Regular Users**: Standard community members with basic features
- **Artists**: Enhanced profiles with professional information, skills, rates, and portfolio

### 🔐 Role-Based Access Control
- **Role Guards**: Components that show/hide content based on user role
- **Permission Checks**: Hooks for checking user permissions
- **Dynamic UI**: Interface adapts based on user type

### ⚙️ Profile Management
- **Unified Settings**: Single interface for all user settings
- **Role-Specific Fields**: Different fields for users vs artists
- **Privacy Controls**: Granular privacy and visibility settings
- **Notification Management**: Comprehensive notification preferences

## Architecture

### Core Components

#### 1. UserService (`src/services/userService.ts`)
Central service for all user operations:
- Profile creation and management
- Settings management
- Role checking
- Artist profile management

#### 2. Database Functions
- `handle_new_user()`: Automatically creates profiles on signup
- Triggers on `auth.users` table
- Creates profiles, artist profiles, and notification settings

#### 3. React Hooks
- `useUserRole()`: Get current user role and permissions
- `useUserProfile()`: Manage user profile and settings
- Role-based state management

#### 4. Role Guards
- `RoleGuard`: Generic role-based component wrapper
- `ArtistOnly`: Show content only to artists
- `UserOnly`: Show content only to regular users

## Database Schema

### Profiles Table
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_type TEXT CHECK (user_type IN ('user', 'artist')),
  display_name TEXT,
  bio TEXT,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  website_url TEXT,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Artists Table
```sql
CREATE TABLE public.artists (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  specialty TEXT[],
  experience_years INTEGER DEFAULT 0,
  portfolio_urls TEXT[],
  hourly_rate_min DECIMAL,
  hourly_rate_max DECIMAL,
  bio TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Notification Settings Table
```sql
CREATE TABLE public.user_notification_settings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  booking_notifications BOOLEAN DEFAULT TRUE,
  message_notifications BOOLEAN DEFAULT TRUE,
  follower_notifications BOOLEAN DEFAULT TRUE,
  event_notifications BOOLEAN DEFAULT TRUE,
  discussion_notifications BOOLEAN DEFAULT TRUE,
  payment_notifications BOOLEAN DEFAULT TRUE,
  system_notifications BOOLEAN DEFAULT TRUE,
  marketing_notifications BOOLEAN DEFAULT FALSE,
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Usage Examples

### 1. Basic Role Checking
```tsx
import { useUserRole } from '@/hooks/useUserRole';

function MyComponent() {
  const { role, isUser, isArtist, loading } = useUserRole();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {isArtist && <div>Artist content</div>}
      {isUser && <div>User content</div>}
    </div>
  );
}
```

### 2. Role-Based Components
```tsx
import { ArtistOnly, UserOnly, RoleGuard } from '@/components/auth/RoleGuard';

function MyPage() {
  return (
    <div>
      {/* Show to all users */}
      <RoleGuard allowedRoles={['user', 'artist']}>
        <div>Available to everyone</div>
      </RoleGuard>
      
      {/* Show only to artists */}
      <ArtistOnly>
        <div>Artist-only content</div>
      </ArtistOnly>
      
      {/* Show only to regular users */}
      <UserOnly>
        <div>User-only content</div>
      </UserOnly>
    </div>
  );
}
```

### 3. Profile Management
```tsx
import { useUserProfile } from '@/hooks/useUserProfile';

function ProfilePage() {
  const { 
    profile, 
    artistProfile, 
    settings, 
    updateProfile, 
    updateArtistProfile, 
    updateSettings 
  } = useUserProfile();
  
  const handleUpdateProfile = async () => {
    const result = await updateProfile({
      display_name: 'New Name',
      bio: 'Updated bio'
    });
    
    if (result.success) {
      console.log('Profile updated!');
    }
  };
  
  return (
    <div>
      <h1>{profile?.display_name}</h1>
      <p>{profile?.bio}</p>
      {/* Artist-specific content */}
      {artistProfile && (
        <div>
          <p>Experience: {artistProfile.experience_years} years</p>
          <p>Specialties: {artistProfile.specialty?.join(', ')}</p>
        </div>
      )}
    </div>
  );
}
```

### 4. Settings Management
```tsx
import { useUserProfile } from '@/hooks/useUserProfile';

function SettingsPage() {
  const { settings, updateSettings } = useUserProfile();
  
  const handleNotificationToggle = async () => {
    await updateSettings({
      email_notifications: !settings?.email_notifications
    });
  };
  
  return (
    <div>
      <label>
        <input 
          type="checkbox" 
          checked={settings?.email_notifications || false}
          onChange={handleNotificationToggle}
        />
        Email Notifications
      </label>
    </div>
  );
}
```

## Signup Flow

### 1. User Registration
```tsx
// In signup form
const { signUp } = useAuth();

const handleSignup = async (email, password, firstName, lastName, userType) => {
  const { error } = await signUp(email, password, firstName, lastName, userType);
  
  if (!error) {
    // Profile is automatically created by database trigger
    if (userType === 'artist') {
      navigate('/artist-onboarding');
    } else {
      navigate('/feed');
    }
  }
};
```

### 2. Automatic Profile Creation
The database trigger automatically:
1. Creates a profile in the `profiles` table
2. If user is an artist, creates an artist profile
3. Sets up default notification settings
4. Handles all the initial data setup

## API Reference

### UserService Methods

#### `createUserProfile(data: CreateUserProfileData)`
Creates a new user profile with role-specific data.

#### `getUserProfile(userId: string)`
Retrieves user profile and artist profile (if applicable).

#### `updateUserProfile(userId: string, updates: Partial<UserProfile>)`
Updates user profile information.

#### `updateArtistProfile(userId: string, updates: Partial<ArtistProfile>)`
Updates artist-specific profile information.

#### `getUserSettings(userId: string)`
Retrieves all user settings including notifications and privacy.

#### `updateUserSettings(userId: string, settings: Partial<UserSettings>)`
Updates user settings.

#### `hasRole(userId: string, role: 'user' | 'artist')`
Checks if user has a specific role.

#### `getUserRole(userId: string)`
Gets the user's current role.

### Hooks

#### `useUserRole()`
Returns:
- `role`: Current user role ('user' | 'artist' | null)
- `isUser`: Boolean if user is a regular user
- `isArtist`: Boolean if user is an artist
- `loading`: Loading state
- `error`: Error message if any

#### `useUserProfile()`
Returns:
- `profile`: User profile data
- `artistProfile`: Artist profile data (if applicable)
- `settings`: User settings
- `loading`: Loading state
- `error`: Error message if any
- `updateProfile()`: Function to update profile
- `updateArtistProfile()`: Function to update artist profile
- `updateSettings()`: Function to update settings
- `refreshProfile()`: Function to refresh all data

### Role Guard Components

#### `RoleGuard`
Generic role-based wrapper component.
```tsx
<RoleGuard allowedRoles={['user', 'artist']} fallback={<div>Access denied</div>}>
  <div>Content for allowed roles</div>
</RoleGuard>
```

#### `ArtistOnly`
Shows content only to artists.
```tsx
<ArtistOnly fallback={<div>Artist features only</div>}>
  <div>Artist content</div>
</ArtistOnly>
```

#### `UserOnly`
Shows content only to regular users.
```tsx
<UserOnly fallback={<div>User features only</div>}>
  <div>User content</div>
</UserOnly>
```

## Security Features

### Row Level Security (RLS)
All tables have RLS policies to ensure users can only access their own data:
- Users can only view/edit their own profiles
- Artists can only view/edit their own artist profiles
- Settings are user-specific

### Data Validation
- Input validation on all forms
- Type checking with TypeScript
- Database constraints and checks

### Privacy Controls
- Profile visibility settings
- Contact information privacy
- Message permissions
- Location sharing controls

## Migration Guide

### From Old System
1. The new system is backward compatible
2. Existing users will work with the new system
3. New signups automatically get the enhanced system
4. Gradual migration of existing profiles is supported

### Database Migration
The system includes database migrations that:
1. Add new columns to existing tables
2. Create new tables for artists and settings
3. Set up triggers for automatic profile creation
4. Add RLS policies for security

## Best Practices

### 1. Always Check Loading States
```tsx
const { role, loading } = useUserRole();
if (loading) return <LoadingSpinner />;
```

### 2. Handle Errors Gracefully
```tsx
const { profile, error } = useUserProfile();
if (error) return <ErrorMessage error={error} />;
```

### 3. Use Role Guards for UI
```tsx
// Good: Use role guards for conditional rendering
<ArtistOnly>
  <ArtistDashboard />
</ArtistOnly>

// Avoid: Manual role checking in components
{isArtist && <ArtistDashboard />}
```

### 4. Optimistic Updates
The system supports optimistic updates for better UX:
```tsx
const { updateProfile } = useUserProfile();
// Local state updates immediately, then syncs with server
```

## Troubleshooting

### Common Issues

1. **Profile not created after signup**
   - Check database triggers are installed
   - Verify user has proper permissions
   - Check console for errors

2. **Role not updating**
   - Ensure user is properly authenticated
   - Check database for correct user_type
   - Refresh the page

3. **Settings not saving**
   - Check network connection
   - Verify user permissions
   - Check for validation errors

### Debug Tools
- Use the `UserRoleDemo` component to test role-based features
- Check browser console for errors
- Use database queries to verify data

## Future Enhancements

### Planned Features
- **Admin Roles**: Super admin and moderator roles
- **Team Management**: Artist teams and collaborations
- **Advanced Permissions**: Granular permission system
- **Audit Logging**: Track profile changes and access
- **Bulk Operations**: Manage multiple users at once

### Integration Points
- **Payment System**: Role-based payment features
- **Booking System**: Artist-specific booking management
- **Messaging**: Role-based messaging permissions
- **Analytics**: Role-based analytics and insights

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Test with the demo components
4. Check database logs and triggers

The system is designed to be robust, secure, and user-friendly while providing powerful role-based functionality for the platform.
