# `/compendium/exercise-groups/new` - Create Exercise Group

**Goal**: Create a new exercise group template. Define collections of related exercises.

---

## UX Flows

### Fill Group Form

**Form Fields:**

1. **Name** (required)

   - Group identifier
   - Example: "Upper Body Push", "Leg Day", "Core Stability"

2. **Description**
   - Purpose and details about the group
   - What exercises belong and why

### Validation

- Real-time form validation via `ExerciseGroupFormComponent`
- Error summary displayed below form
- Submit button disabled until form is valid
- Name field is required

### Cancel Creation

- **"Cancel"** button returns to groups list
- If form has data: Shows unsaved changes confirmation dialog
- Options: "Stay" (keep editing) or "Leave" (discard changes)

### Save Group

1. User clicks **"Create Group"** (disabled if invalid)
2. Button shows loading state with spinner
3. Calls `ExerciseGroupsStore.createExerciseGroup(data)`
4. **Success:**
   - Toast: "Exercise group [name] created successfully"
   - Navigates to new group detail page
5. **Error:**
   - Error message displayed in error summary
   - User can correct and retry

---

## Available Actions

| Action                  | Trigger                            | Destination                                      |
| ----------------------- | ---------------------------------- | ------------------------------------------------ |
| Save Group              | "Create Group" button (when valid) | [`/compendium/exercise-groups/:id`](./detail.md) |
| Cancel                  | "Cancel" button                    | [`/compendium/exercise-groups`](./list.md)       |
| Confirm Unsaved Changes | Attempt navigation with changes    | Confirmation dialog                              |

---

## Guards

### Unsaved Changes Guard

- Applied via `canDeactivate: [unsavedChangesGuard]`
- Tracks form state changes
- Prompts confirmation when leaving with unsaved data
- Automatically bypassed after successful submission

---

## Related Pages

- [Group List](./list.md) - Return to groups library
- [Group Detail](./detail.md) - View created group
- [Edit Group](./edit.md) - Add exercises to group
