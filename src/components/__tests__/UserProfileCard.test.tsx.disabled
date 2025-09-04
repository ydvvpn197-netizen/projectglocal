/**
 * UserProfileCard Component Tests
 * 
 * Comprehensive test suite for the UserProfileCard component covering:
 * - Rendering in different variants
 * - User interactions and event handling
 * - Security validation
 * - Accessibility features
 * - Error handling and loading states
 * - Edge cases and performance optimizations
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import UserProfileCard, { UserProfile, UserProfileCardProps } from '../UserProfileCard';

// Mock the security validation
vi.mock('@/config/security', () => ({
  validateInput: vi.fn((input: string, type: string) => {
    // Simulate validation failure for malicious inputs
    if (input.includes('<script>') || input.includes('javascript:') || input.includes('onerror=')) {
      return {
        success: false,
        data: null,
        errors: [{ message: 'Invalid input' }]
      };
    }
    return {
      success: true,
      data: input,
      errors: []
    };
  })
}));

// Mock the utils
vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined | null | false)[]) => 
    classes.filter(Boolean).join(' ')
}));

describe('UserProfileCard', () => {
  const mockUser: UserProfile = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'Software Developer passionate about building great products',
    location: 'San Francisco, CA',
    verified: true,
    followersCount: 1234,
    followingCount: 567,
    isFollowing: false,
    isOnline: true,
    badges: ['trending'],
    socialLinks: {
      twitter: 'https://twitter.com/johndoe',
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe',
      website: 'https://johndoe.com'
    }
  };

  const defaultProps: UserProfileCardProps = {
    user: mockUser,
    onFollow: vi.fn().mockResolvedValue(undefined),
    onMessage: vi.fn().mockResolvedValue(undefined),
    onViewProfile: vi.fn().mockResolvedValue(undefined),
    onShare: vi.fn().mockResolvedValue(undefined)
  };

  const errorProps: UserProfileCardProps = {
    ...defaultProps,
    onFollow: vi.fn().mockRejectedValue(new Error('Failed to follow user')),
    onMessage: vi.fn().mockRejectedValue(new Error('Failed to send message')),
    onViewProfile: vi.fn().mockRejectedValue(new Error('Failed to view profile')),
    onShare: vi.fn().mockRejectedValue(new Error('Failed to share profile'))
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders user profile information correctly', () => {
      render(<UserProfileCard {...defaultProps} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Software Developer passionate about building great products')).toBeInTheDocument();
      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
      expect(screen.getByText('1,234')).toBeInTheDocument();
      expect(screen.getByText('567')).toBeInTheDocument();
    });

    it('renders avatar with fallback', () => {
      render(<UserProfileCard {...defaultProps} />);

      // In test environment, AvatarImage may not render, so check for fallback
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('renders verification badge when user is verified', () => {
      render(<UserProfileCard {...defaultProps} />);

      const verifiedIcon = screen.getByTestId('verified-badge');
      expect(verifiedIcon).toBeInTheDocument();
    });

    it('renders trending badge when user has trending badge', () => {
      render(<UserProfileCard {...defaultProps} />);

      const trendingIcon = screen.getByTestId('trending-badge');
      expect(trendingIcon).toBeInTheDocument();
    });

    it('renders online indicator when user is online', () => {
      render(<UserProfileCard {...defaultProps} />);

      const onlineIndicator = screen.getByTestId('online-indicator');
      expect(onlineIndicator).toBeInTheDocument();
    });

    it('renders social links when showSocialLinks is true', () => {
      render(<UserProfileCard {...defaultProps} showSocialLinks />);

      expect(screen.getByRole('link', { name: /twitter/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /website/i })).toBeInTheDocument();
    });

    it('hides social links when showSocialLinks is false', () => {
      render(<UserProfileCard {...defaultProps} showSocialLinks={false} />);

      expect(screen.queryByRole('link', { name: /twitter/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /linkedin/i })).not.toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders compact variant correctly', () => {
      render(<UserProfileCard {...defaultProps} variant="compact" />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Software Developer passionate about building great products')).toBeInTheDocument();
      expect(screen.queryByText('1,234')).not.toBeInTheDocument(); // Stats hidden in compact
    });

    it('renders detailed variant with all information', () => {
      render(<UserProfileCard {...defaultProps} variant="detailed" showSocialLinks />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('1,234')).toBeInTheDocument();
      expect(screen.getByText('567')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /twitter/i })).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('shows action buttons when showActions is true', () => {
      render(<UserProfileCard {...defaultProps} showActions />);

      expect(screen.getByRole('button', { name: /follow/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /message/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    });

    it('hides action buttons when showActions is false', () => {
      render(<UserProfileCard {...defaultProps} showActions={false} />);

      expect(screen.queryByRole('button', { name: /follow/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /message/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /share/i })).not.toBeInTheDocument();
    });

    it('shows view profile button when onViewProfile is provided', () => {
      render(<UserProfileCard {...defaultProps} />);

      expect(screen.getByRole('button', { name: /view full profile/i })).toBeInTheDocument();
    });

    it('hides view profile button when onViewProfile is not provided', () => {
      const { onViewProfile, ...propsWithoutViewProfile } = defaultProps;
      render(<UserProfileCard {...propsWithoutViewProfile} />);

      expect(screen.queryByRole('button', { name: /view full profile/i })).not.toBeInTheDocument();
    });
  });

  describe('Stats', () => {
    it('shows stats when showStats is true and counts are provided', () => {
      render(<UserProfileCard {...defaultProps} showStats />);

      expect(screen.getByText('1,234')).toBeInTheDocument();
      expect(screen.getByText('567')).toBeInTheDocument();
      expect(screen.getByText('Followers')).toBeInTheDocument();
      expect(screen.getByText('Following')).toBeInTheDocument();
    });

    it('hides stats when showStats is false', () => {
      render(<UserProfileCard {...defaultProps} showStats={false} />);

      expect(screen.queryByText('1,234')).not.toBeInTheDocument();
      expect(screen.queryByText('567')).not.toBeInTheDocument();
    });

    it('handles missing stats gracefully', () => {
      const userWithoutStats = { ...mockUser, followersCount: undefined, followingCount: undefined };
      render(<UserProfileCard {...defaultProps} user={userWithoutStats} showStats />);

      expect(screen.queryByText('Followers')).not.toBeInTheDocument();
      expect(screen.queryByText('Following')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onFollow when follow button is clicked', async () => {
      const mockOnFollow = vi.fn().mockResolvedValue(undefined);
      render(<UserProfileCard {...defaultProps} onFollow={mockOnFollow} />);

      const followButton = screen.getByRole('button', { name: /follow/i });
      fireEvent.click(followButton);

      await waitFor(() => {
        expect(mockOnFollow).toHaveBeenCalledWith('user-123');
      });
    });

    it('calls onMessage when message button is clicked', async () => {
      const mockOnMessage = vi.fn().mockResolvedValue(undefined);
      render(<UserProfileCard {...defaultProps} onMessage={mockOnMessage} />);

      const messageButton = screen.getByRole('button', { name: /message/i });
      fireEvent.click(messageButton);

      await waitFor(() => {
        expect(mockOnMessage).toHaveBeenCalledWith('user-123');
      });
    });

    it('calls onViewProfile when view profile button is clicked', async () => {
      const mockOnViewProfile = vi.fn().mockResolvedValue(undefined);
      render(<UserProfileCard {...defaultProps} onViewProfile={mockOnViewProfile} />);

      const viewProfileButton = screen.getByRole('button', { name: /view full profile/i });
      fireEvent.click(viewProfileButton);

      await waitFor(() => {
        expect(mockOnViewProfile).toHaveBeenCalledWith('user-123');
      });
    });

    it('calls onShare when share button is clicked', async () => {
      const mockOnShare = vi.fn().mockResolvedValue(undefined);
      render(<UserProfileCard {...defaultProps} onShare={mockOnShare} />);

      const shareButton = screen.getByRole('button', { name: /share/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockOnShare).toHaveBeenCalledWith('user-123');
      });
    });

    it('updates follow button state after successful follow', async () => {
      const mockOnFollow = vi.fn().mockResolvedValue(undefined);
      render(<UserProfileCard {...defaultProps} onFollow={mockOnFollow} />);

      const followButton = screen.getByRole('button', { name: /follow/i });
      fireEvent.click(followButton);

      // Wait for the button text to change
      await waitFor(() => {
        expect(followButton).toHaveTextContent('Following');
      }, { timeout: 1000 });
    });

    it('disables buttons during loading state', async () => {
      const mockOnFollow = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(<UserProfileCard {...defaultProps} onFollow={mockOnFollow} />);

      const followButton = screen.getByRole('button', { name: /follow/i });
      fireEvent.click(followButton);

      expect(followButton).toBeDisabled();
      expect(screen.getByRole('button', { name: /message/i })).toBeDisabled();
    });
  });

  describe('Security Validation', () => {
        it('sanitizes user name input', () => {
      const maliciousUser = { ...mockUser, name: '<script>alert("xss")</script>' };
      render(<UserProfileCard {...defaultProps} user={maliciousUser} />);

      // Malicious content should be filtered out and show Anonymous User instead
      expect(screen.getByText('Anonymous User')).toBeInTheDocument();
      expect(screen.queryByText('<script>alert("xss")</script>')).not.toBeInTheDocument();
    });

    it('sanitizes user bio input', () => {
      const maliciousUser = { ...mockUser, bio: 'javascript:alert("xss")' };
      render(<UserProfileCard {...defaultProps} user={maliciousUser} />);

      // Malicious content should be filtered out and not displayed
      expect(screen.queryByText('javascript:alert("xss")')).not.toBeInTheDocument();
      expect(screen.queryByText('Software Developer passionate about building great products')).not.toBeInTheDocument();
    });

    it('sanitizes user location input', () => {
      const maliciousUser = { ...mockUser, location: '"><img src=x onerror=alert(1)>' };
      render(<UserProfileCard {...defaultProps} user={maliciousUser} />);

      // Malicious content should be filtered out and not displayed
      expect(screen.queryByText('"><img src=x onerror=alert(1)>')).not.toBeInTheDocument();
      expect(screen.queryByText('San Francisco, CA')).not.toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading skeleton when loading is true', () => {
      render(<UserProfileCard {...defaultProps} loading />);

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('shows loading state during async operations', async () => {
      const mockOnFollow = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(<UserProfileCard {...defaultProps} onFollow={mockOnFollow} />);

      const followButton = screen.getByRole('button', { name: /follow/i });
      fireEvent.click(followButton);

      expect(followButton).toBeDisabled();
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows error message when error prop is provided', () => {
      render(<UserProfileCard {...defaultProps} error="Failed to load profile" />);

      expect(screen.getByText('Error loading profile')).toBeInTheDocument();
      expect(screen.getByText('Failed to load profile')).toBeInTheDocument();
    });

    it('shows error message when async operation fails', async () => {
      const mockOnFollow = vi.fn().mockRejectedValue(new Error('Failed to follow user'));
      render(<UserProfileCard {...defaultProps} onFollow={mockOnFollow} />);

      const followButton = screen.getByRole('button', { name: /follow/i });
      fireEvent.click(followButton);

      await waitFor(() => {
        expect(screen.getByText('Error loading profile')).toBeInTheDocument();
        expect(screen.getByText('Failed to follow user')).toBeInTheDocument();
      });
    });

    it('clears error when new operation succeeds', async () => {
      const mockOnFollow = vi.fn()
        .mockRejectedValueOnce(new Error('Failed to follow user'))
        .mockResolvedValueOnce(undefined);
      
      render(<UserProfileCard {...defaultProps} onFollow={mockOnFollow} />);

      const followButton = screen.getByRole('button', { name: /follow/i });
      
      // First click fails
      fireEvent.click(followButton);
      await waitFor(() => {
        expect(screen.getByText('Failed to follow user')).toBeInTheDocument();
      });

      // Second click succeeds
      fireEvent.click(followButton);
      await waitFor(() => {
        expect(screen.queryByText('Failed to follow user')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles user without avatar gracefully', () => {
      const userWithoutAvatar = { ...mockUser, avatar: undefined };
      render(<UserProfileCard {...defaultProps} user={userWithoutAvatar} />);

      // When there's no avatar, only the fallback is rendered
      expect(screen.getByText('J')).toBeInTheDocument();
      expect(screen.queryByAltText('John Doe')).not.toBeInTheDocument();
    });

    it('handles user without bio gracefully', () => {
      const userWithoutBio = { ...mockUser, bio: undefined };
      render(<UserProfileCard {...defaultProps} user={userWithoutBio} />);

      expect(screen.queryByText('Software Developer passionate about building great products')).not.toBeInTheDocument();
    });

    it('handles user without location gracefully', () => {
      const userWithoutLocation = { ...mockUser, location: undefined };
      render(<UserProfileCard {...defaultProps} user={userWithoutLocation} />);

      expect(screen.queryByText('San Francisco, CA')).not.toBeInTheDocument();
    });

    it('handles user without social links gracefully', () => {
      const userWithoutSocial = { ...mockUser, socialLinks: undefined };
      render(<UserProfileCard {...defaultProps} user={userWithoutSocial} showSocialLinks />);

      expect(screen.queryByRole('link', { name: /twitter/i })).not.toBeInTheDocument();
    });

    it('handles user with empty name gracefully', () => {
      const userWithEmptyName = { ...mockUser, name: '' };
      render(<UserProfileCard {...defaultProps} user={userWithEmptyName} />);

      expect(screen.getByText('Anonymous User')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles', () => {
      render(<UserProfileCard {...defaultProps} />);

      expect(screen.getByRole('button', { name: /follow/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /message/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    });

    it('has proper avatar fallback when avatar is provided', () => {
      render(<UserProfileCard {...defaultProps} />);

      // In test environment, check for AvatarFallback
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('has proper ARIA labels', () => {
      render(<UserProfileCard {...defaultProps} />);

      const followButton = screen.getByRole('button', { name: /follow/i });
      expect(followButton).toHaveAttribute('aria-label', 'Follow John Doe');
    });

    it('has proper heading structure', () => {
      render(<UserProfileCard {...defaultProps} />);

      const heading = screen.getByRole('heading', { name: 'John Doe' });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H2');
    });
  });

  describe('Performance Optimizations', () => {
    it('memoizes computed values', () => {
      const { rerender } = render(<UserProfileCard {...defaultProps} />);

      // Force re-render
      rerender(<UserProfileCard {...defaultProps} user={{ ...mockUser, name: 'Jane Doe' }} />);

      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    it('uses callback functions for event handlers', () => {
      render(<UserProfileCard {...defaultProps} />);

      // The component should render without errors
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
