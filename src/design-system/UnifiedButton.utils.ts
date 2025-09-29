import { cva, type VariantProps } from 'class-variance-authority';

// Button variants using class-variance-authority
export const unifiedButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Primary variants
        'primary-solid': [
          'bg-primary text-primary-foreground shadow',
          'hover:bg-primary/90',
          'active:bg-primary/80',
          'shadow-sm hover:shadow-md',
        ],
        'primary-outline': [
          'border border-primary bg-transparent text-primary',
          'hover:bg-primary hover:text-primary-foreground',
          'shadow-sm hover:shadow-md',
        ],
        'primary-ghost': [
          'bg-transparent text-primary',
          'hover:bg-primary/10',
          'active:bg-primary/20',
        ],
        'primary-link': [
          'bg-transparent text-primary underline-offset-4',
          'hover:underline',
          'active:underline',
        ],
        
        // Secondary variants
        'secondary-solid': [
          'bg-secondary text-secondary-foreground',
          'hover:bg-secondary/80',
          'shadow-sm hover:shadow-md',
        ],
        'secondary-outline': [
          'border border-secondary bg-transparent text-secondary-foreground',
          'hover:bg-secondary hover:text-secondary-foreground',
          'shadow-sm hover:shadow-md',
        ],
        
        // Accent variants
        'accent-solid': [
          'bg-accent text-accent-foreground',
          'hover:bg-accent/80',
          'shadow-sm hover:shadow-md',
        ],
        'accent-outline': [
          'border border-accent bg-transparent text-accent',
          'hover:bg-accent hover:text-accent-foreground',
          'shadow-sm hover:shadow-md',
        ],
        
        // Destructive variants
        'destructive-solid': [
          'bg-destructive text-destructive-foreground shadow',
          'hover:bg-destructive/90',
          'active:bg-destructive/80',
          'shadow-sm hover:shadow-md',
        ],
        'destructive-outline': [
          'border border-destructive bg-transparent text-destructive',
          'hover:bg-destructive hover:text-destructive-foreground',
          'shadow-sm hover:shadow-md',
        ],
        'destructive-ghost': [
          'bg-transparent text-destructive',
          'hover:bg-destructive/10',
          'active:bg-destructive/20',
        ],
        
        // Muted variants
        'muted-solid': [
          'bg-muted text-muted-foreground',
          'hover:bg-muted/80',
          'shadow-sm hover:shadow-md',
        ],
        'muted-outline': [
          'border border-muted bg-transparent text-muted-foreground',
          'hover:bg-muted hover:text-muted-foreground',
          'shadow-sm hover:shadow-md',
        ],
        'muted-ghost': [
          'bg-transparent text-muted-foreground',
          'hover:bg-muted/10',
          'active:bg-muted/20',
        ],
        
        // Success variants
        'success-solid': [
          'bg-green-600 text-white',
          'hover:bg-green-700',
          'shadow-sm hover:shadow-md',
        ],
        'success-outline': [
          'border border-green-600 bg-transparent text-green-600',
          'hover:bg-green-600 hover:text-white',
          'shadow-sm hover:shadow-md',
        ],
        
        // Warning variants
        'warning-solid': [
          'bg-yellow-600 text-white',
          'hover:bg-yellow-700',
          'shadow-sm hover:shadow-md',
        ],
        'warning-outline': [
          'border border-yellow-600 bg-transparent text-yellow-600',
          'hover:bg-yellow-600 hover:text-white',
          'shadow-sm hover:shadow-md',
        ],
        
        // Info variants
        'info-solid': [
          'bg-blue-600 text-white',
          'hover:bg-blue-700',
          'shadow-sm hover:shadow-md',
        ],
        'info-outline': [
          'border border-blue-600 bg-transparent text-blue-600',
          'hover:bg-blue-600 hover:text-white',
          'shadow-sm hover:shadow-md',
        ],
        
        // Default variants
        default: [
          'bg-primary text-primary-foreground shadow',
          'hover:bg-primary/90',
          'active:bg-primary/80',
        ],
        destructive: [
          'bg-destructive text-destructive-foreground shadow-sm',
          'hover:bg-destructive/90',
        ],
        outline: [
          'border border-input bg-background shadow-sm',
          'hover:bg-accent hover:text-accent-foreground',
        ],
        secondary: [
          'bg-secondary text-secondary-foreground shadow-sm',
          'hover:bg-secondary/80',
        ],
        ghost: [
          'hover:bg-accent hover:text-accent-foreground',
        ],
        link: [
          'text-primary underline-offset-4 hover:underline',
        ],
      },
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-3 text-xs',
        default: 'h-9 px-4 py-2',
        lg: 'h-10 px-8 text-base',
        xl: 'h-12 px-10 text-lg',
        '2xl': 'h-14 px-12 text-xl',
        icon: 'h-9 w-9',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-10 w-10',
        'icon-xl': 'h-12 w-12',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
      loading: {
        true: 'cursor-not-allowed opacity-70',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
      loading: false,
    },
  }
);

export type UnifiedButtonVariants = VariantProps<typeof unifiedButtonVariants>;
