import React, { forwardRef, useState } from 'react';
import { Input, InputProps } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface EnhancedInputProps extends InputProps {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  showPasswordToggle?: boolean;
  required?: boolean;
  fullWidth?: boolean;
}

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({
    label,
    error,
    success,
    helperText,
    showPasswordToggle = false,
    required = false,
    fullWidth = false,
    type = 'text',
    className,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputType = showPasswordToggle && type === 'password' 
      ? (showPassword ? 'text' : 'password')
      : type;

    const hasError = !!error;
    const hasSuccess = !!success && !hasError;

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {label && (
          <Label className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        
        <div className="relative">
          <Input
            ref={ref}
            type={inputType}
            className={cn(
              'transition-all duration-200',
              hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              hasSuccess && 'border-green-500 focus:border-green-500 focus:ring-green-500',
              isFocused && 'ring-2 ring-blue-500/20',
              fullWidth && 'w-full',
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
          
          {hasSuccess && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
          
          {hasError && (
            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
          )}
        </div>
        
        {(error || success || helperText) && (
          <div className="text-sm">
            {error && (
              <p className="text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
            {success && !hasError && (
              <p className="text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {success}
              </p>
            )}
            {helperText && !error && !success && (
              <p className="text-gray-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';
