// Environment configuration with proper validation and security
import { ValidationError } from '@/utils/errorHandling';

// Environment variable validation
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
] as const;

const optionalEnvVars = [
  'VITE_GOOGLE_MAPS_API_KEY',
  'VITE_STRIPE_PUBLISHABLE_KEY',
  'VITE_STRIPE_SECRET_KEY',
  'VITE_STRIPE_WEBHOOK_SECRET',
  'VITE_NEWS_API_KEY',
  'VITE_FACEBOOK_APP_ID',
  'VITE_TWITTER_API_KEY',
  'VITE_LINKEDIN_CLIENT_ID',
  'VITE_WHATSAPP_API_KEY',
  'VITE_TELEGRAM_BOT_TOKEN'
] as const;

// Validate required environment variables
const validateEnvironment = (): void => {
  const missingVars: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!import.meta.env[envVar] || import.meta.env[envVar].includes('placeholder')) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
    console.error(`❌ ${errorMessage}`);
    
    // Always throw error for missing required variables in production
    if (import.meta.env.NODE_ENV === 'production' || import.meta.env.CI) {
      throw new ValidationError(
        errorMessage,
        'environment',
        'MISSING_ENV_VARS'
      );
    }
    
    // Warn in development but don't throw
    if (import.meta.env.NODE_ENV === 'development') {
      console.warn(`⚠️ ${errorMessage}`);
    }
  }
};

// Initialize environment validation
validateEnvironment();

// Supabase Configuration
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://invalid.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'invalid-key',
} as const;

// Google Maps API Configuration
export const googleMapsConfig = {
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
} as const;

// Stripe Configuration
export const stripeConfig = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY || '',
  webhookSecret: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET || '',
} as const;

// News API Configuration
export const newsConfig = {
  apiKey: import.meta.env.VITE_NEWS_API_KEY || '',
} as const;

// Social Media API Configuration
export const socialMediaConfig = {
  facebook: {
    appId: import.meta.env.VITE_FACEBOOK_APP_ID || '',
  },
  twitter: {
    apiKey: import.meta.env.VITE_TWITTER_API_KEY || '',
  },
  linkedin: {
    clientId: import.meta.env.VITE_LINKEDIN_CLIENT_ID || '',
  },
  whatsapp: {
    apiKey: import.meta.env.VITE_WHATSAPP_API_KEY || '',
  },
  telegram: {
    botToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '',
  },
} as const;

// Application Configuration
export const appConfig = {
  baseUrl: import.meta.env.BASE_URL || '/',
  environment: import.meta.env.NODE_ENV || 'development',
  isDevelopment: import.meta.env.NODE_ENV === 'development',
  isProduction: import.meta.env.NODE_ENV === 'production',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
} as const;

// Feature Flags Configuration
export const featureFlags = {
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableDebugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
  enablePerformanceMonitoring: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
  enableErrorTracking: import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true',
} as const;

// API Configuration
export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || '',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3'),
  retryDelay: parseInt(import.meta.env.VITE_API_RETRY_DELAY || '1000'),
} as const;

// Cache Configuration
export const cacheConfig = {
  defaultTTL: parseInt(import.meta.env.VITE_CACHE_DEFAULT_TTL || '300000'), // 5 minutes
  maxSize: parseInt(import.meta.env.VITE_CACHE_MAX_SIZE || '100'),
  enablePersistentCache: import.meta.env.VITE_ENABLE_PERSISTENT_CACHE === 'true',
} as const;

// Security Configuration
export const securityConfig = {
  enableCSP: import.meta.env.VITE_ENABLE_CSP === 'true',
  enableHSTS: import.meta.env.VITE_ENABLE_HSTS === 'true',
  enableXSSProtection: import.meta.env.VITE_ENABLE_XSS_PROTECTION === 'true',
  maxLoginAttempts: parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS || '5'),
  sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '3600000'), // 1 hour
} as const;

