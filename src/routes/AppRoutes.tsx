import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Core pages (loaded immediately)
const Index = React.lazy(() => import('@/pages/EnhancedIndex').then(module => ({ default: module.EnhancedIndex })));
const SignIn = React.lazy(() => import('@/pages/SignIn'));
const Feed = React.lazy(() => import('@/pages/Feed'));
const Discover = React.lazy(() => import('@/pages/Discover'));
const About = React.lazy(() => import('@/pages/About'));

// Test component for debugging
const TestRouter = React.lazy(() => import('@/components/TestRouter'));
const NotificationSystemTest = React.lazy(() => import('@/components/NotificationSystemTest'));
const BookingSystemTest = React.lazy(() => import('@/components/BookingSystemTest'));
const ChatFlowTest = React.lazy(() => import('@/components/ChatFlowTest'));
const ChatDebugTest = React.lazy(() => import('@/components/ChatDebugTest'));
const SimpleChatTest = React.lazy(() => import('@/components/SimpleChatTest'));
const ChatTest = React.lazy(() => import('@/components/ChatTest'));

// Auth/Onboarding pages (grouped together)
const LocationSetup = React.lazy(() => import('@/pages/LocationSetup'));
const Onboarding = React.lazy(() => import('@/pages/Onboarding'));
const ArtistOnboarding = React.lazy(() => import('@/pages/ArtistOnboarding'));
const ForgotPassword = React.lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('@/pages/ResetPassword'));

// Community pages (grouped together)
const Community = React.lazy(() => import('@/pages/Community'));
const CommunityDetail = React.lazy(() => import('@/pages/CommunityDetail'));
const CreateDiscussion = React.lazy(() => import('@/pages/CreateDiscussion'));
const CreateGroup = React.lazy(() => import('@/pages/CreateGroup'));

// Event pages (grouped together)
const Events = React.lazy(() => import('@/pages/Events'));
const CreateEvent = React.lazy(() => import('@/pages/CreateEvent'));
const EventDetails = React.lazy(() => import('@/pages/EventDetails'));

// Artist pages (grouped together)
const BookArtist = React.lazy(() => import('@/pages/BookArtist'));
const ArtistDashboard = React.lazy(() => import('@/pages/ArtistDashboard'));
const ArtistProfile = React.lazy(() => import('@/pages/ArtistProfile'));

