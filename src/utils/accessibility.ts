/**
 * Comprehensive accessibility utilities for WCAG 2.1 AA compliance
 */

export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  'aria-busy'?: boolean;
  'aria-controls'?: string;
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  'aria-disabled'?: boolean;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
  'aria-pressed'?: boolean;
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-level'?: number;
  'aria-setsize'?: number;
  'aria-posinset'?: number;
  'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other';
  'aria-valuemin'?: number;
  'aria-valuemax'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  role?: string;
  tabIndex?: number;
}

/**
 * Generate ARIA attributes for common UI patterns
 */
export function getAriaAttributes(type: string, options: Record<string, string | number | boolean> = {}): AccessibilityProps {
  const baseProps: AccessibilityProps = {};

  switch (type) {
    case 'button':
      return {
        role: 'button',
        tabIndex: 0,
        'aria-label': options.label,
        'aria-describedby': options.description,
        'aria-disabled': options.disabled,
        'aria-pressed': options.pressed,
        'aria-expanded': options.expanded,
        'aria-haspopup': options.hasPopup,
      };

    case 'link':
      return {
        role: 'link',
        tabIndex: 0,
        'aria-label': options.label,
        'aria-describedby': options.description,
        'aria-current': options.current,
      };

    case 'input':
      return {
        'aria-label': options.label,
        'aria-labelledby': options.labelledBy,
        'aria-describedby': options.description,
        'aria-required': options.required,
        'aria-invalid': options.invalid,
        'aria-disabled': options.disabled,
        'aria-valuemin': options.min,
        'aria-valuemax': options.max,
        'aria-valuenow': options.value,
        'aria-valuetext': options.valueText,
      };

    case 'checkbox':
      return {
        role: 'checkbox',
        tabIndex: 0,
        'aria-label': options.label,
        'aria-describedby': options.description,
        'aria-checked': options.checked,
        'aria-disabled': options.disabled,
        'aria-required': options.required,
      };

    case 'radio':
      return {
        role: 'radio',
        tabIndex: 0,
        'aria-label': options.label,
        'aria-describedby': options.description,
        'aria-checked': options.checked,
        'aria-disabled': options.disabled,
        'aria-required': options.required,
      };

    case 'list':
      return {
        role: 'list',
        'aria-label': options.label,
        'aria-describedby': options.description,
        'aria-expanded': options.expanded,
      };

    case 'listitem':
      return {
        role: 'listitem',
        'aria-selected': options.selected,
        'aria-current': options.current,
        'aria-level': options.level,
        'aria-setsize': options.setSize,
        'aria-posinset': options.posInSet,
      };

    case 'menu':
      return {
        role: 'menu',
        'aria-label': options.label,
        'aria-expanded': options.expanded,
        'aria-orientation': options.orientation || 'vertical',
      };

    case 'menuitem':
      return {
        role: 'menuitem',
        tabIndex: -1,
        'aria-label': options.label,
        'aria-describedby': options.description,
        'aria-disabled': options.disabled,
        'aria-checked': options.checked,
      };

    case 'dialog':
      return {
        role: 'dialog',
        'aria-labelledby': options.labelledBy,
        'aria-describedby': options.description,
        'aria-modal': options.modal !== false,
      };

    case 'alert':
      return {
        role: 'alert',
        'aria-live': options.live || 'assertive',
        'aria-atomic': options.atomic !== false,
      };

    case 'status':
      return {
        role: 'status',
        'aria-live': options.live || 'polite',
        'aria-atomic': options.atomic !== false,
      };

    case 'progressbar':
      return {
        role: 'progressbar',
        'aria-valuemin': options.min || 0,
        'aria-valuemax': options.max || 100,
        'aria-valuenow': options.value,
        'aria-valuetext': options.valueText,
        'aria-label': options.label,
      };

    case 'tablist':
      return {
        role: 'tablist',
        'aria-label': options.label,
        'aria-orientation': options.orientation || 'horizontal',
      };

    case 'tab':
      return {
        role: 'tab',
        tabIndex: options.selected ? 0 : -1,
        'aria-selected': options.selected,
        'aria-controls': options.controls,
        'aria-disabled': options.disabled,
      };

    case 'tabpanel':
      return {
        role: 'tabpanel',
        'aria-labelledby': options.labelledBy,
        tabIndex: 0,
      };

    case 'table':
      return {
        role: 'table',
        'aria-label': options.label,
        'aria-describedby': options.description,
      };

    case 'row':
      return {
        role: 'row',
        'aria-selected': options.selected,
        'aria-level': options.level,
      };

    case 'cell':
      return {
        role: options.header ? 'columnheader' : 'cell',
        'aria-selected': options.selected,
        'aria-sort': options.sort,
        'aria-colspan': options.colSpan,
        'aria-rowspan': options.rowSpan,
      };

    default:
      return baseProps;
  }
}

/**
 * Generate keyboard navigation handlers
 */
