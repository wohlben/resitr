# Workout Schedules

Weekly workout planning and schedule management with multi-day support.

---

## Overview

Schedules allow users to plan their weekly workout routine by assigning workouts to specific days of the week. Each schedule links to a **user workout** (not a workout template) and can have multiple "criteria" that define when the workout should occur.

### Multi-Day Support

The criteria-based system supports:

- **Multiple days per workout** - Schedule a workout for Monday, Wednesday, and Friday
- **Flexible criteria types** - Currently supports "Day of Week", extensible for future types (specific dates, intervals, etc.)
- **Prioritization** - Each criteria has an order field for prioritization

### Calendar Integration

Schedules are viewed and managed through the **[Calendar page](../calendar/page.md)** which provides:

- **Unified view** - See both past workouts and upcoming schedules together
- **Monthly calendar** - Standard monthly calendar paradigm
- **Color coding** - Purple dots indicate planned workouts
- **Smart filtering** - Scheduled dates that already have logs are hidden

---

## Route Structure

```
/user/calendar                      → View schedules in calendar
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

The **[Calendar page](../calendar/page.md)** at `/user/calendar` is the main way to view schedules:

- Shows upcoming scheduled workouts in the "Upcoming Workouts" panel
- Displays scheduled workouts as purple dots on the monthly calendar
- Filters out dates that already have logs for that workout
- Combines with past workout logs for complete workout history

### Schedule Display Format

In the Calendar page, each schedule appears as:

```
[WorkoutName]    [Monday, Wednesday]    [9.2., 11.2.]
```

- **Workout name** - The scheduled workout
- **Scheduled days** - Days of the week from all criteria
- **Upcoming dates** - Next 4 dates when scheduled (excluding completed ones)

---

## Creating and Editing

Creating and editing schedules uses dedicated forms:

- **Create**: `/user/schedules/new` (or from workout detail)
- **Edit Criteria**: `/user/schedules/:id` - Manage schedule criteria

---

## Store Integration

The `WorkoutScheduleStore` provides centralized schedule logic:

```typescript
// Get upcoming schedule instances with their dates
readonly upcomingScheduleInstances = computed(() => {
  // Returns schedules with criteria days and upcoming dates
  // Filters out today and past dates
  // Generates next 4 weeks of scheduled dates
});
```

This computed property is used by the Calendar page for consistent schedule date generation.

---

## Related Documentation

- [Calendar Page](../calendar/page.md) - **Primary schedule viewing interface**
- [Create Schedule](./new.md) - Form for creating new schedules
- [Schedule Detail](./detail.md) - View and manage schedule criteria
- [Calendar Component](../../components/calendar.md) - Reusable calendar component
