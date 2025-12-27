import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UserWorkoutService } from './user-workout.service';
import { UserWorkoutRepository } from '../../persistence/repositories/user-workout.repository';
import type { UserWorkout } from '../../persistence/schemas/user-workout.schema';

describe('UserWorkoutService', () => {
  let service: UserWorkoutService;

  const mockUserWorkout: UserWorkout = {
    id: 'user-workout-1',
    userId: 'user-1',
    workoutTemplateId: 'workout-1',
    createdAt: new Date(),
    updatedAt: null,
  };

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findByUserIdAndWorkoutTemplateId: jest.fn(),
    delete: jest.fn(),
    deleteByUserId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserWorkoutService,
        { provide: UserWorkoutRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UserWorkoutService>(UserWorkoutService);
  });

  describe('createUserWorkout', () => {
    it('should create a user workout when it does not exist', async () => {
      mockRepository.findByUserIdAndWorkoutTemplateId.mockResolvedValue(undefined);
      mockRepository.create.mockResolvedValue(mockUserWorkout);

      const result = await service.createUserWorkout('user-1', 'workout-1');

      expect(mockRepository.findByUserIdAndWorkoutTemplateId).toHaveBeenCalledWith('user-1', 'workout-1');
      expect(mockRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        workoutTemplateId: 'workout-1',
      });
      expect(result).toEqual(mockUserWorkout);
    });

    it('should throw ConflictException when user workout already exists', async () => {
      mockRepository.findByUserIdAndWorkoutTemplateId.mockResolvedValue(mockUserWorkout);

      await expect(service.createUserWorkout('user-1', 'workout-1')).rejects.toThrow(ConflictException);
      await expect(service.createUserWorkout('user-1', 'workout-1')).rejects.toThrow('This workout is already added to your workouts.');

      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getUserWorkouts', () => {
    it('should return all workouts for a user', async () => {
      const workouts = [mockUserWorkout, { ...mockUserWorkout, id: 'user-workout-2', workoutTemplateId: 'workout-2' }];
      mockRepository.findByUserId.mockResolvedValue(workouts);

      const result = await service.getUserWorkouts('user-1');

      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(workouts);
    });

    it('should return empty array when user has no workouts', async () => {
      mockRepository.findByUserId.mockResolvedValue([]);

      const result = await service.getUserWorkouts('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getUserWorkoutById', () => {
    it('should return a user workout when user owns it', async () => {
      mockRepository.findById.mockResolvedValue(mockUserWorkout);

      const result = await service.getUserWorkoutById('user-1', 'user-workout-1');

      expect(mockRepository.findById).toHaveBeenCalledWith('user-workout-1');
      expect(result).toEqual(mockUserWorkout);
    });

    it('should throw NotFoundException when user workout does not exist', async () => {
      mockRepository.findById.mockResolvedValue(undefined);

      await expect(service.getUserWorkoutById('user-1', 'user-workout-1')).rejects.toThrow(NotFoundException);
      await expect(service.getUserWorkoutById('user-1', 'user-workout-1')).rejects.toThrow('User workout not found');
    });

    it('should throw NotFoundException when user does not own the workout', async () => {
      mockRepository.findById.mockResolvedValue(mockUserWorkout);

      await expect(service.getUserWorkoutById('user-2', 'user-workout-1')).rejects.toThrow(NotFoundException);
      await expect(service.getUserWorkoutById('user-2', 'user-workout-1')).rejects.toThrow('User workout not found');
    });
  });

  describe('getUserWorkoutByTemplateId', () => {
    it('should return a user workout when it exists', async () => {
      mockRepository.findByUserIdAndWorkoutTemplateId.mockResolvedValue(mockUserWorkout);

      const result = await service.getUserWorkoutByTemplateId('user-1', 'workout-1');

      expect(mockRepository.findByUserIdAndWorkoutTemplateId).toHaveBeenCalledWith('user-1', 'workout-1');
      expect(result).toEqual(mockUserWorkout);
    });

    it('should return undefined when user workout does not exist', async () => {
      mockRepository.findByUserIdAndWorkoutTemplateId.mockResolvedValue(undefined);

      const result = await service.getUserWorkoutByTemplateId('user-1', 'workout-1');

      expect(result).toBeUndefined();
    });
  });

  describe('deleteUserWorkout', () => {
    it('should delete a user workout when user owns it', async () => {
      mockRepository.findById.mockResolvedValue(mockUserWorkout);
      mockRepository.delete.mockResolvedValue(undefined);

      await service.deleteUserWorkout('user-1', 'user-workout-1');

      expect(mockRepository.delete).toHaveBeenCalledWith('user-workout-1');
    });

    it('should throw NotFoundException when user workout does not exist', async () => {
      mockRepository.findById.mockResolvedValue(undefined);

      await expect(service.deleteUserWorkout('user-1', 'user-workout-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user does not own the workout', async () => {
      mockRepository.findById.mockResolvedValue(mockUserWorkout);

      await expect(service.deleteUserWorkout('user-2', 'user-workout-1')).rejects.toThrow(NotFoundException);

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('deleteAllUserWorkouts', () => {
    it('should delete all workouts for a user', async () => {
      mockRepository.deleteByUserId.mockResolvedValue(undefined);

      await service.deleteAllUserWorkouts('user-1');

      expect(mockRepository.deleteByUserId).toHaveBeenCalledWith('user-1');
    });
  });
});
