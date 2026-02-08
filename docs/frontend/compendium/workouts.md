# Workout Compendium Pages

This document describes the UX flows and actions available on workout-related compendium pages.

---

## `/compendium/workouts` - Workout List

**Goal**: Browse, search, and filter the workout template library. Primary entry point for workout management.

### UX Flows

1. **Browse Workouts**

   - Paginated list of workout cards
   - Each card displays: name, description preview, section count, exercise count
   - Empty state when no workouts match filters

2. **Filter Workouts**

   - Search by name
   - Filter by various criteria
   - Real-time filtering updates results

3. **Create New Workout**

   - Primary action button in header
   - Navigates to `/compendium/workouts/new`

4. **View Workout Detail**
   - Click any workout card
   - Navigates to `/compendium/workouts/:id`

### Available Actions

| Action         | Trigger                       | Destination                                       |
| -------------- | ----------------------------- | ------------------------------------------------- |
| Create Workout | "New Workout" button          | [`/compendium/workouts/new`](./workout-new.md)    |
| View Workout   | Click workout card            | [`/compendium/workouts/:id`](./workout-detail.md) |
| Filter         | Filter component interactions | Same page (updates list)                          |
| Navigate Pages | Pagination controls           | Same page (different offset)                      |

---

## `/compendium/workouts/:id` - Workout Detail

**Goal**: Display comprehensive workout structure and enable user adoption.

### UX Flows

1. **View Workout Information**

   - Header with workout name and template label
   - Description
   - Metadata: section count, total exercises, version number
   - Creation and update timestamps

2. **View Workout Structure**

   - Color-coded sections (Warmup, Stretching, Strength, Cooldown)
   - Each section displays:
     - Section name and type
     - Exercise count
     - Ordered list of exercises
     - Rest periods between sets and after exercise
   - Click exercise names to view details

3. **Version History**

   - "Version History" action button (when multiple versions exist)
   - Shows only for workouts with version history
   - Navigates to `/compendium/workouts/:id/versions`

4. **Add to My Workouts**

   - "Add to My Workouts" button
   - Creates user workout instance from template
   - Shows "Added" badge if already added
   - Redirects to user workout detail on success

5. **Edit Workout**

   - "Edit Workout" button (only for latest version)
   - Hidden on older versions
   - Navigates to `/compendium/workouts/:id/edit`

6. **Navigate Back**
   - Back button returns to workout list

### Available Actions

| Action               | Trigger                                     | Destination                                                  |
| -------------------- | ------------------------------------------- | ------------------------------------------------------------ |
| Edit Workout         | "Edit Workout" button (latest version only) | [`/compendium/workouts/:id/edit`](./workout-edit.md)         |
| View Version History | "Version History" button                    | [`/compendium/workouts/:id/versions`](./workout-versions.md) |
| Add to My Workouts   | "Add to My Workouts" button                 | `/user/workouts/:id` (user workout detail)                   |
| View Exercise        | Click exercise name                         | [`/compendium/exercises/:id`](./exercise-detail.md)          |
| Back to List         | Back button                                 | [`/compendium/workouts`](./workouts.md)                      |

---

## `/compendium/workouts/new` - Create Workout

**Goal**: Create a new workout template with structured sections.

### UX Flows

1. **Fill Workout Form**

   - Name (required)
   - Description
   - Sections builder:
     - Add/remove sections
     - Section types: Warmup, Stretching, Strength, Cooldown
     - Section names
     - Add/remove exercises within sections
     - Exercise selection from compendium
     - Configure rest periods (between sets, after exercise)
     - Reorder exercises via drag-and-drop

2. **Validation**

   - Real-time form validation
   - Error summary display
   - Submit button disabled until valid

3. **Cancel Creation**

   - Cancel button returns to workout list
   - Unsaved changes confirmation dialog

4. **Save Workout**
   - Submit button creates workout
   - Loading state during save
   - Success: Navigate to new workout detail
   - Error: Display error message

### Available Actions

