import { supabase } from '@/integrations/supabase/client';

export interface AnonymousUsername {
  id: string;
  session_id: string;
  user_id?: string;
  display_name: string;
  generated_username: string;
  privacy_level: 'low' | 'medium' | 'high' | 'maximum';
  is_revealed: boolean;
  revealed_at?: string;
  created_at: string;
  last_active_at: string;
}

export interface UsernameGenerationOptions {
  privacyLevel?: 'low' | 'medium' | 'high' | 'maximum';
  includeNumbers?: boolean;
  includeSpecialChars?: boolean;
  length?: number;
}

export class AnonymousUsernameService {
  private adjectives = [
    'Swift', 'Bold', 'Clever', 'Bright', 'Calm', 'Cool', 'Dark', 'Fast', 'Gentle', 'Happy',
    'Kind', 'Loud', 'Mystic', 'Neat', 'Odd', 'Proud', 'Quiet', 'Rapid', 'Smart', 'Tough',
    'Unique', 'Vivid', 'Wise', 'Young', 'Zany', 'Brave', 'Curious', 'Daring', 'Eager',
    'Fierce', 'Glorious', 'Honest', 'Incredible', 'Joyful', 'Lively', 'Magnificent',
    'Noble', 'Optimistic', 'Peaceful', 'Radiant', 'Serene', 'Tranquil', 'Vibrant',
    'Wonderful', 'Amazing', 'Brilliant', 'Creative', 'Dynamic', 'Energetic', 'Fantastic'
  ];

  private nouns = [
    'Tiger', 'Eagle', 'Wolf', 'Bear', 'Lion', 'Fox', 'Hawk', 'Owl', 'Deer', 'Rabbit',
    'Dolphin', 'Whale', 'Shark', 'Butterfly', 'Dragon', 'Phoenix', 'Unicorn', 'Griffin',
    'Mountain', 'River', 'Ocean', 'Forest', 'Desert', 'Valley', 'Canyon', 'Meadow',
    'Thunder', 'Lightning', 'Storm', 'Rain', 'Snow', 'Wind', 'Fire', 'Ice', 'Star',
    'Moon', 'Sun', 'Comet', 'Galaxy', 'Nebula', 'Cosmos', 'Aurora', 'Twilight',
    'Adventure', 'Journey', 'Quest', 'Discovery', 'Explorer', 'Wanderer', 'Traveler',
    'Dreamer', 'Thinker', 'Creator', 'Artist', 'Poet', 'Sage', 'Mystic', 'Guardian'
  ];

  private colors = [
    'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Black', 'White',
    'Silver', 'Gold', 'Bronze', 'Crimson', 'Azure', 'Emerald', 'Amber', 'Violet',
    'Coral', 'Indigo', 'Turquoise', 'Magenta', 'Cyan', 'Lime', 'Maroon', 'Navy',
    'Teal', 'Olive', 'Burgundy', 'Charcoal', 'Ivory', 'Pearl', 'Ruby', 'Sapphire'
  ];

  /**
   * Generate a Reddit-style anonymous username
   */
  generateUsername(options: UsernameGenerationOptions = {}): string {
    const {
      privacyLevel = 'medium',
      includeNumbers = true,
      includeSpecialChars = false,
      length = 8
    } = options;

    let username = '';

    switch (privacyLevel) {
      case 'low':
        // More recognizable patterns
        username = this.generateLowPrivacyUsername();
        break;
      case 'medium':
        // Balanced approach
        username = this.generateMediumPrivacyUsername();
        break;
      case 'high':
        // More random
        username = this.generateHighPrivacyUsername();
        break;
      case 'maximum':
        // Maximum randomness
        username = this.generateMaximumPrivacyUsername();
        break;
    }

    // Add numbers if requested
    if (includeNumbers) {
      const randomNum = Math.floor(Math.random() * 9999) + 1;
      username += randomNum.toString();
    }

    // Add special characters if requested (rarely used for usernames)
    if (includeSpecialChars && Math.random() < 0.1) {
      const specialChars = ['_', '-', '.'];
      username += specialChars[Math.floor(Math.random() * specialChars.length)];
    }

    return username;
  }

  private generateLowPrivacyUsername(): string {
    // Adjective + Noun pattern (more memorable)
    const adjective = this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
    const noun = this.nouns[Math.floor(Math.random() * this.nouns.length)];
    return `${adjective}${noun}`;
  }

  private generateMediumPrivacyUsername(): string {
    // Color + Noun pattern
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    const noun = this.nouns[Math.floor(Math.random() * this.nouns.length)];
    return `${color}${noun}`;
  }

  private generateHighPrivacyUsername(): string {
    // Random combination
    const part1 = this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
    const part2 = this.nouns[Math.floor(Math.random() * this.nouns.length)];
    const part3 = this.colors[Math.floor(Math.random() * this.colors.length)];
    
    // Randomly combine 2-3 parts
    const parts = [part1, part2, part3].sort(() => Math.random() - 0.5);
    return parts.slice(0, Math.floor(Math.random() * 2) + 2).join('');
  }

