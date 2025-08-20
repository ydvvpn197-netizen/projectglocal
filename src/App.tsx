import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { lazy } from "react";
import { LazyLoader, PageLoader } from "./components/LazyLoader";
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
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <LazyLoader fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/location" element={<ProtectedRoute><LocationSetup /></ProtectedRoute>} />
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/feed" element={<Feed />} />
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
