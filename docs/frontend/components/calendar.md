# Calendar Component

A reusable monthly calendar component for displaying events with configurable legends and entry types.

---

## Overview

The Calendar component provides a monthly view with navigation, customizable entry dots, and a dynamic legend. It's used across the application to display workout logs and scheduled workouts in a unified interface.

---

## Component API

### Selector

```typescript
<app-calendar />
```

### Inputs

| Input     | Type              | Required | Default | Description                                  |
| --------- | ----------------- | -------- | ------- | -------------------------------------------- |
| `entries` | `CalendarEntry[]` | No       | `[]`    | Array of calendar entries to display         |
| `legend`  | `CalendarLegend`  | No       | `{}`    | Legend configuration mapping types to labels |
| `maxDots` | `number`          | No       | `3`     | Maximum number of dots to show per day       |

### Outputs

| Output     | Type                 | Description                             |
| ---------- | -------------------- | --------------------------------------- |
| `dayClick` | `EventEmitter<Date>` | Emitted when user clicks a calendar day |

---

## Type Definitions

### CalendarEntry

```typescript
interface CalendarEntry {
  on: Date; // The date this entry appears on
  type: string; // Entry type (determines dot color)
  name: string; // Display name (shown in tooltips/accessibility)
}
```

### CalendarLegend

```typescript
interface CalendarLegend {
  [key: string]: string; // type -> label mapping
}
```

---

## Usage Examples

### Basic Usage

```typescript
import { CalendarComponent, type CalendarEntry } from './components/ui/calendar';

@Component({
  standalone: true,
  imports: [CalendarComponent],
  template: ` <app-calendar [entries]="entries()" [legend]="legend" (dayClick)="onDayClick($event)" /> `,
})
class MyComponent {
  entries = signal<CalendarEntry[]>([{ on: new Date('2026-02-08'), type: 'green', name: 'Morning Run' }]);

  legend = {
    green: 'Completed',
    purple: 'Planned',
  };

  onDayClick(date: Date) {
    console.log('Clicked:', date);
  }
}
```

### With Workout Logs and Schedules

```typescript
readonly calendarEntries = computed((): CalendarEntry[] => {
  const entries: CalendarEntry[] = [];

  // Add completed workout logs
  for (const log of this.logsStore.logs()) {
    const type = log.completedAt ? 'green' :
                 this.isStartedToday(log) ? 'yellow' : 'red';

    entries.push({
      on: new Date(log.startedAt),
      type,
      name: log.name
    });
  }

  // Add upcoming scheduled workouts
  for (const schedule of this.schedulesStore.schedules()) {
    // Generate entries for next 4 weeks
    for (let week = 0; week < 4; week++) {
      entries.push({
        on: this.getScheduleDate(schedule, week),
        type: 'purple',
        name: schedule.workoutName
      });
    }
  }

  return entries;
});

readonly calendarLegend = {
  green: 'Completed',
  yellow: 'In Progress',
  red: 'Incomplete',
  purple: 'Planned'
};
```

---

## Entry Types and Colors

The component includes built-in color mappings for common entry types:

| Type     | Color  | CSS Class       |
| -------- | ------ | --------------- |
| `green`  | Green  | `bg-green-500`  |
| `purple` | Purple | `bg-purple-500` |
| `yellow` | Yellow | `bg-yellow-500` |
| `red`    | Red    | `bg-red-500`    |
| `blue`   | Blue   | `bg-blue-500`   |
| `gray`   | Gray   | `bg-gray-400`   |

Unknown types default to gray.

---

## Features

### Month Navigation

- **Previous/Next buttons** in header to navigate months
- Displays current month and year (e.g., "February 2026")

### Visual Indicators

- **Today highlighting**: Current day has a blue ring
- **Entry dots**: Up to `maxDots` dots shown per day
- **Overflow indicator**: Gray dot shown when entries exceed `maxDots`
- **Outside month**: Days from other months shown in gray background

### Dynamic Legend

- Automatically displays legend based on provided `legend` input
- Only shows types defined in legend object
- Each entry shows a colored dot with its label

### Accessibility

- Full keyboard navigation support
- **Tab** to focus days
- **Enter** or **Space** to activate
- **ARIA labels** include full date
- Screen reader friendly

---

## Component Structure

```
app-calendar
├── Header
│   ├── Previous month button
│   ├── Month/Year display
│   └── Next month button
├── Weekday headers (S M T W T F S)
├── Calendar grid (6 weeks × 7 days)
│   └── Each day cell
│       ├── Day number
│       └── Entry dots (up to maxDots)
└── Legend (if provided)
    └── Type label pairs
```

---

## Implementation Details

### Calendar Generation

The component generates a 6-week (42-day) grid to ensure full month coverage:

1. Calculate first day of month
2. Start from the Sunday of that week
3. Generate 42 days to cover all possibilities
4. Mark each day as "current month" or not

### Entry Grouping

Entries are internally grouped by date using `toDateString()` for efficient lookup:

```typescript
readonly entriesByDate = computed(() => {
  const map = new Map<string, CalendarEntry[]>();
  for (const entry of this.entries()) {
    const dateKey = entry.on.toDateString();
    const existing = map.get(dateKey) ?? [];
    existing.push(entry);
    map.set(dateKey, existing);
  }
  return map;
});
```

---

## Related Documentation

- [Calendar Page](../user/calendar/page.md) - User-facing calendar page documentation
- [Workout Logs](../user/workout-logs/README.md) - Uses Calendar component
