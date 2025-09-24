/**
 * Integration Status Service
 * Provides comprehensive status checking for all external integrations
 */

import { supabaseConfig, googleMapsConfig, stripeConfig, newsConfig, social } from '@/config/environment';
import { isSupabaseConfigured, getSupabaseStatus } from '@/integrations/supabase/client';
import { googleMapsService } from './googleMapsService';

export interface IntegrationStatus {
  name: string;
  configured: boolean;
  connected: boolean;
  error?: string;
  lastChecked: Date;
  features: string[];
  required: boolean;
}

export interface IntegrationHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  integrations: IntegrationStatus[];
  summary: {
    total: number;
    configured: number;
    connected: number;
    required: number;
    optional: number;
  };
}

export class IntegrationStatusService {
  private static instance: IntegrationStatusService;
  private statusCache: Map<string, IntegrationStatus> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  static getInstance(): IntegrationStatusService {
    if (!IntegrationStatusService.instance) {
      IntegrationStatusService.instance = new IntegrationStatusService();
    }
    return IntegrationStatusService.instance;
  }

  /**
   * Get comprehensive integration health status
   */
  async getIntegrationHealth(): Promise<IntegrationHealth> {
    const integrations = await Promise.all([
      this.checkSupabaseIntegration(),
      this.checkGoogleMapsIntegration(),
      this.checkStripeIntegration(),
      this.checkNewsApiIntegration(),
      this.checkSocialMediaIntegrations(),
    ]);

    const summary = this.calculateSummary(integrations);
    const overall = this.determineOverallHealth(integrations, summary);

    return {
      overall,
      integrations,
      summary
    };
  }

  /**
   * Check Supabase integration status
   */
  private async checkSupabaseIntegration(): Promise<IntegrationStatus> {
    const cacheKey = 'supabase';
    const cached = this.getCachedStatus(cacheKey);
    if (cached) return cached;

    const status: IntegrationStatus = {
      name: 'Supabase',
      configured: isSupabaseConfigured(),
      connected: false,
      lastChecked: new Date(),
      features: [
        'Authentication',
        'Database',
        'Real-time subscriptions',
        'File storage',
        'Edge functions'
      ],
      required: true
    };

    if (status.configured) {
      try {
        const supabaseStatus = await getSupabaseStatus();
        status.connected = supabaseStatus.connected;
        if (!supabaseStatus.connected && supabaseStatus.error) {
          status.error = supabaseStatus.error;
        }
      } catch (error) {
        status.connected = false;
        status.error = error instanceof Error ? error.message : 'Unknown error';
      }
    } else {
      status.error = 'Environment variables not configured';
    }

    this.setCachedStatus(cacheKey, status);
    return status;
  }

  /**
   * Check Google Maps integration status
   */
  private async checkGoogleMapsIntegration(): Promise<IntegrationStatus> {
    const cacheKey = 'google-maps';
    const cached = this.getCachedStatus(cacheKey);
    if (cached) return cached;

    const status: IntegrationStatus = {
      name: 'Google Maps',
      configured: googleMapsService.isConfigured(),
      connected: false,
      lastChecked: new Date(),
      features: [
        'Geocoding',
        'Places search',
        'Directions',
        'Static maps',
        'Location services'
      ],
      required: false
    };

    if (status.configured) {
      try {
        // Test with a simple geocoding request
        const testResult = await googleMapsService.geocodeAddress('New York, NY');
        status.connected = testResult !== null;
        if (!status.connected) {
          status.error = 'API request failed';
        }
      } catch (error) {
        status.connected = false;
        status.error = error instanceof Error ? error.message : 'API test failed';
      }
    } else {
      status.error = 'API key not configured';
    }

    this.setCachedStatus(cacheKey, status);
    return status;
  }

  /**
   * Check Stripe integration status
   */
  private async checkStripeIntegration(): Promise<IntegrationStatus> {
    const cacheKey = 'stripe';
    const cached = this.getCachedStatus(cacheKey);
    if (cached) return cached;

    const status: IntegrationStatus = {
      name: 'Stripe',
      configured: !!(stripeConfig.publishableKey && stripeConfig.publishableKey !== ''),
      connected: false,
      lastChecked: new Date(),
      features: [
        'Payment processing',
        'Subscription management',
        'Webhook handling',
        'Customer management'
      ],
      required: false
    };

    if (status.configured) {
      try {
        // Test Stripe configuration by checking if the publishable key is valid format
        const isValidKey = stripeConfig.publishableKey.startsWith('pk_');
        status.connected = isValidKey;
        if (!isValidKey) {
          status.error = 'Invalid publishable key format';
        }
      } catch (error) {
        status.connected = false;
        status.error = error instanceof Error ? error.message : 'Configuration test failed';
      }
    } else {
      status.error = 'API keys not configured';
    }

    this.setCachedStatus(cacheKey, status);
    return status;
  }

