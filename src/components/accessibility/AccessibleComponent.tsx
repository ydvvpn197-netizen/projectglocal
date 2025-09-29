import React, { forwardRef, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { getAriaAttributes, getKeyboardHandlers, createFocusManager } from '@/utils/accessibility';

export interface AccessibleComponentProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  // Accessibility props
  role?: string;
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
  tabIndex?: number;
  // Focus management
  focusable?: boolean;
  autoFocus?: boolean;
  // Keyboard navigation
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  onPageUp?: () => void;
  onPageDown?: () => void;
  onActivate?: () => void;
  onEscape?: () => void;
  onTab?: (shift: boolean) => void;
  // Screen reader support
  screenReaderText?: string;
  // High contrast mode
  highContrast?: boolean;
}

export const AccessibleComponent = forwardRef<HTMLElement, AccessibleComponentProps>(
  (
    {
      children,
      as: Component = 'div',
      className,
      role,
      focusable = true,
      autoFocus = false,
      screenReaderText,
      highContrast = false,
      onKeyDown,
      onArrowUp,
      onArrowDown,
      onArrowLeft,
      onArrowRight,
      onHome,
      onEnd,
      onPageUp,
      onPageDown,
      onActivate,
      onEscape,
      onTab,
      ...ariaProps
    },
    ref
  ) => {
    const internalRef = useRef<HTMLElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const focusManager = useRef(createFocusManager());

    // Combine refs
    const combinedRef = (node: HTMLElement) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
      internalRef.current = node;
    };

    // Auto focus
    useEffect(() => {
      if (autoFocus && internalRef.current) {
        internalRef.current.focus();
      }
    }, [autoFocus]);

    // Update focusable elements when component mounts
    useEffect(() => {
      if (internalRef.current) {
        focusManager.current.updateFocusableElements(internalRef.current);
      }
    }, [children]);

    // Handle focus events
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    // Enhanced keyboard navigation
    const handleKeyDown = (event: React.KeyboardEvent) => {
      // Call custom onKeyDown first
      onKeyDown?.(event);
      
      // Apply keyboard handlers
      const keyboardHandlers = getKeyboardHandlers({
        onArrowUp,
        onArrowDown,
        onArrowLeft,
        onArrowRight,
        onHome,
        onEnd,
        onPageUp,
        onPageDown,
        onActivate,
        onEscape,
        onTab,
      });
      
      keyboardHandlers.onKeyDown(event);
    };

    // Generate accessibility attributes
    const accessibilityProps = {
      role,
      tabIndex: focusable ? (ariaProps.tabIndex ?? 0) : -1,
      ...ariaProps,
    };

    return (
      <Component
        ref={combinedRef}
        className={cn(
          className,
          isFocused && 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
          highContrast && 'border-2 border-current',
          !focusable && 'pointer-events-none'
        )}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        {...accessibilityProps}
      >
        {screenReaderText && (
          <span className="sr-only">{screenReaderText}</span>
        )}
        {children}
      </Component>
    );
  }
);

AccessibleComponent.displayName = 'AccessibleComponent';

// Specialized accessible components
export const AccessibleButton = forwardRef<
  HTMLButtonElement,
  Omit<AccessibleComponentProps, 'as'> & {
    onClick?: () => void;
    disabled?: boolean;
    pressed?: boolean;
    hasPopup?: boolean;
  }
>(({ 
  children, 
  onClick, 
  disabled = false, 
  pressed = false, 
  hasPopup = false,
  ...props 
}, ref) => {
  const ariaProps = getAriaAttributes('button', {
    label: props['aria-label'],
    description: props['aria-describedby'],
    disabled,
    pressed,
    hasPopup,
  });

  return (
    <AccessibleComponent
      ref={ref}
      as="button"
      role="button"
      onClick={onClick}
      disabled={disabled}
      {...ariaProps}
      {...props}
    >
      {children}
    </AccessibleComponent>
  );
});

AccessibleButton.displayName = 'AccessibleButton';

export const AccessibleLink = forwardRef<
  HTMLAnchorElement,
  Omit<AccessibleComponentProps, 'as'> & {
    href: string;
    target?: string;
    current?: boolean;
  }
>(({ children, href, target, current = false, ...props }, ref) => {
  const ariaProps = getAriaAttributes('link', {
    label: props['aria-label'],
    description: props['aria-describedby'],
    current,
  });

  return (
    <AccessibleComponent
      ref={ref}
      as="a"
      role="link"
      href={href}
      target={target}
      {...ariaProps}
      {...props}
    >
      {children}
    </AccessibleComponent>
  );
});

AccessibleLink.displayName = 'AccessibleLink';

export const AccessibleInput = forwardRef<
  HTMLInputElement,
  Omit<AccessibleComponentProps, 'as'> & {
    type?: string;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    invalid?: boolean;
    min?: number;
    max?: number;
    step?: number;
  }
>(({ 
  children, 
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  invalid = false,
  min,
  max,
  step,
  ...props 
}, ref) => {
  const ariaProps = getAriaAttributes('input', {
    label: props['aria-label'],
    labelledBy: props['aria-labelledby'],
    description: props['aria-describedby'],
    required,
    invalid,
    min,
    max,
    value: value,
  });

  return (
    <AccessibleComponent
      ref={ref}
      as="input"
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      {...ariaProps}
      {...props}
    >
      {children}
    </AccessibleComponent>
  );
});

AccessibleInput.displayName = 'AccessibleInput';

export const AccessibleList = forwardRef<
  HTMLUListElement,
  Omit<AccessibleComponentProps, 'as'> & {
    items: Array<{
      id: string;
      content: React.ReactNode;
      selected?: boolean;
      current?: boolean;
      level?: number;
      setSize?: number;
      posInSet?: number;
    }>;
    orientation?: 'horizontal' | 'vertical';
    onItemSelect?: (id: string) => void;
  }
>(({ 
  children, 
  items, 
  orientation = 'vertical',
  onItemSelect,
  ...props 
}, ref) => {
  const ariaProps = getAriaAttributes('list', {
    label: props['aria-label'],
    description: props['aria-describedby'],
    expanded: props['aria-expanded'],
  });

  return (
    <AccessibleComponent
      ref={ref}
      as="ul"
      role="list"
      {...ariaProps}
      {...props}
    >
      {items.map((item, index) => (
        <AccessibleComponent
          key={item.id}
          as="li"
          role="listitem"
          tabIndex={0}
          onClick={() => onItemSelect?.(item.id)}
          {...getAriaAttributes('listitem', {
            selected: item.selected,
            current: item.current,
            level: item.level,
            setSize: item.setSize,
            posInSet: item.posInSet,
          })}
        >
          {item.content}
        </AccessibleComponent>
      ))}
      {children}
    </AccessibleComponent>
  );
});

AccessibleList.displayName = 'AccessibleList';

export default AccessibleComponent;
