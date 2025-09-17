// Supabase client configuration with enhanced error handling and fallback mechanisms
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { supabaseConfig } from '@/config/environment';

// Enhanced error handling and retry configuration
const CLIENT_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  connectionTimeout: 10000,
  enableOfflineMode: true,
} as const;

// Connection status tracking
let connectionStatus: 'connected' | 'connecting' | 'failed' | 'offline' = 'connecting';
let retryCount = 0;
let lastConnectionAttempt = 0;

// Validate Supabase configuration before creating client
const validateSupabaseConfig = (): boolean => {
  const url = supabaseConfig.url;
  const anonKey = supabaseConfig.anonKey;
  
  // Check for missing or placeholder values
  const invalidUrl = !url || 
    url === 'your_supabase_project_url' || 
    url.includes('your_supabase') ||
    url.includes('placeholder') ||
    url === 'https://invalid.supabase.co';
    
  const invalidKey = !anonKey || 
    anonKey === 'your_supabase_anon_key' || 
    anonKey.includes('your_supabase') ||
    anonKey.includes('placeholder') ||
    anonKey === 'invalid-key';
  
  if (invalidUrl) {
    console.error('❌ VITE_SUPABASE_URL is not properly configured. Please check your .env file.');
    return false;
  }
  
  if (invalidKey) {
    console.error('❌ VITE_SUPABASE_ANON_KEY is not properly configured. Please check your .env file.');
    return false;
  }
  
  return true;
};

// Initialize Supabase client immediately to avoid initialization errors
const initializeSupabaseClient = (): ReturnType<typeof createClient<Database>> => {
  if (validateSupabaseConfig()) {
    try {
      const client = createClient<Database>(supabaseConfig.url, supabaseConfig.anonKey, {
        auth: {
          storage: localStorage,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
        global: {
          headers: {
            'X-Client-Info': 'projectglocal-web',
          },
        },
        db: {
          schema: 'public',
        },
      });
      
      console.log('✅ Supabase client initialized successfully');
      return client;
      
    } catch (error) {
      console.error('❌ Failed to initialize Supabase client:', error);
      connectionStatus = 'failed';
      // Create a mock client that will fail gracefully
      return createClient<Database>('https://invalid.supabase.co', 'invalid-key');
    }
  } else {
    console.error('❌ Supabase configuration is invalid');
    connectionStatus = 'failed';
    // Create a mock client that will fail gracefully
    return createClient<Database>('https://invalid.supabase.co', 'invalid-key');
  }
};

// Create Supabase client with validation and enhanced error handling
const supabase: ReturnType<typeof createClient<Database>> = initializeSupabaseClient();

// Create the test connection function after client is initialized
const testConnection = createTestConnection(supabase);

// A second client export (alias) commonly used around the app
export const resilientSupabase = supabase;

// Export the main client
export { supabase };

// Enhanced connection test with timeout - using a factory function to avoid circular dependency
const createTestConnection = (client: ReturnType<typeof createClient<Database>>) => async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CLIENT_CONFIG.connectionTimeout);
    
    const { data, error } = await client.auth.getSession();
    
    clearTimeout(timeoutId);
    
    if (error) {
      console.warn('⚠️ Supabase connection test failed:', error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('⚠️ Supabase connection test timed out');
    } else {
      console.warn('⚠️ Supabase connection test failed:', error);
    }
    return false;
  }
};

// Connection retry logic
const attemptReconnection = async (): Promise<void> => {
  if (retryCount >= CLIENT_CONFIG.maxRetries) {
    console.error('❌ Max reconnection attempts reached');
    connectionStatus = 'failed';
    return;
  }
  
  const now = Date.now();
  if (now - lastConnectionAttempt < CLIENT_CONFIG.retryDelay) {
    return; // Wait before retrying
  }
  
  retryCount++;
  lastConnectionAttempt = now;
  
  console.log(`🔄 Attempting to reconnect (${retryCount}/${CLIENT_CONFIG.maxRetries})...`);
  
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      connectionStatus = 'connected';
      retryCount = 0;
      console.log('✅ Reconnection successful');
    } else {
      connectionStatus = 'failed';
      // Schedule next retry
      setTimeout(attemptReconnection, CLIENT_CONFIG.retryDelay);
    }
  } catch (error) {
    console.error('❌ Reconnection attempt failed:', error);
    connectionStatus = 'failed';
    // Schedule next retry
    setTimeout(attemptReconnection, CLIENT_CONFIG.retryDelay);
  }
};

