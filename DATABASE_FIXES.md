# Database Fixes Applied

## Artist Profile Creation Issue - Fixed

**Date:** January 17, 2025

**Issue:** Artist profile creation was failing with error "Failed to create artist profile. Please try again."

**Root Cause:** The `artists` table was missing from the database, even though the migration that should have created it was marked as applied.

**Solution Applied:**

1. **Created missing `artists` table:**
   ```sql
   CREATE TABLE public.artists (
     id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     specialty TEXT[] DEFAULT '{}',
     experience_years INTEGER DEFAULT 0,
     portfolio_urls TEXT[] DEFAULT '{}',
     hourly_rate_min DECIMAL,
     hourly_rate_max DECIMAL,
     bio TEXT,
     is_available BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
     updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
     UNIQUE(user_id)
   );
   ```

2. **Added missing `user_type` column to profiles table:**
   ```sql
   ALTER TABLE public.profiles 
   ADD COLUMN user_type TEXT DEFAULT 'user' CHECK (user_type IN ('user', 'artist'));
   ```

3. **Set up RLS policies for artists table:**
   - Artists can insert their own profile
   - Artists can update their own profile
   - Artists can view profiles

4. **Created triggers for automatic timestamp management**

**Result:** Artist profile creation now works correctly. Users can complete the artist onboarding form without errors.

**Files Affected:**
- Database: `artists` table created
- Database: `profiles` table updated with `user_type` column
- Code: No changes needed - existing code in `src/pages/ArtistOnboarding.tsx` works correctly
