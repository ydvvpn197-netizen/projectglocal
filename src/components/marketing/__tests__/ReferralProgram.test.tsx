import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ReferralProgram } from '../ReferralProgram';
import { ReferralService } from '@/services/referralService';
import { SocialSharingService } from '@/services/socialSharingService';

// Mock the services
vi.mock('@/services/referralService', () => ({
  ReferralService: {
    getUserReferralCode: vi.fn(),
    generateReferralLink: vi.fn(),
    getReferralAnalytics: vi.fn(),
    createReferral: vi.fn(),
    trackReferralClick: vi.fn(),
  },
}));

vi.mock('@/services/socialSharingService', () => ({
  SocialSharingService: {
    shareContent: vi.fn(),
  },
}));

// Mock the auth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'user-123',
      email: 'test@example.com',
    },
  }),
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe('ReferralProgram', () => {
  const mockAnalytics = {
    total_referrals: 5,
    successful_referrals: 3,
    conversion_rate: 60.0,
    total_rewards: 300.0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default successful responses
    vi.mocked(ReferralService.getUserReferralCode).mockResolvedValue('REF123456');
    vi.mocked(ReferralService.generateReferralLink).mockResolvedValue('https://example.com/ref/REF123456');
    vi.mocked(ReferralService.getReferralAnalytics).mockResolvedValue(mockAnalytics);
    vi.mocked(ReferralService.createReferral).mockResolvedValue({
      id: 'ref-123',
      referrer_id: 'user-123',
      referral_code: 'REF123456',
      status: 'pending',
    } as any);
    vi.mocked(ReferralService.trackReferralClick).mockResolvedValue();
    vi.mocked(SocialSharingService.shareContent).mockResolvedValue({} as any);
  });

  it('renders loading state initially', () => {
    render(<ReferralProgram />);

    expect(screen.getByText('Referral Program')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders referral program when user has no referral code', async () => {
    vi.mocked(ReferralService.getUserReferralCode).mockResolvedValue(null);

    render(<ReferralProgram />);

    await waitFor(() => {
      expect(screen.getByText("You don't have a referral code yet. Create one to start earning rewards!")).toBeInTheDocument();
      expect(screen.getByText('Create Referral Code')).toBeInTheDocument();
    });
  });

  it('renders referral program with existing code', async () => {
    render(<ReferralProgram />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('REF123456')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com/ref/REF123456')).toBeInTheDocument();
    });
  });

  it('creates referral code when button is clicked', async () => {
    vi.mocked(ReferralService.getUserReferralCode).mockResolvedValue(null);

    render(<ReferralProgram />);

    await waitFor(() => {
      expect(screen.getByText('Create Referral Code')).toBeInTheDocument();
    });

    const createButton = screen.getByText('Create Referral Code');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(ReferralService.createReferral).toHaveBeenCalledWith({
        reward_type: 'credits',
        reward_amount: 100,
        reward_currency: 'USD',
        referral_source: 'web',
      });
    });
  });

  it('copies referral code to clipboard', async () => {
    render(<ReferralProgram />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('REF123456')).toBeInTheDocument();
    });

    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('REF123456');
    });
  });

  it('copies referral link to clipboard', async () => {
    render(<ReferralProgram />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('https://example.com/ref/REF123456')).toBeInTheDocument();
    });

    const copyButtons = screen.getAllByRole('button', { name: /copy/i });
    const linkCopyButton = copyButtons[1]; // Second copy button is for the link
    fireEvent.click(linkCopyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/ref/REF123456');
    });
  });

  it('shares referral link on social platforms', async () => {
    render(<ReferralProgram />);

    await waitFor(() => {
      expect(screen.getByText('Facebook')).toBeInTheDocument();
    });

    const facebookButton = screen.getByText('Facebook');
    fireEvent.click(facebookButton);

    await waitFor(() => {
      expect(SocialSharingService.shareContent).toHaveBeenCalledWith({
        content_type: 'profile',
        content_id: 'user-123',
        platform: 'facebook',
        share_text: 'Join me on The Glocal! Use my referral link: https://example.com/ref/REF123456',
        share_url: 'https://example.com/ref/REF123456',
      });
      expect(ReferralService.trackReferralClick).toHaveBeenCalledWith('REF123456', 'facebook');
    });
  });

  it('displays analytics correctly', async () => {
    render(<ReferralProgram />);

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument(); // total_referrals
      expect(screen.getByText('3')).toBeInTheDocument(); // successful_referrals
      expect(screen.getByText('60.0%')).toBeInTheDocument(); // conversion_rate
      expect(screen.getByText('$300.00')).toBeInTheDocument(); // total_rewards
    });
  });

  it('handles errors gracefully', async () => {
    vi.mocked(ReferralService.getUserReferralCode).mockRejectedValue(new Error('Failed to load'));

    render(<ReferralProgram />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load referral data. Please try again.')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('retries loading data when try again is clicked', async () => {
    vi.mocked(ReferralService.getUserReferralCode)
      .mockRejectedValueOnce(new Error('Failed to load'))
      .mockResolvedValueOnce('REF123456');

    render(<ReferralProgram />);

    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.click(tryAgainButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('REF123456')).toBeInTheDocument();
    });
  });

  it('displays how it works section', async () => {
    render(<ReferralProgram />);

    await waitFor(() => {
      expect(screen.getByText('How It Works')).toBeInTheDocument();
      expect(screen.getByText('Share Your Link')).toBeInTheDocument();
      expect(screen.getByText('Friends Sign Up')).toBeInTheDocument();
      expect(screen.getByText('Earn Rewards')).toBeInTheDocument();
    });
  });

  it('displays rewards information', async () => {
    render(<ReferralProgram />);

    await waitFor(() => {
      expect(screen.getByText('100 Credits')).toBeInTheDocument();
      expect(screen.getByText('per successful referral')).toBeInTheDocument();
      expect(screen.getByText('$10 Bonus')).toBeInTheDocument();
      expect(screen.getByText('after 5 successful referrals')).toBeInTheDocument();
    });
  });
});
