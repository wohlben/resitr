# `/compendium/workouts` - Workout List

**Goal**: Browse, search, and filter the workout template library. Primary entry point for workout management.

---

## UX Flows

### Browse Workouts

- Paginated list of workout cards
- Each card displays:
  - Workout name
  - Description preview
  - Section count
  - Exercise count
- Empty state when no workouts match filters

### Filter Workouts

- **Search by name**: Text search on workout name
- Filter by various criteria (extensible)
- Real-time filtering updates results
- Filters applied via `WorkoutsFilterComponent`

### Create New Workout

- **"New Workout"** primary action button in header
- Navigates to [`/compendium/workouts/new`](./new.md)

### View Workout Detail

- Click any workout card
- Navigates to [`/compendium/workouts/:id`](./detail.md)

---

## Available Actions

| Action         | Trigger                       | Destination                               |
| -------------- | ----------------------------- | ----------------------------------------- |
| Create Workout | "New Workout" button          | [`/compendium/workouts/new`](./new.md)    |
| View Workout   | Click workout card            | [`/compendium/workouts/:id`](./detail.md) |
| Filter         | Filter component interactions | Same page (updates list)                  |
| Navigate Pages | Pagination controls           | Same page (different offset)              |

---

## State Handling

### Loading State

- Full-page loading with message: "Loading workouts..."
- Spinner displayed while fetching from `WorkoutsStore`

### Error State

- Error loading card
- Title: "Error loading workouts"
- Shows error message from store

### Empty State

- Centered icon and message
- "No workouts found matching your criteria"
- Shown when filters exclude all workouts

---

## Related Pages

- [Workout Detail](./detail.md) - View specific workout
- [Create Workout](./new.md) - Create new workout template
