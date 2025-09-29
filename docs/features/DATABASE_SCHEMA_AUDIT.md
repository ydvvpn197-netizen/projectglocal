# Database Schema Audit & RLS Implementation

## Current Status
- ✅ Core schema exists with proper RLS policies
- ✅ RBAC system implemented
- ❌ Missing key tables for community features
- ❌ Anonymous identity tables missing
- ❌ News summarization tables incomplete

## Missing Tables Required

### 1. Anonymous Identity System
```sql
-- Anonymous handles table
CREATE TABLE public.anonymous_handles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  handle TEXT NOT NULL UNIQUE,
  display_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Privacy settings table
CREATE TABLE public.privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_anonymous BOOLEAN DEFAULT true,
  show_location BOOLEAN DEFAULT false,
  show_real_name BOOLEAN DEFAULT false,
  allow_direct_messages BOOLEAN DEFAULT true,
  data_retention TEXT DEFAULT 'minimal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 2. Community Features
```sql
-- Communities table
CREATE TABLE public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Community members
CREATE TABLE public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 3. News & AI Features
```sql
-- News articles table
CREATE TABLE public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  source_url TEXT,
  source_name TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI summaries table
CREATE TABLE public.ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  key_points TEXT[],
  sentiment TEXT,
  confidence_score DECIMAL(3,2),
  ai_provider TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## RLS Policy Updates Required

### 1. Anonymous Identity Policies
- Users can only see anonymous handles unless identity is revealed
- Identity reveal must be opt-in by both parties
- Privacy settings must be respected in all queries

### 2. Community Policies
- Public communities visible to all
- Private communities only visible to members
- Community creation requires authentication

### 3. News Policies
- News articles readable by all
- AI summaries readable by all
- Discussion threads respect privacy settings

## Implementation Steps
1. Create missing tables with proper constraints
2. Update RLS policies for privacy-aware access
3. Add indexes for performance
4. Test all policies with different user roles
5. Update application code to use new schema
