/**
 * Supabase Client
 * Mock implementation for Supabase client
 */

interface AuthCallback {
  (event: string, session: unknown): void;
}

interface SignUpData {
  email: string;
  password: string;
}

interface SignInData {
  email: string;
  password: string;
}

interface OAuthData {
  provider: string;
}

interface ResetPasswordOptions {
  redirectTo?: string;
}

interface UpdateUserData {
  email?: string;
  password?: string;
}

interface InsertData {
  [key: string]: unknown;
}

interface UpdateData {
  [key: string]: unknown;
}

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (callback: AuthCallback) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: async (data: SignUpData) => ({ data: { user: null, session: null }, error: null }),
    signInWithPassword: async (data: SignInData) => ({ data: { user: null, session: null }, error: null }),
    signInWithOAuth: async (data: OAuthData) => ({ data: { url: '' }, error: null }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async (email: string, options: ResetPasswordOptions) => ({ error: null }),
    updateUser: async (data: UpdateUserData) => ({ data: { user: null }, error: null })
  },
  from: (table: string) => ({
    insert: (data: InsertData) => ({ error: null }),
    update: (data: UpdateData) => ({ eq: (column: string, value: unknown) => ({ error: null }) })
  })
};

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

// Backward compatibility
export const resilientSupabase = supabase;