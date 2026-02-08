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

- [`/compendium/exercises`](./exercises.md) - Exercise list with filtering
- [`/compendium/exercises/new`](./exercises.md#create-exercise) - Create new exercise
- [`/compendium/exercises/:id`](./exercises.md#exercise-detail) - View exercise details
- [`/compendium/exercises/:id/edit`](./exercises.md#edit-exercise) - Edit exercise and manage relationships

### Equipment Pages

- [`/compendium/equipments`](./equipments.md) - Equipment list with filtering
- [`/compendium/equipments/new`](./equipments.md#create-equipment) - Create new equipment
- [`/compendium/equipments/:id`](./equipments.md#equipment-detail) - View equipment details
- [`/compendium/equipments/:id/edit`](./equipments.md#edit-equipment) - Edit equipment

### Exercise Group Pages

- [`/compendium/exercise-groups`](./exercise-groups.md) - Group list with filtering
- [`/compendium/exercise-groups/new`](./exercise-groups.md#create-group) - Create new group
- [`/compendium/exercise-groups/:id`](./exercise-groups.md#group-detail) - View group details
- [`/compendium/exercise-groups/:id/edit`](./exercise-groups.md#edit-group) - Edit group and manage members

### Workout Pages

- [`/compendium/workouts`](./workouts.md) - Workout list with filtering
- [`/compendium/workouts/new`](./workouts.md#create-workout) - Create new workout
- [`/compendium/workouts/:id`](./workouts.md#workout-detail) - View workout structure
- [`/compendium/workouts/:id/edit`](./workouts.md#edit-workout) - Edit workout (creates new version)
- [`/compendium/workouts/:id/versions`](./workouts.md#version-history) - View version history

---

## Navigation Relationships

```
compendium/
├── exercises/
│   ├── [list] ──> new ──> [detail] <──> edit
│   │                │        │
│   │                │        └──> equipment detail
│   │                │        └──> exercise group detail
│   │                │        └──> related exercises
│   │                │
│   └── exercise detail <──> exercise group detail
│
├── equipments/
│   ├── [list] ──> new ──> [detail] <──> edit
│
├── exercise-groups/
│   ├── [list] ──> new ──> [detail] <──> edit
│   │                              │
│   └── exercise detail <──────────┘
│
└── workouts/
    ├── [list] ──> new ──> [detail] <──> edit
    │                         │
    │                         ├──> version history
    │                         ├──> add to my workouts
    │                         └──> exercise detail
    │
    └── versions <────────────┘
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
