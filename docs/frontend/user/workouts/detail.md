# `/user/workouts/:id` - User Workout Detail

**Goal**: Display user's workout instance with exercise scheme assignments and progress indicators. Shows structure from template with personal configuration status.

---

## UX Flows

### View Workout Structure

**Header Section:**

- Title: Workout name (from template)
- Subtitle: "My Workout"
- Back button: Returns to My Workouts list
- **"View Template"** button: Links to compendium source
- **"Edit Schemes"** button: Primary action for configuration

**Workout Information:**

- Description from template
- Metadata grid:
  - Section count
  - Total exercises
  - Template version (v1, v2, etc.)

### Section Display

Workout sections shown as color-coded cards:

| Section Type | Icon | Color  |
| ------------ | ---- | ------ |
| Warmup       | 🔥   | Orange |
| Stretching   | 🧘   | Purple |
| Strength     | 💪   | Blue   |
| Cooldown     | ❄️   | Cyan   |

Each section displays:

- Section name and type
- Exercise count
- Ordered list of exercises

### Exercise Items

Each exercise shows:

- Sequential number (1., 2., 3., etc.)
- Exercise name (links to compendium detail)
- Rest configuration:
  - Break between sets (in seconds)
  - Break after exercise (in seconds)
- **Scheme assignment status indicator**

### Scheme Assignment Status

Visual indicators help track configuration progress:

- **✅ Green Checkmark**: Scheme configured for this exercise

  - Tooltip: "Scheme configured"
  - Indicates ready to perform

- **⚠️ Amber Warning**: Needs scheme setup
  - Tooltip: "Needs scheme setup"
  - Indicates configuration required

### View Exercise Details

- Click exercise name to view compendium exercise
- Opens exercise detail page
- Shows full exercise metadata

### Edit Exercise Schemes

- **"Edit Schemes"** primary button in header
- Navigates to scheme configuration page
- Allows assigning schemes to each exercise

### View Original Template

- **"View Template"** secondary button in header
- Links to compendium workout detail
- Shows original template structure and version history

---

## Available Actions

| Action        | Trigger                | Destination                                                                       |
| ------------- | ---------------------- | --------------------------------------------------------------------------------- |
| Edit Schemes  | "Edit Schemes" button  | [`/user/workouts/:id/edit`](./edit.md)                                            |
| View Template | "View Template" button | [`/compendium/workouts/:templateId`](../../compendium/workouts.md#workout-detail) |
| View Exercise | Click exercise name    | [`/compendium/exercises/:id`](../../compendium/exercises.md#exercise-detail)      |
| Back to List  | Back button            | [`/user/workouts`](./list.md)                                                     |

---

## Data Sources

The page combines data from multiple sources:

### User Workout Record

- User workout ID
- Reference to workout template ID
- Creation date (when added to user's collection)

### Template Data (from Compendium)

- Workout name and description
- Section structure
- Exercise IDs and rest periods
- Template version

### Exercise Names

- Resolved from exercises store
- Maps exercise IDs to display names

### Scheme Assignment Status

- Checked against user exercise schemes store
- Determines if scheme is assigned to each section item

---

## State Handling

### Loading State

- Full-page loading spinner
- Message: "Loading workout..."
- Waits for user workouts, template, and exercises data

### Error State

- Error loading card
- Title: "Error loading workout"
- Shows error message from store

### Not Found State

- Error loading card
- Title: "Workout not found"
- Message: "The requested workout could not be found."
- Shown when workout ID doesn't exist in user's collection

---

## Related Pages

- [Workout List](./list.md) - Browse all my workouts
- [Edit Schemes](./edit.md) - Configure exercise schemes
- [Compendium Workout](../../compendium/workouts.md) - View template source
- [Compendium Exercise](../../compendium/exercises.md) - View exercise details
