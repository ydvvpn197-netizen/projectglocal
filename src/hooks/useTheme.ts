import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Get system theme preference
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }, []);

  // Apply theme to document
  const applyTheme = useCallback((newTheme: 'light' | 'dark') => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);
      root.setAttribute('data-theme', newTheme);
    }
  }, []);

  // Update resolved theme based on current theme setting
  const updateResolvedTheme = useCallback(() => {
    const newResolvedTheme = theme === 'system' ? getSystemTheme() : theme;
    setResolvedTheme(newResolvedTheme);
    applyTheme(newResolvedTheme);
  }, [theme, getSystemTheme, applyTheme]);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  // Update resolved theme when theme changes
  useEffect(() => {
    updateResolvedTheme();
  }, [updateResolvedTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme === 'system' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        updateResolvedTheme();
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, updateResolvedTheme]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }, [resolvedTheme]);

  // Set specific theme
  const setThemeValue = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }, []);

  return {
    theme,
    resolvedTheme,
    toggleTheme,
    setTheme: setThemeValue,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: theme === 'system'
  };
};
