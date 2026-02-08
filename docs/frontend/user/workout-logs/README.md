# Workout Logs

Personal history of completed workout sessions with performance tracking.

---

## Overview

Workout logs record each completed workout session, capturing:

- Which workout was performed
- Date and duration of the session
- Exercise-by-exercise performance data
- Personal records and progress over time

---

## Conceptual Model

### Log Structure

```
Workout Log
├── Workout reference (which template/instance)
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
│ - workoutId         │
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
| **My Workouts**      | Logs reference the workout instance that was performed |
| **Workout Schedule** | Scheduled sessions become logs when completed          |
| **Exercise Schemes** | Logs capture actual performance against scheme targets |
| **Compendium**       | Exercise references link back to compendium data       |

---

## Implementation Status

| Component    | Status         | Notes                      |
| ------------ | -------------- | -------------------------- |
| Log List     | 🚧 Placeholder | Empty component            |
| Log Detail   | 🚧 Placeholder | Basic template only        |
| Log Creation | 🚧 Placeholder | Triggered from Run Workout |

---

## Related Documentation

- [Log List](./list.md) - Browse completed sessions
- [Log Detail](./detail.md) - View specific session
- [My Workouts](../workouts/README.md) - Workout instances that generate logs
