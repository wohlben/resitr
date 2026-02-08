# `/compendium/workouts/:id/versions` - Workout Version History

**Goal**: View and navigate between workout versions. Browse the evolution of a workout template.

---

## UX Flows

### View Version History

**Header Section:**

- Title: "Version History"
- Workout name (subtitle)
- Back button to current workout detail

**Version Table:**

- Columns:

  - **Version**: Version number (v1, v2, v3, etc.)
  - **Updated At**: Date and time of version creation

- **Version Number Link:**

  - Click to view that specific version
  - Navigates to [`/compendium/workouts/:templateId`](./detail.md)

- **Badges:**
  - **"Latest"**: Most recent version
  - **"Current"**: Version currently being viewed

### Navigate to Version

1. Click version number in table
2. Navigates to that version's detail page
3. Shows structure as it existed in that version
4. Can view any historical version

### Edit Current Version

- **"Edit Current"** button in header
- Only shown when viewing latest version
- Hidden on older versions (read-only)
- Navigates to [`/compendium/workouts/:id/edit`](./edit.md)

### Navigate Back

- Back button returns to [`/compendium/workouts/:id`](./detail.md)
- Returns to the version user was viewing

---

## Available Actions

| Action          | Trigger                                | Destination                                  |
| --------------- | -------------------------------------- | -------------------------------------------- |
| View Version    | Click version number                   | [`/compendium/workouts/:id`](./detail.md)    |
| Edit Current    | "Edit Current" button (latest version) | [`/compendium/workouts/:id/edit`](./edit.md) |
| Back to Workout | Back button                            | [`/compendium/workouts/:id`](./detail.md)    |

---

## Data Loading

- Loads via `WorkoutsStore.loadWorkout(id)`
- Fetches workout and its version history
- `versionHistory()` signal contains all versions
- `latestVersion()` signal identifies most recent

---

## Empty State

- **"No version history available"**
- Shown when workout has no version history
- Usually indicates single version (v1) only

---

## Versioning Context

This page shows the immutable versioning system:

- Each edit creates a new version
- All versions remain accessible
- Users can reference historical versions
- Template IDs are unique per version

This is particularly important for **user workouts**, which reference specific template versions. Users can see exactly what a workout looked like when they added it to their collection.

---

## Related Pages

- [Workout Detail](./detail.md) - View specific version
- [Edit Workout](./edit.md) - Edit current version
- [Workout List](./list.md) - Browse all workouts
