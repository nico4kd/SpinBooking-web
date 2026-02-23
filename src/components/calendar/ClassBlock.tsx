import React from 'react';
import { Clock, User } from 'lucide-react';
import { format } from 'date-fns';

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
  isBooked?: boolean;
}

interface ClassBlockProps {
  class: Class;
  onClick: () => void;
  compact?: boolean;
}

/**
 * ClassBlock - Visual representation of a class in calendar
 *
 * Shows time, capacity, difficulty with color coding
 */
export function ClassBlock({ class: classItem, onClick, compact = false }: ClassBlockProps) {
  // Determine color based on capacity
  const getStatusColor = () => {
    if (classItem.isBooked) {
      return {
        bg: 'bg-[hsl(var(--primary)/0.15)]',
        border: 'border-[hsl(var(--primary))]',
        text: 'text-[hsl(var(--primary))]',
        dot: 'bg-[hsl(var(--primary))]',
      };
    }
    if (classItem.isFull) {
      return {
        bg: 'bg-[hsl(var(--destructive)/0.1)]',
        border: 'border-[hsl(var(--destructive)/0.3)]',
        text: 'text-[hsl(var(--destructive))]',
        dot: 'bg-[hsl(var(--destructive))]',
      };
    }
    if (classItem.fewSpotsLeft) {
      return {
        bg: 'bg-[hsl(var(--warning)/0.1)]',
        border: 'border-[hsl(var(--warning)/0.3)]',
        text: 'text-[hsl(var(--warning))]',
        dot: 'bg-[hsl(var(--warning))]',
      };
    }
    return {
      bg: 'bg-[hsl(var(--success)/0.1)]',
      border: 'border-[hsl(var(--success)/0.3)]',
      text: 'text-[hsl(var(--success))]',
      dot: 'bg-[hsl(var(--success))]',
    };
  };

  // Get difficulty color
  const getDifficultyColor = () => {
    switch (classItem.difficultyLevel) {
      case 'BEGINNER':
        return 'bg-[hsl(var(--success))]';
      case 'INTERMEDIATE':
        return 'bg-[hsl(var(--warning))]';
      case 'ADVANCED':
        return 'bg-[hsl(var(--destructive))]';
      default:
        return 'bg-[hsl(var(--primary))]';
    }
  };

  const colors = getStatusColor();
  const time = format(new Date(classItem.startTime), 'HH:mm');

  if (compact) {
    // Compact view for month calendar
    return (
      <button
        onClick={onClick}
        className={`
          w-full text-left px-2 py-1 rounded
          border ${colors.border} ${colors.bg}
          hover:scale-105 transition-transform
          group relative
        `}
      >
        {/* Intensity bar */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 rounded-l ${getDifficultyColor()}`}
        />

        <div className="flex items-center justify-between gap-1 pl-1">
          <span className="text-xs font-medium truncate flex-1">
            {time}
          </span>
          <div className={`w-2 h-2 rounded-full ${colors.dot} flex-shrink-0`} />
        </div>

        {/* Tooltip on hover */}
        <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-10 whitespace-nowrap">
          <div className="bg-[hsl(var(--surface-2))] border border-[hsl(var(--border-emphasis))] rounded-lg px-3 py-2 text-xs shadow-lg">
            <div className="font-medium mb-1">{classItem.title ?? 'Clase de Spinning'}</div>
            <div className="text-secondary space-y-0.5">
              <div>{time} • {classItem.duration} min</div>
              <div>{classItem.spotsAvailable} lugares</div>
              <div className="truncate max-w-[150px]">
                {classItem.instructor.user.firstName}
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  }

  // Full view for week calendar
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-2 rounded-lg
        border ${colors.border} ${colors.bg}
        hover:scale-[1.02] hover:shadow-md transition-all
        relative overflow-hidden
      `}
    >
      {/* Intensity bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${getDifficultyColor()}`}
      />

      <div className="pl-1 space-y-1">
        {/* Time */}
        <div className="flex items-center gap-1.5 text-xs">
          <Clock className="w-3 h-3 opacity-60" />
          <span className="font-medium">{time}</span>
          <span className="text-secondary">• {classItem.duration}min</span>
        </div>

        {/* Title */}
        <div className="font-semibold text-sm truncate">
          {classItem.title ?? 'Clase de Spinning'}
        </div>

        {/* Instructor */}
        <div className="flex items-center gap-1.5 text-xs text-secondary">
          <User className="w-3 h-3" />
          <span className="truncate">
            {classItem.instructor.user.firstName}
          </span>
        </div>

        {/* Capacity indicator */}
        <div className="flex items-center justify-between text-xs mt-1 pt-1 border-t border-current opacity-30">
          <span className={`font-medium ${colors.text}`}>
            {classItem.spotsAvailable} lugares
          </span>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => {
              const filled = i < (classItem.currentCapacity / classItem.maxCapacity) * 5;
              return (
                <div
                  key={i}
                  className={`w-1 h-3 rounded-full ${
                    filled ? colors.dot : 'bg-[hsl(var(--border-default))]'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Booked indicator */}
      {classItem.isBooked && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[hsl(var(--primary))] ring-2 ring-white" />
      )}
    </button>
  );
}