export function getKeyboardHandlers(handlers: Record<string, () => void>) {
  return {
    onKeyDown: (event: React.KeyboardEvent) => {
      const { key, ctrlKey, metaKey, shiftKey } = event;
      
      // Handle common keyboard shortcuts
      if (ctrlKey || metaKey) {
        switch (key) {
          case 's':
            event.preventDefault();
            handlers.onSave?.();
            break;
          case 'z':
            event.preventDefault();
            handlers.onUndo?.();
            break;
          case 'y':
            event.preventDefault();
            handlers.onRedo?.();
            break;
          case 'f':
            event.preventDefault();
            handlers.onFind?.();
            break;
          case 'r':
            event.preventDefault();
            handlers.onRefresh?.();
            break;
        }
      }

      // Handle arrow keys for navigation
      switch (key) {
        case 'ArrowUp':
          event.preventDefault();
          handlers.onArrowUp?.();
          break;
        case 'ArrowDown':
          event.preventDefault();
          handlers.onArrowDown?.();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handlers.onArrowLeft?.();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handlers.onArrowRight?.();
          break;
        case 'Home':
          event.preventDefault();
          handlers.onHome?.();
          break;
        case 'End':
          event.preventDefault();
          handlers.onEnd?.();
          break;
        case 'PageUp':
          event.preventDefault();
          handlers.onPageUp?.();
          break;
        case 'PageDown':
          event.preventDefault();
          handlers.onPageDown?.();
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          handlers.onActivate?.();
          break;
        case 'Escape':
          event.preventDefault();
          handlers.onEscape?.();
          break;
        case 'Tab':
          handlers.onTab?.(shiftKey);
          break;
      }
    },
  };
}

/**
 * Generate focus management utilities
 */
export function createFocusManager() {
  let focusableElements: HTMLElement[] = [];
  let currentIndex = 0;

  const updateFocusableElements = (container: HTMLElement) => {
    focusableElements = Array.from(
      container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];
  };

  const focusNext = () => {
    if (focusableElements.length === 0) return;
    currentIndex = (currentIndex + 1) % focusableElements.length;
    focusableElements[currentIndex]?.focus();
  };

  const focusPrevious = () => {
    if (focusableElements.length === 0) return;
    currentIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
    focusableElements[currentIndex]?.focus();
  };

  const focusFirst = () => {
    if (focusableElements.length === 0) return;
    currentIndex = 0;
    focusableElements[0]?.focus();
  };

  const focusLast = () => {
    if (focusableElements.length === 0) return;
    currentIndex = focusableElements.length - 1;
    focusableElements[currentIndex]?.focus();
  };

  return {
    updateFocusableElements,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    getCurrentIndex: () => currentIndex,
    getFocusableElements: () => focusableElements,
  };
}

/**
 * Generate screen reader announcements
 */
export function createScreenReaderAnnouncer() {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.style.position = 'absolute';
  announcer.style.left = '-10000px';
  announcer.style.width = '1px';
  announcer.style.height = '1px';
  announcer.style.overflow = 'hidden';
  document.body.appendChild(announcer);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announcer.setAttribute('aria-live', priority);
    announcer.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  };

  const announceError = (message: string) => {
    announce(message, 'assertive');
  };

  const announceSuccess = (message: string) => {
    announce(message, 'polite');
  };

  const announceStatus = (message: string) => {
    announce(message, 'polite');
  };

  return {
    announce,
    announceError,
    announceSuccess,
    announceStatus,
    destroy: () => {
      document.body.removeChild(announcer);
    },
  };
}

/**
 * Generate color contrast utilities
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;
    
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function isAccessibleContrast(foreground: string, background: string): boolean {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= 4.5; // WCAG AA standard
}

/**
 * Generate accessible color schemes
 */
export function generateAccessibleColors(baseColor: string) {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return null;

  const { r, g, b } = rgb;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  
  return {
    foreground: luminance > 128 ? '#000000' : '#ffffff',
    background: baseColor,
    hover: adjustBrightness(baseColor, -20),
    active: adjustBrightness(baseColor, -40),
    disabled: adjustBrightness(baseColor, 40),
  };
}

export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const { r, g, b } = rgb;
  const newR = Math.max(0, Math.min(255, r + (r * percent / 100)));
  const newG = Math.max(0, Math.min(255, g + (g * percent / 100)));
  const newB = Math.max(0, Math.min(255, b + (b * percent / 100)));

  return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
}

/**
 * Generate accessible form validation
 */
export function createAccessibleFormValidation() {
  const validateField = (field: HTMLInputElement): string[] => {
    const errors: string[] = [];
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');

    if (required && !value) {
      errors.push('This field is required');
    }

    if (value) {
      switch (type) {
        case 'email':
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push('Please enter a valid email address');
          }
          break;
        case 'url':
          try {
            new URL(value);
          } catch {
            errors.push('Please enter a valid URL');
          }
          break;
        case 'tel':
          if (!/^[+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, ''))) {
            errors.push('Please enter a valid phone number');
          }
          break;
        case 'number': {
          const num = parseFloat(value);
          if (isNaN(num)) {
            errors.push('Please enter a valid number');
          } else {
            const min = field.getAttribute('min');
            const max = field.getAttribute('max');
            if (min && num < parseFloat(min)) {
              errors.push(`Value must be at least ${min}`);
            }
            if (max && num > parseFloat(max)) {
              errors.push(`Value must be at most ${max}`);
            }
          }
          break;
        }
      }
    }

    return errors;
  };

  const updateFieldAccessibility = (field: HTMLInputElement, errors: string[]) => {
    const hasErrors = errors.length > 0;
    
    field.setAttribute('aria-invalid', hasErrors.toString());
    field.setAttribute('aria-describedby', hasErrors ? `${field.id}-error` : '');
    
    // Update error message element
    let errorElement = document.getElementById(`${field.id}-error`);
    if (hasErrors) {
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = `${field.id}-error`;
        errorElement.setAttribute('role', 'alert');
        errorElement.setAttribute('aria-live', 'polite');
        field.parentNode?.insertBefore(errorElement, field.nextSibling);
      }
      errorElement.textContent = errors[0]; // Show first error
    } else if (errorElement) {
      errorElement.remove();
    }
  };

  return {
    validateField,
    updateFieldAccessibility,
  };
}

export default {
  getAriaAttributes,
  getKeyboardHandlers,
  createFocusManager,
  createScreenReaderAnnouncer,
  getContrastRatio,
  isAccessibleContrast,
  generateAccessibleColors,
  createAccessibleFormValidation,
};
