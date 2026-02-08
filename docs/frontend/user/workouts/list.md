# `/user/workouts` - My Workouts List

**Goal**: Display and manage the user's personal workout collection. Shows workouts adopted from the compendium.

---

## UX Flows

### Browse My Workouts

- List of user workout cards
- Each card displays:
  - Workout name
  - Description preview
  - Section and exercise count
  - Template version
  - Action menu
- Cards are clickable to view detail
- Empty state shown when no workouts added

### Import New Workout

- **"Import Workout"** button in header
- Links to compendium workout browser
- Navigates to `/compendium/workouts`

### Empty State

When user has no workouts:

- Icon and message: "You haven't added any workouts yet"
- **"Browse Workout Compendium"** CTA button
- Directs user to find and import workouts

### Workout Actions

Each workout card provides an action menu:

1. **View Logs**: Navigate to workout logs (placeholder)
2. **Schedule**: Navigate to schedule page (placeholder)
3. **Remove**: Delete workout from personal collection

### Remove Workout Flow

1. User selects "Remove" from action menu
2. Confirmation dialog appears:
   - Title: "Remove from My Workouts"
   - Message: "Are you sure you want to remove [name] from your workouts? This won't delete the workout from the compendium."
   - Actions: "Cancel", "Remove" (destructive)
3. On confirm: Removes workout from user's collection
4. Success toast: "[name] removed from your workouts"
5. List updates without page refresh

---

## Available Actions

| Action            | Trigger                        | Destination                                            |
| ----------------- | ------------------------------ | ------------------------------------------------------ |
| Import Workout    | "Import Workout" button        | [`/compendium/workouts`](../../compendium/workouts.md) |
| View Workout      | Click workout card             | [`/user/workouts/:id`](./detail.md)                    |
| View Logs         | Action menu "Logs"             | `/user/workout-logs` (placeholder)                     |
| Schedule          | Action menu "Schedule"         | `/user/workout-schedule` (placeholder)                 |
| Remove Workout    | Action menu "Remove" + confirm | Same page (list updates)                               |
| Browse Compendium | Empty state CTA                | [`/compendium/workouts`](../../compendium/workouts.md) |

---

## State Handling

### Loading State

- Full-page loading spinner with message: "Loading your workouts..."
- Shown while fetching user workouts and enriched template data

### Error State

- Error loading card with title: "Error loading workouts"
- Displays error message from store
- Retry action available

### Empty State

- Centered illustration and message
- Clear CTA to browse compendium
- Helps new users get started

---

## Related Pages

- [Workout Detail](./detail.md) - View specific workout
- [Compendium Workouts](../../compendium/workouts.md) - Browse and import templates
