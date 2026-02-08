# Persistence Architecture

This document describes the data persistence model in ResiTr, focusing on the relationship between **Compendium** (shared/global data) and **User** (personal data) domains, and how they interact to support workout planning and tracking.

## Overview

ResiTr uses a **two-domain architecture** that separates shared reference data from personal user data:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           COMPENDIUM DOMAIN                                  │
│                    (Shared Blueprints/Library)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  • CompendiumExercise       - Exercise definitions (Bench Press, Squats)     │
│  • CompendiumEquipment      - Equipment types (Dumbbells, Barbell)           │
│  • CompendiumWorkout        - Workout templates ("Push Day", "Leg Day")      │
│     ├── CompendiumWorkoutSection    - Sections within the workout*           │
│     └── CompendiumWorkoutSectionItem - Individual exercises in sections*     │
│  • CompendiumExerciseScheme - Suggested exercise configurations              │
│  • CompendiumExerciseGroup  - Named exercise collections                     │
└─────────────────────────────────────────────────────────────────────────────┘

*Section and SectionItem are implementation details supporting CompendiumWorkout's tree structure
                                      │
                                      ▼ imports/links to
┌─────────────────────────────────────────────────────────────────────────────┐
│                             USER DOMAIN                                      │
│                      (Personal Configuration)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  • UserWorkout              - User's imported workout blueprints             │
│  • UserExerciseScheme       - User's personal exercise configurations        │
│  • UserWorkoutSchedule      - When user plans to do workouts                 │
│  • UserWorkoutLog           - Records of completed workout sessions          │
│     ├── UserWorkoutLogSection       - Sections within the log*               │
│     ├── UserWorkoutLogSectionItem   - Exercise instances in log*             │
│     └── UserWorkoutLogSet           - Individual sets (completable)*         │
└─────────────────────────────────────────────────────────────────────────────┘

*Log sub-entities are implementation details supporting UserWorkoutLog's tree structure
```

## Core Concept: Blueprints vs. Usable Instances

### Compendium Entities Are Blueprints

All data originates from the **Compendium**. Compendium entities represent **blueprints** or **templates** that describe what exercises exist, what equipment is available, and how workouts can be structured. These are:

- **Shared** - Available to all users
- **Reference data** - Exercise definitions, equipment types
- **Suggestive** - Exercise schemes suggest configurations but don't enforce them
- **Versioned** - Changes create new versions (see [versioning.md](./versioning.md))
- **Not directly usable** - Users cannot log workouts against compendium entities directly

### User Entities Are Personal Configurations

**User entities** represent a user's personal setup and history. These are:

- **Personal** - Belong to a specific user
- **Usable** - Can be scheduled, logged, and tracked
- **Configurable** - Users define their own exercise schemes and preferences
- **Historical** - Workout logs preserve what actually happened

## Data Flow: From Blueprint to Log

The typical lifecycle follows this path:

```
CompendiumWorkout (blueprint)
        │
        │ User "imports" workout
        ▼
