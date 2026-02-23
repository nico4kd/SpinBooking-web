import React from 'react';

interface ZoneBarProps {
  label: string;
  value: number;
  max: number;
  zones?: {
    low: number;    // 0-low = recovery
    medium: number; // low-medium = endurance
    high: number;   // medium-high = threshold
    // high-max = peak
  };
  showValue?: boolean;
  className?: string;
}

export function ZoneBar({
  label,
  value,
  max,
  zones = { low: 25, medium: 50, high: 75 },
  showValue = true,
  className = '',
}: ZoneBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  // Determine zone color based on value
  const getZoneColor = () => {
    const percent = (value / max) * 100;
    if (percent <= zones.low) return 'hsl(var(--primary))'; // cyan - recovery
    if (percent <= zones.medium) return 'hsl(var(--primary))'; // cyan - endurance
    if (percent <= zones.high) return '38 92% 50%'; // amber - threshold
    return 'hsl(var(--accent-hot))'; // hot pink - peak
  };

  const zoneColor = getZoneColor();

  return (
    <div className={className}>
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-[0.05em] font-medium text-secondary">
          {label}
        </span>
        {showValue && (
          <span className="text-sm font-bold tabular-nums">
            {value}
            <span className="text-tertiary text-xs ml-1">/ {max}</span>
          </span>
        )}
      </div>

      {/* Zone bar container */}
      <div className="relative h-3 rounded-full bg-[hsl(var(--surface-2))] overflow-hidden">
        {/* Fill bar with glow */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: `hsl(${zoneColor})`,
            boxShadow: `0 0 12px hsl(${zoneColor}/0.5)`,
          }}
        />

        {/* Zone markers (subtle dividers) */}
        <div
          className="absolute inset-y-0 border-l border-[hsl(var(--border-subtle))]"
          style={{ left: `${zones.low}%` }}
        />
        <div
          className="absolute inset-y-0 border-l border-[hsl(var(--border-subtle))]"
          style={{ left: `${zones.medium}%` }}
        />
        <div
          className="absolute inset-y-0 border-l border-[hsl(var(--border-subtle))]"
          style={{ left: `${zones.high}%` }}
        />
      </div>

      {/* Zone labels (optional, for reference) */}
      <div className="flex justify-between mt-1 px-1">
        <span className="text-[9px] uppercase tracking-wider text-tertiary">Recovery</span>
        <span className="text-[9px] uppercase tracking-wider text-tertiary">Peak</span>
      </div>
    </div>
  );
}
