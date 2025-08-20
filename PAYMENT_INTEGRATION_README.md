# Stripe Payment Integration

This document provides a comprehensive guide to the Stripe payment integration implemented in the project.

## Overview

The payment integration provides a complete Stripe-based payment system with the following features:

- **One-time payments** for bookings and purchases
- **Subscription management** for recurring billing
- **Payment method management** (cards, bank accounts)
- **Secure payment processing** with PCI compliance
- **Webhook handling** for real-time payment updates
- **Artist payout system** with commission management
- **Event ticket sales** with QR code generation
- **Refund processing** and dispute management

## Architecture

### Database Schema

The payment system uses the following database tables:

- `payment_intents` - Stores Stripe payment intents
- `subscriptions` - Manages subscription data
- `payment_methods` - Stores user payment methods
- `transactions` - Records all payment transactions
- `refunds` - Tracks refund information
- `billing_profiles` - User billing information
- `artist_payouts` - Artist commission and payout tracking
- `event_tickets` - Event ticket management
- `booking_payments` - Booking-specific payment data

### File Structure

```
src/
├── types/
│   ├── payment.ts          # Payment type definitions
│   ├── stripe.ts           # Stripe-specific types
│   └── billing.ts          # Billing-related types
├── services/
│   ├── paymentService.ts   # Core payment service
│   └── stripeService.ts    # Stripe API integration
├── hooks/
│   ├── usePayment.ts       # Payment state management
│   └── useStripe.ts        # Stripe-specific hooks
├── components/
│   ├── PaymentForm.tsx     # Secure payment form
│   ├── SubscriptionPlans.tsx # Subscription management
│   └── BookingPayment.tsx  # Booking payment flow
└── utils/
    └── paymentValidation.ts # Payment validation utilities

supabase/
├── migrations/
│   └── 20250825000000_add_payment_tables.sql
└── functions/
    ├── confirm-payment/
    ├── create-payment-intent/
    ├── checkout-sessions/
    ├── billing-portal-sessions/
    └── stripe-webhook/
```

## Setup Instructions

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Migration

Run the payment tables migration:

```bash
supabase db push
```

### 3. Deploy Edge Functions

Deploy the Supabase Edge Functions:

```bash
supabase functions deploy confirm-payment
supabase functions deploy create-payment-intent
supabase functions deploy checkout-sessions
supabase functions deploy billing-portal-sessions
supabase functions deploy stripe-webhook
```

### 4. Install Dependencies

Install the required npm packages:

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 5. Stripe Dashboard Configuration

1. **Create a Stripe account** and get your API keys
2. **Set up webhook endpoints** pointing to your Supabase functions
3. **Configure payment methods** you want to accept
4. **Set up subscription products** and pricing plans

## Usage Examples

### Basic Payment Form

```tsx
import { PaymentForm } from './components/PaymentForm';

function CheckoutPage() {
  const handlePaymentSuccess = (result) => {
    console.log('Payment successful:', result);
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
  };

  return (
    <PaymentForm
      amount={2500} // $25.00 in cents
      currency="usd"
      description="Premium subscription"
      onSuccess={handlePaymentSuccess}
      onError={handlePaymentError}
    />
  );
}
```

### Subscription Management

```tsx
import { SubscriptionPlans } from './components/SubscriptionPlans';

function SubscriptionPage() {
  const handlePlanSelect = (plan) => {
    console.log('Selected plan:', plan);
  };

  const handleSubscribe = (planId) => {
    console.log('Subscribing to plan:', planId);
  };

  return (
    <SubscriptionPlans
      onPlanSelect={handlePlanSelect}
      onSubscribe={handleSubscribe}
    />
  );
}
```

### Booking Payment

```tsx
import { BookingPayment } from './components/BookingPayment';

function BookingPage() {
  const booking = {
    id: 'booking_123',
    artist_id: 'artist_456',
    artist_name: 'John Doe',
    event_date: '2024-01-15',
    event_time: '19:00',
    duration: 2,
    location: 'Concert Hall',
    event_type: 'Live Performance',
    price: 10000, // $100.00 in cents
    currency: 'usd'
  };

  return (
    <BookingPayment
      booking={booking}
      onPaymentSuccess={(result) => console.log('Booking paid:', result)}
      onPaymentError={(error) => console.error('Booking failed:', error)}
    />
  );
}
```

### Using Payment Hooks

```tsx
import { usePayment } from './hooks/usePayment';

function PaymentMethodsPage() {
  const {
    paymentMethods,
    loadingPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    refreshPaymentMethods
  } = usePayment();

  useEffect(() => {
    refreshPaymentMethods();
  }, []);

  return (
    <div>
      {paymentMethods.map(method => (
        <div key={method.id}>
          {method.card_brand} •••• {method.card_last4}
          <button onClick={() => removePaymentMethod(method.id)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
```

## API Reference

### PaymentService

Core payment service for handling payment operations.

#### Methods

