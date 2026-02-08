# `/user/calendar` - Workout Calendar

**Goal**: Provide a unified monthly calendar view showing both past workouts and upcoming scheduled workouts.

---

## Status

**Implemented**

---

## Overview

The Calendar page replaces the old weekly schedule grid with a comprehensive monthly view that combines:

- **Past Workouts** - From workout logs (completed, in-progress, incomplete)
- **Upcoming Schedules** - Planned workouts from schedule criteria

This gives users a complete picture of their workout history and upcoming plans in one interface.

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
│  │ Push Day              Planned  │    │   │  < Feb >    │   │
│  │ Monday/Wednesday/Friday        │    │   │ S M T W T F S│   │
│  ├────────────────────────────────┤    │   │ 1 2 3 4 5 6 7│   │
│  │ Leg Day               Planned  │    │   │ 8 9...      │   │
│  │ Tuesday/Thursday               │    │   └─────────────┘   │
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

Shows scheduled workouts for the next few weeks, sorted by upcoming days:

- **Workout name** - Links to workout detail
- **Scheduled days** - Which days of the week (e.g., "Mondays")
- **"Planned" indicator** - Purple dot with label
- Shows up to 5 upcoming schedules

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

---

## Data Sources

### Past Workouts (Logs)

```typescript
// From WorkoutLogsStore
for (const log of logsStore.logs()) {
  entries.push({
    on: new Date(log.startedAt),
    type: log.completedAt ? 'green' : isStartedToday(log) ? 'yellow' : 'red',
    name: log.name,
  });
}
```

### Upcoming Schedules

```typescript
// From WorkoutScheduleStore - generates next 4 weeks
for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
  for (const schedule of schedulesStore.schedules()) {
    // Calculate dates based on criteria days
    entries.push({
      on: scheduleDate,
      type: 'purple',
      name: workoutName,
    });
  }
}
```

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

- **Main navigation** - "Calendar" link
- **Workout detail** - "Schedule" action (redirects here)
- **Direct URL** - `/user/calendar`

## Exit Points

- Click log entry → `/user/workout-logs/:id`
- Click workout name → `/user/workouts/:id`
- "Start Workout" button → `/user/workouts`

---

## Technical Details

### Component

- **Route**: `/user/calendar`
- **Component**: `CalendarPageComponent`
- **File**: `apps/app/src/app/routes/user/calendar.ts`

### Stores Used

| Store                  | Purpose                     |
| ---------------------- | --------------------------- |
| `WorkoutLogsStore`     | Past workout logs           |
| `WorkoutScheduleStore` | Upcoming scheduled workouts |
| `UserWorkoutsStore`    | Workout names and details   |

### Computed Properties

```typescript
// Calendar entries combining logs and schedules
readonly calendarEntries = computed((): CalendarEntry[] => {
  // Merges logs + generated schedule entries
});

// Upcoming schedules sorted by next occurrence
readonly upcomingSchedules = computed(() => {
  // Sorts by days from today
});

// Recent logs (last 10)
readonly recentLogs = computed(() => {
  return logsStore.logs().slice(0, 10);
});
```

---

## Route Migration

### From Old Routes

| Old Route                      | New Route        | Behavior              |
| ------------------------------ | ---------------- | --------------------- |
| `/user/schedules`              | `/user/calendar` | Direct replacement    |
| `/user/workouts/:id/schedules` | `/user/calendar` | Redirects to calendar |

### Why Changed

The weekly grid view (`/user/schedules`) only showed schedules without context of completed workouts. The new calendar view provides:

- **Better context** - See what you actually did vs. what was planned
- **Unified interface** - One place for workout history and planning
- **Monthly view** - More standard calendar paradigm
- **Reusable component** - Calendar component can be used elsewhere

---

## Related Documentation

- [Calendar Component](../../components/calendar.md) - Reusable calendar component details
- [Workout Schedules](../schedules/README.md) - Schedule management (create/edit)
- [Workout Logs](../workout-logs/README.md) - Log detail view
- [My Workouts](../workouts/README.md) - Workout instances
