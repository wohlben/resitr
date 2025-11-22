import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumWorkoutScheduleRepository } from './compendium-workout-schedule.repository';
import { CompendiumWorkoutRepository } from './compendium-workout.repository';
import { provideTestDatabase } from '../database';
import { mockWorkout, mockWorkoutSchedule } from '../test-factories';
import type { CompendiumWorkout } from '../schemas/compendium-workout.schema';

describe('CompendiumWorkoutScheduleRepository', () => {
  let repository: CompendiumWorkoutScheduleRepository;
  let workoutRepository: CompendiumWorkoutRepository;
  let testWorkout1: CompendiumWorkout;
  let testWorkout2: CompendiumWorkout;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [provideTestDatabase(), CompendiumWorkoutScheduleRepository, CompendiumWorkoutRepository],
    }).compile();

    repository = module.get<CompendiumWorkoutScheduleRepository>(CompendiumWorkoutScheduleRepository);
    workoutRepository = module.get<CompendiumWorkoutRepository>(CompendiumWorkoutRepository);

    // Create prerequisite test workouts
    testWorkout1 = await workoutRepository.create(mockWorkout({ templateId: 'workout-1', name: 'Workout A' }));
    testWorkout2 = await workoutRepository.create(mockWorkout({ templateId: 'workout-2', name: 'Workout B' }));
  });

  describe('create', () => {
    it('should create a schedule entry for Monday', async () => {
      const scheduleData = mockWorkoutSchedule({
        workoutTemplateId: testWorkout1.templateId,
        dayOfWeek: 1, // Monday
        createdBy: 'user-1',
      });

      const result = await repository.create(scheduleData);

      expect(result).toMatchObject({
        workoutTemplateId: testWorkout1.templateId,
        dayOfWeek: 1,
        createdBy: 'user-1',
      });
      expect(result.createdAt).toBeDefined();
    });

    it('should create schedule entries for multiple days', async () => {
      const monday = await repository.create(
        mockWorkoutSchedule({
          workoutTemplateId: testWorkout1.templateId,
          dayOfWeek: 1,
        })
      );
      const wednesday = await repository.create(
        mockWorkoutSchedule({
          workoutTemplateId: testWorkout1.templateId,
          dayOfWeek: 3,
        })
      );
      const friday = await repository.create(
        mockWorkoutSchedule({
          workoutTemplateId: testWorkout1.templateId,
          dayOfWeek: 5,
        })
      );

      expect(monday.dayOfWeek).toBe(1);
      expect(wednesday.dayOfWeek).toBe(3);
      expect(friday.dayOfWeek).toBe(5);
    });

    it('should create schedule for Sunday (day 0)', async () => {
      const scheduleData = mockWorkoutSchedule({
        workoutTemplateId: testWorkout1.templateId,
        dayOfWeek: 0,
      });

      const result = await repository.create(scheduleData);

      expect(result.dayOfWeek).toBe(0);
    });

    it('should create schedule for Saturday (day 6)', async () => {
      const scheduleData = mockWorkoutSchedule({
        workoutTemplateId: testWorkout1.templateId,
        dayOfWeek: 6,
      });

      const result = await repository.create(scheduleData);

      expect(result.dayOfWeek).toBe(6);
    });

    it('should fail when creating duplicate schedule (same workout and day)', async () => {
      const scheduleData = mockWorkoutSchedule({
        workoutTemplateId: testWorkout1.templateId,
        dayOfWeek: 1,
      });
      await repository.create(scheduleData);

      await expect(repository.create(scheduleData)).rejects.toThrow();
    });

    it('should allow same day for different workouts', async () => {
      const schedule1 = await repository.create(
        mockWorkoutSchedule({
          workoutTemplateId: testWorkout1.templateId,
          dayOfWeek: 1,
        })
      );
      const schedule2 = await repository.create(
        mockWorkoutSchedule({
          workoutTemplateId: testWorkout2.templateId,
          dayOfWeek: 1,
        })
      );

      expect(schedule1.workoutTemplateId).toBe(testWorkout1.templateId);
      expect(schedule2.workoutTemplateId).toBe(testWorkout2.templateId);
      expect(schedule1.dayOfWeek).toBe(schedule2.dayOfWeek);
    });

    it('should fail when creating schedule with non-existent workout', async () => {
      const scheduleData = mockWorkoutSchedule({
        workoutTemplateId: 'nonexistent-workout',
        dayOfWeek: 1,
      });

      await expect(repository.create(scheduleData)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return empty array when no schedules exist', async () => {
      const results = await repository.findAll();
      expect(results).toEqual([]);
    });

    it('should return all schedules across all workouts', async () => {
      await repository.create(mockWorkoutSchedule({ workoutTemplateId: testWorkout1.templateId, dayOfWeek: 1 }));
      await repository.create(mockWorkoutSchedule({ workoutTemplateId: testWorkout1.templateId, dayOfWeek: 3 }));
      await repository.create(mockWorkoutSchedule({ workoutTemplateId: testWorkout2.templateId, dayOfWeek: 2 }));

      const results = await repository.findAll();

      expect(results).toHaveLength(3);
    });
  });

  describe('findByWorkoutTemplateId', () => {
    it('should find all schedule entries for a specific workout', async () => {
      // Create schedules for workout 1 (Mon, Wed, Fri)
      await repository.create(mockWorkoutSchedule({ workoutTemplateId: testWorkout1.templateId, dayOfWeek: 1 }));
      await repository.create(mockWorkoutSchedule({ workoutTemplateId: testWorkout1.templateId, dayOfWeek: 3 }));
      await repository.create(mockWorkoutSchedule({ workoutTemplateId: testWorkout1.templateId, dayOfWeek: 5 }));

      // Create schedule for workout 2
      await repository.create(mockWorkoutSchedule({ workoutTemplateId: testWorkout2.templateId, dayOfWeek: 2 }));

      const results = await repository.findByWorkoutTemplateId(testWorkout1.templateId);

      expect(results).toHaveLength(3);
      expect(results.map((s) => s.dayOfWeek).sort()).toEqual([1, 3, 5]);
    });

    it('should return empty array when workout has no schedule', async () => {
      const results = await repository.findByWorkoutTemplateId(testWorkout1.templateId);
      expect(results).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete a specific schedule entry', async () => {
      await repository.create(mockWorkoutSchedule({ workoutTemplateId: testWorkout1.templateId, dayOfWeek: 1 }));

      const result = await repository.delete(testWorkout1.templateId, 1);

      expect(result).toMatchObject({
        workoutTemplateId: testWorkout1.templateId,
        dayOfWeek: 1,
      });

      const found = await repository.findByWorkoutTemplateId(testWorkout1.templateId);
      expect(found).toHaveLength(0);
    });

    it('should delete only the specified day, leaving others intact', async () => {
      await repository.create(mockWorkoutSchedule({ workoutTemplateId: testWorkout1.templateId, dayOfWeek: 1 }));
      await repository.create(mockWorkoutSchedule({ workoutTemplateId: testWorkout1.templateId, dayOfWeek: 3 }));
      await repository.create(mockWorkoutSchedule({ workoutTemplateId: testWorkout1.templateId, dayOfWeek: 5 }));

      await repository.delete(testWorkout1.templateId, 3);

      const remaining = await repository.findByWorkoutTemplateId(testWorkout1.templateId);
      expect(remaining).toHaveLength(2);
      expect(remaining.map((s) => s.dayOfWeek).sort()).toEqual([1, 5]);
    });

    it('should handle deleting non-existent schedule entry', async () => {
      const result = await repository.delete(testWorkout1.templateId, 1);
      expect(result).toBeUndefined();
    });
  });

  describe('deleteAllByWorkoutTemplateId', () => {
    it('should delete all schedule entries for a workout', async () => {
      await repository.create(mockWorkoutSchedule({ workoutTemplateId: testWorkout1.templateId, dayOfWeek: 1 }));
      await repository.create(mockWorkoutSchedule({ workoutTemplateId: testWorkout1.templateId, dayOfWeek: 3 }));
      await repository.create(mockWorkoutSchedule({ workoutTemplateId: testWorkout1.templateId, dayOfWeek: 5 }));

      const results = await repository.deleteAllByWorkoutTemplateId(testWorkout1.templateId);

      expect(results).toHaveLength(3);

      const remaining = await repository.findByWorkoutTemplateId(testWorkout1.templateId);
      expect(remaining).toHaveLength(0);
    });

    it('should not affect schedules of other workouts', async () => {
      await repository.create(mockWorkoutSchedule({ workoutTemplateId: testWorkout1.templateId, dayOfWeek: 1 }));
      await repository.create(mockWorkoutSchedule({ workoutTemplateId: testWorkout2.templateId, dayOfWeek: 2 }));

      await repository.deleteAllByWorkoutTemplateId(testWorkout1.templateId);

      const workout2Schedule = await repository.findByWorkoutTemplateId(testWorkout2.templateId);
      expect(workout2Schedule).toHaveLength(1);
    });

    it('should return empty array when deleting schedules for workout with no schedule', async () => {
      const results = await repository.deleteAllByWorkoutTemplateId(testWorkout1.templateId);
      expect(results).toEqual([]);
    });
  });

  describe('cascading deletes', () => {
    it('should delete schedule entries when parent workout is deleted', async () => {
      await repository.create(mockWorkoutSchedule({ workoutTemplateId: testWorkout1.templateId, dayOfWeek: 1 }));
      await repository.create(mockWorkoutSchedule({ workoutTemplateId: testWorkout1.templateId, dayOfWeek: 3 }));
      await repository.create(mockWorkoutSchedule({ workoutTemplateId: testWorkout1.templateId, dayOfWeek: 5 }));

      await workoutRepository.delete(testWorkout1.templateId);

      const found = await repository.findByWorkoutTemplateId(testWorkout1.templateId);
      expect(found).toHaveLength(0);
    });
  });
});
