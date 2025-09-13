// Enhanced anonymous username system types
export interface AnonymousProfile {
  display_name: string; // Auto-generated like "User_ABC123"
  reveal_identity: boolean; // User choice to reveal
  privacy_level: 'anonymous' | 'pseudonymous' | 'public';
  location_sharing: 'none' | 'city' | 'precise';
  anonymous_id: string; // Unique anonymous identifier
  created_at: string;
  updated_at: string;
}

export interface AnonymousUser {
  id: string;
  user_id: string; // Links to actual user
  anonymous_profile: AnonymousProfile;
  is_anonymous_mode: boolean;
  last_anonymous_activity: string;
}

export interface AnonymousPost {
  id: string;
  user_id: string;
  anonymous_id: string;
  content: string;
  privacy_level: 'anonymous' | 'pseudonymous' | 'public';
  location_sharing: 'none' | 'city' | 'precise';
  created_at: string;
  updated_at: string;
}

export interface AnonymousComment {
  id: string;
  post_id: string;
  user_id: string;
  anonymous_id: string;
  content: string;
  privacy_level: 'anonymous' | 'pseudonymous' | 'public';
  created_at: string;
  updated_at: string;
}

export interface AnonymousVote {
  id: string;
  poll_id?: string;
  post_id?: string;
  comment_id?: string;
  user_id: string;
  anonymous_id: string;
  vote_type: 'upvote' | 'downvote' | 'neutral';
  created_at: string;
}

// Privacy level descriptions
export const PRIVACY_LEVELS = {
  anonymous: {
    label: 'Anonymous',
    description: 'Your identity is completely hidden. Only your anonymous username is shown.',
    icon: '🕵️'
  },
  pseudonymous: {
    label: 'Pseudonymous',
    description: 'You use a consistent username but your real identity remains hidden.',
    icon: '🎭'
  },
  public: {
    label: 'Public',
    description: 'Your real name and profile information are visible to others.',
    icon: '👤'
  }
} as const;

// Location sharing descriptions
export const LOCATION_SHARING_LEVELS = {
  none: {
    label: 'No Location',
    description: 'Your location is never shared with posts or comments.',
    icon: '🚫'
  },
  city: {
    label: 'City Only',
    description: 'Only your city is shared with posts and comments.',
    icon: '🏙️'
  },
  precise: {
    label: 'Precise Location',
    description: 'Your exact location is shared (use with caution).',
    icon: '📍'
  }
} as const;

// Anonymous username generation utilities
export interface AnonymousUsernameConfig {
  prefix: string;
  length: number;
  includeNumbers: boolean;
  includeSpecialChars: boolean;
}

export const DEFAULT_ANONYMOUS_CONFIG: AnonymousUsernameConfig = {
  prefix: 'User_',
  length: 6,
  includeNumbers: true,
  includeSpecialChars: false
};

// Anonymous profile creation data
export interface CreateAnonymousProfileData {
  user_id: string;
  privacy_level: 'anonymous' | 'pseudonymous' | 'public';
  location_sharing: 'none' | 'city' | 'precise';
  reveal_identity?: boolean;
  custom_display_name?: string;
}

// Anonymous profile update data
export interface UpdateAnonymousProfileData {
  privacy_level?: 'anonymous' | 'pseudonymous' | 'public';
  location_sharing?: 'none' | 'city' | 'precise';
  reveal_identity?: boolean;
  display_name?: string;
}

// Anonymous activity tracking
export interface AnonymousActivity {
  id: string;
  user_id: string;
  anonymous_id: string;
  activity_type: 'post' | 'comment' | 'vote' | 'poll' | 'protest';
  target_id: string;
  privacy_level: 'anonymous' | 'pseudonymous' | 'public';
  location_sharing: 'none' | 'city' | 'precise';
  created_at: string;
}

// Anonymous profile statistics
export interface AnonymousProfileStats {
  anonymous_id: string;
  total_posts: number;
  total_comments: number;
  total_votes: number;
  total_protests: number;
  reputation_score: number;
  anonymity_level: number; // 0-100, higher means more anonymous
  last_activity: string;
}

// Anonymous profile preferences
export interface AnonymousPreferences {
  auto_anonymous_mode: boolean;
  default_privacy_level: 'anonymous' | 'pseudonymous' | 'public';
  default_location_sharing: 'none' | 'city' | 'precise';
  allow_identity_reveal: boolean;
  anonymous_notifications: boolean;
  anonymous_analytics: boolean;
}

// Type guards
export function isAnonymousProfile(obj: unknown): obj is AnonymousProfile {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'display_name' in obj &&
    'reveal_identity' in obj &&
    'privacy_level' in obj &&
    'location_sharing' in obj
  );
}

export function isAnonymousUser(obj: unknown): obj is AnonymousUser {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'user_id' in obj &&
    'anonymous_profile' in obj &&
    'is_anonymous_mode' in obj
  );
}

// Utility types for form handling
export type PrivacyLevel = AnonymousProfile['privacy_level'];
export type LocationSharing = AnonymousProfile['location_sharing'];
export type AnonymousVoteType = AnonymousVote['vote_type'];
export type AnonymousActivityType = AnonymousActivity['activity_type'];
