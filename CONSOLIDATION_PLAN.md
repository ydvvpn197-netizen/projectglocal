# Page Consolidation & UI Uniformity Plan

## Overview
This plan consolidates 98 pages down to ~35 essential pages with uniform UI across the platform.

## Duplicate Pages Identified

### 1. Profile Pages (4 → 1)
**Keep:** `ConsolidatedProfile.tsx`
**Remove:**
- `Profile.tsx`
- `UserProfile.tsx`
- `ArtistProfile.tsx` (merge into ConsolidatedProfile with variant)

### 2. Settings Pages (3 → 1)
**Keep:** `ConsolidatedSettings.tsx`
**Remove:**
- `CommunitySettings.tsx` (move to Communities page)
- `NotificationSettings.tsx` (merge as tab in ConsolidatedSettings)

### 3. Create Pages (5 → 1)
**Keep:** `ConsolidatedCreate.tsx`
**Remove:**
- `CreatePost.tsx`
- `CreateEvent.tsx`
- `CreateGroup.tsx`
- `CreateDiscussion.tsx`

### 4. Booking Pages (4 → 1)
**Keep:** `ConsolidatedBooking.tsx`
**Remove:**
- `BookArtist.tsx`
- `BookArtistSimple.tsx`
- `BookArtistTest.tsx`

### 5. Chat/Messages Pages (4 → 1)
**Keep:** `ConsolidatedChat.tsx`
**Remove:**
- `Chat.tsx`
- `EnhancedChat.tsx`
- `EnhancedMessages.tsx`

### 6. Notifications Pages (3 → 1)
**Keep:** `ConsolidatedNotifications.tsx`
**Remove:**
- `Notifications.tsx`
- `NotificationsPage.tsx`

### 7. Auth Pages (3 → 1)
**Keep:** `ConsolidatedAuth.tsx`
**Remove:**
- `SignIn.tsx` (use ConsolidatedAuth with tab)
- `SignUp.tsx` (use ConsolidatedAuth with tab)

### 8. Community Pages (6 → 2)
**Keep:**
- `ConsolidatedCommunity.tsx` (list/discovery)
- `CommunityDetail.tsx` (individual community - rename to ConsolidatedCommunityDetail)

**Remove:**
- `Community.tsx`
- `CommunityPlatform.tsx`
- `CommunityInsights.tsx` (merge into detail page)
- `CommunityInsightsSimple.tsx`
- `ConsolidatedCommunityInsights.tsx` (merge into detail page)
- `ConsolidatedCommunityManagement.tsx` (merge into detail page)

### 9. Onboarding Pages (3 → 1)
**Keep:** `ConsolidatedOnboarding.tsx`
**Remove:**
- `Onboarding.tsx`
- `PrivacyFirstOnboarding.tsx`

### 10. Subscription Pages (4 → 1)
**Keep:** `ConsolidatedSubscription.tsx`
**Remove:**
- `SubscriptionPage.tsx`
- `SubscriptionPlansPage.tsx`
- `PublicSquareSubscription.tsx`

### 11. Artist Pages (3 → 1)
**Keep:** `ConsolidatedArtist.tsx`
**Remove:**
- `ArtistOnboarding.tsx` (merge as step in ConsolidatedArtist)
- `EnhancedArtistMarketplace.tsx` (use ConsolidatedArtist)

### 12. Legal Pages (4 → 1)
**Keep:** `ConsolidatedLegal.tsx`
**Remove:**
- `NDA.tsx` (template in ConsolidatedLegal)
- `EmploymentContract.tsx` (template in ConsolidatedLegal)
- `RentalAgreement.tsx` (template in ConsolidatedLegal)
- `ServiceAgreement.tsx` (template in ConsolidatedLegal)

### 13. Test/Demo Pages (7 → 0)
**Remove ALL (move to /dev route behind flag):**
- `TestButtons.tsx`
- `ConsolidatedTest.tsx`
- `CivicEngagementTest.tsx`
- `MonetizationTest.tsx`
- `LayoutDemo.tsx`
- `FeatureShowcase.tsx`
- `EnhancedSearchDemo.tsx`
- `VoiceControlDemo.tsx`
- `PerformancePage.tsx`

### 14. Admin Pages (9 → Keep Organized)
**Keep as-is (already organized in /admin folder):**
- `AdminLogin.tsx`
- `admin/Dashboard.tsx`
- `admin/Analytics.tsx`
- `admin/AdminManagement.tsx`
- `admin/UserManagement.tsx`
- `admin/UserModeration.tsx`
- `admin/ContentModeration.tsx`
- `admin/SystemSettings.tsx`
- `ConsolidatedAdmin.tsx` (consolidates above)

## Final Page Structure (35 Core Pages)

### Public Pages (8)
1. `ConsolidatedIndex.tsx` - Landing/Home
2. `About.tsx` - About platform
3. `Privacy.tsx` - Privacy policy
4. `Pricing.tsx` - Pricing plans
5. `ConsolidatedAuth.tsx` - Sign in/Sign up
6. `ForgotPassword.tsx` - Password recovery
7. `ResetPassword.tsx` - Password reset
8. `AuthCallback.tsx` - OAuth callback

### Main App Pages (15)
9. `ConsolidatedFeed.tsx` - Main feed
10. `Discover.tsx` - Discovery page
11. `News.tsx` - News feed
12. `ConsolidatedProfile.tsx` - User/Artist profiles
13. `ConsolidatedSettings.tsx` - All settings
14. `ConsolidatedDashboard.tsx` - User dashboard
15. `ConsolidatedChat.tsx` - Messages/chat
16. `ConsolidatedNotifications.tsx` - Notifications

### Content Creation (1)
17. `ConsolidatedCreate.tsx` - Create post/event/group/discussion

