'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  format,
  isSameDay,
  isToday,
  isSameMonth,
} from 'date-fns';
import { es } from 'date-fns/locale';

interface MonthDayPickerProps {
  selectedDay: Date | null;
  onDaySelect: (date: Date) => void;
  bookingDates?: string[]; // ISO 'yyyy-MM-dd' — renders primary-color dot
  classDates?: string[];   // ISO 'yyyy-MM-dd' — renders muted/success dot (only when no booking)
  onMonthChange?: (month: Date) => void; // Called when the user navigates to a different month
}

/**
 * MonthDayPicker - Month grid calendar for day selection
 *
 * Features:
 * - Month navigation (previous / next)
 * - Day selection with highlight
 * - Booking dot indicators (primary color)
 * - Class availability dot indicators (success color, only when no booking)
 *
 * @example
 * <MonthDayPicker
 *   selectedDay={selectedDay}
 *   onDaySelect={setSelectedDay}
 *   bookingDates={['2026-02-10', '2026-02-17']}
 * />
 */
export function MonthDayPicker({
  selectedDay,
  onDaySelect,
  bookingDates = [],
  classDates = [],
  onMonthChange,
}: MonthDayPickerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Build the full grid for the current month (padded to full weeks, Mon–Sun)
  const dateRange = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const gridStart = startOfWeek(monthStart, { locale: es, weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { locale: es, weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentDate]);

  // Convert dot-date arrays into Sets for O(1) lookup
  const bookingDateSet = useMemo(
    () => new Set(bookingDates),
    [bookingDates]
  );
  const classDateSet = useMemo(
    () => new Set(classDates),
    [classDates]
  );

  const goToPreviousMonth = () => {
    setCurrentDate((prev) => {
      const next = subMonths(prev, 1);
      onMonthChange?.(next);
      return next;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate((prev) => {
      const next = addMonths(prev, 1);
      onMonthChange?.(next);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {/* Month navigation header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousMonth}
          className="w-9 h-9 p-0"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <span className="text-sm font-semibold capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNextMonth}
          className="w-9 h-9 p-0"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="bg-[hsl(var(--surface-0))] rounded-[var(--radius-lg)] border border-[hsl(var(--border-default))] overflow-hidden">
        {/* Day-of-week header row */}
        <div className="grid grid-cols-7 border-b border-[hsl(var(--border-default))] bg-[hsl(var(--surface-1))]">
          {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map((day) => (
            <div
              key={day}
              className="p-2 text-center text-label text-tertiary text-xs font-medium"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {dateRange.map((date, index) => {
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isTodayDate = isToday(date);
            const isSelected = selectedDay != null && isSameDay(date, selectedDay);
            const dateKey = format(date, 'yyyy-MM-dd');
            const hasBooking = bookingDateSet.has(dateKey);
            const hasClass = classDateSet.has(dateKey);

            return (
              <div
                key={index}
                onClick={() => isCurrentMonth && onDaySelect(date)}
                className={[
                  'min-h-[60px] p-2 border-r border-b border-[hsl(var(--border-default))] transition-colors',
                  index % 7 === 6 ? 'border-r-0' : '',
                  !isCurrentMonth
                    ? 'opacity-40 cursor-default'
                    : 'hover:bg-[hsl(var(--surface-2))] cursor-pointer',
                  isSelected
                    ? 'bg-[hsl(var(--primary)/0.1)] ring-2 ring-inset ring-[hsl(var(--primary))]'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {/* Day number */}
                <span
                  className={[
                    'text-sm',
                    isTodayDate ? 'font-bold text-[hsl(var(--primary))]' : 'text-secondary',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {format(date, 'd')}
                </span>

                {/* Dot indicators */}
                {hasBooking && (
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] mt-1" />
                )}
                {hasClass && !hasBooking && (
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))] mt-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
