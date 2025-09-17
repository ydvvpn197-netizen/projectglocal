-- migrations/20250917_add_authenticated_select_policies.sql

BEGIN;

-- Enable RLS and allow only authenticated users to SELECT from posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop any old policy with same name to avoid duplicates
DROP POLICY IF EXISTS "authenticated_select_posts" ON public.posts;

CREATE POLICY "authenticated_select_posts" 
  ON public.posts
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- community_groups
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_community_groups" ON public.community_groups;

CREATE POLICY "authenticated_select_community_groups" 
  ON public.community_groups
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- artists
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_artists" ON public.artists;

CREATE POLICY "authenticated_select_artists" 
  ON public.artists
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- discussions
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_discussions" ON public.discussions;

CREATE POLICY "authenticated_select_discussions" 
  ON public.discussions
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

COMMIT;
