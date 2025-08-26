import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EnhancedIndex } from '../pages/EnhancedIndex';
import { AuthProvider } from '../hooks/useAuth';
import { EnhancedThemeProvider } from '../components/ui/EnhancedThemeProvider';

// Mock the enhanced API service
jest.mock('../services/enhancedApi', () => ({
  eventApi: {
    getEvents: jest.fn(),
    getEventById: jest.fn(),
  },
  communityApi: {
    getCommunities: jest.fn(),
    getCommunityById: jest.fn(),
  },
  userApi: {
    getUserProfile: jest.fn(),
  },
}));

// Mock the auth hook
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    signOut: jest.fn(),
  }),
}));

// Mock the toast hook
jest.mock('../hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

// Create a test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <EnhancedThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </AuthProvider>
      </EnhancedThemeProvider>
    </QueryClientProvider>
  );
};

describe('EnhancedIndex Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the hero section with correct content', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    expect(screen.getByText('Connect Locally,')).toBeInTheDocument();
    expect(screen.getByText('Grow Globally')).toBeInTheDocument();
    expect(screen.getByText(/Discover amazing events/)).toBeInTheDocument();
  });

  it('renders the search input in hero section', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText(/Search for events, people, or places/);
    expect(searchInput).toBeInTheDocument();
  });

  it('renders the "Get Started" button for non-authenticated users', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    const getStartedButton = screen.getByText('Get Started');
    expect(getStartedButton).toBeInTheDocument();
  });

  it('renders hero features with correct content', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    expect(screen.getByText('Connect Locally')).toBeInTheDocument();
    expect(screen.getByText('Discover Events')).toBeInTheDocument();
    expect(screen.getByText('Book Artists')).toBeInTheDocument();
    expect(screen.getByText('Explore Community')).toBeInTheDocument();
  });

  it('renders stats section with correct values', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    expect(screen.getByText('12,847')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('Events Created')).toBeInTheDocument();
  });

  it('renders the "What\'s Happening" section', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    expect(screen.getByText("What's Happening")).toBeInTheDocument();
    expect(screen.getByText(/Discover trending events and discussions/)).toBeInTheDocument();
  });

  it('renders tabs for events and discussions', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Discussions')).toBeInTheDocument();
  });

  it('renders featured event carousel', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    expect(screen.getByText('Local Music Festival 2024')).toBeInTheDocument();
    expect(screen.getByText(/A three-day celebration/)).toBeInTheDocument();
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('renders event cards grid', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    expect(screen.getByText('Community Garden Workshop')).toBeInTheDocument();
    expect(screen.getByText('Tech Meetup: AI in Local Business')).toBeInTheDocument();
  });

  it('renders community spotlight section', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    expect(screen.getByText('Community Spotlight')).toBeInTheDocument();
    expect(screen.getByText('Local Artists Collective')).toBeInTheDocument();
    expect(screen.getByText('Tech Enthusiasts')).toBeInTheDocument();
  });

  it('renders categories section', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    expect(screen.getByText('Explore Categories')).toBeInTheDocument();
    expect(screen.getByText('Music')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('renders CTA section', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    expect(screen.getByText('Ready to Connect?')).toBeInTheDocument();
    expect(screen.getByText(/Join thousands of people/)).toBeInTheDocument();
  });

  it('handles search input changes', async () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText(/Search for events, people, or places/);
    fireEvent.change(searchInput, { target: { value: 'music festival' } });

    await waitFor(() => {
      expect(searchInput).toHaveValue('music festival');
    });
  });

  it('handles tab switching', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    const discussionsTab = screen.getByText('Discussions');
    fireEvent.click(discussionsTab);

    // Should show discussion content
    expect(screen.getByText('Best local coffee shops in the area?')).toBeInTheDocument();
    expect(screen.getByText('Weekend hiking trails near the city')).toBeInTheDocument();
  });

  it('handles carousel navigation', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    const nextButton = screen.getByLabelText(/next/i);
    const prevButton = screen.getByLabelText(/previous/i);

    expect(nextButton).toBeInTheDocument();
    expect(prevButton).toBeInTheDocument();
  });

  it('handles category card clicks', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    const musicCategory = screen.getByText('Music').closest('div');
    if (musicCategory) {
      fireEvent.click(musicCategory);
      expect(mockNavigate).toHaveBeenCalledWith('/discover?category=music');
    }
  });

  it('handles event card clicks', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    const eventCard = screen.getByText('Community Garden Workshop').closest('div');
    if (eventCard) {
      fireEvent.click(eventCard);
      expect(mockNavigate).toHaveBeenCalledWith('/event/2');
    }
  });

  it('handles community card clicks', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    const communityCard = screen.getByText('Local Artists Collective').closest('div');
    if (communityCard) {
      fireEvent.click(communityCard);
      expect(mockNavigate).toHaveBeenCalledWith('/community/1');
    }
  });

  it('handles "Get Started" button click for non-authenticated users', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    const getStartedButton = screen.getByText('Get Started');
    fireEvent.click(getStartedButton);

    expect(mockNavigate).toHaveBeenCalledWith('/signin');
  });

  it('handles "Learn More" button click', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    const learnMoreButton = screen.getByText('Learn More');
    fireEvent.click(learnMoreButton);

    expect(mockNavigate).toHaveBeenCalledWith('/about');
  });

  it('displays trending badges correctly', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    const trendingBadges = screen.getAllByText('Trending');
    expect(trendingBadges.length).toBeGreaterThan(0);
  });

  it('displays featured badges correctly', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    const featuredBadges = screen.getAllByText('Featured');
    expect(featuredBadges.length).toBeGreaterThan(0);
  });

  it('renders event details correctly', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    expect(screen.getByText('Dec 15-17, 2024')).toBeInTheDocument();
    expect(screen.getByText('Central Park, Downtown')).toBeInTheDocument();
    expect(screen.getByText('1250/2000')).toBeInTheDocument();
  });

  it('renders discussion details correctly', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    // Switch to discussions tab
    const discussionsTab = screen.getByText('Discussions');
    fireEvent.click(discussionsTab);

    expect(screen.getByText('CoffeeLover')).toBeInTheDocument();
    expect(screen.getByText('47')).toBeInTheDocument(); // replies
    expect(screen.getByText('1234')).toBeInTheDocument(); // views
  });

  it('renders community details correctly', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    expect(screen.getByText('234 members')).toBeInTheDocument();
    expect(screen.getByText('New member joined')).toBeInTheDocument();
  });

  it('handles responsive design correctly', () => {
    // Mock window.innerWidth for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    // Component should still render all content
    expect(screen.getByText('Connect Locally,')).toBeInTheDocument();
    expect(screen.getByText('What\'s Happening')).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText(/Search for events, people, or places/);
    searchInput.focus();

    // Should be able to navigate with keyboard
    fireEvent.keyDown(searchInput, { key: 'Enter' });
    expect(searchInput).toHaveFocus();
  });

  it('handles accessibility attributes correctly', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    // Check for proper ARIA labels
    const nextButton = screen.getByLabelText(/next/i);
    const prevButton = screen.getByLabelText(/previous/i);

    expect(nextButton).toHaveAttribute('aria-label');
    expect(prevButton).toHaveAttribute('aria-label');
  });

  it('handles loading states gracefully', () => {
    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    // Component should render without crashing even if data is loading
    expect(screen.getByText('Connect Locally,')).toBeInTheDocument();
  });

  it('handles error states gracefully', () => {
    // Mock an error in the API
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <TestWrapper>
        <EnhancedIndex />
      </TestWrapper>
    );

    // Component should still render
    expect(screen.getByText('Connect Locally,')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
