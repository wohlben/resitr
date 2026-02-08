# `/compendium/workouts/new` - Create Workout

**Goal**: Create a new workout template with structured sections. Builder interface for workout composition.

---

## UX Flows

### Fill Workout Form

**Basic Information:**

1. **Name** (required)

   - Workout name

2. **Description**
   - Workout description and notes

**Sections Builder:**

Dynamic section management:

- **Add Section:**

  - Click "Add Section" button
  - New section appears in form

- **Section Types:**

  - Warmup (🔥 Orange)
  - Stretching (🧘 Purple)
  - Strength (💪 Blue)
  - Cooldown (❄️ Cyan)

- **Section Name:**

  - Custom name for the section

- **Remove Section:**
  - Click remove button on section
  - Section removed from form

**Exercise Management within Sections:**

- **Add Exercise:**

  1. Click "Add Exercise" button in section
  2. Search and select exercise from compendium
  3. Configure rest periods:
     - Break between sets (seconds)
     - Break after exercise (seconds)
  4. Exercise added to section

- **Remove Exercise:**

  - Click remove button on exercise
  - Exercise removed from section

- **Reorder Exercises:**
  - Drag-and-drop to reorder
  - Changes sequence in workout

### Validation

- Real-time form validation via `WorkoutFormComponent`
- Error summary displayed below form
- Submit button disabled until form is valid
- Name field and at least one section required

### Cancel Creation

- **"Cancel"** button returns to workouts list
- If form has data: Shows unsaved changes confirmation dialog
- Options: "Stay" (keep editing) or "Leave" (discard changes)

### Save Workout

1. User clicks **"Create Workout"** (disabled if invalid)
2. Button shows loading state with spinner
3. Calls `WorkoutsStore.createWorkout(data)`
4. Creates version 1 of workout
5. **Success:**
   - Toast: "Workout [name] created successfully"
   - Navigates to new workout detail page
6. **Error:**
   - Error message displayed in error summary
   - User can correct and retry

---

## Available Actions

| Action                  | Trigger                              | Destination                               |
| ----------------------- | ------------------------------------ | ----------------------------------------- |
| Save Workout            | "Create Workout" button (when valid) | [`/compendium/workouts/:id`](./detail.md) |
| Cancel                  | "Cancel" button                      | [`/compendium/workouts`](./list.md)       |
| Confirm Unsaved Changes | Attempt navigation with changes      | Confirmation dialog                       |
| Add Section             | "Add Section" button                 | Same page (updates form)                  |
| Remove Section          | Section remove button                | Same page (updates form)                  |
| Add Exercise            | "Add Exercise" button in section     | Same page (updates form)                  |
| Remove Exercise         | Exercise remove button               | Same page (updates form)                  |
| Reorder Exercise        | Drag-and-drop                        | Same page (updates form)                  |

---

## Guards

### Unsaved Changes Guard

- Applied via `canDeactivate: [unsavedChangesGuard]`
- Tracks form state changes
- Prompts confirmation when leaving with unsaved data
- Automatically bypassed after successful submission

---

## Related Pages

- [Workout List](./list.md) - Return to workout library
- [Workout Detail](./detail.md) - View created workout
