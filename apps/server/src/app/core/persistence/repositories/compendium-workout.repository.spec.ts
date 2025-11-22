import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumWorkoutRepository } from './compendium-workout.repository';
import { provideTestDatabase } from '../database';
import { mockWorkout } from '../test-factories';

describe('CompendiumWorkoutRepository', () => {
  let repository: CompendiumWorkoutRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [provideTestDatabase(), CompendiumWorkoutRepository],
    }).compile();

    repository = module.get<CompendiumWorkoutRepository>(CompendiumWorkoutRepository);
  });

  describe('create', () => {
    it('should create a workout with all fields', async () => {
      const workoutData = mockWorkout({
        templateId: 'workout-1',
        name: 'Full Body Workout',
        description: 'A comprehensive full body workout',
        version: 1,
        createdBy: 'user-1',
      });

      const result = await repository.create(workoutData);

      expect(result).toMatchObject({
        templateId: 'workout-1',
        name: 'Full Body Workout',
        description: 'A comprehensive full body workout',
        version: 1,
        createdBy: 'user-1',
      });
      expect(result.createdAt).toBeDefined();
    });

    it('should create a workout with minimal fields (null description)', async () => {
      const workoutData = mockWorkout({
        templateId: 'workout-2',
        name: 'Quick Workout',
        description: null,
        version: 1,
        createdBy: 'user-1',
      });

      const result = await repository.create(workoutData);

      expect(result).toMatchObject({
        templateId: 'workout-2',
        name: 'Quick Workout',
        version: 1,
      });
      expect(result.description).toBeNull();
    });

    it('should fail when creating workout with duplicate templateId', async () => {
      const workoutData = mockWorkout({ templateId: 'workout-dup' });
      await repository.create(workoutData);

      await expect(repository.create(workoutData)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return empty array when no workouts exist', async () => {
      const results = await repository.findAll();
      expect(results).toEqual([]);
    });

    it('should return all workouts', async () => {
      await repository.create(mockWorkout({ templateId: 'workout-1', name: 'Workout A' }));
      await repository.create(mockWorkout({ templateId: 'workout-2', name: 'Workout B' }));

      const results = await repository.findAll();

      expect(results).toHaveLength(2);
      expect(results.map((w) => w.name)).toEqual(expect.arrayContaining(['Workout A', 'Workout B']));
    });
  });

  describe('findById', () => {
    it('should find a workout by templateId', async () => {
      const created = await repository.create(mockWorkout({ templateId: 'workout-1', name: 'Test Workout' }));

      const result = await repository.findById('workout-1');

      expect(result).toMatchObject({
        templateId: 'workout-1',
        name: 'Test Workout',
      });
    });

    it('should return undefined when workout does not exist', async () => {
      const result = await repository.findById('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update a workout name', async () => {
      await repository.create(mockWorkout({ templateId: 'workout-1', name: 'Old Name' }));

      const result = await repository.update('workout-1', { name: 'New Name' });

      expect(result).toMatchObject({
        templateId: 'workout-1',
        name: 'New Name',
      });
    });

    it('should update a workout description', async () => {
      await repository.create(mockWorkout({ templateId: 'workout-1', description: 'Old description' }));

      const result = await repository.update('workout-1', { description: 'New description' });

      expect(result?.description).toBe('New description');
    });

    it('should update version number', async () => {
      await repository.create(mockWorkout({ templateId: 'workout-1', version: 1 }));

      const result = await repository.update('workout-1', { version: 2 });

      expect(result?.version).toBe(2);
    });

    it('should allow clearing description by setting to null', async () => {
      await repository.create(mockWorkout({ templateId: 'workout-1', description: 'Has description' }));

      const result = await repository.update('workout-1', { description: null });

      expect(result?.description).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a workout', async () => {
      await repository.create(mockWorkout({ templateId: 'workout-1' }));

      const result = await repository.delete('workout-1');

      expect(result).toMatchObject({ templateId: 'workout-1' });

      const found = await repository.findById('workout-1');
      expect(found).toBeUndefined();
    });

    it('should handle deleting non-existent workout', async () => {
      const result = await repository.delete('nonexistent');
      expect(result).toBeUndefined();
    });
  });
});
