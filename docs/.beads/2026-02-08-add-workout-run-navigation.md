# 2026-02-08: Add Workout Run Navigation

## What Changed

Added direct navigation to start/run a workout from the My Workouts interface:

1. **Workout Card Action Menu** - Added "Start Workout" as the first action in the dropdown menu on each workout card
2. **Workout Detail Page** - Added "Start Workout" button in the header actions alongside "View Template"
3. **New Route** - Created `/user/workouts/:id/run` route pointing to `WorkoutRunComponent`
4. **Placeholder Component** - Created empty `WorkoutRunComponent` for future workout execution UI

## Files Changed

- `apps/app/src/app/app.routes.ts` - Added new `/user/workouts/:id/run` route
- `apps/app/src/app/components/ui/cards/user-workout-card.component.ts` - Added 'start' action type and menu item
- `apps/app/src/app/routes/user/workout-detail.ts` - Added "Start Workout" button to header
- `apps/app/src/app/routes/user/workouts.ts` - Added handler for 'start' action that navigates to run route
- `apps/app/src/app/routes/user/workout-run.ts` - New placeholder component

## Documentation Updates Needed

### `docs/frontend/user/workouts/list.md`

- **Section**: "Workout Actions" (line 35-41)
- **Update**: Add "Start Workout" as action #1 in the list
- **Table**: Add row to "Available Actions" table for Start Workout → `/user/workouts/:id/run`

### `docs/frontend/user/workouts/detail.md`

- **Section**: "Header Section" (line 11-17)
- **Update**: Add "Start Workout" button description alongside "View Template" and "Edit Schemes"
- **Table**: Add "Start Workout" action to Available Actions table

### `docs/frontend/user/workouts/list.md`

- **Section**: "Workout Actions" (line 35-41)
- **Update**: Add "Start Workout" as action #1 in the list
- **Table**: Add row to "Available Actions" table for Start Workout → `/user/workouts/:id/run`

### `docs/frontend/user/workouts/detail.md`

- **Section**: "Header Section" (line 11-17)
- **Update**: Add "Start Workout" button description alongside "View Template" and "Edit Schemes"
- **Table**: Add "Start Workout" action to Available Actions table

### `docs/frontend/user/workouts/README.md`

- **Section**: "User Flow" diagram (line 118-156)
- **Update**: Consider adding "4. RUN" step showing workout execution flow
- **Section**: "Use Workout" (line 184-191)
- **Update**: Add "Run workout" to the list of things a fully configured workout can do

## Suggested Updates

### list.md

Update the Workout Actions section:

```markdown
### Workout Actions

Each workout card provides an action menu:

1. **Start Workout**: Navigate to workout execution page
2. **View Logs**: Navigate to workout logs (placeholder)
3. **Schedule**: Navigate to schedule page (placeholder)
4. **Remove**: Delete workout from personal collection
```

Update the Available Actions table:

```markdown
| Action            | Trigger                        | Destination                                            |
| ----------------- | ------------------------------ | ------------------------------------------------------ |
| Import Workout    | "Import Workout" button        | [`/compendium/workouts`](../../compendium/workouts.md) |
| View Workout      | Click workout card             | [`/user/workouts/:id`](./detail.md)                    |
| Start Workout     | Action menu "Start Workout"    | `/user/workouts/:id/run`                               |
| View Logs         | Action menu "Logs"             | `/user/workout-logs` (placeholder)                     |
| Schedule          | Action menu "Schedule"         | `/user/workout-schedule` (placeholder)                 |
| Remove Workout    | Action menu "Remove" + confirm | Same page (list updates)                               |
| Browse Compendium | Empty state CTA                | [`/compendium/workouts`](../../compendium/workouts.md) |
```

### detail.md

Update the Header Section:

```markdown
**Header Section:**

- Title: Workout name (from template)
- Subtitle: "My Workout"
- Back button: Returns to My Workouts list
- **"View Template"** button: Links to compendium source
- **"Start Workout"** button: Navigate to workout execution
- **"Edit Schemes"** button: Primary action for configuration
```

Update the Available Actions table:

```markdown
| Action        | Trigger                | Destination                                                                       |
| ------------- | ---------------------- | --------------------------------------------------------------------------------- |
| Start Workout | "Start Workout" button | `/user/workouts/:id/run`                                                          |
| Edit Schemes  | "Edit Schemes" button  | [`/user/workouts/:id/edit`](./edit.md)                                            |
| View Template | "View Template" button | [`/compendium/workouts/:templateId`](../../compendium/workouts.md#workout-detail) |
| View Exercise | Click exercise name    | [`/compendium/exercises/:id`](../../compendium/exercises.md#exercise-detail)      |
| Back to List  | Back button            | [`/user/workouts`](./list.md)                                                     |
```
