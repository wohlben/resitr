# User Frontend Documentation

The user section provides personal fitness management features including workout collection, exercise scheme configuration, workout logging, and scheduling.

---

## Overview

The user area is organized into personal fitness management features:

| Feature              | Description                                          | Base Route               |
| -------------------- | ---------------------------------------------------- | ------------------------ |
| **My Workouts**      | Personal workout collection imported from compendium | `/user/workouts`         |
| **Workout Logs**     | History of completed workout sessions                | `/user/workout-logs`     |
| **Workout Schedule** | Calendar of planned workouts                         | `/user/workout-schedule` |

---

## User vs Compendium

The app distinguishes between **global templates** (compendium) and **personal instances** (user):

### Compendium (Templates)

- Exercise, equipment, group, and workout templates
- Global library shared across all users
- Versioned (workouts), editable by authorized users
- Reference data for user instances

### User (Personal)

- Personal workout collection
- Exercise scheme assignments
- Workout logs and history
- Schedule and planning

### Workflow

```
Browse Compendium ──> Import Workout ──> Configure Schemes ──> Log Performances
     │                      │                    │                  │
     ▼                      ▼                    ▼                  ▼
View Templates      My Workouts List      Exercise Setup       Workout History
```

---

## Common UX Patterns

### Empty States

User pages show contextual empty states with CTAs:

- **No Workouts**: "Browse Workout Compendium" button
- Guides users to next action when content is missing

### Action Menus

List items provide contextual actions:

- **My Workouts**: Start Workout, View logs, Schedule, Remove
- Accessible via card action triggers

### Confirmation Dialogs

Destructive actions require confirmation:

- **Remove Workout**: Confirms removal from personal collection
- Explains consequences clearly (doesn't delete template)

### Status Indicators

Visual indicators show configuration state:

- **Exercise Schemes**: Checkmark (configured) vs Warning (needs setup)
- Helps users track progress and complete setup

---

## Page Documentation

### My Workouts

Route-specific documentation:

- [`/user/workouts`](./workouts/list.md) - Personal workout collection
- [`/user/workouts/:id`](./workouts/detail.md) - View workout with scheme status
- [`/user/workouts/:id/edit`](./workouts/edit.md) - Configure exercise schemes
- [`/user/workouts/:id/run`](./workouts/run.md) - Execute workout (placeholder)

Conceptual documentation:

- [`./workouts/README.md`](./workouts/README.md) - Relationships between workouts and exercise schemes

### Workout Logs

Route-specific documentation:

- [`/user/workout-logs`](./workout-logs/list.md) - Completed workout history (placeholder)
- [`/user/workout-logs/:id`](./workout-logs/detail.md) - Specific log details (placeholder)

Conceptual documentation:

- [`./workout-logs/README.md`](./workout-logs/README.md) - Log structure and data flow

### Workout Schedule

Route-specific documentation:

- [`/user/workout-schedule`](./workout-schedule/list.md) - Calendar view (placeholder)
- [`/user/workout-schedule/:id`](./workout-schedule/detail.md) - Scheduled workout details (placeholder)

Conceptual documentation:

- [`./workout-schedule/README.md`](./workout-schedule/README.md) - Scheduling concepts and lifecycle

---

## Navigation Relationships

```
user/
├── workouts/
│   ├── list.md ──────────┐
│   │   ├── import ───────┼──> compendium/workouts
│   │   ├── start workout─┼──> run.md
│   │   └── view workout ─┘
│   │
│   ├── detail.md <───────┐
│   │   ├── start workout─┤
│   │   ├── edit schemes ─┤
│   │   ├── view template─┼──> compendium/workouts/:id
│   │   └── view exercise─┘──> compendium/exercises/:id
│   │
│   ├── edit.md ──────────┘
│   │   └── save ────────────> detail.md
│   │
│   ├── run.md (placeholder)
│   └── README.md (concepts)
│
├── workout-logs/
│   ├── README.md (concepts)
│   ├── list.md (placeholder)
│   └── detail.md (placeholder)
│
└── workout-schedule/
    ├── README.md (concepts)
    ├── list.md (placeholder)
    └── detail.md (placeholder)
```

---

## Key Features

### Exercise Scheme Configuration

User workouts require configuring how to perform each exercise:

1. **Import**: Add workout from compendium
2. **Configure**: Assign schemes to each exercise
3. **Track**: Log performances against schemes

### Scheme Assignment UI

- Cards show suggested paradigms from exercise metadata
- Users select appropriate measurement type
- Configure parameters (sets, reps, weight, etc.)
- Batch save all assignments

### Template Reference

Users can always reference the original template:

- "View Template" button on workout pages
- Links to compendium workout detail
- Shows version and template structure

---

## Implementation Status

| Feature               | Status         | Notes                       |
| --------------------- | -------------- | --------------------------- |
| My Workouts List      | ✅ Implemented | Full CRUD for user workouts |
| User Workout Detail   | ✅ Implemented | Scheme status indicators    |
| Edit Exercise Schemes | ✅ Implemented | Batch assignment UI         |
| Workout Logs          | 🚧 Placeholder | Empty component             |
| Log Detail            | 🚧 Placeholder | Basic template only         |
| Workout Schedule      | 🚧 Placeholder | Empty component             |
| Schedule Detail       | 🚧 Placeholder | Basic template only         |

---

## Related Documentation

- [Compendium](../compendium/README.md) - Template library documentation
- [Compendium Workouts](../compendium/workouts.md) - Workout template pages
