/**
 * News Context Types
 * Type definitions for news context
 */

export interface NewsContextType {
  articles: any[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}