# `/compendium/workouts/:id/edit` - Edit Workout

**Goal**: Modify workout structure and create new versions. Workouts use immutable versioning - editing creates a new version.

---

## UX Flows

### Edit Workout Details

- Pre-populated form with current workout values
- Same fields as create form (see [Create Workout](./new.md))
- Tracks changes for unsaved guard
- Real-time validation

### Modify Structure

All structural changes:

- Add/remove/edit sections
- Add/remove/reorder exercises
- Change rest periods

**Result:** Creates a new version on save (v2, v3, etc.)

### Delete Workout

1. Click **"Delete Workout"** button (danger style)
2. Confirmation dialog appears:
   - Title: "Delete Workout"
   - Message: "Are you sure you want to delete [workout name]?"
   - Actions: "Cancel", "Delete" (destructive)
3. On confirm:
   - Calls `WorkoutsStore.deleteWorkout(id)`
   - Shows loading state
4. **Success:**
   - Toast: "[name] deleted successfully"
   - Navigates to workouts list
5. **Error:**
   - Error message displayed
   - Dialog closes, user can retry

### Save Changes (Creates New Version)

1. Click **"Save Changes"** (disabled if invalid or no changes)
2. Button shows loading state
3. Calls `WorkoutsStore.updateWorkout(id, data)`
4. **Creates new version** (immutable versioning)
5. **Success:**
   - Toast: "Workout [name] updated successfully" (shows new version)
   - Navigates to workout detail (new version)
6. **Error:**
   - Error displayed in error summary
   - User can correct and retry

### Cancel Edit

- Click **"Cancel"** button
- If unsaved changes exist: Shows confirmation dialog
- Returns to [`/compendium/workouts/:id`](./detail.md)

---

## Available Actions

| Action           | Trigger                           | Destination                                             |
| ---------------- | --------------------------------- | ------------------------------------------------------- |
| Save Changes     | "Save Changes" button             | [`/compendium/workouts/:id`](./detail.md) (new version) |
| Delete Workout   | "Delete Workout" button + confirm | [`/compendium/workouts`](./list.md)                     |
| Cancel           | "Cancel" button                   | [`/compendium/workouts/:id`](./detail.md)               |
| Add Section      | "Add Section" button              | Same page (updates form)                                |
| Remove Section   | Section remove button             | Same page (updates form)                                |
| Add Exercise     | "Add Exercise" button in section  | Same page (updates form)                                |
| Remove Exercise  | Exercise remove button            | Same page (updates form)                                |
| Reorder Exercise | Drag-and-drop                     | Same page (updates form)                                |

---

## Guards

### Unsaved Changes Guard

- Applied via `canDeactivate: [unsavedChangesGuard]`
- Compares current form data with initial data
- Prompts confirmation when leaving with unsaved changes
- Options: "Stay" (keep editing) or "Leave" (discard changes)

---

## Versioning Behavior

Unlike other resources, workout edits create new versions:

- **Original version remains accessible**
- **New version gets new templateId**
- **User workouts reference specific versions**
- **Only latest version is editable**

This ensures workout history is preserved and users can always see what a workout looked like when they adopted it.

---

## Related Pages

- [Workout Detail](./detail.md) - View workout (cancel destination)
- [Workout List](./list.md) - Browse workouts (delete destination)
- [Version History](./versions.md) - View all versions
- [Create Workout](./new.md) - Field documentation reference
