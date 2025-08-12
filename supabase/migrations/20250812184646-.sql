-- Create discussions table for location-based discussions
CREATE TABLE public.discussions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_anonymous BOOLEAN DEFAULT false,
  group_id UUID NULL, -- NULL for anonymous discussions
  latitude NUMERIC NULL,
  longitude NUMERIC NULL,
  location_city TEXT NULL,
  location_state TEXT NULL,
  location_country TEXT NULL,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

-- Create policies for discussions
CREATE POLICY "Users can create their own discussions" 
ON public.discussions 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own discussions" 
ON public.discussions 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own discussions" 
ON public.discussions 
FOR DELETE 
USING (user_id = auth.uid());

-- Location-based access policy
CREATE POLICY "Users can view discussions in their area" 
ON public.discussions 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  users_in_same_area(auth.uid(), user_id)
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_discussions_updated_at
BEFORE UPDATE ON public.discussions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Get discussions with profile info function
CREATE OR REPLACE FUNCTION public.get_discussions_with_details()
RETURNS TABLE(
  id UUID,
  user_id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  is_anonymous BOOLEAN,
  group_id UUID,
  group_name TEXT,
  author_name TEXT,
  author_avatar TEXT,
  likes_count INTEGER,
  replies_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.user_id,
    d.title,
    d.content,
    d.category,
    d.is_anonymous,
    d.group_id,
    g.name as group_name,
    CASE 
      WHEN d.is_anonymous THEN 'Anonymous'
      ELSE p.display_name
    END as author_name,
    CASE 
      WHEN d.is_anonymous THEN NULL
      ELSE p.avatar_url
    END as author_avatar,
    d.likes_count,
    d.replies_count,
    d.created_at,
    d.updated_at
  FROM public.discussions d
  LEFT JOIN public.profiles p ON d.user_id = p.user_id
  LEFT JOIN public.groups g ON d.group_id = g.id
  WHERE 
    d.user_id = auth.uid() OR 
    public.users_in_same_area(auth.uid(), d.user_id)
  ORDER BY d.created_at DESC;
END;
$$;