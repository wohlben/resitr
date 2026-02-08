# Workout Logs

Workout history and performance tracking for a specific workout.

---

## Overview

Workout logs record each completed session of a specific workout, capturing:

- Date and duration of the session
- Exercise-by-exercise performance data
- Completion status (completed, in-progress, incomplete)
- Personal records and progress over time

---

## URL Structure

```
/user/workouts/{workoutId}/logs           → List of logs for a workout
/user/workouts/{workoutId}/logs/{logId}   → Detail view of a specific log
```

---

## Conceptual Model

### Log Structure

```
Workout Log
├── Workout reference (userWorkoutId)
├── Completion timestamp
├── Total duration
├── Exercise performances
│   ├── Exercise reference
│   ├── Scheme used
│   ├── Sets completed
│   └── Actual vs target metrics
└── Notes (optional)
```

### Data Flow

```
User completes workout
         │
         ▼
┌─────────────────────┐
│ Create Workout Log  │
│ - userWorkoutId     │
│ - timestamp         │
│ - performances[]    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Update Statistics   │
│ - Personal records  │
│ - Progress tracking │
└─────────────────────┘
```

---

## Relationship to Other Features

| Feature              | Relationship                                           |
| -------------------- | ------------------------------------------------------ |
| **My Workouts**      | Logs belong to a specific user workout instance        |
| **Calendar**         | Logs appear on the calendar with color-coded status    |
| **Workout Schedule** | Scheduled sessions become logs when completed          |
| **Exercise Schemes** | Logs capture actual performance against scheme targets |
| **Compendium**       | Exercise references link back to compendium data       |

---

## Implementation Status

| Component    | Status         | Notes                      |
| ------------ | -------------- | -------------------------- |
| Log List     | ✅ Complete    | List with calendar view    |
| Log Detail   | 🚧 Placeholder | Basic template             |
| Log Creation | ✅ Automatic   | Triggered from Run Workout |

---

## Navigation

Workout Logs are accessed through:

- **Workout Detail** - "View Logs" button for a specific workout
- **Calendar Page** - Click on completed workout entries
- **Direct URL** - `/user/workouts/{workoutId}/logs`

This design keeps logs scoped to the workout they belong to.

---

## Calendar Integration

The Workout Logs page uses the reusable [Calendar component](../../components/calendar.md) to provide a visual overview:

### Calendar Features

- **Monthly view** with navigation (previous/next month)
- **Color-coded entries**:
  - 🟢 **Green** - Completed workouts
  - 🟡 **Yellow** - Workouts in progress (started today)
  - 🔴 **Red** - Incomplete or aborted workouts
- **Click a day** to navigate to the first log for that date
- **Today's date** highlighted with blue ring

### Legend Configuration

```typescript
readonly calendarLegend = {
  green: 'Completed',
  yellow: 'Started (Today)',
  red: 'Incomplete/Aborted'
};
```

---

## Related Documentation

- [Log List](./list.md) - Browse completed sessions for a workout
- [Log Detail](./detail.md) - View specific session details
- [Calendar Component](../../components/calendar.md) - Reusable calendar component
- [Calendar Page](../../calendar/page.md) - Combined view of logs and schedules
- [My Workouts](../README.md) - Workout instances that generate logs
