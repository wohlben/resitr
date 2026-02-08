# Equipment Compendium Pages

This document describes the UX flows and actions available on equipment-related compendium pages.

---

## `/compendium/equipments` - Equipment List

**Goal**: Browse, search, and filter the equipment template library. Primary entry point for equipment management.

### UX Flows

1. **Browse Equipment**

   - Paginated list of equipment cards
   - Each card displays: display name, category, image thumbnail
   - Empty state when no equipment matches filters

2. **Filter Equipment**

   - Filter by equipment category
   - Search by name
   - Real-time filtering updates results

3. **Create New Equipment**

   - Primary action button in header
   - Navigates to `/compendium/equipments/new`

4. **View Equipment Detail**
   - Click any equipment card
   - Navigates to `/compendium/equipments/:id`

### Available Actions

| Action           | Trigger                       | Destination                                           |
| ---------------- | ----------------------------- | ----------------------------------------------------- |
| Create Equipment | "New Equipment" button        | [`/compendium/equipments/new`](./equipment-new.md)    |
| View Equipment   | Click equipment card          | [`/compendium/equipments/:id`](./equipment-detail.md) |
| Filter           | Filter component interactions | Same page (updates list)                              |
| Navigate Pages   | Pagination controls           | Same page (different offset)                          |

---

## `/compendium/equipments/:id` - Equipment Detail

**Goal**: Display comprehensive equipment information.

### UX Flows

1. **View Equipment Information**

   - Header with display name and internal name
   - Large equipment image (if available)
   - Category with human-readable label
   - Description with formatted text
   - Substitutes list (other equipment that can replace this)

2. **Edit Equipment**

   - "Edit Equipment" button in header
   - Navigates to `/compendium/equipments/:id/edit`

3. **Navigate Back**
   - Back button returns to equipment list

### Available Actions

| Action         | Trigger                 | Destination                                              |
| -------------- | ----------------------- | -------------------------------------------------------- |
| Edit Equipment | "Edit Equipment" button | [`/compendium/equipments/:id/edit`](./equipment-edit.md) |
| Back to List   | Back button             | [`/compendium/equipments`](./equipments.md)              |

---

## `/compendium/equipments/new` - Create Equipment

**Goal**: Create a new equipment template.

### UX Flows

1. **Fill Equipment Form**

   - Display name (required) - human-readable name
   - Internal name (required) - system identifier
   - Category selection (barbell, dumbbell, machine, etc.)
   - Description - detailed information
   - Image URL - equipment photo
   - Substitutes for - multi-select of other equipment

2. **Validation**

   - Real-time form validation
   - Error summary display
   - Submit button disabled until valid

3. **Cancel Creation**

   - Cancel button returns to equipment list
   - Unsaved changes confirmation dialog

4. **Save Equipment**
   - Submit button creates equipment
   - Loading state during save
   - Success: Navigate to new equipment detail
   - Error: Display error message

### Available Actions

| Action                  | Trigger                                | Destination                                           |
| ----------------------- | -------------------------------------- | ----------------------------------------------------- |
| Save Equipment          | "Create Equipment" button (when valid) | [`/compendium/equipments/:id`](./equipment-detail.md) |
| Cancel                  | "Cancel" button                        | [`/compendium/equipments`](./equipments.md)           |
| Confirm Unsaved Changes | Attempt navigation with changes        | Confirmation dialog                                   |

### Guards

- **Unsaved Changes Guard**: Prompts confirmation when leaving with unsaved form data

---

## `/compendium/equipments/:id/edit` - Edit Equipment

**Goal**: Modify equipment details.

### UX Flows

1. **Edit Equipment Details**

   - Pre-populated form with current values
   - Same fields as create form
   - Tracks changes for unsaved guard

2. **Delete Equipment**

   - "Delete Equipment" button (danger)
   - Confirmation dialog
   - Success: Return to equipment list
   - Error: Display error (if equipment is in use)

3. **Save Changes**

   - Submit updates equipment
   - Navigates to equipment detail on success

4. **Cancel Edit**
   - Returns to equipment detail
   - Unsaved changes confirmation

### Available Actions

| Action           | Trigger                             | Destination                                           |
| ---------------- | ----------------------------------- | ----------------------------------------------------- |
| Save Changes     | "Save Changes" button               | [`/compendium/equipments/:id`](./equipment-detail.md) |
| Delete Equipment | "Delete Equipment" button + confirm | [`/compendium/equipments`](./equipments.md)           |
| Cancel           | "Cancel" button                     | [`/compendium/equipments/:id`](./equipment-detail.md) |

### Guards

- **Unsaved Changes Guard**: Prompts confirmation when leaving with unsaved changes

---

## Related Pages

- [Exercises](./exercises.md) - Browse exercises that use this equipment
- [Exercise Detail](./exercise-detail.md) - View exercises with equipment links
