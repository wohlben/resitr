# User Workout Pages

This document describes the UX flows and actions available on user workout management pages.

---

## `/user/workouts` - My Workouts List

**Goal**: Display and manage the user's personal workout collection. Shows workouts adopted from the compendium.

### UX Flows

1. **Browse My Workouts**

   - List of user workout cards
   - Each card displays: workout name, description, section/exercise count, template version
   - Empty state with CTA to browse compendium when no workouts added
   - Card click navigates to workout detail

2. **Import New Workout**

   - "Import Workout" button links to compendium
   - Navigates to `/compendium/workouts` to browse templates

3. **Workout Actions**
   Each workout card provides action menu:

   - **View Logs**: Navigate to workout logs (placeholder)
   - **Schedule**: Navigate to schedule page (placeholder)
   - **Remove**: Delete workout from personal collection

4. **Remove Workout**
   - Confirmation dialog with workout name
   - Explains this only removes from user's collection, not compendium
   - Success toast on removal
   - Error handling if removal fails

### Available Actions

| Action            | Trigger                        | Destination                                               |
| ----------------- | ------------------------------ | --------------------------------------------------------- |
| Import Workout    | "Import Workout" button        | [`/compendium/workouts`](../compendium/workouts.md)       |
| View Workout      | Click workout card             | [`/user/workouts/:id`](./workouts.md#user-workout-detail) |
| View Logs         | Action menu "Logs"             | `/user/workout-logs` (placeholder)                        |
| Schedule          | Action menu "Schedule"         | `/user/workout-schedule` (placeholder)                    |
| Remove Workout    | Action menu "Remove" + confirm | Same page (list updates)                                  |
| Browse Compendium | Empty state CTA                | [`/compendium/workouts`](../compendium/workouts.md)       |

---

## `/user/workouts/:id` - User Workout Detail

**Goal**: Display user's workout instance with exercise scheme assignments and progress indicators.

### UX Flows

1. **View Workout Structure**

   - Header with workout name and "My Workout" label
   - Description from template
   - Metadata: section count, total exercises, template version
   - Color-coded sections (Warmup, Stretching, Strength, Cooldown)

2. **View Exercise Scheme Status**

   - Each exercise shows scheme assignment status:
     - **Green checkmark**: Scheme configured
     - **Amber warning**: Needs scheme setup
   - Visual indicators help users track configuration progress

3. **View Exercise Details**

   - Exercise names link to compendium exercise detail
   - Rest period configuration (between sets, after exercise)
   - Sequential numbering within sections

4. **Edit Exercise Schemes**

   - "Edit Schemes" button in header
   - Navigates to scheme configuration page

5. **View Template**

   - "View Template" button links to compendium workout
   - See original template details and version history

6. **Navigate Back**
   - Back button returns to My Workouts list

### Available Actions

| Action        | Trigger                | Destination                                                               |
| ------------- | ---------------------- | ------------------------------------------------------------------------- |
| Edit Schemes  | "Edit Schemes" button  | [`/user/workouts/:id/edit`](./workouts.md#edit-exercise-schemes)          |
| View Template | "View Template" button | [`/compendium/workouts/:id`](../compendium/workouts.md#workout-detail)    |
| View Exercise | Click exercise name    | [`/compendium/exercises/:id`](../compendium/exercises.md#exercise-detail) |
| Back to List  | Back button            | [`/user/workouts`](./workouts.md#my-workouts-list)                        |

### Data Display

- **Enriched Workout Data**: Combines user workout record with template data
- **Exercise Names**: Resolved from compendium exercise store
- **Scheme Status**: Checked against user exercise schemes store

---

## `/user/workouts/:id/edit` - Edit Exercise Schemes

**Goal**: Configure exercise schemes (sets, reps, weight, etc.) for each exercise in the workout.

### UX Flows

1. **View Exercise Scheme Configuration**

   - Same section structure as detail view
   - Each exercise displays scheme assignment card
   - Shows suggested measurement paradigms from exercise metadata

2. **Select Exercise Schemes**

   - Scheme assignment card for each exercise:
     - Select measurement paradigm (reps/weight, time/distance, etc.)
     - Configure scheme parameters based on paradigm
     - Preview scheme summary
   - Changes accumulate as pending assignments

3. **Manage Pending Changes**

   - Sticky bottom bar shows unsaved changes count
   - Save button enabled when changes exist
   - Changes persist locally until explicitly saved

4. **Save Assignments**

   - Batch save all pending assignments
   - Shows loading state during save
   - Success: Navigate back to workout detail with toast
   - Partial failure: Shows success count and error message

5. **View Template Reference**

   - "View Template" button links to compendium workout
   - Reference original workout structure while configuring

6. **Cancel Editing**
   - Back button returns to workout detail
   - Warns about unsaved changes (if any pending)

### Available Actions

| Action        | Trigger                          | Destination                                                            |
| ------------- | -------------------------------- | ---------------------------------------------------------------------- |
| Select Scheme | Choose scheme on assignment card | Same page (adds to pending)                                            |
| Save Changes  | "Save Changes" button            | [`/user/workouts/:id`](./workouts.md#user-workout-detail)              |
| View Template | "View Template" button           | [`/compendium/workouts/:id`](../compendium/workouts.md#workout-detail) |
| Cancel        | Back button                      | [`/user/workouts/:id`](./workouts.md#user-workout-detail)              |

### Scheme Assignment Flow

1. User selects measurement paradigm for exercise
2. Scheme card displays paradigm-specific fields
3. User configures scheme parameters
4. Assignment added to pending changes map
5. Sticky bar updates with change count
6. Save persists all assignments to backend
7. Success navigation clears pending state

---

## Placeholder Pages

The following pages are defined in routes but currently have minimal/placeholder implementations:

### `/user/workout-logs` - Workout Logs

- **Status**: Placeholder (empty component)
- **Goal**: Display history of completed workout sessions
- **Future**: List completed workouts with date, duration, performance summary

### `/user/workout-logs/:id` - Workout Log Detail

- **Status**: Placeholder (basic template only)
- **Goal**: View details of a specific completed workout session
- **Future**: Show exercises performed, actual vs target metrics, notes

### `/user/workout-schedule` - Workout Schedule

- **Status**: Placeholder (empty component)
- **Goal**: Calendar view of planned workouts
- **Future**: Weekly/monthly calendar, scheduled workout instances

### `/user/workout-schedule/:id` - Schedule Detail

- **Status**: Placeholder (basic template only)
- **Goal**: View/edit specific scheduled workout
- **Future**: Date/time, reminder settings, completion status

---

## Data Flow

```
Compendium Workout (Template)
         │
         │ Add to My Workouts
         ▼
User Workout (Instance) ────
         │                  │
         │ Edit Schemes     │ View Detail
         ▼                  ▼
Exercise Schemes      Workout Structure
(Assignments)         (Read-only view)
```

---

## Related Pages

- [Compendium Workouts](../compendium/workouts.md) - Browse and import workout templates
- [Compendium Workout Detail](../compendium/workouts.md#workout-detail) - View template details
- [Compendium Exercises](../compendium/exercises.md) - View exercise information

---

## Key Concepts

### User Workout vs Compendium Workout

| Aspect            | Compendium Workout       | User Workout           |
| ----------------- | ------------------------ | ---------------------- |
| **Purpose**       | Template library         | Personal instance      |
| **Editing**       | Creates new version      | Configure schemes only |
| **Scope**         | Global (all users)       | Private (single user)  |
| **Structure**     | Fixed sections/exercises | References template    |
| **Configuration** | None                     | Exercise schemes       |
| **History**       | Versioned                | Single instance        |

### Exercise Schemes

Exercise schemes define how an exercise should be performed:

- **Measurement Paradigm**: What to track (reps/weight, time, distance, etc.)
- **Scheme Parameters**: Sets, reps, weight, duration, rest periods
- **Assignment**: Linked to specific section item in user's workout
- **Suggestions**: Compendium exercises provide suggested paradigms

### Scheme Assignment Status

Visual indicators help users track configuration:

- **Configured**: Green checkmark, ready to perform
- **Needs Setup**: Amber warning, requires scheme assignment
