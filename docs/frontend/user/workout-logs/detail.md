# `/user/workout-logs/:id` - Workout Log Detail

**Goal**: Display detailed view of a completed workout session with exercise-by-exercise performance data.

---

## Status

**Placeholder** - This page is currently under development.

---

## Planned Features

### Session Overview

- Workout name and completion timestamp
- Total session duration
- Overall completion percentage
- Weather/notes (if captured)

### Exercise Performance

For each exercise in the workout:

- Exercise name and scheme used
- Target vs actual performance:
  - Sets completed
  - Reps/weight/distance achieved
  - Rest times taken
- Performance indicators:
  - ✅ Met target
  - ⚠️ Below target
  - 🏆 Personal record

### Comparison Features

- Compare to previous attempts of same workout
- Show progress over time
- Highlight improvements

---

## Navigation

### Entry Points

- **From Logs List**: Click any log entry
- **From Run Complete**: Auto-redirect after finishing workout

### Exit Points

- Back → `/user/workout-logs`
- View Workout → [`/user/workouts/:id`](./workouts/detail.md)

---

## Related Pages

- [Workout Logs](./workout-logs.md) - List all completed sessions
- [Workout Detail](./workouts/detail.md) - View workout template
