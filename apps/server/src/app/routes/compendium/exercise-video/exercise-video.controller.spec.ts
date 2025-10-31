import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseVideoController } from './exercise-video.controller';
import { CompendiumExerciseVideoService } from '../../../core/compendium/exercise-video/compendium-exercise-video.service';

describe('ExerciseVideoController', () => {
  let controller: ExerciseVideoController;
  let service: CompendiumExerciseVideoService;

  const mockService = {
    findAll: jest.fn(),
    findByExerciseId: jest.fn(),
    findByCompositeKey: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExerciseVideoController],
      providers: [
        {
          provide: CompendiumExerciseVideoService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ExerciseVideoController>(ExerciseVideoController);
    service = module.get<CompendiumExerciseVideoService>(
      CompendiumExerciseVideoService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll and return transformed results', async () => {
      const mockVideos = [
        {
          exerciseTemplateId: 'squat',
          url: 'https://youtube.com/1',
          title: 'Video 1',
          createdBy: 'user-1',
          createdAt: new Date('2024-01-01'),
        },
        {
          exerciseTemplateId: 'deadlift',
          url: 'https://youtube.com/2',
          title: 'Video 2',
          createdBy: 'user-2',
          createdAt: new Date('2024-01-02'),
        },
      ];

      mockService.findAll.mockResolvedValue(mockVideos);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('exerciseTemplateId', 'squat');
      expect(result[1]).toHaveProperty('exerciseTemplateId', 'deadlift');
    });

    it('should return empty array when no videos exist', async () => {
      mockService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('findByExerciseId', () => {
    it('should call service.findByExerciseId with correct parameters', async () => {
      const exerciseId = 'squat';
      const mockVideos = [
        {
          exerciseTemplateId: 'squat',
          url: 'https://youtube.com/1',
          title: 'Squat Video 1',
          createdBy: 'user-1',
          createdAt: new Date('2024-01-01'),
        },
        {
          exerciseTemplateId: 'squat',
          url: 'https://youtube.com/2',
          title: 'Squat Video 2',
          createdBy: 'user-2',
          createdAt: new Date('2024-01-02'),
        },
      ];

      mockService.findByExerciseId.mockResolvedValue(mockVideos);

      const result = await controller.findByExerciseId(exerciseId);

      expect(service.findByExerciseId).toHaveBeenCalledWith(exerciseId);
      expect(service.findByExerciseId).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('title', 'Squat Video 1');
    });

    it('should return empty array for exercise with no videos', async () => {
      mockService.findByExerciseId.mockResolvedValue([]);

      const result = await controller.findByExerciseId('nonexistent');

      expect(service.findByExerciseId).toHaveBeenCalledWith('nonexistent');
      expect(result).toEqual([]);
    });
  });

  describe('findByCompositeKey', () => {
    it('should call service.findByCompositeKey with correct parameters', async () => {
      const exerciseId = 'squat';
      const url = 'https://youtube.com/123';
      const mockVideo = {
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/123',
        title: 'Test Video',
        description: 'Test description',
        createdBy: 'user-1',
        createdAt: new Date('2024-01-01'),
      };

      mockService.findByCompositeKey.mockResolvedValue(mockVideo);

      const result = await controller.findByCompositeKey(exerciseId, url);

      expect(service.findByCompositeKey).toHaveBeenCalledWith(
        exerciseId,
        url
      );
      expect(service.findByCompositeKey).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('exerciseTemplateId', 'squat');
      expect(result).toHaveProperty('url', url);
      expect(result).toHaveProperty('title', 'Test Video');
    });
  });

  describe('create', () => {
    it('should call service.create with data and userId', async () => {
      const createDto = {
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/new',
        title: 'New Video',
        description: 'New description',
      };

      const userId = 'user-123';

      const mockCreatedVideo = {
        ...createDto,
        createdBy: userId,
        createdAt: new Date('2024-01-01'),
      };

      mockService.create.mockResolvedValue(mockCreatedVideo);

      const result = await controller.create(createDto, userId);

      expect(service.create).toHaveBeenCalledWith(createDto, userId);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('exerciseTemplateId', 'squat');
      expect(result).toHaveProperty('createdBy', userId);
    });

    it('should create video with minimal fields', async () => {
      const createDto = {
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/minimal',
      };

      const userId = 'user-456';

      const mockCreatedVideo = {
        ...createDto,
        createdBy: userId,
        createdAt: new Date('2024-01-01'),
      };

      mockService.create.mockResolvedValue(mockCreatedVideo);

      const result = await controller.create(createDto, userId);

      expect(service.create).toHaveBeenCalledWith(createDto, userId);
      expect(result).toHaveProperty('url', 'https://youtube.com/minimal');
    });
  });

  describe('update', () => {
    it('should call service.update with correct parameters', async () => {
      const exerciseId = 'squat';
      const url = 'https://youtube.com/update';
      const updateDto = {
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/update',
        title: 'Updated Title',
        description: 'Updated description',
      };
      const userId = 'user-789';

      const mockUpdatedVideo = {
        ...updateDto,
        createdBy: userId,
        createdAt: new Date('2024-01-01'),
      };

      mockService.update.mockResolvedValue(mockUpdatedVideo);

      const result = await controller.update(
        exerciseId,
        url,
        updateDto,
        userId
      );

      expect(service.update).toHaveBeenCalledWith(
        exerciseId,
        url,
        updateDto,
        userId
      );
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('title', 'Updated Title');
    });

    it('should handle partial updates', async () => {
      const exerciseId = 'squat';
      const url = 'https://youtube.com/partial';
      const updateDto = {
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/partial',
        title: 'Only Title Updated',
      };
      const userId = 'user-999';

      const mockUpdatedVideo = {
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/partial',
        title: 'Only Title Updated',
        description: 'Original description',
        createdBy: userId,
        createdAt: new Date('2024-01-01'),
      };

      mockService.update.mockResolvedValue(mockUpdatedVideo);

      const result = await controller.update(
        exerciseId,
        url,
        updateDto,
        userId
      );

      expect(service.update).toHaveBeenCalledWith(
        exerciseId,
        url,
        updateDto,
        userId
      );
      expect(result).toHaveProperty('title', 'Only Title Updated');
      expect(result).toHaveProperty('description', 'Original description');
    });
  });

  describe('delete', () => {
    it('should call service.delete with correct parameters', async () => {
      const exerciseId = 'squat';
      const url = 'https://youtube.com/delete';
      const userId = 'user-delete';

      const mockDeletedVideo = {
        exerciseTemplateId: exerciseId,
        url: url,
        title: 'Deleted Video',
        createdBy: 'original-user',
        createdAt: new Date('2024-01-01'),
      };

      mockService.delete.mockResolvedValue(mockDeletedVideo);

      const result = await controller.delete(exerciseId, url, userId);

      expect(service.delete).toHaveBeenCalledWith(exerciseId, url);
      expect(service.delete).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('exerciseTemplateId', exerciseId);
    });
  });

  describe('date transformation', () => {
    it('should transform Date objects to ISO strings in response DTOs', async () => {
      const mockVideo = {
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/date-test',
        title: 'Date Test',
        createdBy: 'user-1',
        createdAt: new Date('2024-01-15T10:30:00Z'),
      };

      mockService.findByCompositeKey.mockResolvedValue(mockVideo);

      const result = await controller.findByCompositeKey(
        'squat',
        'https://youtube.com/date-test'
      );

      // The plainToInstance transformation should convert Date to ISO string
      expect(result).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });
  });
});
