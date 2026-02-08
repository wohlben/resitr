# Documentation Update: Remove Scheme Checkmark from Workout Detail

## What Changed

Removed the green checkmark icon that was displayed when exercise schemes were configured on the user workout detail page (`/user/workouts/:id`).

**Before:**

- Green checkmark shown for configured schemes
- Amber warning shown for unconfigured schemes

**After:**

- Only amber warning shown for unconfigured schemes
- No visual indicator for configured schemes (they don't need attention)

## Affected Documentation

**File to update:** `docs/frontend/user/workouts/detail.md`

**Section:** "Scheme Assignment Status" (lines 55-66)

**Current content:**

```markdown
### Scheme Assignment Status

Visual indicators help track configuration progress:

- **✅ Green Checkmark**: Scheme configured for this exercise

  - Tooltip: "Scheme configured"
  - Indicates ready to perform

- **⚠️ Amber Warning**: Needs scheme setup
  - Tooltip: "Needs scheme setup"
  - Indicates configuration required
```

**Suggested update:**

```markdown
### Scheme Assignment Status

Visual indicator shows when attention is needed:

- **⚠️ Amber Warning**: Needs scheme setup
  - Tooltip: "Needs scheme setup"
  - Indicates configuration required
  - Only appears when scheme is not configured
```

## Rationale

Configured schemes don't need user attention, so showing a checkmark draws unnecessary visual focus. The warning icon alone is sufficient to indicate items requiring configuration.
