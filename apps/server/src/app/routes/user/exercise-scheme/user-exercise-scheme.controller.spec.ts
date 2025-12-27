import { Test, TestingModule } from '@nestjs/testing';
import { UserExerciseSchemeController } from './user-exercise-scheme.controller';
import { UserExerciseSchemeService } from '../../../core/user/exercise-scheme/user-exercise-scheme.service';
import { MeasurementType } from '@resitr/api';
import type { CreateUserExerciseSchemeDto, UpdateUserExerciseSchemeDto } from './dto/user-exercise-scheme.dto';

describe('UserExerciseSchemeController', () => {
  let controller: UserExerciseSchemeController;
  let service: UserExerciseSchemeService;

  const mockService = {
    createScheme: jest.fn(),
    getUserSchemes: jest.fn(),
    getUserSchemesByExercise: jest.fn(),
    getSchemeById: jest.fn(),
    updateScheme: jest.fn(),
    deleteScheme: jest.fn(),
    assignToSectionItem: jest.fn(),
    unassignFromSectionItem: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserExerciseSchemeController],
      providers: [
        {
          provide: UserExerciseSchemeService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<UserExerciseSchemeController>(UserExerciseSchemeController);
    service = module.get<UserExerciseSchemeService>(UserExerciseSchemeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createScheme', () => {
    it('should call service.createScheme with userId and data', async () => {
      const createDto: CreateUserExerciseSchemeDto = {
        exerciseId: 'exercise-1',
        name: 'New Scheme',
        measurementType: MeasurementType.REP_BASED,
        sets: 3,
        reps: 10,
        restBetweenSets: 60,
        weight: 100,
      };

      const userId = 'user-123';
      const mockCreatedScheme = {
        id: 'new-scheme-id',
        userId,
        ...createDto,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
      };

      mockService.createScheme.mockResolvedValue(mockCreatedScheme);

      const result = await controller.createScheme(userId, createDto);

      expect(service.createScheme).toHaveBeenCalledWith(userId, createDto);
      expect(service.createScheme).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('id', 'new-scheme-id');
      expect(result).toHaveProperty('userId', userId);
      expect(result).toHaveProperty('name', 'New Scheme');
    });

    it('should create a time-based scheme', async () => {
      const createDto: CreateUserExerciseSchemeDto = {
        exerciseId: 'exercise-1',
        name: 'AMRAP Scheme',
        measurementType: MeasurementType.AMRAP,
        sets: 1,
        reps: 0,
        restBetweenSets: 0,
        duration: 600,
      };

      const userId = 'user-123';
      const mockCreatedScheme = {
        id: 'new-scheme-id',
        userId,
        ...createDto,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
      };

      mockService.createScheme.mockResolvedValue(mockCreatedScheme);

      const result = await controller.createScheme(userId, createDto);

      expect(service.createScheme).toHaveBeenCalledWith(userId, createDto);
      expect(result).toHaveProperty('measurementType', MeasurementType.AMRAP);
      expect(result).toHaveProperty('duration', 600);
    });

    it('should create a distance-based scheme', async () => {
      const createDto: CreateUserExerciseSchemeDto = {
        exerciseId: 'exercise-1',
        name: '5K Run',
        measurementType: MeasurementType.DISTANCE_BASED,
        sets: 1,
        reps: 1,
        restBetweenSets: 0,
        distance: 5000,
        targetTime: 1800,
      };

      const userId = 'user-123';
      const mockCreatedScheme = {
        id: 'new-scheme-id',
        userId,
        ...createDto,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
      };

      mockService.createScheme.mockResolvedValue(mockCreatedScheme);

      const result = await controller.createScheme(userId, createDto);

      expect(result).toHaveProperty('distance', 5000);
      expect(result).toHaveProperty('targetTime', 1800);
    });
  });

  describe('getUserSchemes', () => {
    it('should call service.getUserSchemes with userId', async () => {
      const userId = 'user-123';
      const mockSchemes = [
        {
          id: 'scheme-1',
          userId,
          exerciseId: 'exercise-1',
          name: 'Scheme 1',
          measurementType: MeasurementType.REP_BASED,
          sets: 3,
          reps: 10,
          restBetweenSets: 60,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: null,
        },
        {
          id: 'scheme-2',
          userId,
          exerciseId: 'exercise-2',
          name: 'Scheme 2',
          measurementType: MeasurementType.REP_BASED,
          sets: 5,
          reps: 5,
          restBetweenSets: 120,
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: null,
        },
      ];

      mockService.getUserSchemes.mockResolvedValue(mockSchemes);

      const result = await controller.getUserSchemes(userId);

      expect(service.getUserSchemes).toHaveBeenCalledWith(userId);
      expect(service.getUserSchemes).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', 'scheme-1');
      expect(result[1]).toHaveProperty('id', 'scheme-2');
    });

    it('should call service.getUserSchemesByExercise when exerciseId is provided', async () => {
      const userId = 'user-123';
      const exerciseId = 'exercise-1';
      const mockSchemes = [
        {
          id: 'scheme-1',
          userId,
          exerciseId,
          name: 'Scheme 1',
          measurementType: MeasurementType.REP_BASED,
          sets: 3,
          reps: 10,
          restBetweenSets: 60,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: null,
        },
        {
          id: 'scheme-2',
          userId,
          exerciseId,
          name: 'Scheme 2',
          measurementType: MeasurementType.REP_BASED,
          sets: 5,
          reps: 5,
          restBetweenSets: 120,
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: null,
        },
      ];

      mockService.getUserSchemesByExercise.mockResolvedValue(mockSchemes);

      const result = await controller.getUserSchemes(userId, exerciseId);

      expect(service.getUserSchemesByExercise).toHaveBeenCalledWith(userId, exerciseId);
      expect(service.getUserSchemesByExercise).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result.every((s) => s.exerciseId === exerciseId)).toBe(true);
    });

    it('should return empty array when user has no schemes', async () => {
      const userId = 'user-123';
      mockService.getUserSchemes.mockResolvedValue([]);

      const result = await controller.getUserSchemes(userId);

      expect(service.getUserSchemes).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });
  });

  describe('getSchemeById', () => {
    it('should call service.getSchemeById with userId and schemeId', async () => {
      const userId = 'user-123';
      const schemeId = 'scheme-1';
      const mockScheme = {
        id: schemeId,
        userId,
        exerciseId: 'exercise-1',
        name: 'Test Scheme',
        measurementType: MeasurementType.REP_BASED,
        sets: 3,
        reps: 10,
        restBetweenSets: 60,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
      };

      mockService.getSchemeById.mockResolvedValue(mockScheme);

      const result = await controller.getSchemeById(userId, schemeId);

      expect(service.getSchemeById).toHaveBeenCalledWith(userId, schemeId);
      expect(service.getSchemeById).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('id', schemeId);
      expect(result).toHaveProperty('name', 'Test Scheme');
    });
  });

  describe('updateScheme', () => {
    it('should call service.updateScheme with userId, schemeId, and data', async () => {
      const updateDto: UpdateUserExerciseSchemeDto = {
        name: 'Updated Scheme',
        sets: 5,
        reps: 5,
      };

      const userId = 'user-123';
      const schemeId = 'scheme-1';
      const mockUpdatedScheme = {
        id: schemeId,
        userId,
        exerciseId: 'exercise-1',
        ...updateDto,
        measurementType: MeasurementType.REP_BASED,
        restBetweenSets: 120,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockService.updateScheme.mockResolvedValue(mockUpdatedScheme);

      const result = await controller.updateScheme(userId, schemeId, updateDto);

      expect(service.updateScheme).toHaveBeenCalledWith(userId, schemeId, updateDto);
      expect(service.updateScheme).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('id', schemeId);
      expect(result).toHaveProperty('name', 'Updated Scheme');
      expect(result).toHaveProperty('sets', 5);
      expect(result).toHaveProperty('updatedAt');
    });

    it('should handle partial updates', async () => {
      const updateDto: UpdateUserExerciseSchemeDto = {
        weight: 150,
      };

      const userId = 'user-123';
      const schemeId = 'scheme-1';
      const mockUpdatedScheme = {
        id: schemeId,
        userId,
        exerciseId: 'exercise-1',
        name: 'Test Scheme',
        measurementType: MeasurementType.REP_BASED,
        sets: 3,
        reps: 10,
        restBetweenSets: 60,
        weight: 150,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockService.updateScheme.mockResolvedValue(mockUpdatedScheme);

      const result = await controller.updateScheme(userId, schemeId, updateDto);

      expect(service.updateScheme).toHaveBeenCalledWith(userId, schemeId, updateDto);
      expect(result).toHaveProperty('weight', 150);
    });
  });

  describe('deleteScheme', () => {
    it('should call service.deleteScheme with userId and schemeId', async () => {
      const userId = 'user-123';
      const schemeId = 'scheme-1';

      mockService.deleteScheme.mockResolvedValue(undefined);

      const result = await controller.deleteScheme(userId, schemeId);

      expect(service.deleteScheme).toHaveBeenCalledWith(userId, schemeId);
      expect(service.deleteScheme).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ success: true });
    });
  });

  describe('join table operations', () => {
    describe('assignToSectionItem', () => {
      it('should call service.assignToSectionItem with correct parameters', async () => {
        const userId = 'user-123';
        const schemeId = 'scheme-1';
        const dto = {
          sectionItemId: 'section-item-1',
          userWorkoutId: 'user-workout-1',
        };

        const mockJoinData = {
          sectionItemId: dto.sectionItemId,
          userWorkoutId: dto.userWorkoutId,
          userExerciseSchemeId: schemeId,
        };

        mockService.assignToSectionItem.mockResolvedValue(mockJoinData);

        const result = await controller.assignToSectionItem(userId, schemeId, dto);

        expect(service.assignToSectionItem).toHaveBeenCalledWith(
          userId,
          schemeId,
          dto.sectionItemId,
          dto.userWorkoutId
        );
        expect(service.assignToSectionItem).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: true, data: mockJoinData });
      });
    });

    describe('unassignFromSectionItem', () => {
      it('should call service.unassignFromSectionItem with correct parameters', async () => {
        const userId = 'user-123';
        const schemeId = 'scheme-1';
        const dto = {
          sectionItemId: 'section-item-1',
          userWorkoutId: 'user-workout-1',
        };

        mockService.unassignFromSectionItem.mockResolvedValue(undefined);

        const result = await controller.unassignFromSectionItem(userId, schemeId, dto);

        expect(service.unassignFromSectionItem).toHaveBeenCalledWith(
          userId,
          schemeId,
          dto.sectionItemId,
          dto.userWorkoutId
        );
        expect(service.unassignFromSectionItem).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: true });
      });
    });
  });
});