- `createPaymentIntent(data)` - Create a new payment intent
- `confirmPayment(paymentIntentId, paymentMethodId)` - Confirm a payment
- `getPaymentMethods()` - Get user's payment methods
- `addPaymentMethod(paymentMethodId)` - Add a new payment method
- `setDefaultPaymentMethod(paymentMethodId)` - Set default payment method
- `removePaymentMethod(paymentMethodId)` - Remove a payment method
- `getBillingProfile()` - Get user's billing profile
- `updateBillingProfile(profile)` - Update billing profile
- `getTransactions(limit, offset)` - Get transaction history
- `processRefund(transactionId, amount, reason)` - Process a refund

### StripeService

Stripe-specific service for direct API interactions.

#### Methods

- `createStripePaymentIntent(data)` - Create Stripe payment intent
- `confirmStripePayment(paymentIntentId, paymentMethodId)` - Confirm Stripe payment
- `getOrCreateCustomer(userId, email)` - Get or create Stripe customer
- `createSubscription(planId, paymentMethodId)` - Create subscription
- `cancelSubscription(subscriptionId, cancelAtPeriodEnd)` - Cancel subscription
- `getSubscriptionPlans()` - Get available subscription plans
- `createCheckoutSession(planId, successUrl, cancelUrl)` - Create checkout session
- `createBillingPortalSession(returnUrl)` - Create billing portal session

### usePayment Hook

React hook for payment state management.

#### Returns

- `createPaymentIntent` - Function to create payment intent
- `confirmPayment` - Function to confirm payment
- `paymentMethods` - Array of user's payment methods
- `loadingPaymentMethods` - Loading state for payment methods
- `addPaymentMethod` - Function to add payment method
- `setDefaultPaymentMethod` - Function to set default method
- `removePaymentMethod` - Function to remove payment method
- `billingProfile` - User's billing profile
- `transactions` - Array of user's transactions
- `loading` - General loading state
- `error` - Error state
- `clearError` - Function to clear errors

### useStripe Hook

React hook for Stripe-specific functionality.

#### Returns

- `stripe` - Stripe instance
- `createStripePaymentIntent` - Function to create Stripe payment intent
- `confirmStripePayment` - Function to confirm Stripe payment
- `subscriptions` - Array of user's subscriptions
- `subscriptionPlans` - Array of available subscription plans
- `createSubscription` - Function to create subscription
- `cancelSubscription` - Function to cancel subscription
- `createCheckoutSession` - Function to create checkout session
- `createBillingPortalSession` - Function to create billing portal session

## Security Features

### PCI Compliance

- **No card data storage** - Card information is never stored in our database
- **Stripe Elements** - Uses Stripe's secure payment form components
- **Tokenization** - Payment methods are tokenized by Stripe
- **Encryption** - All data transmission is encrypted with TLS

### Validation

- **Input validation** - All payment data is validated before processing
- **Amount limits** - Minimum and maximum payment amounts are enforced
- **Currency validation** - Only supported currencies are accepted
- **Metadata sanitization** - Sensitive data is removed from metadata

### Error Handling

- **Graceful failures** - Payment failures are handled gracefully
- **User feedback** - Clear error messages are shown to users
- **Logging** - Payment events are logged for debugging
- **Retry logic** - Failed payments can be retried

## Webhook Events

The system handles the following Stripe webhook events:

- `payment_intent.succeeded` - Payment completed successfully
- `payment_intent.payment_failed` - Payment failed
- `customer.subscription.created` - New subscription created
- `customer.subscription.updated` - Subscription updated
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_succeeded` - Invoice paid successfully
- `invoice.payment_failed` - Invoice payment failed
- `checkout.session.completed` - Checkout completed

## Testing

### Test Cards

Use these Stripe test cards for testing:

- **Successful payment**: `4242 4242 4242 4242`
- **Declined payment**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`
- **Insufficient funds**: `4000 0000 0000 9995`

### Test Scenarios

1. **Successful payment flow**
2. **Failed payment handling**
3. **3D Secure authentication**
4. **Subscription creation and management**
5. **Refund processing**
6. **Webhook event handling**

## Troubleshooting

### Common Issues

1. **Payment intent creation fails**
   - Check Stripe API keys
   - Verify amount and currency
   - Ensure user is authenticated

2. **Webhook events not received**
   - Verify webhook endpoint URL
   - Check webhook secret
   - Ensure function is deployed

3. **Payment confirmation fails**
   - Check payment method validity
   - Verify client secret
   - Ensure proper error handling

### Debug Mode

Enable debug logging by setting:

```env
VITE_DEBUG_PAYMENTS=true
```

This will log detailed payment information to the console.

## Support

For issues related to:

- **Stripe integration**: Check Stripe documentation and support
- **Database issues**: Review Supabase logs and documentation
- **Frontend components**: Check browser console for errors
- **Edge functions**: Review Supabase function logs

## License

This payment integration is part of the main project and follows the same license terms.
