import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CheckoutSessionRequest {
  type: 'verification' | 'premium_subscription' | 'event_feature' | 'service_purchase'
  userId: string
  eventId?: string
  serviceId?: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

// Pricing configuration
const PRICING = {
  verification: {
    amount: 999, // $9.99 in cents
    currency: 'usd',
    description: 'User Verification Subscription',
    interval: 'month' as const,
  },
  premium_subscription: {
    amount: 2999, // $29.99 in cents
    currency: 'usd',
    description: 'Premium Plan Subscription',
    interval: 'month' as const,
  },
  event_feature: {
    amount: 1999, // $19.99 in cents
    currency: 'usd',
    description: 'Featured Event Listing',
    duration_days: 30,
  },
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

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const body: CheckoutSessionRequest = await req.json()
    const { type, userId, eventId, serviceId, successUrl, cancelUrl, metadata = {} } = body

    // Verify user ID matches authenticated user
    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'User ID mismatch' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get or create Stripe customer
    let customerId: string
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: userId,
        },
      })
      customerId = customer.id

      // Update profile with Stripe customer ID
      await supabaseClient
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId)
    }

    let sessionConfig: any = {
      customer: customerId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        type,
        ...metadata,
      },
    }

    // Configure session based on payment type
    switch (type) {
      case 'verification':
        sessionConfig = {
          ...sessionConfig,
          mode: 'subscription',
          line_items: [
            {
              price_data: {
                currency: PRICING.verification.currency,
                product_data: {
                  name: PRICING.verification.description,
                },
                unit_amount: PRICING.verification.amount,
                recurring: {
                  interval: PRICING.verification.interval,
                },
              },
              quantity: 1,
            },
          ],
        }
        break

      case 'premium_subscription':
        sessionConfig = {
          ...sessionConfig,
          mode: 'subscription',
          line_items: [
            {
              price_data: {
                currency: PRICING.premium_subscription.currency,
                product_data: {
                  name: PRICING.premium_subscription.description,
                },
                unit_amount: PRICING.premium_subscription.amount,
                recurring: {
                  interval: PRICING.premium_subscription.interval,
                },
              },
              quantity: 1,
            },
          ],
        }
        break

      case 'event_feature':
        if (!eventId) {
          return new Response(
            JSON.stringify({ error: 'Event ID is required for event featuring' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Verify event exists and belongs to user
        const { data: event, error: eventError } = await supabaseClient
          .from('posts')
          .select('id, user_id, title')
          .eq('id', eventId)
          .eq('user_id', userId)
          .eq('type', 'event')
          .single()

        if (eventError || !event) {
          return new Response(
            JSON.stringify({ error: 'Event not found or access denied' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        sessionConfig = {
          ...sessionConfig,
          mode: 'payment',
          line_items: [
            {
              price_data: {
                currency: PRICING.event_feature.currency,
                product_data: {
                  name: `Featured Event: ${event.title}`,
                  description: PRICING.event_feature.description,
                },
                unit_amount: PRICING.event_feature.amount,
              },
              quantity: 1,
            },
          ],
          metadata: {
            ...sessionConfig.metadata,
            eventId,
          },
        }
        break

      case 'service_purchase':
        if (!serviceId) {
          return new Response(
            JSON.stringify({ error: 'Service ID is required for service purchase' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Get service details
        const { data: service, error: serviceError } = await supabaseClient
          .from('services')
          .select('id, title, price, currency, user_id')
          .eq('id', serviceId)
          .eq('is_active', true)
          .single()

        if (serviceError || !service) {
          return new Response(
            JSON.stringify({ error: 'Service not found or inactive' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Don't allow users to purchase their own services
        if (service.user_id === userId) {
          return new Response(
            JSON.stringify({ error: 'Cannot purchase your own service' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        sessionConfig = {
          ...sessionConfig,
          mode: 'payment',
          line_items: [
            {
              price_data: {
                currency: service.currency,
                product_data: {
                  name: service.title,
                  description: 'Service Purchase',
                },
                unit_amount: service.price,
              },
              quantity: 1,
            },
          ],
          metadata: {
            ...sessionConfig.metadata,
            serviceId,
          },
        }
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid payment type' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig)

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error creating checkout session:', error)
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
