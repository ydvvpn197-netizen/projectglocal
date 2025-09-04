import { cva, type VariantProps } from 'class-variance-authority';

export const cardVariants = cva(
  'relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'border-border',
        elevated: 'border-border shadow-lg hover:shadow-xl',
        glass: 'border-white/20 bg-white/10 backdrop-blur-md',
        gradient: 'bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20',
        outline: 'border-2 border-dashed border-muted-foreground/25',
        interactive: 'border-border hover:border-primary/50 cursor-pointer',
      },
      size: {
        sm: 'p-3',
        default: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      },
      animation: {
        none: '',
        hover: 'hover:scale-105 hover:-translate-y-1',
        lift: 'hover:shadow-2xl hover:-translate-y-2',
        glow: 'hover:shadow-lg hover:shadow-primary/25',
        pulse: 'animate-pulse',
        bounce: 'hover:animate-bounce',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'none',
    },
  }
);

export type CardVariants = VariantProps<typeof cardVariants>;
