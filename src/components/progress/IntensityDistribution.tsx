import React from 'react';

interface IntensityData {
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';
  count: number;
  percentage: number;
}

interface IntensityDistributionProps {
  data: IntensityData[];
  className?: string;
}

/**
 * IntensityDistribution - Shows breakdown of class difficulty levels
 *
 * Visual bar chart showing distribution across difficulty levels
 *
 * @example
 * <IntensityDistribution
 *   data={[
 *     { level: 'BEGINNER', count: 8, percentage: 20 },
 *     { level: 'INTERMEDIATE', count: 24, percentage: 60 },
 *     { level: 'ADVANCED', count: 8, percentage: 20 },
 *   ]}
 * />
 */
export function IntensityDistribution({
  data,
  className,
}: IntensityDistributionProps) {
  const levelConfig = {
    BEGINNER: {
      label: 'Principiante',
      color: 'hsl(var(--success))',
      bgColor: 'bg-[hsl(var(--success))]',
      lightBg: 'bg-[hsl(var(--success)/0.15)]',
    },
    INTERMEDIATE: {
      label: 'Intermedio',
      color: 'hsl(var(--warning))',
      bgColor: 'bg-[hsl(var(--warning))]',
      lightBg: 'bg-[hsl(var(--warning)/0.15)]',
    },
    ADVANCED: {
      label: 'Avanzado',
      color: 'hsl(var(--destructive))',
      bgColor: 'bg-[hsl(var(--destructive))]',
      lightBg: 'bg-[hsl(var(--destructive)/0.15)]',
    },
    ALL_LEVELS: {
      label: 'Todos los niveles',
      color: 'hsl(var(--primary))',
      bgColor: 'bg-[hsl(var(--primary))]',
      lightBg: 'bg-[hsl(var(--primary)/0.15)]',
    },
  };

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className={className}>
      <h3 className="text-title mb-4">Distribución de Intensidad</h3>

      {/* Bar Chart */}
      <div className="space-y-4 mb-6">
        {data.map((item) => {
          const config = levelConfig[item.level];

          return (
            <div key={item.level}>
              {/* Label and count */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{config.label}</span>
                <span className="text-data text-sm">
                  {item.count} <span className="text-secondary text-xs">({item.percentage}%)</span>
                </span>
              </div>

              {/* Progress bar */}
              <div className="relative h-8 bg-[hsl(var(--surface-2))] rounded-lg overflow-hidden">
                <div
                  className={`h-full ${config.bgColor} transition-all duration-500 ease-out flex items-center justify-end px-3`}
                  style={{ width: `${item.percentage}%` }}
                >
                  {item.percentage > 15 && (
                    <span className="text-xs font-bold text-white">
                      {item.percentage}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pie Chart (Donut) */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="hsl(var(--surface-2))"
              strokeWidth="20"
            />

            {/* Segments */}
            {(() => {
              let cumulativePercentage = 0;

              return data.map((item, index) => {
                const config = levelConfig[item.level];
                const percentage = item.percentage;

                // Calculate arc
                const circumference = 2 * Math.PI * 40;
                const arcLength = (percentage / 100) * circumference;
                const offset = ((100 - cumulativePercentage) / 100) * circumference;

                cumulativePercentage += percentage;

                return (
                  <circle
                    key={item.level}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={config.color}
                    strokeWidth="20"
                    strokeDasharray={`${arcLength} ${circumference}`}
                    strokeDashoffset={-offset}
                    className="transition-all duration-500"
                  />
                );
              });
            })()}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-data text-3xl font-bold">{total}</span>
            <span className="text-xs text-secondary">Total</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3">
        {data.map((item) => {
          const config = levelConfig[item.level];

          return (
            <div
              key={item.level}
              className={`flex items-center gap-2 p-2 rounded-lg ${config.lightBg}`}
            >
              <div className={`w-3 h-3 rounded-full ${config.bgColor}`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">
                  {config.label}
                </div>
                <div className="text-xs text-secondary">
                  {item.count} clases
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
