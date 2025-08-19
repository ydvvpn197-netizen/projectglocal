-- Create payment-related tables for Stripe integration

-- Create booking_payments table
CREATE TABLE IF NOT EXISTS public.booking_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.artist_bookings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_intent_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  refund_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_orders table for event ticket purchases
CREATE TABLE IF NOT EXISTS public.event_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_intent_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_payment_methods table for saved payment methods
CREATE TABLE IF NOT EXISTS public.user_payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_method_id TEXT UNIQUE NOT NULL,
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_webhooks table for tracking Stripe webhooks
CREATE TABLE IF NOT EXISTS public.payment_webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_booking_payments_booking_id ON public.booking_payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_payments_user_id ON public.booking_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_payments_payment_intent_id ON public.booking_payments(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_event_orders_event_id ON public.event_orders(event_id);
CREATE INDEX IF NOT EXISTS idx_event_orders_user_id ON public.event_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_event_orders_payment_intent_id ON public.event_orders(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_user_payment_methods_user_id ON public.user_payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_stripe_event_id ON public.payment_webhooks(stripe_event_id);

-- Enable Row Level Security
ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for booking_payments
CREATE POLICY "Users can view their own booking payments" ON public.booking_payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own booking payments" ON public.booking_payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own booking payments" ON public.booking_payments
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for event_orders
CREATE POLICY "Users can view their own event orders" ON public.event_orders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own event orders" ON public.event_orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own event orders" ON public.event_orders
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for user_payment_methods
CREATE POLICY "Users can view their own payment methods" ON public.user_payment_methods
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own payment methods" ON public.user_payment_methods
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own payment methods" ON public.user_payment_methods
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own payment methods" ON public.user_payment_methods
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for payment_webhooks (admin only)
CREATE POLICY "Only admins can view payment webhooks" ON public.payment_webhooks
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE is_admin = true
  ));

CREATE POLICY "Only admins can insert payment webhooks" ON public.payment_webhooks
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE is_admin = true
  ));

-- Functions for payment processing

-- Function to update booking status when payment is completed
CREATE OR REPLACE FUNCTION update_booking_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.artist_bookings 
    SET status = 'confirmed'
    WHERE id = NEW.booking_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update event order status when payment is completed
CREATE OR REPLACE FUNCTION update_event_order_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.event_orders 
    SET status = 'completed'
    WHERE payment_intent_id = NEW.payment_intent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to ensure only one default payment method per user
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.user_payment_methods 
    SET is_default = false 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_booking_on_payment
  AFTER UPDATE ON public.booking_payments
  FOR EACH ROW EXECUTE FUNCTION update_booking_on_payment();

CREATE TRIGGER trigger_update_event_order_on_payment
  AFTER UPDATE ON public.booking_payments
  FOR EACH ROW EXECUTE FUNCTION update_event_order_on_payment();

CREATE TRIGGER trigger_ensure_single_default_payment_method
  BEFORE INSERT OR UPDATE ON public.user_payment_methods
  FOR EACH ROW EXECUTE FUNCTION ensure_single_default_payment_method();

-- Add admin column to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Update the delete_user_account function to include new payment tables
CREATE OR REPLACE FUNCTION delete_user_account(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete in order to respect foreign key constraints
  
  -- 1. Delete chat messages
  DELETE FROM chat_messages 
  WHERE conversation_id IN (
    SELECT id FROM chat_conversations 
    WHERE client_id = user_id OR artist_id = user_id
  );
  
  -- 2. Delete chat conversations
  DELETE FROM chat_conversations 
  WHERE client_id = user_id OR artist_id = user_id;
  
  -- 3. Delete notifications
  DELETE FROM notifications 
  WHERE user_id = user_id;
  
  -- 4. Delete artist bookings
  DELETE FROM artist_bookings 
  WHERE user_id = user_id OR artist_id IN (
    SELECT id FROM artists WHERE user_id = user_id
  );
  
  -- 5. Delete artist discussions
  DELETE FROM artist_discussions 
  WHERE artist_id IN (
    SELECT id FROM artists WHERE user_id = user_id
  );
  
  -- 6. Delete artists record
  DELETE FROM artists 
  WHERE user_id = user_id;
  
  -- 7. Delete comments
  DELETE FROM comments 
  WHERE user_id = user_id;
  
  -- 8. Delete likes
  DELETE FROM likes 
  WHERE user_id = user_id;
  
  -- 9. Delete follows
  DELETE FROM follows 
  WHERE follower_id = user_id OR following_id = user_id;
  
  -- 10. Delete posts
  DELETE FROM posts 
  WHERE user_id = user_id;
  
  -- 11. Delete events (if user created any)
  DELETE FROM events 
  WHERE created_by = user_id;
  
  -- 12. Delete groups (if user created any)
  DELETE FROM groups 
  WHERE created_by = user_id;
  
  -- 13. Delete discussions (if user created any)
  DELETE FROM discussions 
  WHERE created_by = user_id;
  
  -- 14. Delete poll votes
  DELETE FROM poll_votes 
  WHERE user_id = user_id;
  
  -- 15. Delete polls
  DELETE FROM polls 
  WHERE user_id = user_id;
  
  -- 16. Delete review votes
  DELETE FROM review_votes 
  WHERE user_id = user_id;
  
  -- 17. Delete review replies
  DELETE FROM review_replies 
  WHERE user_id = user_id;
  
  -- 18. Delete reviews
  DELETE FROM reviews 
  WHERE user_id = user_id;
  
  -- 19. Delete payment methods
  DELETE FROM user_payment_methods 
  WHERE user_id = user_id;
  
  -- 20. Delete event orders
  DELETE FROM event_orders 
  WHERE user_id = user_id;
  
  -- 21. Delete booking payments
  DELETE FROM booking_payments 
  WHERE user_id = user_id;
  
  -- 22. Finally delete the profile
  DELETE FROM profiles 
  WHERE user_id = user_id;
  
END;
$$;
