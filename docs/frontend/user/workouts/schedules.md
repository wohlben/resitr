# `/user/workouts/:id/schedules` - Workout-Specific Schedule View

**Goal**: View and manage schedules filtered to a specific workout.

---

## Status

**Implemented**

---

## Overview

This is a **virtual/filtered view** of the schedules system. It displays the same weekly calendar as [`/user/schedules`](../schedules/list.md), but filtered to show only schedules for the specified workout.

All functionality, UI patterns, and behaviors documented in the [main schedules documentation](../schedules/) apply here, with the following differences:

---

## Differences from Main Schedules View

### Filtered Display

- Only shows schedules matching the workout template ID
- Page title includes workout name (e.g., "Push Workout Schedule")

### Navigation Context

- **Back button** returns to `/user/workouts/:id` (workout detail)
- **"Schedule Workout" button** pre-fills the workout in the create form

### Pre-selection

- Per-day "Schedule" buttons include `workoutTemplateId` in query params
- Create form opens with workout already selected

---

## Navigation

### Entry Points

- Workout card "Schedule" action
- Workout detail page

### Exit Points

- Back button → Workout detail (`/user/workouts/:id`)
- Schedule Workout → Create form with pre-selected workout (`/user/schedules/new?workoutTemplateId=xxx`)
- Click schedule → Schedule detail (`/user/schedules/:id`)

---

## Technical Details

- **Component**: `WorkoutScheduleComponent`
- **Route**: `/user/workouts/:id/schedules`
- **Stores**: `WorkoutScheduleStore`, `UserWorkoutsStore`
- **Filter**: By `workoutTemplateId` from workout

---

## Related Pages

- [All Schedules](../schedules/list.md) - Unfiltered schedules view
- [Create Schedule](../schedules/new.md) - Schedule creation form
- [Workout Detail](./detail.md) - Parent workout page