// User pages (grouped together)
const Profile = React.lazy(() => import('@/pages/Profile'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const UserProfile = React.lazy(() => import('@/pages/UserProfile'));
const NotificationSettings = React.lazy(() => import('@/pages/NotificationSettings'));
const NotificationsPage = React.lazy(() => import('@/pages/NotificationsPage'));
const UserDashboard = React.lazy(() => import('@/pages/UserDashboard'));

// Chat pages (grouped together)
const Chat = React.lazy(() => import('@/pages/Chat'));
const Messages = React.lazy(() => import('@/pages/Messages'));

// Content creation pages (grouped together)
const CreatePost = React.lazy(() => import('@/pages/CreatePost'));

// New Features pages
const LegalAssistant = React.lazy(() => import('@/pages/LegalAssistant'));
const LifeWish = React.lazy(() => import('@/pages/LifeWish'));
const VoiceControlDemo = React.lazy(() => import('@/pages/VoiceControlDemo'));
const News = React.lazy(() => import('@/pages/News'));

// Document type pages
const RentalAgreement = React.lazy(() => import('@/pages/RentalAgreement'));
const EmploymentContract = React.lazy(() => import('@/pages/EmploymentContract'));
const NDA = React.lazy(() => import('@/pages/NDA'));
const ServiceAgreement = React.lazy(() => import('@/pages/ServiceAgreement'));

// Error pages
const NotFound = React.lazy(() => import('@/pages/NotFound'));

// Configuration status page
const ConfigStatus = React.lazy(() => import('@/components/ConfigStatus'));

// Admin pages
const AdminDashboard = React.lazy(() => import('@/pages/admin/Dashboard'));
const UserManagement = React.lazy(() => import('@/pages/admin/UserManagement'));
const ContentModeration = React.lazy(() => import('@/pages/admin/ContentModeration'));
const Analytics = React.lazy(() => import('@/pages/admin/Analytics'));
const SystemSettings = React.lazy(() => import('@/pages/admin/SystemSettings'));

/**
 * Main application routes configuration
 */
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/config-status" element={<ConfigStatus />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/location" element={<ProtectedRoute><LocationSetup /></ProtectedRoute>} />
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
      <Route path="/create" element={<CreatePost />} />
      
      {/* New Features routes */}
      <Route path="/legal-assistant" element={<ProtectedRoute><LegalAssistant /></ProtectedRoute>} />
      <Route path="/life-wish" element={<ProtectedRoute><LifeWish /></ProtectedRoute>} />
      <Route path="/voice-demo" element={<VoiceControlDemo />} />
      <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
      
      {/* Document type routes */}
      <Route path="/rental-agreement" element={<ProtectedRoute><RentalAgreement /></ProtectedRoute>} />
      <Route path="/employment-contract" element={<ProtectedRoute><EmploymentContract /></ProtectedRoute>} />
      <Route path="/nda" element={<ProtectedRoute><NDA /></ProtectedRoute>} />
      <Route path="/service-agreement" element={<ProtectedRoute><ServiceAgreement /></ProtectedRoute>} />
      
      <Route path="/discover" element={<Discover />} />
      <Route path="/about" element={<About />} />
      <Route path="/community" element={<Community />} />
      <Route path="/community/:groupId" element={<CommunityDetail />} />
      <Route path="/community/create-discussion" element={<CreateDiscussion />} />
      <Route path="/community/create-group" element={<CreateGroup />} />
      <Route path="/events" element={<Events />} />
      <Route path="/event/:eventId" element={<EventDetails />} />
      <Route path="/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
      <Route path="/book-artist" element={<ProtectedRoute><BookArtist /></ProtectedRoute>} />
      <Route path="/artist-onboarding" element={<ProtectedRoute><ArtistOnboarding /></ProtectedRoute>} />
      
      {/* User routes */}
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/user/:userId" element={<UserProfile />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/notification-settings" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      
      {/* Artist routes */}
      <Route path="/artist/:artistId" element={<ArtistProfile />} />
      <Route path="/artist-dashboard" element={<ProtectedRoute><ArtistDashboard /></ProtectedRoute>} />
      
      {/* Chat routes */}
      <Route path="/chat/:conversationId" element={
        <ProtectedRoute>
          <div>
            {console.log("Chat route matched!")}
            <Chat />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      
      {/* Test chat route */}
      <Route path="/test-chat-route/:conversationId" element={<ChatTest />} />
      <Route path="/test-chat-unprotected/:conversationId" element={<Chat />} />
      <Route path="/debug-chat/:conversationId" element={
        <div style={{padding: '20px'}}>
          <h1>Debug Chat Route</h1>
          <p>This route is working!</p>
          <p>Conversation ID: {window.location.pathname.split('/').pop()}</p>
        </div>
      } />
      
      
      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
      <Route path="/admin/moderation" element={<ProtectedRoute><ContentModeration /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><SystemSettings /></ProtectedRoute>} />
      
      {/* Test routes - moved to end to avoid conflicts */}
      <Route path="/test-router" element={<TestRouter />} />
      <Route path="/test-notifications" element={<ProtectedRoute><NotificationSystemTest /></ProtectedRoute>} />
      <Route path="/test-booking" element={<ProtectedRoute><BookingSystemTest /></ProtectedRoute>} />
      <Route path="/test-chat" element={<ProtectedRoute><ChatFlowTest /></ProtectedRoute>} />
      <Route path="/debug-chat" element={<ProtectedRoute><ChatDebugTest /></ProtectedRoute>} />
      <Route path="/simple-chat-test" element={<ProtectedRoute><SimpleChatTest /></ProtectedRoute>} />
      
      {/* Debug route to catch all unmatched routes */}
      <Route path="/chat/*" element={
        <div style={{padding: '20px', backgroundColor: 'yellow'}}>
          <h1>Chat Wildcard Route Matched</h1>
          <p>URL: {window.location.href}</p>
          <p>Pathname: {window.location.pathname}</p>
          <p>This means the specific /chat/:conversationId route is not matching</p>
        </div>
      } />
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
