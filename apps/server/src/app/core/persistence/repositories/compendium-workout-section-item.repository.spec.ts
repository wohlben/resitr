import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumWorkoutSectionItemRepository } from './compendium-workout-section-item.repository';
import { CompendiumExerciseRepository } from './compendium-exercise.repository';
import { provideTestDatabase } from '../database';
import { mockWorkoutSectionItem, mockExercise } from '../test-factories';

describe('CompendiumWorkoutSectionItemRepository', () => {
  let repository: CompendiumWorkoutSectionItemRepository;
  let exerciseRepository: CompendiumExerciseRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [provideTestDatabase(), CompendiumWorkoutSectionItemRepository, CompendiumExerciseRepository],
    }).compile();

    repository = module.get<CompendiumWorkoutSectionItemRepository>(CompendiumWorkoutSectionItemRepository);
    exerciseRepository = module.get<CompendiumExerciseRepository>(CompendiumExerciseRepository);

    // Create prerequisite test data
    await exerciseRepository.create(mockExercise({ templateId: 'exercise-1' }));
    await exerciseRepository.create(mockExercise({ templateId: 'exercise-2' }));
  });

  describe('create', () => {
    it('should create a section item with all fields', async () => {
      const itemData = mockWorkoutSectionItem({
        exerciseId: 'exercise-1',
        breakBetweenSets: 90,
        breakAfter: 180,
        createdBy: 'user-1',
      });

      const result = await repository.create(itemData);

      expect(result).toMatchObject({
        exerciseId: 'exercise-1',
        breakBetweenSets: 90,
        breakAfter: 180,
        createdBy: 'user-1',
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });

    it('should create multiple items', async () => {
      const item1 = await repository.create(
        mockWorkoutSectionItem({
          exerciseId: 'exercise-1',
          breakBetweenSets: 60,
        })
      );
      const item2 = await repository.create(
        mockWorkoutSectionItem({
          exerciseId: 'exercise-2',
          breakBetweenSets: 90,
        })
      );

      expect(item1.breakBetweenSets).toBe(60);
      expect(item2.breakBetweenSets).toBe(90);
    });

    it('should create items with zero break times', async () => {
      const itemData = mockWorkoutSectionItem({
        exerciseId: 'exercise-1',
        breakBetweenSets: 0,
        breakAfter: 0,
      });

      const result = await repository.create(itemData);

      expect(result.breakBetweenSets).toBe(0);
      expect(result.breakAfter).toBe(0);
    });

    it('should fail when creating item with non-existent exercise', async () => {
      const itemData = mockWorkoutSectionItem({
        exerciseId: 'nonexistent-exercise',
      });

      await expect(repository.create(itemData)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return empty array when no items exist', async () => {
      const results = await repository.findAll();
      expect(results).toEqual([]);
    });

    it('should return all items', async () => {
      await repository.create(mockWorkoutSectionItem({ exerciseId: 'exercise-1' }));
      await repository.create(mockWorkoutSectionItem({ exerciseId: 'exercise-2' }));

      const results = await repository.findAll();

      expect(results).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should find an item by id', async () => {
      const created = await repository.create(
        mockWorkoutSectionItem({
          exerciseId: 'exercise-1',
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

  describe('findByIds', () => {
    it('should find multiple items by ids', async () => {
      const item1 = await repository.create(mockWorkoutSectionItem({ exerciseId: 'exercise-1' }));
      const item2 = await repository.create(mockWorkoutSectionItem({ exerciseId: 'exercise-2' }));
      await repository.create(mockWorkoutSectionItem({ exerciseId: 'exercise-1' }));

      const results = await repository.findByIds([item1.id, item2.id]);

      expect(results).toHaveLength(2);
    });

    it('should return empty array when ids array is empty', async () => {
      const results = await repository.findByIds([]);
      expect(results).toEqual([]);
    });

    it('should return empty array when no items match', async () => {
      const results = await repository.findByIds(['nonexistent-1', 'nonexistent-2']);
      expect(results).toEqual([]);
    });

    it('should return only found items when some ids do not exist', async () => {
      const item1 = await repository.create(mockWorkoutSectionItem({ exerciseId: 'exercise-1' }));

      const results = await repository.findByIds([item1.id, 'nonexistent-id']);

      expect(results).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update breakBetweenSets', async () => {
      const created = await repository.create(
        mockWorkoutSectionItem({
          exerciseId: 'exercise-1',
          breakBetweenSets: 60,
        })
      );

      const result = await repository.update(created.id, { breakBetweenSets: 120 });

      expect(result?.breakBetweenSets).toBe(120);
    });

    it('should update breakAfter', async () => {
      const created = await repository.create(
        mockWorkoutSectionItem({
          exerciseId: 'exercise-1',
          breakAfter: 180,
        })
      );

      const result = await repository.update(created.id, { breakAfter: 240 });

      expect(result?.breakAfter).toBe(240);
    });
  });

  describe('delete', () => {
    it('should delete an item', async () => {
      const created = await repository.create(mockWorkoutSectionItem({ exerciseId: 'exercise-1' }));

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
});
