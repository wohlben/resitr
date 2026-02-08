# Workout Schedules

Weekly workout planning and schedule management.

---

## Overview

Schedules allow users to plan their weekly workout routine by assigning workouts to specific days of the week.

---

## Route Structure

```
/user/schedules                    → All schedules overview
/user/schedules/new               → Create new schedule
/user/schedules/:id               → Schedule detail/edit
/user/workouts/:id/schedules      → Schedules for specific workout
```

---

## Domain Relationship

Schedules are **primary entities** that reference workouts (n:1 relationship):

- Many schedules can reference the same workout
- A schedule defines when (day of week) and in what order a workout should be performed
- Deleting a workout does not automatically delete its schedules

---

## Implementation Status

| Component      | Status | Location                            |
| -------------- | ------ | ----------------------------------- |
| List (All)     | ✅     | `/user/schedules`                   |
| List (Workout) | ✅     | `/user/workouts/:id/schedules`      |
| Create         | ✅     | `/user/schedules/new`               |
| Detail         | 🚧     | `/user/schedules/:id` (placeholder) |

---

## Related Documentation

- [List All Schedules](./list.md) - Overview of all workout schedules
- [Create Schedule](./new.md) - Form for creating new schedules
- [Schedule Detail](./detail.md) - View/edit specific schedule
- [Workout Schedules](../workouts/schedules.md) - Workout-specific schedule view
