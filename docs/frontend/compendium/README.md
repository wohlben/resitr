# Compendium Frontend Documentation

The compendium section provides a comprehensive library of fitness templates including exercises, equipment, exercise groups, and workouts. These pages allow users to browse, search, filter, create, and manage fitness content.

---

## Overview

The compendium is organized into four main content areas:

| Resource            | Description                                          | Base Route                    |
| ------------------- | ---------------------------------------------------- | ----------------------------- |
| **Exercises**       | Individual exercise templates with detailed metadata | `/compendium/exercises`       |
| **Equipment**       | Fitness equipment definitions and specifications     | `/compendium/equipments`      |
| **Exercise Groups** | Collections of related exercises                     | `/compendium/exercise-groups` |
| **Workouts**        | Structured workout templates with sections           | `/compendium/workouts`        |

---

## Documentation Structure

Each resource has route-specific documentation in subdirectories:

```
compendium/
├── README.md                    # This overview
├── exercises/                   # Exercise routes
│   ├── list.md                 # /compendium/exercises
│   ├── detail.md               # /compendium/exercises/:id
│   ├── new.md                  # /compendium/exercises/new
│   └── edit.md                 # /compendium/exercises/:id/edit
├── equipments/                  # Equipment routes
│   ├── list.md                 # /compendium/equipments
│   ├── detail.md               # /compendium/equipments/:id
│   ├── new.md                  # /compendium/equipments/new
│   └── edit.md                 # /compendium/equipments/:id/edit
├── exercise-groups/             # Exercise group routes
│   ├── list.md                 # /compendium/exercise-groups
│   ├── detail.md               # /compendium/exercise-groups/:id
│   ├── new.md                  # /compendium/exercise-groups/new
│   └── edit.md                 # /compendium/exercise-groups/:id/edit
└── workouts/                    # Workout routes
    ├── list.md                 # /compendium/workouts
    ├── detail.md               # /compendium/workouts/:id
    ├── new.md                  # /compendium/workouts/new
    ├── edit.md                 # /compendium/workouts/:id/edit
    └── versions.md             # /compendium/workouts/:id/versions
```

---

## Common UX Patterns

### List Pages

All list pages follow a consistent pattern:

1. **Header Section**

   - Page title and description
   - Primary "Create New" action button

2. **Filter Section**

   - Search input
   - Category/type filters
   - Real-time filtering

3. **Content Area**

   - Loading state (spinner with message)
   - Error state (error card with retry)
   - Empty state (icon + message)
   - Results list with pagination

4. **Pagination**
   - Item count display
   - Page navigation
   - Items per page selector

### Detail Pages

All detail pages follow a consistent pattern:

1. **Header Section**

   - Back button to list
   - Title and subtitle
   - Primary action (Edit)
   - Secondary actions (context-dependent)

2. **Content Sections**

   - Information cards with labeled fields
   - Related items lists
   - Metadata (timestamps, IDs)

3. **Navigation Links**
   - Links to related resources
   - Cross-reference navigation

### Form Pages (Create/Edit)

All form pages follow a consistent pattern:

1. **Header Section**

   - Page title and description/subtitle

2. **Form Area**

   - Field inputs with validation
   - Dynamic sections (add/remove items)
   - Error summary display

3. **Action Bar**

   - Danger action (delete, edit mode only)
   - Cancel button
   - Submit button (primary, disabled when invalid)

4. **Loading States**

   - Loading overlay when fetching data
   - Loading state on submit button
   - Spinner indicators for async operations

5. **Confirmation Dialogs**
   - Delete confirmation
   - Unsaved changes warning

---

## Guards and Protections

### Unsaved Changes Guard

Applied to all create and edit routes:

- Tracks form state changes
- Prompts confirmation when navigating away with unsaved changes
- Options: "Stay" (keep editing) or "Leave" (discard changes)
- Automatically bypassed after successful submission

---

## Page Documentation

### Exercise Pages

**Routes:**

- [`/compendium/exercises`](./exercises/list.md) - Exercise list with filtering
- [`/compendium/exercises/new`](./exercises/new.md) - Create new exercise
- [`/compendium/exercises/:id`](./exercises/detail.md) - View exercise details
- [`/compendium/exercises/:id/edit`](./exercises/edit.md) - Edit exercise and manage relationships

### Equipment Pages

**Routes:**

- [`/compendium/equipments`](./equipments/list.md) - Equipment list with filtering
- [`/compendium/equipments/new`](./equipments/new.md) - Create new equipment
- [`/compendium/equipments/:id`](./equipments/detail.md) - View equipment details
- [`/compendium/equipments/:id/edit`](./equipments/edit.md) - Edit equipment

### Exercise Group Pages

**Routes:**

