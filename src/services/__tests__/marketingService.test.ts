import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MarketingService } from '../marketingService';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
        order: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
    auth: {
      getUser: vi.fn(() => ({
        data: {
          user: {
            id: 'user-123',
          },
        },
      })),
    },
  },
}));

describe('MarketingService', () => {
  const mockCampaign = {
    id: 'campaign-123',
    name: 'Test Campaign',
    description: 'Test Description',
    campaign_type: 'promotional' as const,
    status: 'active' as const,
    start_date: '2024-01-01T00:00:00Z',
    end_date: '2024-12-31T23:59:59Z',
    target_audience: {},
    campaign_config: {},
    budget: 1000,
    spent: 500,
    impressions: 1000,
    clicks: 100,
    conversions: 10,
    conversion_rate: 0.1,
    roi: 2.0,
    created_by: 'user-123',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockCreateCampaignData = {
    name: 'Test Campaign',
    description: 'Test Description',
    campaign_type: 'promotional' as const,
    status: 'active' as const,
    start_date: '2024-01-01T00:00:00Z',
    end_date: '2024-12-31T23:59:59Z',
    target_audience: {},
    campaign_config: {},
    budget: 1000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCampaign', () => {
    it('creates a campaign successfully', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockInsert = vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: mockCampaign,
            error: null,
          })),
        })),
      }));
      const mockFrom = vi.fn(() => ({
        insert: mockInsert,
      }));
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await MarketingService.createCampaign(mockCreateCampaignData);

      expect(supabase.from).toHaveBeenCalledWith('marketing_campaigns');
      expect(mockInsert).toHaveBeenCalledWith({
        ...mockCreateCampaignData,
        created_by: 'user-123',
      });
      expect(result).toEqual(mockCampaign);
    });

    it('throws error when campaign creation fails', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockError = new Error('Database error');
      const mockInsert = vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: mockError,
          })),
        })),
      }));
      const mockFrom = vi.fn(() => ({
        insert: mockInsert,
      }));
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      await expect(MarketingService.createCampaign(mockCreateCampaignData)).rejects.toThrow('Database error');
    });
  });

  describe('getCampaigns', () => {
    it('fetches campaigns without filters', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockOrder = vi.fn(() => ({
        data: [mockCampaign],
        error: null,
      }));
      const mockSelect = vi.fn(() => ({
        order: mockOrder,
      }));
      const mockFrom = vi.fn(() => ({
        select: mockSelect,
      }));
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await MarketingService.getCampaigns();

      expect(supabase.from).toHaveBeenCalledWith('marketing_campaigns');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual([mockCampaign]);
    });

    it('fetches campaigns with filters', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockOrder = vi.fn(() => ({
        data: [mockCampaign],
        error: null,
      }));
      const mockEq = vi.fn(() => ({
        order: mockOrder,
      }));
      const mockSelect = vi.fn(() => ({
        eq: mockEq,
      }));
      const mockFrom = vi.fn(() => ({
        select: mockSelect,
      }));
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await MarketingService.getCampaigns({
        status: 'active',
        campaign_type: 'promotional',
        created_by: 'user-123',
      });

      expect(supabase.from).toHaveBeenCalledWith('marketing_campaigns');
      expect(mockEq).toHaveBeenCalledWith('status', 'active');
      expect(result).toEqual([mockCampaign]);
    });

    it('returns empty array when no campaigns found', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockOrder = vi.fn(() => ({
        data: null,
        error: null,
      }));
      const mockSelect = vi.fn(() => ({
        order: mockOrder,
      }));
      const mockFrom = vi.fn(() => ({
        select: mockSelect,
      }));
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await MarketingService.getCampaigns();

      expect(result).toEqual([]);
    });
  });

  describe('getCampaign', () => {
    it('fetches a single campaign by id', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockSingle = vi.fn(() => ({
        data: mockCampaign,
        error: null,
      }));
      const mockEq = vi.fn(() => ({
        single: mockSingle,
      }));
      const mockSelect = vi.fn(() => ({
        eq: mockEq,
      }));
      const mockFrom = vi.fn(() => ({
        select: mockSelect,
      }));
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await MarketingService.getCampaign('campaign-123');

      expect(supabase.from).toHaveBeenCalledWith('marketing_campaigns');
      expect(mockEq).toHaveBeenCalledWith('id', 'campaign-123');
      expect(result).toEqual(mockCampaign);
    });

    it('throws error when campaign not found', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockError = new Error('Campaign not found');
      const mockSingle = vi.fn(() => ({
        data: null,
        error: mockError,
      }));
      const mockEq = vi.fn(() => ({
        single: mockSingle,
      }));
      const mockSelect = vi.fn(() => ({
        eq: mockEq,
      }));
      const mockFrom = vi.fn(() => ({
        select: mockSelect,
      }));
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      await expect(MarketingService.getCampaign('campaign-123')).rejects.toThrow('Campaign not found');
    });
  });

  describe('updateCampaign', () => {
    it('updates a campaign successfully', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockSingle = vi.fn(() => ({
        data: { ...mockCampaign, name: 'Updated Campaign' },
        error: null,
      }));
      const mockSelect = vi.fn(() => ({
        single: mockSingle,
      }));
      const mockEq = vi.fn(() => ({
        select: mockSelect,
      }));
      const mockUpdate = vi.fn(() => ({
        eq: mockEq,
      }));
      const mockFrom = vi.fn(() => ({
        update: mockUpdate,
      }));
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const updateData = { name: 'Updated Campaign' };
      const result = await MarketingService.updateCampaign('campaign-123', updateData);

      expect(supabase.from).toHaveBeenCalledWith('marketing_campaigns');
      expect(mockUpdate).toHaveBeenCalledWith({
        ...updateData,
        updated_at: expect.any(String),
      });
      expect(mockEq).toHaveBeenCalledWith('id', 'campaign-123');
      expect(result.name).toBe('Updated Campaign');
    });
  });

  describe('deleteCampaign', () => {
    it('deletes a campaign successfully', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockEq = vi.fn(() => ({
        error: null,
      }));
      const mockDelete = vi.fn(() => ({
        eq: mockEq,
      }));
      const mockFrom = vi.fn(() => ({
        delete: mockDelete,
      }));
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      await MarketingService.deleteCampaign('campaign-123');

      expect(supabase.from).toHaveBeenCalledWith('marketing_campaigns');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'campaign-123');
    });

    it('throws error when deletion fails', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockError = new Error('Deletion failed');
      const mockEq = vi.fn(() => ({
        error: mockError,
      }));
      const mockDelete = vi.fn(() => ({
        eq: mockEq,
      }));
      const mockFrom = vi.fn(() => ({
        delete: mockDelete,
      }));
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      await expect(MarketingService.deleteCampaign('campaign-123')).rejects.toThrow('Deletion failed');
    });
  });
});
