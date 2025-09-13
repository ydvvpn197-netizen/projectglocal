// Government and Civic Engagement Types

// Government Authority Types
export interface GovernmentAuthority {
  id: string;
  name: string;
  type: 'federal' | 'state' | 'local' | 'municipal' | 'county' | 'school_district';
  jurisdiction: string;
  jurisdiction_code: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  api_endpoint?: string;
  api_key_required: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Basic Poll interface for extension
interface Poll {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  options: Array<{ id: string; text: string; votes: number }>;
  total_votes: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Enhanced Poll Types with Government Integration
export interface GovernmentPoll extends Poll {
  government_authority_id: string;
  authority: GovernmentAuthority;
  poll_type: 'official' | 'community' | 'protest' | 'survey';
  requires_verification: boolean;
  official_status: 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'closed';
  verification_level: 'none' | 'email' | 'phone' | 'address' | 'id_required';
  target_audience: 'all' | 'registered_voters' | 'residents' | 'stakeholders';
  geographic_scope: {
    type: 'national' | 'state' | 'county' | 'city' | 'district' | 'custom';
    boundaries?: GeoJSON.FeatureCollection;
    zip_codes?: string[];
    addresses?: string[];
  };
  civic_impact_level: 'informational' | 'advisory' | 'binding' | 'referendum';
  legal_framework?: string;
  compliance_requirements?: string[];
  results_visibility: 'public' | 'authorized_only' | 'aggregate_only';
  data_retention_policy: string;
  created_by_authority: boolean;
  authority_contact_id?: string;
}

// Virtual Protest System Types
export interface VirtualProtest {
  id: string;
  title: string;
  description: string;
  organizer_id: string;
  organizer_anonymous_id?: string;
  cause: string;
  target_authority_id?: string;
  target_authority?: GovernmentAuthority;
  protest_type: 'petition' | 'boycott' | 'awareness' | 'digital_assembly' | 'symbolic_action';
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  participation_goal: number;
  current_participants: number;
  location_type: 'virtual' | 'hybrid' | 'local';
  location_details?: {
    virtual_platform?: string;
    meeting_link?: string;
    physical_address?: string;
    city?: string;
    state?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  requirements: {
    age_minimum?: number;
    verification_required: boolean;
    anonymous_participation: boolean;
    commitment_level: 'low' | 'medium' | 'high';
  };
  actions: VirtualProtestAction[];
  supporters: VirtualProtestSupporter[];
  created_at: string;
  updated_at: string;
}

export interface VirtualProtestAction {
  id: string;
  protest_id: string;
  action_type: 'sign_petition' | 'share_content' | 'contact_official' | 'attend_event' | 'donate' | 'boycott';
  title: string;
  description: string;
  instructions: string;
  external_url?: string;
  completion_criteria: string;
  points_rewarded: number;
  is_required: boolean;
  order_index: number;
  created_at: string;
}

export interface VirtualProtestSupporter {
  id: string;
  protest_id: string;
  user_id: string;
  anonymous_id?: string;
  participation_level: 'supporter' | 'participant' | 'organizer';
  actions_completed: string[]; // Array of action IDs
  total_points: number;
  joined_at: string;
  last_activity: string;
}

// Civic Engagement Analytics
export interface CivicEngagementMetrics {
  user_id: string;
  anonymous_id?: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  period_start: string;
  period_end: string;
  metrics: {
    polls_participated: number;
    polls_created: number;
    protests_supported: number;
    protests_organized: number;
    civic_actions_completed: number;
    government_contacts_made: number;
    community_issues_reported: number;
    civic_score: number;
    engagement_level: 'low' | 'medium' | 'high' | 'very_high';
  };
  trends: {
    participation_trend: 'increasing' | 'stable' | 'decreasing';
    issue_focus_areas: string[];
    preferred_authority_types: string[];
    most_effective_actions: string[];
  };
  created_at: string;
}

// Government API Integration
export interface GovernmentAPIConfig {
  authority_id: string;
  api_name: string;
  base_url: string;
  endpoints: {
    polls: string;
    issues: string;
    officials: string;
    meetings: string;
    documents: string;
  };
  authentication: {
    type: 'api_key' | 'oauth' | 'basic_auth' | 'bearer_token';
    credentials: Record<string, string>;
  };
  rate_limits: {
    requests_per_minute: number;
    requests_per_hour: number;
    requests_per_day: number;
  };
  data_format: 'json' | 'xml' | 'csv';
  last_sync: string;
  sync_frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
}

// Community Issues and Reporting
export interface CommunityIssue {
  id: string;
  title: string;
  description: string;
  reporter_id: string;
  reporter_anonymous_id?: string;
  category: 'infrastructure' | 'safety' | 'environment' | 'transportation' | 'housing' | 'education' | 'health' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed';
  location: {
    address?: string;
    city: string;
    state: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  target_authority_id: string;
  target_authority?: GovernmentAuthority;
  evidence: {
    photos?: string[];
    documents?: string[];
    witness_contacts?: string[];
  };
  supporters: CommunityIssueSupporter[];
  official_response?: {
    authority_id: string;
    response_text: string;
    response_date: string;
    action_plan?: string;
    timeline?: string;
    contact_person?: string;
  };
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface CommunityIssueSupporter {
  id: string;
  issue_id: string;
  user_id: string;
  anonymous_id?: string;
  support_type: 'endorsement' | 'witness' | 'expert' | 'affected_resident';
  support_statement?: string;
  contact_willing: boolean;
  joined_at: string;
}

// Civic Engagement Campaign Types
export interface CivicCampaign {
  id: string;
  title: string;
  description: string;
  organizer_id: string;
  organizer_anonymous_id?: string;
  campaign_type: 'awareness' | 'advocacy' | 'mobilization' | 'education';
  target_authority_id?: string;
  target_authority?: GovernmentAuthority;
  goals: {
    primary_goal: string;
    secondary_goals: string[];
    success_metrics: string[];
    target_participants: number;
  };
  timeline: {
    start_date: string;
    end_date: string;
    key_milestones: {
      date: string;
      description: string;
      completed: boolean;
    }[];
  };
  activities: CivicCampaignActivity[];
  participants: CivicCampaignParticipant[];
  resources: {
    budget?: number;
    materials_needed: string[];
    volunteer_roles: string[];
    partnerships: string[];
  };
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface CivicCampaignActivity {
  id: string;
  campaign_id: string;
  activity_type: 'meeting' | 'petition' | 'rally' | 'education' | 'outreach' | 'media';
  title: string;
  description: string;
  scheduled_date: string;
  location: string;
  virtual_link?: string;
  requirements: string[];
  max_participants?: number;
  current_participants: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

export interface CivicCampaignParticipant {
  id: string;
  campaign_id: string;
  user_id: string;
  anonymous_id?: string;
  role: 'organizer' | 'volunteer' | 'supporter' | 'participant';
  activities_participated: string[];
  commitment_level: 'low' | 'medium' | 'high';
  skills_offered: string[];
  availability: string;
  joined_at: string;
}

// Civic Engagement Scoring System
export interface CivicEngagementScore {
  user_id: string;
  anonymous_id?: string;
  overall_score: number;
  category_scores: {
    participation: number;
    leadership: number;
    community_impact: number;
    consistency: number;
    innovation: number;
  };
  level: 'novice' | 'active' | 'engaged' | 'leader' | 'champion';
  badges: CivicBadge[];
  achievements: CivicAchievement[];
  last_calculated: string;
}

export interface CivicBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'participation' | 'leadership' | 'community' | 'special';
  requirements: string[];
  earned_at: string;
  points_value: number;
}

export interface CivicAchievement {
  id: string;
  name: string;
  description: string;
  category: 'milestone' | 'impact' | 'consistency' | 'special';
  criteria: string[];
  achieved_at: string;
  impact_metrics: Record<string, number>;
}

// Type guards and utility functions
export function isGovernmentPoll(obj: unknown): obj is GovernmentPoll {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'government_authority_id' in obj &&
    'poll_type' in obj &&
    'official_status' in obj
  );
}

export function isVirtualProtest(obj: unknown): obj is VirtualProtest {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'protest_type' in obj &&
    'status' in obj &&
    'participation_goal' in obj
  );
}

export function isCommunityIssue(obj: unknown): obj is CommunityIssue {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'category' in obj &&
    'priority' in obj &&
    'status' in obj &&
    'target_authority_id' in obj
  );
}

// Constants for civic engagement
export const PROTEST_TYPES = {
  petition: { label: 'Petition', icon: '📝', description: 'Collect signatures for a cause' },
  boycott: { label: 'Boycott', icon: '🚫', description: 'Organize consumer action' },
  awareness: { label: 'Awareness', icon: '📢', description: 'Raise public awareness' },
  digital_assembly: { label: 'Digital Assembly', icon: '💻', description: 'Virtual gathering or meeting' },
  symbolic_action: { label: 'Symbolic Action', icon: '🎯', description: 'Symbolic gesture or action' }
} as const;

export const ISSUE_CATEGORIES = {
  infrastructure: { label: 'Infrastructure', icon: '🏗️', color: 'blue' },
  safety: { label: 'Safety', icon: '🛡️', color: 'red' },
  environment: { label: 'Environment', icon: '🌱', color: 'green' },
  transportation: { label: 'Transportation', icon: '🚌', color: 'orange' },
  housing: { label: 'Housing', icon: '🏠', color: 'purple' },
  education: { label: 'Education', icon: '🎓', color: 'yellow' },
  health: { label: 'Health', icon: '⚕️', color: 'pink' },
  other: { label: 'Other', icon: '📋', color: 'gray' }
} as const;

export const AUTHORITY_TYPES = {
  federal: { label: 'Federal', icon: '🏛️', level: 'national' },
  state: { label: 'State', icon: '🏛️', level: 'state' },
  local: { label: 'Local', icon: '🏛️', level: 'local' },
  municipal: { label: 'Municipal', icon: '🏛️', level: 'city' },
  county: { label: 'County', icon: '🏛️', level: 'county' },
  school_district: { label: 'School District', icon: '🎓', level: 'local' }
} as const;
