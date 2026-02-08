# Bug Fix: Workout Pre-selection in Schedule Form

**Date**: 2026-02-08
**Status**: Fixed

## What Changed

Fixed a timing issue in `CreateWorkoutScheduleComponent` (`apps/app/src/app/routes/user/schedules/new.ts`) where the workout was not being pre-selected/read-only when navigating from a workout-specific schedule page.

### Problem

When clicking "Schedule Workout" on `/user/workouts/:id/schedules`, the workout dropdown was shown instead of the expected read-only workout name.

### Root Cause

The constructor attempted to look up the workout template ID from `userWorkoutsStore.enrichedWorkouts()`, but the store data hadn't loaded yet, causing the lookup to return `undefined`.

### Solution

Replaced one-time constructor initialization with reactive computed signals:

- `isWorkoutPreselected()` - Now reactively checks if workout data is available in store
- `preselectedWorkoutTemplateId()` - Computed signal deriving template ID from selected workout
- Template uses `[ngModel]="preselectedWorkoutTemplateId()"` for hidden input
- Updated validation and submit to use preselected values when available

## Affected Documentation

- `docs/frontend/user/schedules/new.md` - Should clarify route-based pre-selection behavior
- `docs/frontend/user/workouts/schedules.md` - Should mention read-only workout display

## Suggested Doc Updates

### In `docs/frontend/user/schedules/new.md`:

Update the **Workout** field description (line 17-20) to clarify both pre-selection methods:

```markdown
1. **Workout** (required)
   - Dropdown of user's workouts (when accessed via `/user/schedules/new`)
   - Read-only display with workout name (when accessed via `/user/workouts/:id/schedules/new`)
   - Pre-selected via query param `?workoutTemplateId=xxx` or route parameter
```

Add section after "Pre-selection via Query Params":

```markdown
### Route-Based Pre-selection

When accessed from a workout-specific context (`/user/workouts/:id/schedules/new`):

- Workout appears as read-only text (not a dropdown)
- Uses route parameter `:id` to identify the workout
- Works reactively - displays correctly once workout data loads
```

### In `docs/frontend/user/workouts/schedules.md`:

Ensure it mentions the read-only workout display when scheduling from this context.

## Technical Notes

- The fix ensures the UI reacts to store data loading after component initialization
- No breaking changes to existing behavior
- Query param pre-selection (`?workoutTemplateId=xxx`) continues to work as before
