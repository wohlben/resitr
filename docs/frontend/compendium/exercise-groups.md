# Exercise Group Compendium Pages

This document describes the UX flows and actions available on exercise group-related compendium pages.

---

## `/compendium/exercise-groups` - Exercise Group List

**Goal**: Browse, search, and filter exercise groups. Primary entry point for group management.

### UX Flows

1. **Browse Exercise Groups**

   - Paginated list of group cards
   - Each card displays: name, description preview, exercise count
   - Empty state when no groups match filters

2. **Filter Groups**

   - Search by name
   - Filter by various criteria
   - Real-time filtering updates results

3. **Create New Group**

   - Primary action button in header
   - Navigates to `/compendium/exercise-groups/new`

4. **View Group Detail**
   - Click any group card
   - Navigates to `/compendium/exercise-groups/:id`

### Available Actions

| Action         | Trigger                       | Destination                                                     |
| -------------- | ----------------------------- | --------------------------------------------------------------- |
| Create Group   | "New Group" button            | [`/compendium/exercise-groups/new`](./exercise-group-new.md)    |
| View Group     | Click group card              | [`/compendium/exercise-groups/:id`](./exercise-group-detail.md) |
| Filter         | Filter component interactions | Same page (updates list)                                        |
| Navigate Pages | Pagination controls           | Same page (different offset)                                    |

---

## `/compendium/exercise-groups/:id` - Exercise Group Detail

**Goal**: Display group information and list member exercises.

### UX Flows

1. **View Group Information**

   - Header with group name
   - Description
   - Creation and update timestamps

2. **View Group Members**

   - List of exercises in the group
   - Each member shows: exercise name, date added
   - Links to exercise detail pages
   - Empty state when group has no exercises

3. **Edit Group**

   - "Edit Group" button in header
   - Navigates to `/compendium/exercise-groups/:id/edit`

4. **Navigate Back**

   - Back button returns to groups list

5. **View Exercise**
   - Click any exercise name to view its details

### Available Actions

| Action        | Trigger             | Destination                                                        |
| ------------- | ------------------- | ------------------------------------------------------------------ |
| Edit Group    | "Edit Group" button | [`/compendium/exercise-groups/:id/edit`](./exercise-group-edit.md) |
| View Exercise | Click exercise name | [`/compendium/exercises/:id`](./exercise-detail.md)                |
| Back to List  | Back button         | [`/compendium/exercise-groups`](./exercise-groups.md)              |

---

## `/compendium/exercise-groups/new` - Create Exercise Group

**Goal**: Create a new exercise group template.

### UX Flows

1. **Fill Group Form**

   - Name (required) - group identifier
   - Description - purpose and details about the group

2. **Validation**

   - Real-time form validation
   - Error summary display
   - Submit button disabled until valid

3. **Cancel Creation**

   - Cancel button returns to groups list
   - Unsaved changes confirmation dialog

4. **Save Group**
   - Submit button creates group
   - Loading state during save
   - Success: Navigate to new group detail
   - Error: Display error message

### Available Actions

| Action                  | Trigger                            | Destination                                                     |
| ----------------------- | ---------------------------------- | --------------------------------------------------------------- |
| Save Group              | "Create Group" button (when valid) | [`/compendium/exercise-groups/:id`](./exercise-group-detail.md) |
| Cancel                  | "Cancel" button                    | [`/compendium/exercise-groups`](./exercise-groups.md)           |
| Confirm Unsaved Changes | Attempt navigation with changes    | Confirmation dialog                                             |

### Guards

- **Unsaved Changes Guard**: Prompts confirmation when leaving with unsaved form data

---

## `/compendium/exercise-groups/:id/edit` - Edit Exercise Group

**Goal**: Modify group details and manage group membership.

### UX Flows

1. **Edit Group Details**

   - Pre-populated form with current values
   - Name and description fields
   - Tracks changes for unsaved guard

2. **Manage Group Members**

   - **Add Member**: Search and select exercise from dropdown
   - **Remove Member**: Click X next to exercise name
   - Links to exercise detail pages
   - Exercise list sorted alphabetically

3. **Delete Group**

   - "Delete Group" button (danger)
   - Confirmation dialog
   - Success: Return to groups list

4. **Save Changes**

   - Submit updates group
   - Navigates to group detail on success

5. **Cancel Edit**
   - Returns to group detail
   - Unsaved changes confirmation

### Available Actions

| Action        | Trigger                         | Destination                                                     |
| ------------- | ------------------------------- | --------------------------------------------------------------- |
| Save Changes  | "Save Changes" button           | [`/compendium/exercise-groups/:id`](./exercise-group-detail.md) |
| Delete Group  | "Delete Group" button + confirm | [`/compendium/exercise-groups`](./exercise-groups.md)           |
| Cancel        | "Cancel" button                 | [`/compendium/exercise-groups/:id`](./exercise-group-detail.md) |
| Add Member    | Select exercise from dropdown   | Same page (updates list)                                        |
| Remove Member | Click X on member               | Same page (updates list)                                        |
| View Exercise | Click exercise name             | [`/compendium/exercises/:id`](./exercise-detail.md)             |

### Guards

- **Unsaved Changes Guard**: Prompts confirmation when leaving with unsaved changes

---

## Related Pages

- [Exercises](./exercises.md) - Browse exercises that can be added to groups
- [Exercise Detail](./exercise-detail.md) - View and manage exercise group membership
