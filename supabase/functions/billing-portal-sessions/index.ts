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
    const { customer_id, return_url } = await req.json()

    if (!return_url) {
      throw new Error('Missing required field: return_url')
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

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: return_url,
    })

    // Save billing portal session to database
    await supabaseClient
      .from('billing_portal_sessions')
      .insert({
        stripe_portal_session_id: session.id,
        customer_id: customerId,
        return_url: return_url,
        url: session.url
      })

    return new Response(
      JSON.stringify({
        success: true,
        session: {
          id: session.id,
          url: session.url
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error creating billing portal session:', error)
    
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
