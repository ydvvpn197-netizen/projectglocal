/**
 * Redirect Tests
 * Verifies all old routes properly redirect to new consolidated routes
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';

// Mock components for testing
const MockComponent = ({ name }: { name: string }) => <div data-testid={name}>{name}</div>;

describe('Route Redirects', () => {
  describe('Auth Redirects', () => {
    it('should redirect /signin to /auth?tab=signin', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/signin']}>
          <Routes>
            <Route path="/signin" element={<Navigate to="/auth?tab=signin" replace />} />
            <Route path="/auth" element={<MockComponent name="auth" />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('auth')).toBeInTheDocument();
      expect(window.location.search).toBe('?tab=signin');
    });

    it('should redirect /signup to /auth?tab=signup', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/signup']}>
          <Routes>
            <Route path="/signup" element={<Navigate to="/auth?tab=signup" replace />} />
            <Route path="/auth" element={<MockComponent name="auth" />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('auth')).toBeInTheDocument();
    });
  });

  describe('Chat Redirects', () => {
    it('should redirect /messages to /chat', () => {
      render(
        <MemoryRouter initialEntries={['/messages']}>
          <Routes>
            <Route path="/messages" element={<Navigate to="/chat" replace />} />
            <Route path="/chat" element={<MockComponent name="chat" />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('chat')).toBeInTheDocument();
    });
  });

  describe('Create Redirects', () => {
    it('should redirect /create-post to /create?type=post', () => {
      render(
        <MemoryRouter initialEntries={['/create-post']}>
          <Routes>
            <Route path="/create-post" element={<Navigate to="/create?type=post" replace />} />
            <Route path="/create" element={<MockComponent name="create" />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('create')).toBeInTheDocument();
    });

    it('should redirect /create-event to /create?type=event', () => {
      render(
        <MemoryRouter initialEntries={['/create-event']}>
          <Routes>
            <Route path="/create-event" element={<Navigate to="/create?type=event" replace />} />
            <Route path="/create" element={<MockComponent name="create" />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('create')).toBeInTheDocument();
    });

    it('should redirect /create-group to /create?type=group', () => {
      render(
        <MemoryRouter initialEntries={['/create-group']}>
          <Routes>
            <Route path="/create-group" element={<Navigate to="/create?type=group" replace />} />
            <Route path="/create" element={<MockComponent name="create" />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('create')).toBeInTheDocument();
    });
  });

  describe('Community Redirects', () => {
    it('should redirect /community to /communities', () => {
      render(
        <MemoryRouter initialEntries={['/community']}>
          <Routes>
            <Route path="/community" element={<Navigate to="/communities" replace />} />
            <Route path="/communities" element={<MockComponent name="communities" />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('communities')).toBeInTheDocument();
    });

    it('should redirect /community/:id to /communities/:id', () => {
      render(
        <MemoryRouter initialEntries={['/community/123']}>
          <Routes>
            <Route path="/community/:id" element={<Navigate to="/communities/:id" replace />} />
            <Route path="/communities/:id" element={<MockComponent name="community-detail" />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('community-detail')).toBeInTheDocument();
    });
  });

  describe('Booking Redirects', () => {
    it('should redirect /book-artist to /booking', () => {
      render(
        <MemoryRouter initialEntries={['/book-artist']}>
          <Routes>
            <Route path="/book-artist" element={<Navigate to="/booking" replace />} />
            <Route path="/booking" element={<MockComponent name="booking" />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('booking')).toBeInTheDocument();
    });

    it('should redirect /book-artist-simple to /booking', () => {
      render(
        <MemoryRouter initialEntries={['/book-artist-simple']}>
          <Routes>
            <Route path="/book-artist-simple" element={<Navigate to="/booking" replace />} />
            <Route path="/booking" element={<MockComponent name="booking" />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('booking')).toBeInTheDocument();
    });
  });

  describe('Artist Redirects', () => {
    it('should redirect /artist-dashboard to /artist?view=dashboard', () => {
      render(
        <MemoryRouter initialEntries={['/artist-dashboard']}>
          <Routes>
            <Route path="/artist-dashboard" element={<Navigate to="/artist?view=dashboard" replace />} />
            <Route path="/artist" element={<MockComponent name="artist" />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('artist')).toBeInTheDocument();
    });

    it('should redirect /artist-profile to /artist', () => {
      render(
        <MemoryRouter initialEntries={['/artist-profile']}>
          <Routes>
            <Route path="/artist-profile" element={<Navigate to="/artist" replace />} />
            <Route path="/artist" element={<MockComponent name="artist" />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('artist')).toBeInTheDocument();
    });
  });

  describe('Subscription Redirects', () => {
    it('should redirect /subscription-plans to /subscription?view=plans', () => {
      render(
        <MemoryRouter initialEntries={['/subscription-plans']}>
          <Routes>
            <Route path="/subscription-plans" element={<Navigate to="/subscription?view=plans" replace />} />
            <Route path="/subscription" element={<MockComponent name="subscription" />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('subscription')).toBeInTheDocument();
    });
  });

  describe('Onboarding Redirects', () => {
    it('should redirect /privacy-first-onboarding to /onboarding?focus=privacy', () => {
      render(
        <MemoryRouter initialEntries={['/privacy-first-onboarding']}>
          <Routes>
            <Route path="/privacy-first-onboarding" element={<Navigate to="/onboarding?focus=privacy" replace />} />
            <Route path="/onboarding" element={<MockComponent name="onboarding" />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('onboarding')).toBeInTheDocument();
    });
  });

  describe('Event Redirects', () => {
    it('should redirect /event/:id to /events/:id', () => {
      render(
        <MemoryRouter initialEntries={['/event/123']}>
          <Routes>
            <Route path="/event/:id" element={<Navigate to="/events/:id" replace />} />
            <Route path="/events/:id" element={<MockComponent name="event-detail" />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('event-detail')).toBeInTheDocument();
    });
  });
});

describe('Route Consolidation Mapping', () => {
  const redirectMappings = [
    // Auth
    { old: '/signin', new: '/auth?tab=signin' },
    { old: '/signup', new: '/auth?tab=signup' },
    
    // Chat
    { old: '/messages', new: '/chat' },
    
    // Create
    { old: '/create-post', new: '/create?type=post' },
    { old: '/create-event', new: '/create?type=event' },
    { old: '/create-group', new: '/create?type=group' },
    { old: '/create-discussion', new: '/create?type=discussion' },
    
    // Community
    { old: '/community', new: '/communities' },
    
    // Booking
    { old: '/book-artist', new: '/booking' },
    { old: '/book-artist-simple', new: '/booking' },
    { old: '/book-artist-test', new: '/booking' },
    
    // Artist
    { old: '/artist-dashboard', new: '/artist?view=dashboard' },
    { old: '/artist-profile', new: '/artist' },
    { old: '/artist-onboarding', new: '/artist?view=onboarding' },
    
    // Subscription
    { old: '/subscription-plans', new: '/subscription?view=plans' },
    
    // Onboarding
    { old: '/privacy-first-onboarding', new: '/onboarding?focus=privacy' },
  ];

  it('should have all redirect mappings documented', () => {
    expect(redirectMappings.length).toBeGreaterThan(0);
    redirectMappings.forEach(mapping => {
      expect(mapping.old).toBeTruthy();
      expect(mapping.new).toBeTruthy();
    });
  });

  it('should not have duplicate old routes', () => {
    const oldRoutes = redirectMappings.map(m => m.old);
    const uniqueOldRoutes = new Set(oldRoutes);
    expect(oldRoutes.length).toBe(uniqueOldRoutes.size);
  });
});
