# `/user/schedules/new` - Create Workout Schedule

**Goal**: Create a new workout schedule with day criteria.

---

## Status

**Implemented**

---

## Features

### Form Fields

1. **Workout** (required)

   - Dropdown of user's workouts
   - Pre-selected if `workoutTemplateId` query param provided

2. **Schedule Type**

   - Radio card selection (currently only "Day of Week")
   - Always pre-selected and disabled
   - Foundation for future schedule types (dates, intervals)

3. **Days of Week** (required)

   - Visual button grid (Sun-Sat) with **multi-select**
   - Pre-selected if `dayOfWeek` query param provided (defaults to today)
   - Click to toggle selection
   - At least one day must be selected
   - Multiple days can be selected (e.g., Mon/Wed/Fri)

### Pre-selection via Query Params

- `?workoutTemplateId=xxx` - Pre-select workout
- `?dayOfWeek=n` - Pre-select single day (0-6)
- `?workoutTemplateId=xxx&dayOfWeek=n` - Pre-select both

### Validation

- Workout must be selected
- At least one day must be selected
- Shows inline error messages
- Submit button disabled until valid

### Actions

- **Schedule Workout** - Submit form (creates schedule + criteria)
- **Cancel** - Return to schedules list

---

## How It Works

Creating a schedule involves two API calls:

1. **Create Schedule** - `POST /user/workout-schedule`

   - Payload: `{ workoutTemplateId: string }`
   - Returns: Schedule with empty criteria array

2. **Create Criteria** - `POST /user/workout-schedule/:id/criteria`
   - Payload: `{ type: 'DAY_OF_WEEK', days: number[] }`
   - Returns: Criteria with days array

The store handles both calls automatically.

---

## Navigation

### Entry Points

- `/user/schedules` - Global "Schedule Workout" button
- `/user/workouts/:id/schedules` - Pre-selected workout context

### Exit Points

- Success → `/user/schedules`
- Cancel → `/user/schedules`

---

## Technical Details

- Component: `CreateWorkoutScheduleComponent`
- Store: `WorkoutScheduleStore`
- Route: `/user/schedules/new`
- Types: `CreateWorkoutScheduleDto`, `CreateWorkoutScheduleCriteriaDto`

---

## Related Pages

- [Schedules List](./list.md)
- [Schedule Detail](./detail.md)
- [Workout-Specific Schedules](../workouts/schedules.md)
