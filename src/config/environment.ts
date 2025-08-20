// Environment configuration with fallbacks
export const config = {
  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || "https://tepvzhbgobckybyhryuj.supabase.co",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlcHZ6aGJnb2Jja3lieWhyeXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODIzNzQsImV4cCI6MjA2OTk1ODM3NH0.RBtDkdzRu-rgRs-kYHj9zlChhqO7lLvrnnVR2vBwji4"
  },

  // Google Maps API Key
  googleMaps: {
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  },

  // Stripe Configuration
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
    secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY || "",
    webhookSecret: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET || ""
  },

  // News API Configuration
  news: {
    apiKey: import.meta.env.VITE_NEWS_API_KEY || ""
  },

  // Social Media API Keys
  social: {
    facebook: {
      appId: import.meta.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ""
    },
    twitter: {
      apiKey: import.meta.env.NEXT_PUBLIC_TWITTER_API_KEY || ""
    },
    linkedin: {
      clientId: import.meta.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || ""
    },
    whatsapp: {
      apiKey: import.meta.env.NEXT_PUBLIC_WHATSAPP_API_KEY || ""
    },
    telegram: {
      botToken: import.meta.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || ""
    }
  },

  // Application Configuration
  app: {
    baseUrl: import.meta.env.BASE_URL || "/",
    environment: import.meta.env.NODE_ENV || "development",
    isDevelopment: import.meta.env.NODE_ENV === "development",
    isProduction: import.meta.env.NODE_ENV === "production"
  }
};

// Helper function to check if required environment variables are set
export const validateEnvironment = () => {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check for required environment variables
  if (!config.googleMaps.apiKey) {
    warnings.push("VITE_GOOGLE_MAPS_API_KEY is not set. Location services may not work properly.");
  }

  if (!config.stripe.publishableKey) {
    warnings.push("VITE_STRIPE_PUBLISHABLE_KEY is not set. Payment features will be disabled.");
  }

  if (!config.news.apiKey) {
    warnings.push("VITE_NEWS_API_KEY is not set. News feed features may not work properly.");
  }

  // Log warnings and errors
  if (warnings.length > 0) {
    console.warn("Environment Configuration Warnings:", warnings);
  }

  if (errors.length > 0) {
    console.error("Environment Configuration Errors:", errors);
    throw new Error("Required environment variables are missing");
  }

  return { warnings, errors };
};

// Export individual config sections for easier imports
export const { supabase, googleMaps, stripe, news, social, app } = config;
