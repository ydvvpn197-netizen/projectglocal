// News feature types for TheGlocal project

export interface NewsArticle {
  id: string;
  article_id: string; // SHA-256 hash of URL
  title: string;
  description?: string;
  content?: string;
  url: string;
  image_url?: string;
  source_name: string;
  source_url?: string;
  published_at: string;
  city?: string;
  country?: string;
  category?: string;
  language: string;
  ai_summary?: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface NewsLike {
  id: string;
  article_id: string;
  user_id: string;
  created_at: string;
}

export interface NewsComment {
  id: string;
  article_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  // Extended fields for display
  user_name?: string;
  user_avatar?: string;
  replies?: NewsComment[];
  replies_count?: number;
}

export interface NewsPoll {
  id: string;
  article_id: string;
  user_id: string;
  question: string;
  options: string[];
  expires_at?: string;
  created_at: string;
  updated_at: string;
  // Extended fields for display
  user_name?: string;
  user_avatar?: string;
  total_votes?: number;
  user_vote?: number;
  vote_counts?: number[];
}

export interface NewsPollVote {
  id: string;
  poll_id: string;
  user_id: string;
  option_index: number;
  created_at: string;
}

export interface NewsShare {
  id: string;
  article_id: string;
  user_id: string;
  platform?: string;
  created_at: string;
}

export interface NewsEvent {
  id: string;
  user_id: string;
  article_id: string;
  event_type: 'view' | 'like' | 'comment' | 'share' | 'poll_vote';
  event_data?: Record<string, unknown>;
  created_at: string;
}

// API Response types
export interface NewsApiResponse {
  articles: NewsArticle[];
  total: number;
  page: number;
  has_more: boolean;
}

export interface TrendingNewsResponse {
  articles: (NewsArticle & {
    trending_score: number;
    likes_count: number;
    comments_count: number;
    shares_count: number;
    polls_count: number;
  })[];
  total: number;
}

export interface ForYouNewsResponse {
  articles: (NewsArticle & {
    personalization_score: number;
    reasons: string[];
  })[];
  total: number;
}

// Component props types
export interface NewsCardProps {
  article: NewsArticle;
  showActions?: boolean;
  onLike?: (articleId: string) => void;
  onComment?: (articleId: string) => void;
  onShare?: (articleId: string) => void;
  onPoll?: (articleId: string) => void;
  isLiked?: boolean;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  pollsCount?: number;
}

export interface NewsPollProps {
  poll: NewsPoll;
  onVote?: (pollId: string, optionIndex: number) => void;
  onClose?: () => void;
}

export interface NewsCommentsProps {
  articleId: string;
  comments: NewsComment[];
  onAddComment?: (content: string, parentId?: string) => void;
  onEditComment?: (commentId: string, content: string) => void;
  onDeleteComment?: (commentId: string) => void;
  loading?: boolean;
}

// Hook return types
export interface UseNewsReturn {
  articles: NewsArticle[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

export interface UseNewsInteractionsReturn {
  likeArticle: (articleId: string) => Promise<void>;
  unlikeArticle: (articleId: string) => Promise<void>;
  shareArticle: (articleId: string, platform?: string) => Promise<void>;
  trackEvent: (articleId: string, eventType: NewsEvent['event_type'], eventData?: Record<string, unknown>) => Promise<void>;
  isLiked: (articleId: string) => boolean;
  getLikesCount: (articleId: string) => number;
  getCommentsCount: (articleId: string) => number;
  getSharesCount: (articleId: string) => number;
  getPollsCount: (articleId: string) => number;
}

// Location types
export interface LocationData {
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

// News filter types
export interface NewsFilters {
  category?: string;
  source?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  location?: LocationData;
}

// News tab types
export type NewsTab = 'latest' | 'trending' | 'for-you';

// GNews API types (for external API integration)
export interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

export interface GNewsResponse {
  articles: GNewsArticle[];
  totalArticles: number;
}

// OpenAI API types (for AI summaries)
export interface OpenAISummaryRequest {
  content: string;
  maxLength?: number;
}

export interface OpenAISummaryResponse {
  summary: string;
  keyPoints: string[];
}

// Trending algorithm types
export interface TrendingScore {
  baseScore: number;
  timeDecay: number;
  localityBoost: number;
  finalScore: number;
}

// Personalization types
export interface UserPreferences {
  preferredCities: string[];
  preferredSources: string[];
  preferredKeywords: string[];
  preferredCategories: string[];
  lastUpdated: string;
}

// Error types
export interface NewsError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Cache types
export interface NewsCacheEntry {
  data: NewsArticle[];
  timestamp: number;
  expiresAt: number;
}

// Real-time subscription types
export interface NewsRealtimeUpdate {
  type: 'like' | 'comment' | 'share' | 'poll_vote';
  article_id: string;
  data: Record<string, unknown>;
  timestamp: string;
}