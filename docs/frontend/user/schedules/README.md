# Workout Schedules

Weekly workout planning and schedule management with multi-day support.

---

## Overview

Schedules allow users to plan their weekly workout routine by assigning workouts to specific days of the week. Each schedule can have multiple "criteria" that define when the workout should occur.

### Multi-Day Support

Unlike the previous implementation that only allowed one day per workout, the new criteria-based system supports:

- **Multiple days per workout** - Schedule a workout for Monday, Wednesday, and Friday
- **Flexible criteria types** - Currently supports "Day of Week", extensible for future types (specific dates, intervals, etc.)
- **Prioritization** - Each criteria has an order field for prioritization

---

## Route Structure

```
/user/schedules                    → All schedules overview
/user/schedules/new               → Create new schedule
/user/schedules/:id               → Schedule detail (manage criteria)
/user/workouts/:id/schedules      → Schedules for specific workout
```

---

## Domain Relationship

### Schedule Hierarchy

```
WorkoutSchedule (1)
  └── Criteria (*)
        └── DaysOfWeek (*)
```

- **Schedule** references one workout (many schedules can reference the same workout)
- **Criteria** belongs to one schedule, has a type and order
- **DaysOfWeek** belongs to one criteria, defines which days (0-6)

### Key Behaviors

- A workout can be scheduled multiple times (different schedules)
- Each schedule can have multiple criteria (different day combinations)
- Deleting a workout cascades to its schedules (via foreign key)
- Deleting a schedule cascades to its criteria

---

## Implementation Status

| Component      | Status | Location                       |
| -------------- | ------ | ------------------------------ |
| List (All)     | ✅     | `/user/schedules`              |
| List (Workout) | ✅     | `/user/workouts/:id/schedules` |
| Create         | ✅     | `/user/schedules/new`          |
| Detail         | ✅     | `/user/schedules/:id`          |

---

## Data Structure

### WorkoutSchedule

```typescript
{
  id: string;
  userId: string;
  workoutTemplateId: string;
  criteria: WorkoutScheduleCriteria[];
  createdAt: string;
  updatedAt?: string;
}
```

### WorkoutScheduleCriteria

```typescript
{
  id: string;
  scheduleId: string;
  type: 'DAY_OF_WEEK';  // Extensible for future types
  order: number;        // Priority/order
  days: number[];       // [1, 3, 5] for Mon/Wed/Fri
}
```

---

## API Endpoints

### Schedules

- `POST /user/workout-schedule` - Create schedule (returns schedule with empty criteria)
- `GET /user/workout-schedule[?dayOfWeek=n]` - List schedules with criteria
- `GET /user/workout-schedule/:id` - Get single schedule with criteria
- `DELETE /user/workout-schedule/:id` - Delete schedule (cascades to criteria)

### Criteria

- `POST /user/workout-schedule/:id/criteria` - Add day criteria
- `GET /user/workout-schedule/:id/criteria` - List criteria for schedule
- `PUT /user/workout-schedule/:id/criteria/:criteriaId` - Update criteria (full replacement)
- `DELETE /user/workout-schedule/:id/criteria/:criteriaId` - Remove criteria

---

## Related Documentation

- [List All Schedules](./list.md) - Overview of all workout schedules
- [Create Schedule](./new.md) - Form for creating new schedules
- [Schedule Detail](./detail.md) - View and manage schedule criteria
- [Workout Schedules](../workouts/schedules.md) - Workout-specific schedule view
