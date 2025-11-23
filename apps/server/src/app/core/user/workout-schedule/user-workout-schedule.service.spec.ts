import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserWorkoutScheduleService } from './user-workout-schedule.service';
import { UserWorkoutScheduleRepository } from '../../persistence/repositories/user-workout-schedule.repository';
import type { UserWorkoutSchedule } from '../../persistence/schemas/user-workout-schedule.schema';

describe('UserWorkoutScheduleService', () => {
  let service: UserWorkoutScheduleService;
  let repository: UserWorkoutScheduleRepository;

  const mockSchedule: UserWorkoutSchedule = {
    id: 'schedule-1',
    userId: 'user-1',
    workoutTemplateId: 'workout-1',
    dayOfWeek: 1,
    order: 0,
    createdAt: new Date(),
    updatedAt: null,
  };

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findByUserIdAndDay: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteByUserId: jest.fn(),
    deleteByUserIdAndWorkoutId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserWorkoutScheduleService,
        { provide: UserWorkoutScheduleRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UserWorkoutScheduleService>(UserWorkoutScheduleService);
    repository = module.get<UserWorkoutScheduleRepository>(UserWorkoutScheduleRepository);
  });

  describe('createSchedule', () => {
    it('should create a schedule when workout is not already scheduled', async () => {
      mockRepository.findByUserId.mockResolvedValue([]);
      mockRepository.create.mockResolvedValue(mockSchedule);

      const result = await service.createSchedule('user-1', 'workout-1', 1, 0);

      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-1');
      expect(mockRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        workoutTemplateId: 'workout-1',
        dayOfWeek: 1,
        order: 0,
      });
      expect(result).toEqual(mockSchedule);
    });

    it('should throw ConflictException when workout is already scheduled', async () => {
      mockRepository.findByUserId.mockResolvedValue([mockSchedule]);

      await expect(service.createSchedule('user-1', 'workout-1', 2, 0)).rejects.toThrow(ConflictException);
      await expect(service.createSchedule('user-1', 'workout-1', 2, 0)).rejects.toThrow(
        'This workout is already scheduled. Delete the existing schedule first to reschedule.'
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should allow scheduling different workouts for same user', async () => {
      mockRepository.findByUserId.mockResolvedValue([mockSchedule]);
      const newSchedule = { ...mockSchedule, id: 'schedule-2', workoutTemplateId: 'workout-2' };
      mockRepository.create.mockResolvedValue(newSchedule);

      const result = await service.createSchedule('user-1', 'workout-2', 2, 0);

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        workoutTemplateId: 'workout-2',
        dayOfWeek: 2,
        order: 0,
      });
      expect(result).toEqual(newSchedule);
    });
  });

  describe('getUserSchedules', () => {
    it('should return all schedules for a user', async () => {
      const schedules = [mockSchedule, { ...mockSchedule, id: 'schedule-2', dayOfWeek: 2 }];
      mockRepository.findByUserId.mockResolvedValue(schedules);

      const result = await service.getUserSchedules('user-1');

      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(schedules);
    });

    it('should return empty array when user has no schedules', async () => {
      mockRepository.findByUserId.mockResolvedValue([]);

      const result = await service.getUserSchedules('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getUserSchedulesByDay', () => {
    it('should return all schedules for a user and day', async () => {
      const schedules = [mockSchedule, { ...mockSchedule, id: 'schedule-2', order: 1 }];
      mockRepository.findByUserIdAndDay.mockResolvedValue(schedules);

      const result = await service.getUserSchedulesByDay('user-1', 1);

      expect(mockRepository.findByUserIdAndDay).toHaveBeenCalledWith('user-1', 1);
      expect(result).toEqual(schedules);
    });

    it('should return empty array when no schedules exist', async () => {
      mockRepository.findByUserIdAndDay.mockResolvedValue([]);

      const result = await service.getUserSchedulesByDay('user-1', 1);

      expect(result).toEqual([]);
    });
  });

  describe('getScheduleById', () => {
    it('should return a schedule when user owns it', async () => {
      mockRepository.findById.mockResolvedValue(mockSchedule);

      const result = await service.getScheduleById('user-1', 'schedule-1');

      expect(mockRepository.findById).toHaveBeenCalledWith('schedule-1');
      expect(result).toEqual(mockSchedule);
    });

    it('should throw NotFoundException when schedule does not exist', async () => {
      mockRepository.findById.mockResolvedValue(undefined);

      await expect(service.getScheduleById('user-1', 'schedule-1')).rejects.toThrow(NotFoundException);
      await expect(service.getScheduleById('user-1', 'schedule-1')).rejects.toThrow('Schedule not found');
    });

    it('should throw NotFoundException when user does not own the schedule', async () => {
      mockRepository.findById.mockResolvedValue(mockSchedule);

      await expect(service.getScheduleById('user-2', 'schedule-1')).rejects.toThrow(NotFoundException);
      await expect(service.getScheduleById('user-2', 'schedule-1')).rejects.toThrow('Schedule not found');
    });
  });

  describe('updateSchedule', () => {
    it('should update a schedule when user owns it', async () => {
      const updatedSchedule = { ...mockSchedule, dayOfWeek: 3, order: 1 };
      mockRepository.findById.mockResolvedValue(mockSchedule);
      mockRepository.update.mockResolvedValue(updatedSchedule);

      const result = await service.updateSchedule('user-1', 'schedule-1', 3, 1);

      expect(mockRepository.update).toHaveBeenCalledWith('schedule-1', { dayOfWeek: 3, order: 1 });
      expect(result).toEqual(updatedSchedule);
    });

    it('should handle partial updates (dayOfWeek only)', async () => {
      const updatedSchedule = { ...mockSchedule, dayOfWeek: 3 };
      mockRepository.findById.mockResolvedValue(mockSchedule);
      mockRepository.update.mockResolvedValue(updatedSchedule);

      const result = await service.updateSchedule('user-1', 'schedule-1', 3, undefined);

      expect(mockRepository.update).toHaveBeenCalledWith('schedule-1', { dayOfWeek: 3 });
      expect(result.dayOfWeek).toBe(3);
    });

    it('should handle partial updates (order only)', async () => {
      const updatedSchedule = { ...mockSchedule, order: 2 };
      mockRepository.findById.mockResolvedValue(mockSchedule);
      mockRepository.update.mockResolvedValue(updatedSchedule);

      const result = await service.updateSchedule('user-1', 'schedule-1', undefined, 2);

      expect(mockRepository.update).toHaveBeenCalledWith('schedule-1', { order: 2 });
      expect(result.order).toBe(2);
    });

    it('should throw NotFoundException when schedule does not exist', async () => {
      mockRepository.findById.mockResolvedValue(undefined);

      await expect(service.updateSchedule('user-1', 'schedule-1', 3, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user does not own the schedule', async () => {
      mockRepository.findById.mockResolvedValue(mockSchedule);

      await expect(service.updateSchedule('user-2', 'schedule-1', 3, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when update fails', async () => {
      mockRepository.findById.mockResolvedValue(mockSchedule);
      mockRepository.update.mockResolvedValue(undefined);

      await expect(service.updateSchedule('user-1', 'schedule-1', 3, 1)).rejects.toThrow(NotFoundException);
      await expect(service.updateSchedule('user-1', 'schedule-1', 3, 1)).rejects.toThrow('Failed to update schedule');
    });
  });

  describe('deleteSchedule', () => {
    it('should delete a schedule when user owns it', async () => {
      mockRepository.findById.mockResolvedValue(mockSchedule);
      mockRepository.delete.mockResolvedValue(undefined);

      await service.deleteSchedule('user-1', 'schedule-1');

      expect(mockRepository.delete).toHaveBeenCalledWith('schedule-1');
    });

    it('should throw NotFoundException when schedule does not exist', async () => {
      mockRepository.findById.mockResolvedValue(undefined);

      await expect(service.deleteSchedule('user-1', 'schedule-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user does not own the schedule', async () => {
      mockRepository.findById.mockResolvedValue(mockSchedule);

      await expect(service.deleteSchedule('user-2', 'schedule-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUserSchedulesByWorkout', () => {
    it('should delete all schedules for a user and workout', async () => {
      mockRepository.deleteByUserIdAndWorkoutId.mockResolvedValue(undefined);

      await service.deleteUserSchedulesByWorkout('user-1', 'workout-1');

      expect(mockRepository.deleteByUserIdAndWorkoutId).toHaveBeenCalledWith('user-1', 'workout-1');
    });
  });

  describe('deleteAllUserSchedules', () => {
    it('should delete all schedules for a user', async () => {
      mockRepository.deleteByUserId.mockResolvedValue(undefined);

      await service.deleteAllUserSchedules('user-1');

      expect(mockRepository.deleteByUserId).toHaveBeenCalledWith('user-1');
    });
  });
});
