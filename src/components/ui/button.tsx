import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--control-focus))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]',
  {
    variants: {
      variant: {
        primary:
          'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_0_16px_hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--primary-hover))] hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] active:scale-[0.98]',
        hot:
          'bg-[hsl(var(--accent-hot))] text-[hsl(var(--primary-foreground))] shadow-[0_0_16px_hsl(var(--accent-hot)/0.3)] hover:bg-[hsl(var(--accent-hot-hover))] hover:shadow-[0_0_20px_hsl(var(--accent-hot)/0.4)] active:scale-[0.98]',
        outline:
          'border border-[hsl(var(--border-emphasis))] bg-transparent hover:bg-[hsl(var(--surface-1))] hover:border-[hsl(var(--border-strong))]',
        ghost:
          'hover:bg-[hsl(var(--surface-1))] active:bg-[hsl(var(--surface-2))]',
        destructive:
          'bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive)/0.9)] active:scale-[0.98]',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-[var(--radius-sm)]',
        md: 'h-10 px-4 text-sm rounded-[var(--radius-md)]',
        lg: 'h-12 px-6 text-base rounded-[var(--radius-md)]',
        xl: 'h-14 px-8 text-lg rounded-[var(--radius-lg)]',
        icon: 'h-10 w-10 rounded-[var(--radius-md)]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
