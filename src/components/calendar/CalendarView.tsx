'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Button, Badge } from '../ui';
import { ClassBlock } from './ClassBlock';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addWeeks,
  addMonths,
  format,
  isSameDay,
  isToday,
  isSameMonth,
} from 'date-fns';
import { es } from 'date-fns/locale';

interface Class {
  id: string;
  title: string | null;
  startTime: string;
  duration: number;
  difficultyLevel: string;
  maxCapacity: number;
  currentCapacity: number;
  spotsAvailable: number;
  isFull: boolean;
  fewSpotsLeft: boolean;
  instructor: {
    id?: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  room?: {
    id: string;
    name: string;
    location: string | null;
    capacity: number;
  };
  waitlistCount?: number;
  status?: string;
  description?: string | null;
  musicTheme?: string | null;
  roomId?: string;
  instructorId?: string;
  createdAt?: string;
  updatedAt?: string;
  isBooked?: boolean; // User's booking
}

interface CalendarViewProps {
  classes: Class[];
  onClassClick: (classItem: Class) => void;
  loading?: boolean;
}

type ViewMode = 'week' | 'month';

/**
 * CalendarView - Visual calendar for class browsing
 *
 * Features:
 * - Week/month toggle
 * - Visual class blocks with intensity
 * - Capacity indicators
 * - User bookings highlighted
 * - Click to book instantly
 *
 * @example
 * <CalendarView
 *   classes={classes}
 *   onClassClick={handleBook}
 * />
 */
export function CalendarView({
  classes,
  onClassClick,
  loading = false,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { locale: es, weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { locale: es, weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      // Extend to full weeks
      const weekStart = startOfWeek(start, { locale: es, weekStartsOn: 1 });
      const weekEnd = endOfWeek(end, { locale: es, weekStartsOn: 1 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }
  }, [currentDate, viewMode]);

  // Group classes by date and time
  const classesMap = useMemo(() => {
    const map = new Map<string, Class[]>();

    classes.forEach((classItem) => {
      const classDate = new Date(classItem.startTime);
      const dateKey = format(classDate, 'yyyy-MM-dd');

      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }

      map.get(dateKey)!.push(classItem);
    });

    // Sort classes by time within each day
    map.forEach((dayClasses) => {
      dayClasses.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    });

    return map;
  }, [classes]);

  // Navigation handlers
  const goToPrevious = () => {
    if (viewMode === 'week') {
      setCurrentDate((prev) => addWeeks(prev, -1));
    } else {
      setCurrentDate((prev) => addMonths(prev, -1));
    }
  };

  const goToNext = () => {
    if (viewMode === 'week') {
      setCurrentDate((prev) => addWeeks(prev, 1));
    } else {
      setCurrentDate((prev) => addMonths(prev, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get classes for a specific date
  const getClassesForDate = (date: Date): Class[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return classesMap.get(dateKey) || [];
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Title and Navigation */}
        <div className="flex items-center gap-4">
          <h2 className="text-headline capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              className="w-9 h-9 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoy
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              className="w-9 h-9 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'week' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Semana
          </Button>
          <Button
            variant={viewMode === 'month' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Mes
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[hsl(var(--surface-0))] rounded-[var(--radius-lg)] border border-[hsl(var(--border-default))] overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-[hsl(var(--border-default))] bg-[hsl(var(--surface-1))]">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
            <div
              key={day}
              className="p-3 text-center text-label text-tertiary"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div
          className={`grid grid-cols-7 ${
            viewMode === 'month' ? 'auto-rows-fr' : ''
          }`}
        >
          {dateRange.map((date, index) => {
            const dayClasses = getClassesForDate(date);
            const isCurrentMonth =
              viewMode === 'week' || isSameMonth(date, currentDate);
            const isTodayDate = isToday(date);

            return (
              <div
                key={index}
                className={`
                  min-h-[80px] sm:min-h-[100px] md:min-h-[120px] p-2 border-r border-b border-[hsl(var(--border-default))]
                  ${!isCurrentMonth ? 'bg-[hsl(var(--surface-0))] opacity-40' : 'bg-[hsl(var(--surface-1))]'}
                  ${isTodayDate ? 'ring-2 ring-inset ring-[hsl(var(--primary))]' : ''}
                  ${index % 7 === 6 ? 'border-r-0' : ''}
                  hover:bg-[hsl(var(--surface-2))] transition-colors
                `}
              >
                {/* Date header */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`
                      text-sm font-medium
                      ${isTodayDate ? 'text-[hsl(var(--primary))]' : 'text-secondary'}
                    `}
                  >
                    {format(date, 'd')}
                  </span>

                  {dayClasses.length > 0 && (
                    <Badge
                      variant="default"
                      className="text-[10px] px-1.5 py-0.5"
                    >
                      {dayClasses.length}
                    </Badge>
                  )}
                </div>

                {/* Classes */}
                <div className="space-y-1">
                  {dayClasses.slice(0, viewMode === 'week' ? 10 : 3).map((classItem) => (
                    <ClassBlock
                      key={classItem.id}
                      class={classItem}
                      onClick={() => onClassClick(classItem)}
                      compact={viewMode === 'month'}
                    />
                  ))}

                  {dayClasses.length > (viewMode === 'week' ? 10 : 3) && (
                    <button
                      className="text-xs text-[hsl(var(--primary))] hover:underline w-full text-left"
                      onClick={() => {
                        // Could open a modal or navigate to day view
                        console.log('Show more classes for', date);
                      }}
                    >
                      +{dayClasses.length - (viewMode === 'week' ? 10 : 3)} más
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 flex-wrap md:flex-nowrap text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[hsl(var(--success))]" />
          <span className="text-secondary">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[hsl(var(--warning))]" />
          <span className="text-secondary">Pocos lugares</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[hsl(var(--destructive))]" />
          <span className="text-secondary">Completo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[hsl(var(--primary))]" />
          <span className="text-secondary">Tu reserva</span>
        </div>
      </div>
    </div>
  );
}
