import React, { useEffect, useState } from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { EnhancedThemeContext } from './EnhancedThemeContext';
import { accentColors } from './themeConstants';

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




