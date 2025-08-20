# Marketing Features Guide

This guide covers the marketing features implemented in The Glocal platform, including social sharing, promotional banners, and referral programs.

## Overview

The marketing features provide comprehensive tools for user engagement, content promotion, and community growth. All features are designed with graceful degradation and optional API dependencies.

## 🚀 Social Sharing

### SocialShareButton Component

A versatile component for sharing content across multiple social media platforms.

#### Features
- **Multi-platform support**: Facebook, Twitter, LinkedIn, WhatsApp, Telegram, Email, SMS
- **Loading states**: Visual feedback during sharing operations
- **Error handling**: Graceful fallbacks for failed shares
- **Analytics tracking**: Automatic tracking of share events
- **Customizable appearance**: Multiple variants and sizes

#### Usage

```tsx
import { SocialShareButton } from '@/components/marketing/SocialShareButton';

// Basic usage
<SocialShareButton
  content={{
    content_type: 'post',
    content_id: post.id,
    share_text: 'Check out this amazing post!',
    share_url: `${window.location.origin}/post/${post.id}`
  }}
/>

// Advanced usage with custom configuration
<SocialShareButton
  content={{
    content_type: 'event',
    content_id: event.id,
    share_text: `Join us at ${event.title}!`,
    share_url: `${window.location.origin}/event/${event.id}`
  }}
  variant="outline"
  size="sm"
  showLabel={true}
  platforms={['facebook', 'twitter', 'whatsapp']}
  onShare={(platform) => {
    console.log(`Content shared on ${platform}`);
    // Track custom analytics
  }}
  className="my-custom-class"
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `ShareContentData` | Required | Content to be shared |
| `variant` | `'default' \| 'outline' \| 'ghost'` | `'default'` | Button appearance variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `showLabel` | `boolean` | `false` | Show platform labels |
| `platforms` | `Array<Platform>` | `['facebook', 'twitter', 'linkedin', 'whatsapp']` | Available platforms |
| `onShare` | `(platform: string) => void` | Optional | Callback after successful share |
| `className` | `string` | Optional | Additional CSS classes |

#### Content Types

The component supports various content types:

```tsx
type ShareContentData = {
  content_type: 'post' | 'event' | 'profile' | 'group' | 'service';
  content_id: string;
  share_text: string;
  share_url: string;
  platform?: SocialPlatform;
};
```

#### Platform Configuration

Each platform has specific configuration:

```tsx
const platformConfigs = {
  facebook: {
    icon: Facebook,
    label: 'Facebook',
    color: '#1877F2',
    shareUrl: 'https://www.facebook.com/sharer/sharer.php'
  },
  twitter: {
    icon: Twitter,
    label: 'Twitter',
    color: '#1DA1F2',
    shareUrl: 'https://twitter.com/intent/tweet'
  },
  // ... other platforms
};
```

## 🎯 Promotional Banners

### PromotionalBanner Component

Dynamic promotional content display with targeting and campaign management.

#### Features
- **Campaign targeting**: Display based on user location, preferences, and behavior
- **Multiple variants**: Default, featured, and urgent banner styles
- **Auto-rotation**: Automatic cycling through multiple campaigns
- **Dismissible**: Users can dismiss banners
- **Analytics tracking**: Track impressions and clicks

#### Usage

```tsx
import { PromotionalBanner } from '@/components/marketing/PromotionalBanner';

// Basic usage in layout
<PromotionalBanner
  position="top"
  variant="default"
  maxCampaigns={3}
/>

// Advanced usage with callbacks
<PromotionalBanner
  position="sidebar"
  variant="featured"
  maxCampaigns={1}
  onDismiss={(campaignId) => {
    console.log(`Campaign ${campaignId} dismissed`);
    // Track dismissal
  }}
  onAction={(campaign) => {
    console.log('Campaign clicked:', campaign);
    // Handle campaign action
  }}
  className="sticky top-0 z-50"
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `'top' \| 'bottom' \| 'sidebar'` | `'top'` | Banner position |
| `variant` | `'default' \| 'featured' \| 'urgent'` | `'default'` | Visual variant |
| `maxCampaigns` | `number` | `3` | Maximum campaigns to display |
| `onDismiss` | `(campaignId: string) => void` | Optional | Dismiss callback |
| `onAction` | `(campaign: Campaign) => void` | Optional | Action callback |
| `className` | `string` | Optional | Additional CSS classes |

