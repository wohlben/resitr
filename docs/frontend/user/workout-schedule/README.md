# Workout Schedule

Calendar-based planning and management of upcoming workout sessions.

---

## Overview

The schedule allows users to:

- Plan workout sessions in advance
- View upcoming workouts in calendar format
- Track completion status
- Receive reminders for scheduled sessions

---

## Conceptual Model

### Scheduled Session

```
Scheduled Workout
├── Workout reference (which to perform)
├── Scheduled date/time
├── Duration estimate
├── Status (upcoming/in-progress/completed/cancelled)
└── Reminder settings
```

### Session Lifecycle

```
Scheduled ──> Upcoming ──> In Progress ──> Completed
    │              │             │
    │              │             └──> creates Workout Log
    │              └──> can Reschedule
    └──> can Cancel
```

---

## Relationship to Other Features

| Feature          | Relationship                                       |
| ---------------- | -------------------------------------------------- |
| **My Workouts**  | Schedules reference workouts to be performed       |
| **Workout Logs** | Completed schedules generate logs                  |
| **Workout Run**  | Starting a scheduled workout navigates to run mode |

---

## Implementation Status

| Component       | Status         | Notes                        |
| --------------- | -------------- | ---------------------------- |
| Schedule List   | 🚧 Placeholder | Empty component              |
| Schedule Detail | 🚧 Placeholder | Basic template only          |
| Calendar Views  | 🚧 Placeholder | Day/week/month views planned |
| Notifications   | 🚧 Planned     | Reminder system              |

---

## Related Documentation

- [Schedule List](./list.md) - Calendar view of planned sessions
- [Schedule Detail](./detail.md) - Manage specific scheduled session
- [My Workouts](../workouts/README.md) - Workouts that can be scheduled
- [Workout Logs](../workout-logs/README.md) - Completed sessions become logs
