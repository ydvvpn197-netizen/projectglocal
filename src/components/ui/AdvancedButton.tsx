import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { buttonVariants, type ButtonVariants } from './buttonVariants';

export interface AdvancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  ripple?: boolean;
  fullWidth?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const AdvancedButton = React.forwardRef<HTMLButtonElement, AdvancedButtonProps>(
  (
    {
      className,
      variant,
      size,
      animation,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      ripple = true,
      fullWidth = false,
      rounded = 'md',
      shadow = 'none',
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !loading && !disabled) {
        createRipple(e);
      }
      onClick?.(e);
    };

    const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget;
      const circle = document.createElement('span');
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;

      const rect = button.getBoundingClientRect();
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${event.clientX - rect.left - radius}px`;
      circle.style.top = `${event.clientY - rect.top - radius}px`;
      circle.classList.add('ripple');

      const ripple = button.getElementsByClassName('ripple')[0];
      if (ripple) {
        ripple.remove();
      }

      button.appendChild(circle);
    };

    const roundedClasses = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full',
    };

    const shadowClasses = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
    };

    return (
      <button
        className={cn(
          buttonVariants({ variant, size, animation, className }),
          roundedClasses[rounded],
          shadowClasses[shadow],
          fullWidth && 'w-full',
          'relative overflow-hidden',
          loading && 'cursor-not-allowed'
        )}
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {!loading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        {loading && loadingText ? loadingText : children}
        {!loading && rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
        <style jsx>{`
          .ripple {
            position: absolute;
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            background-color: rgba(255, 255, 255, 0.3);
          }
          
          @keyframes ripple {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
        `}</style>
      </button>
    );
  }
);

AdvancedButton.displayName = 'AdvancedButton';

export { AdvancedButton };
