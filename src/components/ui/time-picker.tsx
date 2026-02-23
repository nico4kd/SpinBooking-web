'use client';

import * as React from 'react';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  value?: string; // Format: "HH:mm"
  onChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minTime?: string;
  maxTime?: string;
}

export function TimePicker({
  value = '',
  onChange,
  placeholder = 'Seleccionar hora',
  disabled = false,
  className,
  minTime,
  maxTime,
}: TimePickerProps) {
  const [hours, setHours] = React.useState('');
  const [minutes, setMinutes] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);

  // Parse value into hours and minutes
  React.useEffect(() => {
    if (value && value.includes(':')) {
      const [h, m] = value.split(':');
      setHours(h);
      setMinutes(m);
    } else {
      setHours('');
      setMinutes('');
    }
  }, [value]);

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val === '') {
      setHours('');
      return;
    }
    const num = parseInt(val, 10);
    if (num >= 0 && num <= 23) {
      const formatted = num.toString().padStart(2, '0');
      setHours(formatted);
      updateTime(formatted, minutes);

      // Auto-focus minutes when hours are complete
      if (val.length === 2) {
        const minutesInput = document.getElementById('minutes-input');
        minutesInput?.focus();
      }
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val === '') {
      setMinutes('');
      return;
    }
    const num = parseInt(val, 10);
    if (num >= 0 && num <= 59) {
      const formatted = num.toString().padStart(2, '0');
      setMinutes(formatted);
      updateTime(hours, formatted);
    }
  };

  const updateTime = (h: string, m: string) => {
    if (h && m && onChange) {
      const timeString = `${h}:${m}`;

      // Validate against min/max time if provided
      if (minTime && timeString < minTime) return;
      if (maxTime && timeString > maxTime) return;

      onChange(timeString);
    }
  };

  const handleHoursBlur = () => {
    if (hours && hours.length === 1) {
      const formatted = hours.padStart(2, '0');
      setHours(formatted);
      updateTime(formatted, minutes);
    }
    setIsFocused(false);
  };

  const handleMinutesBlur = () => {
    if (minutes && minutes.length === 1) {
      const formatted = minutes.padStart(2, '0');
      setMinutes(formatted);
      updateTime(hours, formatted);
    }
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: 'hours' | 'minutes') => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (type === 'hours') {
        const current = parseInt(hours || '0', 10);
        const next = current === 23 ? 0 : current + 1;
        const formatted = next.toString().padStart(2, '0');
        setHours(formatted);
        updateTime(formatted, minutes);
      } else {
        const current = parseInt(minutes || '0', 10);
        const next = current === 59 ? 0 : current + 1;
        const formatted = next.toString().padStart(2, '0');
        setMinutes(formatted);
        updateTime(hours, formatted);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (type === 'hours') {
        const current = parseInt(hours || '0', 10);
        const prev = current === 0 ? 23 : current - 1;
        const formatted = prev.toString().padStart(2, '0');
        setHours(formatted);
        updateTime(formatted, minutes);
      } else {
        const current = parseInt(minutes || '0', 10);
        const prev = current === 0 ? 59 : current - 1;
        const formatted = prev.toString().padStart(2, '0');
        setMinutes(formatted);
        updateTime(hours, formatted);
      }
    }
  };

  return (
    <div
      className={`
        flex h-10 w-full items-center
        rounded-[var(--radius-md)]
        border border-[hsl(var(--border-default))]
        bg-[hsl(var(--surface-0))]
        px-3
        text-sm
        hover:bg-[hsl(var(--surface-1))]
        ${isFocused ? 'ring-2 ring-[hsl(var(--primary))] ring-offset-0' : ''}
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
        transition-colors
        ${className || ''}
      `}
    >
      <Clock className="mr-2 h-4 w-4 text-[hsl(var(--text-tertiary))]" />

      <div className="flex items-center gap-1 flex-1">
        <input
          type="text"
          inputMode="numeric"
          placeholder="HH"
          value={hours}
          onChange={handleHoursChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleHoursBlur}
          onKeyDown={(e) => handleKeyDown(e, 'hours')}
          disabled={disabled}
          maxLength={2}
          className="
            w-8 bg-transparent text-center outline-none
            placeholder:text-[hsl(var(--text-tertiary))]
          "
        />
        <span className="text-[hsl(var(--text-tertiary))]">:</span>
        <input
          id="minutes-input"
          type="text"
          inputMode="numeric"
          placeholder="MM"
          value={minutes}
          onChange={handleMinutesChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleMinutesBlur}
          onKeyDown={(e) => handleKeyDown(e, 'minutes')}
          disabled={disabled}
          maxLength={2}
          className="
            w-8 bg-transparent text-center outline-none
            placeholder:text-[hsl(var(--text-tertiary))]
          "
        />
      </div>

      {!hours && !minutes && (
        <span className="text-[hsl(var(--text-tertiary))] text-xs ml-auto">
          24h
        </span>
      )}
    </div>
  );
}
