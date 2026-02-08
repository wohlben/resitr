# `/compendium/equipments` - Equipment List

**Goal**: Browse, search, and filter the equipment template library. Primary entry point for equipment management.

---

## UX Flows

### Browse Equipment

- Paginated list of equipment cards
- Each card displays:
  - Display name (human-readable)
  - Category with icon
  - Image thumbnail (if available)
- Empty state when no equipment matches filters

### Filter Equipment

- **Filter by equipment category**: barbell, dumbbell, machine, bodyweight, etc.
- **Search by name**: Text search on display name
- Real-time filtering updates results
- Filters applied via `EquipmentsFilterComponent`

### Create New Equipment

- **"New Equipment"** primary action button in header
- Navigates to [`/compendium/equipments/new`](./new.md)

### View Equipment Detail

- Click any equipment card
- Navigates to [`/compendium/equipments/:id`](./detail.md)

---

## Available Actions

| Action           | Trigger                       | Destination                                 |
| ---------------- | ----------------------------- | ------------------------------------------- |
| Create Equipment | "New Equipment" button        | [`/compendium/equipments/new`](./new.md)    |
| View Equipment   | Click equipment card          | [`/compendium/equipments/:id`](./detail.md) |
| Filter           | Filter component interactions | Same page (updates list)                    |
| Navigate Pages   | Pagination controls           | Same page (different offset)                |

---

## State Handling

### Loading State

- Full-page loading with message: "Loading equipments..."
- Spinner displayed while fetching from `EquipmentsStore`

### Error State

- Error loading card
- Title: "Error loading equipments"
- Shows error message from store

### Empty State

- Centered icon and message
- "No equipments found matching your criteria"
- Shown when filters exclude all equipment

---

## Related Pages

- [Equipment Detail](./detail.md) - View specific equipment
- [Create Equipment](./new.md) - Create new equipment template
