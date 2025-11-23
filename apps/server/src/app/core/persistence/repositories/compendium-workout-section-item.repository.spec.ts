import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumWorkoutSectionItemRepository } from './compendium-workout-section-item.repository';
import { CompendiumWorkoutSectionRepository } from './compendium-workout-section.repository';
import { CompendiumWorkoutRepository } from './compendium-workout.repository';
import { UserExerciseSchemeRepository } from './user-exercise-scheme.repository';
import { UserExerciseSchemeCompendiumWorkoutSectionItemRepository } from './user-exercise-scheme-compendium-workout-section-item.repository';
import { CompendiumExerciseRepository } from './compendium-exercise.repository';
import { provideTestDatabase } from '../database';
import { mockWorkout, mockWorkoutSection, mockWorkoutSectionItem, mockExercise, mockUserExerciseScheme } from '../test-factories';
import type { CompendiumWorkoutSection } from '../schemas/compendium-workout-section.schema';
import type { NewUserExerciseScheme } from '../schemas/user-exercise-scheme.schema';

describe('CompendiumWorkoutSectionItemRepository', () => {
  let repository: CompendiumWorkoutSectionItemRepository;
  let sectionRepository: CompendiumWorkoutSectionRepository;
  let workoutRepository: CompendiumWorkoutRepository;
  let schemeRepository: UserExerciseSchemeRepository;
  let exerciseRepository: CompendiumExerciseRepository;
  let testSection1: CompendiumWorkoutSection;
  let testSection2: CompendiumWorkoutSection;
  let testScheme1: NewUserExerciseScheme & { id: string };
  let testScheme2: NewUserExerciseScheme & { id: string };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        provideTestDatabase(),
        CompendiumWorkoutSectionItemRepository,
        CompendiumWorkoutSectionRepository,
        CompendiumWorkoutRepository,
        UserExerciseSchemeRepository,
        CompendiumExerciseRepository,
        UserExerciseSchemeCompendiumWorkoutSectionItemRepository,
      ],
    }).compile();

    repository = module.get<CompendiumWorkoutSectionItemRepository>(CompendiumWorkoutSectionItemRepository);
    sectionRepository = module.get<CompendiumWorkoutSectionRepository>(CompendiumWorkoutSectionRepository);
    workoutRepository = module.get<CompendiumWorkoutRepository>(CompendiumWorkoutRepository);
    schemeRepository = module.get<UserExerciseSchemeRepository>(UserExerciseSchemeRepository);
    exerciseRepository = module.get<CompendiumExerciseRepository>(CompendiumExerciseRepository);

    // Create prerequisite test data
    const workout = await workoutRepository.create(mockWorkout({ templateId: 'workout-1' }));
    testSection1 = await sectionRepository.create(mockWorkoutSection({ workoutTemplateId: workout.templateId, name: 'Section 1' }));
    testSection2 = await sectionRepository.create(mockWorkoutSection({ workoutTemplateId: workout.templateId, name: 'Section 2' }));

    const exercise1 = await exerciseRepository.create(mockExercise({ templateId: 'exercise-1' }));
    const exercise2 = await exerciseRepository.create(mockExercise({ templateId: 'exercise-2' }));
    testScheme1 = await schemeRepository.create(mockUserExerciseScheme({ userId: 'test-user', exerciseId: exercise1.templateId }));
    testScheme2 = await schemeRepository.create(mockUserExerciseScheme({ userId: 'test-user', exerciseId: exercise2.templateId }));
  });

  describe('create', () => {
    it('should create a section item with all fields', async () => {
      const itemData = mockWorkoutSectionItem({
        sectionId: testSection1.id!,
        orderIndex: 0,
        breakBetweenSets: 90,
        breakAfter: 180,
        createdBy: 'user-1',
      });

      const result = await repository.create(itemData);

      expect(result).toMatchObject({
        sectionId: testSection1.id!,
        orderIndex: 0,
        breakBetweenSets: 90,
        breakAfter: 180,
        createdBy: 'user-1',
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });

    it('should create multiple items in the same section', async () => {
      const item1 = await repository.create(
        mockWorkoutSectionItem({
          sectionId: testSection1.id!,
          orderIndex: 0,
        })
      );
      const item2 = await repository.create(
        mockWorkoutSectionItem({
          sectionId: testSection1.id!,
          orderIndex: 1,
        })
      );

      expect(item1.orderIndex).toBe(0);
      expect(item2.orderIndex).toBe(1);
      expect(item1.sectionId).toBe(item2.sectionId);
    });

    it('should create items with zero break times', async () => {
      const itemData = mockWorkoutSectionItem({
        sectionId: testSection1.id!,
        orderIndex: 0,
        breakBetweenSets: 0,
        breakAfter: 0,
      });

      const result = await repository.create(itemData);

      expect(result.breakBetweenSets).toBe(0);
      expect(result.breakAfter).toBe(0);
    });

    it('should fail when creating item with non-existent section', async () => {
      const itemData = mockWorkoutSectionItem({
        sectionId: 'nonexistent-section',
      });

      await expect(repository.create(itemData)).rejects.toThrow();
    });

  });

  describe('findAll', () => {
    it('should return empty array when no items exist', async () => {
      const results = await repository.findAll();
      expect(results).toEqual([]);
    });

    it('should return all items across all sections', async () => {
      await repository.create(mockWorkoutSectionItem({ sectionId: testSection1.id! }));
      await repository.create(mockWorkoutSectionItem({ sectionId: testSection2.id! }));

      const results = await repository.findAll();

      expect(results).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should find an item by id', async () => {
      const created = await repository.create(
        mockWorkoutSectionItem({
          sectionId: testSection1.id!,
          breakAfter: 120,
        })
      );

      const result = await repository.findById(created.id);

      expect(result).toMatchObject({
        id: created.id,
        breakAfter: 120,
      });
    });

    it('should return undefined when item does not exist', async () => {
      const result = await repository.findById('nonexistent-id');
      expect(result).toBeUndefined();
    });
  });

  describe('findBySectionId', () => {
    it('should find all items for a specific section', async () => {
      // Create items for section 1
      await repository.create(
        mockWorkoutSectionItem({
          sectionId: testSection1.id!,
          orderIndex: 0,
        })
      );
      await repository.create(
        mockWorkoutSectionItem({
          sectionId: testSection1.id!,
          orderIndex: 1,
        })
      );

      // Create item for section 2
      await repository.create(
        mockWorkoutSectionItem({
          sectionId: testSection2.id!,
          orderIndex: 0,
        })
      );

      const results = await repository.findBySectionId(testSection1.id!);

      expect(results).toHaveLength(2);
      expect(results.every((item) => item.sectionId === testSection1.id!)).toBe(true);
    });

    it('should return empty array when section has no items', async () => {
      const results = await repository.findBySectionId(testSection1.id!);
      expect(results).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update item orderIndex', async () => {
      const created = await repository.create(
        mockWorkoutSectionItem({
          sectionId: testSection1.id!,
          orderIndex: 0,
        })
      );

      const result = await repository.update(created.id, { orderIndex: 5 });

      expect(result?.orderIndex).toBe(5);
    });

    it('should update breakBetweenSets', async () => {
      const created = await repository.create(
        mockWorkoutSectionItem({
          sectionId: testSection1.id!,
          breakBetweenSets: 60,
        })
      );

      const result = await repository.update(created.id, { breakBetweenSets: 120 });

      expect(result?.breakBetweenSets).toBe(120);
    });

    it('should update breakAfter', async () => {
      const created = await repository.create(
        mockWorkoutSectionItem({
          sectionId: testSection1.id!,
          breakAfter: 180,
        })
      );

      const result = await repository.update(created.id, { breakAfter: 240 });

      expect(result?.breakAfter).toBe(240);
    });

  });

  describe('delete', () => {
    it('should delete an item', async () => {
      const created = await repository.create(
        mockWorkoutSectionItem({
          sectionId: testSection1.id!,
        })
      );

      const result = await repository.delete(created.id);

      expect(result).toMatchObject({ id: created.id });

      const found = await repository.findById(created.id);
      expect(found).toBeUndefined();
    });

    it('should handle deleting non-existent item', async () => {
      const result = await repository.delete('nonexistent-id');
      expect(result).toBeUndefined();
    });
  });

  describe('cascading deletes', () => {
    it('should delete items when parent section is deleted', async () => {
      const item1 = await repository.create(
        mockWorkoutSectionItem({
          sectionId: testSection1.id!,
        })
      );
      const item2 = await repository.create(
        mockWorkoutSectionItem({
          sectionId: testSection1.id!,
        })
      );

      await sectionRepository.delete(testSection1.id!);

      const found1 = await repository.findById(item1.id);
      const found2 = await repository.findById(item2.id);
      expect(found1).toBeUndefined();
      expect(found2).toBeUndefined();
    });

  });
});
