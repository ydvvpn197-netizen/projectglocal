// News context types for TheGlocal project
import type { NewsArticle, NewsTab, LocationData } from '@/types/news';

export interface NewsContextType {
  articles: NewsArticle[];
  tabs: NewsTab[];
  selectedTab: string;
  selectedLocation: LocationData | null;
  loading: boolean;
  error: string | null;
  setSelectedTab: (tab: string) => void;
  setSelectedLocation: (location: LocationData | null) => void;
  refreshArticles: () => Promise<void>;
  loadMoreArticles: () => Promise<void>;
  hasMore: boolean;
}