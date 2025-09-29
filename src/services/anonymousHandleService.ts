import { supabase } from '@/integrations/supabase/client';

export interface AnonymousHandle {
  username: string;
  displayName: string;
  isGenerated: boolean;
  isUnique: boolean;
}

export interface HandleGenerationOptions {
  prefix?: string;
  includeNumbers?: boolean;
  format?: 'adjective-noun' | 'color-noun' | 'adjective-color' | 'noun-color' | 'random';
  maxLength?: number;
}

class AnonymousHandleService {
  private adjectives = [
    'Swift', 'Bright', 'Clever', 'Bold', 'Calm', 'Cool', 'Fast', 'Kind',
    'Smart', 'Wise', 'Brave', 'Gentle', 'Happy', 'Lucky', 'Magic', 'Pure',
    'Quick', 'Sharp', 'Strong', 'Sweet', 'True', 'Wild', 'Young', 'Zest',
    'Epic', 'Noble', 'Radiant', 'Vibrant', 'Dynamic', 'Elegant', 'Fierce',
    'Golden', 'Harmonic', 'Infinite', 'Jovial', 'Keen', 'Luminous', 'Mystic',
    'Serene', 'Vivid', 'Cosmic', 'Prismatic', 'Ethereal', 'Celestial'
  ];

  private nouns = [
    'Tiger', 'Eagle', 'Wolf', 'Bear', 'Fox', 'Hawk', 'Lion', 'Deer',
    'Owl', 'Raven', 'Falcon', 'Shark', 'Dolphin', 'Phoenix', 'Dragon',
    'Unicorn', 'Pegasus', 'Griffin', 'Sphinx', 'Basilisk', 'Phoenix',
    'Explorer', 'Navigator', 'Pioneer', 'Adventurer', 'Dreamer', 'Creator',
    'Builder', 'Artist', 'Writer', 'Sage', 'Mage', 'Warrior', 'Guardian',
    'Wanderer', 'Seeker', 'Thinker', 'Innovator', 'Visionary', 'Legend',
    'Philosopher', 'Inventor', 'Scholar', 'Mentor', 'Guide', 'Champion'
  ];

  private colors = [
    'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Cyan',
    'Magenta', 'Lime', 'Indigo', 'Teal', 'Coral', 'Gold', 'Silver', 'Copper',
    'Emerald', 'Ruby', 'Sapphire', 'Amber', 'Pearl', 'Crystal', 'Shadow',
    'Light', 'Dark', 'Bright', 'Deep', 'Rich', 'Vivid', 'Pastel', 'Azure',
    'Crimson', 'Violet', 'Turquoise', 'Scarlet', 'Ivory', 'Ebony'
  ];

  /**
   * Generate a random anonymous handle
   */
  async generateAnonymousHandle(options: HandleGenerationOptions = {}): Promise<AnonymousHandle> {
    const {
      prefix = '',
      includeNumbers = true,
      format = 'random',
      maxLength = 20
    } = options;

    let username: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      username = this.generateHandle(format, includeNumbers);
      
      if (prefix) {
        username = prefix + username;
      }

      // Ensure max length
      if (username.length > maxLength) {
        username = username.substring(0, maxLength);
      }

      attempts++;
    } while (attempts < maxAttempts && !(await this.isHandleUnique(username)));

    // If we couldn't find a unique handle after max attempts, add random suffix
    if (attempts >= maxAttempts) {
      const randomSuffix = Math.floor(Math.random() * 9999);
      username = username.substring(0, maxLength - 4) + randomSuffix;
    }

