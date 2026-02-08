# Workout Logs

Personal history of completed workout sessions with performance tracking.

---

## Overview

Workout logs record each completed workout session, capturing:

- Which workout was performed
- Date and duration of the session
- Exercise-by-exercise performance data
- Personal records and progress over time

---

## Conceptual Model

### Log Structure

```
Workout Log
├── Workout reference (which template/instance)
├── Completion timestamp
├── Total duration
├── Exercise performances
│   ├── Exercise reference
│   ├── Scheme used
│   ├── Sets completed
│   └── Actual vs target metrics
└── Notes (optional)
```

### Data Flow

```
User completes workout
         │
         ▼
┌─────────────────────┐
│ Create Workout Log  │
│ - workoutId         │
│ - timestamp         │
│ - performances[]    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Update Statistics   │
│ - Personal records  │
│ - Progress tracking │
└─────────────────────┘
```

---

## Relationship to Other Features

| Feature              | Relationship                                           |
| -------------------- | ------------------------------------------------------ |
| **My Workouts**      | Logs reference the workout instance that was performed |
| **Calendar**         | Logs appear on the calendar with color-coded status    |
| **Workout Schedule** | Scheduled sessions become logs when completed          |
| **Exercise Schemes** | Logs capture actual performance against scheme targets |
| **Compendium**       | Exercise references link back to compendium data       |

---

## Implementation Status

| Component    | Status       | Notes                      |
| ------------ | ------------ | -------------------------- |
| Log List     | ✅ Complete  | List with calendar view    |
| Log Detail   | ✅ Complete  | Full session details       |
| Log Creation | ✅ Automatic | Triggered from Run Workout |

---

## Navigation

Workout Logs are **not** in the main navigation menu. They are accessed through:

- **Individual Workout Detail** - View logs specific to a workout
- **Calendar Page** - See all logs in the monthly view
- **Direct URL** - `/user/workout-logs` (shows all logs)
- **Log Detail** - `/user/workout-logs/:id` (specific session)

This design keeps the main navigation clean while making logs accessible contextually where they matter most.

---

## Calendar Integration

The Workout Logs page uses the reusable [Calendar component](../../components/calendar.md) to provide a visual overview:

### Calendar Features

- **Monthly view** with navigation (previous/next month)
- **Color-coded entries**:
  - 🟢 **Green** - Completed workouts
  - 🟡 **Yellow** - Workouts in progress (started today)
  - 🔴 **Red** - Incomplete or aborted workouts
- **Click a day** to navigate to the first log for that date
- **Today's date** highlighted with blue ring

### Code Example

```typescript
import { CalendarComponent } from '../components/ui/calendar';

@Component({
  imports: [CalendarComponent],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Log List -->
      <div class="lg:col-span-2">
        @for (log of logs(); track log.id) {
          <!-- Log cards -->
        }
      </div>

      <!-- Right: Calendar -->
      <div class="lg:col-span-1">
        <app-calendar
          [entries]="calendarEntries()"
          [legend]="calendarLegend"
          (dayClick)="selectDate($event)"
        />
      </div>
    </div>
  `
})
```

### Legend Configuration

```typescript
readonly calendarLegend = {
  green: 'Completed',
  yellow: 'Started (Today)',
  red: 'Incomplete/Aborted'
};
```

---

## Related Documentation

- [Log List](./list.md) - Browse completed sessions
- [Log Detail](./detail.md) - View specific session
- [Calendar Component](../../components/calendar.md) - Reusable calendar component
- [Calendar Page](../calendar/page.md) - Combined view of logs and schedules
- [My Workouts](../workouts/README.md) - Workout instances that generate logs
