# `/user/calendar` - Workout Calendar

Unified view of workout history and upcoming planned workouts.

---

## Overview

The Calendar page provides a comprehensive monthly view combining:

- **Past Workouts** - Completed workout sessions from logs
- **Upcoming Schedules** - Planned workouts that haven't been completed yet

This gives users a complete picture of their workout activity and upcoming plans in one interface.

---

## Layout

### Two-Column Design

```
┌────────────────────────────────────────┬─────────────────────┐
│ Left Column (2/3)                      │ Right Column (1/3)  │
├────────────────────────────────────────┼─────────────────────┤
│                                        │                     │
│  Upcoming Workouts                     │   Calendar          │
│  ┌────────────────────────────────┐    │   ┌─────────────┐   │
│  │ Push Day    Monday, Wednesday │    │   │  < Feb >    │   │
│  │             9.2., 11.2.       │    │   │ S M T W T F S│   │
│  ├────────────────────────────────┤    │   │ 1 2 3 4 5 6 7│   │
│  │ Leg Day     Tuesday, Thursday │    │   │ 8 9...      │   │
│  │             10.2., 12.2.      │    │   └─────────────┘   │
│  └────────────────────────────────┘    │                     │
│                                        │   Legend            │
│  Recent Workouts                       │   🟢 Completed      │
│  ┌────────────────────────────────┐    │   🟡 In Progress    │
│  │ Push Day            Completed  │    │   🔴 Incomplete     │
│  │ Feb 8, 2026                    │    │   🟣 Planned        │
│  ├────────────────────────────────┤    │                     │
│  │ Pull Day            Incomplete │    │                     │
│  │ Feb 7, 2026                    │    │                     │
│  └────────────────────────────────┘    │                     │
│                                        │                     │
└────────────────────────────────────────┴─────────────────────┘
```

---

## Features

### Upcoming Workouts Panel

Shows scheduled workouts with their upcoming dates:

- **Workout name** - Name of the scheduled workout
- **Scheduled days** - Days of the week (e.g., "Monday, Wednesday")
- **Upcoming dates** - Next 4 dates when the workout is scheduled (e.g., "9.2., 11.2.")
- **"Planned" indicator** - Purple dot with label

Each schedule appears as a single line entry, combining all its criteria days. Dates that already have a log for that workout are not shown.

### Recent Workouts Panel

Lists the 10 most recent workout logs:

- **Workout name** - Links to log detail
- **Date** - When the workout was performed
- **Status indicator**:
  - 🟢 **Green** - Completed successfully
  - 🟡 **Yellow** - Started today (in progress)
  - 🔴 **Red** - Incomplete or aborted
- Click to view full log details

### Calendar Widget

The [Calendar component](../../components/calendar.md) provides:

- **Monthly navigation** - Previous/next month buttons
- **Day grid** - 6 weeks shown for full month coverage
- **Entry dots** - Up to 3 dots per day showing activity
- **Today highlight** - Blue ring around current date
- **Legend** - Dynamic based on entry types present

Scheduled workouts only appear on dates that don't already have a log for that workout.

---

## Smart Filtering

The Calendar applies intelligent filtering to avoid duplicate entries:

### For Upcoming Workouts List

- Only shows schedules that have unfulfilled dates
- Filters out dates where a log already exists for that workout
- Shows up to 4 upcoming dates per schedule

### For Calendar Display

- Purple dots (planned workouts) only appear on dates without existing logs
- Prevents scheduled workouts from appearing on days they're already completed

### Example

If "Push Day" is scheduled for Mondays and Wednesdays:

- User completes Push Day on Monday Feb 9
- Calendar shows only Wednesday Feb 11 as upcoming
- Monday Feb 16 would appear again (future date, no log yet)

---

## Color Coding

| Color     | Type     | Meaning                             |
| --------- | -------- | ----------------------------------- |
| 🟢 Green  | `green`  | Workout completed successfully      |
| 🟡 Yellow | `yellow` | Workout started today (in progress) |
| 🔴 Red    | `red`    | Workout incomplete or aborted       |
| 🟣 Purple | `purple` | Scheduled workout (planned)         |

---

## Entry Points

- **Main navigation** - "Calendar" link under User section
- **Workout detail** - "Schedule" action navigates to calendar
- **Direct URL** - `/user/calendar`

## Exit Points

- Click log entry → `/user/workout-logs/:id`
- Click workout name in upcoming list → `/user/workouts/:id`
- "Start Workout" button → `/user/workouts`

---

## Technical Details

### Component

- **Route**: `/user/calendar`
- **Component**: `CalendarPageComponent`
- **File**: `apps/app/src/app/routes/user/calendar.ts`

### Stores Used

| Store                  | Purpose                            |
| ---------------------- | ---------------------------------- |
| `WorkoutLogsStore`     | Past workout logs                  |
| `WorkoutScheduleStore` | Upcoming schedules and their dates |
| `UserWorkoutsStore`    | Workout names and details          |

### Computed Properties

```typescript
// Calendar entries with logs and filtered schedules
readonly calendarEntries = computed((): CalendarEntry[] => {
  // Combines logs + schedules filtered by existing logs
});

// Upcoming schedules with filtered dates
readonly upcomingSchedules = computed((): UpcomingScheduleDisplay[] => {
  // Groups by schedule, filters fulfilled dates
});

// Recent logs (last 10)
readonly recentLogs = computed(() => {
  return logsStore.logs().slice(0, 10);
});
```

### Store Integration

The `WorkoutScheduleStore` provides `upcomingScheduleInstances()` which:

- Generates all scheduled dates for the next 4 weeks
- Returns schedule + criteria days + upcoming dates
- Used by the Calendar page for consistent schedule logic

---

## Related Documentation

- [Calendar Component](../../components/calendar.md) - Reusable calendar component
- [Workout Schedules](../schedules/README.md) - Schedule management
- [Workout Logs](../workout-logs/README.md) - Log details
- [My Workouts](../workouts/README.md) - Workout instances
