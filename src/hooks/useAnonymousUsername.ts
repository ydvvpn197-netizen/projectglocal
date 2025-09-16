import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AnonymousUser {
  id: string;
  user_id: string;
  generated_username: string;
  privacy_level: 'low' | 'medium' | 'high' | 'maximum';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateAnonymousUserParams {
  privacyLevel: 'low' | 'medium' | 'high' | 'maximum';
  includeNumbers: boolean;
  includeSpecialChars: boolean;
  length: number;
}

export const useAnonymousUsername = () => {
  const { user } = useAuth();
  const [anonymousUser, setAnonymousUser] = useState<AnonymousUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's anonymous username
  useEffect(() => {
    if (user) {
      loadAnonymousUser();
    }
  }, [user]);

  const loadAnonymousUser = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('anonymous_usernames')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setAnonymousUser(data);
    } catch (err) {
      console.error('Error loading anonymous user:', err);
      setError('Failed to load anonymous username');
    } finally {
      setIsLoading(false);
    }
  };

  const generateUsername = (params: CreateAnonymousUserParams): string => {
    const { privacyLevel, includeNumbers, includeSpecialChars, length } = params;
    
    const adjectives = [
      'Swift', 'Bold', 'Bright', 'Calm', 'Cool', 'Dark', 'Fast', 'Free', 'Good', 'Great',
      'Happy', 'Kind', 'Light', 'New', 'Old', 'Pure', 'Real', 'Rich', 'Safe', 'Smart',
      'Strong', 'True', 'Wise', 'Young', 'Wild', 'Brave', 'Clear', 'Deep', 'Fair', 'Fine'
    ];
    
    const nouns = [
      'Tiger', 'Eagle', 'Wolf', 'Bear', 'Lion', 'Fox', 'Hawk', 'Falcon', 'Raven', 'Owl',
      'Storm', 'Wind', 'Fire', 'Water', 'Earth', 'Sky', 'Star', 'Moon', 'Sun', 'Cloud',
      'River', 'Mountain', 'Forest', 'Ocean', 'Desert', 'Valley', 'Peak', 'Creek', 'Lake', 'Bay'
    ];
    
    const numbers = includeNumbers ? ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] : [];
    const specialChars = includeSpecialChars ? ['_', '-', '.'] : [];
    
    let username = '';
    
    switch (privacyLevel) {
      case 'low':
        // More memorable, easier to trace
        username = adjectives[Math.floor(Math.random() * adjectives.length)] + 
                  nouns[Math.floor(Math.random() * nouns.length)];
        if (includeNumbers) {
          username += Math.floor(Math.random() * 100);
        }
        break;
        
      case 'medium':
        // Balanced approach
        username = adjectives[Math.floor(Math.random() * adjectives.length)] + 
                  nouns[Math.floor(Math.random() * nouns.length)] +
                  (includeNumbers ? Math.floor(Math.random() * 1000) : '');
        break;
        
      case 'high':
        // More random
        username = adjectives[Math.floor(Math.random() * adjectives.length)] + 
                  nouns[Math.floor(Math.random() * nouns.length)] +
                  (includeNumbers ? Math.floor(Math.random() * 10000) : '') +
                  (includeSpecialChars ? specialChars[Math.floor(Math.random() * specialChars.length)] : '');
        break;
        
      case 'maximum':
        // Completely random
        const chars = 'abcdefghijklmnopqrstuvwxyz' + 
                     (includeNumbers ? '0123456789' : '') + 
                     (includeSpecialChars ? '_-.' : '');
        for (let i = 0; i < length; i++) {
          username += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        break;
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
  };

  const createAnonymousUser = async (params: CreateAnonymousUserParams) => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Generate username
      const generatedUsername = generateUsername(params);

      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('anonymous_usernames')
        .select('id')
        .eq('generated_username', generatedUsername)
        .single();

      if (existingUser) {
        // If username exists, try again with slight variation
        const newParams = { ...params, length: params.length + 1 };
        return createAnonymousUser(newParams);
      }

      // Create new anonymous username
      const { data, error } = await supabase
        .from('anonymous_usernames')
        .insert({
          user_id: user.id,
          generated_username: generatedUsername,
          privacy_level: params.privacyLevel,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setAnonymousUser(data);
      return data;
    } catch (err) {
      console.error('Error creating anonymous user:', err);
      setError('Failed to create anonymous username');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateUsername = async (params: CreateAnonymousUserParams) => {
    if (!user || !anonymousUser) {
      throw new Error('No anonymous user to regenerate');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Generate new username
      const generatedUsername = generateUsername(params);

      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('anonymous_usernames')
        .select('id')
        .eq('generated_username', generatedUsername)
        .neq('id', anonymousUser.id)
        .single();

      if (existingUser) {
        // If username exists, try again with slight variation
        const newParams = { ...params, length: params.length + 1 };
        return regenerateUsername(newParams);
      }

      // Update existing anonymous username
      const { data, error } = await supabase
        .from('anonymous_usernames')
        .update({
          generated_username: generatedUsername,
          privacy_level: params.privacyLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', anonymousUser.id)
        .select()
        .single();

      if (error) throw error;

      setAnonymousUser(data);
      return data;
    } catch (err) {
      console.error('Error regenerating username:', err);
      setError('Failed to regenerate username');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getPrivacyRecommendations = () => {
    // This would typically analyze user behavior and provide recommendations
    return {
      highPostingFrequency: true,
      locationSharingEnabled: true,
      realNameUsage: false
    };
  };

  const clearError = () => {
    setError(null);
  };

  return {
    anonymousUser,
    isLoading,
    error,
    createAnonymousUser,
    regenerateUsername,
    getPrivacyRecommendations,
    clearError
  };
};