#### Campaign Structure

```tsx
interface Campaign {
  id: string;
  title: string;
  description: string;
  campaign_type: 'promotional' | 'announcement' | 'event';
  status: 'active' | 'inactive' | 'draft';
  start_date?: string;
  end_date?: string;
  campaign_config?: {
    priority: 'default' | 'featured' | 'urgent';
    target_audience?: string[];
    location_targeting?: boolean;
  };
  created_at: string;
  updated_at: string;
}
```

#### Integration in Layout

The banner is typically integrated in the main layout:

```tsx
// src/components/MainLayout.tsx
import { PromotionalBanner } from '@/components/marketing/PromotionalBanner';

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Promotional Banner */}
          <PromotionalBanner 
            position="top" 
            variant="default" 
            maxCampaigns={1}
            className="z-40"
          />
          
          {/* Rest of layout */}
          <header>...</header>
          <main>{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
```

## 🎁 Referral Program

### ReferralProgram Component

Complete referral system for user acquisition and rewards.

#### Features
- **Referral code generation**: Automatic code creation for users
- **Link sharing**: Easy sharing across social platforms
- **Analytics tracking**: Monitor referral performance
- **Rewards system**: Track earned rewards and credits
- **Social integration**: Direct sharing to social platforms

#### Usage

```tsx
import { ReferralProgram } from '@/components/marketing/ReferralProgram';

// Basic usage
<ReferralProgram />

// With custom styling
<ReferralProgram className="my-custom-styles" />
```

#### Integration in Profile

The referral program is integrated in the user profile page:

```tsx
// src/pages/Profile.tsx
import { ReferralProgram } from '@/components/marketing/ReferralProgram';

const Profile = () => {
  return (
    <MainLayout>
      <div className="space-y-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            {/* Profile content */}
          </TabsContent>

          <TabsContent value="referrals">
            <ReferralProgram />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};
```

#### Referral Analytics

The component displays comprehensive analytics:

```tsx
interface ReferralAnalytics {
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  total_rewards_earned: number;
  available_rewards: number;
  referral_conversion_rate: number;
  recent_referrals: Array<{
    id: string;
    referred_user: {
      id: string;
      username: string;
      avatar_url?: string;
    };
    status: 'pending' | 'completed';
    created_at: string;
  }>;
}
```

## 🔧 Services

### MarketingService

Core service for managing marketing campaigns and analytics.

```tsx
// src/services/marketingService.ts
export class MarketingService {
  static async getCampaigns(filters?: CampaignFilters): Promise<Campaign[]>
  static async createCampaign(campaignData: CreateCampaignData): Promise<Campaign>
  static async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign>
  static async deleteCampaign(id: string): Promise<void>
  static async trackCampaignEvent(eventData: CampaignEventData): Promise<void>
}
```

### SocialSharingService

Service for handling social media sharing operations.

```tsx
// src/services/socialSharingService.ts
export class SocialSharingService {
  static async shareContent(data: ShareContentData): Promise<SocialShare>
  static getShareUrl(platform: string, content: ShareContentData): string
  static openShareDialog(platform: string, content: ShareContentData): void
  static async trackShareEvent(share: SocialShare): Promise<void>
  static async getShareAnalytics(contentId: string): Promise<ShareAnalytics>
}
```

### ReferralService

Service for managing referral programs and rewards.

```tsx
// src/services/referralService.ts
export class ReferralService {
  static async getUserReferralCode(userId: string): Promise<string>
  static async generateReferralLink(userId: string): Promise<string>
  static async getReferralAnalytics(userId: string): Promise<ReferralAnalytics>
  static async createReferral(referrerId: string, referredEmail: string): Promise<Referral>
  static async processReferralReward(referralId: string): Promise<void>
}
```

## 🗄️ Database Schema

### Marketing Tables

The marketing features use several database tables:

