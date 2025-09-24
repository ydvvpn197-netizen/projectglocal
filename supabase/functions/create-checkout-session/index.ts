import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateCheckoutSessionRequest {
  priceId: string;
  mode: 'payment' | 'subscription';
  userId: string;
  planId?: string;
  planData?: {
    name: string;
    price: number;
    currency: string;
    interval: string;
  };
  successUrl?: string;
  cancelUrl?: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
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

    // Parse request body
    const { priceId, mode, userId, planId, planData, successUrl, cancelUrl }: CreateCheckoutSessionRequest = await req.json();

    if (!priceId || !mode || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: priceId, mode, userId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get user profile to check for existing Stripe customer
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, display_name, first_name, last_name')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profile' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let customerId = profile.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customerName = profile.display_name || 
        `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 
        'User';

      const customer = await stripe.customers.create({
        name: customerName,
        metadata: {
          user_id: userId,
        },
      });

      customerId = customer.id;

      // Update profile with Stripe customer ID
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating profile with customer ID:', updateError);
        // Continue anyway, as the customer was created successfully
      }
    }

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: successUrl || `${req.headers.get('origin')}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/subscription/cancel`,
      metadata: {
        user_id: userId,
        mode: mode,
        plan_id: planId || '',
      },
    };

    // If no Stripe price ID exists, create a product and price dynamically
    if (priceId.startsWith('price_') && planData) {
      try {
        // Create a product
        const product = await stripe.products.create({
          name: planData.name,
          description: `Subscription plan for ${planData.name}`,
          metadata: {
            user_id: userId,
            plan_id: planId || '',
          },
        });

        // Create a price
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: planData.price,
          currency: planData.currency,
          recurring: {
            interval: planData.interval as 'month' | 'year',
          },
          metadata: {
            user_id: userId,
            plan_id: planId || '',
          },
        });

        // Update session params with the new price ID
        sessionParams.line_items = [
          {
            price: price.id,
            quantity: 1,
          },
        ];

        // Update the plan in database with the new Stripe price ID
        if (planId) {
          await supabase
            .from('subscription_plans')
            .update({ stripe_price_id: price.id })
            .eq('id', planId);
        }
      } catch (priceError) {
        console.error('Error creating Stripe product/price:', priceError);
        // Continue with the original priceId if dynamic creation fails
      }
    }

    // Add subscription-specific parameters
    if (mode === 'subscription') {
      sessionParams.subscription_data = {
        metadata: {
          user_id: userId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create checkout session',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});