# Profile Photo and Followers Features

This document describes the new features implemented for profile photo management and followers/following lists.

## Features Implemented

### 1. Profile Photo Upload and Management

#### Components Created:
- `src/hooks/useProfilePhoto.tsx` - Hook for handling profile photo uploads
- `src/components/ProfilePhotoDialog.tsx` - Dialog component for photo upload/replacement

#### Features:
- **Upload Profile Photo**: Users can upload profile photos (JPEG, PNG, WebP, GIF)
- **File Validation**: 5MB size limit, supported format validation
- **Photo Replacement**: Users can replace existing photos
- **Photo Removal**: Users can remove their profile photo
- **Preview**: Real-time preview of selected photo before upload
- **Database Integration**: Photos are stored in Supabase storage and URLs are saved to profiles table

#### Usage:
```tsx
import { ProfilePhotoDialog } from '@/components/ProfilePhotoDialog';

<ProfilePhotoDialog
  currentAvatarUrl={profile?.avatar_url}
  displayName={profile?.display_name}
  onPhotoUpdated={handlePhotoUpdated}
  trigger={<Button>Change Photo</Button>}
/>
```

### 2. Followers and Following Lists

#### Components Created:
- `src/hooks/useFollowLists.tsx` - Hook for fetching followers/following lists
- `src/components/FollowListsDialog.tsx` - Dialog component for displaying lists

#### Features:
- **Followers List**: View all users who follow the current user
- **Following List**: View all users the current user follows
- **Interactive Actions**: Follow/unfollow users directly from the lists
- **User Navigation**: Click on users to navigate to their profiles
- **Real-time Updates**: Lists update automatically when follow status changes
- **Loading States**: Proper loading indicators for better UX

#### Usage:
```tsx
import { FollowListsDialog } from '@/components/FollowListsDialog';

<FollowListsDialog
  userId={user?.id || ''}
  followersCount={followersCount}
  followingCount={followingCount}
  trigger={<div>Click to view followers/following</div>}
/>
```

## Database Changes

### Storage Buckets
- **avatars**: For profile photos (5MB limit)
- **posts**: For post images (10MB limit)

### Storage Policies
- Users can upload/update/delete their own avatars
- Anyone can view avatars (public access)
- Proper file type and size restrictions

### Database Functions
- `generate_avatar_path()`: Generates unique file paths for avatars
- `cleanup_old_avatar()`: Automatically removes old avatar files when updated

## Integration with Existing Profile Page

The new features are seamlessly integrated into the existing Profile page:

1. **Profile Photo Section**: The "Change Photo" button now opens the photo upload dialog
2. **Followers/Following Section**: The follower/following counts are now clickable and open the lists dialog
3. **Real-time Updates**: Profile photo and follower counts update immediately after changes

## File Structure

```
src/
├── hooks/
│   ├── useProfilePhoto.tsx          # Profile photo management
│   └── useFollowLists.tsx           # Followers/following lists
├── components/
│   ├── ProfilePhotoDialog.tsx       # Photo upload dialog
│   └── FollowListsDialog.tsx        # Followers/following dialog
└── pages/
    └── Profile.tsx                  # Updated with new features
```

## Setup Instructions

### 1. Database Setup
The storage buckets need to be created in Supabase:

1. Go to Supabase Dashboard > Storage
2. Create two buckets:
   - `avatars` (public, 5MB limit)
   - `posts` (public, 10MB limit)
3. Set up storage policies for proper access control

### 2. Environment Variables
Ensure your Supabase configuration is properly set up in your environment variables.

### 3. Testing
1. Navigate to the Profile page
2. Click "Change Photo" to test photo upload
3. Click on follower/following counts to test the lists
4. Try following/unfollowing users from the lists

## Error Handling

The features include comprehensive error handling:
- File validation (type, size)
- Upload failures
- Network errors
- Authentication requirements
- User-friendly error messages via toast notifications

## Security Considerations

- File type validation on both client and server
- File size limits enforced
- User authentication required for uploads
- Proper storage policies for access control
- Automatic cleanup of old files

## Future Enhancements

Potential improvements for future versions:
- Image cropping and editing
- Multiple photo uploads
- Photo albums
- Advanced filtering for followers/following lists
- Bulk actions for following/unfollowing
- Follow suggestions
- Follow notifications
