# Routes Consolidation Guide

## Updated Route Structure

### Authentication Routes
```tsx
// OLD
<Route path="/signin" element={<SignIn />} />
<Route path="/signup" element={<SignUp />} />

// NEW
<Route path="/auth" element={<ConsolidatedAuth />} />
// Usage: /auth?tab=signin or /auth?tab=signup
```

### Profile Routes
```tsx
// OLD
<Route path="/profile" element={<Profile />} />
<Route path="/profile/:userId" element={<UserProfile />} />
<Route path="/artist/:artistId" element={<ArtistProfile />} />

// NEW
<Route path="/profile/:userId?" element={<ConsolidatedProfile />} />
// Usage: /profile (own profile)
//        /profile/:userId (other user)
//        /profile/:userId?type=artist (artist profile)
```

### Settings Routes
```tsx
// OLD
<Route path="/settings" element={<Settings />} />
<Route path="/notification-settings" element={<NotificationSettings />} />

// NEW
<Route path="/settings" element={<ConsolidatedSettings />} />
// Usage: /settings?tab=account
//        /settings?tab=notifications
//        /settings?tab=privacy
```

### Create Routes
```tsx
// OLD
<Route path="/create-post" element={<CreatePost />} />
<Route path="/create-event" element={<CreateEvent />} />
<Route path="/create-group" element={<CreateGroup />} />
<Route path="/create-discussion" element={<CreateDiscussion />} />

// NEW
<Route path="/create" element={<ConsolidatedCreate />} />
// Usage: /create?type=post
//        /create?type=event
//        /create?type=group
//        /create?type=discussion
```

### Chat/Messages Routes
```tsx
// OLD
<Route path="/chat" element={<Chat />} />
<Route path="/messages" element={<EnhancedMessages />} />

// NEW
<Route path="/chat" element={<ConsolidatedChat />} />
<Route path="/chat/:conversationId" element={<ConsolidatedChat />} />
// Redirects: /messages → /chat
```

### Booking Routes
```tsx
// OLD
<Route path="/book-artist" element={<BookArtist />} />
<Route path="/book-artist-simple" element={<BookArtistSimple />} />

// NEW
<Route path="/booking" element={<ConsolidatedBooking />} />
<Route path="/booking/:artistId" element={<ConsolidatedBooking />} />
// Redirects: /book-artist → /booking
```

### Community Routes
```tsx
// OLD
<Route path="/community" element={<Community />} />
<Route path="/community/:id" element={<CommunityDetail />} />
<Route path="/community/:id/insights" element={<CommunityInsights />} />

// NEW
<Route path="/communities" element={<ConsolidatedCommunity />} />
<Route path="/communities/:id" element={<CommunityDetail />} />
// Usage: /communities/:id?tab=posts
//        /communities/:id?tab=insights
//        /communities/:id?tab=settings
// Redirects: /community → /communities
```

### Subscription Routes
```tsx
// OLD
<Route path="/subscription" element={<SubscriptionPage />} />
<Route path="/subscription-plans" element={<SubscriptionPlansPage />} />

// NEW
<Route path="/subscription" element={<ConsolidatedSubscription />} />
// Usage: /subscription?view=plans
//        /subscription?view=manage
// Redirects: /subscription-plans → /subscription?view=plans
```

## Complete Updated AppRoutes.tsx

```tsx
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<ConsolidatedIndex />} />
      
      {/* Auth */}
      <Route path="/auth" element={<ConsolidatedAuth />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Redirects for old auth routes */}
      <Route path="/signin" element={<Navigate to="/auth?tab=signin" replace />} />
      <Route path="/signup" element={<Navigate to="/auth?tab=signup" replace />} />
      
      {/* Main App */}
      <Route path="/feed" element={<ConsolidatedFeed />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/news" element={<News />} />
      
      {/* User */}
      <Route path="/profile/:userId?" element={<ConsolidatedProfile />} />
      <Route path="/settings" element={<ConsolidatedSettings />} />
      <Route path="/dashboard" element={<ConsolidatedDashboard />} />
      <Route path="/notifications" element={<ConsolidatedNotifications />} />
      
      {/* Chat */}
      <Route path="/chat" element={<ConsolidatedChat />} />
      <Route path="/chat/:conversationId" element={<ConsolidatedChat />} />
      <Route path="/messages" element={<Navigate to="/chat" replace />} />
      
      {/* Create */}
      <Route path="/create" element={<ConsolidatedCreate />} />
      <Route path="/create-post" element={<Navigate to="/create?type=post" replace />} />
      <Route path="/create-event" element={<Navigate to="/create?type=event" replace />} />
      
      {/* Events */}
      <Route path="/events" element={<ConsolidatedEvents />} />
      <Route path="/events/:eventId" element={<EventDetails />} />
      
      {/* Communities */}
      <Route path="/communities" element={<ConsolidatedCommunity />} />
      <Route path="/communities/:id" element={<CommunityDetail />} />
      <Route path="/community" element={<Navigate to="/communities" replace />} />
      
      {/* Booking */}
      <Route path="/booking" element={<ConsolidatedBooking />} />
      <Route path="/booking/:artistId" element={<ConsolidatedBooking />} />
      <Route path="/book-artist" element={<Navigate to="/booking" replace />} />
      
      {/* Artist */}
      <Route path="/artist" element={<ConsolidatedArtist />} />
      
      {/* Features */}
      <Route path="/public-square" element={<PublicSquare />} />
      <Route path="/polls" element={<Polls />} />
      <Route path="/legal-assistant" element={<LegalAssistant />} />
      <Route path="/life-wish" element={<LifeWish />} />
      <Route path="/businesses" element={<LocalBusinesses />} />
      
      {/* Subscription */}
      <Route path="/subscription" element={<ConsolidatedSubscription />} />
      <Route path="/subscription-plans" element={<Navigate to="/subscription?view=plans" replace />} />
      <Route path="/subscription-success" element={<SubscriptionSuccess />} />
      <Route path="/subscription-cancel" element={<SubscriptionCancel />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-cancel" element={<PaymentCancel />} />
      
      {/* Admin */}
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin/*" element={
        <AdminRoute>
          <ConsolidatedAdmin />
        </AdminRoute>
      } />
      
      {/* Utility */}
      <Route path="/about" element={<About />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/location-setup" element={<LocationSetup />} />
      <Route path="/post/:postId" element={<PostDetailPage />} />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
```

## Migration Checklist

### Step 1: Update Navigation Links
- [ ] Update all `Link` components to use new routes
- [ ] Update all `navigate()` calls to use new routes
- [ ] Update all `redirect()` calls to use new routes

### Step 2: Add Redirects
- [ ] Add `<Navigate>` components for old routes
- [ ] Test all redirects work correctly
- [ ] Update sitemap with new routes

### Step 3: Update Internal Links
- [ ] Update sidebar navigation links
- [ ] Update header navigation links
- [ ] Update footer links
- [ ] Update breadcrumb links

### Step 4: Testing
- [ ] Test all routes load correctly
- [ ] Test redirects work
- [ ] Test deep linking with query params
- [ ] Test browser back/forward
- [ ] Test bookmarks/saved links

### Step 5: Documentation
- [ ] Update README with new route structure
- [ ] Update API documentation
- [ ] Create migration guide for users
- [ ] Update developer documentation

## Benefits

1. **Cleaner URLs**: `/create?type=post` vs `/create-post`
2. **Fewer Routes**: 35 routes vs 98 routes
3. **Easier Maintenance**: Change one component vs many
4. **Better SEO**: Consistent URL structure
5. **Easier Testing**: Fewer route combinations
