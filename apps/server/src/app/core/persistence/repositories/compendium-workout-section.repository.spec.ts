import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumWorkoutSectionRepository } from './compendium-workout-section.repository';
import { CompendiumWorkoutRepository } from './compendium-workout.repository';
import { provideTestDatabase } from '../database';
import { mockWorkout, mockWorkoutSection } from '../test-factories';
import type { CompendiumWorkout } from '../schemas/compendium-workout.schema';
import { WorkoutSectionType } from '../schemas/compendium-workout-section.schema';

describe('CompendiumWorkoutSectionRepository', () => {
  let repository: CompendiumWorkoutSectionRepository;
  let workoutRepository: CompendiumWorkoutRepository;
  let testWorkout1: CompendiumWorkout;
  let testWorkout2: CompendiumWorkout;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [provideTestDatabase(), CompendiumWorkoutSectionRepository, CompendiumWorkoutRepository],
    }).compile();

    repository = module.get<CompendiumWorkoutSectionRepository>(CompendiumWorkoutSectionRepository);
    workoutRepository = module.get<CompendiumWorkoutRepository>(CompendiumWorkoutRepository);

    // Create prerequisite test workouts
    testWorkout1 = await workoutRepository.create(mockWorkout({ templateId: 'workout-1', name: 'Workout A' }));
    testWorkout2 = await workoutRepository.create(mockWorkout({ templateId: 'workout-2', name: 'Workout B' }));
  });

  describe('create', () => {
    it('should create a section with all fields', async () => {
      const sectionData = mockWorkoutSection({
        workoutTemplateId: testWorkout1.templateId,
        type: WorkoutSectionType.WARMUP,
        name: 'Warm-up Phase',
        orderIndex: 0,
        createdBy: 'user-1',
      });

      const result = await repository.create(sectionData);

      expect(result).toMatchObject({
        workoutTemplateId: testWorkout1.templateId,
        type: WorkoutSectionType.WARMUP,
        name: 'Warm-up Phase',
        orderIndex: 0,
        createdBy: 'user-1',
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });

    it('should create sections with different types', async () => {
      const warmup = await repository.create(
        mockWorkoutSection({
          workoutTemplateId: testWorkout1.templateId,
          type: WorkoutSectionType.WARMUP,
          name: 'Warmup',
          orderIndex: 0,
        })
      );
      const strength = await repository.create(
        mockWorkoutSection({
          workoutTemplateId: testWorkout1.templateId,
          type: WorkoutSectionType.STRENGTH,
          name: 'Strength Training',
          orderIndex: 1,
        })
      );
      const cooldown = await repository.create(
        mockWorkoutSection({
          workoutTemplateId: testWorkout1.templateId,
          type: WorkoutSectionType.COOLDOWN,
          name: 'Cooldown',
          orderIndex: 2,
        })
      );

      expect(warmup.type).toBe(WorkoutSectionType.WARMUP);
      expect(strength.type).toBe(WorkoutSectionType.STRENGTH);
      expect(cooldown.type).toBe(WorkoutSectionType.COOLDOWN);
    });

    it('should fail when creating section with non-existent workout', async () => {
      const sectionData = mockWorkoutSection({ workoutTemplateId: 'nonexistent-workout' });

      await expect(repository.create(sectionData)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return empty array when no sections exist', async () => {
      const results = await repository.findAll();
      expect(results).toEqual([]);
    });

    it('should return all sections across all workouts', async () => {
      await repository.create(mockWorkoutSection({ workoutTemplateId: testWorkout1.templateId, name: 'Section A' }));
      await repository.create(mockWorkoutSection({ workoutTemplateId: testWorkout2.templateId, name: 'Section B' }));

      const results = await repository.findAll();

      expect(results).toHaveLength(2);
      expect(results.map((s) => s.name)).toEqual(expect.arrayContaining(['Section A', 'Section B']));
    });
  });

  describe('findById', () => {
    it('should find a section by id', async () => {
      const created = await repository.create(
        mockWorkoutSection({ workoutTemplateId: testWorkout1.templateId, name: 'Test Section' })
      );

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

  describe('findByWorkoutTemplateId', () => {
    it('should find all sections for a specific workout', async () => {
      // Create sections for workout 1
      await repository.create(mockWorkoutSection({ workoutTemplateId: testWorkout1.templateId, name: 'W1 Section 1' }));
      await repository.create(mockWorkoutSection({ workoutTemplateId: testWorkout1.templateId, name: 'W1 Section 2' }));

      // Create section for workout 2
      await repository.create(mockWorkoutSection({ workoutTemplateId: testWorkout2.templateId, name: 'W2 Section 1' }));

      const results = await repository.findByWorkoutTemplateId(testWorkout1.templateId);

      expect(results).toHaveLength(2);
      expect(results.map((s) => s.name)).toEqual(expect.arrayContaining(['W1 Section 1', 'W1 Section 2']));
    });

    it('should return empty array when workout has no sections', async () => {
      const results = await repository.findByWorkoutTemplateId(testWorkout1.templateId);
      expect(results).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a section name', async () => {
      const created = await repository.create(
        mockWorkoutSection({ workoutTemplateId: testWorkout1.templateId, name: 'Old Name' })
      );

      const result = await repository.update(created.id, { name: 'New Name' });

      expect(result).toMatchObject({
        id: created.id,
        name: 'New Name',
      });
    });

    it('should update section type', async () => {
      const created = await repository.create(
        mockWorkoutSection({ workoutTemplateId: testWorkout1.templateId, type: WorkoutSectionType.WARMUP })
      );

      const result = await repository.update(created.id, { type: WorkoutSectionType.STRENGTH });

      expect(result?.type).toBe(WorkoutSectionType.STRENGTH);
    });

    it('should update orderIndex', async () => {
      const created = await repository.create(
        mockWorkoutSection({ workoutTemplateId: testWorkout1.templateId, orderIndex: 0 })
      );

      const result = await repository.update(created.id, { orderIndex: 5 });

      expect(result?.orderIndex).toBe(5);
    });
  });

  describe('delete', () => {
    it('should delete a section', async () => {
      const created = await repository.create(mockWorkoutSection({ workoutTemplateId: testWorkout1.templateId }));

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

  describe('cascading deletes', () => {
    it('should delete sections when parent workout is deleted', async () => {
      const section1 = await repository.create(
        mockWorkoutSection({ workoutTemplateId: testWorkout1.templateId, name: 'Section 1' })
      );
      const section2 = await repository.create(
        mockWorkoutSection({ workoutTemplateId: testWorkout1.templateId, name: 'Section 2' })
      );

      await workoutRepository.delete(testWorkout1.templateId);

      const found1 = await repository.findById(section1.id);
      const found2 = await repository.findById(section2.id);
      expect(found1).toBeUndefined();
      expect(found2).toBeUndefined();
    });
  });
});