- [`/compendium/exercise-groups`](./exercise-groups/list.md) - Group list with filtering
- [`/compendium/exercise-groups/new`](./exercise-groups/new.md) - Create new group
- [`/compendium/exercise-groups/:id`](./exercise-groups/detail.md) - View group details
- [`/compendium/exercise-groups/:id/edit`](./exercise-groups/edit.md) - Edit group and manage members

### Workout Pages

**Routes:**

- [`/compendium/workouts`](./workouts/list.md) - Workout list with filtering
- [`/compendium/workouts/new`](./workouts/new.md) - Create new workout
- [`/compendium/workouts/:id`](./workouts/detail.md) - View workout structure
- [`/compendium/workouts/:id/edit`](./workouts/edit.md) - Edit workout (creates new version)
- [`/compendium/workouts/:id/versions`](./workouts/versions.md) - View version history

---

## Navigation Relationships

```
compendium/
├── exercises/
│   ├── list.md ────────────┐
│   │   ├── new ────────────┤
│   │   └── view ───────────┼──> detail.md
│   │                       │
│   ├── detail.md <─────────┤
│   │   ├── edit ───────────┼──> edit.md
│   │   ├── equipment ──────┼──> ../equipments/detail.md
│   │   ├── group ──────────┼──> ../exercise-groups/detail.md
│   │   └── related ────────┴──> ./detail.md
│   │
│   ├── new.md ─────────────┘
│   └── edit.md
│
├── equipments/
│   ├── list.md
│   ├── detail.md
│   ├── new.md
│   └── edit.md
│
├── exercise-groups/
│   ├── list.md
│   ├── detail.md
│   ├── new.md
│   └── edit.md
│
└── workouts/
    ├── list.md
    ├── detail.md
    ├── new.md
    ├── edit.md
    └── versions.md
```

---

## Key Features

### Cross-Linking

Resources are interconnected through navigation links:

- **Exercises** link to their required **Equipment**
- **Exercises** show their **Group** memberships
- **Exercise Groups** list their member **Exercises**
- **Workouts** link to **Exercises** in their sections
- **Related Exercises** form a graph of progressions/regressions

### Filtering and Search

All list pages support:

- Text search (name, description)
- Category filters (type-based)
- Multi-select filters (muscles, equipment, etc.)
- Real-time results updating
- URL-encodable filter state (future)

### Relationship Management

Exercise edit page provides:

- Add/remove related exercises
- Define relationship types (progression, regression, etc.)
- Join/leave exercise groups
- Visual relationship graph display

### Versioning (Workouts Only)

Workouts implement immutable versioning:

- Each edit creates a new version
- All versions remain accessible
- Only latest version is editable
- Version history page for navigation
- User workouts reference specific versions

---

## Route Reference

### Exercises

| Route                            | Page                            | Description      |
| -------------------------------- | ------------------------------- | ---------------- |
| `/compendium/exercises`          | [List](./exercises/list.md)     | Browse exercises |
| `/compendium/exercises/new`      | [Create](./exercises/new.md)    | Create exercise  |
| `/compendium/exercises/:id`      | [Detail](./exercises/detail.md) | View exercise    |
| `/compendium/exercises/:id/edit` | [Edit](./exercises/edit.md)     | Edit exercise    |

### Equipment

| Route                             | Page                             | Description      |
| --------------------------------- | -------------------------------- | ---------------- |
| `/compendium/equipments`          | [List](./equipments/list.md)     | Browse equipment |
| `/compendium/equipments/new`      | [Create](./equipments/new.md)    | Create equipment |
| `/compendium/equipments/:id`      | [Detail](./equipments/detail.md) | View equipment   |
| `/compendium/equipments/:id/edit` | [Edit](./equipments/edit.md)     | Edit equipment   |

### Exercise Groups

| Route                                  | Page                                  | Description   |
| -------------------------------------- | ------------------------------------- | ------------- |
| `/compendium/exercise-groups`          | [List](./exercise-groups/list.md)     | Browse groups |
| `/compendium/exercise-groups/new`      | [Create](./exercise-groups/new.md)    | Create group  |
| `/compendium/exercise-groups/:id`      | [Detail](./exercise-groups/detail.md) | View group    |
| `/compendium/exercise-groups/:id/edit` | [Edit](./exercise-groups/edit.md)     | Edit group    |

### Workouts

| Route                               | Page                               | Description     |
| ----------------------------------- | ---------------------------------- | --------------- |
| `/compendium/workouts`              | [List](./workouts/list.md)         | Browse workouts |
| `/compendium/workouts/new`          | [Create](./workouts/new.md)        | Create workout  |
| `/compendium/workouts/:id`          | [Detail](./workouts/detail.md)     | View workout    |
| `/compendium/workouts/:id/edit`     | [Edit](./workouts/edit.md)         | Edit workout    |
| `/compendium/workouts/:id/versions` | [Versions](./workouts/versions.md) | Version history |
