# Workout Logs Filtering and Calendar View

**Date**: 2026-02-08
**Type**: Feature Implementation
**Status**: ✅ Complete

## Summary

Implemented complete workout logs page with filtering by workout template and calendar visualization with color-coded entries.

## Changes Made

### Backend

1. **New API Endpoint** (`/api/user/workout-logs`)

   - Added `GET /api/user/workout-logs?workoutTemplateId={id}`
   - Returns filtered list of workout logs for current user
   - Optional `workoutTemplateId` query parameter for filtering

2. **Repository Updates**

   - Added `findByUserId()` method to `UserWorkoutLogRepository`
   - Added `findByUserIdAndWorkoutTemplateId()` for filtered queries

3. **Service Updates**
   - Added `listLogs()` method in `UserWorkoutLogService`
   - Sorts logs by startedAt descending (most recent first)

### Frontend

1. **Query Functions** (`apps/app/src/app/core/user/user-queries.ts`)

   - Added `UserQueries.workoutLog.list(workoutTemplateId?)`
   - Supports optional workout template filtering

2. **State Management** (`apps/app/src/app/features/workout-logs/workout-logs.store.ts`)

   - Created NgRx Signals store for workout logs
   - Computed properties:
     - `logsByDate`: Maps logs to dates for calendar
     - `monthsWithLogs`: Unique months with workout activity

3. **Route Component** (`apps/app/src/app/routes/user/workout-logs.ts`)

   - **Left Panel**: Chronological list of workout logs
     - Shows workout name, date, status badge
     - Duration for completed workouts
     - Click to view detail
   - **Right Panel**: Calendar view
     - Month navigation (previous/next)
     - Color-coded dots per day:
       - 🟢 Green: Workout completed
       - 🟡 Yellow: Started today (in progress)
       - 🔴 Red: Incomplete/aborted (started earlier, never finished)
     - Legend explaining color codes
     - Click day to view first log for that date

4. **Navigation Update** (`apps/app/src/app/routes/user/workouts.ts`)
   - "View Logs" action now passes `workoutTemplateId` query parameter
   - Enables filtering logs to specific workout

### API Types

- Added `WorkoutLogListItemDto` interface for list responses
- Contains: id, originalWorkoutId, name, startedAt, completedAt

## User-Facing Changes

1. **Workout Card "View Logs"**: Now shows filtered logs for that specific workout
2. **Log List**: Shows all logs with status badges and duration
3. **Calendar Visualization**: New visual way to see workout history
4. **Color Coding**: Quick visual status indication in calendar

## Documentation Updates Needed

### docs/frontend/user/workout-logs/README.md

- Update implementation status table:
  - Log List: ✅ Implemented (was 🚧 Placeholder)
  - Add Calendar View row: ✅ Implemented
- Update conceptual model to mention filtering

### docs/frontend/user/workout-logs/list.md

- Update status from "Placeholder" to "Implemented"
- Document filtering by workout template
- Document calendar view with color coding
- Update navigation entry points

### docs/frontend/user/workouts/list.md (if exists)

- Document "View Logs" action behavior
- Mention query parameter passing

## Testing

- ✅ Server builds successfully
- ✅ Client builds successfully
- ✅ All 571 server tests pass
- ✅ No breaking changes to existing APIs

## Related Files

- `apps/server/src/app/routes/user/workout-log/user-workout-log.controller.ts`
- `apps/server/src/app/core/user/workout-log/user-workout-log.service.ts`
- `apps/server/src/app/core/persistence/repositories/user-workout-log.repository.ts`
- `apps/app/src/app/core/user/user-queries.ts`
- `apps/app/src/app/features/workout-logs/workout-logs.store.ts`
- `apps/app/src/app/routes/user/workout-logs.ts`
- `apps/app/src/app/routes/user/workouts.ts`
- `libs/api/src/lib/dto/workout-log.dto.ts`
