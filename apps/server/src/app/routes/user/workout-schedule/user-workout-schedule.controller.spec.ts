import { Test, TestingModule } from '@nestjs/testing';
import { UserWorkoutScheduleController } from './user-workout-schedule.controller';
import { UserWorkoutScheduleService } from '../../../core/user/workout-schedule/user-workout-schedule.service';
import type { CreateUserWorkoutScheduleDto, UpdateUserWorkoutScheduleDto } from './dto/user-workout-schedule.dto';

describe('UserWorkoutScheduleController', () => {
  let controller: UserWorkoutScheduleController;
  let service: UserWorkoutScheduleService;

  const mockService = {
    createSchedule: jest.fn(),
    getUserSchedules: jest.fn(),
    getUserSchedulesByDay: jest.fn(),
    getScheduleById: jest.fn(),
    updateSchedule: jest.fn(),
    deleteSchedule: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserWorkoutScheduleController],
      providers: [
        {
          provide: UserWorkoutScheduleService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<UserWorkoutScheduleController>(UserWorkoutScheduleController);
    service = module.get<UserWorkoutScheduleService>(UserWorkoutScheduleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSchedule', () => {
    it('should call service.createSchedule with userId and data', async () => {
      const createDto: CreateUserWorkoutScheduleDto = {
        workoutTemplateId: 'workout-1',
        dayOfWeek: 1,
        order: 0,
      };

      const userId = 'user-123';
      const mockCreatedSchedule = {
        id: 'schedule-1',
        userId,
        ...createDto,
        createdAt: new Date(),
        updatedAt: null,
      };

      mockService.createSchedule.mockResolvedValue(mockCreatedSchedule);

      const result = await controller.createSchedule(userId, createDto);

      expect(service.createSchedule).toHaveBeenCalledWith(
        userId,
        createDto.workoutTemplateId,
        createDto.dayOfWeek,
        createDto.order
      );
      expect(service.createSchedule).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('id', 'schedule-1');
      expect(result).toHaveProperty('userId', userId);
      expect(result).toHaveProperty('workoutTemplateId', 'workout-1');
    });

    it('should handle missing order in createDto', async () => {
      const createDto: CreateUserWorkoutScheduleDto = {
        workoutTemplateId: 'workout-1',
        dayOfWeek: 1,
      };

      const userId = 'user-123';
      const mockCreatedSchedule = {
        id: 'schedule-1',
        userId,
        workoutTemplateId: createDto.workoutTemplateId,
        dayOfWeek: createDto.dayOfWeek,
        order: 0,
        createdAt: new Date(),
        updatedAt: null,
      };

      mockService.createSchedule.mockResolvedValue(mockCreatedSchedule);

      const result = await controller.createSchedule(userId, createDto);

      expect(service.createSchedule).toHaveBeenCalledWith(
        userId,
        createDto.workoutTemplateId,
        createDto.dayOfWeek,
        undefined
      );
      expect(result).toHaveProperty('order', 0);
    });
  });

  describe('getUserSchedules', () => {
    it('should call service.getUserSchedules with userId when no dayOfWeek provided', async () => {
      const userId = 'user-123';
      const mockSchedules = [
        {
          id: 'schedule-1',
          userId,
          workoutTemplateId: 'workout-1',
          dayOfWeek: 1,
          order: 0,
          createdAt: new Date(),
          updatedAt: null,
        },
        {
          id: 'schedule-2',
          userId,
          workoutTemplateId: 'workout-2',
          dayOfWeek: 2,
          order: 0,
          createdAt: new Date(),
          updatedAt: null,
        },
      ];

      mockService.getUserSchedules.mockResolvedValue(mockSchedules);

      const result = await controller.getUserSchedules(userId);

      expect(service.getUserSchedules).toHaveBeenCalledWith(userId);
      expect(service.getUserSchedules).toHaveBeenCalledTimes(1);
      expect(service.getUserSchedulesByDay).not.toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should call service.getUserSchedulesByDay with userId and dayOfWeek when provided', async () => {
      const userId = 'user-123';
      const dayOfWeek = '1';
      const mockSchedules = [
        {
          id: 'schedule-1',
          userId,
          workoutTemplateId: 'workout-1',
          dayOfWeek: 1,
          order: 0,
          createdAt: new Date(),
          updatedAt: null,
        },
      ];

      mockService.getUserSchedulesByDay.mockResolvedValue(mockSchedules);

      const result = await controller.getUserSchedules(userId, dayOfWeek);

      expect(service.getUserSchedulesByDay).toHaveBeenCalledWith(userId, 1);
      expect(service.getUserSchedulesByDay).toHaveBeenCalledTimes(1);
      expect(service.getUserSchedules).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result.every((s) => s.dayOfWeek === 1)).toBe(true);
    });

    it('should throw error for invalid dayOfWeek parameter', async () => {
      const userId = 'user-123';
      const invalidDayOfWeek = '7'; // Should be 0-6

      await expect(controller.getUserSchedules(userId, invalidDayOfWeek)).rejects.toThrow(
        'Invalid dayOfWeek parameter. Must be between 0 and 6.'
      );
    });

    it('should throw error for non-numeric dayOfWeek parameter', async () => {
      const userId = 'user-123';
      const invalidDayOfWeek = 'invalid';

      await expect(controller.getUserSchedules(userId, invalidDayOfWeek)).rejects.toThrow(
        'Invalid dayOfWeek parameter. Must be between 0 and 6.'
      );
    });

    it('should return empty array when user has no schedules', async () => {
      const userId = 'user-123';
      mockService.getUserSchedules.mockResolvedValue([]);

      const result = await controller.getUserSchedules(userId);

      expect(result).toEqual([]);
    });
  });

  describe('getScheduleById', () => {
    it('should call service.getScheduleById with userId and scheduleId', async () => {
      const userId = 'user-123';
      const scheduleId = 'schedule-1';
      const mockSchedule = {
        id: scheduleId,
        userId,
        workoutTemplateId: 'workout-1',
        dayOfWeek: 1,
        order: 0,
        createdAt: new Date(),
        updatedAt: null,
      };

      mockService.getScheduleById.mockResolvedValue(mockSchedule);

      const result = await controller.getScheduleById(userId, scheduleId);

      expect(service.getScheduleById).toHaveBeenCalledWith(userId, scheduleId);
      expect(service.getScheduleById).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('id', scheduleId);
    });
  });

  describe('updateSchedule', () => {
    it('should call service.updateSchedule with userId, scheduleId, and data', async () => {
      const updateDto: UpdateUserWorkoutScheduleDto = {
        dayOfWeek: 3,
        order: 1,
      };

      const userId = 'user-123';
      const scheduleId = 'schedule-1';
      const mockUpdatedSchedule = {
        id: scheduleId,
        userId,
        workoutTemplateId: 'workout-1',
        ...updateDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.updateSchedule.mockResolvedValue(mockUpdatedSchedule);

      const result = await controller.updateSchedule(userId, scheduleId, updateDto);

      expect(service.updateSchedule).toHaveBeenCalledWith(
        userId,
        scheduleId,
        updateDto.dayOfWeek,
        updateDto.order
      );
      expect(service.updateSchedule).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('id', scheduleId);
      expect(result).toHaveProperty('dayOfWeek', 3);
      expect(result).toHaveProperty('order', 1);
      expect(result).toHaveProperty('updatedAt');
    });

    it('should handle partial updates (dayOfWeek only)', async () => {
      const updateDto: UpdateUserWorkoutScheduleDto = {
        dayOfWeek: 3,
      };

      const userId = 'user-123';
      const scheduleId = 'schedule-1';
      const mockUpdatedSchedule = {
        id: scheduleId,
        userId,
        workoutTemplateId: 'workout-1',
        dayOfWeek: 3,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.updateSchedule.mockResolvedValue(mockUpdatedSchedule);

      const result = await controller.updateSchedule(userId, scheduleId, updateDto);

      expect(service.updateSchedule).toHaveBeenCalledWith(userId, scheduleId, 3, undefined);
      expect(result).toHaveProperty('dayOfWeek', 3);
    });

    it('should handle partial updates (order only)', async () => {
      const updateDto: UpdateUserWorkoutScheduleDto = {
        order: 2,
      };

      const userId = 'user-123';
      const scheduleId = 'schedule-1';
      const mockUpdatedSchedule = {
        id: scheduleId,
        userId,
        workoutTemplateId: 'workout-1',
        dayOfWeek: 1,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.updateSchedule.mockResolvedValue(mockUpdatedSchedule);

      const result = await controller.updateSchedule(userId, scheduleId, updateDto);

      expect(service.updateSchedule).toHaveBeenCalledWith(userId, scheduleId, undefined, 2);
      expect(result).toHaveProperty('order', 2);
    });
  });

  describe('deleteSchedule', () => {
    it('should call service.deleteSchedule with userId and scheduleId', async () => {
      const userId = 'user-123';
      const scheduleId = 'schedule-1';

      mockService.deleteSchedule.mockResolvedValue(undefined);

      const result = await controller.deleteSchedule(userId, scheduleId);

      expect(service.deleteSchedule).toHaveBeenCalledWith(userId, scheduleId);
      expect(service.deleteSchedule).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ success: true });
    });
  });
});
