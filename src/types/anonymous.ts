export interface AnonymousUser {
  id: string;
  user_id: string;
  generated_username: string;
  privacy_level: 'low' | 'medium' | 'high' | 'maximum';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrivacySettings {
  id: string;
  user_id: string;
  anonymous_posting_enabled: boolean;
  location_sharing_level: 'none' | 'city' | 'precise';
  profile_visibility: 'public' | 'friends' | 'private';
  data_collection_consent: boolean;
  marketing_emails: boolean;
  analytics_tracking: boolean;
  created_at: string;
  updated_at: string;
}

export interface GovernmentAuthority {
  id: string;
  name: string;
  department: string;
  level: 'local' | 'state' | 'national';
  contact_email: string;
  contact_phone?: string;
  jurisdiction: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  status: 'attending' | 'declined' | 'waitlist';
  rsvp_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const PRIVACY_LEVELS = {
  anonymous: {
    label: 'Anonymous',
    description: 'Your real identity is completely hidden',
    icon: '👤'
  },
  pseudonymous: {
    label: 'Pseudonymous',
    description: 'Use a consistent alias but hide your real identity',
    icon: '🎭'
  },
  public: {
    label: 'Public',
    description: 'Your real identity is visible to others',
    icon: '🌐'
  }
};

export const LOCATION_SHARING_LEVELS = {
  none: {
    label: 'No Location',
    description: 'Don\'t share any location information',
    icon: '🚫'
  },
  city: {
    label: 'City Only',
    description: 'Share only your city for local relevance',
    icon: '🏙️'
  },
  precise: {
    label: 'Precise Location',
    description: 'Share exact location for maximum local relevance',
    icon: '📍'
  }
};
