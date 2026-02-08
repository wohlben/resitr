# `/compendium/exercises/:id/edit` - Edit Exercise

**Goal**: Modify exercise details and manage exercise relationships. Central hub for exercise maintenance.

---

## UX Flows

### Edit Exercise Details

- Pre-populated form with current exercise values
- Same fields as create form (see [Create Exercise](./new.md))
- Tracks changes for unsaved guard
- Real-time validation

### Manage Relationships

**Related Exercises Section:**

- **Add Related Exercise:**

  1. Search and select exercise from dropdown
  2. Select relationship type from dropdown:
     - Progression (harder variant)
     - Regression (easier variant)
     - Variation (similar movement)
     - Alternative (different exercise, same purpose)
  3. Click **"Add Relationship"**
  4. Relationship appears in list immediately

- **Remove Relationship:**
  1. Click **X** button on existing relationship
  2. Relationship removed immediately
  3. Toast confirmation

### Manage Group Membership

**Exercise Groups Section:**

- **Join Group:**

  1. Search and select group from dropdown
  2. Exercise immediately added to group
  3. Toast: "Joined group [name]"

- **Leave Group:**

  1. Click **X** button on group tag
  2. Exercise removed from group
  3. Toast: "Left group [name]"

- **View Group:**
  - Click group name to navigate to group detail
  - Navigates to [`/compendium/exercise-groups/:id`](../exercise-groups/detail.md)

### Delete Exercise

1. Click **"Delete Exercise"** button (danger style)
2. Confirmation dialog appears:
   - Title: "Delete Exercise"
   - Message: "Are you sure you want to delete [exercise name]?"
   - Actions: "Cancel", "Delete" (destructive)
3. On confirm:
   - Calls `ExercisesStore.deleteExercise(id)`
   - Shows loading state
4. **Success:**
   - Toast: "[name] deleted successfully"
   - Navigates to exercise list
5. **Error:**
   - Error message displayed
   - Dialog closes, user can retry

### Save Changes

1. Click **"Save Changes"** (disabled if invalid or no changes)
2. Button shows loading state
3. Calls `ExercisesStore.updateExercise(id, data)`
4. **Success:**
   - Toast: "Exercise [name] updated successfully"
   - Navigates to exercise detail
5. **Error:**
   - Error displayed in error summary
   - User can correct and retry

### Cancel Edit

- Click **"Cancel"** button
- If unsaved changes exist: Shows confirmation dialog
- Returns to [`/compendium/exercises/:id`](./detail.md)

---

## Available Actions

| Action              | Trigger                             | Destination                                                       |
| ------------------- | ----------------------------------- | ----------------------------------------------------------------- |
| Save Changes        | "Save Changes" button               | [`/compendium/exercises/:id`](./detail.md)                        |
| Delete Exercise     | "Delete Exercise" button + confirm  | [`/compendium/exercises`](./list.md)                              |
| Cancel              | "Cancel" button                     | [`/compendium/exercises/:id`](./detail.md)                        |
| Add Relationship    | Select exercise + type, click "Add" | Same page (updates list)                                          |
| Remove Relationship | Click X on relationship             | Same page (updates list)                                          |
| Join Group          | Select group from dropdown          | Same page (updates list)                                          |
| Leave Group         | Click X on group tag                | Same page (updates list)                                          |
| View Group          | Click group name                    | [`/compendium/exercise-groups/:id`](../exercise-groups/detail.md) |

---

## Guards

### Unsaved Changes Guard

- Applied via `canDeactivate: [unsavedChangesGuard]`
- Compares current form data with initial data
- Prompts confirmation when leaving with unsaved changes
- Options: "Stay" (keep editing) or "Leave" (discard changes)

---

## Related Pages

- [Exercise Detail](./detail.md) - View exercise (cancel destination)
- [Exercise List](./list.md) - Browse exercises (delete destination)
- [Exercise Group Detail](../exercise-groups/detail.md) - View groups
- [Create Exercise](./new.md) - Field documentation reference
