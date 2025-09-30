# Page Deprecation Plan

## Overview
This document tracks pages that have been replaced by consolidated versions and are marked for deprecation.

## Deprecation Status: Phase 1 - Mark for Removal

### ✅ Already Consolidated (Ready for Deprecation)

#### Auth Pages (2 files)
- [ ] `src/pages/SignIn.tsx` → Use `ConsolidatedAuth.tsx` with `?tab=signin`
- [ ] `src/pages/SignUp.tsx` → Use `ConsolidatedAuth.tsx` with `?tab=signup`

**Status**: Redirects in place ✅
**Safe to remove after**: Testing redirects

#### Profile Pages (2 files)
- [ ] `src/pages/Profile.tsx` → Use `ConsolidatedProfile.tsx`
- [ ] `src/pages/UserProfile.tsx` → Use `ConsolidatedProfile.tsx`

**Status**: Routes updated ✅
**Safe to remove after**: ConsolidatedProfile handles all cases

#### Artist Profile (1 file)
- [ ] `src/pages/ArtistProfile.tsx` → Use `ConsolidatedProfile.tsx?type=artist` or `ConsolidatedArtist.tsx`

**Status**: Routes updated ✅

#### Create Pages (4 files)
- [ ] `src/pages/CreatePost.tsx` → Use `ConsolidatedCreate.tsx?type=post`
- [ ] `src/pages/CreateEvent.tsx` → Use `ConsolidatedCreate.tsx?type=event`
- [ ] `src/pages/CreateGroup.tsx` → Use `ConsolidatedCreate.tsx?type=group`
- [ ] `src/pages/CreateDiscussion.tsx` → Use `ConsolidatedCreate.tsx?type=discussion`

**Status**: Redirects in place ✅

#### Chat/Messages Pages (3 files)
- [ ] `src/pages/Chat.tsx` → Use `ConsolidatedChat.tsx`
- [ ] `src/pages/EnhancedChat.tsx` → Use `ConsolidatedChat.tsx`
- [ ] `src/pages/EnhancedMessages.tsx` → Use `ConsolidatedChat.tsx`

**Status**: Redirect in place (/messages → /chat) ✅

#### Booking Pages (3 files)
- [ ] `src/pages/BookArtist.tsx` → Use `ConsolidatedBooking.tsx`
- [ ] `src/pages/BookArtistSimple.tsx` → Use `ConsolidatedBooking.tsx`
- [ ] `src/pages/BookArtistTest.tsx` → Use `ConsolidatedBooking.tsx`

**Status**: Redirects in place ✅

#### Artist Pages (2 files)
- [ ] `src/pages/ArtistOnboarding.tsx` → Use `ConsolidatedArtist.tsx?view=onboarding`
- [ ] `src/pages/EnhancedArtistMarketplace.tsx` → Use `ConsolidatedArtist.tsx`

**Status**: Redirects in place ✅

#### Community Pages (5 files)
- [ ] `src/pages/Community.tsx` → Use `ConsolidatedCommunity.tsx`
- [ ] `src/pages/CommunityPlatform.tsx` → Use `ConsolidatedCommunity.tsx`
- [ ] `src/pages/CommunityInsights.tsx` → Use `ConsolidatedCommunityInsights.tsx`
- [ ] `src/pages/CommunityInsightsSimple.tsx` → Use `ConsolidatedCommunityInsights.tsx`
- [ ] `src/pages/CommunityTransparency.tsx` → Merge into `CommunityDetail.tsx`

**Status**: Redirect in place (/community → /communities) ✅

#### Settings Pages (1 file)
- [ ] `src/pages/NotificationSettings.tsx` → Use `ConsolidatedSettings.tsx?tab=notifications`

**Status**: Merged into ConsolidatedSettings ✅

#### Notifications Pages (2 files)
- [ ] `src/pages/Notifications.tsx` → Use `ConsolidatedNotifications.tsx`
- [ ] `src/pages/NotificationsPage.tsx` → Use `ConsolidatedNotifications.tsx`

**Status**: Route updated ✅

#### Subscription Pages (2 files)
- [ ] `src/pages/SubscriptionPage.tsx` → Use `ConsolidatedSubscription.tsx`
- [ ] `src/pages/SubscriptionPlansPage.tsx` → Use `ConsolidatedSubscription.tsx?view=plans`

**Status**: Redirects in place ✅

