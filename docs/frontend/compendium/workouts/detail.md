# `/compendium/workouts/:id` - Workout Detail

**Goal**: Display comprehensive workout structure and enable user adoption. Hub for workout exploration and import.

---

## UX Flows

### View Workout Information

**Header Section:**

- Workout name (title)
- "Workout Template" (subtitle)
- Back button to workouts list
- **"Version History"** action link (when multiple versions exist)
- **"Add to My Workouts"** action button
- **"Edit Workout"** primary action (only for latest version)

**Information Section:**

1. **Description**

   - Workout description
   - Only shown if description exists

2. **Metadata**
   - Section count
   - Total exercises
   - Version number (v1, v2, etc.)

### View Workout Structure

**Color-Coded Sections:**

| Section Type | Icon | Color  |
| ------------ | ---- | ------ |
| Warmup       | 🔥   | Orange |
| Stretching   | 🧘   | Purple |
| Strength     | 💪   | Blue   |
| Cooldown     | ❄️   | Cyan   |

Each section displays:

- Section name and type
- Exercise count
- Ordered list of exercises with:
  - Exercise name (clickable link to [`/compendium/exercises/:id`](../exercises/detail.md))
  - Rest between sets (seconds)
  - Break after exercise (seconds)

### Version History

- **"Version History"** action button
- Only shown when workout has multiple versions
- Navigates to [`/compendium/workouts/:id/versions`](./versions.md)

### Add to My Workouts

1. Click **"Add to My Workouts"** button
2. Button shows loading state
3. Calls `UserWorkoutsStore.addWorkout({ workoutTemplateId })`
4. **Success:**
   - Redirects to `/user/workouts/:id` (user workout detail)
   - Workout now in user's personal collection
5. **Already Added:**
   - Shows "Added" badge instead of button
   - Indicates workout already in collection

### Edit Workout

- **"Edit Workout"** button in header
- Only shown for latest version
- Hidden on older versions (read-only)
- Navigates to [`/compendium/workouts/:id/edit`](./edit.md)

### Navigate Back

- Back button returns to [`/compendium/workouts`](./list.md)

---

## Available Actions

| Action               | Trigger                                     | Destination                                           |
| -------------------- | ------------------------------------------- | ----------------------------------------------------- |
| Edit Workout         | "Edit Workout" button (latest version only) | [`/compendium/workouts/:id/edit`](./edit.md)          |
| View Version History | "Version History" button                    | [`/compendium/workouts/:id/versions`](./versions.md)  |
| Add to My Workouts   | "Add to My Workouts" button                 | `/user/workouts/:id` (user workout detail)            |
| View Exercise        | Click exercise name                         | [`/compendium/exercises/:id`](../exercises/detail.md) |
| Back to List         | Back button                                 | [`/compendium/workouts`](./list.md)                   |

---

## Data Loading

- Loads via `WorkoutsStore.loadWorkout(id)`
- Fetches workout details by ID from route params
- Shows loading state while fetching
- Loads exercise names separately

---

## Related Pages

- [Workout List](./list.md) - Browse all workouts
- [Edit Workout](./edit.md) - Modify workout (creates new version)
- [Version History](./versions.md) - View all versions
- [Exercise Detail](../exercises/detail.md) - View exercises in workout
- [User Workout Detail](../../user/workouts/detail.md) - View imported workout
