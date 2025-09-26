/**
 * Clear Auth Data Utilities
 * Utilities for clearing authentication data
 */

export const clearAuthData = (): void => {
  try {
    // Clear localStorage
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.session');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_session');
    
    // Clear sessionStorage
    sessionStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('supabase.auth.session');
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_session');
    
    console.log('Auth data cleared successfully');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

export const checkForStaleAuthData = (): boolean => {
  try {
    const authToken = localStorage.getItem('supabase.auth.token');
    if (!authToken) return false;
    
    const tokenData = JSON.parse(authToken);
    const expiresAt = tokenData.expires_at;
    
    if (!expiresAt) return true;
    
    const now = Date.now() / 1000;
    return now > expiresAt;
  } catch (error) {
    console.error('Error checking stale auth data:', error);
    return true;
  }
};
