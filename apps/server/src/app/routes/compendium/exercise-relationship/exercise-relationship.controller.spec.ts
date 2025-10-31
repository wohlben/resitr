import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseRelationshipController } from './exercise-relationship.controller';
import { CompendiumExerciseRelationshipService } from '../../../core/compendium/exercise-relationship/compendium-exercise-relationship.service';
import { ExerciseRelationshipType } from '@resitr/api';
import { CreateExerciseRelationshipDto } from './dto/exercise-relationship.dto';

describe('ExerciseRelationshipController', () => {
  let controller: ExerciseRelationshipController;
  let service: CompendiumExerciseRelationshipService;

  const mockService = {
    findByFromExerciseId: jest.fn(),
    findByToExerciseId: jest.fn(),
    findByExerciseId: jest.fn(),
    findByRelationshipType: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExerciseRelationshipController],
      providers: [
        {
          provide: CompendiumExerciseRelationshipService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ExerciseRelationshipController>(ExerciseRelationshipController);
    service = module.get<CompendiumExerciseRelationshipService>(CompendiumExerciseRelationshipService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findByFromExerciseId', () => {
    it('should return relationships from a specific exercise', async () => {
      const mockRelationships = [
        {
          fromExerciseTemplateId: 'exercise-1',
          toExerciseTemplateId: 'exercise-2',
          relationshipType: ExerciseRelationshipType.ALTERNATIVE,
          createdBy: 'user-1',
          createdAt: new Date(),
        },
      ];

      mockService.findByFromExerciseId.mockResolvedValue(mockRelationships);

      const result = await controller.findByFromExerciseId('exercise-1');

      expect(service.findByFromExerciseId).toHaveBeenCalledWith('exercise-1');
      expect(result).toHaveLength(1);
      expect(result[0].fromExerciseTemplateId).toBe('exercise-1');
    });
  });

  describe('findByToExerciseId', () => {
    it('should return relationships to a specific exercise', async () => {
      const mockRelationships = [
        {
          fromExerciseTemplateId: 'exercise-1',
          toExerciseTemplateId: 'exercise-2',
          relationshipType: ExerciseRelationshipType.ALTERNATIVE,
          createdBy: 'user-1',
          createdAt: new Date(),
        },
      ];

      mockService.findByToExerciseId.mockResolvedValue(mockRelationships);

      const result = await controller.findByToExerciseId('exercise-2');

      expect(service.findByToExerciseId).toHaveBeenCalledWith('exercise-2');
      expect(result).toHaveLength(1);
      expect(result[0].toExerciseTemplateId).toBe('exercise-2');
    });
  });

  describe('findByExerciseId', () => {
    it('should return all relationships involving a specific exercise', async () => {
      const mockRelationships = [
        {
          fromExerciseTemplateId: 'exercise-1',
          toExerciseTemplateId: 'exercise-2',
          relationshipType: ExerciseRelationshipType.ALTERNATIVE,
          createdBy: 'user-1',
          createdAt: new Date(),
        },
        {
          fromExerciseTemplateId: 'exercise-2',
          toExerciseTemplateId: 'exercise-3',
          relationshipType: ExerciseRelationshipType.PROGRESSION,
          createdBy: 'user-1',
          createdAt: new Date(),
        },
      ];

      mockService.findByExerciseId.mockResolvedValue(mockRelationships);

      const result = await controller.findByExerciseId('exercise-2');

      expect(service.findByExerciseId).toHaveBeenCalledWith('exercise-2');
      expect(result).toHaveLength(2);
    });
  });

  describe('findByRelationshipType', () => {
    it('should return relationships of a specific type', async () => {
      const mockRelationships = [
        {
          fromExerciseTemplateId: 'exercise-1',
          toExerciseTemplateId: 'exercise-2',
          relationshipType: ExerciseRelationshipType.ALTERNATIVE,
          createdBy: 'user-1',
          createdAt: new Date(),
        },
      ];

      mockService.findByRelationshipType.mockResolvedValue(mockRelationships);

      const result = await controller.findByRelationshipType('exercise-1', ExerciseRelationshipType.ALTERNATIVE);

      expect(service.findByRelationshipType).toHaveBeenCalledWith('exercise-1', ExerciseRelationshipType.ALTERNATIVE);
      expect(result).toHaveLength(1);
      expect(result[0].relationshipType).toBe(ExerciseRelationshipType.ALTERNATIVE);
    });
  });

  describe('create', () => {
    it('should create a new relationship', async () => {
      const createDto: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
        strength: 0.8,
      };

      const mockCreated = {
        ...createDto,
        createdBy: 'user-1',
        createdAt: new Date(),
      };

      mockService.create.mockResolvedValue(mockCreated);

      const result = await controller.create(createDto, 'user-1');

      expect(service.create).toHaveBeenCalledWith(createDto, 'user-1');
      expect(result.fromExerciseTemplateId).toBe('exercise-1');
      expect(result.toExerciseTemplateId).toBe('exercise-2');
      expect(result.createdBy).toBe('user-1');
    });
  });

  describe('upsert', () => {
    it('should upsert a relationship', async () => {
      const upsertDto: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
        strength: 0.9,
      };

      const mockUpserted = {
        ...upsertDto,
        createdBy: 'user-1',
        createdAt: new Date(),
      };

      mockService.upsert.mockResolvedValue(mockUpserted);

      const result = await controller.upsert(upsertDto, 'user-1');

      expect(service.upsert).toHaveBeenCalledWith(upsertDto, 'user-1');
      expect(result.fromExerciseTemplateId).toBe('exercise-1');
      expect(result.strength).toBe(0.9);
    });
  });

  describe('update', () => {
    it('should update a relationship', async () => {
      const updateDto: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
        strength: 0.95,
        description: 'Updated description',
      };

      const mockUpdated = {
        ...updateDto,
        createdBy: 'user-2',
        createdAt: new Date(),
      };

      mockService.update.mockResolvedValue(mockUpdated);

      const result = await controller.update(
        'exercise-1',
        'exercise-2',
        ExerciseRelationshipType.ALTERNATIVE,
        updateDto,
        'user-2'
      );

      expect(service.update).toHaveBeenCalledWith(
        'exercise-1',
        'exercise-2',
        ExerciseRelationshipType.ALTERNATIVE,
        updateDto,
        'user-2'
      );
      expect(result.strength).toBe(0.95);
      expect(result.description).toBe('Updated description');
      expect(result.createdBy).toBe('user-2');
    });
  });

  describe('delete', () => {
    it('should delete a relationship', async () => {
      const mockDeleted = {
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
        createdBy: 'user-1',
        createdAt: new Date(),
      };

      mockService.delete.mockResolvedValue(mockDeleted);

      const result = await controller.delete(
        'exercise-1',
        'exercise-2',
        ExerciseRelationshipType.ALTERNATIVE,
        'user-1'
      );

      expect(service.delete).toHaveBeenCalledWith(
        'exercise-1',
        'exercise-2',
        ExerciseRelationshipType.ALTERNATIVE,
        'user-1'
      );
      expect(result).toBeDefined();
    });
  });
});
