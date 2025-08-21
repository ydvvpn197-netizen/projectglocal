/**
 * Referral Configuration
 * 
 * This file contains all configurable values for the referral program.
 * Values can be overridden through environment variables.
 */

export interface ReferralConfig {
  // Reward settings
  creditsPerReferral: number;
  bonusAfterReferrals: number;
  referralsForBonus: number;
  
  // Code generation settings
  referralCodeLength: number;
  maxReferralsPerUser: number;
  referralExpiryDays: number;
  
  // Financial settings
  minReferralAmount: number;
  currency: string;
  
  // Platform settings
  supportedPlatforms: string[];
  defaultShareText: string;
  
  // Analytics settings
  analyticsEnabled: boolean;
  trackingEnabled: boolean;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: ReferralConfig = {
  // Reward settings
  creditsPerReferral: 100,
  bonusAfterReferrals: 10,
  referralsForBonus: 5,
  
  // Code generation settings
  referralCodeLength: 8,
  maxReferralsPerUser: 50,
  referralExpiryDays: 30,
  
  // Financial settings
  minReferralAmount: 0,
  currency: 'USD',
  
  // Platform settings
  supportedPlatforms: ['facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram', 'email', 'sms'],
  defaultShareText: 'Join me on The Glocal! Use my referral link: {referralLink}',
  
  // Analytics settings
  analyticsEnabled: true,
  trackingEnabled: true
};

/**
 * Load configuration from environment variables
 */
const loadConfigFromEnv = (): Partial<ReferralConfig> => {
  return {
    creditsPerReferral: Number(import.meta.env.VITE_REFERRAL_CREDITS) || DEFAULT_CONFIG.creditsPerReferral,
    bonusAfterReferrals: Number(import.meta.env.VITE_REFERRAL_BONUS) || DEFAULT_CONFIG.bonusAfterReferrals,
    referralsForBonus: Number(import.meta.env.VITE_REFERRALS_FOR_BONUS) || DEFAULT_CONFIG.referralsForBonus,
    referralCodeLength: Number(import.meta.env.VITE_REFERRAL_CODE_LENGTH) || DEFAULT_CONFIG.referralCodeLength,
    maxReferralsPerUser: Number(import.meta.env.VITE_MAX_REFERRALS) || DEFAULT_CONFIG.maxReferralsPerUser,
    referralExpiryDays: Number(import.meta.env.VITE_REFERRAL_EXPIRY_DAYS) || DEFAULT_CONFIG.referralExpiryDays,
    minReferralAmount: Number(import.meta.env.VITE_MIN_REFERRAL_AMOUNT) || DEFAULT_CONFIG.minReferralAmount,
    currency: import.meta.env.VITE_REFERRAL_CURRENCY || DEFAULT_CONFIG.currency,
    analyticsEnabled: import.meta.env.VITE_REFERRAL_ANALYTICS_ENABLED !== 'false',
    trackingEnabled: import.meta.env.VITE_REFERRAL_TRACKING_ENABLED !== 'false'
  };
};

/**
 * Get the current referral configuration
 */
export const getReferralConfig = (): ReferralConfig => {
  const envConfig = loadConfigFromEnv();
  return { ...DEFAULT_CONFIG, ...envConfig };
};

/**
 * Update configuration (for testing or runtime updates)
 */
export const updateReferralConfig = (updates: Partial<ReferralConfig>): ReferralConfig => {
  const currentConfig = getReferralConfig();
  return { ...currentConfig, ...updates };
};

/**
 * Validate configuration values
 */
export const validateReferralConfig = (config: ReferralConfig): string[] => {
  const errors: string[] = [];

  if (config.creditsPerReferral < 0) {
    errors.push('creditsPerReferral must be non-negative');
  }

  if (config.bonusAfterReferrals < 0) {
    errors.push('bonusAfterReferrals must be non-negative');
  }

  if (config.referralsForBonus < 1) {
    errors.push('referralsForBonus must be at least 1');
  }

  if (config.referralCodeLength < 4 || config.referralCodeLength > 20) {
    errors.push('referralCodeLength must be between 4 and 20');
  }

  if (config.maxReferralsPerUser < 1) {
    errors.push('maxReferralsPerUser must be at least 1');
  }

  if (config.referralExpiryDays < 1) {
    errors.push('referralExpiryDays must be at least 1');
  }

  if (config.minReferralAmount < 0) {
    errors.push('minReferralAmount must be non-negative');
  }

  if (!config.currency || config.currency.length !== 3) {
    errors.push('currency must be a 3-letter currency code');
  }

  return errors;
};

/**
 * Export default configuration for direct use
 */
export const referralConfig = getReferralConfig();
