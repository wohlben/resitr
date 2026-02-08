# Exercise Compendium Pages

This document describes the UX flows and actions available on exercise-related compendium pages.

---

## `/compendium/exercises` - Exercise List

**Goal**: Browse, search, and filter the exercise template library. Primary entry point for exercise management.

### UX Flows

1. **Browse Exercises**

   - Paginated list of exercise cards
   - Each card displays: name, type, difficulty, primary muscles
   - Empty state when no exercises match filters

2. **Filter Exercises**

   - Filter by exercise type (strength, cardio, etc.)
   - Filter by technical difficulty level
   - Filter by primary muscle groups
   - Real-time filtering updates results

3. **Create New Exercise**

   - Primary action button in header
   - Navigates to `/compendium/exercises/new`

4. **View Exercise Detail**
   - Click any exercise card
   - Navigates to `/compendium/exercises/:id`

### Available Actions

| Action          | Trigger                       | Destination                                         |
| --------------- | ----------------------------- | --------------------------------------------------- |
| Create Exercise | "New Exercise" button         | [`/compendium/exercises/new`](./exercise-new.md)    |
| View Exercise   | Click exercise card           | [`/compendium/exercises/:id`](./exercise-detail.md) |
| Filter          | Filter component interactions | Same page (updates list)                            |
| Navigate Pages  | Pagination controls           | Same page (different offset)                        |

---

## `/compendium/exercises/:id` - Exercise Detail

**Goal**: Display comprehensive exercise information and manage exercise relationships.

### UX Flows

1. **View Exercise Information**

   - Header with exercise name and type
   - Description and alternative names
   - Technical metadata (difficulty, body weight scaling)
   - Muscle groups (primary and secondary)
   - Force types and measurement paradigms
   - Equipment requirements (linked)
   - Step-by-step instructions
   - Image gallery
   - Author attribution with external links

2. **View Exercise Relationships**

   - Groups section showing which groups contain this exercise
   - Related exercises section with relationship types
   - Links to related exercise detail pages

3. **Edit Exercise**

   - "Edit Exercise" button in header
   - Navigates to `/compendium/exercises/:id/edit`

4. **Navigate Back**

   - Back button returns to exercise list

5. **View Related Equipment**

   - Click equipment tags to navigate to equipment detail

6. **View Related Exercises**
   - Click related exercise links to view their details

### Available Actions

| Action                | Trigger                     | Destination                                            |
| --------------------- | --------------------------- | ------------------------------------------------------ |
| Edit Exercise         | "Edit Exercise" button      | [`/compendium/exercises/:id/edit`](./exercise-edit.md) |
| View Equipment        | Click equipment tag         | [`/compendium/equipments/:id`](./equipment-detail.md)  |
| View Related Exercise | Click related exercise link | [`/compendium/exercises/:id`](./exercise-detail.md)    |
| Back to List          | Back button                 | [`/compendium/exercises`](./exercises.md)              |

---

## `/compendium/exercises/new` - Create Exercise

**Goal**: Create a new exercise template with comprehensive metadata.

### UX Flows

1. **Fill Exercise Form**

   - Name (required)
   - Type selection (strength, cardio, etc.)
   - Technical difficulty level
   - Body weight scaling percentage
   - Primary and secondary muscle groups (multi-select)
   - Force types (multi-select)
   - Measurement paradigms (multi-select)
   - Equipment selection (multi-select)
   - Instructions list (add/remove items)
   - Images (URLs)
   - Alternative names
   - Author information

2. **Validation**

   - Real-time form validation
   - Error summary display
   - Submit button disabled until valid

3. **Cancel Creation**

   - Cancel button returns to exercise list
   - Unsaved changes confirmation dialog

4. **Save Exercise**
   - Submit button creates exercise
   - Loading state during save
   - Success: Navigate to new exercise detail
   - Error: Display error message

### Available Actions

| Action                  | Trigger                               | Destination                                         |
| ----------------------- | ------------------------------------- | --------------------------------------------------- |
| Save Exercise           | "Create Exercise" button (when valid) | [`/compendium/exercises/:id`](./exercise-detail.md) |
| Cancel                  | "Cancel" button                       | [`/compendium/exercises`](./exercises.md)           |
| Confirm Unsaved Changes | Attempt navigation with changes       | Confirmation dialog                                 |

### Guards

- **Unsaved Changes Guard**: Prompts confirmation when leaving with unsaved form data

---

## `/compendium/exercises/:id/edit` - Edit Exercise

**Goal**: Modify exercise details and manage exercise relationships.

### UX Flows

1. **Edit Exercise Details**

   - Pre-populated form with current values
   - Same fields as create form
   - Tracks changes for unsaved guard

2. **Manage Relationships**

   - **Add Related Exercise**: Search and select exercise + relationship type
   - **Remove Relationship**: Click X on existing relationship
   - Relationship types: Progression, Regression, Variation, Alternative

3. **Manage Group Membership**

   - **Join Group**: Search and select exercise group
   - **Leave Group**: Click X on group tag
   - Links to group detail pages

4. **Delete Exercise**

   - "Delete Exercise" button (danger)
   - Confirmation dialog
   - Success: Return to exercise list

5. **Save Changes**

   - Submit updates exercise
   - Navigates to exercise detail on success

6. **Cancel Edit**
   - Returns to exercise detail
   - Unsaved changes confirmation

### Available Actions

| Action              | Trigger                             | Destination                                                     |
| ------------------- | ----------------------------------- | --------------------------------------------------------------- |
| Save Changes        | "Save Changes" button               | [`/compendium/exercises/:id`](./exercise-detail.md)             |
| Delete Exercise     | "Delete Exercise" button + confirm  | [`/compendium/exercises`](./exercises.md)                       |
| Cancel              | "Cancel" button                     | [`/compendium/exercises/:id`](./exercise-detail.md)             |
| Add Relationship    | Select exercise + type, click "Add" | Same page (updates list)                                        |
| Remove Relationship | Click X on relationship             | Same page (updates list)                                        |
| Join Group          | Select group from dropdown          | Same page (updates list)                                        |
| Leave Group         | Click X on group tag                | Same page (updates list)                                        |
| View Group          | Click group name                    | [`/compendium/exercise-groups/:id`](./exercise-group-detail.md) |

### Guards

- **Unsaved Changes Guard**: Prompts confirmation when leaving with unsaved changes

---

## Related Pages

- [Equipment Detail](./equipment-detail.md) - View equipment used by exercises
- [Exercise Groups](./exercise-groups.md) - Browse exercise groups
- [Exercise Group Detail](./exercise-group-detail.md) - View groups containing exercises
- [Workouts](./workouts.md) - Browse workouts using exercises
