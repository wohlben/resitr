# `/compendium/equipments/:id/edit` - Edit Equipment

**Goal**: Modify equipment details. Update equipment specifications and substitute relationships.

---

## UX Flows

### Edit Equipment Details

- Pre-populated form with current equipment values
- Same fields as create form (see [Create Equipment](./new.md))
- Tracks changes for unsaved guard
- Real-time validation

### Delete Equipment

1. Click **"Delete Equipment"** button (danger style)
2. Confirmation dialog appears:
   - Title: "Delete Equipment"
   - Message: "Are you sure you want to delete [displayName]?"
   - Actions: "Cancel", "Delete" (destructive)
3. On confirm:
   - Calls `EquipmentsStore.deleteEquipment(id)`
   - Shows loading state
4. **Success:**
   - Toast: "[displayName] deleted successfully"
   - Navigates to equipment list
5. **Error:**
   - Error message displayed (e.g., if equipment is in use by exercises)
   - Dialog closes, user can retry

### Save Changes

1. Click **"Save Changes"** (disabled if invalid or no changes)
2. Button shows loading state
3. Calls `EquipmentsStore.updateEquipment(id, data)`
4. **Success:**
   - Toast: "Equipment [displayName] updated successfully"
   - Navigates to equipment detail
5. **Error:**
   - Error displayed in error summary
   - User can correct and retry

### Cancel Edit

- Click **"Cancel"** button
- If unsaved changes exist: Shows confirmation dialog
- Returns to [`/compendium/equipments/:id`](./detail.md)

---

## Available Actions

| Action           | Trigger                             | Destination                                 |
| ---------------- | ----------------------------------- | ------------------------------------------- |
| Save Changes     | "Save Changes" button               | [`/compendium/equipments/:id`](./detail.md) |
| Delete Equipment | "Delete Equipment" button + confirm | [`/compendium/equipments`](./list.md)       |
| Cancel           | "Cancel" button                     | [`/compendium/equipments/:id`](./detail.md) |

---

## Guards

### Unsaved Changes Guard

- Applied via `canDeactivate: [unsavedChangesGuard]`
- Compares current form data with initial data
- Prompts confirmation when leaving with unsaved changes
- Options: "Stay" (keep editing) or "Leave" (discard changes)

---

## Related Pages

- [Equipment Detail](./detail.md) - View equipment (cancel destination)
- [Equipment List](./list.md) - Browse equipment (delete destination)
- [Create Equipment](./new.md) - Field documentation reference
