# Refactor Workout Schedule to Support Multi-Day Scheduling

**Date**: 2026-02-08
**Type**: Breaking Change

## What Changed

### Complete Architecture Redesign

The workout schedule system was completely refactored from a simple single-day-per-workout model to a flexible criteria-based system supporting multiple days per workout.

#### Database Schema Changes

**Old (Deleted):**

- `user_workout_schedules` table with `dayOfWeek` and `order` fields

**New (3-Table Structure):**

- `workout_schedules` - Main schedule (id, userId, workoutTemplateId)
- `workout_schedule_criteria` - Criteria types (id, scheduleId, type, order)
- `workout_schedule_criteria_day_of_week` - Day values (criteriaId, dayOfWeek)

This enables:

- Multiple days per workout schedule (e.g., Mon/Wed/Fri)
- Future extensibility (date-based, interval-based scheduling)
- Proper prioritization through criteria `order` field

#### API Breaking Changes

**Old API:**

- `POST /user/workout-schedule` - Created schedule with dayOfWeek and order
- `PUT /user/workout-schedule/:id` - Updated dayOfWeek/order

**New API:**

- `POST /user/workout-schedule` - Creates schedule (no criteria initially)
- `POST /user/workout-schedule/:id/criteria` - Add day criteria
- `PUT /user/workout-schedule/:id/criteria/:criteriaId` - Update criteria (full replacement)
- `DELETE /user/workout-schedule/:id/criteria/:criteriaId` - Remove criteria

**Response Structure Change:**

```typescript
// Old
{
  id, userId, workoutTemplateId, dayOfWeek, order, createdAt, updatedAt
}

// New
{
  id, userId, workoutTemplateId,
  criteria: [
    { id, scheduleId, type: 'DAY_OF_WEEK', order, days: [1, 3, 5] }
  ],
  createdAt, updatedAt
}
```

#### Frontend Changes

**Store:** `WorkoutScheduleStore`

- New methods: `addCriteria`, `updateCriteria`, `deleteCriteria`
- Updated: `createSchedule` now takes both schedule and criteria data
- Changed: `schedulesByDay` computed now aggregates from criteria days

**Create Form:**

- Removed: Order field (moved to criteria)
- Changed: Day selection is now **multi-select** (was single select)
- Added: Criteria type radio card (currently only "Day of Week")

**List View:**

- Removed: Per-day "+ Schedule" buttons (only global button remains)
- Changed: Cards now show comma-separated list of scheduled days
- Changed: Click navigates to detail view for criteria management

**Detail/Edit View:**

- Renamed: `EditWorkoutScheduleComponent` → `ScheduleDetailComponent`
- Complete redesign: Now shows criteria management interface
- Features: Add/Edit/Delete criteria (day sets), Delete entire schedule

## Affected Documentation Files

### Requires Major Updates:

1. **docs/frontend/user/schedules/README.md**

   - Update "Domain Relationship" section to explain criteria system
   - Update implementation status table

2. **docs/frontend/user/schedules/new.md**

   - Update form fields section (remove order, explain multi-select days)
   - Update validation rules
   - Update component name references

3. **docs/frontend/user/schedules/list.md**

   - Update "Quick Actions" (remove per-day schedule button mention)
   - Update "Schedule Cards" (show days list instead of order)

4. **docs/frontend/user/schedules/detail.md**

   - Complete rewrite needed (was just a placeholder)
   - Document criteria management features
   - Update component name to `ScheduleDetailComponent`

5. **docs/frontend/user/workouts/schedules.md**
   - Check and update if workout-specific schedule features changed

### New Documentation Needed:

None - existing docs cover the areas, just need updating.

## Migration Notes

**Database:** Run `npm run db:push` and select "create table" for new tables.

**No Data Migration:** As per requirements, no existing data to migrate.

## Testing Checklist

- [ ] Create schedule with multiple days
- [ ] View schedules correctly grouped by day in calendar
- [ ] Add criteria to existing schedule
- [ ] Edit criteria days
- [ ] Delete individual criteria
- [ ] Delete entire schedule
- [ ] Verify API returns correct nested criteria structure
