# Calendar Component Implementation - 2026-02-08

## Summary

Replaced the legacy Schedules list view with a new unified Calendar page and reusable Calendar component.

## What Changed

### User-Facing Changes

1. **Navigation Updated**

   - Removed "Schedules" from main navigation
   - Added "Calendar" link pointing to `/user/calendar`
   - Added "Logs" link pointing to `/user/workout-logs`

2. **New Calendar Page** (`/user/calendar`)

   - Monthly calendar view showing:
     - Past workouts (color-coded: green=completed, yellow=in progress, red=incomplete)
     - Upcoming scheduled workouts (purple=planned)
   - Side panel with:
     - List of upcoming scheduled workouts
     - Recent workout logs

3. **Workout Logs Page Updated**

   - Now uses the reusable Calendar component
   - Same functionality, better code reuse

4. **Routes Changed**
   - `/user/schedules` → `/user/calendar` (removed)
   - `/user/workouts/:id/schedules` redirects to `/user/calendar`
   - Schedule create/edit still accessible but redirect back to Calendar

### Developer-Facing Changes

1. **New Calendar Component** (`apps/app/src/app/components/ui/calendar/`)

   - Reusable standalone component
   - Props:
     - `entries`: `Array<{on: Date, type: string, name: string}>`
     - `legend`: `Record<string, string>` (e.g., `{green: 'Completed', purple: 'Planned'}`)
     - `maxDots`: `number` (default: 3)
   - Outputs:
     - `dayClick`: Emits `Date` when user clicks a day
   - Features:
     - Month navigation (previous/next buttons)
     - Dynamic legend based on provided config
     - Keyboard accessible (Enter/Space to select)
     - Color-coded dots per day

2. **Removed Components**
   - `SchedulesListComponent` (weekly grid view) - deleted
   - Route `/user/schedules` - removed

## Documentation Updates Needed

### Files to Update

1. **`docs/frontend/user/schedules/README.md`**

   - Update to reflect the Calendar page instead of weekly schedule list
   - Or rename to `docs/frontend/user/calendar/README.md`

2. **`docs/frontend/user/schedules/list.md`**

   - Replace with `docs/frontend/user/calendar/page.md` describing the Calendar page
   - Document the combined view of logs + schedules

3. **`docs/frontend/user/workout-logs/README.md`**
   - Update to mention the Calendar component usage

### Files to Consider Removing

The entire `docs/frontend/user/schedules/` directory may need restructuring:

- `list.md` - no longer a list view, now calendar
- `detail.md` - may still be relevant for viewing individual schedules
- `new.md` - still relevant for creating schedules
- `README.md` - needs significant update

### New Documentation to Add

1. **`docs/frontend/components/calendar.md`** (new file)

   - Document the reusable Calendar component
   - Usage examples
   - Props/inputs reference
   - Legend configuration examples

2. **`docs/.beads/` entry** (this file)
   - Already created

## Code References

- Component: `apps/app/src/app/components/ui/calendar/calendar.component.ts`
- Page: `apps/app/src/app/routes/user/calendar.ts`
- Updated logs: `apps/app/src/app/routes/user/workout-logs.ts`
- Navigation: `apps/app/src/app/layout/main-navigation.component.ts`
- Routes: `apps/app/src/app/app.routes.ts`

## Migration Notes

For developers who were linking to `/user/schedules`:

- Update links to point to `/user/calendar`
- The old route is no longer available

For workout-specific schedule routes (`/user/workouts/:id/schedules`):

- These now redirect to the Calendar page
- Future enhancement: add workout filter to Calendar page
