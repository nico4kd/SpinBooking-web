import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SuccessCheckProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

/**
 * SuccessCheck - Animated success checkmark
 *
 * Shows a checkmark with scale-in and draw animations
 *
 * @example
 * const [showSuccess, setShowSuccess] = useState(false);
 *
 * const handleComplete = () => {
 *   setShowSuccess(true);
 *   setTimeout(() => setShowSuccess(false), 1500);
 * };
 *
 * {showSuccess && <SuccessCheck message="¡Reserva confirmada!" />}
 */
export function SuccessCheck({
  size = 'md',
  message,
  className,
}: SuccessCheckProps) {
  const sizeMap = {
    sm: { circle: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-sm' },
    md: { circle: 'w-16 h-16', icon: 'w-10 h-10', text: 'text-base' },
    lg: { circle: 'w-24 h-24', icon: 'w-16 h-16', text: 'text-lg' },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className || ''}`}
    >
      {/* Checkmark with animations */}
      <div className="relative">
        {/* Background circle */}
        <div
          className={`
            ${currentSize.circle}
            rounded-full
            bg-[hsl(var(--success)/0.15)]
            flex items-center justify-center
            animate-[scale-in_0.3s_ease-out]
          `}
        >
          {/* Checkmark icon */}
          <CheckCircle2
            className={`
              ${currentSize.icon}
              text-[hsl(var(--success))]
              animate-[draw_0.5s_ease-out_0.2s_both]
            `}
            strokeWidth={2.5}
          />
        </div>

        {/* Ripple effect */}
        <div
          className={`
            absolute inset-0
            ${currentSize.circle}
            rounded-full
            border-2 border-[hsl(var(--success))]
            animate-[ripple_0.6s_ease-out]
          `}
        />
      </div>

      {/* Optional message */}
      {message && (
        <p
          className={`
            ${currentSize.text}
            font-medium
            text-[hsl(var(--success))]
            animate-[fade-in_0.4s_ease-out_0.3s_both]
          `}
        >
          {message}
        </p>
      )}
    </div>
  );
}
