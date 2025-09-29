/**
 * Authentication Constants
 * Constants and types for authentication context
 */

export const AUTH_CONSTANTS = {
  TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_KEY: 'user_data'
} as const;

export type AuthConstants = typeof AUTH_CONSTANTS;
