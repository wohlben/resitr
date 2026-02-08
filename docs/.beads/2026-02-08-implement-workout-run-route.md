# Workout Run Route Implementation

**Date**: 2026-02-08
**Scope**: User-facing feature

## What Changed

The `/user/workouts/:id/run` route has been fully implemented, transforming from a placeholder to a complete workout planning interface.

### New Components

1. **SetGoalRowComponent** (`apps/app/src/app/components/features/set-goal-row.component.ts`)

   - Displays input fields for set targets: Reps, Weight, Time (seconds), Distance
   - Reusable component used in both synced and individual modes

2. **ExercisePlanCardComponent** (`apps/app/src/app/components/features/exercise-plan-card.component.ts`)
   - Displays exercise info with configured scheme
   - Lock/unlock toggle (🔒/🔓) to switch between modes:
     - **Locked (synced)**: Single input row applies to all sets
     - **Unlocked (individual)**: Separate row per set with independent values
   - Shows rest between sets and break after duration

### Route Implementation

**WorkoutRunComponent** (`apps/app/src/app/routes/user/workout-run.ts`):

- Loads user workout and fetches assigned exercise schemes
- Builds workout plan with default targets from schemes
- Displays sections with color-coded headers (warmup, stretching, strength, cooldown)
- Allows users to adjust target values before starting
- Creates WorkoutLog via API when "Start Workout" is clicked
- Navigates to `/user/workout-logs/:id` after successful creation

### Backend API Addition

**New Endpoint**: `GET /api/user/exercise-scheme?userWorkoutId={id}`

- Returns all exercise schemes assigned to a specific user workout
- Response: `{ scheme: UserExerciseSchemeResponseDto; sectionItemId: string }[]`
- Added to repository, service, and controller layers

## Documentation Affected

### To Update:

- `docs/frontend/user/workouts/run.md` - Update from placeholder to actual implementation
- `docs/frontend/user/workouts/detail.md` - Verify "Start Workout" button reference
- `docs/frontend/user/workout-logs/detail.md` - Document as destination after starting workout

### New Documentation Needed:

- `docs/frontend/user/workouts/run.md` should document:
  - Plan creation flow
  - Target adjustment interface
  - Lock/unlock toggle behavior
  - Navigation flow to workout log detail

## User Flow

1. User clicks "Start Workout" from workout list or detail
2. Route loads workout template and assigned schemes
3. Plan is built with default targets from schemes
4. User can adjust targets:
   - Locked: Changes apply to all sets
   - Unlocked: Each set has independent targets
5. User clicks "Start Workout"
6. WorkoutLog is created with target values
7. Navigation to workout log detail page

## Technical Details

- Uses SignalStore for state management
- Reactive forms via ngModel for target inputs
- No validation on target values (intentional)
- Sticky "Start Workout" button at bottom
- Toast notifications for success/error states
