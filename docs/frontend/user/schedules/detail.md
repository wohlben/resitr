# `/user/schedules/:id` - Schedule Detail

**Goal**: View and manage a specific workout schedule and its day criteria.

---

## Status

**Implemented**

---

## Features

### Schedule Info

- Workout name (read-only)
- Schedule ID and metadata
- Created/updated timestamps

### Criteria Management

Schedules contain one or more "criteria" that define when the workout occurs.

#### View Criteria

Each criteria displays:

- **Days**: Comma-separated list of scheduled days (e.g., "Monday, Wednesday, Friday")
- **Priority**: Order value for prioritization
- **Actions**: Edit and Delete buttons

#### Add Criteria

- Click **"Add Days"** button
- Select one or more days from the 7-day grid
- Submit to create new criteria
- Automatically assigned next order value

#### Edit Criteria

- Click **Edit** button on a criteria
- Modify day selection (toggle days on/off)
- Must keep at least one day selected
- Save to update

#### Delete Criteria

- Click **Delete** button on a criteria
- Confirmation dialog
- Removes that specific day set from the schedule

### Danger Zone

- **Delete Schedule** button at bottom
- Confirmation dialog with warning
- Permanently removes schedule and all its criteria

---

## Use Cases

### Schedule Workout for Multiple Days

1. Create schedule from list view
2. Add first set of days (e.g., Monday)
3. Click "Add Days" in detail view
4. Select additional days (e.g., Wednesday, Friday)
5. Repeat for all desired day combinations

### Remove Specific Days

1. Navigate to schedule detail
2. Find criteria with days to remove
3. Click Delete
4. Confirm removal

### Change Days

1. Navigate to schedule detail
2. Click Edit on the criteria
3. Toggle day selections
4. Save changes

---

## Navigation

### Entry Points

- Click schedule card from `/user/schedules`
- Click schedule card from `/user/workouts/:id/schedules`

### Exit Points

- Back button → Schedules list
- After delete → Schedules list

---

## Technical Details

- Component: `ScheduleDetailComponent` (formerly `EditWorkoutScheduleComponent`)
- Store: `WorkoutScheduleStore`
- Route: `/user/schedules/:id` (also `/user/workouts/:workoutId/schedules/:scheduleId`)

### Store Methods Used

- `addCriteria(scheduleId, criteriaData)` - Add new day criteria
- `updateCriteria(scheduleId, criteriaId, updateData)` - Modify existing criteria
- `deleteCriteria(scheduleId, criteriaId)` - Remove specific criteria
- `deleteSchedule(scheduleId)` - Delete entire schedule

### API Calls

```typescript
// Add criteria
POST /user/workout-schedule/:id/criteria
{ type: 'DAY_OF_WEEK', days: [1, 3, 5] }

// Update criteria
PUT /user/workout-schedule/:id/criteria/:criteriaId
{ type: 'DAY_OF_WEEK', days: [1, 3], order: 0 }

// Delete criteria
DELETE /user/workout-schedule/:id/criteria/:criteriaId
```

---

## Related Pages

- [Schedules List](./list.md)
- [Create Schedule](./new.md)
