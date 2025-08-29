/**
 * Utility function to clear all authentication-related data from localStorage
 * This can help resolve authentication state inconsistencies
 */
export const clearAuthData = (): void => {
  try {
    // Clear all Supabase auth-related keys
    const keysToRemove = [
      'supabase.auth.token',
      'supabase.auth.expires_at',
      'supabase.auth.refresh_token',
      'supabase.auth.expires_in',
      'supabase.auth.access_token',
      'supabase.auth.provider_token',
      'supabase.auth.provider_refresh_token'
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // Also clear any other auth-related data
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.includes('supabase') || key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });

    console.log('Authentication data cleared successfully');
  } catch (error) {
    console.error('Error clearing authentication data:', error);
  }
};

/**
 * Check if there's stale authentication data that should be cleared
 */
export const checkForStaleAuthData = (): boolean => {
  try {
    const authToken = localStorage.getItem('supabase.auth.token');
    if (!authToken) return false;

    const tokenData = JSON.parse(authToken);
    if (!tokenData || !tokenData.expires_at) return true;

    const expiresAt = new Date(tokenData.expires_at * 1000);
    const now = new Date();

    // If token is expired or will expire in the next 5 minutes, consider it stale
    return expiresAt <= new Date(now.getTime() + 5 * 60 * 1000);
  } catch (error) {
    console.error('Error checking for stale auth data:', error);
    return true; // If we can't parse the data, consider it stale
  }
};
