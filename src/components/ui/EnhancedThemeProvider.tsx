import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';

interface EnhancedThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  isSystem: boolean;
  accentColor: string;
  setAccentColor: (color: string) => void;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  reducedMotion: boolean;
  setReducedMotion: (reduced: boolean) => void;
  highContrast: boolean;
  setHighContrast: (high: boolean) => void;
}

const EnhancedThemeContext = createContext<EnhancedThemeContextType | undefined>(undefined);

const accentColors = {
  blue: 'hsl(221.2 83.2% 53.3%)',
  green: 'hsl(142.1 76.2% 36.3%)',
  purple: 'hsl(262.1 83.3% 57.8%)',
  orange: 'hsl(24.6 95% 53.1%)',
  pink: 'hsl(346.8 77.2% 49.8%)',
  red: 'hsl(0 84.2% 60.2%)',
  yellow: 'hsl(48 96% 53%)',
  teal: 'hsl(173 58% 39%)',
};

export const EnhancedThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState('system');
  const [accentColor, setAccentColor] = useState(accentColors.blue);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    // Load user preferences from localStorage
    const savedAccentColor = localStorage.getItem('glocal-accent-color');
    const savedFontSize = localStorage.getItem('glocal-font-size');
    const savedReducedMotion = localStorage.getItem('glocal-reduced-motion');
    const savedHighContrast = localStorage.getItem('glocal-high-contrast');

    if (savedAccentColor) setAccentColor(savedAccentColor);
    if (savedFontSize) setFontSize(savedFontSize as 'small' | 'medium' | 'large');
    if (savedReducedMotion) setReducedMotion(savedReducedMotion === 'true');
    if (savedHighContrast) setHighContrast(savedHighContrast === 'true');

    // Check system preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMotionChange);
    return () => mediaQuery.removeEventListener('change', handleMotionChange);
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.style.setProperty('--accent-color', accentColor);
    document.documentElement.style.setProperty('--font-size', fontSize === 'small' ? '0.875rem' : fontSize === 'large' ? '1.125rem' : '1rem');
    document.documentElement.style.setProperty('--reduced-motion', reducedMotion ? 'reduce' : 'no-preference');
    document.documentElement.style.setProperty('--high-contrast', highContrast ? 'high' : 'normal');

    // Save to localStorage
    localStorage.setItem('glocal-accent-color', accentColor);
    localStorage.setItem('glocal-font-size', fontSize);
    localStorage.setItem('glocal-reduced-motion', reducedMotion.toString());
    localStorage.setItem('glocal-high-contrast', highContrast.toString());
  }, [accentColor, fontSize, reducedMotion, highContrast]);

  const isSystem = theme === 'system';

  return (
    <EnhancedThemeContext.Provider
      value={{
        theme,
        setTheme,
        isSystem,
        accentColor,
        setAccentColor,
        fontSize,
        setFontSize,
        reducedMotion,
        setReducedMotion,
        highContrast,
        setHighContrast,
      }}
    >
      <NextThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={reducedMotion}
      >
        {children}
      </NextThemeProvider>
    </EnhancedThemeContext.Provider>
  );
};

export const useEnhancedTheme = () => {
  const context = useContext(EnhancedThemeContext);
  if (context === undefined) {
    throw new Error('useEnhancedTheme must be used within an EnhancedThemeProvider');
  }
  return context;
};

export { accentColors };
