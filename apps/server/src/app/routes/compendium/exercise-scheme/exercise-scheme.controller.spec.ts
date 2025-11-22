import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseSchemeController } from './exercise-scheme.controller';
import { CompendiumExerciseSchemeService } from '../../../core/compendium/exercise-scheme/compendium-exercise-scheme.service';
import type { CreateExerciseSchemeDto } from './dto/exercise-scheme.dto';
import { MeasurementType } from '@resitr/api';

describe('ExerciseSchemeController', () => {
  let controller: ExerciseSchemeController;
  let service: CompendiumExerciseSchemeService;

  const mockService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByExerciseId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExerciseSchemeController],
      providers: [
        {
          provide: CompendiumExerciseSchemeService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ExerciseSchemeController>(ExerciseSchemeController);
    service = module.get<CompendiumExerciseSchemeService>(CompendiumExerciseSchemeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should call service.findAll and return all schemes', async () => {
      const mockSchemes = [
        {
          id: 'scheme-1',
          exerciseId: 'exercise-1',
          name: 'Scheme 1',
          measurementType: MeasurementType.REP_BASED,
          sets: 3,
          reps: 10,
          restBetweenSets: 60,
          createdBy: 'user-1',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'scheme-2',
          exerciseId: 'exercise-1',
          name: 'Scheme 2',
          measurementType: MeasurementType.REP_BASED,
          sets: 5,
          reps: 5,
          restBetweenSets: 120,
          createdBy: 'user-1',
          createdAt: new Date('2024-01-02'),
        },
      ];

      mockService.findAll.mockResolvedValue(mockSchemes);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', 'scheme-1');
      expect(result[1]).toHaveProperty('id', 'scheme-2');
    });

    it('should return empty array when no schemes exist', async () => {
      mockService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should call service.findById with id and return scheme', async () => {
      const mockScheme = {
        id: 'scheme-1',
        exerciseId: 'exercise-1',
        name: 'Test Scheme',
        measurementType: MeasurementType.REP_BASED,
        sets: 3,
        reps: 10,
        restBetweenSets: 60,
        createdBy: 'user-1',
        createdAt: new Date('2024-01-01'),
      };

      mockService.findById.mockResolvedValue(mockScheme);

      const result = await controller.findById('scheme-1');

      expect(service.findById).toHaveBeenCalledWith('scheme-1');
      expect(service.findById).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('id', 'scheme-1');
      expect(result).toHaveProperty('name', 'Test Scheme');
    });
  });

  describe('findByExerciseId', () => {
    it('should call service.findByExerciseId with exerciseId and return schemes', async () => {
      const mockSchemes = [
        {
          id: 'scheme-1',
          exerciseId: 'exercise-1',
          name: 'Scheme 1',
          measurementType: MeasurementType.REP_BASED,
          sets: 3,
          reps: 10,
          restBetweenSets: 60,
          createdBy: 'user-1',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'scheme-2',
          exerciseId: 'exercise-1',
          name: 'Scheme 2',
          measurementType: MeasurementType.REP_BASED,
          sets: 5,
          reps: 5,
          restBetweenSets: 120,
          createdBy: 'user-1',
          createdAt: new Date('2024-01-02'),
        },
      ];

      mockService.findByExerciseId.mockResolvedValue(mockSchemes);

      const result = await controller.findByExerciseId('exercise-1');

      expect(service.findByExerciseId).toHaveBeenCalledWith('exercise-1');
      expect(service.findByExerciseId).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result.every((s) => s.exerciseId === 'exercise-1')).toBe(true);
    });

    it('should return empty array when no schemes exist for exercise', async () => {
      mockService.findByExerciseId.mockResolvedValue([]);

      const result = await controller.findByExerciseId('exercise-1');

      expect(service.findByExerciseId).toHaveBeenCalledWith('exercise-1');
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should call service.create with data and userId', async () => {
      const createDto: CreateExerciseSchemeDto = {
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
        ...createDto,
        createdBy: userId,
        createdAt: new Date('2024-01-01'),
      };

      mockService.create.mockResolvedValue(mockCreatedScheme);

      const result = await controller.create(createDto, userId);

      expect(service.create).toHaveBeenCalledWith(createDto, userId);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('id', 'new-scheme-id');
      expect(result).toHaveProperty('createdBy', userId);
      expect(result).toHaveProperty('name', 'New Scheme');
    });

    it('should create a time-based scheme', async () => {
      const createDto: CreateExerciseSchemeDto = {
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
        ...createDto,
        createdBy: userId,
        createdAt: new Date('2024-01-01'),
      };

      mockService.create.mockResolvedValue(mockCreatedScheme);

      const result = await controller.create(createDto, userId);

      expect(service.create).toHaveBeenCalledWith(createDto, userId);
      expect(result).toHaveProperty('measurementType', MeasurementType.AMRAP);
      expect(result).toHaveProperty('duration', 600);
    });
  });

  describe('update', () => {
    it('should call service.update with id, data, and userId', async () => {
      const updateDto: CreateExerciseSchemeDto = {
        exerciseId: 'exercise-1',
        name: 'Updated Scheme',
        measurementType: MeasurementType.REP_BASED,
        sets: 5,
        reps: 5,
        restBetweenSets: 120,
      };

      const schemeId = 'scheme-1';
      const userId = 'user-123';
      const mockUpdatedScheme = {
        id: schemeId,
        ...updateDto,
        createdBy: userId,
        createdAt: new Date('2024-01-01'),
      };

      mockService.update.mockResolvedValue(mockUpdatedScheme);

      const result = await controller.update(schemeId, updateDto, userId);

      expect(service.update).toHaveBeenCalledWith(schemeId, updateDto, userId);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('id', schemeId);
      expect(result).toHaveProperty('name', 'Updated Scheme');
      expect(result).toHaveProperty('sets', 5);
    });
  });

  describe('delete', () => {
    it('should call service.delete with id', async () => {
      const schemeId = 'scheme-1';
      const userId = 'user-123';
      const mockDeletedScheme = {
        id: schemeId,
        exerciseId: 'exercise-1',
        name: 'Deleted Scheme',
        measurementType: MeasurementType.REP_BASED,
        sets: 3,
        reps: 10,
        restBetweenSets: 60,
        createdBy: 'user-1',
        createdAt: new Date('2024-01-01'),
      };

      mockService.delete.mockResolvedValue(mockDeletedScheme);

      const result = await controller.delete(schemeId, userId);

      expect(service.delete).toHaveBeenCalledWith(schemeId);
      expect(service.delete).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('id', schemeId);
    });
  });
});
