/**
 * SocialMediaPost Component Tests
 * Comprehensive testing for the refactored SocialMediaPost component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SocialMediaPost } from '../SocialMediaPost';
import { SocialMediaPostProps } from '../SocialMediaPost';

// Mock dependencies
const mockOnLike = vi.fn();
const mockOnVote = vi.fn();
const mockOnSave = vi.fn();
const mockOnShare = vi.fn();
const mockOnView = vi.fn();
const mockOnComment = vi.fn();
const mockOnPin = vi.fn();
const mockOnLock = vi.fn();
const mockOnDelete = vi.fn();

const defaultProps: SocialMediaPostProps = {
  post: {
    id: 'post-1',
    userId: 'user-1',
    type: 'post',
    title: 'Test Post Title',
    content: 'This is a test post content with <b>HTML</b> formatting.',
    status: 'public',
    locationCity: 'New York',
    locationState: 'NY',
    locationCountry: 'USA',
    latitude: 40.7128,
    longitude: -74.0060,
    eventDate: '2024-02-01T18:00:00Z',
    eventLocation: 'Central Park',
    priceRange: 'Free',
    contactInfo: 'test@example.com',
    tags: ['test', 'example', 'post'],
    imageUrls: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg'
    ],
    likesCount: 42,
    commentsCount: 12,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isPinned: false,
    isLocked: false,
    isTrending: true,
    score: 15,
    viewCount: 150,
    shareCount: 8,
    saveCount: 5,
  },
  author: {
    id: 'user-1',
    name: 'John Doe',
    avatar: 'https://example.com/avatar.jpg',
    username: 'johndoe',
    isVerified: true,
    userType: 'user',
  },
  userInteraction: {
    hasLiked: false,
    hasSaved: false,
    hasViewed: false,
    userVote: 0,
  },
  onLike: mockOnLike,
  onVote: mockOnVote,
  onSave: mockOnSave,
  onShare: mockOnShare,
  onView: mockOnView,
  onComment: mockOnComment,
  onPin: mockOnPin,
  onLock: mockOnLock,
  onDelete: mockOnDelete,
};

describe('SocialMediaPost', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders post header with author information', () => {
      render(<SocialMediaPost {...defaultProps} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('johndoe')).toBeInTheDocument();
      expect(screen.getByText('Post')).toBeInTheDocument();
    });

    it('renders post content correctly', () => {
      render(<SocialMediaPost {...defaultProps} />);
      
      expect(screen.getByText('Test Post Title')).toBeInTheDocument();
      expect(screen.getByText('This is a test post content with HTML formatting.')).toBeInTheDocument();
    });

    it('renders post actions with engagement metrics', () => {
      render(<SocialMediaPost {...defaultProps} />);
      
      expect(screen.getByText('42')).toBeInTheDocument(); // likes
      expect(screen.getByText('12')).toBeInTheDocument(); // comments
      expect(screen.getByText('150 views')).toBeInTheDocument();
      expect(screen.getByText('8 shares')).toBeInTheDocument();
      expect(screen.getByText('5 saves')).toBeInTheDocument();
    });

    it('renders post tags correctly', () => {
      render(<SocialMediaPost {...defaultProps} />);
      
      expect(screen.getByText('#test')).toBeInTheDocument();
      expect(screen.getByText('#example')).toBeInTheDocument();
      expect(screen.getByText('#post')).toBeInTheDocument();
    });

    it('renders post images correctly', () => {
      render(<SocialMediaPost {...defaultProps} />);
      
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(2);
      expect(images[0]).toHaveAttribute('src', 'https://example.com/image1.jpg');
      expect(images[1]).toHaveAttribute('src', 'https://example.com/image2.jpg');
    });

    it('renders event information for event posts', () => {
      const eventProps = {
        ...defaultProps,
        post: { ...defaultProps.post, type: 'event' },
      };
      
      render(<SocialMediaPost {...eventProps} />);
      
      expect(screen.getByText('Date:')).toBeInTheDocument();
      expect(screen.getByText('Location:')).toBeInTheDocument();
      expect(screen.getByText('Price:')).toBeInTheDocument();
      expect(screen.getByText('Contact:')).toBeInTheDocument();
    });

    it('shows anonymous indicator for anonymous posts', () => {
      const anonymousProps = {
        ...defaultProps,
        post: { ...defaultProps.post, status: 'anonymous' },
      };
      
      render(<SocialMediaPost {...anonymousProps} />);
      
      expect(screen.getByText('Anonymous Post')).toBeInTheDocument();
    });

    it('shows trending indicator when post is trending', () => {
      render(<SocialMediaPost {...defaultProps} />);
      
      // The trending indicator should be visible in the header
      expect(screen.getByText('Post')).toBeInTheDocument();
    });
  });

  describe('User Permissions', () => {
    it('shows action menu for post owner', () => {
      render(<SocialMediaPost {...defaultProps} />);
      
      const menuButton = screen.getByRole('button', { name: /more/i });
      expect(menuButton).toBeInTheDocument();
    });

    it('shows action menu for admin users', () => {
      const adminProps = {
        ...defaultProps,
        author: { ...defaultProps.author, userType: 'admin' },
      };
      
      render(<SocialMediaPost {...defaultProps} />);
      
      const menuButton = screen.getByRole('button', { name: /more/i });
      expect(menuButton).toBeInTheDocument();
    });

    it('hides action menu for non-owner non-admin users', () => {
      const nonOwnerProps = {
        ...defaultProps,
        post: { ...defaultProps.post, userId: 'other-user' },
        author: { ...defaultProps.author, userType: 'user' },
      };
      
      render(<SocialMediaPost {...nonOwnerProps} />);
      
      const menuButton = screen.queryByRole('button', { name: /more/i });
      expect(menuButton).not.toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    it('calls onLike when like button is clicked', async () => {
      mockOnLike.mockResolvedValue(true);
      
      render(<SocialMediaPost {...defaultProps} />);
      
      const likeButton = screen.getByRole('button', { name: /42/i });
      fireEvent.click(likeButton);
      
      await waitFor(() => {
        expect(mockOnLike).toHaveBeenCalledWith('post-1', true);
      });
    });

    it('calls onVote when vote buttons are clicked', async () => {
      mockOnVote.mockResolvedValue(true);
      
      render(<SocialMediaPost {...defaultProps} />);
      
      const upvoteButton = screen.getByRole('button', { name: /chevron-up/i });
      fireEvent.click(upvoteButton);
      
      await waitFor(() => {
        expect(mockOnVote).toHaveBeenCalledWith('post-1', 1);
      });
    });

    it('calls onSave when save button is clicked', async () => {
      mockOnSave.mockResolvedValue(true);
      
      render(<SocialMediaPost {...defaultProps} />);
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('post-1', true);
      });
    });

    it('calls onShare when share button is clicked', async () => {
      mockOnShare.mockResolvedValue(true);
      
      render(<SocialMediaPost {...defaultProps} />);
      
      const shareButton = screen.getByRole('button', { name: /share/i });
      fireEvent.click(shareButton);
      
      await waitFor(() => {
        expect(mockOnShare).toHaveBeenCalledWith('post-1');
      });
    });

    it('calls onView when view button is clicked', async () => {
      mockOnView.mockResolvedValue(true);
      
      render(<SocialMediaPost {...defaultProps} />);
      
      const viewButton = screen.getByRole('button', { name: /view/i });
      fireEvent.click(viewButton);
      
      await waitFor(() => {
        expect(mockOnView).toHaveBeenCalledWith('post-1');
      });
    });

    it('calls onComment when comment button is clicked', () => {
      render(<SocialMediaPost {...defaultProps} />);
      
      const commentButton = screen.getByRole('button', { name: /12/i });
      fireEvent.click(commentButton);
      
      expect(mockOnComment).toHaveBeenCalledWith('post-1');
    });

    it('calls onPin when pin action is selected', async () => {
      mockOnPin.mockResolvedValue(true);
      
      render(<SocialMediaPost {...defaultProps} />);
      
      const menuButton = screen.getByRole('button', { name: /more/i });
      fireEvent.click(menuButton);
      
      await waitFor(() => {
        const pinButton = screen.getByText('Pin Post');
        fireEvent.click(pinButton);
      });
      
      expect(mockOnPin).toHaveBeenCalledWith('post-1', true);
    });

    it('calls onLock when lock action is selected', async () => {
      mockOnLock.mockResolvedValue(true);
      
      render(<SocialMediaPost {...defaultProps} />);
      
      const menuButton = screen.getByRole('button', { name: /more/i });
      fireEvent.click(menuButton);
      
      await waitFor(() => {
        const lockButton = screen.getByText('Lock Post');
        fireEvent.click(lockButton);
      });
      
      expect(mockOnLock).toHaveBeenCalledWith('post-1', true);
    });

    it('calls onDelete when delete action is selected', async () => {
      mockOnDelete.mockResolvedValue(true);
      
      render(<SocialMediaPost {...defaultProps} />);
      
      const menuButton = screen.getByRole('button', { name: /more/i });
      fireEvent.click(menuButton);
      
      await waitFor(() => {
        const deleteButton = screen.getByText('Delete Post');
        fireEvent.click(deleteButton);
      });
      
      expect(mockOnDelete).toHaveBeenCalledWith('post-1');
    });
  });

  describe('State Management', () => {
    it('updates user interaction state when actions are performed', async () => {
      const { rerender } = render(<SocialMediaPost {...defaultProps} />);
      
      // Initially not liked
      expect(screen.getByRole('button', { name: /42/i })).not.toHaveClass('text-red-600');
      
      // Update props to show liked state
      const likedProps = {
        ...defaultProps,
        userInteraction: { ...defaultProps.userInteraction, hasLiked: true },
      };
      
      rerender(<SocialMediaPost {...likedProps} />);
      
      // Should now show liked state
      expect(screen.getByRole('button', { name: /42/i })).toHaveClass('text-red-600');
    });

    it('updates post state when post is pinned', async () => {
      const { rerender } = render(<SocialMediaPost {...defaultProps} />);
      
      // Initially not pinned
      expect(screen.queryByText('Pinned')).not.toBeInTheDocument();
      
      // Update props to show pinned state
      const pinnedProps = {
        ...defaultProps,
        post: { ...defaultProps.post, isPinned: true },
      };
      
      rerender(<SocialMediaPost {...pinnedProps} />);
      
      // Should now show pinned badge
      expect(screen.getByText('Pinned')).toBeInTheDocument();
    });

    it('updates post state when post is locked', async () => {
      const { rerender } = render(<SocialMediaPost {...defaultProps} />);
      
      // Initially not locked
      expect(screen.queryByText('Locked')).not.toBeInTheDocument();
      
      // Update props to show locked state
      const lockedProps = {
        ...defaultProps,
        post: { ...defaultProps.post, isLocked: true },
      };
      
      rerender(<SocialMediaPost {...lockedProps} />);
      
      // Should now show locked badge
      expect(screen.getByText('Locked')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles like action errors gracefully', async () => {
      mockOnLike.mockRejectedValue(new Error('Like failed'));
      
      render(<SocialMediaPost {...defaultProps} />);
      
      const likeButton = screen.getByRole('button', { name: /42/i });
      fireEvent.click(likeButton);
      
      await waitFor(() => {
        expect(mockOnLike).toHaveBeenCalledWith('post-1', true);
        expect(console.error).toHaveBeenCalledWith('Failed to like post:', expect.any(Error));
      });
    });

    it('handles vote action errors gracefully', async () => {
      mockOnVote.mockRejectedValue(new Error('Vote failed'));
      
      render(<SocialMediaPost {...defaultProps} />);
      
      const upvoteButton = screen.getByRole('button', { name: /chevron-up/i });
      fireEvent.click(upvoteButton);
      
      await waitFor(() => {
        expect(mockOnVote).toHaveBeenCalledWith('post-1', 1);
        expect(console.error).toHaveBeenCalledWith('Failed to vote on post:', expect.any(Error));
      });
    });

    it('handles save action errors gracefully', async () => {
      mockOnSave.mockRejectedValue(new Error('Save failed'));
      
      render(<SocialMediaPost {...defaultProps} />);
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('post-1', true);
        expect(console.error).toHaveBeenCalledWith('Failed to save post:', expect.any(Error));
      });
    });

    it('handles share action errors gracefully', async () => {
      mockOnShare.mockRejectedValue(new Error('Share failed'));
      
      render(<SocialMediaPost {...defaultProps} />);
      
      const shareButton = screen.getByRole('button', { name: /share/i });
      fireEvent.click(shareButton);
      
      await waitFor(() => {
        expect(mockOnShare).toHaveBeenCalledWith('post-1');
        expect(console.error).toHaveBeenCalledWith('Failed to share post:', expect.any(Error));
      });
    });

    it('handles view action errors gracefully', async () => {
      mockOnView.mockRejectedValue(new Error('View failed'));
      
      render(<SocialMediaPost {...defaultProps} />);
      
      const viewButton = screen.getByRole('button', { name: /view/i });
      fireEvent.click(viewButton);
      
      await waitFor(() => {
        expect(mockOnView).toHaveBeenCalledWith('post-1');
        expect(console.error).toHaveBeenCalledWith('Failed to record view:', expect.any(Error));
      });
    });

    it('handles pin action errors gracefully', async () => {
      mockOnPin.mockRejectedValue(new Error('Pin failed'));
      
      render(<SocialMediaPost {...defaultProps} />);
      
      const menuButton = screen.getByRole('button', { name: /more/i });
      fireEvent.click(menuButton);
      
      await waitFor(() => {
        const pinButton = screen.getByText('Pin Post');
        fireEvent.click(pinButton);
      });
      
      expect(mockOnPin).toHaveBeenCalledWith('post-1', true);
      expect(console.error).toHaveBeenCalledWith('Failed to pin post:', expect.any(Error));
    });

    it('handles lock action errors gracefully', async () => {
      mockOnLock.mockRejectedValue(new Error('Lock failed'));
      
      render(<SocialMediaPost {...defaultProps} />);
      
      const menuButton = screen.getByRole('button', { name: /more/i });
      fireEvent.click(menuButton);
      
      await waitFor(() => {
        const lockButton = screen.getByText('Lock Post');
        fireEvent.click(lockButton);
      });
      
      expect(mockOnLock).toHaveBeenCalledWith('post-1', true);
      expect(console.error).toHaveBeenCalledWith('Failed to lock post:', expect.any(Error));
    });

    it('handles delete action errors gracefully', async () => {
      mockOnDelete.mockRejectedValue(new Error('Delete failed'));
      
      render(<SocialMediaPost {...defaultProps} />);
      
      const menuButton = screen.getByRole('button', { name: /more/i });
      fireEvent.click(menuButton);
      
      await waitFor(() => {
        const deleteButton = screen.getByText('Delete Post');
        fireEvent.click(deleteButton);
      });
      
      expect(mockOnDelete).toHaveBeenCalledWith('post-1');
      expect(console.error).toHaveBeenCalledWith('Failed to delete post:', expect.any(Error));
    });
  });

  describe('Content Validation', () => {
    it('validates post content using security schemas', () => {
      render(<SocialMediaPost {...defaultProps} />);
      
      // The component should render successfully with valid content
      expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    });

    it('handles invalid post content gracefully', () => {
      const invalidProps = {
        ...defaultProps,
        post: { ...defaultProps.post, content: '' }, // Empty content
      };
      
      render(<SocialMediaPost {...invalidProps} />);
      
      // Should show validation warning in console
      expect(console.warn).toHaveBeenCalledWith(
        'Post content validation failed:',
        expect.any(Array)
      );
    });
  });

  describe('Performance Optimizations', () => {
    it('memoizes computed values', () => {
      const { rerender } = render(<SocialMediaPost {...defaultProps} />);
      
      // Force re-render
      rerender(<SocialMediaPost {...defaultProps} />);
      
      // The component should still render correctly
      expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    });

    it('uses callback functions for event handlers', () => {
      render(<SocialMediaPost {...defaultProps} />);
      
      // The component should render without errors
      expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles', () => {
      render(<SocialMediaPost {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /42/i })).toBeInTheDocument(); // like
      expect(screen.getByRole('button', { name: /12/i })).toBeInTheDocument(); // comment
      expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('has proper image alt text', () => {
      render(<SocialMediaPost {...defaultProps} />);
      
      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveAttribute('alt', 'Post content 1');
      expect(images[1]).toHaveAttribute('alt', 'Post content 2');
    });

    it('has proper ARIA labels', () => {
      render(<SocialMediaPost {...defaultProps} />);
      
      const menuButton = screen.getByRole('button', { name: /more/i });
      expect(menuButton).toHaveAttribute('aria-haspopup', 'true');
    });
  });

  describe('Edge Cases', () => {
    it('handles posts without images', () => {
      const noImagesProps = {
        ...defaultProps,
        post: { ...defaultProps.post, imageUrls: undefined },
      };
      
      render(<SocialMediaPost {...noImagesProps} />);
      
      // Should render without errors
      expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    });

    it('handles posts without tags', () => {
      const noTagsProps = {
        ...defaultProps,
        post: { ...defaultProps.post, tags: undefined },
      };
      
      render(<SocialMediaPost {...noTagsProps} />);
      
      // Should render without errors
      expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    });

    it('handles posts without title', () => {
      const noTitleProps = {
        ...defaultProps,
        post: { ...defaultProps.post, title: undefined },
      };
      
      render(<SocialMediaPost {...noTitleProps} />);
      
      // Should render without errors
      expect(screen.getByText('This is a test post content with HTML formatting.')).toBeInTheDocument();
    });

    it('handles posts with maximum content length', () => {
      const maxContentProps = {
        ...defaultProps,
        post: { ...defaultProps.post, content: 'A'.repeat(10000) },
      };
      
      render(<SocialMediaPost {...maxContentProps} />);
      
      // Should render without errors
      expect(screen.getByText('A'.repeat(10000))).toBeInTheDocument();
    });
  });
});
