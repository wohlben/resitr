# Doc Update: Auto-Select Exercise Schemes on Workout Edit

**Date**: 2026-02-08
**Related Issue**: ResiTr-94r
**Component**: Exercise Scheme Assignment Card
**File**: `apps/app/src/app/components/features/exercise-scheme-assignment-card.component.ts`

## What Changed

Implemented auto-selection behavior for exercise schemes in the workout edit route:

- **When schemes exist**: The first available scheme for an exercise is automatically selected
- **When no schemes exist**: "Create New Scheme" is automatically selected with the inline form shown
- **When already assigned**: Auto-selection is skipped to preserve existing assignments
- **Deferred mode support**: Works in deferred assignment mode (used by workout edit), emitting `schemeSelected` events so parent tracks pending changes

## Affected Documentation

### `docs/frontend/user/workouts/edit.md`

The "Exercise Scheme Assignment Card" section (lines 24-46) needs updates:

**Current text**:

```markdown
2. **Scheme Selection:**

   - Measurement paradigm dropdown
   - Dynamic fields based on selected paradigm:
     - Reps/Weight: Sets, reps, weight fields
     - Time: Duration field
     - Distance: Distance field
     - etc.

3. **Configuration Status:**
   - Shows current scheme (if editing)
   - Highlights unsaved changes
```

**Suggested update**:

```markdown
2. **Scheme Selection:**

   - **Auto-selection behavior:**
     - If exercise schemes exist: first scheme is automatically selected
     - If no schemes exist: "Create New Scheme" is auto-selected with form shown
     - Existing assignments are preserved (no auto-selection)
   - Measurement paradigm dropdown
   - Dynamic fields based on selected paradigm:
     - Reps/Weight: Sets, reps, weight fields
     - Time: Duration field
     - Distance: Distance field
     - etc.

3. **Configuration Status:**
   - Shows current scheme (if editing)
   - Highlights unsaved changes (including auto-selected schemes)
   - Status indicator shows pending state for auto-selections
```

### "Select Exercise Schemes" Section (lines 47-65)

**Current**:

```markdown
1. User selects measurement paradigm for exercise
2. Card displays paradigm-specific configuration fields
3. User enters scheme parameters
4. Assignment added to **pending changes**
```

**Suggested update**:

```markdown
1. System auto-selects scheme (first existing or "Create New")
2. If "Create New" selected, inline form appears automatically
3. User can change selection or adjust parameters
4. Changes (including initial auto-selection) added to **pending changes**
5. Sticky bar updates with change count
```

## Implementation Details

- Modified constructor effect in `ExerciseSchemeAssignmentCardComponent`
- Added `isAssigned` check to prevent overriding existing assignments
- Emits `schemeSelected` event in deferred mode to track as pending change
- Sets `hasPendingChange` signal when auto-selecting in deferred mode

## Migration Notes

No breaking changes - this is a UX improvement that reduces clicks for users.
