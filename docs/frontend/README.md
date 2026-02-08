# Frontend Documentation

This directory contains documentation for the ResiTr frontend application, organized by feature area.

---

## Structure

```
docs/frontend/
├── README.md                 # This file - overview and navigation
├── compendium/              # Template library documentation
│   ├── README.md
│   ├── exercises.md
│   ├── equipments.md
│   ├── exercise-groups.md
│   └── workouts.md
└── user/                    # Personal fitness management
    ├── README.md
    ├── workouts.md          # Conceptual documentation
    └── workouts/            # Route-specific documentation
        ├── list.md          # /user/workouts
        ├── detail.md        # /user/workouts/:id
        └── edit.md          # /user/workouts/:id/edit
```

---

## Feature Areas

### [Compendium](./compendium/README.md)

The compendium is a library of fitness templates (exercises, equipment, groups, workouts) that can be browsed, searched, and used as templates for personal workouts.

**Key Pages:**

- Exercise management with relationships
- Equipment catalog
- Exercise group collections
- Workout templates with versioning

### [User](./user/README.md)

The user section provides personal fitness management including workout collection, exercise scheme configuration, logging, and scheduling.

**Key Pages:**

- My Workouts (personal collection)
- Exercise scheme configuration
- Workout logs (planned)
- Workout schedule (planned)

---

## User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        USER FLOW                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────────┐         ┌──────────────┐                │
│   │  Compendium  │────────>│   Import     │                │
│   │  (Browse)    │         │  Workout     │                │
│   └──────────────┘         └──────┬───────┘                │
│                                   │                         │
│                                   ▼                         │
│                          ┌──────────────┐                  │
│                          │  Configure   │                  │
│                          │   Schemes    │                  │
│                          └──────┬───────┘                  │
│                                   │                         │
│                                   ▼                         │
│                          ┌──────────────┐                  │
│                          │    Log       │                  │
│                          │  Workout     │                  │
│                          └──────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

1. **Browse Compendium**: Explore exercise and workout templates
2. **Import Workout**: Add workout template to personal collection
3. **Configure Schemes**: Set up how to perform each exercise
4. **Log Workout**: Record completed sessions (planned)

---

## Common Patterns

### Page Structure

Most pages follow a consistent structure:

```
┌─────────────────────────────────────────┐
│  Header                                 │
│  - Title / Subtitle                     │
│  - Back button                          │
│  - Primary action                       │
├─────────────────────────────────────────┤
│  Filter/Search (list pages)             │
├─────────────────────────────────────────┤
│  Content                                │
│  - Loading state                        │
│  - Error state                          │
│  - Empty state                          │
│  - Data display                         │
├─────────────────────────────────────────┤
│  Pagination (list pages)                │
└─────────────────────────────────────────┘
```

### Guards

**Unsaved Changes Guard**

- Applied to all create and edit forms
- Prompts confirmation when leaving with unsaved changes
- Prevents accidental data loss

### Navigation

- **Breadcrumbs**: Back buttons link to parent list pages
- **Cross-links**: Related resources link to each other
- **Action Links**: Contextual navigation based on page state

---

## Route Reference

### Compendium Routes

| Route                                  | Page                                                   | Description      |
| -------------------------------------- | ------------------------------------------------------ | ---------------- |
| `/compendium/exercises`                | [List](./compendium/exercises.md)                      | Browse exercises |
| `/compendium/exercises/new`            | [Create](./compendium/exercises.md#create-exercise)    | Create exercise  |
| `/compendium/exercises/:id`            | [Detail](./compendium/exercises.md#exercise-detail)    | View exercise    |
| `/compendium/exercises/:id/edit`       | [Edit](./compendium/exercises.md#edit-exercise)        | Edit exercise    |
| `/compendium/equipments`               | [List](./compendium/equipments.md)                     | Browse equipment |
| `/compendium/equipments/new`           | [Create](./compendium/equipments.md#create-equipment)  | Create equipment |
| `/compendium/equipments/:id`           | [Detail](./compendium/equipments.md#equipment-detail)  | View equipment   |
| `/compendium/equipments/:id/edit`      | [Edit](./compendium/equipments.md#edit-equipment)      | Edit equipment   |
| `/compendium/exercise-groups`          | [List](./compendium/exercise-groups.md)                | Browse groups    |
| `/compendium/exercise-groups/new`      | [Create](./compendium/exercise-groups.md#create-group) | Create group     |
| `/compendium/exercise-groups/:id`      | [Detail](./compendium/exercise-groups.md#group-detail) | View group       |
| `/compendium/exercise-groups/:id/edit` | [Edit](./compendium/exercise-groups.md#edit-group)     | Edit group       |
| `/compendium/workouts`                 | [List](./compendium/workouts.md)                       | Browse workouts  |
| `/compendium/workouts/new`             | [Create](./compendium/workouts.md#create-workout)      | Create workout   |
| `/compendium/workouts/:id`             | [Detail](./compendium/workouts.md#workout-detail)      | View workout     |
| `/compendium/workouts/:id/edit`        | [Edit](./compendium/workouts.md#edit-workout)          | Edit workout     |
| `/compendium/workouts/:id/versions`    | [Versions](./compendium/workouts.md#version-history)   | View history     |

### User Routes

| Route                        | Page                                | Description                  |
| ---------------------------- | ----------------------------------- | ---------------------------- |
| `/user/workouts`             | [List](./user/workouts/list.md)     | My workout collection        |
| `/user/workouts/:id`         | [Detail](./user/workouts/detail.md) | View workout instance        |
| `/user/workouts/:id/edit`    | [Edit](./user/workouts/edit.md)     | Configure exercise schemes   |
| `/user/workouts` (concepts)  | [Concepts](./user/workouts.md)      | Workout/scheme relationships |
| `/user/workout-logs`         | Placeholder                         | Workout history              |
| `/user/workout-logs/:id`     | Placeholder                         | Log details                  |
| `/user/workout-schedule`     | Placeholder                         | Workout calendar             |
| `/user/workout-schedule/:id` | Placeholder                         | Scheduled workout            |

---

## Documentation Standards

Each page documentation includes:

1. **Goal**: Purpose of the page
2. **UX Flows**: Step-by-step user interactions
3. **Actions**: Table of available actions with destinations
4. **Navigation**: Links to related pages
5. **Guards**: Any route protections

---

## Quick Links

- [Compendium Overview](./compendium/README.md)
- [User Overview](./user/README.md)