```sql
-- Marketing campaigns
CREATE TABLE marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  campaign_config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social shares tracking
CREATE TABLE social_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  share_text TEXT,
  share_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral program
CREATE TABLE referral_program (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  referral_code TEXT UNIQUE NOT NULL,
  total_referrals INTEGER DEFAULT 0,
  successful_referrals INTEGER DEFAULT 0,
  total_rewards_earned DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🧪 Testing

### Component Tests

Each marketing component includes comprehensive tests:

```tsx
// src/components/marketing/__tests__/SocialShareButton.test.tsx
describe('SocialShareButton', () => {
  it('renders with default props', () => {
    render(<SocialShareButton content={mockContent} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles share errors gracefully', async () => {
    // Test error handling
  });
});
```

### Service Tests

Services are tested with mocked dependencies:

```tsx
// src/services/__tests__/marketingService.test.ts
describe('MarketingService', () => {
  it('creates campaigns successfully', async () => {
    // Test campaign creation
  });

  it('handles service errors', async () => {
    // Test error scenarios
  });
});
```

## 🔒 Security

### Row Level Security (RLS)

All marketing tables include RLS policies:

```sql
-- Marketing campaigns RLS
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active campaigns" ON marketing_campaigns
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage campaigns" ON marketing_campaigns
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

### Input Validation

All user inputs are validated and sanitized:

```tsx
// Input sanitization
import { sanitizeText, sanitizeHtml } from '@/lib/sanitize';

const sanitizedContent = sanitizeText(userInput);
const sanitizedHtml = sanitizeHtml(htmlContent);
```

## 🚀 Performance

### Code Splitting

Marketing components are code-split for optimal loading:

```tsx
// Lazy loading of marketing components
const SocialShareButton = lazy(() => import('@/components/marketing/SocialShareButton'));
const PromotionalBanner = lazy(() => import('@/components/marketing/PromotionalBanner'));
const ReferralProgram = lazy(() => import('@/components/marketing/ReferralProgram'));
```

### Bundle Optimization

Marketing features add minimal bundle size:
- SocialShareButton: ~2KB
- PromotionalBanner: ~13KB
- ReferralProgram: ~21KB
- Total marketing components: ~36KB

## 🔧 Configuration

### Environment Variables

Marketing features use optional environment variables:

```env
# Social Media APIs (Optional)
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_TWITTER_API_KEY=your_twitter_api_key
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
VITE_WHATSAPP_API_KEY=your_whatsapp_api_key
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Marketing Analytics (Optional)
VITE_ANALYTICS_KEY=your_analytics_key
```

### Graceful Degradation

Features work without optional APIs:

```tsx
// Fallback behavior when APIs are not configured
const handleShare = async (platform: string) => {
  try {
    // Try to use configured API
    await SocialSharingService.shareContent(content);
  } catch (error) {
    // Fallback to basic sharing
    const shareUrl = SocialSharingService.getShareUrl(platform, content);
    window.open(shareUrl, '_blank');
  }
};
```

## 📊 Analytics

### Tracking Events

Marketing features automatically track user interactions:

```tsx
// Track share events
await SocialSharingService.trackShareEvent({
  content_type: 'post',
  content_id: post.id,
  platform: 'facebook',
  user_id: user.id
});

// Track campaign interactions
await MarketingService.trackCampaignEvent({
  campaign_id: campaign.id,
  event_type: 'impression',
  user_id: user.id
});
```

### Analytics Dashboard

Admin dashboard includes marketing analytics:

- Share performance by platform
- Campaign effectiveness metrics
- Referral conversion rates
- User engagement trends

## 🐛 Troubleshooting

### Common Issues

1. **Social sharing not working**
   - Check if social media APIs are configured
   - Verify CORS settings for external domains
   - Check browser console for errors

2. **Promotional banners not displaying**
   - Verify campaign status is 'active'
   - Check campaign date ranges
   - Ensure user meets targeting criteria

3. **Referral codes not generating**
   - Verify user authentication
   - Check database permissions
   - Review referral service logs

### Debug Mode

Enable debug logging for marketing features:

```tsx
// Enable debug mode
localStorage.setItem('marketing_debug', 'true');

// Check debug logs
console.log('Marketing debug:', window.marketingDebug);
```

## 📚 Additional Resources

- [Marketing Features Plan](./0008_MARKETING_FEATURES_PLAN.md) - Original implementation plan
- [Marketing Features Review](./MARKETING_FEATURES_REVIEW.md) - Code review and analysis
- [Deployment Checklist](./../../DEPLOYMENT_CHECKLIST.md) - Production deployment guide
- [Integration Summary](./../../FINAL_INTEGRATION_SUMMARY.md) - Technical implementation details

---

For questions or issues with marketing features, please refer to the [main documentation](../) or create an issue in the repository.
