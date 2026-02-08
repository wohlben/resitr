# Versioning Architecture

This document describes the fundamental design philosophy for versioning workouts and exercises in ResiTr. All features that interact with these entities must adhere to these principles.

For the overall persistence architecture and how compendium entities relate to user entities, see [Persistence Architecture](./persistence.md).

## Core Principle: Immutability of Referenced Entities

Once a workout section item is created and potentially referenced by exercise logs, it must never be deleted or modified. This ensures data integrity across the entire system.

## Why Versioning Exists

Versioning serves three critical purposes:

### 1. Preserving Historical Integrity

When a user logs an exercise, that log references a specific section item. If that item were deleted or modified, the log would either become orphaned (broken foreign key) or would retroactively change meaning. Neither is acceptable. Historical data must remain accurate and accessible.

### 2. Isolation of Changes

When a user modifies their "Push Day" workout, other users who have the same workout (or a forked version) should not see their workout change. Each user's experience is isolated to the versions they explicitly have.

### 3. Fork Support

Users can "fork" workouts from others. When the original author updates their workout, forked versions remain unchanged. However, users can be notified that the source has a new version and choose to update. This requires the original version to remain intact.

## Entity Relationships

```
WorkoutTemplate (templateId, version, workoutLineageId, sectionIds[])
    │
    └── references via sectionIds[] ──► WorkoutSection (id, workoutSectionItemIds[])
                                            │
                                            └── references via workoutSectionItemIds[] ──► WorkoutSectionItem (id, exerciseId)
                                                                                               │
                                                                                               └── ExerciseLog (references sectionItemId)
```

### Persistence Model

The relationships between entities use **JSON arrays** rather than traditional foreign keys. This design enables:

- **N:M relationships** - Items can be referenced by multiple sections, sections can be referenced by multiple workouts
- **Implicit ordering** - Array position determines display order (no separate `orderIndex` field needed)
- **Version sharing** - Unchanged entities can be reused across versions without duplication

**How it works:**
- `WorkoutTemplate.sectionIds` is a JSON array of section IDs, ordered by display position
- `WorkoutSection.workoutSectionItemIds` is a JSON array of item IDs, ordered by display position
- Entities are standalone records - they don't "belong to" a parent via FK
- Deleting a workout does NOT cascade to sections/items (they may be shared)

### Key Identifiers

- **templateId** - Unique identifier for each version record (UUID, primary key). Each version has its own templateId.
- **version** - Integer version number within a lineage (1, 2, 3...). Provides human-readable versioning.
- **workoutLineageId** - Shared UUID across all versions of the same conceptual workout. Links v1, v2, v3 of "Push Day" together. Enables fork tracking and version history queries.

Each version is a separate database record. A workout is uniquely identified by its `templateId`. The combination of `workoutLineageId` + `version` provides the conceptual identity (e.g., "Push Day v2").

## What Happens When a User "Updates" a Workout

When a user edits a workout and saves changes, the system does NOT modify the existing workout. Instead:

1. **Create New Version** - A new workout record is created with a new `templateId`, incremented `version` number, and the same `workoutLineageId`.

2. **Create New Sections** - Sections are created fresh for the new version. The new workout's `sectionIds` array references these new section IDs.

3. **Reuse Unchanged Items** - Section items that are semantically identical to items in the previous version are reused. The new section's `workoutSectionItemIds` array can reference the same item ID that the old section referenced. If anything changes, a new item is created.

4. **Old Version Remains Intact** - The previous version with all its sections and items continues to exist unchanged. Any logs referencing it remain valid.

5. **Update User References** - The user's "active" workout reference is updated to point to the new version.

## Item Reuse Strategy

When creating a new version, unchanged section items are reused. Both the old and new section's `workoutSectionItemIds` arrays reference the same item ID. This is important because:

- **UI Diff Display** - The frontend can show what changed between versions by comparing which item IDs are shared vs. new
- **Log Continuity** - If an item is unchanged, logs work seamlessly across versions
- **Reduced Duplication** - Less redundant data in the database

