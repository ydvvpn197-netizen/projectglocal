/**
 * Supabase Client Export
 * Re-exports the Supabase client for consistent imports
 */

export { supabase, resilientSupabase, withErrorHandling, getConnectionStatus, forceReconnection } from '../integrations/supabase/client';
export type { Database } from '../integrations/supabase/types';
