# Stripe Payment Integration - Complete Setup Guide

This guide covers the complete implementation of Stripe payments in your glocal.in project, including one-time payments and subscriptions.

## 🚀 Quick Start

### 1. Environment Setup

Copy your environment variables from `.env.example` to `.env`:

```bash
# Stripe Configuration (Required for payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 2. Database Migration

The database migration has been applied automatically. It adds the following fields to the `profiles` table:

- `stripe_customer_id` (text) - Stores Stripe customer ID
- `is_authorized` (boolean) - Whether user has completed payment
- `subscription_status` (text) - Current subscription status

### 3. Deploy Edge Functions

Deploy the Supabase Edge Functions:

```bash
# Deploy checkout session function
supabase functions deploy create-checkout-session

# Deploy webhook handler
supabase functions deploy stripe-webhook
```

### 4. Set Environment Variables in Supabase

Set the required secrets in your Supabase project:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 🧪 Testing Setup

### Stripe CLI Setup

1. **Install Stripe CLI**:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows
   # Download from https://github.com/stripe/stripe-cli/releases
   
   # Linux
   wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_X.X.X_linux_x86_64.tar.gz
   tar -xvf stripe_X.X.X_linux_x86_64.tar.gz
   sudo mv stripe /usr/local/bin
   ```

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to local development**:
   ```bash
   stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
   ```

4. **Copy the webhook signing secret** from the CLI output and add it to your `.env` file.

### Test Cards

Use these test card numbers for testing:

- **Successful payment**: `4242 4242 4242 4242`
- **Declined payment**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`
- **Insufficient funds**: `4000 0000 0000 9995`

Use any future expiry date and any 3-digit CVC.

### Testing Flow

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Start Supabase locally**:
   ```bash
   supabase start
   ```

3. **Start Stripe webhook forwarding**:
   ```bash
   stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
   ```

4. **Test the payment flow**:
   - Navigate to `/pricing`
   - Click on a payment button
   - Use test card `4242 4242 4242 4242`
   - Complete the payment
   - Check that user is marked as authorized in the database

## 🔧 Configuration

### Stripe Price IDs

Update the price IDs in your components:

1. **In `src/pages/Pricing.tsx`**:
   ```typescript
   // Replace these with your actual Stripe price IDs
   priceId="price_premium_monthly"    // Your monthly subscription price ID
   priceId="price_premium_lifetime"   // Your one-time payment price ID
   ```

2. **In `src/components/payments/UserPaymentStatus.tsx`**:
   ```typescript
   // Update the price IDs here as well
   priceId="price_premium_monthly"
   priceId="price_premium_lifetime"
   ```

### Creating Stripe Products and Prices

1. **Go to Stripe Dashboard** → Products
2. **Create a new product** for "Premium Subscription"
3. **Add pricing**:
   - Monthly: $9.99/month (recurring)
   - Lifetime: $99 (one-time)
4. **Copy the price IDs** and update your components

## 🚀 Production Deployment

### 1. Switch to Live Keys

1. **Update environment variables** with live keys:
   ```bash
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

2. **Update Supabase secrets**:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 2. Configure Production Webhooks

1. **Go to Stripe Dashboard** → Webhooks
2. **Add endpoint**: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. **Select events**:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. **Copy the webhook signing secret** and update your environment variables

### 3. Deploy to Production

```bash
# Deploy functions to production
supabase functions deploy create-checkout-session --project-ref your-project-ref
supabase functions deploy stripe-webhook --project-ref your-project-ref

# Deploy your frontend
npm run build
# Deploy to your hosting platform (Vercel, Netlify, etc.)
```

## 📱 Usage Examples

### Basic Payment Button

```tsx
import { PaymentButton } from '@/components/payments/PaymentButton';

// One-time payment
<PaymentButton
  priceId="price_premium_lifetime"
  mode="payment"
>
  Buy Lifetime Access
</PaymentButton>

// Subscription
<PaymentButton
  priceId="price_premium_monthly"
  mode="subscription"
>
  Subscribe Monthly
</PaymentButton>
```

### Check User Payment Status

```tsx
import { UserPaymentStatus } from '@/components/payments/UserPaymentStatus';

// Show payment status in profile
<UserPaymentStatus showUpgradeButton={true} />
```

### Custom Success/Cancel URLs

```tsx
<PaymentButton
  priceId="price_premium_monthly"
  mode="subscription"
  successUrl="/custom-success"
  cancelUrl="/custom-cancel"
>
  Subscribe
</PaymentButton>
```

## 🔍 Monitoring and Debugging

### Check Payment Status in Database

```sql
-- Check user payment status
SELECT 
  user_id,
  is_authorized,
  subscription_status,
  stripe_customer_id
FROM profiles 
WHERE user_id = 'your-user-id';
```

### View Stripe Events

1. **Stripe Dashboard** → Events
2. **Check webhook deliveries** for any failures
3. **View customer details** and subscription status

### Common Issues

1. **Webhook signature verification fails**:
   - Check that `STRIPE_WEBHOOK_SECRET` is correct
   - Ensure webhook endpoint URL is correct

2. **User not marked as authorized**:
   - Check webhook events in Stripe Dashboard
   - Verify database migration was applied
   - Check Supabase function logs

3. **Checkout session creation fails**:
   - Verify Stripe keys are correct
   - Check that price IDs exist in Stripe
   - Ensure user is authenticated

## 🛡️ Security Considerations

1. **Never expose secret keys** in frontend code
2. **Use environment variables** for all sensitive data
3. **Verify webhook signatures** (already implemented)
4. **Use HTTPS** in production
5. **Implement rate limiting** on payment endpoints
6. **Log all payment events** for audit trails

## 📊 Analytics and Reporting

### Track Payment Metrics

```sql
-- Payment success rate
SELECT 
  COUNT(*) as total_payments,
  COUNT(CASE WHEN is_authorized = true THEN 1 END) as successful_payments,
  ROUND(COUNT(CASE WHEN is_authorized = true THEN 1 END) * 100.0 / COUNT(*), 2) as success_rate
FROM profiles 
WHERE stripe_customer_id IS NOT NULL;

-- Subscription status breakdown
SELECT 
  subscription_status,
  COUNT(*) as count
FROM profiles 
WHERE subscription_status IS NOT NULL
GROUP BY subscription_status;
```

## 🆘 Support

If you encounter issues:

1. **Check the logs** in Supabase Dashboard → Functions
2. **Verify webhook events** in Stripe Dashboard
3. **Test with Stripe CLI** for local development
4. **Check environment variables** are set correctly
5. **Review this documentation** for common solutions

## 🎯 Next Steps

1. **Customize the UI** to match your brand
2. **Add more payment methods** (Apple Pay, Google Pay)
3. **Implement usage-based billing** if needed
4. **Add payment analytics** and reporting
5. **Set up automated email notifications** for payment events
6. **Implement refund handling** if required

---

**Note**: This integration provides a solid foundation for payments. Customize the UI, pricing, and features according to your specific business needs.
