import { supabase } from '@/integrations/supabase/client';

export interface EventDiscussion {
  id: string;
  event_id: string;
  user_id?: string;
  session_id?: string;
  content: string;
  is_anonymous: boolean;
  anonymous_username?: string;
  parent_id?: string;
  upvotes: number;
  downvotes: number;
  score: number;
  depth: number;
  is_pinned: boolean;
  is_moderated: boolean;
  moderation_reason?: string;
  created_at: string;
  updated_at: string;
  replies?: EventDiscussion[];
}

export interface CommunityPoll {
  id: string;
  post_id?: string;
  anonymous_post_id?: string;
  user_id?: string;
  session_id?: string;
  question: string;
  description?: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
    color?: string;
  }>;
  total_votes: number;
  is_multiple_choice: boolean;
  is_anonymous: boolean;
  is_public: boolean;
  expires_at?: string;
  is_active: boolean;
  allow_comments: boolean;
  show_results_before_voting: boolean;
  created_at: string;
  updated_at: string;
  user_vote?: string[];
}

export interface PollVote {
  id: string;
  poll_id: string;
  user_id?: string;
  session_id?: string;
  selected_options: string[];
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface ArtistEngagement {
  id: string;
  artist_id: string;
  follower_id?: string;
  session_id?: string;
  engagement_type: 'follow' | 'unfollow' | 'like' | 'comment' | 'share' | 'bookmark' | 'message';
  content_id?: string;
  content_type?: string;
  is_anonymous: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ArtistFollower {
  id: string;
  artist_id: string;
  follower_id?: string;
  session_id?: string;
  is_anonymous: boolean;
  notification_preferences: {
    new_posts: boolean;
    events: boolean;
    services: boolean;
    messages: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface ArtistPortfolio {
  id: string;
  artist_id: string;
  title: string;
  description?: string;
  media_urls: string[];
  media_type?: 'image' | 'video' | 'audio' | 'document';
  category?: string;
  tags: string[];
  is_featured: boolean;
  is_public: boolean;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
  is_liked?: boolean;
}

export interface LocalEvent {
  id: string;
  post_id?: string;
  organizer_id: string;
  title: string;
  description: string;
  event_type: 'community' | 'cultural' | 'sports' | 'educational' | 'business' | 'social' | 'religious' | 'political' | 'environmental' | 'health' | 'other';
  start_date: string;
  end_date?: string;
  location_name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  country?: string;
  max_attendees?: number;
  current_attendees: number;
  registration_required: boolean;
  registration_deadline?: string;
  is_free: boolean;
  ticket_price: number;
  currency: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  social_media: Record<string, string>;
  tags: string[];
  is_public: boolean;
  is_featured: boolean;
  featured_until?: string;
  status: 'draft' | 'active' | 'cancelled' | 'completed' | 'postponed';
  created_at: string;
  updated_at: string;
  is_attending?: boolean;
  attendance_status?: 'registered' | 'attending' | 'not_attending' | 'waitlist';
}

export interface EventAttendee {
  id: string;
  event_id: string;
  user_id?: string;
  session_id?: string;
  is_anonymous: boolean;
  anonymous_name?: string;
  status: 'registered' | 'attending' | 'not_attending' | 'waitlist';
  registration_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export class CommunityService {
  private static instance: CommunityService;

  public static getInstance(): CommunityService {
    if (!CommunityService.instance) {
      CommunityService.instance = new CommunityService();
    }
    return CommunityService.instance;
  }

  // Event Discussions
  async createEventDiscussion(
    eventId: string,
    content: string,
    options?: {
      parentId?: string;
      isAnonymous?: boolean;
      anonymousUsername?: string;
    }
  ): Promise<EventDiscussion> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = options?.isAnonymous ? 
        (await import('@/services/anonymousUserService')).anonymousUserService.getCurrentSessionId() : 
        undefined;

      const { data, error } = await supabase
        .from('event_discussions')
        .insert({
          event_id: eventId,
          user_id: user?.id,
          session_id: sessionId,
          content,
          is_anonymous: options?.isAnonymous || false,
          anonymous_username: options?.anonymousUsername,
          parent_id: options?.parentId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating event discussion:', error);
      throw error;
    }
  }

  async getEventDiscussions(
    eventId: string,
    options?: {
      limit?: number;
      offset?: number;
      includeReplies?: boolean;
    }
  ): Promise<EventDiscussion[]> {
    try {
      let query = supabase
        .from('event_discussions')
        .select('*')
        .eq('event_id', eventId)
        .eq('is_moderated', false)
        .order('is_pinned', { ascending: false })
        .order('score', { ascending: false })
        .order('created_at', { ascending: true });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (options?.includeReplies) {
        // Load replies for each discussion
        const discussionsWithReplies = await Promise.all(
          (data || []).map(async (discussion) => {
            const { data: replies } = await supabase
              .from('event_discussions')
              .select('*')
              .eq('parent_id', discussion.id)
              .eq('is_moderated', false)
              .order('created_at', { ascending: true });

            return {
              ...discussion,
              replies: replies || []
            };
          })
        );

        return discussionsWithReplies;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching event discussions:', error);
      return [];
    }
  }

  // Community Polls
  async createPoll(
    question: string,
    options: Array<{ text: string; color?: string }>,
    pollOptions?: {
      description?: string;
      isMultipleChoice?: boolean;
      isAnonymous?: boolean;
      isPublic?: boolean;
      expiresAt?: string;
      allowComments?: boolean;
      showResultsBeforeVoting?: boolean;
      postId?: string;
      anonymousPostId?: string;
    }
  ): Promise<CommunityPoll> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = pollOptions?.isAnonymous ? 
        (await import('@/services/anonymousUserService')).anonymousUserService.getCurrentSessionId() : 
        undefined;

      const pollOptionsData = options.map((option, index) => ({
        id: `option_${index + 1}`,
        text: option.text,
        votes: 0,
        color: option.color || `hsl(${index * 60}, 70%, 50%)`
      }));

      const { data, error } = await supabase
        .from('community_polls')
        .insert({
          user_id: user?.id,
          session_id: sessionId,
          question,
          description: pollOptions?.description,
          options: pollOptionsData,
          is_multiple_choice: pollOptions?.isMultipleChoice || false,
          is_anonymous: pollOptions?.isAnonymous || false,
          is_public: pollOptions?.isPublic !== false,
          expires_at: pollOptions?.expiresAt,
          allow_comments: pollOptions?.allowComments !== false,
          show_results_before_voting: pollOptions?.showResultsBeforeVoting || false,
          post_id: pollOptions?.postId,
          anonymous_post_id: pollOptions?.anonymousPostId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating poll:', error);
      throw error;
    }
  }

  async getPolls(
    filters?: {
      postId?: string;
      anonymousPostId?: string;
      isActive?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<CommunityPoll[]> {
    try {
      let query = supabase
        .from('community_polls')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (filters?.postId) {
        query = query.eq('post_id', filters.postId);
      }

      if (filters?.anonymousPostId) {
        query = query.eq('anonymous_post_id', filters.anonymousPostId);
      }

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Check if user has voted on each poll
      const pollsWithVotes = await Promise.all(
        (data || []).map(async (poll) => {
          const { data: { user } } = await supabase.auth.getUser();
          const sessionId = (await import('@/services/anonymousUserService')).anonymousUserService.getCurrentSessionId();

          let userVote: string[] = [];
          if (user || sessionId) {
            const { data: vote } = await supabase
              .from('poll_votes')
              .select('selected_options')
              .eq('poll_id', poll.id)
              .or(`user_id.eq.${user?.id},session_id.eq.${sessionId}`)
              .single();

            userVote = vote?.selected_options || [];
          }

          return {
            ...poll,
            user_vote: userVote
          };
        })
      );

      return pollsWithVotes;
    } catch (error) {
      console.error('Error fetching polls:', error);
      return [];
    }
  }

  async voteOnPoll(
    pollId: string,
    selectedOptions: string[],
    isAnonymous: boolean = false
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = isAnonymous ? 
        (await import('@/services/anonymousUserService')).anonymousUserService.getCurrentSessionId() : 
        undefined;

      if (!user && !sessionId) {
        throw new Error('User must be authenticated or have an anonymous session');
      }

      const { error } = await supabase
        .from('poll_votes')
        .upsert({
          poll_id: pollId,
          user_id: user?.id,
          session_id: sessionId,
          selected_options: selectedOptions,
          is_anonymous: isAnonymous,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error voting on poll:', error);
      throw error;
    }
  }

  // Artist Engagement
  async followArtist(
    artistId: string,
    isAnonymous: boolean = false
  ): Promise<ArtistFollower> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = isAnonymous ? 
        (await import('@/services/anonymousUserService')).anonymousUserService.getCurrentSessionId() : 
        undefined;

      if (!user && !sessionId) {
        throw new Error('User must be authenticated or have an anonymous session');
      }

      const { data, error } = await supabase
        .from('artist_followers')
        .insert({
          artist_id: artistId,
          follower_id: user?.id,
          session_id: sessionId,
          is_anonymous: isAnonymous,
        })
        .select()
        .single();

      if (error) throw error;

      // Record engagement
      await this.recordArtistEngagement(artistId, 'follow', undefined, undefined, isAnonymous);

      return data;
    } catch (error) {
      console.error('Error following artist:', error);
      throw error;
    }
  }

  async unfollowArtist(artistId: string, isAnonymous: boolean = false): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = isAnonymous ? 
        (await import('@/services/anonymousUserService')).anonymousUserService.getCurrentSessionId() : 
        undefined;

      const { error } = await supabase
        .from('artist_followers')
        .delete()
        .or(`user_id.eq.${user?.id},session_id.eq.${sessionId}`)
        .eq('artist_id', artistId);

      if (error) throw error;

      // Record engagement
      await this.recordArtistEngagement(artistId, 'unfollow', undefined, undefined, isAnonymous);
    } catch (error) {
      console.error('Error unfollowing artist:', error);
      throw error;
    }
  }

  async recordArtistEngagement(
    artistId: string,
    engagementType: ArtistEngagement['engagement_type'],
    contentId?: string,
    contentType?: string,
    isAnonymous: boolean = false
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = isAnonymous ? 
        (await import('@/services/anonymousUserService')).anonymousUserService.getCurrentSessionId() : 
        undefined;

      const { error } = await supabase
        .from('artist_engagements')
        .insert({
          artist_id: artistId,
          follower_id: user?.id,
          session_id: sessionId,
          engagement_type: engagementType,
          content_id: contentId,
          content_type: contentType,
          is_anonymous: isAnonymous,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error recording artist engagement:', error);
      throw error;
    }
  }

  async getArtistFollowers(
    artistId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<ArtistFollower[]> {
    try {
      let query = supabase
        .from('artist_followers')
        .select('*')
        .eq('artist_id', artistId)
        .order('created_at', { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching artist followers:', error);
      return [];
    }
  }

  async isFollowingArtist(artistId: string, isAnonymous: boolean = false): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = isAnonymous ? 
        (await import('@/services/anonymousUserService')).anonymousUserService.getCurrentSessionId() : 
        undefined;

      const { data, error } = await supabase
        .from('artist_followers')
        .select('id')
        .eq('artist_id', artistId)
        .or(`user_id.eq.${user?.id},session_id.eq.${sessionId}`)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking artist follow status:', error);
      return false;
    }
  }

  // Local Events
  async createEvent(eventData: Omit<LocalEvent, 'id' | 'created_at' | 'updated_at' | 'current_attendees'>): Promise<LocalEvent> {
    try {
      const { data, error } = await supabase
        .from('local_events')
        .insert(eventData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async getEvents(
    filters?: {
      city?: string;
      state?: string;
      eventType?: LocalEvent['event_type'];
      isPublic?: boolean;
      isActive?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<LocalEvent[]> {
    try {
      let query = supabase
        .from('local_events')
        .select('*')
        .order('start_date', { ascending: true });

      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }

      if (filters?.state) {
        query = query.ilike('state', `%${filters.state}%`);
      }

      if (filters?.eventType) {
        query = query.eq('event_type', filters.eventType);
      }

      if (filters?.isPublic !== undefined) {
        query = query.eq('is_public', filters.isPublic);
      }

      if (filters?.isActive !== undefined) {
        query = query.eq('status', filters.isActive ? 'active' : 'inactive');
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Check if user is attending each event
      const eventsWithAttendance = await Promise.all(
        (data || []).map(async (event) => {
          const { data: { user } } = await supabase.auth.getUser();
          const sessionId = (await import('@/services/anonymousUserService')).anonymousUserService.getCurrentSessionId();

          let attendanceStatus: EventAttendee['status'] | undefined;
          if (user || sessionId) {
            const { data: attendance } = await supabase
              .from('event_attendees')
              .select('status')
              .eq('event_id', event.id)
              .or(`user_id.eq.${user?.id},session_id.eq.${sessionId}`)
              .single();

            attendanceStatus = attendance?.status;
          }

          return {
            ...event,
            is_attending: !!attendanceStatus,
            attendance_status: attendanceStatus
          };
        })
      );

      return eventsWithAttendance;
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  async registerForEvent(
    eventId: string,
    options?: {
      isAnonymous?: boolean;
      anonymousName?: string;
      notes?: string;
    }
  ): Promise<EventAttendee> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = options?.isAnonymous ? 
        (await import('@/services/anonymousUserService')).anonymousUserService.getCurrentSessionId() : 
        undefined;

      if (!user && !sessionId) {
        throw new Error('User must be authenticated or have an anonymous session');
      }

      const { data, error } = await supabase
        .from('event_attendees')
        .insert({
          event_id: eventId,
          user_id: user?.id,
          session_id: sessionId,
          is_anonymous: options?.isAnonymous || false,
          anonymous_name: options?.anonymousName,
          notes: options?.notes,
          status: 'registered',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error registering for event:', error);
      throw error;
    }
  }

  async updateEventAttendance(
    eventId: string,
    status: EventAttendee['status'],
    isAnonymous: boolean = false
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = isAnonymous ? 
        (await import('@/services/anonymousUserService')).anonymousUserService.getCurrentSessionId() : 
        undefined;

      const { error } = await supabase
        .from('event_attendees')
        .update({ status })
        .eq('event_id', eventId)
        .or(`user_id.eq.${user?.id},session_id.eq.${sessionId}`);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating event attendance:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const communityService = CommunityService.getInstance();