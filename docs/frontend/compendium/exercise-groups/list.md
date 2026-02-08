# `/compendium/exercise-groups` - Exercise Group List

**Goal**: Browse, search, and filter exercise groups. Primary entry point for group management.

---

## UX Flows

### Browse Exercise Groups

- Paginated list of group cards
- Each card displays:
  - Group name
  - Description preview
  - Exercise count (number of exercises in group)
- Empty state when no groups match filters

### Filter Groups

- **Search by name**: Text search on group name
- Filter by various criteria (extensible)
- Real-time filtering updates results
- Filters applied via `ExerciseGroupsFilterComponent`

### Create New Group

- **"New Group"** primary action button in header
- Navigates to [`/compendium/exercise-groups/new`](./new.md)

### View Group Detail

- Click any group card
- Navigates to [`/compendium/exercise-groups/:id`](./detail.md)

---

## Available Actions

| Action         | Trigger                       | Destination                                      |
| -------------- | ----------------------------- | ------------------------------------------------ |
| Create Group   | "New Group" button            | [`/compendium/exercise-groups/new`](./new.md)    |
| View Group     | Click group card              | [`/compendium/exercise-groups/:id`](./detail.md) |
| Filter         | Filter component interactions | Same page (updates list)                         |
| Navigate Pages | Pagination controls           | Same page (different offset)                     |

---

## State Handling

### Loading State

- Full-page loading with message: "Loading exercise groups..."
- Spinner displayed while fetching from `ExerciseGroupsStore`

### Error State

- Error loading card
- Title: "Error loading exercise groups"
- Shows error message from store

### Empty State

- Centered icon and message
- "No exercise groups found matching your criteria"
- Shown when filters exclude all groups

---

## Related Pages

- [Group Detail](./detail.md) - View specific group
- [Create Group](./new.md) - Create new exercise group
