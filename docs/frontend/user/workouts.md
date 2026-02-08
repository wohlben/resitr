# User Workouts

This document explains the relationship between user workouts and exercise schemes, and the conceptual model for personal workout management.

For specific route documentation, see:

- [`/user/workouts`](./workouts/list.md) - My Workouts list
- [`/user/workouts/:id`](./workouts/detail.md) - Workout detail with scheme status
- [`/user/workouts/:id/edit`](./workouts/edit.md) - Configure exercise schemes

---

## Conceptual Model

### User Workout vs Compendium Workout

The app distinguishes between **global templates** (compendium) and **personal instances** (user):

| Aspect            | Compendium Workout       | User Workout           |
| ----------------- | ------------------------ | ---------------------- |
| **Purpose**       | Template library         | Personal instance      |
| **Scope**         | Global (all users)       | Private (single user)  |
| **Structure**     | Fixed sections/exercises | References template    |
| **Editing**       | Creates new version      | Configure schemes only |
| **Configuration** | None                     | Exercise schemes       |
| **History**       | Versioned                | Single instance        |

### Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA RELATIONSHIPS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐          ┌──────────────────┐            │
│  │ Compendium       │          │ User             │            │
│  │ Workout          │          │ Workout          │            │
│  │ (Template)       │          │ (Instance)       │            │
│  └────────┬─────────┘          └────────┬─────────┘            │
│           │                             │                      │
│           │ references                  │ references           │
│           │                             │                      │
│           ▼                             ▼                      │
│  ┌──────────────────┐          ┌──────────────────┐            │
│  │ Sections         │          │ Exercise Schemes │            │
│  │ (Structure)      │          │ (Configuration)  │            │
│  └────────┬─────────┘          └────────┬─────────┘            │
│           │                             │                      │
│           │ contains                    │ assigned to          │
│           │                             │                      │
│           ▼                             ▼                      │
│  ┌──────────────────┐          ┌──────────────────┐            │
│  │ Section Items    │◄─────────│ Assignments      │            │
│  │ (Exercise refs)  │          │ (Scheme links)   │            │
│  └──────────────────┘          └──────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Principle

**User workouts don't modify the template** - they add a layer of personal configuration on top of an immutable template reference.

---

## Exercise Schemes

### What are Exercise Schemes?

Exercise schemes define **how** an exercise should be performed:

- **Measurement Paradigm**: What metrics to track

  - Reps × Weight (strength training)
  - Time (duration-based)
  - Distance (cardio/ endurance)
  - Reps only (bodyweight)
  - Custom paradigms

- **Scheme Parameters**: Specific values

  - Sets, reps, weight
  - Duration, distance
  - Rest periods
  - Target metrics

- **Assignment**: Linked to specific exercise occurrence
  - One scheme per section item
  - Different schemes for same exercise in different workouts
  - Different users can have different schemes for same template

### Scheme Assignment Model

```
User Workout
    │
    ├── Section 1: Warmup
    │   ├── Exercise A ──> Scheme A1 (Reps × Weight: 3×10 @ 135lbs)
    │   └── Exercise B ──> Scheme B1 (Time: 5 minutes)
    │
    └── Section 2: Strength
        ├── Exercise C ──> Scheme C1 (Reps × Weight: 5×5 @ 225lbs)
        └── Exercise D ──> [No scheme assigned yet]
```

### Suggested Paradigms

Compendium exercises provide **suggested measurement paradigms**:

- Helps guide users to appropriate scheme types
- Example: "Barbell Squat" suggests "Reps × Weight"
- Example: "Plank" suggests "Time"
- Users can override with any paradigm

---

