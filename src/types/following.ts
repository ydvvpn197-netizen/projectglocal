export interface FollowRelationship {
  id: string;
  followerId: string;
  followingId: string;
  status: 'active' | 'pending' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

export interface FollowStats {
  userId: string;
  followersCount: number;
  followingCount: number;
  mutualFollowersCount: number;
  lastUpdated: string;
}

export interface FollowSuggestion {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  mutualFollowers: number;
  commonInterests: string[];
  location?: {
    city: string;
    state: string;
  };
  score: number;
  reason: string;
}
