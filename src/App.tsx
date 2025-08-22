import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
const { lazy } = React;
import { LazyLoader, PageLoader } from "./components/LazyLoader";
import { app } from '@/config/environment';
// import { useRoutePreloader } from "./hooks/useRoutePreloader";

// Lazy load pages with better chunking
// Core pages (loaded immediately)
const Index = lazy(() => import("./pages/Index"));
const SignIn = lazy(() => import("./pages/SignIn"));
const Feed = lazy(() => import("./pages/Feed"));
const Discover = lazy(() => import("./pages/Discover"));
const About = lazy(() => import("./pages/About"));

// Auth/Onboarding pages (grouped together)
const LocationSetup = lazy(() => import("./pages/LocationSetup"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const ArtistOnboarding = lazy(() => import("./pages/ArtistOnboarding"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// Community pages (grouped together)
const Community = lazy(() => import("./pages/Community"));
const CreateDiscussion = lazy(() => import("./pages/CreateDiscussion"));
const CreateGroup = lazy(() => import("./pages/CreateGroup"));

// Event pages (grouped together)
const Events = lazy(() => import("./pages/Events"));
const CreateEvent = lazy(() => import("./pages/CreateEvent"));

// Artist pages (grouped together)
const BookArtist = lazy(() => import("./pages/BookArtist"));
const ArtistDashboard = lazy(() => import("./pages/ArtistDashboard"));
const ArtistProfile = lazy(() => import("./pages/ArtistProfile"));

// User pages (grouped together)
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));

// Chat pages (grouped together)
const Chat = lazy(() => import("./pages/Chat"));
const Messages = lazy(() => import("./pages/Messages"));

// Content creation pages (grouped together)
const CreatePost = lazy(() => import("./pages/CreatePost"));

// Error pages
const NotFound = lazy(() => import("./pages/NotFound"));

// Test pages
const LocationTest = lazy(() => import("./pages/LocationTest"));
const NewsFeed = lazy(() => import("./pages/NewsFeed"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const ContentModeration = lazy(() => import("./pages/admin/ContentModeration"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const SystemSettings = lazy(() => import("./pages/admin/SystemSettings"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App = () => {
  // Initialize route preloader - temporarily disabled to fix infinite reload
  // useRoutePreloader();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={app.baseUrl}>
            <LazyLoader fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/location" element={<ProtectedRoute><LocationSetup /></ProtectedRoute>} />
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                <Route path="/create" element={<CreatePost />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/about" element={<About />} />
                <Route path="/community" element={<Community />} />
                <Route path="/community/create-discussion" element={<CreateDiscussion />} />
                <Route path="/community/create-group" element={<CreateGroup />} />
                <Route path="/events" element={<Events />} />
                <Route path="/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
                <Route path="/book-artist" element={<ProtectedRoute><BookArtist /></ProtectedRoute>} />
                <Route path="/artist-onboarding" element={<ProtectedRoute><ArtistOnboarding /></ProtectedRoute>} />
                <Route path="/artist-dashboard" element={<ProtectedRoute><ArtistDashboard /></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                <Route path="/chat/:conversationId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="/artist/:artistId" element={<ArtistProfile />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/location-test" element={<ProtectedRoute><LocationTest /></ProtectedRoute>} />
                <Route path="/news" element={<NewsFeed />} />
                
                {/* Admin routes */}
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
                <Route path="/admin/moderation" element={<ProtectedRoute><ContentModeration /></ProtectedRoute>} />
                <Route path="/admin/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute><SystemSettings /></ProtectedRoute>} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </LazyLoader>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
