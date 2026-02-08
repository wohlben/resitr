# `/user/workouts/{workoutId}/logs` - Workout Logs List

**Goal**: Display history of completed workout sessions for a specific workout with calendar view and progress tracking.

---

## Status

**Implemented**

---

## Features

### Log List

- Chronological list of completed workouts for the specific workout
- Each log shows:
  - Workout name
  - Date and time completed
  - Duration (if completed)
  - Status indicator (completed, in-progress, incomplete)
- Click to view log detail

### Calendar View

- Monthly calendar showing all logs for this workout
- Color-coded entries:
  - 🟢 **Green** - Completed workouts
  - 🟡 **Yellow** - In progress (started today)
  - 🔴 **Red** - Incomplete or aborted
- Click a day to navigate to the log for that date

### Empty State

When no logs exist:

- Display message: "No workout logs found"
- Provide "Start This Workout" button to begin a new session

---

## Layout

```
┌────────────────────────────────────────┬─────────────────────┐
│ Left Column (2/3)                      │ Right Column (1/3)  │
├────────────────────────────────────────┼─────────────────────┤
│                                        │                     │
│  [Back to Workout]                     │   Calendar          │
│                                        │   ┌─────────────┐   │
│  Workout Name - Logs                   │   │  < Feb >    │   │
│                                        │   │ S M T W T F S│   │
│  ┌────────────────────────────────┐    │   │ 1 2 3 4 5 6 7│   │
│  │ Push Day            Completed  │    │   │ 8 9...      │   │
│  │ Feb 8, 2026 10:30 AM           │    │   └─────────────┘   │
│  │ Duration: 45m                  │    │                     │
│  ├────────────────────────────────┤    │   Legend            │
│  │ Leg Day             Incomplete │    │   🟢 Completed      │
│  │ Feb 7, 2026 9:00 AM            │    │   🟡 In Progress    │
│  │                                │    │   🔴 Incomplete     │
│  └────────────────────────────────┘    │                     │
│                                        │                     │
└────────────────────────────────────────┴─────────────────────┘
```

---

## Navigation

### Entry Points

- **Workout Detail** - "View Logs" button
- **Calendar Page** - Click on completed workout dot
- **Direct URL** - `/user/workouts/{workoutId}/logs`

### Exit Points

- Click log entry → `/user/workouts/{workoutId}/logs/{logId}`
- "Back to Workout" button → `/user/workouts/{workoutId}`
- "Start This Workout" button → `/user/workouts/{workoutId}/run`

---

## Technical Details

### Component

- **Route**: `/user/workouts/:workoutId/logs`
- **Component**: `WorkoutLogsComponent`
- **File**: `apps/app/src/app/routes/user/workouts/_workoutId/logs.ts`

### Route Parameters

| Parameter   | Type   | Description            |
| ----------- | ------ | ---------------------- |
| `workoutId` | string | ID of the user workout |

### Stores Used

| Store               | Purpose                          |
| ------------------- | -------------------------------- |
| `WorkoutLogsStore`  | Load and manage logs for workout |
| `UserWorkoutsStore` | Get workout name and details     |

---

## Related Documentation

- [Workout Logs Overview](./README.md)
- [Log Detail](./detail.md)
- [Workout Detail](../detail.md)
