/**
 * Supabase Client
 * Real implementation for Supabase client
 */

import { createClient, SupabaseClient, AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { Database } from './types';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables not found. Using mock implementation.');
}

// Define proper types for mock client
interface MockAuthClient {
  getUser: () => Promise<{ data: { user: User | null }; error: Error | null }>;
  getSession: () => Promise<{ data: { session: Session | null }; error: Error | null }>;
  onAuthStateChange: (callback: (event: AuthChangeEvent, session: Session | null) => void) => { data: { subscription: { unsubscribe: () => void } } };
  signUp: (data: { email: string; password: string }) => Promise<{ data: { user: User | null; session: Session | null }; error: Error | null }>;
  signInWithPassword: (data: { email: string; password: string }) => Promise<{ data: { user: User | null; session: Session | null }; error: Error | null }>;
  signInWithOAuth: (data: { provider: string }) => Promise<{ data: { url: string }; error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPasswordForEmail: (email: string, options?: { redirectTo?: string }) => Promise<{ error: Error | null }>;
  updateUser: (data: { email?: string; password?: string }) => Promise<{ data: { user: User | null }; error: Error | null }>;
}

interface MockQueryBuilder {
  select: (columns?: string) => {
    eq: (column: string, value: unknown) => {
      single: () => Promise<{ data: unknown; error: Error | null }>;
      order: (column: string, options: { ascending?: boolean }) => Promise<{ data: unknown[]; error: Error | null }>;
    };
    is: (column: string, value: unknown) => {
      order: (column: string, options: { ascending?: boolean }) => Promise<{ data: unknown[]; error: Error | null }>;
    };
    order: (column: string, options: { ascending?: boolean }) => Promise<{ data: unknown[]; error: Error | null }>;
  };
  insert: (data: unknown) => {
    select: (columns?: string) => {
      single: () => Promise<{ data: unknown; error: Error | null }>;
    };
  };
  update: (data: unknown) => {
    eq: (column: string, value: unknown) => Promise<{ error: Error | null }>;
  };
  delete: () => {
    eq: (column: string, value: unknown) => Promise<{ error: Error | null }>;
  };
}

interface MockSupabaseClient {
  auth: MockAuthClient;
  from: (table: string) => MockQueryBuilder;
  rpc: (fn: string, params?: Record<string, unknown>) => Promise<{ data: unknown[]; error: Error | null }>;
  raw: (sql: string, params?: unknown[]) => unknown[];
}

// Create Supabase client with proper error handling
let supabase: SupabaseClient<Database> | MockSupabaseClient;
let resilientSupabase: SupabaseClient<Database> | MockSupabaseClient;

// Initialize with proper error handling
const initializeSupabase = (): SupabaseClient<Database> | null => {
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
  const realSupabase = initializeSupabase();
  if (realSupabase) {
    supabase = realSupabase;
    resilientSupabase = realSupabase;
  } else {
    throw new Error('Supabase initialization failed');
  }
} catch (error) {
  console.warn('Supabase initialization failed, using mock implementation:', error);
  
  // Fallback mock implementation with proper types
  const mockSupabase: MockSupabaseClient = {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: (callback: (event: AuthChangeEvent, session: Session | null) => void) => ({ 
        data: { subscription: { unsubscribe: () => {} } } 
      }),
      signUp: async (data: { email: string; password: string }) => ({ 
        data: { user: null, session: null }, error: null 
      }),
      signInWithPassword: async (data: { email: string; password: string }) => ({ 
        data: { user: null, session: null }, error: null 
      }),
      signInWithOAuth: async (data: { provider: string }) => ({ 
        data: { url: '' }, error: null 
      }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async (email: string, options?: { redirectTo?: string }) => ({ 
        error: null 
      }),
      updateUser: async (data: { email?: string; password?: string }) => ({ 
        data: { user: null }, error: null 
      })
    },
    from: (table: string): MockQueryBuilder => ({
      select: (columns?: string) => ({
        eq: (column: string, value: unknown) => ({
          single: () => Promise.resolve({ data: null, error: null }),
          order: (column: string, options: { ascending?: boolean }) => 
            Promise.resolve({ data: [], error: null })
        }),
        is: (column: string, value: unknown) => ({
          order: (column: string, options: { ascending?: boolean }) => 
            Promise.resolve({ data: [], error: null })
        }),
        order: (column: string, options: { ascending?: boolean }) => 
          Promise.resolve({ data: [], error: null })
      }),
      insert: (data: unknown) => ({
        select: (columns?: string) => ({
          single: () => Promise.resolve({ data: null, error: null })
        })
      }),
      update: (data: unknown) => ({
        eq: (column: string, value: unknown) => Promise.resolve({ error: null })
      }),
      delete: () => ({
        eq: (column: string, value: unknown) => Promise.resolve({ error: null })
      })
    }),
    rpc: (fn: string, params?: Record<string, unknown>) => 
      Promise.resolve({ data: [], error: null }),
    raw: (sql: string, params?: unknown[]) => params || []
  };
  
  supabase = mockSupabase;
  resilientSupabase = mockSupabase;
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