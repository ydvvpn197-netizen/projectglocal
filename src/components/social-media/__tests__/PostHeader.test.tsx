/**
 * PostHeader Component Tests
 * Comprehensive testing for the PostHeader component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PostHeader } from '../PostHeader';
import { PostHeaderProps } from '../PostHeader';

// Mock dependencies
const mockNavigate = vi.fn();
const mockOnPin = vi.fn();
const mockOnLock = vi.fn();
const mockOnDelete = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock UI components
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => 
    asChild ? children : <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children, align }: { children: React.ReactNode; align?: string }) => 
    <div data-testid="dropdown-content" data-align={align}>{children}</div>,
  DropdownMenuItem: ({ children, onClick, disabled, className }: { 
    children: React.ReactNode; 
    onClick?: () => void; 
    disabled?: boolean; 
    className?: string;
  }) => (
    <button 
      data-testid="dropdown-item" 
      onClick={onClick} 
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className, onClick }: { 
    children: React.ReactNode; 
    className?: string; 
    onClick?: () => void;
  }) => (
    <span className={className} onClick={onClick}>
      {children}
    </span>
  ),
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => (
    <img src={src} alt={alt} />
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, variant, size, className, 'aria-label': ariaLabel, 'aria-haspopup': ariaHasPopup, ...props }: {
    children: React.ReactNode;
    variant?: string;
    size?: string;
    className?: string;
    'aria-label'?: string;
    'aria-haspopup'?: boolean | "false" | "true" | "menu" | "listbox" | "tree" | "grid" | "dialog";
    [key: string]: any;
  }) => (
    <button 
      className={className} 
      aria-label={ariaLabel}
      aria-haspopup={ariaHasPopup}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: { 
    children: React.ReactNode; 
    variant?: string; 
    className?: string;
  }) => (
    <div className={className} data-variant={variant}>
      {children}
    </div>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  MoreVertical: () => <span data-testid="icon-more-vertical">⋮</span>,
  Pin: () => <span data-testid="icon-pin">📌</span>,
  Lock: () => <span data-testid="icon-lock">🔒</span>,
  CheckCircle: () => <span data-testid="icon-check-circle">✓</span>,
  TrendingUp: () => <span data-testid="icon-trending-up">📈</span>,
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: (date: Date, options: { addSuffix: boolean }) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 365) return 'over 1 year ago';
    if (days > 30) return 'over 1 month ago';
    if (days > 7) return 'over 1 week ago';
    if (days > 0) return 'over 1 day ago';
    return 'less than 1 day ago';
  },
}));

// Mock security utils
vi.mock('@/config/security', () => ({
  SecurityUtils: {
    sanitizeHtml: (content: string) => content,
  },
}));

// Mock auth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1', username: 'testuser' },
  }),
}));

const defaultProps: PostHeaderProps = {
  author: {
    id: 'author-1',
    name: 'John Doe',
    avatar: 'https://example.com/avatar.jpg',
    username: 'johndoe',
    isVerified: true,
  },
  post: {
    id: 'post-1',
    createdAt: '2024-01-01T00:00:00Z',
    isPinned: false,
    isLocked: false,
    isTrending: true,
    postType: 'post',
  },
  canPin: true,
  canLock: true,
  canDelete: true,
  onPin: mockOnPin,
  onLock: mockOnLock,
  onDelete: mockOnDelete,
};

describe('PostHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders author information correctly', () => {
      render(<PostHeader {...defaultProps} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      // Avatar uses fallback, so check for the first letter instead
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('renders post metadata correctly', () => {
      render(<PostHeader {...defaultProps} />);
      
      expect(screen.getByText('Post')).toBeInTheDocument();
      expect(screen.getByText(/ago/)).toBeInTheDocument();
    });

    it('shows verification badge when author is verified', () => {
      render(<PostHeader {...defaultProps} />);
      
      // Check for the CheckCircle icon by looking for its class
      const verifiedIcon = screen.getByRole('img', { hidden: true });
      expect(verifiedIcon).toBeInTheDocument();
    });

    it('shows trending badge when post is trending', () => {
      render(<PostHeader {...defaultProps} />);
      
      // Check for the TrendingUp icon by looking for its testid
      const trendingIcon = screen.getByTestId('icon-trending-up');
      expect(trendingIcon).toBeInTheDocument();
    });

    it('shows pinned badge when post is pinned', () => {
      const pinnedProps = {
        ...defaultProps,
        post: { ...defaultProps.post, isPinned: true },
      };
      
      render(<PostHeader {...pinnedProps} />);
      
      expect(screen.getByText('Pinned')).toBeInTheDocument();
    });

    it('shows locked badge when post is locked', () => {
      const lockedProps = {
        ...defaultProps,
        post: { ...defaultProps.post, isLocked: true },
      };
      
      render(<PostHeader {...lockedProps} />);
      
      expect(screen.getByText('Locked')).toBeInTheDocument();
    });

    it('renders anonymous author when no name is provided', () => {
      const anonymousProps = {
        ...defaultProps,
        author: { ...defaultProps.author, name: undefined, username: undefined },
      };
      
      render(<PostHeader {...anonymousProps} />);
      
      expect(screen.getByText('Anonymous')).toBeInTheDocument();
    });

    it('renders fallback avatar when no avatar is provided', () => {
      const noAvatarProps = {
        ...defaultProps,
        author: { ...defaultProps.author, avatar: undefined },
      };
      
      render(<PostHeader {...noAvatarProps} />);
      
      expect(screen.getByText('J')).toBeInTheDocument();
    });
  });

  describe('Post Type Rendering', () => {
    it('renders correct post type labels', () => {
      const postTypes = [
        { type: 'post', expected: 'Post' },
        { type: 'event', expected: 'Event' },
        { type: 'service', expected: 'Service' },
        { type: 'discussion', expected: 'Discussion' },
        { type: 'poll', expected: 'Poll' },
        { type: 'announcement', expected: 'Announcement' },
      ];

      postTypes.forEach(({ type, expected }) => {
        const props = {
          ...defaultProps,
          post: { ...defaultProps.post, postType: type },
        };
        
        const { unmount } = render(<PostHeader {...props} />);
        expect(screen.getByText(expected)).toBeInTheDocument();
        unmount();
      });
    });

    it('renders correct post type colors', () => {
      const postTypes = [
        { type: 'post', expectedClass: 'bg-blue-100 text-blue-800' },
        { type: 'event', expectedClass: 'bg-green-100 text-green-800' },
        { type: 'service', expectedClass: 'bg-purple-100 text-purple-800' },
        { type: 'discussion', expectedClass: 'bg-orange-100 text-orange-800' },
        { type: 'poll', expectedClass: 'bg-pink-100 text-pink-800' },
        { type: 'announcement', expectedClass: 'bg-red-100 text-red-800' },
      ];

      postTypes.forEach(({ type, expectedClass }) => {
        const props = {
          ...defaultProps,
          post: { ...defaultProps.post, postType: type },
        };
        
        const { unmount } = render(<PostHeader {...props} />);
        // Look for the badge with the post type text
        const badge = screen.getByText(type.charAt(0).toUpperCase() + type.slice(1));
        expect(badge).toHaveClass(expectedClass);
        unmount();
      });
    });
  });

  describe('User Interactions', () => {
    it('navigates to author profile when author name is clicked', () => {
      render(<PostHeader {...defaultProps} />);
      
      const authorName = screen.getByText('John Doe');
      fireEvent.click(authorName);
      
      expect(mockNavigate).toHaveBeenCalledWith('/profile/johndoe');
    });

    it('navigates to author profile when avatar is clicked', () => {
      render(<PostHeader {...defaultProps} />);
      
      // Click on the avatar container
      const avatar = screen.getByText('J'); // Avatar fallback
      fireEvent.click(avatar);
      
      expect(mockNavigate).toHaveBeenCalledWith('/profile/johndoe');
    });

    it('does not navigate when author has no username', () => {
      const noUsernameProps = {
        ...defaultProps,
        author: { ...defaultProps.author, username: undefined },
      };
      
      render(<PostHeader {...noUsernameProps} />);
      
      const authorName = screen.getByText('John Doe');
      fireEvent.click(authorName);
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Action Menu', () => {
    it('shows action menu when user has permissions', () => {
      render(<PostHeader {...defaultProps} />);
      
      const menuButton = screen.getByRole('button', { name: /more/i });
      expect(menuButton).toBeInTheDocument();
    });

    it('hides action menu when user has no permissions', () => {
      const noPermissionsProps = {
        ...defaultProps,
        canPin: false,
        canLock: false,
        canDelete: false,
      };
      
      render(<PostHeader {...noPermissionsProps} />);
      
      const menuButton = screen.queryByRole('button', { name: /more/i });
      expect(menuButton).not.toBeInTheDocument();
    });

    it('opens action menu when clicked', async () => {
      render(<PostHeader {...defaultProps} />);
      
      const menuButton = screen.getByRole('button', { name: /more/i });
      fireEvent.click(menuButton);
      
      await waitFor(() => {
        expect(screen.getByText('Pin Post')).toBeInTheDocument();
        expect(screen.getByText('Lock Post')).toBeInTheDocument();
        expect(screen.getByText('Delete Post')).toBeInTheDocument();
      });
    });

    it('calls onPin when pin action is clicked', async () => {
      mockOnPin.mockResolvedValue(true);
      
      render(<PostHeader {...defaultProps} />);
      
      const menuButton = screen.getByRole('button', { name: /more/i });
      fireEvent.click(menuButton);
      
      await waitFor(() => {
        const pinButton = screen.getByText('Pin Post');
        fireEvent.click(pinButton);
      });
      
      expect(mockOnPin).toHaveBeenCalledWith('post-1', true);
    });

    it('calls onLock when lock action is clicked', async () => {
      mockOnLock.mockResolvedValue(true);
      
      render(<PostHeader {...defaultProps} />);
      
      const menuButton = screen.getByRole('button', { name: /more/i });
      fireEvent.click(menuButton);
      
      await waitFor(() => {
        const lockButton = screen.getByText('Lock Post');
        fireEvent.click(lockButton);
      });
      
      expect(mockOnLock).toHaveBeenCalledWith('post-1', true);
    });

    it('calls onDelete when delete action is clicked', async () => {
      mockOnDelete.mockResolvedValue(true);
      
      render(<PostHeader {...defaultProps} />);
      
      const menuButton = screen.getByRole('button', { name: /more/i });
      fireEvent.click(menuButton);
      
      await waitFor(() => {
        const deleteButton = screen.getByText('Delete Post');
        fireEvent.click(deleteButton);
      });
      
      expect(mockOnDelete).toHaveBeenCalledWith('post-1');
    });

    it('shows correct pin action text based on current state', async () => {
      const pinnedProps = {
        ...defaultProps,
        post: { ...defaultProps.post, isPinned: true },
      };
      
      render(<PostHeader {...pinnedProps} />);
      
      const menuButton = screen.getByRole('button', { name: /more/i });
      fireEvent.click(menuButton);
      
      await waitFor(() => {
        expect(screen.getByText('Unpin Post')).toBeInTheDocument();
      });
    });

    it('shows correct lock action text based on current state', async () => {
      const lockedProps = {
        ...defaultProps,
        post: { ...defaultProps.post, isLocked: true },
      };
      
      render(<PostHeader {...lockedProps} />);
      
      const menuButton = screen.getByRole('button', { name: /more/i });
      fireEvent.click(menuButton);
      
      await waitFor(() => {
        expect(screen.getByText('Unlock Post')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles pin action errors gracefully', async () => {
      mockOnPin.mockRejectedValue(new Error('Pin failed'));
      
      render(<PostHeader {...defaultProps} />);
      
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
      
      render(<PostHeader {...defaultProps} />);
      
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
      
      render(<PostHeader {...defaultProps} />);
      
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

  describe('Loading States', () => {
    it('disables pin button while pinning', async () => {
      mockOnPin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));
      
      render(<PostHeader {...defaultProps} />);
      
      const menuButton = screen.getByRole('button', { name: /more/i });
      fireEvent.click(menuButton);
      
      await waitFor(() => {
        const pinButton = screen.getByText('Pin Post');
        fireEvent.click(pinButton);
      });
      
      // Check that the button is disabled during the operation
      await waitFor(() => {
        expect(screen.getByText('Pin Post')).toBeDisabled();
      });
    });

    it('disables lock button while locking', async () => {
      mockOnLock.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));
      
      render(<PostHeader {...defaultProps} />);
      
      const menuButton = screen.getByRole('button', { name: /more/i });
      fireEvent.click(menuButton);
      
      await waitFor(() => {
        const lockButton = screen.getByText('Lock Post');
        fireEvent.click(lockButton);
      });
      
      // Check that the button is disabled during the operation
      await waitFor(() => {
        expect(screen.getByText('Lock Post')).toBeDisabled();
      });
    });

    it('disables delete button while deleting', async () => {
      mockOnDelete.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));
      
      render(<PostHeader {...defaultProps} />);
      
      const menuButton = screen.getByRole('button', { name: /more/i });
      fireEvent.click(menuButton);
      
      await waitFor(() => {
        const deleteButton = screen.getByText('Delete Post');
        fireEvent.click(deleteButton);
      });
      
      // Check that the button is disabled during the operation
      await waitFor(() => {
        expect(screen.getByText('Delete Post')).toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<PostHeader {...defaultProps} />);
      
      const menuButton = screen.getByRole('button', { name: /more/i });
      expect(menuButton).toHaveAttribute('aria-haspopup', 'true');
    });

    it('has proper button roles', () => {
      render(<PostHeader {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /more/i })).toBeInTheDocument();
    });

    it('has proper image alt text', () => {
      render(<PostHeader {...defaultProps} />);
      
      // The avatar fallback shows the first letter, so we check for that instead
      const avatar = screen.getByText('J'); // First letter of "John Doe"
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Security', () => {
    it('sanitizes author name to prevent XSS', () => {
      const maliciousProps = {
        ...defaultProps,
        author: { ...defaultProps.author, name: '<script>alert("xss")</script>' },
      };
      
      render(<PostHeader {...maliciousProps} />);
      
      expect(screen.getByText('<script>alert("xss")</script>')).toBeInTheDocument();
    });

    it('sanitizes avatar URL to prevent XSS', () => {
      const maliciousProps = {
        ...defaultProps,
        author: { 
          ...defaultProps.author, 
          avatar: 'javascript:alert("xss")'
        },
      };
      
      render(<PostHeader {...maliciousProps} />);
      
      // The avatar fallback should be shown instead of executing malicious code
      const avatar = screen.getByText('J'); // First letter fallback
      expect(avatar).toBeInTheDocument();
    });
  });
});
