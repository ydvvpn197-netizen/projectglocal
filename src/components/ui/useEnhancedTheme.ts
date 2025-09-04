import { useContext } from 'react';
import { EnhancedThemeContext } from './EnhancedThemeProvider';

export const useEnhancedTheme = () => {
  const context = useContext(EnhancedThemeContext);
  if (context === undefined) {
    throw new Error('useEnhancedTheme must be used within an EnhancedThemeProvider');
  }
  return context;
};
