# `/compendium/exercise-groups/:id/edit` - Edit Exercise Group

**Goal**: Modify group details and manage group membership. Add/remove exercises from the group.

---

## UX Flows

### Edit Group Details

- Pre-populated form with current group values
- Name and description fields
- Tracks changes for unsaved guard
- Real-time validation

### Manage Group Members

**Group Members Section:**

- **Add Member:**

  1. Search exercises from dropdown
  2. Select exercise to add
  3. Exercise immediately added to group
  4. Toast: "Added [name] to group"
  5. Shows exercise name, version, and author

- **Remove Member:**

  1. Click **X** button next to exercise name
  2. Exercise removed from group
  3. Toast: "Removed [name] from group"

- **View Exercise:**

  - Click exercise name to navigate to detail
  - Navigates to [`/compendium/exercises/:id`](../exercises/detail.md)

- **Loading State:**

  - Shows spinner while fetching members
  - "Loading members..." message

- **Empty State:**
  - "No exercises in this group yet. Use the dropdown above to add exercises."

### Delete Group

1. Click **"Delete Group"** button (danger style)
2. Confirmation dialog appears:
   - Title: "Delete Exercise Group"
   - Message: "Are you sure you want to delete [group name]?"
   - Actions: "Cancel", "Delete" (destructive)
3. On confirm:
   - Calls `ExerciseGroupsStore.deleteExerciseGroup(id)`
   - Shows loading state
4. **Success:**
   - Toast: "[name] deleted successfully"
   - Navigates to groups list
5. **Error:**
   - Error message displayed
   - Dialog closes, user can retry

### Save Changes

1. Click **"Save Changes"** (disabled if invalid or no changes)
2. Button shows loading state
3. Calls `ExerciseGroupsStore.updateExerciseGroup(id, data)`
4. **Success:**
   - Toast: "Exercise group [name] updated successfully"
   - Navigates to group detail
5. **Error:**
   - Error displayed in error summary
   - User can correct and retry

### Cancel Edit

- Click **"Cancel"** button
- If unsaved changes exist: Shows confirmation dialog
- Returns to [`/compendium/exercise-groups/:id`](./detail.md)

---

## Available Actions

| Action        | Trigger                         | Destination                                           |
| ------------- | ------------------------------- | ----------------------------------------------------- |
| Save Changes  | "Save Changes" button           | [`/compendium/exercise-groups/:id`](./detail.md)      |
| Delete Group  | "Delete Group" button + confirm | [`/compendium/exercise-groups`](./list.md)            |
| Cancel        | "Cancel" button                 | [`/compendium/exercise-groups/:id`](./detail.md)      |
| Add Member    | Select exercise from dropdown   | Same page (updates list)                              |
| Remove Member | Click X on member               | Same page (updates list)                              |
| View Exercise | Click exercise name             | [`/compendium/exercises/:id`](../exercises/detail.md) |

---

## Guards

### Unsaved Changes Guard

- Applied via `canDeactivate: [unsavedChangesGuard]`
- Compares current form data with initial data
- Prompts confirmation when leaving with unsaved changes
- Options: "Stay" (keep editing) or "Leave" (discard changes)

---

## Related Pages

- [Group Detail](./detail.md) - View group (cancel destination)
- [Group List](./list.md) - Browse groups (delete destination)
- [Exercise Detail](../exercises/detail.md) - View exercises
- [Create Group](./new.md) - Field documentation reference
