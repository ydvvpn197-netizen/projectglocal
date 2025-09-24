/**
 * Supabase Client
 * Mock implementation for Supabase client
 */

export const resilientSupabase = {
  auth: {
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
    insert: (data: any) => ({ error: null }),
    update: (data: any) => ({ eq: (column: string, value: any) => ({ error: null }) })
  })
};

export const withErrorHandling = async (fn: () => Promise<any>, fallback: any, errorMessage: string) => {
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