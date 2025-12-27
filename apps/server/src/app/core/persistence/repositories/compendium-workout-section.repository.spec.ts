import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumWorkoutSectionRepository } from './compendium-workout-section.repository';
import { provideTestDatabase } from '../database';
import { mockWorkoutSection } from '../test-factories';
import { WorkoutSectionType } from '../schemas/compendium-workout-section.schema';

describe('CompendiumWorkoutSectionRepository', () => {
  let repository: CompendiumWorkoutSectionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [provideTestDatabase(), CompendiumWorkoutSectionRepository],
    }).compile();

    repository = module.get<CompendiumWorkoutSectionRepository>(CompendiumWorkoutSectionRepository);
  });

  describe('create', () => {
    it('should create a section with all fields', async () => {
      const sectionData = mockWorkoutSection({
        type: WorkoutSectionType.WARMUP,
        name: 'Warm-up Phase',
        workoutSectionItemIds: ['item-1', 'item-2'],
        createdBy: 'user-1',
      });

      const result = await repository.create(sectionData);

      expect(result).toMatchObject({
        type: WorkoutSectionType.WARMUP,
        name: 'Warm-up Phase',
        workoutSectionItemIds: ['item-1', 'item-2'],
        createdBy: 'user-1',
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });

    it('should create sections with different types', async () => {
      const warmup = await repository.create(
        mockWorkoutSection({
          type: WorkoutSectionType.WARMUP,
          name: 'Warmup',
        })
      );
      const strength = await repository.create(
        mockWorkoutSection({
          type: WorkoutSectionType.STRENGTH,
          name: 'Strength Training',
        })
      );
      const cooldown = await repository.create(
        mockWorkoutSection({
          type: WorkoutSectionType.COOLDOWN,
          name: 'Cooldown',
        })
      );

      expect(warmup.type).toBe(WorkoutSectionType.WARMUP);
      expect(strength.type).toBe(WorkoutSectionType.STRENGTH);
      expect(cooldown.type).toBe(WorkoutSectionType.COOLDOWN);
    });

    it('should create section with empty item IDs array', async () => {
      const sectionData = mockWorkoutSection({
        workoutSectionItemIds: [],
      });

      const result = await repository.create(sectionData);

      expect(result.workoutSectionItemIds).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no sections exist', async () => {
      const results = await repository.findAll();
      expect(results).toEqual([]);
    });

    it('should return all sections', async () => {
      await repository.create(mockWorkoutSection({ name: 'Section A' }));
      await repository.create(mockWorkoutSection({ name: 'Section B' }));

      const results = await repository.findAll();

      expect(results).toHaveLength(2);
      expect(results.map((s) => s.name)).toEqual(expect.arrayContaining(['Section A', 'Section B']));
    });
  });

  describe('findById', () => {
    it('should find a section by id', async () => {
      const created = await repository.create(mockWorkoutSection({ name: 'Test Section' }));

      const result = await repository.findById(created.id);

      expect(result).toMatchObject({
        id: created.id,
        name: 'Test Section',
      });
    });

    it('should return undefined when section does not exist', async () => {
      const result = await repository.findById('nonexistent-id');
      expect(result).toBeUndefined();
    });
  });

  describe('findByIds', () => {
    it('should find multiple sections by ids', async () => {
      const section1 = await repository.create(mockWorkoutSection({ name: 'Section 1' }));
      const section2 = await repository.create(mockWorkoutSection({ name: 'Section 2' }));
      await repository.create(mockWorkoutSection({ name: 'Section 3' }));

      const results = await repository.findByIds([section1.id, section2.id]);

      expect(results).toHaveLength(2);
      expect(results.map((s) => s.name)).toEqual(expect.arrayContaining(['Section 1', 'Section 2']));
    });

    it('should return empty array when ids array is empty', async () => {
      const results = await repository.findByIds([]);
      expect(results).toEqual([]);
    });

    it('should return empty array when no sections match', async () => {
      const results = await repository.findByIds(['nonexistent-1', 'nonexistent-2']);
      expect(results).toEqual([]);
    });

    it('should return only found sections when some ids do not exist', async () => {
      const section1 = await repository.create(mockWorkoutSection({ name: 'Section 1' }));

      const results = await repository.findByIds([section1.id, 'nonexistent-id']);

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Section 1');
    });
  });

  describe('update', () => {
    it('should update a section name', async () => {
      const created = await repository.create(mockWorkoutSection({ name: 'Old Name' }));

      const result = await repository.update(created.id, { name: 'New Name' });

      expect(result).toMatchObject({
        id: created.id,
        name: 'New Name',
      });
    });

    it('should update section type', async () => {
      const created = await repository.create(mockWorkoutSection({ type: WorkoutSectionType.WARMUP }));

      const result = await repository.update(created.id, { type: WorkoutSectionType.STRENGTH });

      expect(result?.type).toBe(WorkoutSectionType.STRENGTH);
    });

    it('should update workoutSectionItemIds', async () => {
      const created = await repository.create(mockWorkoutSection({ workoutSectionItemIds: ['item-1'] }));

      const result = await repository.update(created.id, { workoutSectionItemIds: ['item-1', 'item-2', 'item-3'] });

      expect(result?.workoutSectionItemIds).toEqual(['item-1', 'item-2', 'item-3']);
    });
  });

  describe('delete', () => {
    it('should delete a section', async () => {
      const created = await repository.create(mockWorkoutSection());

      const result = await repository.delete(created.id);

      expect(result).toMatchObject({ id: created.id });

      const found = await repository.findById(created.id);
      expect(found).toBeUndefined();
    });

    it('should handle deleting non-existent section', async () => {
      const result = await repository.delete('nonexistent-id');
      expect(result).toBeUndefined();
    });
  });
});
