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
- Schedules appear on all days they are configured for

### Schedule Cards

- Workout name
- **Scheduled days** displayed as comma-separated list (e.g., "Mon, Wed, Fri")
- Hover reveals delete button
- Click navigates to schedule detail for criteria management

### Quick Actions

- Global **"Schedule Workout"** button → Create schedule with no pre-selection
- (Removed: Per-day schedule buttons - now only accessible from detail view)

---

## How Schedules are Grouped

Schedules are grouped by day based on their criteria:

```typescript
// Schedule with criteria for Mon/Wed/Fri appears on all three days
{
  id: 'schedule-1',
  userWorkoutId: 'user-workout-abc',  // References user_workouts.id
  criteria: [
    { type: 'DAY_OF_WEEK', days: [1, 3, 5], order: 0 }
  ]
}
```

The `schedulesByDay` computed property aggregates schedules across all criteria days.

---

## Navigation

### Entry Points

- Main navigation menu
- Workout card "Schedule" action (goes to workout-specific view first)

### Exit Points

- Click schedule card → `/user/schedules/:id` (detail view)
- Schedule button → `/user/schedules/new`

---

## Technical Details

- Component: `SchedulesListComponent`
- Store: `WorkoutScheduleStore`
- Route: `/user/schedules`
- Key computed: `schedulesByDay` - Map<dayIndex, Schedule[]>
- Filtering: By `userWorkoutId` to show only schedules for a specific workout

---

## Related Pages

- [Create Schedule](./new.md)
- [Schedule Detail](./detail.md)
- [Workout-Specific Schedules](../workouts/schedules.md)
