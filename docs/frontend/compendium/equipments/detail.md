# `/compendium/equipments/:id` - Equipment Detail

**Goal**: Display comprehensive equipment information. Reference page for equipment specifications.

---

## UX Flows

### View Equipment Information

**Header Section:**

- Display name (title) - human-readable name
- Internal name (subtitle) - system identifier
- Back button to equipment list
- **"Edit Equipment"** primary action button

**Equipment Card:**

1. **Image**

   - Large equipment image at top (if available)
   - Aspect ratio maintained
   - Fallback placeholder if no image

2. **Category**

   - Equipment category with human-readable label
   - Uses `EquipmentCategoryLabels`
   - Examples: Barbell, Dumbbell, Machine, Bodyweight

3. **Description**

   - Detailed equipment description
   - Formatted text with whitespace preservation
   - Only shown if description exists

4. **Substitutes**
   - List of equipment that can replace this
   - Shows internal names
   - Mono-spaced display for clarity
   - "None" or hidden if no substitutes

### Edit Equipment

- **"Edit Equipment"** button in header
- Navigates to [`/compendium/equipments/:id/edit`](./edit.md)

### Navigate Back

- Back button returns to [`/compendium/equipments`](./list.md)

---

## Available Actions

| Action         | Trigger                 | Destination                                    |
| -------------- | ----------------------- | ---------------------------------------------- |
| Edit Equipment | "Edit Equipment" button | [`/compendium/equipments/:id/edit`](./edit.md) |
| Back to List   | Back button             | [`/compendium/equipments`](./list.md)          |

---

## Data Loading

- Loads via `EquipmentsStore.loadEquipment(id)`
- Fetches equipment details by ID from route params
- Shows loading state while fetching
- Displays error if equipment not found

---

## Related Pages

- [Equipment List](./list.md) - Browse all equipment
- [Edit Equipment](./edit.md) - Modify equipment details
- [Exercise Detail](../exercises/detail.md) - View exercises using this equipment
