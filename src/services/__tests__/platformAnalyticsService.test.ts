import { PlatformAnalyticsService } from '../platformAnalyticsService';

describe('PlatformAnalyticsService', () => {
  let service: PlatformAnalyticsService;

  beforeEach(() => {
    service = new PlatformAnalyticsService();
  });

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(service.formatNumber(1234)).toBe('1,234');
      expect(service.formatNumber(1234567)).toBe('1,234,567');
      expect(service.formatNumber(0)).toBe('0');
    });
  });

  describe('formatPercentageChange', () => {
    it('should format positive changes with plus sign', () => {
      expect(service.formatPercentageChange(12.5)).toBe('+12.5%');
      expect(service.formatPercentageChange(0)).toBe('+0%');
    });

    it('should format negative changes without plus sign', () => {
      expect(service.formatPercentageChange(-5.2)).toBe('-5.2%');
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard stats structure', async () => {
      const stats = await service.getDashboardStats();
      
      expect(stats).toHaveProperty('current');
      expect(stats).toHaveProperty('dailyChange');
      expect(stats).toHaveProperty('lastUpdated');
      
      expect(stats.current).toHaveProperty('activeUsers');
      expect(stats.current).toHaveProperty('eventsCreated');
      expect(stats.current).toHaveProperty('communities');
      expect(stats.current).toHaveProperty('artists');
      
      expect(stats.dailyChange).toHaveProperty('activeUsers');
      expect(stats.dailyChange).toHaveProperty('eventsCreated');
      expect(stats.dailyChange).toHaveProperty('communities');
      expect(stats.dailyChange).toHaveProperty('artists');
      
      expect(stats.lastUpdated).toBeInstanceOf(Date);
    });
  });
});
