# Workout-Specific Schedule Routes with Pre-selected Workout

## Summary

Added workout-specific routes for creating and editing schedules where the workout is pre-selected and unchangeable via the UI. This provides a better UX when users are already in a workout context.

## What Changed

### New Routes

1. **`/user/workouts/:id/schedules/new`** - Create schedule for specific workout

   - Workout is pre-selected from route param and displayed as read-only
   - Cannot change workout via dropdown (removed from UI)
   - Cancel returns to `/user/workouts/:id/schedules`

2. **`/user/workouts/:id/schedules/:scheduleId/edit`** - Edit schedule for specific workout
   - New edit component with workout displayed as read-only
   - Can modify day of week and order
   - Cancel returns to `/user/workouts/:id/schedules`

### Modified Navigation

- **Schedules List** (`/user/workouts/:id/schedules`):

  - "Schedule Workout" button now links to `./new` (relative, workout-specific)
  - Per-day "Schedule" buttons also use workout-specific route
  - Clicking schedule card now navigates to `./:id/edit` instead of `/user/schedules/:id`

- **Create Form** (`new.ts`):
  - Detects workout ID from route params
  - Shows read-only workout display instead of dropdown when in workout context
  - Back/Cancel button returns to appropriate schedules page

### New Component

- **`EditWorkoutScheduleComponent`** (`edit.ts`):
  - Standalone edit form for schedules
  - Workout shown as read-only text
  - Editable: day of week, order
  - Uses `UpdateUserWorkoutScheduleDto` from API

## Affected Documentation

### Files to Update

1. **`docs/frontend/user/schedules/README.md`**

   - Update "Route Structure" section to include new workout-specific routes:
     ```
     /user/workouts/:id/schedules/new          → Create schedule (workout pre-selected)
     /user/workouts/:id/schedules/:scheduleId/edit → Edit schedule (workout read-only)
     ```
   - Update "Implementation Status" table - mark Edit as ✅

2. **`docs/frontend/user/schedules/new.md`**

   - Add "Workout-Specific Route" section documenting `/user/workouts/:id/schedules/new`
   - Update "Pre-selection" section to mention both query params AND route params
   - Update "Entry Points" to include workout-specific schedules list
   - Update "Exit Points" - success/cancel now returns to workout-specific route when applicable
   - Update "Technical Details" - mention it handles both routes

3. **`docs/frontend/user/schedules/list.md`**

   - Update "Exit Points" section:
     - From workout-specific view: Click schedule → `./:id/edit`
     - From workout-specific view: Schedule button → `./new?dayOfWeek=n`

4. **`docs/frontend/user/workouts/schedules.md`**
   - Update "Pre-selection" section - now uses route params not query params
   - Update "Exit Points" section:
     - Schedule Workout → `./new` (not `/user/schedules/new?workoutTemplateId=xxx`)
     - Click schedule → `./:scheduleId/edit` (not `/user/schedules/:id`)
   - Update "Differences from Main Schedules View" - mention edit route

### Files to Create

5. **`docs/frontend/user/schedules/edit.md`** (new file)
   Document the new edit functionality:
   - Route: `/user/schedules/:id/edit` and `/user/workouts/:id/schedules/:scheduleId/edit`
   - Features: Edit day of week, order; workout is read-only
   - Navigation: Entry from schedules list, exit to appropriate list
   - Technical: `EditWorkoutScheduleComponent`, `WorkoutScheduleStore.updateSchedule()`

## Migration Notes

The old query param approach (`?workoutTemplateId=xxx`) still works for backward compatibility when accessing `/user/schedules/new` directly, but the preferred approach from workout context is now the route-based `/user/workouts/:id/schedules/new`.

## Testing Checklist

- [ ] Navigate from `/user/workouts/:id/schedules` → "Schedule Workout" → workout is pre-selected
- [ ] From workout-specific new route, workout dropdown is not visible (read-only display instead)
- [ ] Cancel from workout-specific new route returns to `/user/workouts/:id/schedules`
- [ ] Click schedule card from workout-specific list goes to edit route
- [ ] Edit form shows workout as read-only
- [ ] From global `/user/schedules`, navigation still works as before (with query params)