    return {
      username,
      displayName: username,
      isGenerated: true,
      isUnique: await this.isHandleUnique(username)
    };
  }

  /**
   * Generate handle using specified format
   */
  private generateHandle(format: string, includeNumbers: boolean): string {
    const adjective = this.getRandomElement(this.adjectives);
    const noun = this.getRandomElement(this.nouns);
    const color = this.getRandomElement(this.colors);
    const number = includeNumbers ? Math.floor(Math.random() * 9999) + 1 : '';

    switch (format) {
      case 'adjective-noun':
        return adjective + noun + number;
      case 'color-noun':
        return color + noun + number;
      case 'adjective-color':
        return adjective + color + number;
      case 'noun-color':
        return noun + color + number;
      case 'random':
      default: {
        const formats = ['adjective-noun', 'color-noun', 'adjective-color', 'noun-color'];
        const randomFormat = formats[Math.floor(Math.random() * formats.length)];
        return this.generateHandle(randomFormat, includeNumbers);
      }
    }
  }

  /**
   * Get random element from array
   */
  private getRandomElement(array: string[]): string {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Check if handle is unique in the database
   */
  async isHandleUnique(username: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows found, username is unique
        return true;
      }

      if (error) {
        console.error('Error checking handle uniqueness:', error);
        return false;
      }

      // Username exists, not unique
      return false;
    } catch (error) {
      console.error('Error in isHandleUnique:', error);
      return false;
    }
  }

  /**
   * Validate handle format and rules
   */
  validateHandle(username: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!username || username.trim().length === 0) {
      errors.push('Username cannot be empty');
    }

    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    if (username.length > 30) {
      errors.push('Username cannot exceed 30 characters');
    }

    // Check for valid characters (alphanumeric, underscore, hyphen)
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, underscores, and hyphens');
    }

    // Check for reserved words
    const reservedWords = [
      'admin', 'administrator', 'moderator', 'mod', 'support', 'help',
      'api', 'www', 'mail', 'email', 'root', 'user', 'guest', 'anonymous',
      'null', 'undefined', 'true', 'false', 'system', 'service'
    ];

    if (reservedWords.includes(username.toLowerCase())) {
      errors.push('This username is reserved and cannot be used');
    }

    // Check for profanity (basic check)
    const profanityWords = ['damn', 'hell', 'shit', 'fuck', 'bitch', 'ass'];
    if (profanityWords.some(word => username.toLowerCase().includes(word))) {
      errors.push('Username contains inappropriate content');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate multiple handle suggestions
   */
  async generateHandleSuggestions(count: number = 5, options: HandleGenerationOptions = {}): Promise<AnonymousHandle[]> {
    const suggestions: AnonymousHandle[] = [];
    const seenHandles = new Set<string>();

    for (let i = 0; i < count * 2; i++) { // Generate extra to account for duplicates
      if (suggestions.length >= count) break;

      const handle = await this.generateAnonymousHandle(options);
      
      if (!seenHandles.has(handle.username)) {
        seenHandles.add(handle.username);
        suggestions.push(handle);
      }
    }

    return suggestions.slice(0, count);
  }

  /**
   * Create anonymous handle for new user during signup
   */
  async createAnonymousHandleForUser(userId: string, options: HandleGenerationOptions = {}): Promise<{ success: boolean; handle?: AnonymousHandle; error?: string }> {
    try {
      // Generate anonymous handle
      const handle = await this.generateAnonymousHandle(options);

      // Validate the handle
      const validation = this.validateHandle(handle.username);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Invalid handle: ${validation.errors.join(', ')}`
        };
      }

      // Check uniqueness again before saving
      const isUnique = await this.isHandleUnique(handle.username);
      if (!isUnique) {
        return {
          success: false,
          error: 'Generated handle is not unique'
        };
      }

      // Update user profile with anonymous handle
      const { data, error } = await supabase
        .from('profiles')
        .update({
          username: handle.username,
          display_name: handle.displayName,
          is_anonymous: true,
          privacy_level: 'anonymous',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile with anonymous handle:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        handle: {
          username: data.username,
          displayName: data.display_name,
          isGenerated: true,
          isUnique: true
        }
      };
    } catch (error) {
      console.error('Error creating anonymous handle for user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Regenerate anonymous handle for existing user
   */
  async regenerateAnonymousHandle(userId: string, options: HandleGenerationOptions = {}): Promise<{ success: boolean; handle?: AnonymousHandle; error?: string }> {
    try {
      // Generate new anonymous handle
      const handle = await this.generateAnonymousHandle(options);

      // Validate the handle
      const validation = this.validateHandle(handle.username);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Invalid handle: ${validation.errors.join(', ')}`
        };
      }

      // Check uniqueness
      const isUnique = await this.isHandleUnique(handle.username);
      if (!isUnique) {
        return {
          success: false,
          error: 'Generated handle is not unique'
        };
      }

      // Update user profile with new anonymous handle
      const { data, error } = await supabase
        .from('profiles')
        .update({
          username: handle.username,
          display_name: handle.displayName,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile with new anonymous handle:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        handle: {
          username: data.username,
          displayName: data.display_name,
          isGenerated: true,
          isUnique: true
        }
      };
    } catch (error) {
      console.error('Error regenerating anonymous handle:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get handle statistics
   */
  async getHandleStatistics(): Promise<{
    totalHandles: number;
    anonymousHandles: number;
    publicHandles: number;
    uniquePrefixes: string[];
  }> {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('username, is_anonymous, privacy_level');

      if (error) {
        console.error('Error fetching handle statistics:', error);
        return {
          totalHandles: 0,
          anonymousHandles: 0,
          publicHandles: 0,
          uniquePrefixes: []
        };
      }

      const totalHandles = profiles?.length || 0;
      const anonymousHandles = profiles?.filter(p => p.is_anonymous).length || 0;
      const publicHandles = profiles?.filter(p => p.privacy_level === 'public').length || 0;

      // Extract unique prefixes from usernames
      const prefixes = new Set<string>();
      profiles?.forEach(profile => {
        const firstWord = profile.username?.split(/[0-9_-]/)[0];
        if (firstWord && firstWord.length > 2) {
          prefixes.add(firstWord);
        }
      });

      return {
        totalHandles,
        anonymousHandles,
        publicHandles,
        uniquePrefixes: Array.from(prefixes)
      };
    } catch (error) {
      console.error('Error in getHandleStatistics:', error);
      return {
        totalHandles: 0,
        anonymousHandles: 0,
        publicHandles: 0,
        uniquePrefixes: []
      };
    }
  }
}

export const anonymousHandleService = new AnonymousHandleService();
