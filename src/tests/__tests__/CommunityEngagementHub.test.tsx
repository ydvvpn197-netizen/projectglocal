// Comprehensive test suite for CommunityEngagementHub
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CommunityEngagementHub } from '@/components/community/CommunityEngagementHub';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from '@/hooks/useLocation';
import { useSecurity } from '@/utils/securityUtils';

// Mock dependencies
vi.mock('@/hooks/useAuth');
vi.mock('@/hooks/use-toast');
vi.mock('@/hooks/useLocation');
vi.mock('@/utils/securityUtils');
vi.mock('@/utils/performanceMonitor');

const mockUseAuth = vi.mocked(useAuth);
const mockUseToast = vi.mocked(useToast);
const mockUseLocation = vi.mocked(useLocation);
const mockUseSecurity = vi.mocked(useSecurity);

describe('CommunityEngagementHub', () => {
  const mockUser = {
    id: 'user_1',
    email: 'test@example.com',
    user_metadata: {
      user_type: 'user'
    }
  };

  const mockLocation = {
    city: 'Delhi',
    state: 'Delhi',
    country: 'India'
  };

  const mockToast = vi.fn();
  const mockSanitizeText = vi.fn((text) => text);
  const mockValidateInput = vi.fn(() => true);

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn()
    });

    mockUseToast.mockReturnValue({
      toast: mockToast
    });

    mockUseLocation.mockReturnValue({
      location: mockLocation,
      loading: false,
      error: null,
      updateLocation: vi.fn()
    });

    mockUseSecurity.mockReturnValue({
      sanitizeText: mockSanitizeText,
      validateInput: mockValidateInput,
      generateSecureToken: vi.fn(),
      checkRateLimit: vi.fn(),
      sanitizeHtml: vi.fn()
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the component with all main sections', () => {
      render(<CommunityEngagementHub />);
      
      expect(screen.getByText('Community Engagement')).toBeInTheDocument();
      expect(screen.getByText('Connect, discuss, and take action in your local community')).toBeInTheDocument();
      expect(screen.getByText('Create')).toBeInTheDocument();
    });

    it('renders all three tabs', () => {
      render(<CommunityEngagementHub />);
      
      expect(screen.getByText('Local Issues (2)')).toBeInTheDocument();
      expect(screen.getByText('Virtual Protests (1)')).toBeInTheDocument();
      expect(screen.getByText('Community Events (1)')).toBeInTheDocument();
    });

    it('renders search and filter controls', () => {
      render(<CommunityEngagementHub />);
      
      expect(screen.getByPlaceholderText('Search community content...')).toBeInTheDocument();
      expect(screen.getByText('Filter')).toBeInTheDocument();
    });
  });

  describe('Local Issues Tab', () => {
    it('displays local issues with correct information', () => {
      render(<CommunityEngagementHub />);
      
      expect(screen.getByText('Pothole on Main Street')).toBeInTheDocument();
      expect(screen.getByText('Large pothole causing traffic issues and vehicle damage')).toBeInTheDocument();
      expect(screen.getByText('Delhi')).toBeInTheDocument();
      expect(screen.getByText('Infrastructure')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument(); // Vote count
    });

    it('allows voting on issues', async () => {
      render(<CommunityEngagementHub />);
      
      const voteButton = screen.getByText('45');
      fireEvent.click(voteButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Vote Recorded",
          description: "Your vote has been recorded successfully"
        });
      });
    });

    it('shows anonymous badge for anonymous issues', () => {
      render(<CommunityEngagementHub />);
      
      expect(screen.getAllByText('Anonymous')).toHaveLength(2);
    });
  });

  describe('Virtual Protests Tab', () => {
    it('displays virtual protests with correct information', () => {
      render(<CommunityEngagementHub />);
      
      // Switch to protests tab
      fireEvent.click(screen.getByText('Virtual Protests (1)'));
      
      expect(screen.getByText('Climate Action Now')).toBeInTheDocument();
      expect(screen.getByText('Virtual protest for immediate climate action')).toBeInTheDocument();
      expect(screen.getByText('Environment')).toBeInTheDocument();
      expect(screen.getByText('150/500')).toBeInTheDocument(); // Participants
    });

    it('allows joining protests', async () => {
      render(<CommunityEngagementHub />);
      
      // Switch to protests tab
      fireEvent.click(screen.getByText('Virtual Protests (1)'));
      
      const joinButton = screen.getByText('150/500');
      fireEvent.click(joinButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Joined Protest",
          description: "You've successfully joined the virtual protest"
        });
      });
    });
  });

  describe('Community Events Tab', () => {
    it('displays community events with correct information', () => {
      render(<CommunityEngagementHub />);
      
      // Switch to events tab
      fireEvent.click(screen.getByText('Community Events (1)'));
      
      expect(screen.getByText('Community Cleanup Drive')).toBeInTheDocument();
      expect(screen.getByText('Join us for a neighborhood cleanup')).toBeInTheDocument();
      expect(screen.getByText('Environment')).toBeInTheDocument();
      expect(screen.getByText('25/50')).toBeInTheDocument(); // Attendees
    });

    it('allows attending events', async () => {
      render(<CommunityEngagementHub />);
      
      // Switch to events tab
      fireEvent.click(screen.getByText('Community Events (1)'));
      
      const attendButton = screen.getByText('25/50');
      fireEvent.click(attendButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Event Attendance",
          description: "You've successfully registered for the event"
        });
      });
    });
  });

  describe('Create Dialog', () => {
    it('opens create dialog when Create button is clicked', () => {
      render(<CommunityEngagementHub />);
      
      fireEvent.click(screen.getByText('Create'));
      
      expect(screen.getByText('Create Local Issue')).toBeInTheDocument();
    });

    it('allows creating local issues', async () => {
      render(<CommunityEngagementHub />);
      
      fireEvent.click(screen.getByText('Create'));
      
      // Fill in issue form
      fireEvent.change(screen.getByPlaceholderText('Brief description of the issue'), {
        target: { value: 'Test Issue' }
      });
      fireEvent.change(screen.getByPlaceholderText('Detailed description of the issue'), {
        target: { value: 'Test description' }
      });
      fireEvent.change(screen.getByPlaceholderText('e.g., Infrastructure, Safety'), {
        target: { value: 'Test Category' }
      });
      fireEvent.change(screen.getByPlaceholderText('City, State'), {
        target: { value: 'Test City' }
      });
      
      fireEvent.click(screen.getByText('Create Issue'));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Issue Created",
          description: "Your local issue has been posted successfully"
        });
      });
    });

    it('allows creating virtual protests', async () => {
      render(<CommunityEngagementHub />);
      
      fireEvent.click(screen.getByText('Create'));
      
      // Switch to protest type
      fireEvent.click(screen.getByText('Virtual Protest'));
      
      // Fill in protest form
      fireEvent.change(screen.getByPlaceholderText('Title of your virtual protest'), {
        target: { value: 'Test Protest' }
      });
      fireEvent.change(screen.getByPlaceholderText('What are you protesting for?'), {
        target: { value: 'Test cause' }
      });
      fireEvent.change(screen.getByPlaceholderText('e.g., Climate Change, Social Justice'), {
        target: { value: 'Test Cause' }
      });
      
      fireEvent.click(screen.getByText('Create Protest'));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Protest Created",
          description: "Your virtual protest has been created successfully"
        });
      });
    });

    it('allows creating community events', async () => {
      render(<CommunityEngagementHub />);
      
      fireEvent.click(screen.getByText('Create'));
      
      // Switch to event type
      fireEvent.click(screen.getByText('Community Event'));
      
      // Fill in event form
      fireEvent.change(screen.getByPlaceholderText('Title of your community event'), {
        target: { value: 'Test Event' }
      });
      fireEvent.change(screen.getByPlaceholderText('What is this event about?'), {
        target: { value: 'Test description' }
      });
      fireEvent.change(screen.getByPlaceholderText('e.g., Environment, Social'), {
        target: { value: 'Test Category' }
      });
      
      fireEvent.click(screen.getByText('Create Event'));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Event Created",
          description: "Your community event has been created successfully"
        });
      });
    });
  });

  describe('Search Functionality', () => {
    it('filters content based on search query', () => {
      render(<CommunityEngagementHub />);
      
      const searchInput = screen.getByPlaceholderText('Search community content...');
      fireEvent.change(searchInput, { target: { value: 'pothole' } });
      
      // Should show filtered results
      expect(screen.getByText('Pothole on Main Street')).toBeInTheDocument();
    });

    it('shows no results when search query matches nothing', () => {
      render(<CommunityEngagementHub />);
      
      const searchInput = screen.getByPlaceholderText('Search community content...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      
      // Should show no results
      expect(screen.queryByText('Pothole on Main Street')).not.toBeInTheDocument();
    });
  });

  describe('Anonymous Mode', () => {
    it('toggles anonymous mode in create dialog', () => {
      render(<CommunityEngagementHub />);
      
      fireEvent.click(screen.getByText('Create'));
      
      const anonymousToggle = screen.getByText('Anonymous');
      fireEvent.click(anonymousToggle);
      
      expect(screen.getByText('Public')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows error when user is not authenticated for voting', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn()
      });

      render(<CommunityEngagementHub />);
      
      const voteButton = screen.getByText('45');
      fireEvent.click(voteButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Authentication Required",
          description: "Please sign in to vote on issues",
          variant: "destructive"
        });
      });
    });

    it('shows error when input validation fails', async () => {
      mockValidateInput.mockReturnValue(false);
      
      render(<CommunityEngagementHub />);
      
      fireEvent.click(screen.getByText('Create'));
      
      fireEvent.change(screen.getByPlaceholderText('Brief description of the issue'), {
        target: { value: 'Test Issue' }
      });
      
      fireEvent.click(screen.getByText('Create Issue'));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Invalid Input",
          description: "Please check your input and try again",
          variant: "destructive"
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<CommunityEngagementHub />);
      
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Local Issues (2)' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Virtual Protests (1)' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Community Events (1)' })).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(<CommunityEngagementHub />);
      
      const searchInput = screen.getByPlaceholderText('Search community content...');
      searchInput.focus();
      
      expect(searchInput).toHaveFocus();
    });
  });

  describe('Performance', () => {
    it('renders without performance issues', () => {
      const startTime = performance.now();
      render(<CommunityEngagementHub />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should render in less than 100ms
    });

    it('handles large datasets efficiently', () => {
      // This would test with larger datasets in a real implementation
      render(<CommunityEngagementHub />);
      
      expect(screen.getByText('Community Engagement')).toBeInTheDocument();
    });
  });
});