### Events (2)
18. `ConsolidatedEvents.tsx` - Events list
19. `EventDetails.tsx` - Event detail

### Community (2)
20. `ConsolidatedCommunity.tsx` - Communities list
21. `CommunityDetail.tsx` - Community detail (rename to ConsolidatedCommunityDetail)

### Features (7)
22. `PublicSquare.tsx` - Public square/civic engagement
23. `Polls.tsx` - Polls & voting
24. `LegalAssistant.tsx` - Legal tools
25. `LifeWish.tsx` - Life wishes
26. `LocalBusinesses.tsx` - Local businesses
27. `LocalCommunities.tsx` - Local communities discovery
28. `ConsolidatedBooking.tsx` - Book artists/services

### Artist (1)
29. `ConsolidatedArtist.tsx` - Artist marketplace/onboarding

### Subscription & Payments (6)
30. `ConsolidatedSubscription.tsx` - Subscription management
31. `PaymentSuccess.tsx` - Payment success
32. `PaymentCancel.tsx` - Payment cancelled
33. `SubscriptionSuccess.tsx` - Subscription success
34. `SubscriptionCancel.tsx` - Subscription cancelled
35. `ConsolidatedPayment.tsx` - Payment processing

### Utility (3)
36. `NotFound.tsx` - 404 page
37. `LocationSetup.tsx` - Location setup
38. `PostDetailPage.tsx` - Post detail
39. `FollowSystem.tsx` - Follow management

### Admin (1)
40. `ConsolidatedAdmin.tsx` - Admin dashboard (uses sub-routes)

## Uniform UI Standards

All pages will use:

### 1. UnifiedPageTemplate
```tsx
<UnifiedPageTemplate
  title="Page Title"
  subtitle="Page subtitle"
  description="Page description"
  breadcrumbs={[...]}
  primaryAction={{...}}
  secondaryActions={[...]}
  showRightSidebar={true}
  tabs={<Tabs>...</Tabs>}
>
  {/* Page content */}
</UnifiedPageTemplate>
```

### 2. Consistent Color Scheme
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)
- Muted: Gray (#6B7280)

### 3. Consistent Spacing
- Container padding: `px-4 sm:px-6 lg:px-8`
- Section spacing: `space-y-6`
- Card padding: `p-6`
- Element gaps: `gap-4`

### 4. Consistent Typography
- Page title: `text-3xl font-bold`
- Section title: `text-2xl font-semibold`
- Card title: `text-lg font-semibold`
- Body: `text-base`
- Small text: `text-sm text-muted-foreground`

### 5. Consistent Components
- All buttons use `<Button>` from shadcn
- All cards use `<Card>` from shadcn
- All forms use shadcn form components
- All dialogs use `<Dialog>` from shadcn
- All tabs use `<Tabs>` from shadcn

## Implementation Steps

### Phase 1: Create Unified Components (DONE)
✅ UnifiedPageTemplate
✅ ConsolidatedHeader
✅ ConsolidatedSidebar
✅ RightSidebar
✅ RedditStyleFeed

### Phase 2: Update Core Pages (IN PROGRESS)
- [ ] Update ConsolidatedProfile to handle all profile types
- [ ] Update ConsolidatedSettings to include all settings
- [ ] Update ConsolidatedCreate to be the only creation page
- [ ] Update ConsolidatedChat to be the only chat page
- [ ] Update ConsolidatedBooking to be the only booking page

### Phase 3: Update Routes (PENDING)
- [ ] Update AppRoutes.tsx to use consolidated pages only
- [ ] Add redirects from old routes to new consolidated routes
- [ ] Update all internal links to use new routes

### Phase 4: Remove Duplicates (PENDING)
- [ ] Move test pages to /dev route with feature flag
- [ ] Delete duplicate page files
- [ ] Update imports in components
- [ ] Run tests to ensure nothing breaks

### Phase 5: Documentation (PENDING)
- [ ] Update README with new page structure
- [ ] Create page usage examples
- [ ] Document routing conventions
- [ ] Create developer guide for adding new pages

## Route Mapping

| Old Route | New Route | Page Component |
|-----------|-----------|----------------|
| `/signin` | `/auth?tab=signin` | ConsolidatedAuth |
| `/signup` | `/auth?tab=signup` | ConsolidatedAuth |
| `/profile` | `/profile` | ConsolidatedProfile |
| `/profile/:userId` | `/profile/:userId` | ConsolidatedProfile |
| `/artist/:artistId` | `/profile/:artistId?type=artist` | ConsolidatedProfile |
| `/settings` | `/settings` | ConsolidatedSettings |
| `/notifications` | `/notifications` | ConsolidatedNotifications |
| `/messages` | `/chat` | ConsolidatedChat |
| `/create-post` | `/create?type=post` | ConsolidatedCreate |
| `/create-event` | `/create?type=event` | ConsolidatedCreate |
| `/book-artist` | `/booking` | ConsolidatedBooking |
| `/communities` | `/communities` | ConsolidatedCommunity |
| `/community/:id` | `/communities/:id` | CommunityDetail |
| `/subscription` | `/subscription` | ConsolidatedSubscription |

## Benefits

1. **Reduced Maintenance**: 35 pages instead of 98
2. **Consistent UX**: All pages follow same patterns
3. **Better Performance**: Less code duplication
4. **Easier Updates**: Change once, applies everywhere
5. **Clearer Structure**: Logical organization
6. **Better DX**: Easier for developers to find things

## Migration Strategy

1. **Gradual Migration**: Keep old pages during transition
2. **Redirects**: Add redirects from old to new routes
3. **Testing**: Test each consolidated page thoroughly
4. **Rollback Plan**: Keep old pages until confident
5. **Documentation**: Update all docs and guides
