/**
 * Database utilities for handling missing tables and schema issues
 */


import { supabase } from '@/integrations/supabase/client';

export interface TableStatus {
  exists: boolean;
  error?: string;
}

export interface DatabaseSchema {
  marketing_campaigns: TableStatus;
  referral_program: TableStatus;
  social_shares: TableStatus;
  promotional_codes: TableStatus;
  comments: TableStatus;
  user_preferences: TableStatus;
  profiles: TableStatus;
}

/**
 * Check if a table exists in the database
 */
export async function checkTableExists(tableName: string): Promise<TableStatus> {
  try {
    // Try to query the table with a simple select
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      // Check if it's a "relation does not exist" error
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        return { exists: false, error: error.message };
      }
      // Other errors might indicate the table exists but has other issues
      return { exists: true, error: error.message };
    }

    return { exists: true };
  } catch (error: any) {
    return { exists: false, error: error.message };
  }
}

/**
 * Check the status of all required tables
 */
export async function checkDatabaseSchema(): Promise<DatabaseSchema> {
  const tables = [
    'marketing_campaigns',
    'referral_program', 
    'social_shares',
    'promotional_codes',
    'comments',
    'user_preferences',
    'profiles'
  ];

  const results = await Promise.all(
    tables.map(async (table) => ({
      table,
      status: await checkTableExists(table)
    }))
  );

  const schema: DatabaseSchema = {
    marketing_campaigns: { exists: false },
    referral_program: { exists: false },
    social_shares: { exists: false },
    promotional_codes: { exists: false },
    comments: { exists: false },
    user_preferences: { exists: false },
    profiles: { exists: false }
  };

  results.forEach(({ table, status }) => {
    (schema as any)[table] = status;
  });

  return schema;
}

/**
 * Get a summary of missing tables
 */
export function getMissingTables(schema: DatabaseSchema): string[] {
  const missing: string[] = [];
  
  Object.entries(schema).forEach(([table, status]) => {
    if (!status.exists) {
      missing.push(table);
    }
  });

  return missing;
}

/**
 * Create a fallback data structure for missing marketing features
 */
export function createMarketingFallback() {
  return {
    campaigns: [],
    referralCode: null,
    socialShares: [],
    promotionalCodes: []
  };
}

/**
 * Create a fallback data structure for missing user preferences
 */
export function createUserPreferencesFallback() {
  return {
    location_radius_km: 50,
    location_notifications: true,
    email_notifications: true,
    push_notifications: true,
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    category: 'general'
  };
}

/**
 * Log database schema issues for debugging
 */
export function logDatabaseIssues(schema: DatabaseSchema) {
  const missing = getMissingTables(schema);
  
  if (missing.length > 0) {
    console.warn('Database Schema Issues:', {
      missingTables: missing,
      totalMissing: missing.length,
      message: 'Some tables are missing from the database. Features may be limited.'
    });
  } else {
    console.log('Database Schema: All required tables exist');
  }
}

/**
 * Check if marketing features are available
 */
export function areMarketingFeaturesAvailable(schema: DatabaseSchema): boolean {
  return schema.marketing_campaigns.exists && 
         schema.referral_program.exists && 
         schema.social_shares.exists && 
         schema.promotional_codes.exists;
}

/**
 * Check if comments system is available
 */
export function areCommentsAvailable(schema: DatabaseSchema): boolean {
  return schema.comments.exists;
}

/**
 * Get the correct comments table name
 */
export function getCommentsTableName(schema: DatabaseSchema): string | null {
  if (schema.comments.exists) {
    return 'comments';
  }
  return null;
}

/**
 * Get feature availability status
 */
export function getFeatureStatus(schema: DatabaseSchema) {
  return {
    marketing: areMarketingFeaturesAvailable(schema),
    comments: areCommentsAvailable(schema),
    userPreferences: schema.user_preferences.exists,
    profiles: schema.profiles.exists,
    allAvailable: Object.values(schema).every(status => status.exists)
  };
}
