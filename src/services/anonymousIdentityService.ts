import { supabase } from '@/integrations/supabase/client';

export interface AnonymousIdentity {
  id: string;
  session_id: string;
  anonymous_username: string;
  avatar_seed: string;
  created_at: string;
  last_active: string;
  reputation_score: number;
  is_verified: boolean;
}

export interface AnonymousSession {
  session_id: string;
  location_hash: string;
  device_fingerprint: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

class AnonymousIdentityService {
  private currentSession: AnonymousSession | null = null;
  private currentIdentity: AnonymousIdentity | null = null;
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Generate a unique device fingerprint for privacy-preserving identification
   */
  private generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Anonymous fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return btoa(fingerprint).substring(0, 32);
  }

  /**
   * Generate location-based hash for local community grouping
   */
  private generateLocationHash(location?: { lat: number; lng: number }): string {
    if (!location) {
      // Default to a generic location hash if no location provided
      return 'general_' + Math.random().toString(36).substring(2, 8);
    }
    
    // Round coordinates to create location clusters (privacy-preserving)
    const roundedLat = Math.round(location.lat * 100) / 100;
    const roundedLng = Math.round(location.lng * 100) / 100;
    
    return btoa(`${roundedLat},${roundedLng}`).substring(0, 16);
  }

  /**
   * Generate a creative anonymous username
   */
  private generateAnonymousUsername(): string {
    const adjectives = [
      'Curious', 'Thoughtful', 'Wise', 'Brave', 'Kind', 'Creative', 'Honest',
      'Peaceful', 'Vibrant', 'Gentle', 'Bold', 'Clever', 'Caring', 'Bright'
    ];
    
    const nouns = [
      'Neighbor', 'Citizen', 'Voice', 'Mind', 'Heart', 'Soul', 'Spirit',
      'Friend', 'Helper', 'Builder', 'Dreamer', 'Thinker', 'Guardian', 'Guide'
    ];
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 999) + 1;
    
