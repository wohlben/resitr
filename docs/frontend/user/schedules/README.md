# Workout Schedules

Weekly workout planning and schedule management with multi-day support.

---

## Overview

Schedules allow users to plan their weekly workout routine by assigning workouts to specific days of the week. Each schedule links to a **user workout** (not a workout template) and can have multiple "criteria" that define when the workout should occur.

### Multi-Day Support

Unlike the previous implementation that only allowed one day per workout, the new criteria-based system supports:

- **Multiple days per workout** - Schedule a workout for Monday, Wednesday, and Friday
- **Flexible criteria types** - Currently supports "Day of Week", extensible for future types (specific dates, intervals, etc.)
- **Prioritization** - Each criteria has an order field for prioritization

### Calendar Integration

Schedules are now viewed through the **[Calendar page](../calendar/page.md)** which provides:

- **Unified view** - See both past workouts and upcoming schedules together
- **Monthly calendar** - More intuitive than the old weekly grid
- **Color coding** - Purple dots indicate planned workouts
- **Full history** - Completed workouts shown alongside scheduled ones

---

## Route Structure

```
/user/calendar                      → View schedules in calendar (replaces /user/schedules)
/user/schedules/new                 → Create new schedule
/user/schedules/:id                 → Schedule detail (manage criteria)
/user/workouts/:id/schedules        → Redirects to calendar
```

---

## Domain Relationship

### Schedule Hierarchy

```
WorkoutSchedule (1) → UserWorkout (1)
  └── Criteria (*)
        └── DaysOfWeek (*)
```

- **Schedule** references one **user workout** (1:1 relationship - one schedule per user workout)
- **Criteria** belongs to one schedule, has a type and order
- **DaysOfWeek** belongs to one criteria, defines which days (0-6)

### Key Behaviors

- Each user workout can have at most one schedule
- Each schedule can have multiple criteria (different day combinations)
- Deleting a user workout cascades to its schedule (via foreign key)
- Deleting a schedule cascades to its criteria

---

## Implementation Status

| Component     | Status | Location              | Notes                             |
| ------------- | ------ | --------------------- | --------------------------------- |
| Calendar View | ✅     | `/user/calendar`      | Unified logs + schedules view     |
| Create        | ✅     | `/user/schedules/new` | Form for creating schedules       |
| Detail        | ✅     | `/user/schedules/:id` | View and manage schedule criteria |
| List (Old)    | ❌     | Removed               | Replaced by calendar view         |

---

## Data Structure

### WorkoutSchedule

```typescript
{
  id: string;
  userId: string;
  userWorkoutId: string;  // References user_workouts.id
  criteria: WorkoutScheduleCriteria[];
  createdAt: string;
  updatedAt: string | undefined;
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
  - Body: `{ userWorkoutId: string }`
- `GET /user/workout-schedule[?dayOfWeek=n]` - List schedules with criteria
- `GET /user/workout-schedule/:id` - Get single schedule with criteria
- `DELETE /user/workout-schedule/:id` - Delete schedule (cascades to criteria)

### Criteria

- `POST /user/workout-schedule/:id/criteria` - Add day criteria
- `GET /user/workout-schedule/:id/criteria` - List criteria for schedule
- `PUT /user/workout-schedule/:id/criteria/:criteriaId` - Update criteria (full replacement)
- `DELETE /user/workout-schedule/:id/criteria/:criteriaId` - Remove criteria

---

## Viewing Schedules

### Primary Interface: Calendar Page

The **[Calendar page](../calendar/page.md)** at `/user/calendar` is now the main way to view schedules:

- Shows upcoming scheduled workouts in the "Upcoming Workouts" panel
- Displays scheduled workouts as purple dots on the monthly calendar
- Combines with past workout logs for complete workout history

**Why the change?**

The old weekly grid (`/user/schedules`) only showed when workouts were scheduled, but not whether they were actually completed. The Calendar page provides:

1. **Context** - See planned vs. completed workouts
2. **Better UX** - Monthly view is more standard
3. **Unified interface** - One place for planning and history

### Legacy Route Behavior

Routes that previously showed the weekly schedule grid now redirect:

- `/user/schedules` → `/user/calendar`
- `/user/workouts/:id/schedules` → `/user/calendar`

---

## Creating and Editing

Creating and editing schedules still uses dedicated forms:

- **Create**: `/user/schedules/new` (or from workout detail)
- **Edit Criteria**: `/user/schedules/:id` - Manage schedule criteria

These workflows remain unchanged.

---

## Related Documentation

- [Calendar Page](../calendar/page.md) - **Primary schedule viewing interface**
- [Create Schedule](./new.md) - Form for creating new schedules
- [Schedule Detail](./detail.md) - View and manage schedule criteria
- [Workout Schedules](../workouts/schedules.md) - Workout-specific schedule documentation (deprecated)
- [Calendar Component](../../components/calendar.md) - Reusable calendar component
