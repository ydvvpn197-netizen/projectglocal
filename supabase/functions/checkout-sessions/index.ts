import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
})

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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Get request body
    const { customer_id, price_id, success_url, cancel_url, mode = 'subscription' } = await req.json()

    if (!price_id || !success_url || !cancel_url) {
      throw new Error('Missing required fields: price_id, success_url, cancel_url')
    }

    // Get or create customer
    let customerId = customer_id
    if (!customerId) {
      // Check if user has a billing profile
      const { data: billingProfile } = await supabaseClient
        .from('billing_profiles')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single()

      if (billingProfile?.stripe_customer_id) {
        customerId = billingProfile.stripe_customer_id
      } else {
        // Create new customer in Stripe
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            user_id: user.id
          }
        })

        customerId = customer.id

        // Save customer ID to database
        await supabaseClient
          .from('billing_profiles')
          .upsert({
            user_id: user.id,
            stripe_customer_id: customer.id,
            email: user.email
          })
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: mode as 'payment' | 'setup' | 'subscription',
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        user_id: user.id
      },
      subscription_data: mode === 'subscription' ? {
        metadata: {
          user_id: user.id
        }
      } : undefined,
      payment_intent_data: mode === 'payment' ? {
        metadata: {
          user_id: user.id
        }
      } : undefined,
    })

    // Save checkout session to database
    await supabaseClient
      .from('checkout_sessions')
      .insert({
        stripe_checkout_session_id: session.id,
        customer_id: customerId,
        mode: mode,
        success_url: success_url,
        cancel_url: cancel_url,
        amount_total: session.amount_total,
        currency: session.currency,
        status: session.status,
        payment_status: session.payment_status,
        customer_email: session.customer_email,
        metadata: {
          user_id: user.id,
          price_id: price_id
        }
      })

    return new Response(
      JSON.stringify({
        success: true,
        session: {
          id: session.id,
          url: session.url,
          status: session.status
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error creating checkout session:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
