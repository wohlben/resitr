# `/compendium/exercises/new` - Create Exercise

**Goal**: Create a new exercise template with comprehensive metadata. Entry point for adding exercises to the compendium.

---

## UX Flows

### Fill Exercise Form

**Form Fields:**

1. **Name** (required)

   - Exercise name
   - Must be unique

2. **Type** (required)

   - Selection: strength, cardio, flexibility, etc.
   - Uses `ExerciseTypeLabels` for display

3. **Technical Difficulty**

   - Selection: beginner, intermediate, advanced
   - Uses `TechnicalDifficultyLabels`

4. **Body Weight Scaling**

   - Percentage (0-100%)
   - How much body weight contributes to resistance

5. **Muscle Groups** (multi-select)

   - **Primary Muscles**: Main muscles targeted
   - **Secondary Muscles**: Supporting muscles
   - Uses `MuscleLabels`

6. **Force Types** (multi-select)

   - Push, pull, etc.
   - Uses `ForceTypeLabels`

7. **Measurement Paradigms** (multi-select)

   - Reps, time, distance, etc.
   - Uses `MeasurementParadigmLabels`

8. **Equipment** (multi-select)

   - Select from compendium equipment
   - Multiple items allowed

9. **Instructions** (dynamic list)

   - Add/remove instruction steps
   - Ordered list

10. **Images** (URLs)

    - Add image URLs
    - Multiple images supported

11. **Alternative Names**

    - Other names for this exercise
    - Comma-separated or list input

12. **Author Information**
    - Author name
    - Author URL (external link)

### Validation

- Real-time form validation via `ExerciseFormComponent`
- Error summary displayed below form
- Submit button disabled until form is valid
- Field-level validation messages

### Cancel Creation

- **"Cancel"** button returns to exercise list
- If form has data: Shows unsaved changes confirmation dialog
- Options: "Stay" (keep editing) or "Leave" (discard changes)

### Save Exercise

1. User clicks **"Create Exercise"** (disabled if invalid)
2. Button shows loading state with spinner
3. Calls `ExercisesStore.createExercise(data)`
4. **Success:**
   - Toast: "Exercise [name] created successfully"
   - Navigates to new exercise detail page
5. **Error:**
   - Error message displayed in error summary
   - User can correct and retry

---

## Available Actions

| Action                  | Trigger                               | Destination                                |
| ----------------------- | ------------------------------------- | ------------------------------------------ |
| Save Exercise           | "Create Exercise" button (when valid) | [`/compendium/exercises/:id`](./detail.md) |
| Cancel                  | "Cancel" button                       | [`/compendium/exercises`](./list.md)       |
| Confirm Unsaved Changes | Attempt navigation with changes       | Confirmation dialog                        |

---

## Guards

### Unsaved Changes Guard

- Applied via `canDeactivate: [unsavedChangesGuard]`
- Tracks form state changes
- Prompts confirmation when leaving with unsaved data
- Automatically bypassed after successful submission

---

## Related Pages

- [Exercise List](./list.md) - Return to exercise library
- [Exercise Detail](./detail.md) - View created exercise
