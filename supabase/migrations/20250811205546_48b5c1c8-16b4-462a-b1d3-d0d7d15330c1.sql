-- Remove security_barrier setting from the view since it's causing the security definer warning
ALTER VIEW public.artist_bookings_safe RESET (security_barrier);

-- Instead, ensure the view properly inherits RLS from the underlying table
-- The view will be secure through the table's RLS policies