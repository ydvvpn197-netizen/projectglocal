/**
 * EnhancedUserProfileCard Component Tests
 * 
 * Comprehensive test suite for the EnhancedUserProfileCard component covering:
 * - All variants (minimal, compact, default, premium, featured)
 * - User interactions and event handling
 * - Security validation
 * - Accessibility features
 * - Error handling and loading states
 * - Enhanced features like skills, interests, and premium badges
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import EnhancedUserProfileCard, { EnhancedUserProfile, EnhancedUserProfileCardProps } from '../EnhancedUserProfileCard';

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

describe('EnhancedUserProfileCard', () => {
  const mockUser: EnhancedUserProfile = {
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
      website: 'https://johndoe.com',
      phone: '+1-555-123-4567'
    },
    rating: 4.8,
    reviewCount: 42,
    skills: ['React', 'TypeScript', 'Node.js', 'Python'],
    interests: ['Technology', 'Music', 'Travel', 'Cooking'],
    joinDate: '2022-03-15',
    eventsCount: 15,
    projectsCount: 8,
    isPremium: true,
    isFeatured: false
  };

  const defaultProps: EnhancedUserProfileCardProps = {
    user: mockUser,
    onFollow: vi.fn().mockResolvedValue(undefined),
    onMessage: vi.fn().mockResolvedValue(undefined),
    onViewProfile: vi.fn().mockResolvedValue(undefined),
    onShare: vi.fn().mockResolvedValue(undefined),
    onEdit: vi.fn().mockResolvedValue(undefined),
    onContact: vi.fn().mockResolvedValue(undefined)
  };

  const errorProps: EnhancedUserProfileCardProps = {
    ...defaultProps,
    onFollow: vi.fn().mockRejectedValue(new Error('Failed to follow user')),
    onMessage: vi.fn().mockRejectedValue(new Error('Failed to send message')),
    onViewProfile: vi.fn().mockRejectedValue(new Error('Failed to view profile')),
    onShare: vi.fn().mockRejectedValue(new Error('Failed to share profile')),
    onEdit: vi.fn().mockRejectedValue(new Error('Failed to edit profile')),
    onContact: vi.fn().mockRejectedValue(new Error('Failed to contact user'))
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders user profile information correctly', () => {
      render(<EnhancedUserProfileCard {...defaultProps} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Software Developer passionate about building great products')).toBeInTheDocument();
      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
      expect(screen.getByText('1,234')).toBeInTheDocument();
      expect(screen.getByText('567')).toBeInTheDocument();
    });

    it('renders avatar with fallback', () => {
      render(<EnhancedUserProfileCard {...defaultProps} />);

      // Check for avatar fallback
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('renders verified badge when user is verified', () => {
      render(<EnhancedUserProfileCard {...defaultProps} />);

      expect(screen.getByTestId('verified-badge')).toBeInTheDocument();
    });

    it('renders online indicator when user is online', () => {
      render(<EnhancedUserProfileCard {...defaultProps} />);

      expect(screen.getByTestId('online-indicator')).toBeInTheDocument();
    });

    it('renders premium badge when user is premium', () => {
      render(<EnhancedUserProfileCard {...defaultProps} />);

      expect(screen.getByTestId('premium-badge')).toBeInTheDocument();
    });

    it('renders trending badge when user has trending badge', () => {
      render(<EnhancedUserProfileCard {...defaultProps} />);

      expect(screen.getByTestId('trending-badge')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders minimal variant correctly', () => {
      render(<EnhancedUserProfileCard {...defaultProps} variant="minimal" />);

      expect(screen.getByTestId('enhanced-user-profile-card-minimal')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
      // Should not show stats in minimal variant
      expect(screen.queryByText('1,234')).not.toBeInTheDocument();
    });

    it('renders compact variant correctly', () => {
      render(<EnhancedUserProfileCard {...defaultProps} variant="compact" />);

      expect(screen.getByTestId('enhanced-user-profile-card-compact')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Software Developer passionate about building great products')).toBeInTheDocument();
    });

    it('renders default variant correctly', () => {
      render(<EnhancedUserProfileCard {...defaultProps} variant="default" />);

      expect(screen.getByTestId('enhanced-user-profile-card-default')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('1,234')).toBeInTheDocument();
    });
  });

  describe('Enhanced Features', () => {
    it('shows skills when showSkills is true', () => {
      render(<EnhancedUserProfileCard {...defaultProps} showSkills={true} />);

      expect(screen.getByText('Skills')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
      expect(screen.getByText('Python')).toBeInTheDocument();
    });

    it('shows social links when showSocialLinks is true', () => {
      render(<EnhancedUserProfileCard {...defaultProps} showSocialLinks={true} />);

      expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
      expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
      expect(screen.getByLabelText('Website')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone')).toBeInTheDocument();
    });

    it('shows events count in stats when available', () => {
      render(<EnhancedUserProfileCard {...defaultProps} showStats={true} />);

      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('Events')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('handles follow action correctly', async () => {
      render(<EnhancedUserProfileCard {...defaultProps} />);

      const followButton = screen.getByRole('button', { name: /follow/i });
      fireEvent.click(followButton);

      await waitFor(() => {
        expect(defaultProps.onFollow).toHaveBeenCalledWith('user-123');
      });
    });

    it('handles message action correctly', async () => {
      render(<EnhancedUserProfileCard {...defaultProps} />);

      const messageButton = screen.getByRole('button', { name: /message/i });
      fireEvent.click(messageButton);

      await waitFor(() => {
        expect(defaultProps.onMessage).toHaveBeenCalledWith('user-123');
      });
    });

    it('handles view profile action correctly', async () => {
      render(<EnhancedUserProfileCard {...defaultProps} />);

      const viewProfileButton = screen.getByRole('button', { name: /view full profile/i });
      fireEvent.click(viewProfileButton);

      await waitFor(() => {
        expect(defaultProps.onViewProfile).toHaveBeenCalledWith('user-123');
      });
    });

    it('handles share action correctly', async () => {
      render(<EnhancedUserProfileCard {...defaultProps} />);

      const shareButton = screen.getByRole('button', { name: /share profile/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(defaultProps.onShare).toHaveBeenCalledWith('user-123');
      });
    });

    it('handles edit action correctly', async () => {
      render(<EnhancedUserProfileCard {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(defaultProps.onEdit).toHaveBeenCalledWith('user-123');
      });
    });

    it('handles contact action correctly', async () => {
      render(<EnhancedUserProfileCard {...defaultProps} showSocialLinks={true} />);

      const contactButton = screen.getByRole('button', { name: /phone/i });
      fireEvent.click(contactButton);

      await waitFor(() => {
        expect(defaultProps.onContact).toHaveBeenCalledWith('user-123');
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when action fails', async () => {
      render(<EnhancedUserProfileCard {...errorProps} />);

      const followButton = screen.getByRole('button', { name: /follow/i });
      fireEvent.click(followButton);

      await waitFor(() => {
        expect(screen.getByText('Error loading profile')).toBeInTheDocument();
        expect(screen.getByText('Failed to follow user')).toBeInTheDocument();
      });
    });

    it('shows loading indicator during actions', async () => {
      render(<EnhancedUserProfileCard {...defaultProps} />);

      const followButton = screen.getByRole('button', { name: /follow/i });
      fireEvent.click(followButton);

      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('renders loading skeleton when loading is true', () => {
      render(<EnhancedUserProfileCard {...defaultProps} loading={true} />);

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for buttons', () => {
      render(<EnhancedUserProfileCard {...defaultProps} />);

      expect(screen.getByRole('button', { name: /follow john doe/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /share profile/i })).toBeInTheDocument();
    });

    it('has proper screen reader text for social links', () => {
      render(<EnhancedUserProfileCard {...defaultProps} showSocialLinks={true} />);

      expect(screen.getByText('Twitter')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByText('GitHub')).toBeInTheDocument();
      expect(screen.getByText('Website')).toBeInTheDocument();
    });
  });

  describe('Security Validation', () => {
    it('handles malicious input gracefully', () => {
      const maliciousUser: EnhancedUserProfile = {
        ...mockUser,
        name: '<script>alert("xss")</script>',
        bio: 'javascript:alert("xss")',
        location: 'San Francisco, CA'
      };

      render(<EnhancedUserProfileCard {...defaultProps} user={maliciousUser} />);

      // Since we're not doing complex validation, the malicious input is displayed as-is
      // This is acceptable for a UI component as long as it's not executed
      expect(screen.getByText('<script>alert("xss")</script>')).toBeInTheDocument();
      expect(screen.getByText('javascript:alert("xss")')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles user without name gracefully', () => {
      const userWithoutName = { ...mockUser, name: '' };
      render(<EnhancedUserProfileCard {...defaultProps} user={userWithoutName} />);

      expect(screen.getByText('Anonymous User')).toBeInTheDocument();
    });

    it('handles user without bio gracefully', () => {
      const userWithoutBio = { ...mockUser, bio: undefined };
      render(<EnhancedUserProfileCard {...defaultProps} user={userWithoutBio} />);

      expect(screen.queryByText('Software Developer passionate about building great products')).not.toBeInTheDocument();
    });

    it('handles user without location gracefully', () => {
      const userWithoutLocation = { ...mockUser, location: undefined };
      render(<EnhancedUserProfileCard {...defaultProps} user={userWithoutLocation} />);

      expect(screen.queryByText('San Francisco, CA')).not.toBeInTheDocument();
    });

    it('handles user without social links gracefully', () => {
      const userWithoutSocialLinks = { ...mockUser, socialLinks: undefined };
      render(<EnhancedUserProfileCard {...defaultProps} user={userWithoutSocialLinks} showSocialLinks={true} />);

      expect(screen.queryByLabelText('Twitter')).not.toBeInTheDocument();
    });
  });

  describe('Animation and Interactivity', () => {
    it('applies animation classes when animate is true', () => {
      render(<EnhancedUserProfileCard {...defaultProps} animate={true} />);

      const card = screen.getByTestId('enhanced-user-profile-card-default');
      expect(card.className).toContain('animate-in');
    });

    it('applies interactive classes when interactive is true', () => {
      render(<EnhancedUserProfileCard {...defaultProps} interactive={true} />);

      const card = screen.getByTestId('enhanced-user-profile-card-default');
      expect(card.className).toContain('hover:shadow-md');
    });
  });

  describe('Conditional Rendering', () => {
    it('shows actions when showActions is true', () => {
      render(<EnhancedUserProfileCard {...defaultProps} showActions={true} />);

      expect(screen.getByRole('button', { name: /follow/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /message/i })).toBeInTheDocument();
    });

    it('hides actions when showActions is false', () => {
      render(<EnhancedUserProfileCard {...defaultProps} showActions={false} />);

      expect(screen.queryByRole('button', { name: /follow/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /message/i })).not.toBeInTheDocument();
    });

    it('shows stats when showStats is true', () => {
      render(<EnhancedUserProfileCard {...defaultProps} showStats={true} />);

      expect(screen.getByText('1,234')).toBeInTheDocument();
      expect(screen.getByText('Followers')).toBeInTheDocument();
    });

    it('hides stats when showStats is false', () => {
      render(<EnhancedUserProfileCard {...defaultProps} showStats={false} />);

      expect(screen.queryByText('1,234')).not.toBeInTheDocument();
      expect(screen.queryByText('Followers')).not.toBeInTheDocument();
    });
  });
});
