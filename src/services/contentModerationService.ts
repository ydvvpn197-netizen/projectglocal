/**
 * AI-Powered Content Moderation Service
 * Provides automated content filtering and moderation using AI
 */

export interface ModerationResult {
  isApproved: boolean;
  confidence: number;
  categories: ModerationCategory[];
  suggestions: string[];
  reasons: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ModerationCategory {
  name: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface ContentToModerate {
  text?: string;
  images?: string[];
  userId: string;
  contentType: 'post' | 'comment' | 'message' | 'profile' | 'event' | 'news';
  context?: string;
}

export interface ModerationSettings {
  enableAutoModeration: boolean;
  enableImageModeration: boolean;
  enableTextModeration: boolean;
  strictMode: boolean;
  customRules: CustomModerationRule[];
  whitelistUsers: string[];
  blacklistUsers: string[];
}

export interface CustomModerationRule {
  id: string;
  name: string;
  pattern: string;
  action: 'block' | 'flag' | 'warn';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

export class ContentModerationService {
  private static instance: ContentModerationService;
  private settings: ModerationSettings = {
    enableAutoModeration: true,
    enableImageModeration: true,
    enableTextModeration: true,
    strictMode: false,
    customRules: [],
    whitelistUsers: [],
    blacklistUsers: [],
  };

  // Predefined moderation categories
  private readonly moderationCategories = [
    {
      name: 'spam',
      keywords: ['spam', 'scam', 'fake', 'click here', 'free money', 'win now'],
      severity: 'medium' as const,
      description: 'Spam or promotional content',
    },
    {
      name: 'harassment',
      keywords: ['hate', 'abuse', 'threat', 'bully', 'harass'],
      severity: 'high' as const,
      description: 'Harassment or bullying content',
    },
    {
      name: 'inappropriate',
      keywords: ['explicit', 'adult', 'nsfw', 'inappropriate'],
      severity: 'high' as const,
      description: 'Inappropriate or adult content',
    },
    {
      name: 'violence',
      keywords: ['violence', 'harm', 'kill', 'hurt', 'attack'],
      severity: 'critical' as const,
      description: 'Violent or harmful content',
    },
    {
      name: 'discrimination',
      keywords: ['racist', 'sexist', 'discriminat', 'prejudice'],
      severity: 'high' as const,
      description: 'Discriminatory content',
    },
    {
      name: 'misinformation',
      keywords: ['fake news', 'misinformation', 'conspiracy', 'false claim'],
      severity: 'medium' as const,
      description: 'Misinformation or false claims',
    },
    {
      name: 'personal_info',
      keywords: ['phone number', 'email', 'address', 'ssn', 'aadhar'],
      severity: 'medium' as const,
      description: 'Personal information sharing',
    },
  ];

  static getInstance(): ContentModerationService {
    if (!ContentModerationService.instance) {
      ContentModerationService.instance = new ContentModerationService();
    }
    return ContentModerationService.instance;
  }

  /**
   * Moderate content using AI and rule-based filtering
   */
  async moderateContent(content: ContentToModerate): Promise<ModerationResult> {
    try {
      // Check if user is whitelisted
      if (this.settings.whitelistUsers.includes(content.userId)) {
        return {
          isApproved: true,
          confidence: 1.0,
          categories: [],
          suggestions: [],
          reasons: ['User is whitelisted'],
          severity: 'low',
        };
      }

      // Check if user is blacklisted
      if (this.settings.blacklistUsers.includes(content.userId)) {
        return {
          isApproved: false,
          confidence: 1.0,
          categories: [{
            name: 'blacklisted_user',
            confidence: 1.0,
            severity: 'critical',
            description: 'User is blacklisted',
          }],
          suggestions: ['Contact support if this is an error'],
          reasons: ['User is blacklisted'],
          severity: 'critical',
        };
      }

      const results: ModerationResult[] = [];

      // Moderate text content
      if (content.text && this.settings.enableTextModeration) {
        const textResult = await this.moderateText(content.text);
        results.push(textResult);
      }

      // Moderate images
      if (content.images && this.settings.enableImageModeration) {
        const imageResults = await Promise.all(
          content.images.map(image => this.moderateImage(image))
        );
        results.push(...imageResults);
      }

      // Apply custom rules
      if (content.text) {
        const customResult = this.applyCustomRules(content.text);
        if (customResult) {
          results.push(customResult);
        }
      }

      // Combine results
      return this.combineModerationResults(results);
    } catch (error) {
      console.error('Content moderation failed:', error);
      
      // Return safe default in case of error
      return {
        isApproved: false,
        confidence: 0.5,
        categories: [{
          name: 'moderation_error',
          confidence: 0.5,
          severity: 'medium',
          description: 'Moderation system error',
        }],
        suggestions: ['Content could not be moderated automatically'],
        reasons: ['Moderation system error'],
        severity: 'medium',
      };
    }
  }

  /**
   * Moderate text content
   */
  private async moderateText(text: string): Promise<ModerationResult> {
    const categories: ModerationCategory[] = [];
    const reasons: string[] = [];
    let maxSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    const lowerText = text.toLowerCase();

    // Check against predefined categories
    for (const category of this.moderationCategories) {
      const matches = category.keywords.filter(keyword => 
        lowerText.includes(keyword.toLowerCase())
      );

      if (matches.length > 0) {
        const confidence = Math.min(matches.length / category.keywords.length, 1.0);
        
        categories.push({
          name: category.name,
          confidence,
          severity: category.severity,
          description: category.description,
        });

        reasons.push(`Detected ${category.name}: ${matches.join(', ')}`);
        
        if (this.getSeverityLevel(category.severity) > this.getSeverityLevel(maxSeverity)) {
          maxSeverity = category.severity;
        }
      }
    }

    // AI-based sentiment analysis (mock implementation)
    const sentimentResult = await this.analyzeSentiment(text);
    if (sentimentResult.severity !== 'low') {
      categories.push({
        name: 'negative_sentiment',
        confidence: sentimentResult.confidence,
        severity: sentimentResult.severity,
        description: 'Negative sentiment detected',
      });
      reasons.push('Negative sentiment detected');
    }

    // Determine if content should be approved
    const isApproved = this.shouldApproveContent(categories, maxSeverity);
    const overallConfidence = categories.length > 0 
      ? categories.reduce((sum, cat) => sum + cat.confidence, 0) / categories.length
      : 0.8;

    return {
      isApproved,
      confidence: overallConfidence,
      categories,
      suggestions: this.generateSuggestions(categories),
      reasons,
      severity: maxSeverity,
    };
  }

  /**
   * Moderate image content (mock implementation)
   */
  private async moderateImage(imageUrl: string): Promise<ModerationResult> {
    // In a real implementation, this would use image analysis APIs
    // For now, we'll return a safe default
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      isApproved: true,
      confidence: 0.9,
      categories: [],
      suggestions: [],
      reasons: ['Image moderation not fully implemented'],
      severity: 'low',
    };
  }

  /**
   * Apply custom moderation rules
   */
  private applyCustomRules(text: string): ModerationResult | null {
    const lowerText = text.toLowerCase();
    
    for (const rule of this.settings.customRules) {
      if (!rule.enabled) continue;

      const regex = new RegExp(rule.pattern, 'gi');
      if (regex.test(text)) {
        return {
          isApproved: rule.action !== 'block',
          confidence: 0.9,
          categories: [{
            name: `custom_rule_${rule.id}`,
            confidence: 0.9,
            severity: rule.severity,
            description: rule.name,
          }],
          suggestions: [`Custom rule triggered: ${rule.name}`],
          reasons: [`Matched custom rule: ${rule.name}`],
          severity: rule.severity,
        };
      }
    }

    return null;
  }

  /**
   * Analyze sentiment of text (mock implementation)
   */
  private async analyzeSentiment(text: string): Promise<{
    confidence: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> {
    // Mock sentiment analysis
    await new Promise(resolve => setTimeout(resolve, 200));

    const negativeWords = ['hate', 'angry', 'frustrated', 'disappointed', 'terrible', 'awful'];
    const lowerText = text.toLowerCase();
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

    if (negativeCount >= 3) {
      return { confidence: 0.8, severity: 'high' };
    } else if (negativeCount >= 1) {
      return { confidence: 0.6, severity: 'medium' };
    }

    return { confidence: 0.9, severity: 'low' };
  }

  /**
   * Combine multiple moderation results
   */
  private combineModerationResults(results: ModerationResult[]): ModerationResult {
    if (results.length === 0) {
      return {
        isApproved: true,
        confidence: 1.0,
        categories: [],
        suggestions: [],
        reasons: ['No moderation issues found'],
        severity: 'low',
      };
    }

    const allCategories = results.flatMap(r => r.categories);
    const allReasons = results.flatMap(r => r.reasons);
    const allSuggestions = results.flatMap(r => r.suggestions);
    
    const maxSeverity = results.reduce((max, result) => 
      this.getSeverityLevel(result.severity) > this.getSeverityLevel(max) 
        ? result.severity 
        : max, 'low' as const
    );

    const isApproved = results.every(r => r.isApproved);
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;

    return {
      isApproved,
      confidence: avgConfidence,
      categories: allCategories,
      suggestions: [...new Set(allSuggestions)],
      reasons: [...new Set(allReasons)],
      severity: maxSeverity,
    };
  }

  /**
   * Determine if content should be approved
   */
  private shouldApproveContent(
    categories: ModerationCategory[], 
    maxSeverity: 'low' | 'medium' | 'high' | 'critical'
  ): boolean {
    if (this.settings.strictMode) {
      return categories.length === 0;
    }

    // Block critical and high severity content
    if (maxSeverity === 'critical' || maxSeverity === 'high') {
      return false;
    }

    // Allow medium and low severity content
    return true;
  }

  /**
   * Generate suggestions based on moderation categories
   */
  private generateSuggestions(categories: ModerationCategory[]): string[] {
    const suggestions: string[] = [];

    for (const category of categories) {
      switch (category.name) {
        case 'spam':
          suggestions.push('Avoid promotional or spam content');
          break;
        case 'harassment':
          suggestions.push('Please be respectful and avoid harassment');
          break;
        case 'inappropriate':
          suggestions.push('Keep content appropriate for all audiences');
          break;
        case 'violence':
          suggestions.push('Avoid violent or harmful content');
          break;
        case 'discrimination':
          suggestions.push('Be inclusive and avoid discriminatory language');
          break;
        case 'misinformation':
          suggestions.push('Verify information before sharing');
          break;
        case 'personal_info':
          suggestions.push('Avoid sharing personal information');
          break;
      }
    }

    return [...new Set(suggestions)];
  }

  /**
   * Get severity level as number for comparison
   */
  private getSeverityLevel(severity: 'low' | 'medium' | 'high' | 'critical'): number {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 };
    return levels[severity];
  }

  /**
   * Update moderation settings
   */
  updateSettings(settings: Partial<ModerationSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Get current moderation settings
   */
  getSettings(): ModerationSettings {
    return { ...this.settings };
  }

  /**
   * Add custom moderation rule
   */
  addCustomRule(rule: CustomModerationRule): void {
    this.settings.customRules.push(rule);
  }

  /**
   * Remove custom moderation rule
   */
  removeCustomRule(ruleId: string): void {
    this.settings.customRules = this.settings.customRules.filter(r => r.id !== ruleId);
  }

  /**
   * Add user to whitelist
   */
  addToWhitelist(userId: string): void {
    if (!this.settings.whitelistUsers.includes(userId)) {
      this.settings.whitelistUsers.push(userId);
    }
  }

  /**
   * Remove user from whitelist
   */
  removeFromWhitelist(userId: string): void {
    this.settings.whitelistUsers = this.settings.whitelistUsers.filter(id => id !== userId);
  }

  /**
   * Add user to blacklist
   */
  addToBlacklist(userId: string): void {
    if (!this.settings.blacklistUsers.includes(userId)) {
      this.settings.blacklistUsers.push(userId);
    }
  }

  /**
   * Remove user from blacklist
   */
  removeFromBlacklist(userId: string): void {
    this.settings.blacklistUsers = this.settings.blacklistUsers.filter(id => id !== userId);
  }

  /**
   * Get moderation statistics
   */
  getModerationStats(): {
    totalRules: number;
    customRules: number;
    whitelistedUsers: number;
    blacklistedUsers: number;
  } {
    return {
      totalRules: this.moderationCategories.length + this.settings.customRules.length,
      customRules: this.settings.customRules.length,
      whitelistedUsers: this.settings.whitelistUsers.length,
      blacklistedUsers: this.settings.blacklistUsers.length,
    };
  }
}

export const contentModerationService = ContentModerationService.getInstance();
