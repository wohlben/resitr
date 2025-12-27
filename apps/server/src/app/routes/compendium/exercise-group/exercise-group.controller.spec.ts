import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseGroupController } from './exercise-group.controller';
import { CompendiumExerciseGroupService } from '../../../core/compendium/exercise-group/compendium-exercise-group.service';
import { CreateExerciseGroupDto } from './dto/exercise-group.dto';

describe('ExerciseGroupController', () => {
  let controller: ExerciseGroupController;
  let service: CompendiumExerciseGroupService;

  const mockService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExerciseGroupController],
      providers: [
        {
          provide: CompendiumExerciseGroupService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ExerciseGroupController>(ExerciseGroupController);
    service = module.get<CompendiumExerciseGroupService>(CompendiumExerciseGroupService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all exercise groups', async () => {
      const mockGroups = [
        {
          id: 'group-1',
          name: 'Upper Body',
          description: 'Upper body exercises',
          createdBy: 'user-1',
          createdAt: new Date(),
        },
        {
          id: 'group-2',
          name: 'Lower Body',
          description: 'Lower body exercises',
          createdBy: 'user-1',
          createdAt: new Date(),
        },
      ];

      mockService.findAll.mockResolvedValue(mockGroups);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('group-1');
      expect(result[1].id).toBe('group-2');
    });
  });

  describe('findById', () => {
    it('should return a group by id', async () => {
      const mockGroup = {
        id: 'group-1',
        name: 'Upper Body',
        description: 'Upper body exercises',
        createdBy: 'user-1',
        createdAt: new Date(),
      };

      mockService.findById.mockResolvedValue(mockGroup);

      const result = await controller.findById('group-1');

      expect(service.findById).toHaveBeenCalledWith('group-1');
      expect(result).toBeDefined();
      expect(result?.id).toBe('group-1');
      expect(result?.name).toBe('Upper Body');
    });

    it('should return undefined for non-existent group', async () => {
      mockService.findById.mockResolvedValue(undefined);

      const result = await controller.findById('non-existent');

      expect(service.findById).toHaveBeenCalledWith('non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('findByName', () => {
    it('should return a group by name', async () => {
      const mockGroup = {
        id: 'group-1',
        name: 'Upper Body',
        description: 'Upper body exercises',
        createdBy: 'user-1',
        createdAt: new Date(),
      };

      mockService.findByName.mockResolvedValue(mockGroup);

      const result = await controller.findByName('Upper Body');

      expect(service.findByName).toHaveBeenCalledWith('Upper Body');
      expect(result).toBeDefined();
      expect(result?.name).toBe('Upper Body');
    });
  });

  describe('create', () => {
    it('should create a new exercise group', async () => {
      const createDto: CreateExerciseGroupDto = {
        name: 'Upper Body',
        description: 'Upper body exercises',
      };

      const mockCreated = {
        id: 'group-1',
        ...createDto,
        createdBy: 'user-1',
        createdAt: new Date(),
      };

      mockService.create.mockResolvedValue(mockCreated);

      const result = await controller.create(createDto, 'user-1');

      expect(service.create).toHaveBeenCalledWith(createDto, 'user-1');
      expect(result.id).toBe('group-1');
      expect(result.name).toBe('Upper Body');
      expect(result.createdBy).toBe('user-1');
    });

    it('should create a group without optional description', async () => {
      const createDto: CreateExerciseGroupDto = {
        name: 'Upper Body',
      };

      const mockCreated = {
        id: 'group-1',
        ...createDto,
        createdBy: 'user-1',
        createdAt: new Date(),
      };

      mockService.create.mockResolvedValue(mockCreated);

      const result = await controller.create(createDto, 'user-1');

      expect(service.create).toHaveBeenCalledWith(createDto, 'user-1');
      expect(result.description).toBeUndefined();
    });
  });

  describe('upsert', () => {
    it('should upsert an exercise group', async () => {
      const upsertDto: CreateExerciseGroupDto = {
        name: 'Upper Body Modified',
        description: 'Updated description',
      };

      const mockUpserted = {
        id: 'group-1',
        ...upsertDto,
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.upsert.mockResolvedValue(mockUpserted);

      const result = await controller.upsert(upsertDto, 'user-1');

      expect(service.upsert).toHaveBeenCalledWith(upsertDto, 'user-1');
      expect(result.id).toBe('group-1');
      expect(result.name).toBe('Upper Body Modified');
      expect(result.updatedAt).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update an exercise group', async () => {
      const updateDto: CreateExerciseGroupDto = {
        name: 'Upper Body Strength',
        description: 'Updated description',
      };

      const mockUpdated = {
        id: 'group-1',
        name: 'Upper Body Strength',
        description: 'Updated description',
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.update.mockResolvedValue(mockUpdated);

      const result = await controller.update('group-1', updateDto);

      expect(service.update).toHaveBeenCalledWith('group-1', updateDto);
      expect(result.name).toBe('Upper Body Strength');
      expect(result.description).toBe('Updated description');
      expect(result.updatedAt).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete an exercise group', async () => {
      const mockDeleted = {
        id: 'group-1',
        name: 'Upper Body',
        description: 'Upper body exercises',
        createdBy: 'user-1',
        createdAt: new Date(),
      };

      mockService.delete.mockResolvedValue(mockDeleted);

      const result = await controller.delete('group-1');

      expect(service.delete).toHaveBeenCalledWith('group-1');
      expect(result).toBeDefined();
      expect(result.id).toBe('group-1');
    });
  });
});
