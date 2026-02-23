# Custom Form Controls Usage Guide

SpinBooking's custom form controls provide a consistent, theme-aware alternative to native HTML form inputs. All components match the Studio Dark design system.

## DatePicker

A styled calendar picker with popover overlay.

### Basic Usage

```tsx
import { DatePicker } from '@/components/ui';
import { useState } from 'react';

function MyComponent() {
  const [date, setDate] = useState<Date>();

  return (
    <DatePicker
      value={date}
      onChange={setDate}
      placeholder="Seleccionar fecha"
    />
  );
}
```

### With Constraints

```tsx
<DatePicker
  value={startDate}
  onChange={setStartDate}
  minDate={new Date()} // No past dates
  maxDate={new Date('2025-12-31')} // Max date
  disabledDates={[new Date('2025-01-01')]} // Specific disabled dates
/>
```

### Converting to/from ISO Strings

```tsx
// From ISO string (API response)
const dateValue = startDate ? new Date(startDate) : undefined;

// To ISO string (API request)
onChange={(date) => setStartDate(date?.toISOString() || '')}
```

### Props

- `value?: Date` - Selected date
- `onChange?: (date: Date | undefined) => void` - Callback when date changes
- `placeholder?: string` - Placeholder text (default: "Seleccionar fecha")
- `disabled?: boolean` - Disable the picker
- `minDate?: Date` - Minimum selectable date
- `maxDate?: Date` - Maximum selectable date
- `disabledDates?: Date[]` - Array of specific dates to disable
- `className?: string` - Additional CSS classes

---

## Select

A styled dropdown with search functionality and keyboard navigation.

### Basic Usage

```tsx
import { Select, SelectOption } from '@/components/ui';
import { useState } from 'react';

const options: SelectOption[] = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
];

function MyComponent() {
  const [level, setLevel] = useState('');

  return (
    <Select
      value={level}
      onValueChange={setLevel}
      options={options}
      placeholder="Seleccionar nivel"
    />
  );
}
```

### With Search

```tsx
<Select
  value={instructor}
  onValueChange={setInstructor}
  options={instructorOptions}
  searchable={true}
  placeholder="Buscar instructor..."
/>
```

### With Disabled Options

```tsx
const options: SelectOption[] = [
  { value: '1', label: 'Opción 1' },
  { value: '2', label: 'Opción 2', disabled: true },
  { value: '3', label: 'Opción 3' },
];
```

### Props

- `value?: string` - Selected value
- `onValueChange?: (value: string) => void` - Callback when selection changes
- `options: SelectOption[]` - Array of options
- `placeholder?: string` - Placeholder text (default: "Seleccionar...")
- `disabled?: boolean` - Disable the select
- `searchable?: boolean` - Enable search/filter functionality (default: false)
- `className?: string` - Additional CSS classes
- `data-testid?: string` - Test ID for testing

---

## TimePicker

A styled time input with hour and minute fields (24-hour format).

### Basic Usage

```tsx
import { TimePicker } from '@/components/ui';
import { useState } from 'react';

function MyComponent() {
  const [time, setTime] = useState(''); // Format: "HH:mm"

  return (
    <TimePicker
      value={time}
      onChange={setTime}
      placeholder="Seleccionar hora"
    />
  );
}
```

### With Time Constraints

```tsx
<TimePicker
  value={startTime}
  onChange={setStartTime}
  minTime="08:00"
  maxTime="22:00"
/>
```

### Features

- Arrow keys to increment/decrement
- Auto-focus minutes after entering hours
- Automatic padding with leading zeros
- 24-hour format
- Numeric-only input

### Props

- `value?: string` - Time value in "HH:mm" format
- `onChange?: (time: string) => void` - Callback when time changes
- `placeholder?: string` - Placeholder text (default: "Seleccionar hora")
- `disabled?: boolean` - Disable the picker
- `minTime?: string` - Minimum selectable time (format: "HH:mm")
- `maxTime?: string` - Maximum selectable time (format: "HH:mm")
- `className?: string` - Additional CSS classes

---

## Migration Examples

### Before (Native Input)

```tsx
<input
  type="date"
  value={startDate}
  onChange={(e) => setStartDate(e.target.value)}
  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
/>
```

### After (DatePicker)

```tsx
<DatePicker
  value={startDate ? new Date(startDate) : undefined}
  onChange={(date) => setStartDate(date?.toISOString() || '')}
/>
```

---

### Before (Native Select)

```tsx
<select
  value={difficultyFilter}
  onChange={(e) => setDifficultyFilter(e.target.value)}
  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
>
  <option value="">Todas las dificultades</option>
  <option value="BEGINNER">Principiante</option>
  <option value="INTERMEDIATE">Intermedio</option>
  <option value="ADVANCED">Avanzado</option>
</select>
```

### After (Select Component)

```tsx
<Select
  value={difficultyFilter}
  onValueChange={setDifficultyFilter}
  options={[
    { value: '', label: 'Todas las dificultades' },
    { value: 'BEGINNER', label: 'Principiante' },
    { value: 'INTERMEDIATE', label: 'Intermedio' },
    { value: 'ADVANCED', label: 'Avanzado' },
  ]}
/>
```

---

### Before (Native Time Input)

```tsx
<input
  type="time"
  value={startTime}
  onChange={(e) => setStartTime(e.target.value)}
  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))] text-sm"
/>
```

### After (TimePicker)

```tsx
<TimePicker
  value={startTime}
  onChange={setStartTime}
/>
```

---

## Design System Alignment

All form controls follow the Studio Dark design system:

- **Colors**: Use CSS variables for theming consistency
- **Border Radius**: `var(--radius-md)` for inputs, `var(--radius-lg)` for dropdowns
- **Typography**: Text sizes match existing components (0.875rem)
- **Interactive States**: Hover, focus, and disabled states
- **Transitions**: Smooth 0.15s transitions for all interactive elements
- **Icons**: Lucide icons matching existing UI
- **Accessibility**: Keyboard navigation, ARIA labels, focus management

## Benefits Over Native Controls

1. **Consistent Styling**: All controls match the dark theme perfectly
2. **Better UX**: Enhanced interactions (search, keyboard nav, date constraints)
3. **Cross-browser**: Look identical on all browsers and OS
4. **Accessible**: WCAG compliant with proper focus management
5. **Themeable**: Use CSS variables for easy theme customization
