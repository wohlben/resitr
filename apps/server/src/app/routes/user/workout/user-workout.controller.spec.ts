import { Test, TestingModule } from '@nestjs/testing';
import { UserWorkoutController } from './user-workout.controller';
import { UserWorkoutService } from '../../../core/user/workout/user-workout.service';
import type { CreateUserWorkoutDto } from './dto/user-workout.dto';

describe('UserWorkoutController', () => {
  let controller: UserWorkoutController;
  let service: UserWorkoutService;

  const mockService = {
    createUserWorkout: jest.fn(),
    getUserWorkouts: jest.fn(),
    getUserWorkoutById: jest.fn(),
    deleteUserWorkout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserWorkoutController],
      providers: [
        {
          provide: UserWorkoutService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<UserWorkoutController>(UserWorkoutController);
    service = module.get<UserWorkoutService>(UserWorkoutService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUserWorkout', () => {
    it('should call service.createUserWorkout with userId and workoutTemplateId', async () => {
      const createDto: CreateUserWorkoutDto = {
        workoutTemplateId: 'workout-1',
      };

      const userId = 'user-123';
      const mockCreatedUserWorkout = {
        id: 'user-workout-1',
        userId,
        workoutTemplateId: createDto.workoutTemplateId,
        createdAt: new Date(),
        updatedAt: null,
      };

      mockService.createUserWorkout.mockResolvedValue(mockCreatedUserWorkout);

      const result = await controller.createUserWorkout(userId, createDto);

      expect(service.createUserWorkout).toHaveBeenCalledWith(userId, createDto.workoutTemplateId);
      expect(service.createUserWorkout).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('id', 'user-workout-1');
      expect(result).toHaveProperty('userId', userId);
      expect(result).toHaveProperty('workoutTemplateId', 'workout-1');
    });
  });

  describe('getUserWorkouts', () => {
    it('should call service.getUserWorkouts with userId', async () => {
      const userId = 'user-123';
      const mockUserWorkouts = [
        {
          id: 'user-workout-1',
          userId,
          workoutTemplateId: 'workout-1',
          createdAt: new Date(),
          updatedAt: null,
        },
        {
          id: 'user-workout-2',
          userId,
          workoutTemplateId: 'workout-2',
          createdAt: new Date(),
          updatedAt: null,
        },
      ];

      mockService.getUserWorkouts.mockResolvedValue(mockUserWorkouts);

      const result = await controller.getUserWorkouts(userId);

      expect(service.getUserWorkouts).toHaveBeenCalledWith(userId);
      expect(service.getUserWorkouts).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when user has no workouts', async () => {
      const userId = 'user-123';
      mockService.getUserWorkouts.mockResolvedValue([]);

      const result = await controller.getUserWorkouts(userId);

      expect(result).toEqual([]);
    });
  });

  describe('getUserWorkoutById', () => {
    it('should call service.getUserWorkoutById with userId and userWorkoutId', async () => {
      const userId = 'user-123';
      const userWorkoutId = 'user-workout-1';
      const mockUserWorkout = {
        id: userWorkoutId,
        userId,
        workoutTemplateId: 'workout-1',
        createdAt: new Date(),
        updatedAt: null,
      };

      mockService.getUserWorkoutById.mockResolvedValue(mockUserWorkout);

      const result = await controller.getUserWorkoutById(userId, userWorkoutId);

      expect(service.getUserWorkoutById).toHaveBeenCalledWith(userId, userWorkoutId);
      expect(service.getUserWorkoutById).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('id', userWorkoutId);
    });
  });

  describe('deleteUserWorkout', () => {
    it('should call service.deleteUserWorkout with userId and userWorkoutId', async () => {
      const userId = 'user-123';
      const userWorkoutId = 'user-workout-1';

      mockService.deleteUserWorkout.mockResolvedValue(undefined);

      const result = await controller.deleteUserWorkout(userId, userWorkoutId);

      expect(service.deleteUserWorkout).toHaveBeenCalledWith(userId, userWorkoutId);
      expect(service.deleteUserWorkout).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ success: true });
    });
  });
});
