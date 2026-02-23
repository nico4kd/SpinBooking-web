import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const inputVariants = cva(
  'flex w-full rounded-[var(--radius-md)] bg-[hsl(var(--control-background))] px-3 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[hsl(var(--text-muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--control-focus))] focus-visible:bg-[hsl(var(--surface-2))] disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border border-[hsl(var(--control-border))] focus-visible:border-[hsl(var(--control-focus))]',
        error: 'border border-[hsl(var(--destructive))] focus-visible:ring-[hsl(var(--destructive))]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, type, label, error, helperText, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-secondary block">
            {label}
          </label>
        )}
        <input
          type={type}
          className={inputVariants({ variant: error ? 'error' : variant, className })}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs text-[hsl(var(--destructive))]">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-tertiary">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