### What Makes an Item "Unchanged"

An item is considered unchanged and can be reused if ALL of the following are identical:

- `exerciseId`
- `breakBetweenSets`
- `breakAfter`
- Position in the section (array index in `workoutSectionItemIds`)

If ANY of these differ, a new item must be created.

### Section Changes Affect Item Reuse

Items are standalone entities - they don't "belong to" a section via FK. If the parent section's identity changes (different type or name), items can still be directly reused if their content and position are exactly identical. The new section simply includes the same item ID in its `workoutSectionItemIds` array.

## Deletion Policy

### Items and Sections Are Never Deleted

Section items and sections must never be deleted once created. They may be:

- Referenced by exercise logs (items)
- Shared across multiple workout versions
- Part of historical data that must remain intact

Since relationships use JSON arrays rather than FKs, there is no automatic cascade delete. Deleting a workout only removes the workout record itself - sections and items remain in the database.

### Workout Deletion

When a user explicitly deletes a workout:

1. **Only Workout Record Deleted** - The workout record is removed, but sections and items remain.

2. **Orphaned Data Expected** - Sections and items that are no longer referenced by any workout will exist as orphaned records. This is intentional and acceptable.

3. **Soft Delete Preferred** - For user-facing "delete" operations, marking the workout as "deleted" without removing it preserves all data and is the safer approach.

## Practical Example

### Initial State

- User has "Push Day" v1 with:
  - `sectionIds: ["section-A"]`
  - Section "Chest" (id: section-A) with `workoutSectionItemIds: ["item-1"]`
  - Item "Bench Press" (id: item-1) at position 0
- User logs 3 sets of bench press, creating logs that reference item-1

### Scenario: User Adds an Exercise

User adds "Incline Press" before "Bench Press", changing the order.

**Result:**

- "Push Day" v2 is created (new templateId, same workoutLineageId)
- New Section "Chest" (id: section-B) is created for v2
- New Item "Incline Press" (id: item-2) is created
- New Item "Bench Press" (id: item-3) is created (NOT reused - position changed from 0 to 1)
- v2's section-B has `workoutSectionItemIds: ["item-2", "item-3"]`
- v1 remains completely unchanged with its original sectionIds and items
- Historical logs still correctly point to item-1

### Scenario: User Changes Break Time

User only changes the break time for Bench Press, nothing else.

**Result:**

- "Push Day" v2 is created
- New Section "Chest" (id: section-B) is created
- New Item for Bench Press (id: item-2) is created (parameters changed)
- section-B has `workoutSectionItemIds: ["item-2"]`
- The original item-1 remains, logs still reference it

### Scenario: No Changes to an Item

User adds a new section but doesn't touch the existing "Chest" section or its items.

**Result:**

- "Push Day" v2 is created with `sectionIds: ["section-B", "section-C"]`
- New Section "Chest" (id: section-B) is created for v2
- section-B has `workoutSectionItemIds: ["item-1"]` - reusing the same item!
- New Section "Shoulders" (id: section-C) is created
- Both v1's section-A and v2's section-B reference item-1

## Design Rules Summary

1. **Never modify existing items or sections** - Always create new records
2. **Never delete items or sections** - They may be referenced by other versions or logs
3. **Updates create new versions** - Same lineageId, new templateId
4. **Sections are version-specific** - Always created fresh per version
5. **Items can be shared** - Reused across versions via `workoutSectionItemIds` arrays when unchanged
6. **Old versions are immutable** - They exist forever (unless explicitly deleted with safety checks)
7. **Relationships via JSON arrays** - `sectionIds` and `workoutSectionItemIds` enable N:M sharing and implicit ordering
8. **No cascade deletes** - Deleting a workout leaves sections and items intact

## Related Documentation

- [Persistence Architecture](./persistence.md) - Overall data model and compendium/user entity relationships
