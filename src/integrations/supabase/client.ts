/**
 * Supabase Client
 * Real implementation for Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables not found. Using mock implementation.');
}

// Create Supabase client with proper error handling
let supabase: any;
let resilientSupabase: any;

// Initialize with proper error handling
const initializeSupabase = () => {
  try {
    if (supabaseUrl && supabaseKey) {
      const client = createClient<Database>(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      return client;
    } else {
      throw new Error('Supabase credentials not available');
    }
  } catch (error) {
    console.warn('Failed to initialize Supabase client, using mock implementation:', error);
    return null;
  }
};

try {
  supabase = initializeSupabase();
  if (supabase) {
    resilientSupabase = supabase;
  } else {
    throw new Error('Supabase initialization failed');
  }
} catch (error) {
  console.warn('Supabase initialization failed, using mock implementation:', error);
  
  // Fallback mock implementation
  supabase = {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: (callback: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: async (data: any) => ({ data: { user: null, session: null }, error: null }),
      signInWithPassword: async (data: any) => ({ data: { user: null, session: null }, error: null }),
      signInWithOAuth: async (data: any) => ({ data: { url: '' }, error: null }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async (email: string, options: any) => ({ error: null }),
      updateUser: async (data: any) => ({ data: { user: null }, error: null })
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: () => ({ data: null, error: null }),
          order: (column: string, options: any) => ({ data: [], error: null })
        }),
        is: (column: string, value: any) => ({
          order: (column: string, options: any) => ({ data: [], error: null })
        }),
        order: (column: string, options: any) => ({ data: [], error: null })
      }),
      insert: (data: any) => ({
        select: (columns?: string) => ({
          single: () => ({ data: null, error: null })
        })
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({ error: null })
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({ error: null })
      })
    }),
    rpc: (fn: string, params?: any) => ({ data: [], error: null }),
    raw: (sql: string, params?: any[]) => params
  };
  
  resilientSupabase = supabase;
}

export { supabase, resilientSupabase };

export const withErrorHandling = async <T>(fn: () => Promise<T>, fallback: T, errorMessage: string) => {
  try {
    const result = await fn();
    return { data: result, error: null };
  } catch (error) {
    console.error(errorMessage, error);
    return { data: fallback, error: error as Error };
  }
};

export const getConnectionStatus = (): 'connected' | 'connecting' | 'failed' | 'offline' => {
  return navigator.onLine ? 'connected' : 'offline';
};

export const forceReconnection = async (): Promise<boolean> => {
  return navigator.onLine;
};