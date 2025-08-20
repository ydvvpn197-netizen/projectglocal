import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SocialShareButton } from '../SocialShareButton';
import { SocialSharingService } from '@/services/socialSharingService';

// Mock the services
vi.mock('@/services/socialSharingService', () => ({
  SocialSharingService: {
    shareContent: vi.fn(),
    openShareDialog: vi.fn(),
  },
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('SocialShareButton', () => {
  const mockContent = {
    content_type: 'post' as const,
    content_id: '123',
    share_text: 'Check out this post',
    share_url: 'https://example.com/post/123',
  };

  const mockOnShare = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    render(
      <SocialShareButton 
        content={mockContent}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Share');
  });

  it('renders with custom label when showLabel is true', () => {
    render(
      <SocialShareButton 
        content={mockContent}
        showLabel={true}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByRole('button')).toHaveTextContent('Share');
  });

  it('shows platform selection when multiple platforms are available', async () => {
    render(
      <SocialShareButton 
        content={mockContent}
        platforms={['facebook', 'twitter', 'linkedin']}
        onShare={mockOnShare}
      />
    );

    const shareButton = screen.getByRole('button');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    });
  });

  it('directly shares when only one platform is specified', async () => {
    const mockShareContent = vi.mocked(SocialSharingService.shareContent);
    const mockOpenShareDialog = vi.mocked(SocialSharingService.openShareDialog);

    render(
      <SocialShareButton 
        content={mockContent}
        platforms={['facebook']}
        onShare={mockOnShare}
      />
    );

    const shareButton = screen.getByRole('button');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockShareContent).toHaveBeenCalledWith({
        ...mockContent,
        platform: 'facebook',
      });
      expect(mockOpenShareDialog).toHaveBeenCalledWith('facebook', mockContent);
      expect(mockOnShare).toHaveBeenCalledWith('facebook');
    });
  });

  it('handles share errors gracefully', async () => {
    const mockShareContent = vi.mocked(SocialSharingService.shareContent);
    mockShareContent.mockRejectedValueOnce(new Error('Share failed'));

    render(
      <SocialShareButton 
        content={mockContent}
        platforms={['facebook']}
        onShare={mockOnShare}
      />
    );

    const shareButton = screen.getByRole('button');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockShareContent).toHaveBeenCalled();
    });
  });

  it('applies custom className', () => {
    render(
      <SocialShareButton 
        content={mockContent}
        className="custom-class"
        onShare={mockOnShare}
      />
    );

    const container = screen.getByRole('button').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('disables button during sharing', async () => {
    const mockShareContent = vi.mocked(SocialSharingService.shareContent);
    mockShareContent.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <SocialShareButton 
        content={mockContent}
        platforms={['facebook']}
        onShare={mockOnShare}
      />
    );

    const shareButton = screen.getByRole('button');
    fireEvent.click(shareButton);

    expect(shareButton).toBeDisabled();
  });

  it('renders with different variants', () => {
    const { rerender } = render(
      <SocialShareButton 
        content={mockContent}
        variant="outline"
        onShare={mockOnShare}
      />
    );

    expect(screen.getByRole('button')).toHaveClass('outline');

    rerender(
      <SocialShareButton 
        content={mockContent}
        variant="ghost"
        onShare={mockOnShare}
      />
    );

    expect(screen.getByRole('button')).toHaveClass('ghost');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(
      <SocialShareButton 
        content={mockContent}
        size="sm"
        onShare={mockOnShare}
      />
    );

    expect(screen.getByRole('button')).toHaveClass('sm');

    rerender(
      <SocialShareButton 
        content={mockContent}
        size="lg"
        onShare={mockOnShare}
      />
    );

    expect(screen.getByRole('button')).toHaveClass('lg');
  });
});
