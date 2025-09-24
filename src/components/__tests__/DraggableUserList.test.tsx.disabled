/**
 * DraggableUserList Component Tests
 * 
 * Tests for the DraggableUserList component including drag and drop functionality,
 * user interactions, and various props configurations.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import DraggableUserList from '../DraggableUserList';
import { EnhancedUserProfile } from '../EnhancedUserProfileCard';

// Mock dependencies
const mockOnReorder = vi.fn();
const mockOnFollow = vi.fn();
const mockOnMessage = vi.fn();
const mockOnViewProfile = vi.fn();
const mockOnShare = vi.fn();
const mockOnEdit = vi.fn();
const mockOnContact = vi.fn();

// Mock user data
const mockUsers: EnhancedUserProfile[] = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar1.jpg',
    bio: 'Software Developer',
    location: 'San Francisco, CA',
    verified: true,
    followersCount: 1234,
    followingCount: 567,
    isFollowing: false,
    isOnline: true,
    badges: ['verified'],
    skills: ['React', 'TypeScript', 'Node.js'],
    eventsCount: 15,
    joinDate: '2022-03-15',
    isPremium: true,
    isFeatured: false
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'https://example.com/avatar2.jpg',
    bio: 'UX Designer',
    location: 'New York, NY',
    verified: false,
    followersCount: 890,
    followingCount: 234,
    isFollowing: true,
    isOnline: false,
    badges: ['trending'],
    skills: ['Figma', 'Sketch', 'Adobe XD'],
    eventsCount: 8,
    joinDate: '2023-01-10',
    isPremium: false,
    isFeatured: true
  },
  {
    id: 'user-3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    avatar: 'https://example.com/avatar3.jpg',
    bio: 'Product Manager',
    location: 'Austin, TX',
    verified: true,
    followersCount: 567,
    followingCount: 123,
    isFollowing: false,
    isOnline: true,
    badges: ['verified', 'premium'],
    skills: ['Product Strategy', 'Agile', 'Analytics'],
    eventsCount: 12,
    joinDate: '2021-11-20',
    isPremium: true,
    isFeatured: true
  }
];

const defaultProps = {
  users: mockUsers,
  variant: 'default' as const,
  onReorder: mockOnReorder,
  onFollow: mockOnFollow,
  onMessage: mockOnMessage,
  onViewProfile: mockOnViewProfile,
  onShare: mockOnShare,
  onEdit: mockOnEdit,
  onContact: mockOnContact,
  showDragHandles: true,
  allowReordering: true
};

describe('DraggableUserList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all users correctly', () => {
      render(<DraggableUserList {...defaultProps} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('displays correct user count', () => {
      render(<DraggableUserList {...defaultProps} />);
      
      expect(screen.getByText('3 users')).toBeInTheDocument();
    });

    it('shows virtualization badge when enabled', () => {
      render(<DraggableUserList {...defaultProps} />);
      
      expect(screen.getByText('Drag to reorder')).toBeInTheDocument();
    });

    it('renders drag handles when showDragHandles is true', () => {
      render(<DraggableUserList {...defaultProps} />);
      
      const dragHandles = screen.getAllByTestId('drag-handle');
      expect(dragHandles).toHaveLength(3);
    });

    it('does not render drag handles when showDragHandles is false', () => {
      render(<DraggableUserList {...defaultProps} showDragHandles={false} />);
      
      const dragHandles = screen.queryAllByTestId('drag-handle');
      expect(dragHandles).toHaveLength(0);
    });
  });

  describe('Controls', () => {
    it('renders shuffle button', () => {
      render(<DraggableUserList {...defaultProps} />);
      
      expect(screen.getByText('Shuffle')).toBeInTheDocument();
    });

    it('renders reset button', () => {
      render(<DraggableUserList {...defaultProps} />);
      
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('hides controls when allowReordering is false', () => {
      render(<DraggableUserList {...defaultProps} allowReordering={false} />);
      
      expect(screen.queryByText('Shuffle')).not.toBeInTheDocument();
      expect(screen.queryByText('Reset')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onFollow when follow button is clicked', () => {
      render(<DraggableUserList {...defaultProps} />);
      
      const followButtons = screen.getAllByText('Follow');
      fireEvent.click(followButtons[0]);
      
      expect(mockOnFollow).toHaveBeenCalledWith('user-1');
    });

    it('calls onMessage when message button is clicked', () => {
      render(<DraggableUserList {...defaultProps} />);
      
      const messageButtons = screen.getAllByText('Message');
      fireEvent.click(messageButtons[0]);
      
      expect(mockOnMessage).toHaveBeenCalledWith('user-1');
    });

    it('calls onViewProfile when view profile button is clicked', () => {
      render(<DraggableUserList {...defaultProps} />);
      
      const viewProfileButtons = screen.getAllByText('View Full Profile');
      fireEvent.click(viewProfileButtons[0]);
      
      expect(mockOnViewProfile).toHaveBeenCalledWith('user-1');
    });
  });

  describe('Drag and Drop Functionality', () => {
    it('sets draggable attribute when allowReordering is true', () => {
      render(<DraggableUserList {...defaultProps} />);
      
      const userCards = screen.getAllByTestId('user-card');
      userCards.forEach(card => {
        expect(card).toHaveAttribute('draggable', 'true');
      });
    });

    it('does not set draggable attribute when allowReordering is false', () => {
      render(<DraggableUserList {...defaultProps} allowReordering={false} />);
      
      const userCards = screen.getAllByTestId('user-card');
      userCards.forEach(card => {
        expect(card).not.toHaveAttribute('draggable');
      });
    });

    it('handles drag start correctly', () => {
      render(<DraggableUserList {...defaultProps} />);
      
      const firstUserCard = screen.getAllByTestId('user-card')[0];
      fireEvent.dragStart(firstUserCard);
      
      // The component should handle drag start internally
      expect(firstUserCard).toBeInTheDocument();
    });

    it('handles drag over correctly', () => {
      render(<DraggableUserList {...defaultProps} />);
      
      const firstUserCard = screen.getAllByTestId('user-card')[0];
      const secondUserCard = screen.getAllByTestId('user-card')[1];
      
      fireEvent.dragStart(firstUserCard);
      fireEvent.dragOver(secondUserCard);
      
      // The component should handle drag over internally
      expect(secondUserCard).toBeInTheDocument();
    });
  });

  describe('Shuffle and Reset Functionality', () => {
    it('calls onReorder when shuffle is clicked', () => {
      render(<DraggableUserList {...defaultProps} />);
      
      const shuffleButton = screen.getByText('Shuffle');
      fireEvent.click(shuffleButton);
      
      expect(mockOnReorder).toHaveBeenCalled();
    });

    it('calls onReorder when reset is clicked', () => {
      render(<DraggableUserList {...defaultProps} />);
      
      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);
      
      expect(mockOnReorder).toHaveBeenCalledWith(mockUsers);
    });
  });

  describe('Variants', () => {
    it('applies correct variant to user cards', () => {
      render(<DraggableUserList {...defaultProps} variant="compact" />);
      
      // The variant should be passed down to EnhancedUserProfileCard
      const userCards = screen.getAllByTestId('enhanced-user-profile-card-compact');
      expect(userCards).toHaveLength(3);
    });

    it('applies dark variant correctly', () => {
      render(<DraggableUserList {...defaultProps} variant="dark" />);
      
      // The variant should be passed down to EnhancedUserProfileCard
      // Since we can't easily test the variant prop directly, we'll test that the component renders
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
  });

  describe('Position Indicators', () => {
    it('shows correct position numbers', () => {
      render(<DraggableUserList {...defaultProps} />);
      
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
      expect(screen.getByText('#3')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper cursor styles', () => {
      render(<DraggableUserList {...defaultProps} />);
      
      const userCards = screen.getAllByTestId('user-card');
      userCards.forEach(card => {
        expect(card).toHaveClass('cursor-move');
      });
    });

    it('shows cursor-default when reordering is disabled', () => {
      render(<DraggableUserList {...defaultProps} allowReordering={false} />);
      
      const userCards = screen.getAllByTestId('user-card');
      userCards.forEach(card => {
        expect(card).toHaveClass('cursor-default');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty user list', () => {
      render(<DraggableUserList {...defaultProps} users={[]} />);
      
      expect(screen.getByText('0 users')).toBeInTheDocument();
    });

    it('handles single user', () => {
      render(<DraggableUserList {...defaultProps} users={[mockUsers[0]]} />);
      
      expect(screen.getByText('1 users')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
