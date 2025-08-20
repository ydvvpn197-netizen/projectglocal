// Engagement and Voting Types
export interface VoteType {
  UP: 1;
  DOWN: -1;
  NONE: 0;
}

export const VOTE_TYPES: VoteType = {
  UP: 1,
  DOWN: -1,
  NONE: 0
};

export interface VoteStats {
  upvotes: number;
  downvotes: number;
  score: number;
  upvote_ratio: number;
}

export interface UserVote {
  user_id: string;
  vote_type: number;
  created_at: string;
}

export interface EngagementMetrics {
  total_posts: number;
  total_comments: number;
  total_votes: number;
  total_views: number;
  active_users: number;
  average_score: number;
  top_contributors: UserEngagement[];
}

export interface UserEngagement {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  posts_count: number;
  comments_count: number;
  total_score: number;
  karma: number;
}

export interface ContentRanking {
  id: string;
  score: number;
  rank_score: number;
  hot_score: number;
  controversy_score: number;
  quality_score: number;
  time_decay: number;
}

export interface RankingAlgorithm {
  name: string;
  description: string;
  formula: string;
  parameters: Record<string, number>;
}

export interface VoteCalculation {
  base_score: number;
  time_decay: number;
  controversy_penalty: number;
  quality_boost: number;
  location_weight: number;
  final_score: number;
}

export interface VoteValidation {
  is_valid: boolean;
  reason?: string;
  user_reputation?: number;
  vote_weight?: number;
}

export interface AntiSpamMeasures {
  user_id: string;
  vote_count_24h: number;
  vote_count_1h: number;
  is_rate_limited: boolean;
  cooldown_remaining: number;
}

export interface VoteHistory {
  id: string;
  target_type: 'post' | 'comment';
  target_id: string;
  vote_type: number;
  created_at: string;
  updated_at: string;
}

export interface VoteAnalytics {
  total_votes: number;
  unique_voters: number;
  vote_distribution: {
    upvotes: number;
    downvotes: number;
    neutral: number;
  };
  voting_trends: {
    date: string;
    upvotes: number;
    downvotes: number;
  }[];
  top_voters: {
    user_id: string;
    user_name: string;
    vote_count: number;
  }[];
}
