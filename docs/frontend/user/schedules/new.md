# `/user/schedules/new` - Create Workout Schedule

**Goal**: Create a new workout schedule entry.

---

## Status

**Implemented**

---

## Features

### Form Fields

1. **Workout** (required)

   - Dropdown of user's workouts
   - Pre-selected if `workoutTemplateId` query param provided

2. **Day of Week** (required)

   - Visual button grid (Sun-Sat)
   - Pre-selected if `dayOfWeek` query param provided
   - Defaults to today

3. **Order** (optional)
   - Number input (0, 1, 2, ...)
   - Determines sequence for multiple workouts on same day
   - Defaults to 0

### Pre-selection via Query Params

- `?workoutTemplateId=xxx` - Pre-select workout
- `?dayOfWeek=n` - Pre-select day (0-6)
- `?workoutTemplateId=xxx&dayOfWeek=n` - Pre-select both

### Validation

- Workout must be selected
- Day must be selected (0-6)
- Shows inline error messages
- Submit button disabled until valid

### Actions

- **Schedule Workout** - Submit form
- **Cancel** - Return to schedules list

---

## Navigation

### Entry Points

- `/user/schedules` - Global "Schedule Workout" button
- `/user/schedules?dayOfWeek=n` - Day-specific "Schedule" button
- `/user/workouts/:id/schedules` - Pre-selected workout context

### Exit Points

- Success → `/user/schedules`
- Cancel → `/user/schedules`

---

## Technical Details

- Component: `CreateWorkoutScheduleComponent`
- Store: `WorkoutScheduleStore`
- Route: `/user/schedules/new`

---

## Related Pages

- [Schedules List](./list.md)
- [Workout-Specific Schedules](../workouts/schedules.md)
