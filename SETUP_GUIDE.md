# 🚀 Project Glocal Setup Guide

This guide will help you set up your Project Glocal platform for production use.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git installed
- A Supabase account
- A Stripe account (for payments)
- Optional: News API key, OpenAI API key

## 🔧 Step 1: Environment Configuration

### Option A: Automated Setup (Recommended)
```bash
# Run the interactive setup script
node scripts/setup-environment.js
```

### Option B: Manual Setup
1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your actual values:
```env
# Required
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional but recommended
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEWS_API_KEY=your_news_api_key
```

## 🗄️ Step 2: Database Setup (Supabase)

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2.2 Run Database Migrations
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push
```

### 2.3 Set up Row Level Security (RLS)
The migrations should have already set up RLS policies, but you can verify:
```sql
-- Check if RLS is enabled on key tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'posts', 'events', 'services');
```

## 💳 Step 3: Payment Setup (Stripe)

### 3.1 Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Create an account and get your API keys
3. Set up webhook endpoints

### 3.2 Configure Stripe Webhooks
1. In Stripe Dashboard, go to Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 3.3 Test Payments
```bash
# Use Stripe test cards
# Success: 4242 4242 4242 4242
# Decline: 4000 0000 0000 0002
```

## 📰 Step 4: News API Setup (Optional)

### 4.1 Get News API Key
1. Go to [newsapi.org](https://newsapi.org)
2. Sign up for free account
3. Get your API key

### 4.2 Configure News Sources
The app supports multiple news sources. You can configure them in the admin panel.

## 🤖 Step 5: AI Features Setup (Optional)

### 5.1 OpenAI Configuration
1. Get OpenAI API key from [platform.openai.com](https://platform.openai.com)
2. Add to your `.env` file:
```env
OPENAI_API_KEY=your_openai_api_key
```

### 5.2 AI Features Available
- News article summarization
- Sentiment analysis
- Content recommendations
- Automated moderation

## 🚀 Step 6: Deployment

### 6.1 Build the Application
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test the build
npm run preview
```

### 6.2 Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### 6.3 Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### 6.4 Deploy to GitHub Pages
```bash
# Build and deploy
npm run build
npm run deploy:github
```

## 🔍 Step 7: Verification

### 7.1 Check Configuration
Visit: `https://your-domain.com/config-status`

### 7.2 Test Core Features
1. **Authentication**: Sign up, sign in, password reset
2. **Events**: Create, edit, RSVP to events
3. **Community**: Join groups, create discussions
4. **Payments**: Test subscription flow
5. **News**: Check news feed functionality
6. **Admin**: Access admin dashboard

### 7.3 Monitor Performance
- Check browser console for errors
- Monitor network requests
- Test on different devices/browsers

## 🛠️ Step 8: Post-Deployment

### 8.1 Set up Monitoring
```bash
# Add analytics (optional)
# Google Analytics, Mixpanel, etc.
```

### 8.2 Configure Backups
- Set up Supabase backups
- Configure database snapshots
- Set up file storage backups

### 8.3 Security Checklist
- [ ] Enable HTTPS
- [ ] Set up CSP headers
- [ ] Configure rate limiting
- [ ] Set up error tracking
- [ ] Enable audit logs

## 🆘 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Database Connection Issues
1. Check Supabase URL and key
2. Verify RLS policies
3. Check network connectivity

#### Payment Issues
1. Verify Stripe keys
2. Check webhook configuration
3. Test with Stripe test cards

#### News Feed Issues
1. Check News API key
2. Verify API quotas
3. Check network requests

### Getting Help
- Check the logs in browser console
- Review Supabase logs
- Check Stripe dashboard for payment issues
- Visit `/config-status` for configuration issues

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://react.dev/)

## 🎉 You're Ready!

Your Project Glocal platform should now be fully functional. Users can:
- Sign up and create profiles
- Join communities and discussions
- Create and attend events
- Book artists and services
- Engage with news and polls
- Use privacy controls and anonymous mode
- Make payments and subscriptions

Happy building! 🚀
