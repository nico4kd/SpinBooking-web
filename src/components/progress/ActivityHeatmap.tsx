import React from 'react';
import {
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  format,
  getDay,
  addDays,
  startOfWeek,
  isToday,
} from 'date-fns';
import { es } from 'date-fns/locale';

interface ActivityData {
  date: string; // YYYY-MM-DD
  count: number;
  intensity?: 'low' | 'medium' | 'high' | 'peak';
}

interface ActivityHeatmapProps {
  data: ActivityData[];
  year?: number;
  className?: string;
}

/**
 * ActivityHeatmap - GitHub-style contribution calendar
 *
 * Shows 12 months of activity in a heatmap grid
 *
 * @example
 * <ActivityHeatmap
 *   data={[
 *     { date: '2026-01-15', count: 2, intensity: 'high' },
 *     { date: '2026-01-16', count: 1, intensity: 'medium' },
 *   ]}
 * />
 */
export function ActivityHeatmap({
  data,
  year = new Date().getFullYear(),
  className,
}: ActivityHeatmapProps) {
  // Create a map for quick lookups
  const dataMap = new Map(
    data.map((item) => [item.date, item])
  );

  // Get all days in the year
  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 0, 1));
  const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });

  // Start from the first Monday before or on yearStart
  const gridStart = startOfWeek(yearStart, { weekStartsOn: 1 });

  // Create weeks array
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  // Start from gridStart
  let currentDay = gridStart;

  while (currentDay <= yearEnd || currentWeek.length > 0) {
    // Add days until we reach the end of year
    if (currentDay <= yearEnd) {
      currentWeek.push(currentDay);
    } else {
      currentWeek.push(currentDay); // Fill remaining cells
    }

    // If week is complete (7 days), start a new week
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentDay = addDays(currentDay, 1);
  }

  // Get intensity color
  const getIntensityColor = (count: number, intensity?: string) => {
    if (count === 0) {
      return 'bg-[hsl(var(--surface-2))]';
    }

    // Use provided intensity or calculate from count
    const level = intensity || (
      count >= 3 ? 'peak' :
      count >= 2 ? 'high' :
      count >= 1 ? 'medium' :
      'low'
    );

    switch (level) {
      case 'low':
        return 'bg-[hsl(var(--success)/0.3)]';
      case 'medium':
        return 'bg-[hsl(var(--success)/0.5)]';
      case 'high':
        return 'bg-[hsl(var(--success)/0.7)]';
      case 'peak':
        return 'bg-[hsl(var(--success))]';
      default:
        return 'bg-[hsl(var(--surface-2))]';
    }
  };

  // Calculate stats
  const totalClasses = data.reduce((sum, item) => sum + item.count, 0);
  const activeDays = data.filter((item) => item.count > 0).length;
  const currentStreak = calculateCurrentStreak(data);
  const longestStreak = calculateLongestStreak(data);

  return (
    <div className={className}>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <p className="text-label text-tertiary">Total Clases</p>
          <p className="text-data text-3xl mt-1">{totalClasses}</p>
        </div>
        <div>
          <p className="text-label text-tertiary">Días Activos</p>
          <p className="text-data text-3xl mt-1">{activeDays}</p>
        </div>
        <div>
          <p className="text-label text-tertiary">Racha Actual</p>
          <p className="text-data text-3xl mt-1">{currentStreak}</p>
        </div>
        <div>
          <p className="text-label text-tertiary">Racha Máxima</p>
          <p className="text-data text-3xl mt-1">{longestStreak}</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-[hsl(var(--surface-1))] rounded-[var(--radius-lg)] border border-[hsl(var(--border-default))] p-4 overflow-x-auto">
        <div className="inline-flex gap-1">
          {/* Month labels */}
          <div className="flex flex-col justify-start mr-2">
            <div className="h-4" /> {/* Spacer for month labels */}
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => (
              <div
                key={day}
                className="h-3 flex items-center text-[10px] text-tertiary"
                style={{ marginBottom: i < 6 ? '2px' : 0 }}
              >
                {i % 2 === 0 ? day : ''}
              </div>
            ))}
          </div>

          {/* Weeks grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => {
              // Show month label on first week of each month
              const monthLabel =
                weekIndex === 0 ||
                (week[0] && format(week[0], 'M') !== format(weeks[weekIndex - 1]?.[0] || week[0], 'M'))
                  ? format(week[0], 'MMM', { locale: es })
                  : '';

              return (
                <div key={weekIndex} className="flex flex-col gap-0.5">
                  {/* Month label */}
                  <div className="h-4 text-[10px] text-tertiary font-medium">
                    {monthLabel}
                  </div>

                  {/* Days */}
                  {week.map((day, dayIndex) => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const dayData = dataMap.get(dateKey);
                    const count = dayData?.count || 0;
                    const isCurrentDay = isToday(day);

                    return (
                      <div
                        key={dayIndex}
                        className={`
                          w-3 h-3 rounded-sm
                          ${getIntensityColor(count, dayData?.intensity)}
                          ${isCurrentDay ? 'ring-2 ring-[hsl(var(--primary))] ring-offset-1' : ''}
                          hover:ring-2 hover:ring-[hsl(var(--border-emphasis))]
                          transition-all cursor-pointer
                        `}
                        title={`${format(day, 'PP', { locale: es })}: ${count} ${count === 1 ? 'clase' : 'clases'}`}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-secondary">
          <span>Menos</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-3 h-3 rounded-sm ${
                level === 0 ? 'bg-[hsl(var(--surface-2))]' :
                level === 1 ? 'bg-[hsl(var(--success)/0.3)]' :
                level === 2 ? 'bg-[hsl(var(--success)/0.5)]' :
                level === 3 ? 'bg-[hsl(var(--success)/0.7)]' :
                'bg-[hsl(var(--success))]'
              }`}
            />
          ))}
          <span>Más</span>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function calculateCurrentStreak(data: ActivityData[]): number {
  if (data.length === 0) return 0;

  // Sort by date descending
  const sorted = [...data]
    .filter(d => d.count > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sorted.length === 0) return 0;

  // Check if today or yesterday has activity
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');

  if (sorted[0].date !== today && sorted[0].date !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.abs(
      new Date(sorted[i - 1].date).getTime() - new Date(sorted[i].date).getTime()
    );
    const daysDiff = diff / (1000 * 60 * 60 * 24);

    if (daysDiff <= 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function calculateLongestStreak(data: ActivityData[]): number {
  if (data.length === 0) return 0;

  const sorted = [...data]
    .filter(d => d.count > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.abs(
      new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()
    );
    const daysDiff = diff / (1000 * 60 * 60 * 24);

    if (daysDiff <= 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
}
