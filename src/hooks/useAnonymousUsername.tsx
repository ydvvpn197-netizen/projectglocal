import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AnonymousUser {
  id: string;
  generated_username: string;
  created_at: string;
  privacy_level: 'anonymous' | 'pseudonymous' | 'public';
  location_sharing: 'none' | 'city' | 'precise';
}

interface UserBehavior {
  postFrequency: number;
  commentFrequency: number;
  locationSharing: boolean;
  realNameUsage: boolean;
}

interface PrivacyRecommendation {
  type: 'enable_anonymous' | 'disable_location' | 'hide_contact' | 'use_pseudonym' | 'increase_privacy';
  priority: 'high' | 'medium' | 'low';
  description: string;
  action: string;
}

export const useAnonymousUsername = () => {
  const { toast } = useToast();
  const [anonymousUser, setAnonymousUser] = useState<AnonymousUser | null>(null);
  const [loading, setLoading] = useState(false);

  // Generate a unique anonymous username
  const generateUsername = useCallback((): string => {
    const prefix = 'User_';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix;
    
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }, []);

  // Create anonymous user
  const createAnonymousUser = useCallback(async () => {
    try {
      setLoading(true);
      
      // Simulate API call - replace with actual service call
      const newUser: AnonymousUser = {
        id: crypto.randomUUID(),
        generated_username: generateUsername(),
        created_at: new Date().toISOString(),
        privacy_level: 'anonymous',
        location_sharing: 'none'
      };

      // In a real implementation, this would call the anonymousProfileService
      // await anonymousProfileService.createAnonymousProfile({...});
      
      setAnonymousUser(newUser);
      
      toast({
        title: "Success",
        description: `Anonymous username generated: ${newUser.generated_username}`,
      });
      
    } catch (error) {
      console.error('Error creating anonymous user:', error);
      toast({
        title: "Error",
        description: "Failed to create anonymous username",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [generateUsername, toast]);

  // Regenerate username
  const regenerateUsername = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!anonymousUser) {
        await createAnonymousUser();
        return;
      }

      const newUsername = generateUsername();
      
      // In a real implementation, this would update the existing anonymous profile
      // await anonymousProfileService.updateAnonymousProfile(userId, { display_name: newUsername });
      
      setAnonymousUser(prev => prev ? {
        ...prev,
        generated_username: newUsername
      } : null);
      
      toast({
        title: "Success",
        description: `New anonymous username: ${newUsername}`,
      });
      
    } catch (error) {
      console.error('Error regenerating username:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate username",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [anonymousUser, generateUsername, createAnonymousUser, toast]);

  // Get privacy recommendations based on user behavior
  const getPrivacyRecommendations = useCallback((behavior: UserBehavior): PrivacyRecommendation[] => {
    const recommendations: PrivacyRecommendation[] = [];

    // High frequency posting with real name
    if (behavior.postFrequency > 10 && behavior.realNameUsage) {
      recommendations.push({
        type: 'use_pseudonym',
        priority: 'high',
        description: 'You post frequently with your real name, which may impact privacy',
        action: 'Consider using anonymous usernames for sensitive topics'
      });
    }

    // Location sharing enabled
    if (behavior.locationSharing) {
      recommendations.push({
        type: 'disable_location',
        priority: 'medium',
        description: 'Location sharing can reveal your physical location',
        action: 'Consider disabling location sharing for better privacy'
      });
    }

    // High comment frequency
    if (behavior.commentFrequency > 20) {
      recommendations.push({
        type: 'enable_anonymous',
        priority: 'medium',
        description: 'High comment activity increases your digital footprint',
        action: 'Enable anonymous mode for more privacy'
      });
    }

    // General privacy improvement
    if (behavior.realNameUsage && behavior.postFrequency > 5) {
      recommendations.push({
        type: 'increase_privacy',
        priority: 'low',
        description: 'Consider increasing your privacy settings',
        action: 'Review and adjust your privacy preferences'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, []);

  // Get privacy score based on settings
  const getPrivacyScore = useCallback((settings: Record<string, unknown>): number => {
    let score = 0;
    
    // Profile privacy
    if (settings.privacy_profile === true) score += 2;
    else if (settings.privacy_profile === false) score += 1;
    
    // Location sharing
    if (settings.show_location === false) score += 2;
    else if (settings.show_location === true) score += 1;
    
    // Contact info
    if (settings.show_contact_info === false) score += 2;
    else if (settings.show_contact_info === true) score += 1;
    
    // Anonymous mode
    if (settings.anonymous_mode === true) score += 3;
    
    // Location precision
    if (settings.precise_location === false) score += 1;
    
    return Math.min(score, 10);
  }, []);

  // Get privacy level based on score
  const getPrivacyLevel = useCallback((score: number) => {
    if (score >= 8) return 'Maximum';
    if (score >= 6) return 'High';
    if (score >= 4) return 'Medium';
    return 'Low';
  }, []);

  // Validate anonymous username
  const validateUsername = useCallback((username: string): boolean => {
    // Check if username follows the pattern
    const pattern = /^User_[A-Z0-9]{6}$/;
    return pattern.test(username);
  }, []);

  // Check if user has anonymous profile
  const hasAnonymousProfile = useCallback((): boolean => {
    return anonymousUser !== null;
  }, [anonymousUser]);

  // Get current anonymous username
  const getCurrentUsername = useCallback((): string | null => {
    return anonymousUser?.generated_username || null;
  }, [anonymousUser]);

  // Clear anonymous user (for logout)
  const clearAnonymousUser = useCallback(() => {
    setAnonymousUser(null);
  }, []);

  return {
    anonymousUser,
    loading,
    createAnonymousUser,
    regenerateUsername,
    getPrivacyRecommendations,
    getPrivacyScore,
    getPrivacyLevel,
    validateUsername,
    hasAnonymousProfile,
    getCurrentUsername,
    clearAnonymousUser
  };
};
