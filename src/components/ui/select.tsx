'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, Search } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
  'data-testid'?: string;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Seleccionar...',
  disabled = false,
  searchable = false,
  className,
  'data-testid': testId,
}: SelectProps) {
  const [search, setSearch] = React.useState('');
  const [open, setOpen] = React.useState(false);

  const filteredOptions = React.useMemo(() => {
    if (!searchable || !search) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search, searchable]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) setSearch('');
      }}
    >
      <SelectPrimitive.Trigger
        className={`
          flex h-10 w-full items-center justify-between
          rounded-[var(--radius-md)]
          border border-[hsl(var(--border-default))]
          bg-[hsl(var(--surface-0))]
          px-3 py-2
          text-sm
          placeholder:text-[hsl(var(--text-tertiary))]
          hover:bg-[hsl(var(--surface-1))]
          focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-0
          disabled:cursor-not-allowed disabled:opacity-50
          data-[placeholder]:text-[hsl(var(--text-secondary))]
          transition-colors
          ${className || ''}
        `}
        data-testid={testId}
      >
        <SelectPrimitive.Value placeholder={placeholder}>
          {selectedOption?.label || placeholder}
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="
            relative z-50 min-w-[8rem] overflow-hidden
            rounded-[var(--radius-lg)]
            border border-[hsl(var(--border-default))]
            bg-[hsl(var(--surface-1))]
            text-[hsl(var(--text-primary))]
            shadow-lg
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
            data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2
            data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2
          "
          position="popper"
          sideOffset={4}
        >
          {searchable && (
            <div className="flex items-center border-b border-[hsl(var(--border-default))] px-3 py-2">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                type="text"
                placeholder="Buscar..."
                className="
                  flex-1 bg-transparent text-sm outline-none
                  placeholder:text-[hsl(var(--text-tertiary))]
                "
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <SelectPrimitive.Viewport className="p-1 max-h-[300px] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-[hsl(var(--text-tertiary))]">
                No se encontraron resultados
              </div>
            ) : (
              filteredOptions.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="
                    relative flex w-full cursor-pointer select-none items-center
                    rounded-[var(--radius-sm)] py-2 pl-8 pr-2
                    text-sm outline-none
                    hover:bg-[hsl(var(--surface-2))]
                    focus:bg-[hsl(var(--surface-2))]
                    data-[disabled]:pointer-events-none data-[disabled]:opacity-50
                    transition-colors
                  "
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <Check className="h-4 w-4 text-[hsl(var(--primary))]" />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))
            )}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
