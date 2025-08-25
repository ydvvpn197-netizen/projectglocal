# Community Creation Fix Test

## Issue Fixed
The error "Failed to create community" was caused by the CommunityService trying to insert data into a table named `groups` when the actual database table is named `community_groups`.

## Changes Made
1. Updated all references in `src/services/communityService.ts` from `groups` to `community_groups`
2. Updated references in `src/services/discoveryService.ts` from `groups` to `community_groups`
3. Updated references in `src/services/searchService.ts` from `groups` to `community_groups`

## Files Modified
- `src/services/communityService.ts` - Fixed all table references
- `src/services/discoveryService.ts` - Fixed table reference in getTrendingGroups method
- `src/services/searchService.ts` - Fixed table reference in searchGroups method

## Database Schema
The correct table structure is:
```sql
CREATE TABLE IF NOT EXISTS community_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT true,
  allow_anonymous_posts BOOLEAN DEFAULT false,
  require_approval BOOLEAN DEFAULT false,
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  latitude NUMERIC,
  longitude NUMERIC,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, location_city)
);
```

## Test Steps
1. Navigate to the community creation page
2. Fill in the required fields (name, description, category)
3. Submit the form
4. Verify that the community is created successfully without errors

## Expected Result
The community creation should now work without the "Failed to create community" error.
