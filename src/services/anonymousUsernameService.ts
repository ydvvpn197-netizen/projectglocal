interface GenerateUsernameParams {
  privacyLevel: 'low' | 'medium' | 'high' | 'maximum';
  includeNumbers: boolean;
  includeSpecialChars: boolean;
  length: number;
}

class AnonymousUsernameService {
  private adjectives = [
    'Swift', 'Bold', 'Bright', 'Calm', 'Cool', 'Dark', 'Fast', 'Free', 'Good', 'Great',
    'Happy', 'Kind', 'Light', 'New', 'Old', 'Pure', 'Real', 'Rich', 'Safe', 'Smart',
    'Strong', 'True', 'Wise', 'Young', 'Wild', 'Brave', 'Clear', 'Deep', 'Fair', 'Fine',
    'Gentle', 'Quick', 'Sharp', 'Sweet', 'Warm', 'Fresh', 'Clean', 'Clear', 'Bright', 'Shiny'
  ];
  
  private nouns = [
    'Tiger', 'Eagle', 'Wolf', 'Bear', 'Lion', 'Fox', 'Hawk', 'Falcon', 'Raven', 'Owl',
    'Storm', 'Wind', 'Fire', 'Water', 'Earth', 'Sky', 'Star', 'Moon', 'Sun', 'Cloud',
    'River', 'Mountain', 'Forest', 'Ocean', 'Desert', 'Valley', 'Peak', 'Creek', 'Lake', 'Bay',
    'Phoenix', 'Dragon', 'Spirit', 'Soul', 'Heart', 'Mind', 'Dream', 'Hope', 'Joy', 'Peace'
  ];

  generateUsername(params: GenerateUsernameParams): string {
    const { privacyLevel, includeNumbers, includeSpecialChars, length } = params;
    
    const numbers = includeNumbers ? ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] : [];
    const specialChars = includeSpecialChars ? ['_', '-', '.'] : [];
    
    let username = '';
    
    switch (privacyLevel) {
      case 'low':
        // More memorable, easier to trace
        username = this.getRandomItem(this.adjectives) + this.getRandomItem(this.nouns);
        if (includeNumbers) {
          username += Math.floor(Math.random() * 100);
        }
        break;
        
      case 'medium':
        // Balanced approach
        username = this.getRandomItem(this.adjectives) + this.getRandomItem(this.nouns);
        if (includeNumbers) {
          username += Math.floor(Math.random() * 1000);
        }
        break;
        
      case 'high':
        // More random
        username = this.getRandomItem(this.adjectives) + this.getRandomItem(this.nouns);
        if (includeNumbers) {
          username += Math.floor(Math.random() * 10000);
        }
        if (includeSpecialChars) {
          username += this.getRandomItem(specialChars);
        }
        break;
        
      case 'maximum': {
        // Completely random
        const chars = 'abcdefghijklmnopqrstuvwxyz' + 
                     (includeNumbers ? '0123456789' : '') + 
                     (includeSpecialChars ? '_-.' : '');
        for (let i = 0; i < length; i++) {
          username += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        break;
      }
    }
    
    // Ensure username meets length requirements
    if (username.length < length) {
      const padding = 'abcdefghijklmnopqrstuvwxyz';
      while (username.length < length) {
        username += padding.charAt(Math.floor(Math.random() * padding.length));
      }
    } else if (username.length > length) {
      username = username.substring(0, length);
    }
    
    return username;
  }

  generateMultipleUsernames(count: number, params: GenerateUsernameParams): string[] {
    const usernames: string[] = [];
    for (let i = 0; i < count; i++) {
      usernames.push(this.generateUsername(params));
    }
    return usernames;
  }

  validateUsername(username: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    
    if (username.length > 20) {
      errors.push('Username must be no more than 20 characters long');
    }
    
    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, dots, underscores, and hyphens');
    }
    
    if (username.startsWith('.') || username.endsWith('.')) {
      errors.push('Username cannot start or end with a dot');
    }
    
    if (username.includes('..')) {
      errors.push('Username cannot contain consecutive dots');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  getPrivacyLevelInfo(level: 'low' | 'medium' | 'high' | 'maximum') {
    switch (level) {
      case 'low':
        return {
          label: 'Low Privacy',
          description: 'More memorable usernames, easier to trace',
          risk: 'Low',
          color: 'yellow'
        };
      case 'medium':
        return {
          label: 'Medium Privacy',
          description: 'Balanced approach between privacy and usability',
          risk: 'Medium',
          color: 'blue'
        };
      case 'high':
        return {
          label: 'High Privacy',
          description: 'More random usernames, harder to trace',
          risk: 'High',
          color: 'orange'
        };
      case 'maximum':
        return {
          label: 'Maximum Privacy',
          description: 'Completely random usernames, maximum anonymity',
          risk: 'Maximum',
          color: 'red'
        };
    }
  }

  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}

export const anonymousUsernameService = new AnonymousUsernameService();