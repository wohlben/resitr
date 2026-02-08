# `/compendium/equipments/new` - Create Equipment

**Goal**: Create a new equipment template. Define fitness equipment for use in exercises.

---

## UX Flows

### Fill Equipment Form

**Form Fields:**

1. **Display Name** (required)

   - Human-readable name
   - Example: "Olympic Barbell", "Dumbbell Set"

2. **Internal Name** (required)

   - System identifier
   - Used in code and APIs
   - Example: "olympic-barbell", "dumbbell-set"

3. **Category** (required)

   - Selection: barbell, dumbbell, machine, bodyweight, etc.
   - Uses `EquipmentCategoryLabels`

4. **Description**

   - Detailed equipment information
   - Usage guidelines, specifications

5. **Image URL**

   - URL to equipment photo
   - Displayed on detail page

6. **Substitutes For** (multi-select)
   - Other equipment this can replace
   - Example: "Dumbbell" can substitute for "Kettlebell" in some exercises
   - Select from existing equipment

### Validation

- Real-time form validation via `EquipmentFormComponent`
- Error summary displayed below form
- Submit button disabled until form is valid
- Display name and internal name required

### Cancel Creation

- **"Cancel"** button returns to equipment list
- If form has data: Shows unsaved changes confirmation dialog
- Options: "Stay" (keep editing) or "Leave" (discard changes)

### Save Equipment

1. User clicks **"Create Equipment"** (disabled if invalid)
2. Button shows loading state with spinner
3. Calls `EquipmentsStore.createEquipment(data)`
4. **Success:**
   - Toast: "Equipment [displayName] created successfully"
   - Navigates to new equipment detail page
5. **Error:**
   - Error message displayed in error summary
   - User can correct and retry

---

## Available Actions

| Action                  | Trigger                                | Destination                                 |
| ----------------------- | -------------------------------------- | ------------------------------------------- |
| Save Equipment          | "Create Equipment" button (when valid) | [`/compendium/equipments/:id`](./detail.md) |
| Cancel                  | "Cancel" button                        | [`/compendium/equipments`](./list.md)       |
| Confirm Unsaved Changes | Attempt navigation with changes        | Confirmation dialog                         |

---

## Guards

### Unsaved Changes Guard

- Applied via `canDeactivate: [unsavedChangesGuard]`
- Tracks form state changes
- Prompts confirmation when leaving with unsaved data
- Automatically bypassed after successful submission

---

## Related Pages

- [Equipment List](./list.md) - Return to equipment library
- [Equipment Detail](./detail.md) - View created equipment
