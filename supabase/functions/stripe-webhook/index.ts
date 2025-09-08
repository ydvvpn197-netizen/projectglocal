import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the webhook signature
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the raw body
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!webhookSecret) {
      return new Response(
        JSON.stringify({ error: 'Missing webhook secret' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Processing webhook event:', event.type)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, supabaseClient)
        break

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice, supabaseClient)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, supabaseClient)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, supabaseClient)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabaseClient)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabaseClient)
        break

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, supabaseClient)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent, supabaseClient)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, supabase: any) {
  console.log('Processing checkout session completed:', session.id)
  
  const userId = session.metadata?.userId
  const type = session.metadata?.type
  const eventId = session.metadata?.eventId
  const serviceId = session.metadata?.serviceId

  if (!userId || !type) {
    console.error('Missing required metadata in checkout session')
    return
  }

  // Record the payment
  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      stripe_payment_intent_id: session.payment_intent as string,
      amount: session.amount_total || 0,
      currency: session.currency || 'usd',
      status: 'succeeded',
      payment_type: type,
      description: `Payment for ${type}`,
      related_id: eventId || serviceId,
      related_type: eventId ? 'event' : serviceId ? 'service' : null,
      metadata: session.metadata,
    })

  if (paymentError) {
    console.error('Error recording payment:', paymentError)
  }

  // Handle different payment types
  switch (type) {
    case 'verification':
      await handleVerificationPayment(userId, supabase)
      break
    case 'premium_subscription':
      await handlePremiumSubscriptionPayment(userId, supabase)
      break
    case 'event_feature':
      if (eventId) {
        await handleEventFeaturePayment(userId, eventId, supabase)
      }
      break
    case 'service_purchase':
      if (serviceId) {
        await handleServicePurchasePayment(userId, serviceId, session, supabase)
      }
      break
  }
}

async function handleVerificationPayment(userId: string, supabase: any) {
  console.log('Processing verification payment for user:', userId)
  
  const verificationExpiresAt = new Date()
  verificationExpiresAt.setMonth(verificationExpiresAt.getMonth() + 1) // 1 month from now

  const { error } = await supabase
    .from('profiles')
    .update({
      is_verified: true,
      plan_type: 'verified',
      verification_expires_at: verificationExpiresAt.toISOString(),
    })
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating user verification:', error)
  } else {
    console.log('User verification updated successfully')
  }
}

async function handlePremiumSubscriptionPayment(userId: string, supabase: any) {
  console.log('Processing premium subscription payment for user:', userId)
  
  const premiumExpiresAt = new Date()
  premiumExpiresAt.setMonth(premiumExpiresAt.getMonth() + 1) // 1 month from now

  const { error } = await supabase
    .from('profiles')
    .update({
      is_premium: true,
      plan_type: 'premium',
      premium_expires_at: premiumExpiresAt.toISOString(),
    })
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating user premium status:', error)
  } else {
    console.log('User premium status updated successfully')
  }
}

async function handleEventFeaturePayment(userId: string, eventId: string, supabase: any) {
  console.log('Processing event feature payment for event:', eventId)
  
  const featuredUntil = new Date()
  featuredUntil.setDate(featuredUntil.getDate() + 30) // 30 days from now

  const { error } = await supabase
    .from('posts')
    .update({
      is_featured: true,
      featured_until: featuredUntil.toISOString(),
      stripe_payment_intent_id: 'featured_payment', // This will be updated with actual payment intent
    })
    .eq('id', eventId)
    .eq('user_id', userId)
    .eq('type', 'event')

  if (error) {
    console.error('Error updating event featured status:', error)
  } else {
    console.log('Event featured status updated successfully')
  }
}

async function handleServicePurchasePayment(userId: string, serviceId: string, session: Stripe.Checkout.Session, supabase: any) {
  console.log('Processing service purchase payment for service:', serviceId)
  
  // Get service details
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .single()

  if (serviceError || !service) {
    console.error('Error fetching service:', serviceError)
    return
  }

  // Create service booking
  const { error: bookingError } = await supabase
    .from('service_bookings')
    .insert({
      service_id: serviceId,
      customer_id: userId,
      provider_id: service.user_id,
      booking_date: new Date().toISOString(), // Default to now, should be updated by frontend
      duration_minutes: 60, // Default duration
      total_amount: service.price,
      currency: service.currency,
      status: 'confirmed',
      payment_intent_id: session.payment_intent as string,
      payment_status: 'paid',
    })

  if (bookingError) {
    console.error('Error creating service booking:', bookingError)
  } else {
    console.log('Service booking created successfully')
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice, supabase: any) {
  console.log('Processing invoice paid:', invoice.id)
  
  if (invoice.subscription) {
    // Handle subscription renewal
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', invoice.subscription as string)
      .single()

    if (subError || !subscription) {
      console.error('Error fetching subscription:', subError)
      return
    }

    // Update user's premium/verification status based on subscription
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_premium: true,
        is_verified: true,
        plan_type: 'premium',
        premium_expires_at: new Date(invoice.period_end * 1000).toISOString(),
        verification_expires_at: new Date(invoice.period_end * 1000).toISOString(),
      })
      .eq('user_id', subscription.user_id)

    if (updateError) {
      console.error('Error updating user status on invoice paid:', updateError)
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  console.log('Processing invoice payment failed:', invoice.id)
  
  if (invoice.subscription) {
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', invoice.subscription as string)
      .single()

    if (subError || !subscription) {
      console.error('Error fetching subscription:', subError)
      return
    }

    // Update subscription status
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
      })
      .eq('stripe_subscription_id', invoice.subscription as string)

    if (updateError) {
      console.error('Error updating subscription status:', updateError)
    }
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: any) {
  console.log('Processing subscription created:', subscription.id)
  
  const customerId = subscription.customer as string
  
  // Get user by Stripe customer ID
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (profileError || !profile) {
    console.error('Error fetching user by customer ID:', profileError)
    return
  }

  // Create subscription record
  const { error: subError } = await supabase
    .from('subscriptions')
    .insert({
      user_id: profile.user_id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      plan_type: 'premium', // Assuming all subscriptions are premium
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      metadata: subscription.metadata,
    })

  if (subError) {
    console.error('Error creating subscription record:', subError)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  console.log('Processing subscription updated:', subscription.id)
  
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      metadata: subscription.metadata,
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error updating subscription:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  console.log('Processing subscription deleted:', subscription.id)
  
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error updating subscription status:', error)
  }

  // Update user's premium status
  const { data: subData, error: subError } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (!subError && subData) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        is_premium: false,
        plan_type: 'free',
        premium_expires_at: null,
      })
      .eq('user_id', subData.user_id)

    if (profileError) {
      console.error('Error updating user premium status:', profileError)
    }
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log('Processing payment intent succeeded:', paymentIntent.id)
  
  // Update payment status
  const { error } = await supabase
    .from('payments')
    .update({
      status: 'succeeded',
      stripe_charge_id: paymentIntent.latest_charge as string,
    })
    .eq('stripe_payment_intent_id', paymentIntent.id)

  if (error) {
    console.error('Error updating payment status:', error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log('Processing payment intent failed:', paymentIntent.id)
  
  // Update payment status
  const { error } = await supabase
    .from('payments')
    .update({
      status: 'failed',
    })
    .eq('stripe_payment_intent_id', paymentIntent.id)

  if (error) {
    console.error('Error updating payment status:', error)
  }
}