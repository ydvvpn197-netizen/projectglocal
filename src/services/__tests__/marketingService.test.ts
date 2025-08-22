// @ts-nocheck
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MarketingService } from '../marketingService';
import { supabase } from '@/integrations/supabase/client';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock the database availability check
vi.mock('@/utils/databaseUtils', () => ({
  checkTableExists: vi.fn().mockResolvedValue(true),
}));

describe('MarketingService', () => {
  const mockCampaign = {
    id: 'campaign-123',
    name: 'Test Campaign',
    description: 'A test campaign',
    campaign_type: 'promotional',
    status: 'active',
    start_date: '2024-01-01T00:00:00Z',
    end_date: '2024-12-31T23:59:59Z',
    budget: 1000,
    spent: 500,
    impressions: 10000,
    clicks: 500,
    conversions: 50,
    conversion_rate: 0.1,
    roi: 2.0,
    created_by: 'user-123',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockCreateCampaignData = {
    name: 'New Campaign',
    description: 'A new campaign',
    campaign_type: 'promotional',
    start_date: '2024-01-01T00:00:00Z',
    end_date: '2024-12-31T23:59:59Z',
    budget: 1000,
    target_audience: { age_range: [18, 35] },
    campaign_config: { platforms: ['facebook', 'instagram'] },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCampaign', () => {
    it('creates a campaign successfully', async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: [mockCampaign],
        error: null,
      });

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await MarketingService.createCampaign(mockCreateCampaignData);

      expect(supabase.from).toHaveBeenCalledWith('marketing_campaigns');
      expect(mockInsert).toHaveBeenCalledWith({
        ...mockCreateCampaignData,
        status: 'draft',
        created_by: undefined, // Will be set by RLS
      });
      expect(result).toEqual(mockCampaign);
    });

    it('throws error when campaign creation fails', async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom);

      await expect(MarketingService.createCampaign(mockCreateCampaignData)).rejects.toThrow('Marketing features are not available');
    });
  });

  describe('getCampaigns', () => {
    it('fetches campaigns without filters', async () => {
      const mockSelect = vi.fn().mockResolvedValue({
        data: [mockCampaign],
        error: null,
      });

      const mockOrder = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      const mockFrom = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await MarketingService.getCampaigns();

      expect(supabase.from).toHaveBeenCalledWith('marketing_campaigns');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual([mockCampaign]);
    });

    it('fetches campaigns with filters', async () => {
      const mockSelect = vi.fn().mockResolvedValue({
        data: [mockCampaign],
        error: null,
      });

      const mockOrder = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      const mockEq = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockFrom = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await MarketingService.getCampaigns({
        status: 'active',
      });

      expect(supabase.from).toHaveBeenCalledWith('marketing_campaigns');
      expect(mockEq).toHaveBeenCalledWith('status', 'active');
      expect(result).toEqual([mockCampaign]);
    });

    it('returns empty array when no campaigns found', async () => {
      const mockSelect = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      const mockOrder = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      const mockFrom = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await MarketingService.getCampaigns();

      expect(result).toEqual([]);
    });
  });

  describe('getCampaign', () => {
    it('fetches a single campaign by id', async () => {
      const mockSelect = vi.fn().mockResolvedValue({
        data: [mockCampaign],
        error: null,
      });

      const mockEq = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      const mockFrom = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await MarketingService.getCampaign('campaign-123');

      expect(supabase.from).toHaveBeenCalledWith('marketing_campaigns');
      expect(mockEq).toHaveBeenCalledWith('id', 'campaign-123');
      expect(result).toEqual(mockCampaign);
    });

    it('throws error when campaign not found', async () => {
      const mockSelect = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      const mockEq = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      const mockFrom = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom);

      await expect(MarketingService.getCampaign('campaign-123')).rejects.toThrow('Marketing features are not available');
    });
  });

  describe('updateCampaign', () => {
    it('updates a campaign successfully', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({
        data: [mockCampaign],
        error: null,
      });

      const mockEq = vi.fn().mockReturnValue({
        update: mockUpdate,
      });

      const mockFrom = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const updateData = { name: 'Updated Campaign' };
      const result = await MarketingService.updateCampaign('campaign-123', updateData);

      expect(supabase.from).toHaveBeenCalledWith('marketing_campaigns');
      expect(mockEq).toHaveBeenCalledWith('id', 'campaign-123');
      expect(mockUpdate).toHaveBeenCalledWith(updateData);
      expect(result).toEqual(mockCampaign);
    });
  });

  describe('deleteCampaign', () => {
    it('deletes a campaign successfully', async () => {
      const mockDelete = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockEq = vi.fn().mockReturnValue({
        delete: mockDelete,
      });

      const mockFrom = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom);

      await MarketingService.deleteCampaign('campaign-123');

      expect(supabase.from).toHaveBeenCalledWith('marketing_campaigns');
      expect(mockEq).toHaveBeenCalledWith('id', 'campaign-123');
      expect(mockDelete).toHaveBeenCalled();
    });

    it('throws error when deletion fails', async () => {
      const mockDelete = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Deletion failed' },
      });

      const mockEq = vi.fn().mockReturnValue({
        delete: mockDelete,
      });

      const mockFrom = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom);

      await expect(MarketingService.deleteCampaign('campaign-123')).rejects.toThrow('Marketing features are not available');
    });
  });
});
