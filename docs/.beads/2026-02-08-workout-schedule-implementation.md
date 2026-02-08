# Workout Schedule Implementation

**Date**: 2026-02-08
**Type**: Feature Implementation
**Status**: ✅ Complete

## Summary

Implemented complete weekly workout schedule page with calendar grid view, allowing users to plan and manage their recurring weekly workout routine.

## Changes Made

### Frontend

1. **Store** (`apps/app/src/app/features/workout-schedule/workout-schedule.store.ts`)

   - Created NgRx Signals store for workout schedules
   - Computed properties:
     - `schedulesByDay`: Groups schedules by day of week (0-6)
     - `dayNames`: Array of day names [Sunday, Monday, ...]
   - Methods:
     - `loadSchedules()`: Fetch all user schedules
     - `createSchedule()`: Create new workout schedule entry
     - `updateSchedule()`: Modify existing schedule
     - `deleteSchedule()`: Delete workout schedule

2. **List Route Component** (`apps/app/src/app/routes/user/workout-schedule.ts`)

   - **Weekly Calendar Grid**: 7-column layout (Sunday-Saturday)
     - Today's column highlighted in blue
     - Each day shows scheduled workouts with names
     - Order indicator for multiple workouts per day
   - **Interactive Features**:
     - Click workout card to view detail
     - Hover to reveal delete button
     - Click "Schedule" button per day to create schedule for that day
     - Main "Schedule Workout" button links to create route

3. **Create Route Component** (`apps/app/src/app/routes/user/workout-schedule-create.ts`)

   - **Dedicated page** for creating workout schedules (no modal)
   - **Form Fields**:
     - Workout dropdown (from user's workouts)
     - Day of week selector (visual button grid)
     - Order input (for multiple workouts per day)
   - **Pre-selection Support**:
     - Reads `workoutTemplateId` query param to pre-select workout
     - Reads `dayOfWeek` query param to pre-select day
   - **Form validation** and error handling
   - Cancel/Submit actions with loading states

4. **Navigation Update** (`apps/app/src/app/routes/user/workouts.ts`)
   - "Schedule" action navigates to `/user/workout-schedule/create`
   - Passes `workoutTemplateId` as query parameter for pre-selection

### Backend

No backend changes - reused existing API:

- `GET /api/user/workout-schedule` - List all schedules
- `POST /api/user/workout-schedule` - Create schedule
- `PUT /api/user/workout-schedule/:id` - Update schedule
- `DELETE /api/user/workout-schedule/:id` - Delete schedule

## User-Facing Changes

1. **Schedule Page** (`/user/workout-schedule`): Fully functional weekly calendar view
2. **Create Schedule Page** (`/user/workout-schedule/create`): Dedicated form for creating schedules
3. **Workout Card "Schedule"**: Navigates to create page with that workout pre-selected
4. **Weekly Planning**: Visual grid showing all 7 days with scheduled workouts
5. **Per-Day Scheduling**: Click "Schedule" button on any day to create schedule for that specific day
6. **Delete Schedules**: Hover over scheduled workout to reveal delete button

## Data Model

Schedule stores:

- `workoutTemplateId`: Reference to compendium workout
- `dayOfWeek`: 0-6 (Sunday-Saturday)
- `order`: Sort order for multiple workouts on same day

## Documentation Updates Needed

### docs/frontend/user/workout-schedule/README.md

- Update implementation status table:
  - Schedule List: ✅ Implemented (was 🚧 Placeholder)
  - Calendar Views: ✅ Implemented (was 🚧 Placeholder)

### docs/frontend/user/workout-schedule/list.md

- Update status from "Placeholder" to "Implemented"
- Document weekly calendar grid view
- Document add/remove/schedule actions
- Document pre-selection from workout card

### docs/frontend/user/workouts/list.md

- Document "Schedule" action behavior
- Mention query parameter pre-selection

## Testing

- ✅ Server builds successfully
- ✅ Client builds successfully
- ✅ All 571 server tests pass
- ✅ No breaking changes to existing APIs

## Routes

| Route                           | Description                                              |
| ------------------------------- | -------------------------------------------------------- |
| `/user/workout-schedule`        | Weekly calendar view of all scheduled workouts           |
| `/user/workout-schedule/create` | Create new workout schedule (with optional query params) |
| `/user/workout-schedule/:id`    | View/edit specific schedule detail                       |

## Query Parameters

- `workoutTemplateId`: Pre-selects the workout in the create form
- `dayOfWeek`: Pre-selects the day (0-6) in the create form

## Related Files

- `apps/app/src/app/features/workout-schedule/workout-schedule.store.ts`
- `apps/app/src/app/routes/user/workout-schedule.ts` (list view)
- `apps/app/src/app/routes/user/workout-schedule-create.ts` (create form)
- `apps/app/src/app/routes/user/workouts.ts`
- `apps/server/src/app/routes/user/workout-schedule/user-workout-schedule.controller.ts` (existing)
