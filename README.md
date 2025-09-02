# Glocal

A comprehensive local community platform that connects neighbors, promotes local events, and enables artist bookings with integrated marketing features.

## 🚀 Features

### Core Platform
- **Local Feed**: Share posts, events, and services with your community
- **Event Management**: Create and discover local events
- **Artist Booking**: Book local artists and performers
- **Community Groups**: Join discussions and groups
- **Location Services**: Personalized content based on your location

### Marketing Features
- **Social Sharing**: Share content across multiple platforms (Facebook, Twitter, LinkedIn, WhatsApp)
- **Promotional Banners**: Dynamic promotional campaigns with targeting
- **Referral Program**: Invite friends and earn rewards
- **Marketing Analytics**: Track engagement and performance metrics

### Admin Features
- **Content Moderation**: Manage posts and user-generated content
- **Analytics Dashboard**: Monitor platform usage and engagement
- **User Management**: Administer user accounts and permissions

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Functions)
- **State Management**: React Query, React Context
- **Testing**: Vitest, React Testing Library

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd projectglocal

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Required
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional - for enhanced features
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
VITE_NEWS_API_KEY=your_news_api_key
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_TWITTER_API_KEY=your_twitter_api_key
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
```

## 📚 Documentation

- [Feature Documentation](./docs/features/) - Detailed feature guides
- [Deployment Guide](./DEPLOYMENT_CHECKLIST.md) - Production deployment checklist
- [Integration Summary](./FINAL_INTEGRATION_SUMMARY.md) - Technical implementation details

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## 🚀 Deployment

### GitHub Pages Deployment

The project is configured for deployment to GitHub Pages with a custom domain (`theglocal.in`).

#### Quick Deploy
```bash
# Deploy to GitHub Pages
npm run deploy:github

# Or use the simple deployment script
npm run deploy:simple
```

#### Manual Deployment Steps
1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages:**
   ```bash
   npx gh-pages -d dist
   ```

3. **Wait for deployment** (usually 2-5 minutes)

#### Deployment Configuration
- **Custom Domain**: `theglocal.in`
- **Build Output**: `dist/` directory
- **SPA Routing**: Configured for single-page application routing
- **404 Handling**: Automatic redirects for all routes

#### Troubleshooting
If you see "Something went wrong" errors:
1. Ensure the build completed successfully
2. Check that all assets are properly referenced
3. Verify the custom domain is configured in GitHub Pages settings
4. Clear browser cache and try again

### Production Build
```bash
npm run build
```

### Database Migration
```bash
supabase db push
```

### Deploy
```bash
npm run deploy
```

## 📱 Marketing Features Usage

### Social Sharing
The platform includes integrated social sharing capabilities:

```tsx
import { SocialShareButton } from '@/components/marketing/SocialShareButton';

<SocialShareButton
  content={{
    content_type: 'post',
    content_id: post.id,
    share_text: 'Check out this amazing post!',
    share_url: `${window.location.origin}/post/${post.id}`
  }}
  platforms={['facebook', 'twitter', 'linkedin', 'whatsapp']}
  onShare={(platform) => console.log(`Shared on ${platform}`)}
/>
```

### Promotional Banners
Display dynamic promotional content:

```tsx
import { PromotionalBanner } from '@/components/marketing/PromotionalBanner';

<PromotionalBanner
  position="top"
  variant="featured"
  maxCampaigns={2}
  onAction={(campaign) => console.log('Campaign clicked:', campaign)}
/>
```

### Referral Program
Enable user referrals and rewards:

```tsx
import { ReferralProgram } from '@/components/marketing/ReferralProgram';

<ReferralProgram />
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [documentation](./docs/)
- Review [known issues](./docs/features/CODE_REVIEW.md)
- Create an issue in the repository

---

**The Glocal** - Connecting local communities through technology and shared experiences.