#### Onboarding Pages (2 files)
- [ ] `src/pages/Onboarding.tsx` → Use `ConsolidatedOnboarding.tsx`
- [ ] `src/pages/PrivacyFirstOnboarding.tsx` → Use `ConsolidatedOnboarding.tsx?focus=privacy`

**Status**: Redirect in place ✅

#### Legal Template Pages (4 files)
- [ ] `src/pages/NDA.tsx` → Use `ConsolidatedLegal.tsx` with template type
- [ ] `src/pages/EmploymentContract.tsx` → Use `ConsolidatedLegal.tsx`
- [ ] `src/pages/RentalAgreement.tsx` → Use `ConsolidatedLegal.tsx`
- [ ] `src/pages/ServiceAgreement.tsx` → Use `ConsolidatedLegal.tsx`

**Status**: Should be consolidated ⚠️

### 🧪 Test/Demo Pages (Move to /dev)

These pages should be moved behind a development feature flag:

- [ ] `src/pages/TestButtons.tsx`
- [ ] `src/pages/ConsolidatedTest.tsx`
- [ ] `src/pages/CivicEngagementTest.tsx`
- [ ] `src/pages/MonetizationTest.tsx`
- [ ] `src/pages/LayoutDemo.tsx`
- [ ] `src/pages/FeatureShowcase.tsx`
- [ ] `src/pages/EnhancedSearchDemo.tsx`
- [ ] `src/pages/VoiceControlDemo.tsx`
- [ ] `src/pages/PerformancePage.tsx`

**Action**: Create `/dev` route accessible only in development mode or with feature flag

### ⚠️ Pages Needing Review

These pages may have dependencies or special cases:

- `src/pages/CommunitySettings.tsx` - Check if used in CommunityDetail
- `src/pages/PublicSquareSubscription.tsx` - Verify if different from main subscription
- `src/pages/FollowSystem.tsx` - Check if standalone page or component

## Deprecation Process

### Phase 1: Mark for Deprecation (Current) ✅
1. Add deprecation comments to file headers
2. Update documentation
3. Ensure redirects are in place

### Phase 2: Testing Period (1-2 weeks)
1. Monitor analytics for old route usage
2. Test all redirect paths
3. Verify no functionality lost
4. Check for internal component imports

### Phase 3: Gradual Removal
1. Remove one category at a time
2. Monitor for errors
3. Keep backups for 1 release cycle

### Phase 4: Cleanup
1. Remove redirect routes after 2 releases
2. Update documentation
3. Remove from git history if needed

## Safe Removal Checklist

Before removing any file:
- [ ] Confirm redirect is working
- [ ] Check for direct imports in other files
- [ ] Verify no hardcoded links in components
- [ ] Test user journey through old URL
- [ ] Check analytics for usage (if available)
- [ ] Ensure consolidated version has all features
- [ ] Create backup/archive
- [ ] Update documentation

## Estimated Timeline

- **Week 1-2**: Testing redirects and consolidated pages
- **Week 3**: Remove auth pages (low risk)
- **Week 4**: Remove create/booking pages
- **Week 5**: Remove community/chat pages
- **Week 6**: Remove remaining pages
- **Week 7**: Cleanup redirects
- **Week 8**: Final audit and documentation

## Total Files to Remove: ~40 files

### By Category:
- Auth: 2 files
- Profile: 3 files
- Create: 4 files
- Chat: 3 files
- Booking: 3 files
- Artist: 3 files
- Community: 5 files
- Settings/Notifications: 3 files
- Subscription: 2 files
- Onboarding: 2 files
- Legal: 4 files
- Test/Demo: 9 files (move to /dev)
- Review needed: 3 files

## Benefits

- **Codebase size**: Reduce by ~8,000 lines
- **Maintenance**: 40 fewer files to maintain
- **Consistency**: Single source of truth
- **Performance**: Better code splitting
- **DX**: Easier to find things

## Risks & Mitigation

### Risk: Breaking existing bookmarks
**Mitigation**: Keep redirects for 6+ months

### Risk: Missing functionality
**Mitigation**: Thorough testing before removal

### Risk: Component dependencies
**Mitigation**: Search codebase for imports before removal

### Risk: SEO impact
**Mitigation**: Proper 301 redirects, update sitemap

## Notes

- All redirects use `replace` to avoid browser history pollution
- Query parameters are preserved where applicable
- Consolidated pages handle all variants through props/query params
- No user-facing functionality should be lost
