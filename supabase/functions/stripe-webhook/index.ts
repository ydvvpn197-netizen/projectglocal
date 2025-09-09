import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeSecretKey || !webhookSecret) {
      throw new Error('Stripe environment variables are not set');
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables are not set');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the raw body and signature
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Processing webhook event:', event.type);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;

        if (!userId) {
          console.error('No user_id in session metadata');
          break;
        }

        // Mark user as authorized for one-time payments
        if (session.mode === 'payment') {
          const { error } = await supabase
            .from('profiles')
            .update({ 
              is_authorized: true,
              subscription_status: 'active'
            })
            .eq('user_id', userId);

          if (error) {
            console.error('Error updating user authorization:', error);
          } else {
            console.log('User marked as authorized:', userId);
          }
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const customerId = subscription.customer as string;

          // Find user by Stripe customer ID
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (profile) {
            const { error } = await supabase
              .from('profiles')
              .update({ 
                is_authorized: true,
                subscription_status: 'active'
              })
              .eq('user_id', profile.user_id);

            if (error) {
              console.error('Error updating subscription status:', error);
            } else {
              console.log('Subscription payment processed for user:', profile.user_id);
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;

        // Find user by Stripe customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          let isAuthorized = false;
          let subscriptionStatus = status;

          // Determine authorization based on subscription status
          if (status === 'active' || status === 'trialing') {
            isAuthorized = true;
          } else if (status === 'past_due' || status === 'unpaid') {
            isAuthorized = false;
          }

          const { error } = await supabase
            .from('profiles')
            .update({ 
              is_authorized: isAuthorized,
              subscription_status: subscriptionStatus
            })
            .eq('user_id', profile.user_id);

          if (error) {
            console.error('Error updating subscription status:', error);
          } else {
            console.log('Subscription updated for user:', profile.user_id, 'Status:', status);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by Stripe customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          const { error } = await supabase
            .from('profiles')
            .update({ 
              is_authorized: false,
              subscription_status: 'canceled'
            })
            .eq('user_id', profile.user_id);

          if (error) {
            console.error('Error updating subscription status:', error);
          } else {
            console.log('Subscription canceled for user:', profile.user_id);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const customerId = subscription.customer as string;

          // Find user by Stripe customer ID
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (profile) {
            const { error } = await supabase
              .from('profiles')
              .update({ 
                is_authorized: false,
                subscription_status: 'past_due'
              })
              .eq('user_id', profile.user_id);

            if (error) {
              console.error('Error updating subscription status:', error);
            } else {
              console.log('Payment failed for user:', profile.user_id);
            }
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Webhook processing failed',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});