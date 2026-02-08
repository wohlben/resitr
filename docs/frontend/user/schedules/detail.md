# `/user/schedules/:id` - Schedule Detail

**Goal**: View and manage a specific workout schedule.

---

## Status

**Placeholder** - Basic component structure only.

---

## Planned Features

### View Schedule

- Workout name and details
- Scheduled day of week
- Order in day's sequence
- Created/updated timestamps

### Edit Schedule

- Change day of week
- Adjust order
- Change workout (if needed)

### Delete Schedule

- Confirmation dialog
- Return to schedules list

---

## Navigation

### Entry Points

- Click schedule card from `/user/schedules`
- Click schedule card from `/user/workouts/:id/schedules`

### Exit Points

- Back → Schedules list
- Edit → Edit form (inline or separate route)

---

## Technical Details

- Component: `WorkoutScheduleDetail`
- Store: `WorkoutScheduleStore`
- Route: `/user/schedules/:id`

---

## Related Pages

- [Schedules List](./list.md)
- [Create Schedule](./new.md)
