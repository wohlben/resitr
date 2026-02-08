# `/compendium/exercises/:id` - Exercise Detail

**Goal**: Display comprehensive exercise information and exercise relationships. Central hub for exercise exploration.

---

## UX Flows

### View Exercise Information

**Header Section:**

- Exercise name (title)
- Exercise type (subtitle)
- Back button to exercise list
- **"Edit Exercise"** primary action button

**Information Cards:**

1. **Description Section**

   - Description text
   - Alternative names (if any)

2. **Technical Metadata**

   - Technical difficulty level
   - Body weight scaling percentage

3. **Muscle Groups**

   - Primary muscles (blue tags)
   - Secondary muscles (gray tags, if any)

4. **Exercise Characteristics**

   - Force types (push, pull, etc.)
   - Measurement paradigms (reps, time, etc.)

5. **Equipment**

   - List of required equipment
   - Clickable tags link to equipment detail
   - Shows loading state while fetching equipment names

6. **Instructions**

   - Ordered list of step-by-step instructions
   - Only shown if instructions exist

7. **Images**

   - Grid of exercise images
   - Click to view full size
   - Only shown if images exist

8. **Author**
   - Author name and URL
   - External link to author website
   - Only shown if author info exists

### View Exercise Relationships

**Groups Section:**

- Shows which exercise groups contain this exercise
- Group names displayed as tags
- Shows loading state while fetching
- "This exercise is not part of any groups" if empty

**Related Exercises Section:**

- Lists exercises with relationship to current exercise
- Relationship types displayed as badges:
  - Progression (harder variant)
  - Regression (easier variant)
  - Variation (similar movement)
  - Alternative (different exercise, same purpose)
- Exercise names link to their detail pages
- Shows loading state while fetching
- "No related exercises found" if empty

### Edit Exercise

- **"Edit Exercise"** button in header
- Navigates to [`/compendium/exercises/:id/edit`](./edit.md)

### Navigate Back

- Back button returns to [`/compendium/exercises`](./list.md)

### View Related Equipment

- Click equipment tags in equipment section
- Navigates to [`/compendium/equipments/:id`](../equipments/detail.md)

### View Related Exercises

- Click exercise names in related exercises section
- Navigates to [`/compendium/exercises/:id`](./detail.md)

---

## Available Actions

| Action                | Trigger                     | Destination                                                       |
| --------------------- | --------------------------- | ----------------------------------------------------------------- |
| Edit Exercise         | "Edit Exercise" button      | [`/compendium/exercises/:id/edit`](./edit.md)                     |
| View Equipment        | Click equipment tag         | [`/compendium/equipments/:id`](../equipments/detail.md)           |
| View Related Exercise | Click related exercise link | [`/compendium/exercises/:id`](./detail.md)                        |
| View Group            | Click group name            | [`/compendium/exercise-groups/:id`](../exercise-groups/detail.md) |
| Back to List          | Back button                 | [`/compendium/exercises`](./list.md)                              |

---

## Data Loading

### Exercise Data

- Loads via `ExercisesStore.loadExercise(id)`
- Fetches exercise details by ID from route params
- Shows loading state while fetching

### Related Data

- **Equipment**: Fetched separately, shows loading indicator
- **Groups**: Fetched separately, shows loading indicator
- **Relationships**: Fetched separately, shows loading indicator
- Each section loads independently for better UX

---

## Related Pages

- [Exercise List](./list.md) - Browse all exercises
- [Edit Exercise](./edit.md) - Modify exercise and relationships
- [Equipment Detail](../equipments/detail.md) - View equipment used by exercises
- [Exercise Group Detail](../exercise-groups/detail.md) - View groups containing exercises
