# Workout Schedule Routing Refactor

**Date**: 2026-02-08
**Type**: Refactoring
**Status**: ✅ Complete

## Summary

Refactored workout schedule routing to better reflect the domain relationship where schedules are primary entities that reference workouts (schedules:workouts n:1), rather than the inverse.

## Changes Made

### Route Structure

**Before:**

- `/user/workout-schedule` - List all schedules
- `/user/workout-schedule/create` - Create new schedule
- `/user/workout-schedule/:id` - View/edit schedule

**After:**

- `/user/workouts/:id/schedules` - View schedules for specific workout
- `/user/schedules` - List all schedules (overview)
- `/user/schedules/new` - Create new schedule
- `/user/schedules/:id` - View/edit specific schedule

### Files Changed

#### New Files:

1. `apps/app/src/app/routes/user/schedules/index.ts` - All schedules overview
2. `apps/app/src/app/routes/user/schedules/new.ts` - Create schedule form
3. `apps/app/src/app/routes/user/schedules/[scheduleId].ts` - Schedule detail
4. `apps/app/src/app/routes/user/workouts/_workoutId/schedules.ts` - Workout-specific schedules

#### Updated Files:

1. `apps/app/src/app/app.routes.ts` - Updated route definitions
2. `apps/app/src/app/routes/user/workouts.ts` - Updated navigation to use new routes
3. `apps/app/src/app/components/ui/buttons/button.component.ts` - Added queryParams support

#### Deleted Files:

- `apps/app/src/app/routes/user/workout-schedule.ts`
- `apps/app/src/app/routes/user/workout-schedule-detail.ts`
- `apps/app/src/app/routes/user/workout-schedule-create.ts`

### Key Improvements

1. **Proper RESTful Structure**:

   - Workouts "have" schedules: `/user/workouts/:id/schedules`
   - Schedules are standalone resources: `/user/schedules/:id`

2. **Better UX Flow**:

   - "Schedule" button on workout → `/user/workouts/:id/schedules`
   - Shows only that workout's schedule with pre-selected context
   - Back button returns to workout detail

3. **Flexible Creation**:

   - Can create schedule from workout context (pre-selected)
   - Can create schedule from overview (manual selection)
   - Query params support pre-selection: `?workoutTemplateId=xxx&dayOfWeek=n`

4. **Centralized Overview**:
   - `/user/schedules` shows all schedules across all workouts
   - Useful for getting complete weekly picture

### Navigation Updates

**Workout Card "Schedule" Action:**

- Navigates to `/user/workouts/:workoutId/schedules`
- Shows filtered view for that specific workout

**Schedule Creation:**

- From workout context: Pre-fills workout
- From overview: Manual workout selection
- From day button: Pre-fills day of week

### Query Parameters

All routes support these query params:

- `workoutTemplateId`: Pre-select workout in forms
- `dayOfWeek`: Pre-select day (0-6) in forms

### Button Component Enhancement

Added `queryParams` input to `ButtonComponent`:

```typescript
queryParams = input<Record<string, any> | null>(null);
```

This allows passing query parameters when using button links:

```html
<app-button link="/user/schedules/new" [queryParams]="{ workoutTemplateId: currentWorkout()?.workoutTemplateId }"> Schedule Workout </app-button>
```

## Testing

- ✅ All 571 server tests pass
- ✅ Application builds successfully
- ✅ No breaking changes to API
- ✅ Route navigation works correctly
- ✅ Query parameter pre-selection works

## Documentation Updates Needed

### docs/frontend/user/workout-schedule/README.md

- Update route structure
- Document new navigation patterns
- Update implementation status

### docs/frontend/user/workouts/README.md

- Document "Schedule" action navigation
- Mention schedules as related feature

## Related Documentation

- Previous implementation: `2026-02-08-workout-schedule-implementation.md`