  /**
   * Check News API integration status
   */
  private async checkNewsApiIntegration(): Promise<IntegrationStatus> {
    const cacheKey = 'news-api';
    const cached = this.getCachedStatus(cacheKey);
    if (cached) return cached;

    const status: IntegrationStatus = {
      name: 'News API',
      configured: !!(newsConfig.apiKey && newsConfig.apiKey !== ''),
      connected: false,
      lastChecked: new Date(),
      features: [
        'News aggregation',
        'Local news',
        'Category filtering',
        'Location-based news'
      ],
      required: false
    };

    if (status.configured) {
      try {
        // Test with a simple news API request
        const testUrl = `https://newsapi.org/v2/top-headlines?country=us&pageSize=1&apiKey=${newsConfig.apiKey}`;
        const response = await fetch(testUrl);
        status.connected = response.ok;
        if (!response.ok) {
          status.error = `API request failed with status ${response.status}`;
        }
      } catch (error) {
        status.connected = false;
        status.error = error instanceof Error ? error.message : 'API test failed';
      }
    } else {
      status.error = 'API key not configured';
    }

    this.setCachedStatus(cacheKey, status);
    return status;
  }

  /**
   * Check social media integrations status
   */
  private async checkSocialMediaIntegrations(): Promise<IntegrationStatus> {
    const cacheKey = 'social-media';
    const cached = this.getCachedStatus(cacheKey);
    if (cached) return cached;

    const configuredPlatforms = [];
    const missingPlatforms = [];

    if (social.facebook.appId) configuredPlatforms.push('Facebook');
    else missingPlatforms.push('Facebook');

    if (social.twitter.apiKey) configuredPlatforms.push('Twitter');
    else missingPlatforms.push('Twitter');

    if (social.linkedin.clientId) configuredPlatforms.push('LinkedIn');
    else missingPlatforms.push('LinkedIn');

    if (social.whatsapp.apiKey) configuredPlatforms.push('WhatsApp');
    else missingPlatforms.push('WhatsApp');

    if (social.telegram.botToken) configuredPlatforms.push('Telegram');
    else missingPlatforms.push('Telegram');

    const status: IntegrationStatus = {
      name: 'Social Media',
      configured: configuredPlatforms.length > 0,
      connected: configuredPlatforms.length > 0,
      lastChecked: new Date(),
      features: [
        'Content sharing',
        'Social login',
        'Analytics tracking',
        'Cross-platform posting'
      ],
      required: false
    };

    if (configuredPlatforms.length === 0) {
      status.error = 'No social media platforms configured';
    } else if (missingPlatforms.length > 0) {
      status.error = `Missing: ${missingPlatforms.join(', ')}`;
    }

    this.setCachedStatus(cacheKey, status);
    return status;
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(integrations: IntegrationStatus[]) {
    const total = integrations.length;
    const configured = integrations.filter(i => i.configured).length;
    const connected = integrations.filter(i => i.connected).length;
    const required = integrations.filter(i => i.required).length;
    const optional = integrations.filter(i => !i.required).length;

    return {
      total,
      configured,
      connected,
      required,
      optional
    };
  }

  /**
   * Determine overall health status
   */
  private determineOverallHealth(
    integrations: IntegrationStatus[],
    summary: ReturnType<IntegrationStatusService['calculateSummary']>
  ): 'healthy' | 'degraded' | 'unhealthy' {
    const requiredConnected = integrations
      .filter(i => i.required)
      .every(i => i.connected);

    if (!requiredConnected) {
      return 'unhealthy';
    }

    const connectedRatio = summary.connected / summary.total;
    if (connectedRatio >= 0.8) {
      return 'healthy';
    } else if (connectedRatio >= 0.5) {
      return 'degraded';
    } else {
      return 'unhealthy';
    }
  }

  /**
   * Get cached status if still valid
   */
  private getCachedStatus(key: string): IntegrationStatus | null {
    const cached = this.statusCache.get(key);
    if (cached && Date.now() - cached.lastChecked.getTime() < this.cacheExpiry) {
      return cached;
    }
    return null;
  }

  /**
   * Set cached status
   */
  private setCachedStatus(key: string, status: IntegrationStatus): void {
    this.statusCache.set(key, status);
  }

  /**
   * Clear status cache
   */
  clearCache(): void {
    this.statusCache.clear();
  }

  /**
   * Get integration configuration guide
   */
  getConfigurationGuide(): Record<string, { envVars: string[]; description: string; setupUrl?: string }> {
    return {
      'Supabase': {
        envVars: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'],
        description: 'Backend-as-a-Service for authentication, database, and real-time features',
        setupUrl: 'https://supabase.com'
      },
      'Google Maps': {
        envVars: ['VITE_GOOGLE_MAPS_API_KEY'],
        description: 'Location services, geocoding, and maps integration',
        setupUrl: 'https://developers.google.com/maps'
      },
      'Stripe': {
        envVars: ['VITE_STRIPE_PUBLISHABLE_KEY', 'VITE_STRIPE_SECRET_KEY', 'VITE_STRIPE_WEBHOOK_SECRET'],
        description: 'Payment processing and subscription management',
        setupUrl: 'https://stripe.com'
      },
      'News API': {
        envVars: ['VITE_NEWS_API_KEY'],
        description: 'News aggregation and local news feeds',
        setupUrl: 'https://newsapi.org'
      },
      'Social Media': {
        envVars: ['VITE_FACEBOOK_APP_ID', 'VITE_TWITTER_API_KEY', 'VITE_LINKEDIN_CLIENT_ID', 'VITE_WHATSAPP_API_KEY', 'VITE_TELEGRAM_BOT_TOKEN'],
        description: 'Social media sharing and integration',
        setupUrl: 'https://developers.facebook.com'
      }
    };
  }
}

// Export singleton instance
export const integrationStatusService = IntegrationStatusService.getInstance();
