import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseGroupMemberController } from './exercise-group-member.controller';
import { CompendiumExerciseGroupMemberService } from '../../../core/compendium/exercise-group-member/compendium-exercise-group-member.service';
import { CreateExerciseGroupMemberDto } from './dto/exercise-group-member.dto';

describe('ExerciseGroupMemberController', () => {
  let controller: ExerciseGroupMemberController;
  let service: CompendiumExerciseGroupMemberService;

  const mockService = {
    findAll: jest.fn(),
    findByExerciseId: jest.fn(),
    findByGroupId: jest.fn(),
    findByCompositeKey: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExerciseGroupMemberController],
      providers: [
        {
          provide: CompendiumExerciseGroupMemberService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ExerciseGroupMemberController>(ExerciseGroupMemberController);
    service = module.get<CompendiumExerciseGroupMemberService>(CompendiumExerciseGroupMemberService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all exercise group members', async () => {
      const mockMembers = [
        {
          exerciseTemplateId: 'exercise-1',
          groupId: 'group-1',
          addedBy: 'user-1',
          addedAt: new Date(),
        },
        {
          exerciseTemplateId: 'exercise-2',
          groupId: 'group-1',
          addedBy: 'user-1',
          addedAt: new Date(),
        },
      ];

      mockService.findAll.mockResolvedValue(mockMembers);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].exerciseTemplateId).toBe('exercise-1');
      expect(result[1].exerciseTemplateId).toBe('exercise-2');
    });
  });

  describe('findByExerciseId', () => {
    it('should return all groups an exercise belongs to', async () => {
      const mockMembers = [
        {
          exerciseTemplateId: 'exercise-1',
          groupId: 'group-1',
          addedBy: 'user-1',
          addedAt: new Date(),
        },
        {
          exerciseTemplateId: 'exercise-1',
          groupId: 'group-2',
          addedBy: 'user-1',
          addedAt: new Date(),
        },
      ];

      mockService.findByExerciseId.mockResolvedValue(mockMembers);

      const result = await controller.findByExerciseId('exercise-1');

      expect(service.findByExerciseId).toHaveBeenCalledWith('exercise-1');
      expect(result).toHaveLength(2);
      expect(result.every((m) => m.exerciseTemplateId === 'exercise-1')).toBe(true);
    });
  });

  describe('findByGroupId', () => {
    it('should return all exercises in a group', async () => {
      const mockMembers = [
        {
          exerciseTemplateId: 'exercise-1',
          groupId: 'group-1',
          addedBy: 'user-1',
          addedAt: new Date(),
        },
        {
          exerciseTemplateId: 'exercise-2',
          groupId: 'group-1',
          addedBy: 'user-1',
          addedAt: new Date(),
        },
      ];

      mockService.findByGroupId.mockResolvedValue(mockMembers);

      const result = await controller.findByGroupId('group-1');

      expect(service.findByGroupId).toHaveBeenCalledWith('group-1');
      expect(result).toHaveLength(2);
      expect(result.every((m) => m.groupId === 'group-1')).toBe(true);
    });
  });

  describe('findByCompositeKey', () => {
    it('should return a specific exercise-group membership', async () => {
      const mockMember = {
        exerciseTemplateId: 'exercise-1',
        groupId: 'group-1',
        addedBy: 'user-1',
        addedAt: new Date(),
      };

      mockService.findByCompositeKey.mockResolvedValue(mockMember);

      const result = await controller.findByCompositeKey('exercise-1', 'group-1');

      expect(service.findByCompositeKey).toHaveBeenCalledWith('exercise-1', 'group-1');
      expect(result).toBeDefined();
      expect(result?.exerciseTemplateId).toBe('exercise-1');
      expect(result?.groupId).toBe('group-1');
    });

    it('should return undefined for non-existent membership', async () => {
      mockService.findByCompositeKey.mockResolvedValue(undefined);

      const result = await controller.findByCompositeKey('exercise-1', 'group-1');

      expect(service.findByCompositeKey).toHaveBeenCalledWith('exercise-1', 'group-1');
      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create a new exercise group member', async () => {
      const createDto: CreateExerciseGroupMemberDto = {
        exerciseTemplateId: 'exercise-1',
        groupId: 'group-1',
      };

      const mockCreated = {
        ...createDto,
        addedBy: 'user-1',
        addedAt: new Date(),
      };

      mockService.create.mockResolvedValue(mockCreated);

      const result = await controller.create(createDto, 'user-1');

      expect(service.create).toHaveBeenCalledWith(createDto, 'user-1');
      expect(result.exerciseTemplateId).toBe('exercise-1');
      expect(result.groupId).toBe('group-1');
      expect(result.addedBy).toBe('user-1');
    });
  });

  describe('upsert', () => {
    it('should upsert an exercise group member', async () => {
      const upsertDto: CreateExerciseGroupMemberDto = {
        exerciseTemplateId: 'exercise-1',
        groupId: 'group-1',
      };

      const mockUpserted = {
        ...upsertDto,
        addedBy: 'user-2',
        addedAt: new Date(),
      };

      mockService.upsert.mockResolvedValue(mockUpserted);

      const result = await controller.upsert(upsertDto, 'user-2');

      expect(service.upsert).toHaveBeenCalledWith(upsertDto, 'user-2');
      expect(result.exerciseTemplateId).toBe('exercise-1');
      expect(result.groupId).toBe('group-1');
      expect(result.addedBy).toBe('user-2');
    });
  });

  describe('delete', () => {
    it('should delete an exercise group member', async () => {
      const mockDeleted = {
        exerciseTemplateId: 'exercise-1',
        groupId: 'group-1',
        addedBy: 'user-1',
        addedAt: new Date(),
      };

      mockService.delete.mockResolvedValue(mockDeleted);

      const result = await controller.delete('exercise-1', 'group-1');

      expect(service.delete).toHaveBeenCalledWith('exercise-1', 'group-1');
      expect(result).toBeDefined();
      expect(result.exerciseTemplateId).toBe('exercise-1');
      expect(result.groupId).toBe('group-1');
    });
  });
});
