'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import * as Popover from '@radix-ui/react-popover';
import { Button } from './button';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  disabled = false,
  minDate,
  maxDate,
  disabledDates,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date);
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start text-left font-normal ${
            !value && 'text-secondary'
          } ${className || ''}`}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'PPP', { locale: es }) : placeholder}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 w-auto p-0 bg-[hsl(var(--surface-1))] border border-[hsl(var(--border-default))] rounded-[var(--radius-lg)] shadow-lg"
          align="start"
          sideOffset={4}
        >
          <DayPicker
            mode="single"
            selected={value}
            onSelect={handleSelect}
            disabled={[
              ...(disabledDates || []),
              ...(minDate ? [{ before: minDate }] : []),
              ...(maxDate ? [{ after: maxDate }] : []),
            ]}
            locale={es}
            className="date-picker-custom"
            modifiersClassNames={{
              selected: 'date-picker-selected',
              today: 'date-picker-today',
              disabled: 'date-picker-disabled',
            }}
          />
          <style jsx global>{`
            .date-picker-custom {
              padding: 1rem;
              color: hsl(var(--text-primary));
            }

            .date-picker-custom .rdp-months {
              gap: 0;
            }

            .date-picker-custom .rdp-month {
              width: 100%;
            }

            .date-picker-custom .rdp-caption {
              display: flex;
              justify-content: center;
              padding: 0 0 1rem 0;
              position: relative;
            }

            .date-picker-custom .rdp-caption_label {
              font-size: 0.875rem;
              font-weight: 600;
              color: hsl(var(--text-primary));
              text-transform: capitalize;
            }

            .date-picker-custom .rdp-nav {
              position: absolute;
              top: 0;
              right: 0;
              display: flex;
              gap: 0.25rem;
            }

            .date-picker-custom .rdp-nav_button {
              width: 2rem;
              height: 2rem;
              border-radius: var(--radius-md);
              display: flex;
              align-items: center;
              justify-content: center;
              color: hsl(var(--text-secondary));
              transition: all 0.15s;
            }

            .date-picker-custom .rdp-nav_button:hover:not(:disabled) {
              background: hsl(var(--surface-2));
              color: hsl(var(--text-primary));
            }

            .date-picker-custom .rdp-nav_button:disabled {
              opacity: 0.3;
              cursor: not-allowed;
            }

            .date-picker-custom .rdp-table {
              width: 100%;
              border-collapse: collapse;
            }

            .date-picker-custom .rdp-head_cell {
              font-size: 0.75rem;
              font-weight: 500;
              color: hsl(var(--text-tertiary));
              text-transform: uppercase;
              padding: 0.5rem 0;
              text-align: center;
            }

            .date-picker-custom .rdp-cell {
              padding: 0.125rem;
              text-align: center;
            }

            .date-picker-custom .rdp-day {
              width: 2.25rem;
              height: 2.25rem;
              font-size: 0.875rem;
              border-radius: var(--radius-md);
              display: flex;
              align-items: center;
              justify-content: center;
              color: hsl(var(--text-primary));
              transition: all 0.15s;
              cursor: pointer;
              border: none;
              background: transparent;
            }

            .date-picker-custom .rdp-day:hover:not(.rdp-day_disabled) {
              background: hsl(var(--surface-2));
            }

            .date-picker-custom .date-picker-selected {
              background: hsl(var(--primary)) !important;
              color: white !important;
              font-weight: 600;
            }

            .date-picker-custom .date-picker-today:not(.date-picker-selected) {
              background: hsl(var(--surface-2));
              font-weight: 600;
              color: hsl(var(--primary));
            }

            .date-picker-custom .date-picker-disabled {
              color: hsl(var(--text-tertiary));
              opacity: 0.4;
              cursor: not-allowed;
            }

            .date-picker-custom .date-picker-disabled:hover {
              background: transparent;
            }

            .date-picker-custom .rdp-day_outside {
              color: hsl(var(--text-tertiary));
              opacity: 0.5;
            }
          `}</style>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
