import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
})

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

serve(async (req) => {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response('Webhook signature verification failed', { status: 400 })
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, supabaseClient)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent, supabaseClient)
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
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, supabaseClient)
        break
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, supabaseClient)
        break
      
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, supabaseClient)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response('Webhook processed successfully', { status: 200 })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Webhook error', { status: 400 })
  }
})

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent, supabaseClient: any) {
  console.log('Payment intent succeeded:', paymentIntent.id)
  
  // Update payment intent status
  await supabaseClient
    .from('payment_intents')
    .update({
      status: paymentIntent.status,
      client_secret: paymentIntent.client_secret,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntent.id)

  // Create transaction record if not exists
  const { data: existingTransaction } = await supabaseClient
    .from('transactions')
    .select('id')
    .eq('stripe_charge_id', paymentIntent.latest_charge)
    .single()

  if (!existingTransaction && paymentIntent.latest_charge) {
    const { data: paymentIntentData } = await supabaseClient
      .from('payment_intents')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single()

    if (paymentIntentData) {
      await supabaseClient
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
    }
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent, supabaseClient: any) {
  console.log('Payment intent failed:', paymentIntent.id)
  
  await supabaseClient
    .from('payment_intents')
    .update({
      status: paymentIntent.status,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntent.id)
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabaseClient: any) {
  console.log('Subscription created:', subscription.id)
  
  // Subscription creation is typically handled in the checkout session completion
  // This is just for logging purposes
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabaseClient: any) {
  console.log('Subscription updated:', subscription.id)
  
  await supabaseClient
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabaseClient: any) {
  console.log('Subscription deleted:', subscription.id)
  
  await supabaseClient
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, supabaseClient: any) {
  console.log('Invoice payment succeeded:', invoice.id)
  
  // Handle successful invoice payment
  // This could trigger additional business logic like extending subscription access
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, supabaseClient: any) {
  console.log('Invoice payment failed:', invoice.id)
  
  // Handle failed invoice payment
  // This could trigger dunning management or subscription suspension
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, supabaseClient: any) {
  console.log('Checkout session completed:', session.id)
  
  // Update checkout session status
  await supabaseClient
    .from('checkout_sessions')
    .update({
      status: session.status,
      payment_status: session.payment_status,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_checkout_session_id', session.id)

  // If this is a subscription, create subscription record
  if (session.mode === 'subscription' && session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    
    await supabaseClient
      .from('subscriptions')
      .insert({
        stripe_subscription_id: subscription.id,
        user_id: session.metadata?.user_id,
        stripe_customer_id: session.customer as string,
        status: subscription.status,
        plan_id: subscription.items.data[0]?.price.id || '',
        plan_name: subscription.items.data[0]?.price.nickname || 'Unknown Plan',
        plan_price: subscription.items.data[0]?.price.unit_amount || 0,
        currency: subscription.currency,
        interval: subscription.items.data[0]?.price.recurring?.interval || 'monthly',
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        metadata: subscription.metadata
      })
  }
}
