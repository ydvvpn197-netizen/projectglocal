# Stripe Payment Integration - Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Variables
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` set (test key for development)
- [ ] `STRIPE_SECRET_KEY` set (test key for development)
- [ ] `STRIPE_WEBHOOK_SECRET` set (from Stripe CLI)
- [ ] `SUPABASE_URL` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set

### 2. Database
- [ ] Migration applied successfully (`add_stripe_payment_fields_to_profiles`)
- [ ] New columns exist in `profiles` table:
  - [ ] `stripe_customer_id`
  - [ ] `is_authorized`
  - [ ] `subscription_status`
- [ ] Indexes created for performance

### 3. Supabase Edge Functions
- [ ] `create-checkout-session` function deployed
- [ ] `stripe-webhook` function deployed
- [ ] Functions are accessible via Supabase dashboard

### 4. Stripe Configuration
- [ ] Stripe account created and verified
- [ ] Test products and prices created
- [ ] Price IDs updated in frontend components
- [ ] Stripe CLI installed and configured

### 5. Frontend Components
- [ ] `PaymentButton` component working
- [ ] `UserPaymentStatus` component working
- [ ] Payment success page (`/payment/success`) accessible
- [ ] Payment cancel page (`/payment/cancel`) accessible
- [ ] Pricing page (`/pricing`) accessible

### 6. Testing
- [ ] Test payment flow with test cards
- [ ] Webhook events received and processed
- [ ] User authorization status updates correctly
- [ ] Database updates working properly

## 🚀 Production Deployment Steps

### Step 1: Switch to Live Stripe Keys

1. **Get Live Keys from Stripe Dashboard**:
   - Go to Stripe Dashboard → Developers → API Keys
   - Copy the live publishable key (`pk_live_...`)
   - Copy the live secret key (`sk_live_...`)

2. **Update Environment Variables**:
   ```bash
   # Update .env file
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   ```

3. **Update Supabase Secrets**:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   ```

### Step 2: Configure Production Webhooks

1. **Create Webhook Endpoint**:
   - Go to Stripe Dashboard → Webhooks
   - Click "Add endpoint"
   - URL: `https://your-project-ref.supabase.co/functions/v1/stripe-webhook`
   - Select events:
     - `checkout.session.completed`
     - `invoice.paid`
     - `invoice.payment_failed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

2. **Get Webhook Signing Secret**:
   - Copy the webhook signing secret (`whsec_...`)
   - Update environment variables:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Step 3: Create Live Products and Prices

1. **Create Products in Stripe Dashboard**:
   - Go to Products → Add Product
   - Create "Premium Subscription" product
   - Add pricing:
     - Monthly: $9.99/month (recurring)
     - Lifetime: $99 (one-time)

2. **Update Price IDs in Code**:
   - Replace test price IDs with live price IDs in:
     - `src/pages/Pricing.tsx`
     - `src/components/payments/UserPaymentStatus.tsx`

### Step 4: Deploy to Production

1. **Deploy Supabase Functions**:
   ```bash
   supabase functions deploy create-checkout-session --project-ref your-project-ref
   supabase functions deploy stripe-webhook --project-ref your-project-ref
   ```

2. **Deploy Frontend**:
   ```bash
   npm run build
   # Deploy to your hosting platform (Vercel, Netlify, etc.)
   ```

### Step 5: Final Testing

1. **Test with Real Card** (small amount):
   - Use a real credit card with a small amount
   - Verify payment processes correctly
   - Check user is marked as authorized
   - Verify webhook events are received

2. **Test Subscription Flow**:
   - Create a subscription
   - Verify recurring billing works
   - Test subscription cancellation

## 🔍 Post-Deployment Verification

### 1. Database Verification
```sql
-- Check if payment fields exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('stripe_customer_id', 'is_authorized', 'subscription_status');

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'profiles' 
AND indexname LIKE '%stripe%' OR indexname LIKE '%authorized%';
```

### 2. Function Verification
- [ ] `create-checkout-session` function responds correctly
- [ ] `stripe-webhook` function processes events
- [ ] No errors in Supabase function logs

### 3. Frontend Verification
- [ ] Payment buttons render correctly
- [ ] Checkout flow works end-to-end
- [ ] Success/cancel pages display properly
- [ ] User payment status updates in real-time

### 4. Stripe Dashboard Verification
- [ ] Webhook events are being received
- [ ] No failed webhook deliveries
- [ ] Test payments appear in Stripe Dashboard
- [ ] Customer records are created

## 🚨 Rollback Plan

If issues occur during deployment:

1. **Revert Environment Variables**:
   ```bash
   # Switch back to test keys
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

2. **Revert Supabase Secrets**:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_test_...
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_test_...
   ```

3. **Redeploy Functions**:
   ```bash
   supabase functions deploy create-checkout-session --project-ref your-project-ref
   supabase functions deploy stripe-webhook --project-ref your-project-ref
   ```

4. **Redeploy Frontend**:
   ```bash
   npm run build
   # Redeploy to hosting platform
   ```

## 📊 Monitoring Setup

### 1. Stripe Dashboard Monitoring
- [ ] Set up alerts for failed payments
- [ ] Monitor webhook delivery success rate
- [ ] Track payment volume and success rates

### 2. Supabase Monitoring
- [ ] Monitor function execution logs
- [ ] Set up alerts for function errors
- [ ] Track database performance

### 3. Application Monitoring
- [ ] Monitor payment button click rates
- [ ] Track conversion rates
- [ ] Monitor user authorization status

## 🛡️ Security Checklist

- [ ] All secret keys are in environment variables
- [ ] No hardcoded keys in source code
- [ ] Webhook signature verification enabled
- [ ] HTTPS enabled in production
- [ ] Rate limiting implemented (if needed)
- [ ] Payment data is not logged
- [ ] PCI compliance requirements met

## 📈 Performance Optimization

- [ ] Database indexes are optimized
- [ ] Function response times are acceptable
- [ ] Frontend components load quickly
- [ ] Payment flow is smooth and fast
- [ ] Error handling is comprehensive

## 🎯 Success Criteria

Deployment is successful when:

1. ✅ Users can complete payments successfully
2. ✅ Webhook events are processed correctly
3. ✅ User authorization status updates in real-time
4. ✅ No errors in logs or console
5. ✅ Payment data is secure and compliant
6. ✅ Performance meets requirements
7. ✅ Monitoring and alerts are working

## 📞 Support Contacts

- **Stripe Support**: https://support.stripe.com/
- **Supabase Support**: https://supabase.com/support
- **Technical Issues**: Check logs and documentation first

---

**Remember**: Always test thoroughly in a staging environment before deploying to production!