| Action                  | Trigger                              | Destination                                       |
| ----------------------- | ------------------------------------ | ------------------------------------------------- |
| Save Workout            | "Create Workout" button (when valid) | [`/compendium/workouts/:id`](./workout-detail.md) |
| Cancel                  | "Cancel" button                      | [`/compendium/workouts`](./workouts.md)           |
| Confirm Unsaved Changes | Attempt navigation with changes      | Confirmation dialog                               |
| Add Section             | "Add Section" button                 | Same page (updates form)                          |
| Remove Section          | Section remove button                | Same page (updates form)                          |
| Add Exercise            | "Add Exercise" button in section     | Same page (updates form)                          |
| Remove Exercise         | Exercise remove button               | Same page (updates form)                          |

### Guards

- **Unsaved Changes Guard**: Prompts confirmation when leaving with unsaved form data

---

## `/compendium/workouts/:id/edit` - Edit Workout

**Goal**: Modify workout structure and create new versions.

### UX Flows

1. **Edit Workout Details**

   - Pre-populated form with current values
   - Same fields as create form
   - Tracks changes for unsaved guard

2. **Modify Structure**

   - Add/remove/edit sections
   - Add/remove/reorder exercises
   - Change rest periods
   - All changes create a new version on save

3. **Delete Workout**

   - "Delete Workout" button (danger)
   - Confirmation dialog
   - Success: Return to workout list

4. **Save Changes**

   - Submit creates new version (versioning system)
   - Navigates to workout detail on success
   - Shows success toast with new version number

5. **Cancel Edit**
   - Returns to workout detail
   - Unsaved changes confirmation

### Available Actions

| Action           | Trigger                           | Destination                                       |
| ---------------- | --------------------------------- | ------------------------------------------------- |
| Save Changes     | "Save Changes" button             | [`/compendium/workouts/:id`](./workout-detail.md) |
| Delete Workout   | "Delete Workout" button + confirm | [`/compendium/workouts`](./workouts.md)           |
| Cancel           | "Cancel" button                   | [`/compendium/workouts/:id`](./workout-detail.md) |
| Add Section      | "Add Section" button              | Same page (updates form)                          |
| Remove Section   | Section remove button             | Same page (updates form)                          |
| Add Exercise     | "Add Exercise" button in section  | Same page (updates form)                          |
| Remove Exercise  | Exercise remove button            | Same page (updates form)                          |
| Reorder Exercise | Drag-and-drop                     | Same page (updates form)                          |

### Guards

- **Unsaved Changes Guard**: Prompts confirmation when leaving with unsaved changes

---

## `/compendium/workouts/:id/versions` - Workout Version History

**Goal**: View and navigate between workout versions.

### UX Flows

1. **View Version History**

   - Table listing all versions
   - Columns: Version number, Updated date
   - "Latest" badge on most recent version
   - "Current" badge on currently viewed version

2. **Navigate to Version**

   - Click version number to view that version
   - Navigates to `/compendium/workouts/:templateId`

3. **Edit Current Version**

   - "Edit Current" button (only on latest version view)
   - Navigates to `/compendium/workouts/:id/edit`

4. **Navigate Back**
   - Back button returns to current workout detail

### Available Actions

| Action          | Trigger                                | Destination                                          |
| --------------- | -------------------------------------- | ---------------------------------------------------- |
| View Version    | Click version number                   | [`/compendium/workouts/:id`](./workout-detail.md)    |
| Edit Current    | "Edit Current" button (latest version) | [`/compendium/workouts/:id/edit`](./workout-edit.md) |
| Back to Workout | Back button                            | [`/compendium/workouts/:id`](./workout-detail.md)    |

---

## Related Pages

- [Exercises](./exercises.md) - Browse exercises used in workouts
- [Exercise Detail](./exercise-detail.md) - View exercise information
- [User Workouts](../user/workouts.md) - View adopted workouts
- [User Workout Detail](../user/workout-detail.md) - Manage personal workout instances

---

## Versioning System

Workouts use an immutable versioning system:

1. **Creating**: Always creates version 1
2. **Editing**: Creates a new version (v2, v3, etc.), old versions remain accessible
3. **Viewing**: Can view any historical version
4. **Editing restrictions**: Only the latest version can be edited
5. **User workouts**: Reference specific template versions

This ensures workout history is preserved and users can always see what a workout looked like when they adopted it.
