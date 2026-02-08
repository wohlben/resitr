# `/user/workout-schedule/:id` - Scheduled Workout Detail

**Goal**: View and manage a specific scheduled workout session.

---

## Status

**Placeholder** - This page is currently under development.

---

## Planned Features

### Session Details

- Scheduled date and time
- Workout reference (links to workout detail)
- Estimated duration
- Status (upcoming/completed/cancelled)
- Notes/reminders

### Actions

- **Start Workout**: Begin the scheduled session
  - Navigates to [`/user/workouts/:workoutId/run`](./workouts/run.md)
  - Marks schedule as "in progress"
- **Reschedule**: Change date/time
- **Cancel**: Remove from schedule
- **Mark Complete**: Skip to completed status (creates log)

### Countdown

For upcoming sessions:

- Time until scheduled start
- Preparation reminder (e.g., "Starting in 15 minutes")

### Post-Session

After completion:

- Link to created workout log
- Performance summary
- Option to schedule next session

---

## Navigation

### Entry Points

- **From Schedule**: Click scheduled session
- **From Notification**: Deep link from reminder

### Exit Points

- Start → [`/user/workouts/:id/run`](./workouts/run.md)
- View Log → `/user/workout-logs/:logId`
- Back → `/user/workout-schedule`

---

## Related Pages

- [Workout Schedule](./workout-schedule.md) - Calendar view
- [Workout Run](./workouts/run.md) - Execute workout
- [Workout Log Detail](./workout-logs/detail.md) - View completed session
