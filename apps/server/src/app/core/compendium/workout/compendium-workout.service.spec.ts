import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumWorkoutService } from './compendium-workout.service';
import { CompendiumWorkoutRepository } from '../../persistence/repositories/compendium-workout.repository';
import { CompendiumWorkoutSectionRepository } from '../../persistence/repositories/compendium-workout-section.repository';
import { CompendiumWorkoutSectionItemRepository } from '../../persistence/repositories/compendium-workout-section-item.repository';
import { CompendiumExerciseRepository } from '../../persistence/repositories/compendium-exercise.repository';
import { provideTestDatabase } from '../../persistence/database';
import { mockExercise } from '../../persistence/test-factories';
import type { CreateWorkoutDto } from '../../../routes/compendium/workout/dto/workout.dto';
import { WorkoutSectionType } from '../../persistence/schemas/compendium-workout-section.schema';

describe('CompendiumWorkoutService', () => {
  let service: CompendiumWorkoutService;
  let workoutRepository: CompendiumWorkoutRepository;
  let sectionRepository: CompendiumWorkoutSectionRepository;
  let sectionItemRepository: CompendiumWorkoutSectionItemRepository;
  let exerciseRepository: CompendiumExerciseRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        provideTestDatabase(),
        CompendiumWorkoutRepository,
        CompendiumWorkoutSectionRepository,
        CompendiumWorkoutSectionItemRepository,
        CompendiumExerciseRepository,
        CompendiumWorkoutService,
      ],
    }).compile();

    service = module.get<CompendiumWorkoutService>(CompendiumWorkoutService);
    workoutRepository = module.get<CompendiumWorkoutRepository>(CompendiumWorkoutRepository);
    sectionRepository = module.get<CompendiumWorkoutSectionRepository>(CompendiumWorkoutSectionRepository);
    sectionItemRepository = module.get<CompendiumWorkoutSectionItemRepository>(CompendiumWorkoutSectionItemRepository);
    exerciseRepository = module.get<CompendiumExerciseRepository>(CompendiumExerciseRepository);

    // Create prerequisite test data
    await exerciseRepository.create(mockExercise({ templateId: 'exercise-1' }));
    await exerciseRepository.create(mockExercise({ templateId: 'exercise-2' }));
  });

  describe('create', () => {
    it('should create a complete workout with sections and items', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-1',
        name: 'Full Body Workout',
        description: 'A comprehensive full body workout',
        version: 1,
        sections: [
          {
            type: WorkoutSectionType.WARMUP,
            name: 'Warmup',
            items: [
              {
                exerciseId: 'exercise-1',
                breakBetweenSets: 30,
                breakAfter: 60,
              },
            ],
          },
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Strength Training',
            items: [
              {
                exerciseId: 'exercise-1',
                breakBetweenSets: 90,
                breakAfter: 120,
              },
              {
                exerciseId: 'exercise-2',
                breakBetweenSets: 90,
                breakAfter: 120,
              },
            ],
          },
        ],
      };

      const result = await service.create(workoutDto, 'user-1');

      expect(result).toMatchObject({
        templateId: 'workout-1',
        name: 'Full Body Workout',
        description: 'A comprehensive full body workout',
        version: 1,
        createdBy: 'user-1',
      });

      // Verify sectionIds array was populated
      expect(result.sectionIds).toHaveLength(2);

      // Verify sections were created
      const sections = await sectionRepository.findByIds(result.sectionIds);
      expect(sections).toHaveLength(2);

      // Find sections by type for assertions
      const warmupSection = sections.find((s) => s.type === WorkoutSectionType.WARMUP);
      const strengthSection = sections.find((s) => s.type === WorkoutSectionType.STRENGTH);

      expect(warmupSection).toBeDefined();
      expect(strengthSection).toBeDefined();

      // Verify items were created and linked via workoutSectionItemIds
      expect(warmupSection!.workoutSectionItemIds).toHaveLength(1);
      expect(strengthSection!.workoutSectionItemIds).toHaveLength(2);

      const warmupItems = await sectionItemRepository.findByIds(warmupSection!.workoutSectionItemIds);
      expect(warmupItems).toHaveLength(1);

      const strengthItems = await sectionItemRepository.findByIds(strengthSection!.workoutSectionItemIds);
      expect(strengthItems).toHaveLength(2);
    });

    it('should create a workout with minimal data (no description)', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-2',
        name: 'Simple Workout',
        version: 1,
        sections: [],
      };

      const result = await service.create(workoutDto, 'user-1');

      expect(result).toMatchObject({
        templateId: 'workout-2',
        name: 'Simple Workout',
        version: 1,
      });
      expect(result.description).toBeNull();
      expect(result.sectionIds).toEqual([]);
    });

    it('should create a workout with empty sections', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-3',
        name: 'Empty Workout',
        version: 1,
        sections: [],
      };

      const result = await service.create(workoutDto, 'user-1');

      expect(result.sectionIds).toHaveLength(0);
    });

    it('should create a workout with all section types', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-4',
        name: 'Complete Workout',
        version: 1,
        sections: [
          {
            type: WorkoutSectionType.WARMUP,
            name: 'Warmup',
            items: [],
          },
          {
            type: WorkoutSectionType.STRETCHING,
            name: 'Stretching',
            items: [],
          },
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Strength',
            items: [],
          },
          {
            type: WorkoutSectionType.COOLDOWN,
            name: 'Cooldown',
            items: [],
          },
        ],
      };

      const result = await service.create(workoutDto, 'user-1');

      expect(result.sectionIds).toHaveLength(4);

      const sections = await sectionRepository.findByIds(result.sectionIds);
      expect(sections).toHaveLength(4);

      // Verify order is preserved by sectionIds array
      const orderedTypes = result.sectionIds.map((id) => sections.find((s) => s.id === id)?.type);
      expect(orderedTypes).toEqual([
        WorkoutSectionType.WARMUP,
        WorkoutSectionType.STRETCHING,
        WorkoutSectionType.STRENGTH,
        WorkoutSectionType.COOLDOWN,
      ]);
    });

    it('should preserve section order through sectionIds array', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-5',
        name: 'Ordered Workout',
        version: 1,
        sections: [
          { type: WorkoutSectionType.COOLDOWN, name: 'First Section', items: [] },
          { type: WorkoutSectionType.WARMUP, name: 'Second Section', items: [] },
          { type: WorkoutSectionType.STRENGTH, name: 'Third Section', items: [] },
        ],
      };

      const result = await service.create(workoutDto, 'user-1');

      // Fetch and verify order preserved
      const sections = await sectionRepository.findByIds(result.sectionIds);
      const orderedNames = result.sectionIds.map((id) => sections.find((s) => s.id === id)?.name);

      expect(orderedNames).toEqual(['First Section', 'Second Section', 'Third Section']);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no workouts exist', async () => {
      const results = await service.findAll();
      expect(results).toEqual([]);
    });

    it('should return all workouts', async () => {
      await workoutRepository.create({
        templateId: 'workout-1',
        workoutLineageId: 'lineage-1',
        name: 'Workout A',
        sectionIds: [],
        version: 1,
        createdBy: 'user-1',
      });
      await workoutRepository.create({
        templateId: 'workout-2',
        workoutLineageId: 'lineage-2',
        name: 'Workout B',
        sectionIds: [],
        version: 1,
        createdBy: 'user-1',
      });

      const results = await service.findAll();

      expect(results).toHaveLength(2);
      expect(results.map((w) => w.name)).toEqual(expect.arrayContaining(['Workout A', 'Workout B']));
    });
  });

  describe('findById', () => {
    it('should find a workout with all nested data', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-1',
        name: 'Test Workout',
        version: 1,
        sections: [
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Main Section',
            items: [
              {
                exerciseId: 'exercise-1',
                breakBetweenSets: 60,
                breakAfter: 120,
              },
            ],
          },
        ],
      };

      await service.create(workoutDto, 'user-1');

      const result = await service.findById('workout-1');

      expect(result).toBeDefined();
      expect(result?.name).toBe('Test Workout');
      expect(result?.sections).toHaveLength(1);
      expect(result?.sections[0].items).toHaveLength(1);
      expect(result?.sections[0].items[0]?.exerciseId).toBe('exercise-1');
    });

    it('should return null when workout does not exist', async () => {
      const result = await service.findById('nonexistent');
      expect(result).toBeNull();
    });

    it('should return workout with empty sections when no sections exist', async () => {
      await workoutRepository.create({
        templateId: 'workout-empty',
        workoutLineageId: 'lineage-empty',
        name: 'Empty Workout',
        sectionIds: [],
        version: 1,
        createdBy: 'user-1',
      });

      const result = await service.findById('workout-empty');

      expect(result).toBeDefined();
      expect(result?.sections).toHaveLength(0);
    });

    it('should preserve section order from sectionIds array', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-ordered',
        name: 'Ordered Workout',
        version: 1,
        sections: [
          { type: WorkoutSectionType.COOLDOWN, name: 'First', items: [] },
          { type: WorkoutSectionType.WARMUP, name: 'Second', items: [] },
          { type: WorkoutSectionType.STRENGTH, name: 'Third', items: [] },
        ],
      };

      await service.create(workoutDto, 'user-1');
      const result = await service.findById('workout-ordered');

      expect(result?.sections.map((s) => s.name)).toEqual(['First', 'Second', 'Third']);
    });

    it('should preserve item order from workoutSectionItemIds array', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-items',
        name: 'Workout with Items',
        version: 1,
        sections: [
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Main Section',
            items: [
              { exerciseId: 'exercise-1', breakBetweenSets: 60, breakAfter: 60 },
              { exerciseId: 'exercise-2', breakBetweenSets: 90, breakAfter: 90 },
              { exerciseId: 'exercise-1', breakBetweenSets: 120, breakAfter: 120 },
            ],
          },
        ],
      };

      await service.create(workoutDto, 'user-1');
      const result = await service.findById('workout-items');

      expect(result?.sections[0].items.map((i) => i?.breakBetweenSets)).toEqual([60, 90, 120]);
    });
  });

  describe('update', () => {
    it('should create new version with different templateId but same lineageId', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-v1',
        name: 'Original Workout',
        version: 1,
        sections: [],
      };
      const v1 = await service.create(workoutDto, 'user-1');

      const result = await service.update('workout-v1', { name: 'Updated Workout', sections: [] }, 'user-1');

      expect(result).toBeDefined();
      expect(result?.templateId).not.toBe('workout-v1'); // New templateId
      expect(result?.workoutLineageId).toBe(v1.workoutLineageId); // Same lineageId
      expect(result?.version).toBe(2); // Incremented version
      expect(result?.name).toBe('Updated Workout');
    });

    it('should preserve old version when creating new version', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-v1',
        name: 'Original Workout',
        version: 1,
        sections: [],
      };
      await service.create(workoutDto, 'user-1');

      await service.update('workout-v1', { name: 'Updated Workout', sections: [] }, 'user-1');

      // Old version should still exist
      const oldVersion = await service.findById('workout-v1');
      expect(oldVersion).toBeDefined();
      expect(oldVersion?.name).toBe('Original Workout');
      expect(oldVersion?.version).toBe(1);
    });

    it('should reuse unchanged items at same position', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-v1',
        name: 'Workout with Items',
        version: 1,
        sections: [
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Main Section',
            items: [
              { exerciseId: 'exercise-1', breakBetweenSets: 60, breakAfter: 120 },
            ],
          },
        ],
      };
      await service.create(workoutDto, 'user-1');
      const v1 = await service.findById('workout-v1');
      const originalItemId = v1?.sections[0].items[0]?.id;

      // Update with identical items
      const result = await service.update('workout-v1', {
        sections: [
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Main Section',
            items: [
              { exerciseId: 'exercise-1', breakBetweenSets: 60, breakAfter: 120 },
            ],
          },
        ],
      }, 'user-1');

      const v2 = await service.findById(result!.templateId);
      expect(v2?.sections[0].items[0]?.id).toBe(originalItemId); // Same item ID reused
    });

    it('should create new item when properties change', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-v1',
        name: 'Workout with Items',
        version: 1,
        sections: [
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Main Section',
            items: [
              { exerciseId: 'exercise-1', breakBetweenSets: 60, breakAfter: 120 },
            ],
          },
        ],
      };
      await service.create(workoutDto, 'user-1');
      const v1 = await service.findById('workout-v1');
      const originalItemId = v1?.sections[0].items[0]?.id;

      // Update with changed break time
      const result = await service.update('workout-v1', {
        sections: [
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Main Section',
            items: [
              { exerciseId: 'exercise-1', breakBetweenSets: 90, breakAfter: 120 }, // Different breakBetweenSets
            ],
          },
        ],
      }, 'user-1');

      const v2 = await service.findById(result!.templateId);
      expect(v2?.sections[0].items[0]?.id).not.toBe(originalItemId); // New item created
      expect(v2?.sections[0].items[0]?.breakBetweenSets).toBe(90);
    });

    it('should create new item when position changes', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-v1',
        name: 'Workout with Items',
        version: 1,
        sections: [
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Main Section',
            items: [
              { exerciseId: 'exercise-1', breakBetweenSets: 60, breakAfter: 120 },
            ],
          },
        ],
      };
      await service.create(workoutDto, 'user-1');
      const v1 = await service.findById('workout-v1');
      const originalItemId = v1?.sections[0].items[0]?.id;

      // Insert new item before, pushing original to position 1
      const result = await service.update('workout-v1', {
        sections: [
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Main Section',
            items: [
              { exerciseId: 'exercise-2', breakBetweenSets: 30, breakAfter: 60 }, // New item at position 0
              { exerciseId: 'exercise-1', breakBetweenSets: 60, breakAfter: 120 }, // Same content but now position 1
            ],
          },
        ],
      }, 'user-1');

      const v2 = await service.findById(result!.templateId);
      // Item at position 1 should be new (position changed from 0 to 1)
      expect(v2?.sections[0].items[1]?.id).not.toBe(originalItemId);
    });

    it('should always create new sections (sections are version-specific)', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-v1',
        name: 'Workout with Section',
        version: 1,
        sections: [
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Main Section',
            items: [],
          },
        ],
      };
      await service.create(workoutDto, 'user-1');
      const v1 = await service.findById('workout-v1');
      const originalSectionId = v1?.sections[0].id;

      // Update with identical section
      const result = await service.update('workout-v1', {
        sections: [
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Main Section',
            items: [],
          },
        ],
      }, 'user-1');

      const v2 = await service.findById(result!.templateId);
      expect(v2?.sections[0].id).not.toBe(originalSectionId); // New section created
    });

    it('should return null when updating non-existent workout', async () => {
      const result = await service.update('nonexistent', { name: 'New Name', sections: [] }, 'user-1');
      expect(result).toBeNull();
    });

    it('should inherit values from old workout when not provided', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-v1',
        name: 'Original Name',
        description: 'Original Description',
        version: 1,
        sections: [],
      };
      await service.create(workoutDto, 'user-1');

      // Only provide sections, not name or description
      const result = await service.update('workout-v1', { sections: [] }, 'user-1');

      expect(result?.name).toBe('Original Name');
      expect(result?.description).toBe('Original Description');
    });
  });

  describe('forkedFrom tracking', () => {
    it('should set forkedFrom to null for items created via create()', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-new',
        name: 'New Workout',
        version: 1,
        sections: [
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Section',
            items: [
              { exerciseId: 'exercise-1', breakBetweenSets: 60, breakAfter: 120 },
            ],
          },
        ],
      };

      await service.create(workoutDto, 'user-1');
      const result = await service.findById('workout-new');

      expect(result?.sections[0].forkedFrom).toBeNull();
      expect(result?.sections[0].items[0]?.forkedFrom).toBeNull();
    });

    it('should set forkedFrom on sections derived from old sections', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-v1',
        name: 'Workout',
        version: 1,
        sections: [
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Original Section',
            items: [],
          },
        ],
      };
      await service.create(workoutDto, 'user-1');
      const v1 = await service.findById('workout-v1');
      const originalSectionId = v1?.sections[0].id;

      // Update - new section should track it was derived from original
      const result = await service.update('workout-v1', {
        sections: [
          { type: WorkoutSectionType.STRENGTH, name: 'Modified Section', items: [] },
        ],
      }, 'user-1');

      const v2 = await service.findById(result!.templateId);
      expect(v2?.sections[0].forkedFrom).toBe(originalSectionId);
    });

    it('should set forkedFrom on items derived from changed old items', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-v1',
        name: 'Workout',
        version: 1,
        sections: [
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Section',
            items: [
              { exerciseId: 'exercise-1', breakBetweenSets: 60, breakAfter: 120 },
            ],
          },
        ],
      };
      await service.create(workoutDto, 'user-1');
      const v1 = await service.findById('workout-v1');
      const originalItemId = v1?.sections[0].items[0]?.id;

      // Update with changed item - new item should track derivation
      const result = await service.update('workout-v1', {
        sections: [
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Section',
            items: [
              { exerciseId: 'exercise-1', breakBetweenSets: 90, breakAfter: 120 }, // Changed breakBetweenSets
            ],
          },
        ],
      }, 'user-1');

      const v2 = await service.findById(result!.templateId);
      expect(v2?.sections[0].items[0]?.forkedFrom).toBe(originalItemId);
    });

    it('should set forkedFrom to null for newly added sections', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-v1',
        name: 'Workout',
        version: 1,
        sections: [
          { type: WorkoutSectionType.WARMUP, name: 'Warmup', items: [] },
        ],
      };
      await service.create(workoutDto, 'user-1');

      // Update with additional section at new position
      const result = await service.update('workout-v1', {
        sections: [
          { type: WorkoutSectionType.WARMUP, name: 'Warmup', items: [] },
          { type: WorkoutSectionType.STRENGTH, name: 'New Section', items: [] }, // New section
        ],
      }, 'user-1');

      const v2 = await service.findById(result!.templateId);
      // First section derived from old, second is new
      expect(v2?.sections[0].forkedFrom).toBeDefined(); // Derived from old
      expect(v2?.sections[1].forkedFrom).toBeNull(); // New section
    });

    it('should set forkedFrom to null for newly added items', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-v1',
        name: 'Workout',
        version: 1,
        sections: [
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Section',
            items: [
              { exerciseId: 'exercise-1', breakBetweenSets: 60, breakAfter: 120 },
            ],
          },
        ],
      };
      await service.create(workoutDto, 'user-1');
      const v1 = await service.findById('workout-v1');
      const originalItemId = v1?.sections[0].items[0]?.id;

      // Update with additional item at new position
      const result = await service.update('workout-v1', {
        sections: [
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Section',
            items: [
              { exerciseId: 'exercise-1', breakBetweenSets: 60, breakAfter: 120 }, // Unchanged - reused
              { exerciseId: 'exercise-2', breakBetweenSets: 90, breakAfter: 180 }, // New item
            ],
          },
        ],
      }, 'user-1');

      const v2 = await service.findById(result!.templateId);
      // First item reused (same ID), second is new with forkedFrom: null
      expect(v2?.sections[0].items[0]?.id).toBe(originalItemId); // Reused
      expect(v2?.sections[0].items[1]?.forkedFrom).toBeNull(); // New item
    });
  });

  describe('delete', () => {
    it('should delete a workout', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-1',
        name: 'Test Workout',
        version: 1,
        sections: [
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Main Section',
            items: [
              {
                exerciseId: 'exercise-1',
                breakBetweenSets: 60,
                breakAfter: 120,
              },
            ],
          },
        ],
      };

      const created = await service.create(workoutDto, 'user-1');

      const result = await service.delete('workout-1');

      expect(result).toMatchObject({ templateId: 'workout-1' });

      // Verify workout deleted
      const found = await workoutRepository.findById('workout-1');
      expect(found).toBeUndefined();

      // Verify sections and items are NOT deleted (per versioning architecture)
      const sections = await sectionRepository.findByIds(created.sectionIds);
      expect(sections).toHaveLength(1);

      const items = await sectionItemRepository.findByIds(sections[0].workoutSectionItemIds);
      expect(items).toHaveLength(1);
    });
  });
});
