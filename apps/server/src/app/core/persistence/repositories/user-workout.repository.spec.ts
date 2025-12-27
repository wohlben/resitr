import { Test, TestingModule } from '@nestjs/testing';
import { UserWorkoutRepository } from './user-workout.repository';
import { CompendiumWorkoutRepository } from './compendium-workout.repository';
import { provideTestDatabase } from '../database';
import { mockWorkout, mockUserWorkout } from '../test-factories';
import type { CompendiumWorkout } from '../schemas/compendium-workout.schema';

describe('UserWorkoutRepository', () => {
  let repository: UserWorkoutRepository;
  let workoutRepository: CompendiumWorkoutRepository;
  let testWorkout1: CompendiumWorkout;
  let testWorkout2: CompendiumWorkout;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [provideTestDatabase(), UserWorkoutRepository, CompendiumWorkoutRepository],
    }).compile();

    repository = module.get<UserWorkoutRepository>(UserWorkoutRepository);
    workoutRepository = module.get<CompendiumWorkoutRepository>(CompendiumWorkoutRepository);

    // Create prerequisite test workouts
    testWorkout1 = await workoutRepository.create(mockWorkout({ templateId: 'workout-1', name: 'Morning Workout' }));
    testWorkout2 = await workoutRepository.create(mockWorkout({ templateId: 'workout-2', name: 'Evening Workout' }));
  });

  describe('create', () => {
    it('should create a user workout with all fields', async () => {
      const userWorkoutData = mockUserWorkout({
        userId: 'user-1',
        workoutTemplateId: testWorkout1.templateId,
      });

      const result = await repository.create(userWorkoutData);

      expect(result).toMatchObject({
        userId: 'user-1',
        workoutTemplateId: testWorkout1.templateId,
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });

    it('should auto-generate id if not provided', async () => {
      const userWorkoutData = mockUserWorkout({
        userId: 'user-1',
        workoutTemplateId: testWorkout1.templateId,
      });

      const result = await repository.create(userWorkoutData);

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
    });

    it('should fail when workoutTemplateId references non-existent workout', async () => {
      const userWorkoutData = mockUserWorkout({
        userId: 'user-1',
        workoutTemplateId: 'non-existent-workout',
      });

      await expect(repository.create(userWorkoutData)).rejects.toThrow();
    });

    it('should allow different users to add the same workout', async () => {
      const userWorkout1 = await repository.create(mockUserWorkout({
        userId: 'user-1',
        workoutTemplateId: testWorkout1.templateId,
      }));
      const userWorkout2 = await repository.create(mockUserWorkout({
        userId: 'user-2',
        workoutTemplateId: testWorkout1.templateId,
      }));

      expect(userWorkout1.userId).toBe('user-1');
      expect(userWorkout2.userId).toBe('user-2');
      expect(userWorkout1.id).not.toBe(userWorkout2.id);
    });

    it('should allow same user to add different workouts', async () => {
      const userWorkout1 = await repository.create(mockUserWorkout({
        userId: 'user-1',
        workoutTemplateId: testWorkout1.templateId,
      }));
      const userWorkout2 = await repository.create(mockUserWorkout({
        userId: 'user-1',
        workoutTemplateId: testWorkout2.templateId,
      }));

      expect(userWorkout1.workoutTemplateId).toBe(testWorkout1.templateId);
      expect(userWorkout2.workoutTemplateId).toBe(testWorkout2.templateId);
    });

    it('should fail when same user adds same workout twice (unique constraint)', async () => {
      await repository.create(mockUserWorkout({
        userId: 'user-1',
        workoutTemplateId: testWorkout1.templateId,
      }));

      await expect(repository.create(mockUserWorkout({
        userId: 'user-1',
        workoutTemplateId: testWorkout1.templateId,
      }))).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all user workouts across all users', async () => {
      await repository.create(mockUserWorkout({ userId: 'user-1', workoutTemplateId: testWorkout1.templateId }));
      await repository.create(mockUserWorkout({ userId: 'user-2', workoutTemplateId: testWorkout1.templateId }));
      await repository.create(mockUserWorkout({ userId: 'user-1', workoutTemplateId: testWorkout2.templateId }));

      const results = await repository.findAll();

      expect(results).toHaveLength(3);
    });

    it('should return empty array when no user workouts exist', async () => {
      const results = await repository.findAll();

      expect(results).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find a user workout by id', async () => {
      const created = await repository.create(mockUserWorkout({
        userId: 'user-1',
        workoutTemplateId: testWorkout1.templateId,
      }));

      const result = await repository.findById(created.id);

      expect(result).toMatchObject({
        id: created.id,
        userId: 'user-1',
        workoutTemplateId: testWorkout1.templateId,
      });
    });

    it('should return undefined when user workout does not exist', async () => {
      const result = await repository.findById('non-existent-id');

      expect(result).toBeUndefined();
    });
  });

  describe('findByUserId', () => {
    it('should find all user workouts for a specific user', async () => {
      await repository.create(mockUserWorkout({ userId: 'user-1', workoutTemplateId: testWorkout1.templateId }));
      await repository.create(mockUserWorkout({ userId: 'user-1', workoutTemplateId: testWorkout2.templateId }));
      await repository.create(mockUserWorkout({ userId: 'user-2', workoutTemplateId: testWorkout1.templateId }));

      const results = await repository.findByUserId('user-1');

      expect(results).toHaveLength(2);
      expect(results.every((w) => w.userId === 'user-1')).toBe(true);
    });

    it('should return empty array when user has no workouts', async () => {
      const results = await repository.findByUserId('user-1');

      expect(results).toEqual([]);
    });
  });

  describe('findByUserIdAndWorkoutTemplateId', () => {
    it('should find a user workout by userId and workoutTemplateId', async () => {
      const created = await repository.create(mockUserWorkout({
        userId: 'user-1',
        workoutTemplateId: testWorkout1.templateId,
      }));

      const result = await repository.findByUserIdAndWorkoutTemplateId('user-1', testWorkout1.templateId);

      expect(result).toMatchObject({
        id: created.id,
        userId: 'user-1',
        workoutTemplateId: testWorkout1.templateId,
      });
    });

    it('should return undefined when combination does not exist', async () => {
      await repository.create(mockUserWorkout({
        userId: 'user-1',
        workoutTemplateId: testWorkout1.templateId,
      }));

      const result = await repository.findByUserIdAndWorkoutTemplateId('user-1', testWorkout2.templateId);

      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete a user workout', async () => {
      const created = await repository.create(mockUserWorkout({
        userId: 'user-1',
        workoutTemplateId: testWorkout1.templateId,
      }));

      await repository.delete(created.id);

      const found = await repository.findById(created.id);
      expect(found).toBeUndefined();
    });

    it('should not throw when deleting non-existent user workout', async () => {
      await expect(repository.delete('non-existent-id')).resolves.not.toThrow();
    });
  });

  describe('deleteByUserId', () => {
    it('should delete all user workouts for a specific user', async () => {
      const userWorkout1 = await repository.create(mockUserWorkout({ userId: 'user-1', workoutTemplateId: testWorkout1.templateId }));
      const userWorkout2 = await repository.create(mockUserWorkout({ userId: 'user-1', workoutTemplateId: testWorkout2.templateId }));
      const userWorkout3 = await repository.create(mockUserWorkout({ userId: 'user-2', workoutTemplateId: testWorkout1.templateId }));

      await repository.deleteByUserId('user-1');

      const found1 = await repository.findById(userWorkout1.id);
      const found2 = await repository.findById(userWorkout2.id);
      const found3 = await repository.findById(userWorkout3.id);

      expect(found1).toBeUndefined();
      expect(found2).toBeUndefined();
      expect(found3).toBeDefined();
    });
  });

  describe('foreign key constraint (restrict)', () => {
    it('should prevent deleting workout when user workouts reference it', async () => {
      await repository.create(mockUserWorkout({
        userId: 'user-1',
        workoutTemplateId: testWorkout1.templateId,
      }));

      // Attempt to delete the parent workout should fail due to restrict constraint
      await expect(workoutRepository.delete(testWorkout1.templateId)).rejects.toThrow();

      // The user workout should still exist
      const results = await repository.findByUserId('user-1');
      expect(results).toHaveLength(1);
    });

    it('should allow deleting workout when no user workouts reference it', async () => {
      // Create user workout for workout 1 only
      await repository.create(mockUserWorkout({
        userId: 'user-1',
        workoutTemplateId: testWorkout1.templateId,
      }));

      // Deleting workout 2 should succeed since nothing references it
      await expect(workoutRepository.delete(testWorkout2.templateId)).resolves.not.toThrow();
    });
  });
});
