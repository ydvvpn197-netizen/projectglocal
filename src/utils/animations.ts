/**
 * Lightweight animation utilities
 * Reduces framer-motion bundle size by providing essential animations only
 */

// Simple animation presets that can replace framer-motion in many cases
export const animations = {
  fadeIn: {
    opacity: [0, 1],
    transition: { duration: 0.3 }
  },
  fadeOut: {
    opacity: [1, 0],
    transition: { duration: 0.3 }
  },
  slideUp: {
    opacity: [0, 1],
    transform: ['translateY(20px)', 'translateY(0)'],
    transition: { duration: 0.3 }
  },
  slideDown: {
    opacity: [0, 1],
    transform: ['translateY(-20px)', 'translateY(0)'],
    transition: { duration: 0.3 }
  },
  scale: {
    opacity: [0, 1],
    transform: ['scale(0.95)', 'scale(1)'],
    transition: { duration: 0.2 }
  }
};

// CSS-based animations for simple cases
export const cssAnimations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  scale: 'animate-scale'
};

// Hook for simple animations without framer-motion
export const useSimpleAnimation = (delay = 0) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return isVisible;
};

// Lightweight transition wrapper
export const SimpleTransition: React.FC<{
  children: React.ReactNode;
  type?: keyof typeof animations;
  delay?: number;
}> = ({ children, type = 'fadeIn', delay = 0 }) => {
  const isVisible = useSimpleAnimation(delay);
  
  if (!isVisible) return null;
  
  const className = `transition-all duration-300 ${
    type === 'fadeIn' ? 'opacity-0 animate-fade-in' :
    type === 'slideUp' ? 'opacity-0 translate-y-5 animate-slide-up' :
    type === 'slideDown' ? 'opacity-0 -translate-y-5 animate-slide-down' :
    'opacity-0 scale-95 animate-scale'
  }`;
  
  return React.createElement('div', {
    className,
    style: { animationDelay: `${delay}ms` }
  }, children);
};

import React from 'react';