// Test the connection asynchronously after client is created
if (validateSupabaseConfig()) {
  testConnection().then((isConnected) => {
    if (isConnected) {
      connectionStatus = 'connected';
      console.log('✅ Supabase connection test successful');
    } else {
      connectionStatus = 'failed';
      console.warn('⚠️ Supabase connection test failed, will retry automatically');
      // Start retry process
      setTimeout(attemptReconnection, CLIENT_CONFIG.retryDelay);
    }
  }).catch((error) => {
    console.warn('⚠️ Supabase connection test failed:', error.message);
    connectionStatus = 'failed';
    // Start retry process
    setTimeout(attemptReconnection, CLIENT_CONFIG.retryDelay);
  });
}

// Enhanced helper functions
export const isSupabaseConfigured = (): boolean => {
  return validateSupabaseConfig();
};

export const getSupabaseStatus = async (): Promise<{ 
  connected: boolean; 
  status: typeof connectionStatus;
  error?: string;
  retryCount: number;
}> => {
  if (!isSupabaseConfigured()) {
    return { 
      connected: false, 
      status: 'failed',
      error: 'Environment variables not configured',
      retryCount: 0
    };
  }
  
  try {
    // Test connection with a simple auth call instead of a table query
    const { data, error } = await resilientSupabase.auth.getSession();
    
    if (error) {
      connectionStatus = 'failed';
      return { 
        connected: false, 
        status: 'failed',
        error: error.message,
        retryCount
      };
    }
    
    connectionStatus = 'connected';
    return { 
      connected: true, 
      status: 'connected',
      retryCount: 0
    };
  } catch (error) {
    connectionStatus = 'failed';
    return { 
      connected: false, 
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      retryCount
    };
  }
};

export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const status = await getSupabaseStatus();
    return status.connected;
  } catch {
    return false;
  }
};

// Enhanced connection management
export const forceReconnection = async (): Promise<boolean> => {
  console.log('🔄 Forcing reconnection...');
  retryCount = 0;
  connectionStatus = 'connecting';
  
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      connectionStatus = 'connected';
      retryCount = 0;
      console.log('✅ Force reconnection successful');
      return true;
    } else {
      connectionStatus = 'failed';
      console.log('❌ Force reconnection failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Force reconnection error:', error);
    connectionStatus = 'failed';
    return false;
  }
};

// Network status monitoring
export const getNetworkStatus = (): { online: boolean; connectionType?: string } => {
  if ('connection' in navigator) {
    // Define interface for navigator connection property
    interface NavigatorConnection {
      effectiveType?: string;
      type?: string;
    }
    
    const connection = (navigator as Navigator & { connection?: NavigatorConnection }).connection;
    return {
      online: navigator.onLine,
      connectionType: connection?.effectiveType || connection?.type
    };
  }
  
  return { online: navigator.onLine };
};

// Enhanced error wrapper for Supabase operations
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  fallback?: T,
  errorMessage = 'Operation failed'
): Promise<{ data: T | null; error: Error | null }> => {
  try {
    if (connectionStatus === 'failed' && !navigator.onLine) {
      throw new Error('Network is offline and Supabase connection failed');
    }
    
    const result = await operation();
    return { data: result, error: null };
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    
    // Attempt reconnection if this is a connection error
    if (connectionStatus === 'failed' && navigator.onLine) {
      await attemptReconnection();
    }
    
    return { 
      data: fallback || null, 
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
};

// Export connection status for monitoring
export const getConnectionStatus = () => connectionStatus;
export const getRetryCount = () => retryCount;
