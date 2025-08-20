// Community Engagement Types

// Vote type constants
export const VOTE_TYPES = {
  UP: 1,
  DOWN: -1,
  NONE: 0
} as const;

export type VoteType = typeof VOTE_TYPES[keyof typeof VOTE_TYPES];

export interface CommunityGroup {
  id: string;
  name: string;
  description?: string;
  category: string;
  created_by: string;
  is_public: boolean;
  allow_anonymous_posts: boolean;
  require_approval: boolean;
  member_count: number;
  post_count: number;
  latitude?: number;
  longitude?: number;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  user_name?: string;
  user_avatar?: string;
}

export interface CommunityPost {
  id: string;
  group_id: string;
  user_id: string;
  title: string;
  content: string;
  post_type: 'discussion' | 'question' | 'announcement' | 'event' | 'poll';
  is_anonymous: boolean;
  is_pinned: boolean;
  is_locked: boolean;
  upvotes: number;
  downvotes: number;
  score: number;
  comment_count: number;
  view_count: number;
  latitude?: number;
  longitude?: number;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_avatar?: string;
  group_name?: string;
  user_vote?: number;
  has_voted?: boolean;
}

export interface PostVote {
  id: string;
  post_id: string;
  user_id: string;
  vote_type: number;
  created_at: string;
  updated_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  is_anonymous: boolean;
  upvotes: number;
  downvotes: number;
  score: number;
  depth: number;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_avatar?: string;
  user_vote?: number;
  has_voted?: boolean;
  replies?: PostComment[];
  reply_count?: number;
}

export interface CommentVote {
  id: string;
  comment_id: string;
  user_id: string;
  vote_type: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityPoll {
  id: string;
  post_id: string;
  question: string;
  options: PollOption[];
  total_votes: number;
  is_multiple_choice: boolean;
  is_anonymous: boolean;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_vote?: string[];
  has_voted?: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage?: number;
}

export interface PollVote {
  id: string;
  poll_id: string;
  user_id: string;
  selected_options: string[];
  created_at: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  category: string;
  is_public?: boolean;
  allow_anonymous_posts?: boolean;
  require_approval?: boolean;
  latitude?: number;
  longitude?: number;
  location_city?: string;
  location_state?: string;
  location_country?: string;
}

export interface CreatePostRequest {
  group_id: string;
  title: string;
  content: string;
  post_type?: 'discussion' | 'question' | 'announcement' | 'event' | 'poll';
  is_anonymous?: boolean;
  latitude?: number;
  longitude?: number;
  location_city?: string;
  location_state?: string;
  location_country?: string;
}

export interface CreateCommentRequest {
  post_id: string;
  content: string;
  parent_id?: string;
  is_anonymous?: boolean;
}

export interface VoteRequest {
  vote_type: number;
}

export interface CreatePollRequest {
  post_id: string;
  question: string;
  options: string[];
  is_multiple_choice?: boolean;
  is_anonymous?: boolean;
  expires_at?: string;
}

export interface PollVoteRequest {
  selected_options: string[];
}

export interface PostFilters {
  group_id?: string;
  post_type?: 'discussion' | 'question' | 'announcement' | 'event' | 'poll';
  category?: string;
  author_id?: string;
  is_anonymous?: boolean;
  date_from?: string;
  date_to?: string;
}

export interface PostSortOptions {
  sort_by: 'hot' | 'top' | 'new' | 'rising';
  limit?: number;
  offset?: number;
}
