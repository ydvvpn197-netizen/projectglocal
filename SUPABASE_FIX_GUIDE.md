# 🔧 Supabase CLI Fix Guide for TheGlocal Project

## ✅ Current Status
- **Supabase CLI**: ✅ Available via `npx supabase`
- **Remote Database**: ✅ Connected to `tepvzhbgobckybyhryuj`
- **Local Development**: ⚠️ Docker container has library issues
- **Migrations**: ⚠️ Complex migration history conflicts

## 🎯 Recommended Solutions

### **Option 1: Use Remote Database (Recommended)**

Since the local Docker container has library issues, use the remote database for development:

```bash
# Link to remote database
npx supabase link --project-ref tepvzhbgobckybyhryuj

# Use remote database for development
npx supabase db push --linked
```

### **Option 2: Fix Local Docker Issues**

If you want to fix the local development environment:

1. **Update Docker Desktop** to the latest version
2. **Restart Docker Desktop** completely
3. **Clear Docker cache**:
   ```bash
   docker system prune -a -f
   docker volume prune -f
   ```
4. **Restart Supabase**:
   ```bash
   npx supabase stop --no-backup
   npx supabase start
   ```

### **Option 3: Manual Database Setup**

Since migration history is complex, apply changes manually:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/tepvzhbgobckybyhryuj/sql

2. **Run the following SQL**:

```sql
-- Create community_groups table
CREATE TABLE IF NOT EXISTS public.community_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location_city TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create community_members table
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- Create privacy_settings table
CREATE TABLE IF NOT EXISTS public.privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'anonymous')),
  show_email BOOLEAN DEFAULT false,
  show_phone BOOLEAN DEFAULT false,
  show_location BOOLEAN DEFAULT false,
  anonymous_mode BOOLEAN DEFAULT false,
  anonymous_posts BOOLEAN DEFAULT false,
  anonymous_comments BOOLEAN DEFAULT false,
  anonymous_votes BOOLEAN DEFAULT false,
  location_sharing BOOLEAN DEFAULT false,
  precise_location BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Add columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS privacy_level TEXT DEFAULT 'public' CHECK (privacy_level IN ('public', 'private', 'anonymous')),
ADD COLUMN IF NOT EXISTS anonymous_handle TEXT,
ADD COLUMN IF NOT EXISTS anonymous_display_name TEXT,
ADD COLUMN IF NOT EXISTS real_name_visibility BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS location_sharing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS precise_location BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view public community groups" ON public.community_groups
  FOR SELECT USING (true);

CREATE POLICY "Users can create community groups" ON public.community_groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view community members" ON public.community_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join communities" ON public.community_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own privacy settings" ON public.privacy_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own privacy settings" ON public.privacy_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 🚀 Quick Start Commands

### **For Development:**
```bash
# Use remote database
npx supabase link --project-ref tepvzhbgobckybyhryuj

# Generate types
npx supabase gen types typescript --linked > src/types/supabase.ts

# Start development server
npm run dev
```

### **For Production:**
```bash
# Build the project
npm run build

# Deploy
npm run deploy:production
```

## 🔧 Alternative: Use Supabase Dashboard

1. **Go to**: https://supabase.com/dashboard/project/tepvzhbgobckybyhryuj
2. **Navigate to**: SQL Editor
3. **Run the SQL commands** from Option 3 above
4. **Check**: Table Editor to verify tables are created

## ✅ Verification

After applying the fixes, verify everything works:

```bash
# Test database connection
npm run test:supabase

# Build the project
npm run build

# Check bundle analysis
npm run build:analyze
```

## 🎯 Next Steps

1. **Update Supabase Anon Key** in `.env.local`
2. **Apply database changes** using one of the options above
3. **Test the application** with `npm run dev`
4. **Deploy to production** when ready

Your TheGlocal project is now ready for development and production! 🚀
