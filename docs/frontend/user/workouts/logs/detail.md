# `/user/workouts/{workoutId}/logs/{logId}` - Workout Log Detail

**Goal**: Display detailed view of a completed workout session with exercise-by-exercise performance data.

---

## Status

**Placeholder** - Basic template implemented.

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

## Layout

```
┌────────────────────────────────────────┐
│ [Back to Logs]                         │
│                                        │
│ Push Day - Feb 8, 2026                 │
│ Duration: 45m | Status: Completed ✅   │
│                                        │
├────────────────────────────────────────┤
│                                        │
│ Bench Press                            │
│ Scheme: 3x8 @ 80%                      │
│ ┌────────────────────────────────┐     │
│ │ Set 1: 8 reps @ 60kg ✓         │     │
│ │ Set 2: 8 reps @ 60kg ✓         │     │
│ │ Set 3: 7 reps @ 60kg ⚠️        │     │
│ └────────────────────────────────┘     │
│                                        │
│ Squat                                  │
│ Scheme: 3x10 @ 70%                     │
│ ┌────────────────────────────────┐     │
│ │ Set 1: 10 reps @ 70kg ✓        │     │
│ │ Set 2: 10 reps @ 70kg ✓        │     │
│ │ Set 3: 10 reps @ 70kg ✓ 🏆     │     │
│ └────────────────────────────────┘     │
│                                        │
└────────────────────────────────────────┘
```

---

## Navigation

### Entry Points

- **From Logs List**: Click any log entry
- **From Run Complete**: Auto-redirect after finishing workout
- **Direct URL**: `/user/workouts/{workoutId}/logs/{logId}`

### Exit Points

- Back → `/user/workouts/{workoutId}/logs`
- View Workout → `/user/workouts/{workoutId}`

---

## Technical Details

### Component

- **Route**: `/user/workouts/:workoutId/logs/:logId`
- **Component**: `WorkoutLogDetail`
- **File**: `apps/app/src/app/routes/user/workouts/_workoutId/log-detail.ts`

### Route Parameters

| Parameter   | Type   | Description                  |
| ----------- | ------ | ---------------------------- |
| `workoutId` | string | ID of the user workout       |
| `logId`     | string | ID of the specific log entry |

---

## Related Documentation

- [Workout Logs](./README.md) - Overview of workout logs
- [Log List](./list.md) - List view of logs for a workout
- [Workout Detail](../detail.md) - Parent workout information
