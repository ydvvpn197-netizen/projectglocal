import { createClient } from '@supabase/supabase-js';

export interface SecurityConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  enableCSP: boolean;
  enableHSTS: boolean;
  enableXSSProtection: boolean;
}

export const defaultSecurityConfig: SecurityConfig = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  enableCSP: true,
  enableHSTS: true,
  enableXSSProtection: true,
};

export const createSecureSupabaseClient = (config: SecurityConfig = defaultSecurityConfig) => {
  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    result = Array.from(array, byte => chars[byte % chars.length]).join('');
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  
  return result;
};

export const hashString = async (str: string): Promise<string> => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
};

export const checkPermission = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy = {
    'user': 1,
    'moderator': 2,
    'admin': 3,
    'super_admin': 4,
  };
  
  return (roleHierarchy as Record<string, number>)[userRole] >= (roleHierarchy as Record<string, number>)[requiredRole];
};

export const rateLimitCheck = (key: string, limit: number, windowMs: number): boolean => {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (typeof window !== 'undefined') {
    const storage = window.localStorage;
    const keyName = `rate_limit_${key}`;
    const data = storage.getItem(keyName);
    
    if (data) {
      const timestamps = JSON.parse(data).filter((timestamp: number) => timestamp > windowStart);
      if (timestamps.length >= limit) {
        return false;
      }
      timestamps.push(now);
      storage.setItem(keyName, JSON.stringify(timestamps));
    } else {
      storage.setItem(keyName, JSON.stringify([now]));
    }
  }
  
  return true;
};
