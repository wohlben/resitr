# `/user/schedules` - All Workout Schedules

**Goal**: Display all workout schedules across all workouts in a weekly calendar view.

---

## Status

**Implemented**

---

## Features

### Weekly Calendar Grid

- 7-column layout (Sunday through Saturday)
- Today's column highlighted in blue
- Each day displays scheduled workouts
- Order indicator for multiple workouts per day

### Schedule Cards

- Workout name
- Order number (for sequencing)
- Hover reveals delete button
- Click navigates to schedule detail

### Quick Actions

- Per-day "Schedule" button → Create schedule for that day
- Global "Schedule Workout" button → Create schedule with no pre-selection

---

## Navigation

### Entry Points

- Main navigation menu
- Workout card "Schedule" action (goes to workout-specific view first)

### Exit Points

- Click schedule card → `/user/schedules/:id`
- Schedule button → `/user/schedules/new?dayOfWeek=n`
- Global Schedule button → `/user/schedules/new`

---

## Technical Details

- Component: `SchedulesListComponent`
- Store: `WorkoutScheduleStore`
- Route: `/user/schedules`

---

## Related Pages

- [Create Schedule](./new.md)
- [Schedule Detail](./detail.md)
- [Workout-Specific Schedules](../workouts/schedules.md)
