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
    const { amount, currency, customer_id, description, metadata, payment_method_types } = await req.json()

    if (!amount || !currency) {
      throw new Error('Missing required fields: amount, currency')
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

    // Create payment intent in Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      description,
      metadata: {
        user_id: user.id,
        ...metadata
      },
      payment_method_types: payment_method_types || ['card'],
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // Save payment intent to database
    const { data: savedPaymentIntent, error: saveError } = await supabaseClient
      .from('payment_intents')
      .insert({
        stripe_payment_intent_id: paymentIntent.id,
        user_id: user.id,
        amount,
        currency,
        status: paymentIntent.status,
        payment_method_types: payment_method_types || ['card'],
        metadata: {
          user_id: user.id,
          ...metadata
        },
        client_secret: paymentIntent.client_secret,
        description
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving payment intent:', saveError)
      throw new Error('Failed to save payment intent')
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_intent: {
          id: savedPaymentIntent.id,
          stripe_payment_intent_id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
          status: paymentIntent.status,
          amount,
          currency,
          customer_id: customerId
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error creating payment intent:', error)
    
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
