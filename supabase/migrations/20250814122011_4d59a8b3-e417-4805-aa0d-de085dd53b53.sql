-- Create sample profiles with artist skills
INSERT INTO public.profiles (
  user_id, 
  username, 
  display_name, 
  bio, 
  user_type,
  location_city,
  location_state,
  location_country,
  artist_skills,
  hourly_rate_min,
  hourly_rate_max,
  portfolio_urls,
  is_verified
) VALUES 
-- Sample Artists
(gen_random_uuid(), 'sarah_musician', 'Sarah Johnson', 'Professional violinist with 10+ years of experience. Available for weddings, corporate events, and private parties.', 'artist', 'Los Angeles', 'CA', 'USA', ARRAY['Violin', 'Music Performance', 'Classical Music'], 150, 300, ARRAY['https://example.com/sarah-portfolio'], true),
(gen_random_uuid(), 'mike_photographer', 'Mike Chen', 'Wedding and event photographer specializing in candid moments and artistic portraits.', 'artist', 'San Francisco', 'CA', 'USA', ARRAY['Photography', 'Wedding Photography', 'Portrait Photography'], 200, 500, ARRAY['https://example.com/mike-photos'], true),
(gen_random_uuid(), 'alex_dj', 'Alex Rivera', 'Professional DJ and MC for all types of events. Specializing in modern hits and crowd interaction.', 'artist', 'Miami', 'FL', 'USA', ARRAY['DJ', 'Music Mixing', 'Event Hosting'], 100, 250, ARRAY['https://example.com/alex-mixes'], false),
-- Sample Regular Users
(gen_random_uuid(), 'event_planner_jane', 'Jane Smith', 'Professional event planner looking for talented artists for client events.', 'user', 'New York', 'NY', 'USA', NULL, NULL, NULL, NULL, false),
(gen_random_uuid(), 'party_host_tom', 'Tom Wilson', 'Love organizing memorable events and always looking for great entertainment.', 'user', 'Chicago', 'IL', 'USA', NULL, NULL, NULL, NULL, false);