UserWorkout (user's instance of blueprint)
        │
        │ User configures exercise schemes
        ▼
UserExerciseScheme ←────── CompendiumExerciseScheme (suggestions)
        │                         (optional reference)
        │
        │ Linked via junction table to specific section items
        ▼
UserExerciseSchemeCompendiumWorkoutSectionItem
        │
        │ User schedules workout
        ▼
UserWorkoutSchedule
        │
        │ User performs workout
        ▼
UserWorkoutLog (snapshot of workout at time of execution)
        │
        ├──► originalWorkoutId → CompendiumWorkout (reference to source)
        │
        └──► Tree structure (implementation detail):
            UserWorkoutLogSection
            └── UserWorkoutLogSectionItem
                └── UserWorkoutLogSet (completable)
                    ├── targetReps / achievedReps
                    ├── targetWeight / achievedWeight
                    ├── targetTime / achievedTime
                    └── completedAt / skipped
```

## Detailed Entity Interactions

### 1. Importing Workouts

When a user wants to use a compendium workout:

**File**: `user-workout.schema.ts`

```typescript
// User creates a UserWorkout that links to a CompendiumWorkout
{
  userId: "user-123",
  workoutTemplateId: "workout-v2-abc"  // References CompendiumWorkout.templateId
}
```

- A user can have **one** `UserWorkout` entry per compendium workout version
- The unique constraint `(userId, workoutTemplateId)` enforces this
- This is not a copy - it's a link that enables the user to configure and schedule the workout

### 2. Configuring Exercise Schemes

Before a workout can be planned/scheduled, the user must configure **exercise schemes** that define how to perform each exercise:

**File**: `user-exercise-scheme.schema.ts`

```typescript
// User creates their own scheme for an exercise
{
  userId: "user-123",
  exerciseId: "exercise-biceps-curl-uuid",  // References CompendiumExercise
  name: "My Biceps Scheme",
  measurementType: "REP_BASED",
  sets: 3,
  reps: 10,
  restBetweenSets: 60,
  weight: 20  // 20kg per dumbbell
}
```

#### Compendium Exercise Schemes Provide Suggestions

**File**: `compendium-exercise-scheme.schema.ts`

Compendium exercise schemes are **optional suggestions**:

```typescript
// Compendium suggests: "5x5 Strength" for Bench Press
{
  exerciseId: "bench-press-uuid",
  name: "5x5 Strength",
  measurementType: "REP_BASED",
  sets: 5,
  reps: 5,
  restBetweenSets: 180,
  weight: null  // User decides actual weight
}
```

**Key points**:

- Compendium schemes are **suggestions**, not requirements
- Users can ignore them and create their own schemes from scratch
- Users can use compendium schemes as **starting points** and customize them
- The **ultimate decision** for exercise configuration is always with the user

### 3. Linking Schemes to Workout Items

To make a workout plannable, exercise schemes must be linked to specific workout section items:

**File**: `user-exercise-scheme-compendium-workout-section-item.schema.ts`

```typescript
// Junction table linking schemes to specific workout items
{
  sectionItemId: "section-item-bench-press",    // CompendiumWorkoutSectionItem.id
  userWorkoutId: "user-workout-uuid",            // UserWorkout.id
  userExerciseSchemeId: "user-scheme-uuid"       // UserExerciseScheme.id
}
```

This junction table enables:

- **Multiple schemes per exercise** - Different configurations for different contexts
- **Per-workout customization** - Same exercise can have different schemes in different workouts
- **Configuration tracking** - System knows which scheme to use for each exercise in a workout

### 4. Scheduling Workouts

Once configured, workouts can be scheduled:

**File**: `user-workout-schedule.schema.ts`

```typescript
// User schedules workout for Monday
{
  userId: "user-123",
  workoutTemplateId: "workout-v2-abc",  // References CompendiumWorkout
  dayOfWeek: 1,  // Monday
  order: 0       // First workout on that day
}
```

The schedule references the **compendium workout** (not `UserWorkout`), as the schedule needs to know which workout blueprint to execute, and the system will resolve the user's configuration.

### 5. Logging Completed Workouts

When a user performs a scheduled workout, a log is created:

**File**: `user-workout-log.schema.ts`

```typescript
// Log captures a snapshot of the workout execution
{
  originalWorkoutId: "workout-v2-abc",  // References source CompendiumWorkout
  name: "Push Day",                      // Snapshot of workout name
  sectionIds: ["log-section-1", "log-section-2"],  // References UserWorkoutLogSection
  startedAt: timestamp,
  completedAt: timestamp
}
```

**Important**: Logs use **snapshots** (copying names) rather than references because:

- Compendium data may change (new versions)
- Historical accuracy must be preserved
- The log shows what the workout was called **at the time of execution**

### 6. Logging Individual Sets

Within a workout log, each exercise has sets that can be completed:

**File**: `user-workout-log-set.schema.ts`

```typescript
// Each set tracks target vs. achieved metrics
{
  targetReps: 10,
  achievedReps: 10,
  targetWeight: 20.0,
  achievedWeight: 20.0,
  completedAt: timestamp,
  skipped: false
}
```

The log tree structure (implementation detail):

```
UserWorkoutLog
└── Tree structure (implementation detail):
    ├── UserWorkoutLogSection (snapshot of section info)
    │   └── UserWorkoutLogSectionItem (references CompendiumExercise + snapshot)
    │       └── UserWorkoutLogSet[] (completable sets)
```

## Entity Relationship Summary

### Compendium Entities (Shared/Global)

| Entity                                         | Purpose                       | References                                      |
| ---------------------------------------------- | ----------------------------- | ----------------------------------------------- |
| `CompendiumExercise`                           | Exercise definitions          | -                                               |
| `CompendiumEquipment`                          | Equipment types               | -                                               |
| `CompendiumEquipmentFulfillment`               | Equipment substitutions       | `CompendiumEquipment`                           |
| `CompendiumExerciseScheme`                     | Suggested exercise configs    | `CompendiumExercise`                            |
| `CompendiumExerciseGroup`                      | Named exercise collections    | -                                               |
| `CompendiumExerciseGroupMember`                | Group memberships             | `CompendiumExercise`, `CompendiumExerciseGroup` |
| `CompendiumExerciseRelationship`               | Exercise relationships        | `CompendiumExercise`                            |
| `CompendiumExerciseVideo`                      | Exercise videos               | `CompendiumExercise`                            |
| `CompendiumWorkout`                            | Workout templates             | -                                               |
| &nbsp;&nbsp;`→ CompendiumWorkoutSection`\*     | Workout structure (sections)  | -                                               |
| &nbsp;&nbsp;`→ CompendiumWorkoutSectionItem`\* | Workout structure (exercises) | `CompendiumExercise`                            |

\* Implementation details supporting `CompendiumWorkout`'s tree structure

### User Entities (Personal)

| Entity                                      | Purpose                          | References                     |
| ------------------------------------------- | -------------------------------- | ------------------------------ |
| `UserWorkout`                               | User's workout library           | `CompendiumWorkout`            |
| `UserWorkoutSchedule`                       | Scheduled workouts               | `CompendiumWorkout`            |
| `UserExerciseScheme`                        | User's exercise configs          | `CompendiumExercise`           |
| `UserWorkoutLog`                            | Completed workout records        | `CompendiumWorkout` (optional) |
| &nbsp;&nbsp;`→ UserWorkoutLogSection`\*     | Log structure (sections)         | -                              |
| &nbsp;&nbsp;`→ UserWorkoutLogSectionItem`\* | Log structure (exercises)        | `CompendiumExercise`           |
| &nbsp;&nbsp;`→ UserWorkoutLogSet`\*         | Log structure (completable sets) | -                              |

\* Implementation details supporting `UserWorkoutLog`'s tree structure

### Junction Tables

| Entity                                           | Purpose                        | Links                                                               |
| ------------------------------------------------ | ------------------------------ | ------------------------------------------------------------------- |
| `UserExerciseSchemeCompendiumWorkoutSectionItem` | Links schemes to workout items | `CompendiumWorkoutSectionItem`, `UserWorkout`, `UserExerciseScheme` |

## Key Design Decisions

### 1. Separation of Concerns

Compendium and User domains are strictly separated:

- **Compendium** = What exists (exercises, workouts)
- **User** = How I use it (my schemes, my logs)

This enables:

- Multiple users sharing the same workout blueprint
- Users customizing workouts without affecting others
- Versioning of compendium data without affecting user history

### 2. Blueprint → Instance Pattern

Compendium entities are **blueprints** that users "import" by creating User entities:

- UserWorkout = "I want to use this workout"
- UserExerciseScheme = "Here's how I do this exercise"
- UserWorkoutLog = "Here's what I actually did"

### 3. User Exercise Schemes Are Required

A workout is **not plannable** until the user configures exercise schemes. The compendium may suggest schemes, but:

- Suggestions are optional
- User must explicitly create/choose schemes
- This ensures the user makes conscious decisions about their training

### 4. Logs Use Snapshots

Workout logs preserve historical accuracy by:

- Copying names at time of execution
- Referencing compendium exercises (which are stable)
- Not referencing compendium workouts directly (which may have new versions)

This ensures that when a user looks back at a log from 6 months ago, they see what the workout was called **then**, not what it's called now.

### 5. Immutable Section Items

Once a `CompendiumWorkoutSectionItem` is created and potentially referenced by logs, it is never modified. See [versioning.md](./versioning.md) for details.

## Example Workflow

Here's how the complete flow works:

### 1. System Setup (Compendium)

```
CompendiumExercise: "Biceps Curl"
CompendiumWorkout: "Push Day" (v1)
  └── Section: "Arms"
      └── Item: Biceps Curl
CompendiumExerciseScheme: "3x10 Hypertrophy" for Biceps Curl
```

### 2. User Imports Workout

```
UserWorkout:
  userId: "alice"
  workoutTemplateId: "push-day-v1"
```

### 3. User Configures Scheme

```
UserExerciseScheme:
  userId: "alice"
  exerciseId: "biceps-curl"
  name: "My Biceps"
  sets: 3, reps: 10, weight: 12.5

UserExerciseSchemeCompendiumWorkoutSectionItem:
  sectionItemId: "push-day-v1-arms-biceps-curl"
  userWorkoutId: "alice-push-day"
  userExerciseSchemeId: "alice-biceps-scheme"
```

### 4. User Schedules Workout

```
UserWorkoutSchedule:
  userId: "alice"
  workoutTemplateId: "push-day-v1"
  dayOfWeek: 1  // Monday
```

### 5. User Performs Workout

```
UserWorkoutLog:
  originalWorkoutId: "push-day-v1"
  name: "Push Day"
  startedAt: "2026-02-08T10:00:00Z"
  sectionIds: ["log-section-1"]

UserWorkoutLogSection:
  name: "Arms"
  itemIds: ["log-item-1"]

UserWorkoutLogSectionItem:
  exerciseId: "biceps-curl"
  name: "Biceps Curl"
  setIds: ["set-1", "set-2", "set-3"]

UserWorkoutLogSet (set-1):
  targetReps: 10, achievedReps: 10
  targetWeight: 12.5, achievedWeight: 12.5
  completedAt: "2026-02-08T10:05:00Z"
```

## File Locations

### Compendium Schemas

- `apps/server/src/app/core/persistence/schemas/compendium-exercise.schema.ts`
- `apps/server/src/app/core/persistence/schemas/compendium-equipment.schema.ts`
- `apps/server/src/app/core/persistence/schemas/compendium-workout.schema.ts`
- `apps/server/src/app/core/persistence/schemas/compendium-workout-section.schema.ts`
- `apps/server/src/app/core/persistence/schemas/compendium-workout-section-item.schema.ts`
- `apps/server/src/app/core/persistence/schemas/compendium-exercise-scheme.schema.ts`
- `apps/server/src/app/core/persistence/schemas/compendium-exercise-group.schema.ts`
- `apps/server/src/app/core/persistence/schemas/compendium-exercise-relationship.schema.ts`

### User Schemas

- `apps/server/src/app/core/persistence/schemas/user-workout.schema.ts`
- `apps/server/src/app/core/persistence/schemas/user-exercise-scheme.schema.ts`
- `apps/server/src/app/core/persistence/schemas/user-workout-schedule.schema.ts`
- `apps/server/src/app/core/persistence/schemas/user-workout-log.schema.ts`
- `apps/server/src/app/core/persistence/schemas/user-workout-log-section.schema.ts`
- `apps/server/src/app/core/persistence/schemas/user-workout-log-section-item.schema.ts`
- `apps/server/src/app/core/persistence/schemas/user-workout-log-set.schema.ts`
- `apps/server/src/app/core/persistence/schemas/user-exercise-scheme-compendium-workout-section-item.schema.ts`

## Related Documentation

- [Versioning Architecture](./versioning.md) - How compendium entities are versioned
- See individual schema files for detailed field documentation
