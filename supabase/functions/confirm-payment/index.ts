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

    // Get request body
    const { payment_intent_id, payment_method_id } = await req.json()

    if (!payment_intent_id || !payment_method_id) {
      throw new Error('Missing payment_intent_id or payment_method_id')
    }

    // Confirm the payment with Stripe
    const paymentIntent = await stripe.paymentIntents.confirm(
      payment_intent_id,
      {
        payment_method: payment_method_id,
        return_url: `${req.headers.get('origin')}/payment/success`,
      }
    )

    // Update payment intent in database
    const { error: updateError } = await supabaseClient
      .from('payment_intents')
      .update({
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', payment_intent_id)

    if (updateError) {
      console.error('Error updating payment intent:', updateError)
    }

    // If payment succeeded, create transaction record
    if (paymentIntent.status === 'succeeded') {
      const { data: paymentIntentData } = await supabaseClient
        .from('payment_intents')
        .select('*')
        .eq('stripe_payment_intent_id', payment_intent_id)
        .single()

      if (paymentIntentData) {
        // Create transaction record
        const { error: transactionError } = await supabaseClient
          .from('transactions')
          .insert({
            stripe_charge_id: paymentIntent.latest_charge,
            payment_intent_id: paymentIntentData.id,
            user_id: paymentIntentData.user_id,
            amount: paymentIntentData.amount,
            currency: paymentIntentData.currency,
            status: 'succeeded',
            description: paymentIntentData.description,
            metadata: paymentIntentData.metadata,
            fee_amount: paymentIntent.charges.data[0]?.fee || 0,
            net_amount: paymentIntent.charges.data[0]?.net || paymentIntentData.amount
          })

        if (transactionError) {
          console.error('Error creating transaction:', transactionError)
        }

        // Handle booking payment if this is a booking
        if (paymentIntentData.metadata?.booking_id) {
          const { error: bookingPaymentError } = await supabaseClient
            .from('booking_payments')
            .insert({
              booking_id: paymentIntentData.metadata.booking_id,
              payment_intent_id: paymentIntentData.id,
              transaction_id: paymentIntentData.id, // This should be the transaction ID
              amount: paymentIntentData.amount,
              currency: paymentIntentData.currency,
              status: 'succeeded',
              commission_percentage: 10.00,
              commission_amount: Math.round(paymentIntentData.amount * 0.10),
              net_amount: Math.round(paymentIntentData.amount * 0.90),
              metadata: paymentIntentData.metadata
            })

          if (bookingPaymentError) {
            console.error('Error creating booking payment:', bookingPaymentError)
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_intent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          client_secret: paymentIntent.client_secret,
          next_action: paymentIntent.next_action
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error confirming payment:', error)
    
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
