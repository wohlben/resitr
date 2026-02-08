# `/user/workouts/:id/run` - Run Workout

**Goal**: Execute a workout session with real-time tracking of exercises, sets, reps, and rest periods.

---

## Status

**Placeholder** - This page is currently under development. The route exists and is navigable from:

- Workout list action menu ("Start Workout")
- Workout detail page ("Start Workout" button)

---

## Planned Features

### Workout Execution Flow

1. **Pre-Workout Review**

   - Display workout structure
   - Show configured schemes for each exercise
   - Estimated duration
   - Start confirmation

2. **Active Session**

   - Exercise-by-exercise progression
   - Set/rep tracking with configured schemes
   - Timer for rest periods
   - Skip/adjust on the fly

3. **Real-Time Tracking**

   - Current exercise highlighted
   - Completed sets checkmarks
   - Rest countdown timer
   - Progress bar through workout

4. **Post-Workout Summary**
   - Total time
   - Exercises completed
   - Performance vs target
   - Option to log workout

---

## Navigation

### Entry Points

- **From List**: Action menu "Start Workout" on any workout card
- **From Detail**: "Start Workout" button in header

### Exit Points

- Cancel/Back → [`/user/workouts/:id`](./detail.md)
- Complete → `/user/workout-logs/:id` (future)

---

## Related Pages

- [Workout List](./list.md) - Browse and select workouts
- [Workout Detail](./detail.md) - View workout before starting
- [Workout Logs](../workout-logs.md) - View completed sessions
