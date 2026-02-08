# `/compendium/exercise-groups/:id` - Exercise Group Detail

**Goal**: Display group information and list member exercises. Hub for exploring exercise collections.

---

## UX Flows

### View Group Information

**Header Section:**

- Group name (title)
- "Exercise Group" (subtitle)
- Back button to groups list
- **"Edit Group"** primary action button

**Information Section:**

1. **Description**

   - Group description
   - Only shown if description exists

2. **Timestamps**
   - Created date
   - Last updated date (if different)
   - Formatted as medium date

### View Group Members

**Exercises in this Group Section:**

- List of exercises belonging to the group
- Each member shows:

  - Exercise name (clickable link)
  - Date added to group
  - Lightning bolt icon

- **Exercise Name Link:**

  - Click to navigate to exercise detail
  - Navigates to [`/compendium/exercises/:id`](../exercises/detail.md)

- **Loading State:**

  - Shows spinner while fetching members
  - "Loading exercises..." message

- **Empty State:**
  - "No exercises in this group yet"
  - Add exercises via edit page

### Edit Group

- **"Edit Group"** button in header
- Navigates to [`/compendium/exercise-groups/:id/edit`](./edit.md)

### Navigate Back

- Back button returns to [`/compendium/exercise-groups`](./list.md)

---

## Available Actions

| Action        | Trigger             | Destination                                           |
| ------------- | ------------------- | ----------------------------------------------------- |
| Edit Group    | "Edit Group" button | [`/compendium/exercise-groups/:id/edit`](./edit.md)   |
| View Exercise | Click exercise name | [`/compendium/exercises/:id`](../exercises/detail.md) |
| Back to List  | Back button         | [`/compendium/exercise-groups`](./list.md)            |

---

## Data Loading

- Loads via `ExerciseGroupsStore.loadExerciseGroup(id)`
- Fetches group details by ID from route params
- Shows loading state while fetching
- Loads members separately with loading indicator

---

## Related Pages

- [Group List](./list.md) - Browse all groups
- [Edit Group](./edit.md) - Modify group and members
- [Exercise Detail](../exercises/detail.md) - View exercises in group