// Performance Configuration
export const performanceConfig = {
  enableLazyLoading: import.meta.env.VITE_ENABLE_LAZY_LOADING === 'true',
  enableCodeSplitting: import.meta.env.VITE_ENABLE_CODE_SPLITTING === 'true',
  enableServiceWorker: import.meta.env.VITE_ENABLE_SERVICE_WORKER === 'true',
  enablePreloading: import.meta.env.VITE_ENABLE_PRELOADING === 'true',
} as const;

// Monitoring Configuration
export const monitoringConfig = {
  enableLogging: import.meta.env.VITE_ENABLE_LOGGING === 'true',
  enableMetrics: import.meta.env.VITE_ENABLE_METRICS === 'true',
  enableTracing: import.meta.env.VITE_ENABLE_TRACING === 'true',
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
} as const;

// Main configuration object
export const config = {
  supabase: supabaseConfig,
  googleMaps: googleMapsConfig,
  stripe: stripeConfig,
  news: newsConfig,
  social: socialMediaConfig,
  app: appConfig,
  features: featureFlags,
  api: apiConfig,
  cache: cacheConfig,
  security: securityConfig,
  performance: performanceConfig,
  monitoring: monitoringConfig,
} as const;

// Configuration validation and warnings
export const validateConfiguration = (): {
  warnings: string[];
  errors: string[];
} => {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check for optional but recommended environment variables
  if (!googleMapsConfig.apiKey) {
    warnings.push('VITE_GOOGLE_MAPS_API_KEY is not set. Location services may not work properly.');
  }

  if (!stripeConfig.publishableKey) {
    warnings.push('VITE_STRIPE_PUBLISHABLE_KEY is not set. Payment features will be disabled.');
  }

  if (!newsConfig.apiKey) {
    warnings.push('VITE_NEWS_API_KEY is not set. News feed features may not work properly.');
  }

  // Check for social media API keys
  if (!socialMediaConfig.facebook.appId) {
    warnings.push('VITE_FACEBOOK_APP_ID is not set. Facebook sharing may not work properly.');
  }

  if (!socialMediaConfig.twitter.apiKey) {
    warnings.push('VITE_TWITTER_API_KEY is not set. Twitter sharing may not work properly.');
  }

  if (!socialMediaConfig.linkedin.clientId) {
    warnings.push('VITE_LINKEDIN_CLIENT_ID is not set. LinkedIn sharing may not work properly.');
  }

  // Validate configuration values
  if (apiConfig.timeout < 1000) {
    errors.push('API timeout must be at least 1000ms');
  }

  if (cacheConfig.defaultTTL < 1000) {
    errors.push('Cache TTL must be at least 1000ms');
  }

  if (securityConfig.maxLoginAttempts < 1) {
    errors.push('Max login attempts must be at least 1');
  }

  // Log warnings and errors
  if (warnings.length > 0) {
    console.warn('Configuration Warnings:', warnings);
  }

  if (errors.length > 0) {
    console.error('Configuration Errors:', errors);
  }

  return { warnings, errors };
};

// Export individual config sections for easier imports
export const {
  supabase,
  googleMaps,
  stripe,
  news,
  social,
  app,
  features,
  api,
  cache,
  security,
  performance,
  monitoring,
} = config;

// Type for the entire configuration
export type AppConfig = typeof config;

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature: keyof typeof featureFlags): boolean => {
  return featureFlags[feature];
};

// Helper function to get configuration value with fallback
export const getConfigValue = <T>(
  key: keyof AppConfig,
  fallback: T
): T => {
  try {
    return (config as Record<string, unknown>)[key] as T || fallback;
  } catch {
    return fallback;
  }
};

// Helper function to check if running in specific environment
export const isEnvironment = (env: 'development' | 'production' | 'test'): boolean => {
  return appConfig.environment === env;
};

// Helper function to get API endpoint
export const getApiEndpoint = (path: string): string => {
  const baseUrl = apiConfig.baseUrl || '';
  return `${baseUrl}${path}`.replace(/\/+/g, '/');
};

// Helper function to get cache key
export const getCacheKey = (prefix: string, identifier: string): string => {
  return `${prefix}:${identifier}`;
};

// Export default configuration
export default config;
