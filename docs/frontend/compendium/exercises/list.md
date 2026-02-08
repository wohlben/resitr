# `/compendium/exercises` - Exercise List

**Goal**: Browse, search, and filter the exercise template library. Primary entry point for exercise management.

---

## UX Flows

### Browse Exercises

- Paginated list of exercise cards
- Each card displays:
  - Exercise name
  - Type (strength, cardio, etc.)
  - Technical difficulty level
  - Primary muscle groups
- Empty state when no exercises match filters

### Filter Exercises

- **Filter by exercise type**: strength, cardio, flexibility, etc.
- **Filter by technical difficulty**: beginner, intermediate, advanced
- **Filter by primary muscle groups**: multi-select muscle targeting
- Real-time filtering updates results
- Filters applied via `ExercisesFilterComponent`

### Create New Exercise

- **"New Exercise"** primary action button in header
- Navigates to [`/compendium/exercises/new`](./new.md)

### View Exercise Detail

- Click any exercise card
- Navigates to [`/compendium/exercises/:id`](./detail.md)

---

## Available Actions

| Action          | Trigger                       | Destination                                |
| --------------- | ----------------------------- | ------------------------------------------ |
| Create Exercise | "New Exercise" button         | [`/compendium/exercises/new`](./new.md)    |
| View Exercise   | Click exercise card           | [`/compendium/exercises/:id`](./detail.md) |
| Filter          | Filter component interactions | Same page (updates list)                   |
| Navigate Pages  | Pagination controls           | Same page (different offset)               |

---

## State Handling

### Loading State

- Full-page loading with message: "Loading exercises..."
- Spinner displayed while fetching from `ExercisesStore`

### Error State

- Error loading card
- Title: "Error loading exercises"
- Shows error message from store

### Empty State

- Centered icon and message
- "No exercises found matching your criteria"
- Shown when filters exclude all exercises

---

## Related Pages

- [Exercise Detail](./detail.md) - View specific exercise
- [Create Exercise](./new.md) - Create new exercise template