## User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      USER WORKFLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. BROWSE                                                  │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────┐                                    │
│  │ Compendium          │                                    │
│  │ Browse templates    │                                    │
│  └──────────┬──────────┘                                    │
│             │                                               │
│  2. IMPORT  │                                               │
│             ▼                                               │
│  ┌─────────────────────┐                                    │
│  │ My Workouts         │                                    │
│  │ Instance created    │                                    │
│  │ (no schemes yet)    │                                    │
│  └──────────┬──────────┘                                    │
│             │                                               │
│  3. CONFIGURE│                                              │
│             ▼                                               │
│  ┌─────────────────────┐                                    │
│  │ Edit Schemes        │                                    │
│  │ Assign schemes to   │                                    │
│  │ each exercise       │                                    │
│  └──────────┬──────────┘                                    │
│             │                                               │
│  4. USE     │                                               │
│             ▼                                               │
│  ┌─────────────────────┐                                    │
│  │ View/Log/Schedule   │                                    │
│  │ Fully configured    │                                    │
│  │ workout ready       │                                    │
│  └─────────────────────┘                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 1: Browse Compendium

User explores workout templates:

- Views workout structure and exercises
- Checks version history
- Decides to add to personal collection

### Step 2: Import Workout

"Add to My Workouts" creates a user workout instance:

- References the workout template
- Copies no data (references template)
- Starts with no exercise schemes assigned

### Step 3: Configure Schemes

User assigns schemes to each exercise:

- Select measurement paradigm per exercise
- Configure specific parameters
- Save assignments in batch
- Visual indicators show completion status

### Step 4: Use Workout

Fully configured workout can be:

- Viewed with scheme details
- Scheduled for future sessions
- Logged as completed
- Tracked over time

---

## Configuration Status

### Visual Indicators

The detail page shows scheme assignment status for each exercise:

- **✅ Configured**: Green checkmark

  - Scheme assigned and saved
  - Ready to perform
  - Shows in detail view

- **⚠️ Needs Setup**: Amber warning
  - No scheme assigned yet
  - Configuration required
  - Prompts user to edit schemes

### Completion Tracking

Users can track configuration progress:

- Count of configured vs total exercises
- Visual progress indicators
- Reminders to complete setup

---

## Data Flow

### Import Flow

```
User clicks "Add to My Workouts"
         │
         ▼
┌─────────────────────┐
│ Create User Workout │
│ - workoutTemplateId │
│ - userId            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Response: User      │
│ Workout with ID     │
└──────────┬──────────┘
           │
           ▼
Navigate to /user/workouts/:id
```

### Scheme Assignment Flow

```
User configures schemes in edit mode
         │
         ▼
┌─────────────────────────────┐
│ Pending Assignments Map     │
│ (client-side state)         │
│ sectionItemId → schemeId    │
└──────────────┬──────────────┘
               │
         User clicks "Save"
               │
               ▼
┌─────────────────────────────┐
│ Batch API Calls             │
│ For each pending assignment:│
│ assignSchemeToSectionItem() │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Backend creates/updates     │
│ UserExerciseScheme records  │
└──────────────┬──────────────┘
               │
               ▼
Navigate to detail page
Toast: "All exercise schemes saved"
```

---

## Implementation Notes

### Why Separate Schemes from Templates?

1. **Reusability**: Same template, different configurations
2. **Progression**: User can change schemes as they improve
3. **Flexibility**: Different paradigms for different goals
4. **Sharing**: Templates shared, schemes personal

### Why Batch Scheme Saving?

1. **UX**: Single save action for all changes
2. **Efficiency**: Fewer API calls
3. **Atomicity**: All or nothing (mostly)
4. **Navigation**: Clear save/discard decision point

### Template Immutability

- Workout templates in compendium are versioned
- Editing creates new version, old versions remain
- User workouts reference specific template versions
- User always sees structure from referenced version

---

## Related Documentation

- [Workout List](./workouts/list.md) - Browse personal workout collection
- [Workout Detail](./workouts/detail.md) - View workout with scheme status
- [Edit Schemes](./workouts/edit.md) - Configure exercise schemes
- [Compendium Workouts](../compendium/workouts.md) - Template library
