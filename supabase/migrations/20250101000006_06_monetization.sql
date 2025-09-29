-- ============================================================================
-- MONETIZATION SYSTEM - TheGlocal Project
-- ============================================================================
-- This migration handles:
-- - Payment processing and management
-- - Subscription management
-- - Service marketplace
-- - Booking system
-- - Revenue analytics
-- - Stripe integration
-- Date: 2025-01-01
-- Version: 1.0.0

-- ============================================================================
-- PAYMENT FUNCTIONS
-- ============================================================================

-- Function to create payment
CREATE OR REPLACE FUNCTION public.create_payment(
  p_user_id UUID,
  p_amount INTEGER,
  p_currency TEXT DEFAULT 'usd',
  p_payment_type TEXT,
  p_related_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
  new_payment_id UUID;
  result JSONB;
BEGIN
  -- Create payment record
  INSERT INTO public.payments (
    user_id, amount, currency, payment_type, related_id, metadata
  ) VALUES (
    p_user_id, p_amount, p_currency, p_payment_type, p_related_id, p_metadata
  ) RETURNING id INTO new_payment_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Payment created successfully',
    'payment_id', new_payment_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update payment status
CREATE OR REPLACE FUNCTION public.update_payment_status(
  p_payment_id UUID,
  p_status payment_status,
  p_stripe_payment_intent_id TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Update payment status
  UPDATE public.payments
  SET 
    status = p_status,
    stripe_payment_intent_id = COALESCE(p_stripe_payment_intent_id, stripe_payment_intent_id),
    updated_at = now()
  WHERE id = p_payment_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Payment status updated successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle successful payment
CREATE OR REPLACE FUNCTION public.handle_successful_payment(
  p_user_id UUID,
  p_payment_type TEXT,
  p_amount INTEGER,
  p_stripe_payment_intent_id TEXT,
  p_related_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  -- Insert payment record
  INSERT INTO public.payments (
    user_id,
    stripe_payment_intent_id,
    amount,
    status,
    payment_type,
    related_id
  ) VALUES (
    p_user_id,
    p_stripe_payment_intent_id,
    p_amount,
    'completed',
    p_payment_type,
    p_related_id
  );
  
  -- Handle different payment types
  IF p_payment_type = 'verification' THEN
    UPDATE public.profiles 
    SET 
      is_verified = TRUE,
      verification_expires_at = now() + interval '1 year',
      plan_type = 'verified'
    WHERE user_id = p_user_id;
    
  ELSIF p_payment_type = 'premium' THEN
    UPDATE public.profiles 
    SET 
      is_premium = TRUE,
      premium_expires_at = now() + interval '1 year',
      plan_type = 'premium'
    WHERE user_id = p_user_id;
    
  ELSIF p_payment_type = 'featured_event' AND p_related_id IS NOT NULL THEN
    UPDATE public.posts 
    SET 
      is_featured = TRUE,
      featured_until = now() + interval '7 days',
      stripe_payment_intent_id = p_stripe_payment_intent_id
    WHERE id = p_related_id AND user_id = p_user_id;
    
  ELSIF p_payment_type = 'service' AND p_related_id IS NOT NULL THEN
    UPDATE public.service_bookings 
    SET 
      status = 'confirmed',
      stripe_payment_intent_id = p_stripe_payment_intent_id
    WHERE id = p_related_id AND customer_id = p_user_id;
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user payments
CREATE OR REPLACE FUNCTION public.get_user_payments(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
  payments JSONB;
BEGIN
  -- Get user payments
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'amount', p.amount,
      'currency', p.currency,
      'status', p.status,
      'payment_type', p.payment_type,
      'related_id', p.related_id,
      'metadata', p.metadata,
      'created_at', p.created_at,
      'updated_at', p.updated_at
    ) ORDER BY p.created_at DESC
  ) INTO payments
  FROM public.payments p
  WHERE p.user_id = p_user_id
  ORDER BY p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(payments, '[]'::jsonb),
    'limit', p_limit,
    'offset', p_offset
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SUBSCRIPTION FUNCTIONS
-- ============================================================================

-- Function to create subscription
CREATE OR REPLACE FUNCTION public.create_subscription(
  p_user_id UUID,
  p_stripe_subscription_id TEXT,
  p_plan_type plan_type,
  p_status TEXT,
  p_current_period_start TIMESTAMP WITH TIME ZONE,
  p_current_period_end TIMESTAMP WITH TIME ZONE
) RETURNS JSONB AS $$
DECLARE
  new_subscription_id UUID;
  result JSONB;
BEGIN
  -- Create subscription
  INSERT INTO public.subscriptions (
    user_id, stripe_subscription_id, plan_type, status,
    current_period_start, current_period_end
  ) VALUES (
    p_user_id, p_stripe_subscription_id, p_plan_type, p_status,
    p_current_period_start, p_current_period_end
  ) RETURNING id INTO new_subscription_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Subscription created successfully',
    'subscription_id', new_subscription_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update subscription
CREATE OR REPLACE FUNCTION public.update_subscription(
  p_subscription_id UUID,
  p_status TEXT,
  p_current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_current_period_end TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_cancel_at_period_end BOOLEAN DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Update subscription
  UPDATE public.subscriptions
  SET 
    status = p_status,
    current_period_start = COALESCE(p_current_period_start, current_period_start),
    current_period_end = COALESCE(p_current_period_end, current_period_end),
    cancel_at_period_end = COALESCE(p_cancel_at_period_end, cancel_at_period_end),
    updated_at = now()
  WHERE id = p_subscription_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Subscription updated successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user subscription
CREATE OR REPLACE FUNCTION public.get_user_subscription(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  subscription_data JSONB;
BEGIN
  -- Get user subscription
  SELECT jsonb_build_object(
    'id', s.id,
    'user_id', s.user_id,
    'stripe_subscription_id', s.stripe_subscription_id,
    'plan_type', s.plan_type,
    'status', s.status,
    'current_period_start', s.current_period_start,
    'current_period_end', s.current_period_end,
    'cancel_at_period_end', s.cancel_at_period_end,
    'created_at', s.created_at,
    'updated_at', s.updated_at
  ) INTO subscription_data
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id
    AND s.status IN ('active', 'trialing', 'past_due');
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(subscription_data, '{}'::jsonb)
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SERVICE MARKETPLACE FUNCTIONS
-- ============================================================================

-- Function to create service
CREATE OR REPLACE FUNCTION public.create_service(
  p_user_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_price INTEGER,
  p_currency TEXT DEFAULT 'usd',
  p_category TEXT,
  p_availability_schedule JSONB DEFAULT '{}',
  p_max_bookings_per_day INTEGER DEFAULT 10,
  p_requires_approval BOOLEAN DEFAULT FALSE,
  p_cancellation_policy TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
  new_service_id UUID;
  result JSONB;
BEGIN
  -- Check if user is premium
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = p_user_id AND is_premium = TRUE
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Premium subscription required to create services'
    );
  END IF;
  
  -- Create service
  INSERT INTO public.services (
    user_id, title, description, price, currency, category,
    availability_schedule, max_bookings_per_day, requires_approval,
    cancellation_policy, metadata
  ) VALUES (
    p_user_id, p_title, p_description, p_price, p_currency, p_category,
    p_availability_schedule, p_max_bookings_per_day, p_requires_approval,
    p_cancellation_policy, p_metadata
  ) RETURNING id INTO new_service_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Service created successfully',
    'service_id', new_service_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update service
CREATE OR REPLACE FUNCTION public.update_service(
  p_service_id UUID,
  p_user_id UUID,
  p_updates JSONB
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if user can update service
  IF auth.uid() != p_user_id AND NOT public.is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized to update service'
    );
  END IF;
  
  -- Update service
  UPDATE public.services
  SET 
    title = COALESCE((p_updates->>'title')::TEXT, title),
    description = COALESCE((p_updates->>'description')::TEXT, description),
    price = COALESCE((p_updates->>'price')::INTEGER, price),
    currency = COALESCE((p_updates->>'currency')::TEXT, currency),
    category = COALESCE((p_updates->>'category')::TEXT, category),
    availability_schedule = COALESCE((p_updates->>'availability_schedule')::JSONB, availability_schedule),
    max_bookings_per_day = COALESCE((p_updates->>'max_bookings_per_day')::INTEGER, max_bookings_per_day),
    requires_approval = COALESCE((p_updates->>'requires_approval')::BOOLEAN, requires_approval),
    cancellation_policy = COALESCE((p_updates->>'cancellation_policy')::TEXT, cancellation_policy),
    metadata = COALESCE((p_updates->>'metadata')::JSONB, metadata),
    updated_at = now()
  WHERE id = p_service_id AND user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Service updated successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get services
CREATE OR REPLACE FUNCTION public.get_services(
  p_category TEXT DEFAULT NULL,
  p_location_city TEXT DEFAULT NULL,
  p_location_country TEXT DEFAULT NULL,
  p_min_price INTEGER DEFAULT NULL,
  p_max_price INTEGER DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
  services_data JSONB;
BEGIN
  -- Get services
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', s.id,
      'user_id', s.user_id,
      'title', s.title,
      'description', s.description,
      'price', s.price,
      'currency', s.currency,
      'category', s.category,
      'availability_schedule', s.availability_schedule,
      'is_active', s.is_active,
      'max_bookings_per_day', s.max_bookings_per_day,
      'requires_approval', s.requires_approval,
      'cancellation_policy', s.cancellation_policy,
      'metadata', s.metadata,
      'created_at', s.created_at,
      'updated_at', s.updated_at,
      'provider', jsonb_build_object(
        'id', pr.id,
        'username', pr.username,
        'display_name', pr.display_name,
        'avatar_url', pr.avatar_url,
        'is_verified', pr.is_verified,
        'is_premium', pr.is_premium
      )
    ) ORDER BY s.created_at DESC
  ) INTO services_data
  FROM public.services s
  JOIN public.profiles pr ON s.user_id = pr.user_id
  WHERE s.is_active = TRUE
    AND (p_category IS NULL OR s.category = p_category)
    AND (p_min_price IS NULL OR s.price >= p_min_price)
    AND (p_max_price IS NULL OR s.price <= p_max_price)
  ORDER BY s.created_at DESC
  LIMIT p_limit OFFSET p_offset;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(services_data, '[]'::jsonb),
    'limit', p_limit,
    'offset', p_offset
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- BOOKING SYSTEM FUNCTIONS
-- ============================================================================

-- Function to create booking
CREATE OR REPLACE FUNCTION public.create_booking(
  p_service_id UUID,
  p_customer_id UUID,
  p_booking_date TIMESTAMP WITH TIME ZONE,
  p_total_amount INTEGER,
  p_currency TEXT DEFAULT 'usd',
  p_notes TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
  service_data RECORD;
  provider_id UUID;
  new_booking_id UUID;
  result JSONB;
BEGIN
  -- Get service data
  SELECT user_id INTO provider_id
  FROM public.services
  WHERE id = p_service_id AND is_active = TRUE;
  
  IF provider_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Service not found or inactive'
    );
  END IF;
  
  -- Check if customer is not the provider
  IF p_customer_id = provider_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cannot book your own service'
    );
  END IF;
  
  -- Create booking
  INSERT INTO public.service_bookings (
    service_id, customer_id, provider_id, booking_date,
    total_amount, currency, notes, metadata
  ) VALUES (
    p_service_id, p_customer_id, provider_id, p_booking_date,
    p_total_amount, p_currency, p_notes, p_metadata
  ) RETURNING id INTO new_booking_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Booking created successfully',
    'booking_id', new_booking_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update booking status
CREATE OR REPLACE FUNCTION public.update_booking_status(
  p_booking_id UUID,
  p_user_id UUID,
  p_status booking_status,
  p_stripe_payment_intent_id TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if user can update booking
  IF NOT EXISTS (
    SELECT 1 FROM public.service_bookings
    WHERE id = p_booking_id 
      AND (customer_id = p_user_id OR provider_id = p_user_id)
  ) AND NOT public.is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized to update booking'
    );
  END IF;
  
  -- Update booking status
  UPDATE public.service_bookings
  SET 
    status = p_status,
    stripe_payment_intent_id = COALESCE(p_stripe_payment_intent_id, stripe_payment_intent_id),
    updated_at = now()
  WHERE id = p_booking_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Booking status updated successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user bookings
CREATE OR REPLACE FUNCTION public.get_user_bookings(
  p_user_id UUID,
  p_booking_type TEXT DEFAULT 'all', -- 'customer', 'provider', 'all'
  p_status booking_status DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
  bookings_data JSONB;
BEGIN
  -- Get user bookings
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', sb.id,
      'service_id', sb.service_id,
      'customer_id', sb.customer_id,
      'provider_id', sb.provider_id,
      'booking_date', sb.booking_date,
      'status', sb.status,
      'total_amount', sb.total_amount,
      'currency', sb.currency,
      'stripe_payment_intent_id', sb.stripe_payment_intent_id,
      'notes', sb.notes,
      'metadata', sb.metadata,
      'created_at', sb.created_at,
      'updated_at', sb.updated_at,
      'service', jsonb_build_object(
        'id', s.id,
        'title', s.title,
        'description', s.description,
        'price', s.price,
        'currency', s.currency,
        'category', s.category
      ),
      'customer', jsonb_build_object(
        'id', c_pr.id,
        'username', c_pr.username,
        'display_name', c_pr.display_name,
        'avatar_url', c_pr.avatar_url
      ),
      'provider', jsonb_build_object(
        'id', p_pr.id,
        'username', p_pr.username,
        'display_name', p_pr.display_name,
        'avatar_url', p_pr.avatar_url
      )
    ) ORDER BY sb.created_at DESC
  ) INTO bookings_data
  FROM public.service_bookings sb
  JOIN public.services s ON sb.service_id = s.id
  JOIN public.profiles c_pr ON sb.customer_id = c_pr.user_id
  JOIN public.profiles p_pr ON sb.provider_id = p_pr.user_id
  WHERE (
    CASE p_booking_type
      WHEN 'customer' THEN sb.customer_id = p_user_id
      WHEN 'provider' THEN sb.provider_id = p_user_id
      ELSE (sb.customer_id = p_user_id OR sb.provider_id = p_user_id)
    END
  )
    AND (p_status IS NULL OR sb.status = p_status)
  ORDER BY sb.created_at DESC
  LIMIT p_limit OFFSET p_offset;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(bookings_data, '[]'::jsonb),
    'limit', p_limit,
    'offset', p_offset
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- REVENUE ANALYTICS FUNCTIONS
-- ============================================================================

-- Function to get revenue analytics
CREATE OR REPLACE FUNCTION public.get_revenue_analytics(
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  analytics_data JSONB;
BEGIN
  -- Get revenue analytics
  SELECT jsonb_build_object(
    'total_revenue', COALESCE(SUM(amount), 0),
    'total_payments', COUNT(*),
    'completed_payments', COUNT(*) FILTER (WHERE status = 'completed'),
    'failed_payments', COUNT(*) FILTER (WHERE status = 'failed'),
    'pending_payments', COUNT(*) FILTER (WHERE status = 'pending'),
    'refunded_payments', COUNT(*) FILTER (WHERE status = 'refunded'),
    'revenue_by_type', (
      SELECT jsonb_object_agg(payment_type, type_revenue)
      FROM (
        SELECT 
          payment_type,
          SUM(amount) as type_revenue
        FROM public.payments
        WHERE status = 'completed'
          AND (p_start_date IS NULL OR created_at >= p_start_date)
          AND (p_end_date IS NULL OR created_at <= p_end_date)
        GROUP BY payment_type
      ) type_stats
    ),
    'revenue_by_month', (
      SELECT jsonb_object_agg(
        TO_CHAR(created_at, 'YYYY-MM'),
        monthly_revenue
      )
      FROM (
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          SUM(amount) as monthly_revenue
        FROM public.payments
        WHERE status = 'completed'
          AND (p_start_date IS NULL OR created_at >= p_start_date)
          AND (p_end_date IS NULL OR created_at <= p_end_date)
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month
      ) monthly_stats
    )
  ) INTO analytics_data
  FROM public.payments
  WHERE (p_start_date IS NULL OR created_at >= p_start_date)
    AND (p_end_date IS NULL OR created_at <= p_end_date);
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(analytics_data, '{}'::jsonb)
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user revenue stats
CREATE OR REPLACE FUNCTION public.get_user_revenue_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  revenue_data JSONB;
BEGIN
  -- Get user revenue stats
  SELECT jsonb_build_object(
    'total_spent', COALESCE(SUM(amount), 0),
    'total_payments', COUNT(*),
    'completed_payments', COUNT(*) FILTER (WHERE status = 'completed'),
    'pending_payments', COUNT(*) FILTER (WHERE status = 'pending'),
    'failed_payments', COUNT(*) FILTER (WHERE status = 'failed'),
    'spending_by_type', (
      SELECT jsonb_object_agg(payment_type, type_spending)
      FROM (
        SELECT 
          payment_type,
          SUM(amount) as type_spending
        FROM public.payments
        WHERE user_id = p_user_id
        GROUP BY payment_type
      ) type_stats
    ),
    'recent_payments', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'amount', p.amount,
          'currency', p.currency,
          'status', p.status,
          'payment_type', p.payment_type,
          'created_at', p.created_at
        ) ORDER BY p.created_at DESC
      )
      FROM public.payments p
      WHERE p.user_id = p_user_id
      ORDER BY p.created_at DESC
      LIMIT 10
    )
  ) INTO revenue_data
  FROM public.payments
  WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', COALESCE(revenue_data, '{}'::jsonb)
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
