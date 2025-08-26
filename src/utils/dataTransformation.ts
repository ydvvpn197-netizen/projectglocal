/**
 * Data transformation utilities for consistent naming conventions
 * between snake_case (database) and camelCase (frontend)
 */

export interface TransformOptions {
  excludeKeys?: string[];
  includeKeys?: string[];
  transformDates?: boolean;
}

/**
 * Transform snake_case object keys to camelCase
 */
export function snakeToCamel<T extends Record<string, any>>(
  obj: T,
  options: TransformOptions = {}
): Record<string, any> {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => snakeToCamel(item, options));
  }

  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip excluded keys
    if (options.excludeKeys?.includes(key)) {
      continue;
    }
    
    // Only include specified keys if includeKeys is provided
    if (options.includeKeys && !options.includeKeys.includes(key)) {
      continue;
    }

    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    if (typeof value === 'object' && value !== null) {
      result[camelKey] = snakeToCamel(value, options);
    } else if (options.transformDates && isDateString(value)) {
      result[camelKey] = new Date(value);
    } else {
      result[camelKey] = value;
    }
  }

  return result;
}

/**
 * Transform camelCase object keys to snake_case
 */
export function camelToSnake<T extends Record<string, any>>(
  obj: T,
  options: TransformOptions = {}
): Record<string, any> {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => camelToSnake(item, options));
  }

  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip excluded keys
    if (options.excludeKeys?.includes(key)) {
      continue;
    }
    
    // Only include specified keys if includeKeys is provided
    if (options.includeKeys && !options.includeKeys.includes(key)) {
      continue;
    }

    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    
    if (typeof value === 'object' && value !== null) {
      result[snakeKey] = camelToSnake(value, options);
    } else if (options.transformDates && value instanceof Date) {
      result[snakeKey] = value.toISOString();
    } else {
      result[snakeKey] = value;
    }
  }

  return result;
}

/**
 * Check if a string represents a date
 */
function isDateString(value: any): boolean {
  if (typeof value !== 'string') return false;
  
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Transform Supabase response to frontend format
 */
export function transformSupabaseResponse<T>(
  response: { data: T | null; error: any } | T | null,
  options: TransformOptions = {}
): { data: T | null; error: any } | T | null {
  if (!response) return response;
  
  // Handle Supabase response format
  if ('data' in response && 'error' in response) {
    return {
      data: response.data ? snakeToCamel(response.data, options) : null,
      error: response.error
    };
  }
  
  // Handle direct data
  return snakeToCamel(response as T, options);
}

/**
 * Transform frontend data to Supabase format
 */
export function transformForSupabase<T>(
  data: T,
  options: TransformOptions = {}
): Record<string, any> {
  return camelToSnake(data as Record<string, any>, options);
}

/**
 * Common transformation options for different data types
 */
export const TRANSFORM_OPTIONS = {
  user: {
    excludeKeys: ['password', 'refresh_token'],
    transformDates: true
  },
  community: {
    transformDates: true
  },
  post: {
    transformDates: true
  },
  event: {
    transformDates: true
  },
  profile: {
    excludeKeys: ['password'],
    transformDates: true
  }
} as const;

/**
 * Type-safe transformation functions for common entities
 */
export const transformers = {
  user: {
    toFrontend: (data: any) => snakeToCamel(data, TRANSFORM_OPTIONS.user),
    toSupabase: (data: any) => camelToSnake(data, TRANSFORM_OPTIONS.user)
  },
  community: {
    toFrontend: (data: any) => snakeToCamel(data, TRANSFORM_OPTIONS.community),
    toSupabase: (data: any) => camelToSnake(data, TRANSFORM_OPTIONS.community)
  },
  post: {
    toFrontend: (data: any) => snakeToCamel(data, TRANSFORM_OPTIONS.post),
    toSupabase: (data: any) => camelToSnake(data, TRANSFORM_OPTIONS.post)
  },
  event: {
    toFrontend: (data: any) => snakeToCamel(data, TRANSFORM_OPTIONS.event),
    toSupabase: (data: any) => camelToSnake(data, TRANSFORM_OPTIONS.event)
  },
  profile: {
    toFrontend: (data: any) => snakeToCamel(data, TRANSFORM_OPTIONS.profile),
    toSupabase: (data: any) => camelToSnake(data, TRANSFORM_OPTIONS.profile)
  }
};
