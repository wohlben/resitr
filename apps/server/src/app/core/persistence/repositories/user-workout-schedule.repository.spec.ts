import { Test, TestingModule } from '@nestjs/testing';
import { UserWorkoutScheduleRepository } from './user-workout-schedule.repository';
import { CompendiumWorkoutRepository } from './compendium-workout.repository';
import { provideTestDatabase } from '../database';
import { mockWorkout, mockUserWorkoutSchedule } from '../test-factories';
import type { CompendiumWorkout } from '../schemas/compendium-workout.schema';

describe('UserWorkoutScheduleRepository', () => {
  let repository: UserWorkoutScheduleRepository;
  let workoutRepository: CompendiumWorkoutRepository;
  let testWorkout1: CompendiumWorkout;
  let testWorkout2: CompendiumWorkout;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [provideTestDatabase(), UserWorkoutScheduleRepository, CompendiumWorkoutRepository],
    }).compile();

    repository = module.get<UserWorkoutScheduleRepository>(UserWorkoutScheduleRepository);
    workoutRepository = module.get<CompendiumWorkoutRepository>(CompendiumWorkoutRepository);

    // Create prerequisite test workouts
    testWorkout1 = await workoutRepository.create(mockWorkout({ templateId: 'workout-1', name: 'Morning Workout' }));
    testWorkout2 = await workoutRepository.create(mockWorkout({ templateId: 'workout-2', name: 'Evening Workout' }));
  });

  describe('create', () => {
    it('should create a schedule with all fields', async () => {
      const scheduleData = mockUserWorkoutSchedule({
        userId: 'user-1',
        workoutTemplateId: testWorkout1.templateId,
        dayOfWeek: 1, // Monday
        order: 0,
      });

      const result = await repository.create(scheduleData);

      expect(result).toMatchObject({
        userId: 'user-1',
        workoutTemplateId: testWorkout1.templateId,
        dayOfWeek: 1,
        order: 0,
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });

    it('should auto-generate id if not provided', async () => {
      const scheduleData = mockUserWorkoutSchedule({
        userId: 'user-1',
        workoutTemplateId: testWorkout1.templateId,
        dayOfWeek: 1,
      });

      const result = await repository.create(scheduleData);

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
    });

    it('should fail when workoutTemplateId references non-existent workout', async () => {
      const scheduleData = mockUserWorkoutSchedule({
        userId: 'user-1',
        workoutTemplateId: 'non-existent-workout',
        dayOfWeek: 1,
      });

      await expect(repository.create(scheduleData)).rejects.toThrow();
    });

    it('should allow different users to schedule the same workout', async () => {
      const schedule1 = await repository.create(mockUserWorkoutSchedule({
        userId: 'user-1',
        workoutTemplateId: testWorkout1.templateId,
        dayOfWeek: 1,
      }));
      const schedule2 = await repository.create(mockUserWorkoutSchedule({
        userId: 'user-2',
        workoutTemplateId: testWorkout1.templateId,
        dayOfWeek: 1,
      }));

      expect(schedule1.userId).toBe('user-1');
      expect(schedule2.userId).toBe('user-2');
      expect(schedule1.id).not.toBe(schedule2.id);
    });

    it('should allow same user to schedule different workouts on same day', async () => {
      const schedule1 = await repository.create(mockUserWorkoutSchedule({
        userId: 'user-1',
        workoutTemplateId: testWorkout1.templateId,
        dayOfWeek: 1,
        order: 0,
      }));
      const schedule2 = await repository.create(mockUserWorkoutSchedule({
        userId: 'user-1',
        workoutTemplateId: testWorkout2.templateId,
        dayOfWeek: 1,
        order: 1,
      }));

      expect(schedule1.workoutTemplateId).toBe(testWorkout1.templateId);
      expect(schedule2.workoutTemplateId).toBe(testWorkout2.templateId);
      expect(schedule1.dayOfWeek).toBe(schedule2.dayOfWeek);
    });
  });

  describe('findAll', () => {
    it('should return all schedules across all users', async () => {
      await repository.create(mockUserWorkoutSchedule({ userId: 'user-1', workoutTemplateId: testWorkout1.templateId, dayOfWeek: 1 }));
      await repository.create(mockUserWorkoutSchedule({ userId: 'user-2', workoutTemplateId: testWorkout1.templateId, dayOfWeek: 2 }));
      await repository.create(mockUserWorkoutSchedule({ userId: 'user-1', workoutTemplateId: testWorkout2.templateId, dayOfWeek: 3 }));

      const results = await repository.findAll();

      expect(results).toHaveLength(3);
    });

    it('should return empty array when no schedules exist', async () => {
      const results = await repository.findAll();

      expect(results).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find a schedule by id', async () => {
      const created = await repository.create(mockUserWorkoutSchedule({
        userId: 'user-1',
        workoutTemplateId: testWorkout1.templateId,
        dayOfWeek: 1
      }));

      const result = await repository.findById(created.id);

      expect(result).toMatchObject({
        id: created.id,
        userId: 'user-1',
      });
    });

    it('should return undefined when schedule does not exist', async () => {
      const result = await repository.findById('non-existent-id');

      expect(result).toBeUndefined();
    });
  });

  describe('findByUserId', () => {
    it('should find all schedules for a specific user ordered by day and order', async () => {
      await repository.create(mockUserWorkoutSchedule({ userId: 'user-1', workoutTemplateId: testWorkout1.templateId, dayOfWeek: 3, order: 0 }));
      await repository.create(mockUserWorkoutSchedule({ userId: 'user-1', workoutTemplateId: testWorkout2.templateId, dayOfWeek: 1, order: 0 }));
      await repository.create(mockUserWorkoutSchedule({ userId: 'user-2', workoutTemplateId: testWorkout1.templateId, dayOfWeek: 1, order: 0 }));

      const results = await repository.findByUserId('user-1');

      expect(results).toHaveLength(2);
      expect(results.every((s) => s.userId === 'user-1')).toBe(true);
      // Should be ordered by dayOfWeek, then order
      expect(results[0].dayOfWeek).toBeLessThanOrEqual(results[1].dayOfWeek);
    });

    it('should return empty array when user has no schedules', async () => {
      const results = await repository.findByUserId('user-1');

      expect(results).toEqual([]);
    });
  });

  describe('findByUserIdAndDay', () => {
    it('should find all schedules for a specific user and day ordered by order', async () => {
      await repository.create(mockUserWorkoutSchedule({ userId: 'user-1', workoutTemplateId: testWorkout1.templateId, dayOfWeek: 1, order: 1 }));
      await repository.create(mockUserWorkoutSchedule({ userId: 'user-1', workoutTemplateId: testWorkout2.templateId, dayOfWeek: 1, order: 0 }));
      await repository.create(mockUserWorkoutSchedule({ userId: 'user-1', workoutTemplateId: testWorkout1.templateId, dayOfWeek: 2, order: 0 }));
      await repository.create(mockUserWorkoutSchedule({ userId: 'user-2', workoutTemplateId: testWorkout1.templateId, dayOfWeek: 1, order: 0 }));

      const results = await repository.findByUserIdAndDay('user-1', 1);

      expect(results).toHaveLength(2);
      expect(results.every((s) => s.userId === 'user-1' && s.dayOfWeek === 1)).toBe(true);
      // Should be ordered by order
      expect(results[0].order).toBeLessThanOrEqual(results[1].order);
    });

    it('should return empty array when no schedules exist for user and day', async () => {
      const results = await repository.findByUserIdAndDay('user-1', 1);

      expect(results).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update schedule fields', async () => {
      const created = await repository.create(mockUserWorkoutSchedule({
        userId: 'user-1',
        workoutTemplateId: testWorkout1.templateId,
        dayOfWeek: 1,
        order: 0,
      }));

      const updated = await repository.update(created.id, {
        dayOfWeek: 3,
        order: 1,
      });

      expect(updated).toMatchObject({
        id: created.id,
        dayOfWeek: 3,
        order: 1,
      });
      expect(updated?.updatedAt).toBeDefined();
    });

    it('should return undefined when updating non-existent schedule', async () => {
      const result = await repository.update('non-existent-id', { dayOfWeek: 2 });

      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete a schedule', async () => {
      const created = await repository.create(mockUserWorkoutSchedule({
        userId: 'user-1',
        workoutTemplateId: testWorkout1.templateId,
        dayOfWeek: 1
      }));

      await repository.delete(created.id);

      const found = await repository.findById(created.id);
      expect(found).toBeUndefined();
    });

    it('should not throw when deleting non-existent schedule', async () => {
      await expect(repository.delete('non-existent-id')).resolves.not.toThrow();
    });
  });

  describe('deleteByUserId', () => {
    it('should delete all schedules for a specific user', async () => {
      const schedule1 = await repository.create(mockUserWorkoutSchedule({ userId: 'user-1', workoutTemplateId: testWorkout1.templateId, dayOfWeek: 1 }));
      const schedule2 = await repository.create(mockUserWorkoutSchedule({ userId: 'user-1', workoutTemplateId: testWorkout2.templateId, dayOfWeek: 2 }));
      const schedule3 = await repository.create(mockUserWorkoutSchedule({ userId: 'user-2', workoutTemplateId: testWorkout1.templateId, dayOfWeek: 1 }));

      await repository.deleteByUserId('user-1');

      const found1 = await repository.findById(schedule1.id);
      const found2 = await repository.findById(schedule2.id);
      const found3 = await repository.findById(schedule3.id);

      expect(found1).toBeUndefined();
      expect(found2).toBeUndefined();
      expect(found3).toBeDefined();
    });
  });

  describe('deleteByUserIdAndWorkoutId', () => {
    it('should delete all schedules for a specific user and workout', async () => {
      const schedule1 = await repository.create(mockUserWorkoutSchedule({ userId: 'user-1', workoutTemplateId: testWorkout1.templateId, dayOfWeek: 1 }));
      const schedule2 = await repository.create(mockUserWorkoutSchedule({ userId: 'user-1', workoutTemplateId: testWorkout2.templateId, dayOfWeek: 2 }));
      const schedule3 = await repository.create(mockUserWorkoutSchedule({ userId: 'user-2', workoutTemplateId: testWorkout1.templateId, dayOfWeek: 1 }));

      await repository.deleteByUserIdAndWorkoutId('user-1', testWorkout1.templateId);

      const found1 = await repository.findById(schedule1.id);
      const found2 = await repository.findById(schedule2.id);
      const found3 = await repository.findById(schedule3.id);

      expect(found1).toBeUndefined();
      expect(found2).toBeDefined();
      expect(found3).toBeDefined();
    });
  });

  describe('cascading deletes', () => {
    it('should delete schedules when parent workout is deleted', async () => {
      const schedule1 = await repository.create(mockUserWorkoutSchedule({ userId: 'user-1', workoutTemplateId: testWorkout1.templateId, dayOfWeek: 1 }));
      const schedule2 = await repository.create(mockUserWorkoutSchedule({ userId: 'user-2', workoutTemplateId: testWorkout1.templateId, dayOfWeek: 2 }));
      const schedule3 = await repository.create(mockUserWorkoutSchedule({ userId: 'user-1', workoutTemplateId: testWorkout2.templateId, dayOfWeek: 1 }));

      // Delete the parent workout
      await workoutRepository.delete(testWorkout1.templateId);

      // Schedules for workout 1 should be deleted
      const found1 = await repository.findById(schedule1.id);
      const found2 = await repository.findById(schedule2.id);
      expect(found1).toBeUndefined();
      expect(found2).toBeUndefined();

      // Schedule for workout 2 should still exist
      const found3 = await repository.findById(schedule3.id);
      expect(found3).toBeDefined();
    });
  });
});
