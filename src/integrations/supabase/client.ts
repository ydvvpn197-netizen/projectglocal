// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { supabaseConfig } from '@/config/environment';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(supabaseConfig.url, supabaseConfig.anonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// A second client export (alias) commonly used around the app
export const resilientSupabase = supabase;
