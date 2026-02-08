# `/user/workouts/:id/run` - Run Workout

**Goal**: Create a workout plan with target goals for each exercise and start the workout session.

---

## Status

**Implemented** - Users can review their workout, adjust target values per exercise/set, and create a workout log to begin tracking.

---

## Features

### Plan Creation Interface

1. **Workout Overview**

   - Displays workout name and description
   - Shows all sections with color-coded headers:
     - 🔥 Warmup (orange)
     - 🧘 Stretching (purple)
     - 💪 Strength (blue)
     - ❄️ Cooldown (cyan)
   - Lists exercises within each section

2. **Exercise Target Configuration**

   - Each exercise card shows:
     - Exercise name and measurement type
     - Number of sets configured in scheme
     - Four target input fields: Reps, Weight, Time (s), Distance
     - Rest between sets and break after duration

3. **Lock/Unlock Toggle (🔒/🔓)**

   - **Locked Mode (Default)**: Single row of inputs applies to ALL sets
     - Any change updates all sets simultaneously
     - Efficient for exercises where all sets have same targets
   - **Unlocked Mode**: Individual row per set
     - Each set can have different targets
     - Click 🔓 to unlock, 🔒 to re-lock and sync

4. **Target Adjustments**

   - All input fields are optional - no validation enforced
   - Targets default to values from configured exercise schemes
   - Users can modify before starting

### Starting the Workout

- "Start Workout" button in header and sticky at bottom
- Creates a `WorkoutLog` via API with all target values
- Immediately navigates to [`/user/workout-logs/:id`](../workout-logs/detail.md)
- Toast notification confirms successful start

---

## Navigation

### Entry Points

- **From List**: Action menu "Start Workout" on any workout card
- **From Detail**: "Start Workout" button in header actions

### Exit Points

- Cancel/Back → [`/user/workouts/:id`](./detail.md)
- Start Workout → [`/user/workout-logs/:id`](../workout-logs/detail.md)

---

## Technical Details

- Fetches workout template and assigned schemes via `GET /api/user/exercise-scheme?userWorkoutId={id}`
- Builds plan state with default targets from schemes
- Uses reactive forms (ngModel) for target inputs
- Creates `UpsertWorkoutLogDto` and calls `PUT /api/user/workout-logs`
- No client-side validation on target values

---

## Related Pages

- [Workout List](./list.md) - Browse and select workouts
- [Workout Detail](./detail.md) - View workout before starting
- [Workout Logs Detail](../workout-logs/detail.md) - Active workout tracking page
- [Edit Schemes](./edit.md) - Configure exercise schemes before running