  private generateMaximumPrivacyUsername(): string {
    // Completely random string
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Create or update anonymous user with generated username
   */
  async createAnonymousUser(
    sessionId: string,
    userId?: string,
    options: UsernameGenerationOptions = {}
  ): Promise<AnonymousUsername> {
    try {
      // Check if anonymous user already exists for this session
      const { data: existingUser } = await supabase
        .from('anonymous_users')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (existingUser) {
        // Update last active time
        await supabase
          .from('anonymous_users')
          .update({ last_active_at: new Date().toISOString() })
          .eq('id', existingUser.id);

        return {
          id: existingUser.id,
          session_id: existingUser.session_id,
          user_id: existingUser.user_id,
          display_name: existingUser.display_name,
          generated_username: existingUser.display_name, // Using display_name as generated username
          privacy_level: 'medium', // Default privacy level
          is_revealed: false,
          created_at: existingUser.created_at,
          last_active_at: new Date().toISOString()
        };
      }

      // Generate new username
      const generatedUsername = this.generateUsername(options);
      
      // Create new anonymous user
      const { data: newUser, error } = await supabase
        .from('anonymous_users')
        .insert({
          session_id: sessionId,
          user_id: userId,
          display_name: generatedUsername,
          created_at: new Date().toISOString(),
          last_active_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create anonymous user: ${error.message}`);
      }

      return {
        id: newUser.id,
        session_id: newUser.session_id,
        user_id: newUser.user_id,
        display_name: newUser.display_name,
        generated_username: newUser.display_name,
        privacy_level: options.privacyLevel || 'medium',
        is_revealed: false,
        created_at: newUser.created_at,
        last_active_at: newUser.last_active_at
      };
    } catch (error) {
      console.error('Error creating anonymous user:', error);
      throw error;
    }
  }

  /**
   * Get anonymous user by session ID
   */
  async getAnonymousUser(sessionId: string): Promise<AnonymousUsername | null> {
    try {
      const { data, error } = await supabase
        .from('anonymous_users')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No user found
        }
        throw new Error(`Failed to get anonymous user: ${error.message}`);
      }

      return {
        id: data.id,
        session_id: data.session_id,
        user_id: data.user_id,
        display_name: data.display_name,
        generated_username: data.display_name,
        privacy_level: 'medium', // Default
        is_revealed: false,
        created_at: data.created_at,
        last_active_at: data.last_active_at
      };
    } catch (error) {
      console.error('Error getting anonymous user:', error);
      throw error;
    }
  }

  /**
   * Regenerate username for existing anonymous user
   */
  async regenerateUsername(
    sessionId: string,
    options: UsernameGenerationOptions = {}
  ): Promise<AnonymousUsername> {
    try {
      const newUsername = this.generateUsername(options);
      
      const { data, error } = await supabase
        .from('anonymous_users')
        .update({
          display_name: newUsername,
          last_active_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to regenerate username: ${error.message}`);
      }

      return {
        id: data.id,
        session_id: data.session_id,
        user_id: data.user_id,
        display_name: data.display_name,
        generated_username: data.display_name,
        privacy_level: options.privacyLevel || 'medium',
        is_revealed: false,
        created_at: data.created_at,
        last_active_at: data.last_active_at
      };
    } catch (error) {
      console.error('Error regenerating username:', error);
      throw error;
    }
  }

  /**
   * Reveal identity (link anonymous user to real user)
   */
  async revealIdentity(sessionId: string, userId: string): Promise<AnonymousUsername> {
    try {
      const { data, error } = await supabase
        .from('anonymous_users')
        .update({
          user_id: userId,
          last_active_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to reveal identity: ${error.message}`);
      }

      return {
        id: data.id,
        session_id: data.session_id,
        user_id: data.user_id,
        display_name: data.display_name,
        generated_username: data.display_name,
        privacy_level: 'medium',
        is_revealed: true,
        revealed_at: new Date().toISOString(),
        created_at: data.created_at,
        last_active_at: data.last_active_at
      };
    } catch (error) {
      console.error('Error revealing identity:', error);
      throw error;
    }
  }

  /**
   * Get privacy level recommendations based on user behavior
   */
  getPrivacyRecommendations(userBehavior: {
    postFrequency: number;
    commentFrequency: number;
    locationSharing: boolean;
    realNameUsage: boolean;
  }): {
    recommendedLevel: 'low' | 'medium' | 'high' | 'maximum';
    reasons: string[];
  } {
    const reasons: string[] = [];
    let score = 0;

    // Analyze behavior patterns
    if (userBehavior.postFrequency > 10) {
      score += 2;
      reasons.push('High posting frequency increases exposure risk');
    } else if (userBehavior.postFrequency > 5) {
      score += 1;
      reasons.push('Moderate posting frequency');
    }

    if (userBehavior.commentFrequency > 20) {
      score += 2;
      reasons.push('High commenting activity increases traceability');
    } else if (userBehavior.commentFrequency > 10) {
      score += 1;
      reasons.push('Active commenting behavior');
    }

    if (userBehavior.locationSharing) {
      score += 3;
      reasons.push('Location sharing significantly increases privacy risk');
    }

    if (userBehavior.realNameUsage) {
      score += 4;
      reasons.push('Real name usage compromises anonymity');
    }

    // Determine recommended level
    let recommendedLevel: 'low' | 'medium' | 'high' | 'maximum';
    if (score >= 8) {
      recommendedLevel = 'maximum';
      reasons.push('Maximum privacy recommended due to high-risk behavior');
    } else if (score >= 5) {
      recommendedLevel = 'high';
      reasons.push('High privacy recommended due to moderate risk');
    } else if (score >= 2) {
      recommendedLevel = 'medium';
      reasons.push('Medium privacy recommended for balanced approach');
    } else {
      recommendedLevel = 'low';
      reasons.push('Low privacy acceptable for minimal risk behavior');
    }

    return { recommendedLevel, reasons };
  }
}

export const anonymousUsernameService = new AnonymousUsernameService();
