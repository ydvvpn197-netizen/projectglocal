import { useState, useEffect } from 'react';
import { getReferralConfig, updateReferralConfig, validateReferralConfig, type ReferralConfig } from '@/config/referralConfig';

export const useReferralConfig = () => {
  const [config, setConfig] = useState<ReferralConfig>(getReferralConfig());
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const currentConfig = getReferralConfig();
        
        // Validate configuration
        const validationErrors = validateReferralConfig(currentConfig);
        setErrors(validationErrors);
        
        if (validationErrors.length === 0) {
          setConfig(currentConfig);
        } else {
          console.warn('Referral configuration validation errors:', validationErrors);
        }
      } catch (error) {
        console.error('Failed to load referral config:', error);
        setErrors(['Failed to load configuration']);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const updateConfig = (newConfig: Partial<ReferralConfig>) => {
    try {
      const updatedConfig = updateReferralConfig(newConfig);
      const validationErrors = validateReferralConfig(updatedConfig);
      
      setErrors(validationErrors);
      
      if (validationErrors.length === 0) {
        setConfig(updatedConfig);
      } else {
        console.warn('Configuration validation errors:', validationErrors);
      }
    } catch (error) {
      console.error('Failed to update config:', error);
      setErrors(['Failed to update configuration']);
    }
  };

  const resetConfig = () => {
    const defaultConfig = getReferralConfig();
    setConfig(defaultConfig);
    setErrors([]);
  };

  return {
    config,
    loading,
    errors,
    updateConfig,
    resetConfig,
    isConfigLoaded: !loading,
    isValid: errors.length === 0
  };
};
