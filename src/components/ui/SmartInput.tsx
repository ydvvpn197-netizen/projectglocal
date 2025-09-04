import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Search, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { inputVariants, type InputVariants } from './inputVariants';

export interface SmartInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    InputVariants {
  label?: string;
  error?: string;
  success?: string;
  loading?: boolean;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  passwordToggle?: boolean;
  characterCount?: boolean;
  maxLength?: number;
  autoComplete?: boolean;
  debounceMs?: number;
  onDebouncedChange?: (value: string) => void;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
    custom?: (value: string) => string | null;
  };
}

const SmartInput = forwardRef<HTMLInputElement, SmartInputProps>(
  (
    {
      className,
      variant,
      size,
      label,
      error,
      success,
      loading = false,
      suggestions = [],
      onSuggestionSelect,
      leftIcon,
      rightIcon,
      clearable = false,
      onClear,
      passwordToggle = false,
      characterCount = false,
      maxLength,
      autoComplete = false,
      debounceMs = 300,
      onDebouncedChange,
      validation,
      type = 'text',
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [inputValue, setInputValue] = useState(value || '');
    const [validationError, setValidationError] = useState<string | null>(null);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const inputType = passwordToggle && showPassword ? 'text' : type;

    useEffect(() => {
      setInputValue(value || '');
    }, [value]);

    useEffect(() => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      if (onDebouncedChange && inputValue !== value) {
        const timer = setTimeout(() => {
          onDebouncedChange(inputValue);
        }, debounceMs);
        setDebounceTimer(timer);
      }

      return () => {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
      };
    }, [inputValue, debounceMs, onDebouncedChange, value, debounceTimer]);

    const validateInput = (value: string): string | null => {
      if (!validation) return null;

      if (validation.required && !value.trim()) {
        return 'This field is required';
      }

      if (validation.minLength && value.length < validation.minLength) {
        return `Minimum ${validation.minLength} characters required`;
      }

      if (validation.maxLength && value.length > validation.maxLength) {
        return `Maximum ${validation.maxLength} characters allowed`;
      }

      if (validation.pattern && !validation.pattern.test(value)) {
        return 'Invalid format';
      }

      if (validation.custom) {
        return validation.custom(value);
      }

      return null;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      // Validate input
      const validationError = validateInput(newValue);
      setValidationError(validationError);

      // Call original onChange
      onChange?.(e);
    };

    const handleClear = () => {
      setInputValue('');
      setValidationError(null);
      onClear?.();
      inputRef.current?.focus();
    };

    const handleSuggestionClick = (suggestion: string) => {
      setInputValue(suggestion);
      setShowSuggestions(false);
      onSuggestionSelect?.(suggestion);
      
      // Trigger onChange event
      const event = {
        target: { value: suggestion }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(event);
    };

    const handleFocus = () => {
      if (suggestions.length > 0) {
        setShowSuggestions(true);
      }
    };

    const handleBlur = () => {
      // Delay hiding suggestions to allow for clicks
      setTimeout(() => {
        setShowSuggestions(false);
      }, 200);
    };

    // Determine variant based on state
    const currentVariant = error || validationError ? 'error' : success ? 'success' : variant;

    const characterCountText = characterCount && maxLength 
      ? `${inputValue.length}/${maxLength}`
      : characterCount 
      ? inputValue.length.toString()
      : null;

    return (
      <div className="relative w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={(node) => {
              // Handle both refs
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              inputRef.current = node;
            }}
            type={inputType}
            value={inputValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              inputVariants({ variant: currentVariant, size, className }),
              leftIcon && 'pl-10',
              (rightIcon || clearable || passwordToggle || loading) && 'pr-10',
              suggestions.length > 0 && 'rounded-b-none'
            )}
            {...props}
          />

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            
            {!loading && rightIcon && (
              <div className="text-muted-foreground">{rightIcon}</div>
            )}
            
            {!loading && clearable && inputValue && (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            {!loading && passwordToggle && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-0 bg-background border border-input rounded-b-md shadow-lg max-h-48 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Status Messages */}
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {error && (
              <div className="flex items-center text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error}
              </div>
            )}
            {validationError && (
              <div className="flex items-center text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mr-1" />
                {validationError}
              </div>
            )}
            {success && !error && !validationError && (
              <div className="flex items-center text-sm text-green-600">
                <Check className="h-4 w-4 mr-1" />
                {success}
              </div>
            )}
          </div>
          
          {characterCountText && (
            <span className="text-xs text-muted-foreground">
              {characterCountText}
            </span>
          )}
        </div>
      </div>
    );
  }
);

SmartInput.displayName = 'SmartInput';

export { SmartInput };
