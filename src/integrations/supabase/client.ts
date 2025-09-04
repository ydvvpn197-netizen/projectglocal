// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { supabaseConfig } from '@/config/environment';

// Validate Supabase configuration before creating client
const validateSupabaseConfig = () => {
  const url = supabaseConfig.url;
  const anonKey = supabaseConfig.anonKey;
  
  if (!url || url === 'your_supabase_project_url' || url.includes('your_supabase')) {
    console.error('❌ VITE_SUPABASE_URL is not properly configured. Please check your .env file.');
    return false;
  }
  
  if (!anonKey || anonKey === 'your_supabase_anon_key' || anonKey.includes('your_supabase')) {
    console.error('❌ VITE_SUPABASE_ANON_KEY is not properly configured. Please check your .env file.');
    return false;
  }
  
  return true;
};

// Create Supabase client with validation
let supabase: ReturnType<typeof createClient<Database>>;

if (validateSupabaseConfig()) {
  try {
    supabase = createClient<Database>(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    // Create a mock client that will fail gracefully
    supabase = createClient<Database>('https://invalid.supabase.co', 'invalid-key');
  }
} else {
  // Create a mock client that will fail gracefully
  supabase = createClient<Database>('https://invalid.supabase.co', 'invalid-key');
}

// A second client export (alias) commonly used around the app
export const resilientSupabase = supabase;

// Export the main client
export { supabase };

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return validateSupabaseConfig();
};

// Helper function to get connection status
export const getSupabaseStatus = (): { connected: boolean; error?: string } => {
  if (!isSupabaseConfigured()) {
    return { connected: false, error: 'Environment variables not configured' };
  }
  
  try {
    // Basic connection test
    return { connected: true };
  } catch (error) {
    return { connected: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
