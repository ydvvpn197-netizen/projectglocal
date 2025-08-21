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

// Mock the referral config hook
vi.mock('@/hooks/useReferralConfig', () => ({
  useReferralConfig: () => ({
    config: {
      creditsPerReferral: 100,
      bonusAfterReferrals: 10,
      referralsForBonus: 5,
      referralCodeLength: 8,
      maxReferralsPerUser: 50,
      referralExpiryDays: 30,
      minReferralAmount: 0,
      currency: 'USD',
      supportedPlatforms: ['facebook', 'twitter', 'linkedin', 'whatsapp'],
      defaultShareText: 'Join me on The Glocal! Use my referral link: {referralLink}',
      analyticsEnabled: true,
      trackingEnabled: true
    },
    loading: false,
    errors: [],
    updateConfig: vi.fn(),
    resetConfig: vi.fn(),
    isConfigLoaded: true,
    isValid: true
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
    average_reward: 100.0,
    referral_trend: [
      { date: '2024-01-01', referrals: 1, conversions: 1 },
      { date: '2024-01-02', referrals: 2, conversions: 1 }
    ],
    top_referrers: [
      {
        user_id: 'user-123',
        username: 'testuser',
        referral_count: 5,
        total_rewards: 300.0
      }
    ]
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
    vi.mocked(ReferralService.createReferral).mockResolvedValue({
      id: 'ref-123',
      referrer_id: 'user-123',
      referral_code: 'REF123456',
      status: 'pending',
    } as any);

    render(<ReferralProgram />);

    await waitFor(() => {
      expect(screen.getByText(/You don't have a referral code yet/)).toBeInTheDocument();
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
    vi.mocked(ReferralService.createReferral).mockResolvedValue({
      id: 'ref-123',
      referrer_id: 'user-123',
      referral_code: 'REF123456',
      status: 'pending',
    } as any);

    render(<ReferralProgram />);

    // Wait for the component to finish loading and show the "no referral code" state
    await waitFor(() => {
      expect(screen.getByText('Create Referral Code')).toBeInTheDocument();
    });

    const createButton = screen.getByText('Create Referral Code');
    fireEvent.click(createButton);

    // Wait for the createReferral to be called
    await waitFor(() => {
      expect(ReferralService.createReferral).toHaveBeenCalledWith({
        reward_type: 'credits',
        reward_amount: 100,
        reward_currency: 'USD',
        referral_source: 'web'
      });
    });
  });

  it('copies referral code to clipboard', async () => {
    render(<ReferralProgram />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('REF123456')).toBeInTheDocument();
    });

    const copyButton = screen.getByLabelText('Copy referral code');
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('REF123456');
  });

  it('copies referral link to clipboard', async () => {
    render(<ReferralProgram />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('https://example.com/ref/REF123456')).toBeInTheDocument();
    });

    const copyButton = screen.getByLabelText('Copy referral link');
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/ref/REF123456');
  });

  it('shares referral link on social platforms', async () => {
    render(<ReferralProgram />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('REF123456')).toBeInTheDocument();
    });

    const shareButtons = screen.getAllByText(/facebook|twitter|linkedin|whatsapp/i);
    expect(shareButtons.length).toBeGreaterThan(0);

    // Test sharing on first platform
    fireEvent.click(shareButtons[0]);

    await waitFor(() => {
      expect(SocialSharingService.shareContent).toHaveBeenCalled();
      expect(ReferralService.trackReferralClick).toHaveBeenCalled();
    });
  });

  it('displays analytics correctly', async () => {
    render(<ReferralProgram />);

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument(); // total_referrals
      expect(screen.getAllByText('3')[0]).toBeInTheDocument(); // successful_referrals
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
      expect(screen.getAllByText('Share Your Link')[1]).toBeInTheDocument(); // Use the second occurrence (in the how it works section)
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
