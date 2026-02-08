# `/user/workouts/:id/edit` - Edit Exercise Schemes

**Goal**: Configure exercise schemes (sets, reps, weight, etc.) for each exercise in the workout. Batch assignment interface with pending changes tracking.

---

## UX Flows

### View Exercise Scheme Configuration

**Header Section:**

- Title: Workout name
- Subtitle: "Edit Exercise Schemes"
- Back button: Returns to workout detail
- **"View Template"** button: Links to compendium source

**Configuration Area:**

- Same color-coded sections as detail view
- Each exercise displays an **Exercise Scheme Assignment Card**
- Cards show suggested measurement paradigms from exercise metadata

### Exercise Scheme Assignment Card

Each exercise provides a configuration card with:

1. **Exercise Information:**

   - Sequential number
   - Exercise name
   - Suggested measurement paradigms (from compendium)

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

### Select Exercise Schemes

**Assignment Flow:**

1. User selects measurement paradigm for exercise
2. Card displays paradigm-specific configuration fields
3. User enters scheme parameters
4. Assignment added to **pending changes**
5. Sticky bar updates with change count

**Supported Paradigms:**

- Reps × Weight
- Time
- Distance
- Reps only
- Weight only
- Custom

### Manage Pending Changes

**Sticky Bottom Bar:**

- Appears when pending changes exist
- Shows count: "X unsaved change(s)"
- **"Save Changes"** button
- Disabled while saving

**Change Tracking:**

- Changes accumulate in local state
- Not persisted until explicitly saved
- User can navigate between exercises freely
- Changes survive exercise card interactions

### Save Assignments

**Save Flow:**

1. User clicks "Save Changes"
2. Button shows loading state: "Saving..."
3. System batch saves all pending assignments:

   - Iterates through pending changes map
   - Calls API for each section item assignment
   - Tracks success/failure per assignment

4. **Success (all saved):**

   - Toast: "All exercise schemes saved successfully"
   - Clears pending changes
   - Navigates back to workout detail

5. **Partial Failure:**

   - Toast: "Saved X of Y assignments. Some failed."
   - Keeps failed items in pending state
   - User can retry or navigate away

6. **Complete Failure:**
   - Error toast with message
   - Changes remain pending
   - User can retry

### View Template Reference

- **"View Template"** button in header
- Opens compendium workout in new context
- Reference original structure while configuring
- Does not affect pending changes

### Cancel Editing

- **Back button** returns to workout detail
- If pending changes exist:
  - Browser may warn about unsaved changes (if implemented)
  - Or changes are simply discarded
- No confirmation dialog currently implemented

---

## Available Actions

| Action           | Trigger                | Destination                                                                       |
| ---------------- | ---------------------- | --------------------------------------------------------------------------------- |
| Select Paradigm  | Choose from dropdown   | Same page (adds to pending)                                                       |
| Configure Scheme | Fill paradigm fields   | Same page (adds to pending)                                                       |
| Save Changes     | "Save Changes" button  | [`/user/workouts/:id`](./detail.md)                                               |
| View Template    | "View Template" button | [`/compendium/workouts/:templateId`](../../compendium/workouts.md#workout-detail) |
| Cancel           | Back button            | [`/user/workouts/:id`](./detail.md)                                               |

---

## Data Flow

```
User Input
    │
    ▼
Exercise Scheme Card
    │
    ▼
Pending Assignments Map
(sectionItemId → schemeId)
    │
    ▼
Save Action
    │
    ▼
Batch API Calls
    │
    ▼
UserExerciseSchemesStore
    │
    ▼
Backend Persistence
```

### Pending Assignments State

- **Type**: `Map<string, string>`
- **Key**: Section item ID
- **Value**: Selected scheme ID
- **Tracking**: Computed signal for unsaved changes detection

### Assignment API

Each pending assignment calls:

```
assignSchemeToSectionItem(schemeId, sectionItemId, userWorkoutId)
```

- Creates or updates exercise scheme assignment
- Links scheme to specific exercise in user's workout
- Independent per assignment (batch processed)

---

## Data Sources

### User Workout

- User workout ID
- Workout template reference
- Used for API calls and context

### Template Structure

- Sections and exercises from workout template
- Section item IDs for assignment targeting
- Exercise IDs for name resolution

### Exercise Metadata

- Exercise names for display
- Suggested measurement paradigms
- Helps guide scheme selection

### Existing Schemes

- Current assignments (if editing existing workout)
- Pre-populates scheme cards
- Shown in UI as current configuration

---

## State Handling

### Loading State

- Full-page loading spinner
- Message: "Loading workout..."
- Loads user workout, template, exercises, and existing schemes

### Error State

- Error loading card
- Title: "Error loading workout"
- Prevents configuration if data unavailable

### Not Found State

- Error loading card
- Title: "Workout not found"
- Shown when workout doesn't exist in user's collection

### Saving State

- Sticky bar shows "Saving..." text
- Save button disabled
- Prevents duplicate submissions

---

## Key Concepts

### Deferred Assignment

- Scheme cards support deferred initialization
- Prevents unnecessary API calls on load
- Only creates/updates when user interacts

### Batch Saving

- Accumulate changes locally
- Single save action persists all
- Better UX than per-exercise saving
- Handles partial failures gracefully

### Suggested Paradigms

- Compendium exercises define suggested measurement types
- Shown in scheme cards to guide users
- Example: "Barbell Squat" suggests "Reps × Weight"
- Users can override with any paradigm

---

## Related Pages

- [Workout Detail](./detail.md) - View configured workout
- [Workout List](./list.md) - Browse all workouts
- [Compendium Workout](../../compendium/workouts.md) - View template source