    return `${adjective}${noun}${number}`;
  }

  /**
   * Create or restore anonymous session
   */
  async createAnonymousSession(location?: { lat: number; lng: number }): Promise<AnonymousSession> {
    try {
      // Check for existing session in localStorage
      const existingSessionData = localStorage.getItem('anonymous_session');
      if (existingSessionData) {
        const session = JSON.parse(existingSessionData) as AnonymousSession;
        if (new Date(session.expires_at).getTime() > Date.now() && session.is_active) {
          this.currentSession = session;
          return session;
        }
      }

      // Create new session
      const sessionId = crypto.randomUUID();
      const deviceFingerprint = this.generateDeviceFingerprint();
      const locationHash = this.generateLocationHash(location);
      
      const newSession: AnonymousSession = {
        session_id: sessionId,
        location_hash: locationHash,
        device_fingerprint: deviceFingerprint,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + this.SESSION_DURATION).toISOString(),
        is_active: true
      };

      // Store session
      localStorage.setItem('anonymous_session', JSON.stringify(newSession));
      this.currentSession = newSession;

      // Store in database for analytics (privacy-preserving)
      await supabase
        .from('anonymous_sessions')
        .insert({
          session_id: sessionId,
          location_hash: locationHash,
          device_fingerprint: deviceFingerprint,
          expires_at: newSession.expires_at
        });

      return newSession;
    } catch (error) {
      console.error('Error creating anonymous session:', error);
      throw error;
    }
  }

  /**
   * Create anonymous identity for posting/commenting
   */
  async createAnonymousIdentity(): Promise<AnonymousIdentity> {
    try {
      if (!this.currentSession) {
        await this.createAnonymousSession();
      }

      // Check for existing identity
      if (this.currentIdentity && 
          new Date(this.currentIdentity.last_active).getTime() > Date.now() - (30 * 60 * 1000)) {
        return this.currentIdentity;
      }

      const identityId = crypto.randomUUID();
      const username = this.generateAnonymousUsername();
      const avatarSeed = Math.random().toString(36).substring(2, 10);

      const newIdentity: AnonymousIdentity = {
        id: identityId,
        session_id: this.currentSession!.session_id,
        anonymous_username: username,
        avatar_seed: avatarSeed,
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
        reputation_score: 0,
        is_verified: false
      };

      // Store identity
      await supabase
        .from('anonymous_identities')
        .insert({
          id: identityId,
          session_id: this.currentSession!.session_id,
          anonymous_username: username,
          avatar_seed: avatarSeed,
          reputation_score: 0
        });

      this.currentIdentity = newIdentity;
      return newIdentity;
    } catch (error) {
      console.error('Error creating anonymous identity:', error);
      throw error;
    }
  }

  /**
   * Get current anonymous identity
   */
  getCurrentIdentity(): AnonymousIdentity | null {
    return this.currentIdentity;
  }

  /**
   * Get current session
   */
  getCurrentSession(): AnonymousSession | null {
    return this.currentSession;
  }

  /**
   * Update reputation score for anonymous identity
   */
  async updateReputation(identityId: string, change: number): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('anonymous_identities')
        .select('reputation_score')
        .eq('id', identityId)
        .single();

      if (error) throw error;

      const newScore = Math.max(0, (data.reputation_score || 0) + change);

      await supabase
        .from('anonymous_identities')
        .update({ 
          reputation_score: newScore,
          last_active: new Date().toISOString()
        })
        .eq('id', identityId);

      if (this.currentIdentity && this.currentIdentity.id === identityId) {
        this.currentIdentity.reputation_score = newScore;
        this.currentIdentity.last_active = new Date().toISOString();
      }
    } catch (error) {
      console.error('Error updating reputation:', error);
    }
  }

  /**
   * Generate avatar URL based on seed (for consistent anonymous avatars)
   */
  generateAvatarUrl(seed: string): string {
    return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=random`;
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
      // Check local session
      const existingSessionData = localStorage.getItem('anonymous_session');
      if (existingSessionData) {
        const session = JSON.parse(existingSessionData) as AnonymousSession;
        if (new Date(session.expires_at).getTime() <= Date.now()) {
          localStorage.removeItem('anonymous_session');
          this.currentSession = null;
          this.currentIdentity = null;
        }
      }

      // Cleanup database sessions (run periodically)
      await supabase
        .from('anonymous_sessions')
        .update({ is_active: false })
        .lt('expires_at', new Date().toISOString());
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
    }
  }

  /**
   * Check if user can perform action based on reputation
   */
  canPerformAction(action: 'post' | 'comment' | 'vote' | 'report'): boolean {
    if (!this.currentIdentity) return false;

    const reputationRequirements = {
      post: 0,
      comment: 0,
      vote: 5,
      report: 10
    };

    return this.currentIdentity.reputation_score >= reputationRequirements[action];
  }

  /**
   * Get community stats for anonymous users in location
   */
  async getCommunityStats(locationHash?: string): Promise<{
    activeUsers: number;
    postsToday: number;
    topContributors: Array<{
      username: string;
      reputation: number;
      avatar_url: string;
    }>;
  }> {
    try {
      const targetLocation = locationHash || this.currentSession?.location_hash;
      if (!targetLocation) {
        return { activeUsers: 0, postsToday: 0, topContributors: [] };
      }

      // Get active users in last 24 hours
      const { count: activeUsers } = await supabase
        .from('anonymous_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('location_hash', targetLocation)
        .eq('is_active', true)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Get posts today
      const { count: postsToday } = await supabase
        .from('anonymous_posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date().toDateString());

      // Get top contributors
      const { data: topContributors } = await supabase
        .from('anonymous_identities')
        .select('anonymous_username, reputation_score, avatar_seed')
        .order('reputation_score', { ascending: false })
        .limit(5);

      return {
        activeUsers: activeUsers || 0,
        postsToday: postsToday || 0,
        topContributors: (topContributors || []).map(contributor => ({
          username: contributor.anonymous_username,
          reputation: contributor.reputation_score,
          avatar_url: this.generateAvatarUrl(contributor.avatar_seed)
        }))
      };
    } catch (error) {
      console.error('Error getting community stats:', error);
      return { activeUsers: 0, postsToday: 0, topContributors: [] };
    }
  }
}

export const anonymousIdentityService = new AnonymousIdentityService();
