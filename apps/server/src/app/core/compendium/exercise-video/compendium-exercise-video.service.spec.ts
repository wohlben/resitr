import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumExerciseVideoService } from './compendium-exercise-video.service';
import { CompendiumExerciseVideoRepository } from '../../persistence/repositories/compendium-exercise-video.repository';
import { CompendiumExerciseRepository } from '../../persistence/repositories/compendium-exercise.repository';
import { provideTestDatabase } from '../../persistence/database';
import { VideoSource } from '@resitr/api';
import { ExerciseType } from '@resitr/api';
import { CreateExerciseVideoDto } from '../../../routes/compendium/exercise-video/dto/exercise-video.dto';

describe('CompendiumExerciseVideoService', () => {
  let service: CompendiumExerciseVideoService;
  let repository: CompendiumExerciseVideoRepository;
  let exerciseRepository: CompendiumExerciseRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        provideTestDatabase(),
        CompendiumExerciseVideoRepository,
        CompendiumExerciseRepository,
        CompendiumExerciseVideoService,
      ],
    }).compile();

    service = module.get<CompendiumExerciseVideoService>(
      CompendiumExerciseVideoService
    );
    repository = module.get<CompendiumExerciseVideoRepository>(
      CompendiumExerciseVideoRepository
    );
    exerciseRepository = module.get<CompendiumExerciseRepository>(
      CompendiumExerciseRepository
    );

    // Create a test exercise to reference
    await exerciseRepository.create({
      templateId: 'squat',
      name: 'Squat',
      type: ExerciseType.STRENGTH,
      force: [],
      equipmentIds: [],
      primaryMuscles: [],
      secondaryMuscles: [],
      instructions: [],
      images: [],
      technicalDifficulty: 'BEGINNER' as any,
      bodyWeightScaling: 0,
      createdBy: 'test-user',
      version: 1,
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a video with all fields', async () => {
      const videoData: CreateExerciseVideoDto = {
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=123',
        title: 'How to Squat',
        description: 'A comprehensive guide to squatting',
        video_source: VideoSource.YOUTUBE,
      };

      const result = await service.create(videoData, 'user-1');

      expect(result).toBeDefined();
      expect(result?.exerciseTemplateId).toBe('squat');
      expect(result?.url).toBe('https://youtube.com/watch?v=123');
      expect(result?.title).toBe('How to Squat');
      expect(result?.description).toBe('A comprehensive guide to squatting');
      expect(result?.video_source).toBe(VideoSource.YOUTUBE);
      expect(result?.createdBy).toBe('user-1');
      expect(result?.createdAt).toBeDefined();
    });

    it('should create a video with minimal fields', async () => {
      const videoData: CreateExerciseVideoDto = {
        exerciseTemplateId: 'squat',
        url: 'https://tiktok.com/@user/video/456',
      };

      const result = await service.create(videoData, 'user-2');

      expect(result).toBeDefined();
      expect(result?.exerciseTemplateId).toBe('squat');
      expect(result?.url).toBe('https://tiktok.com/@user/video/456');
      expect(result?.title).toBeNull();
      expect(result?.description).toBeNull();
      expect(result?.video_source).toBeNull();
      expect(result?.createdBy).toBe('user-2');
    });

    it('should create multiple videos for the same exercise', async () => {
      const video1: CreateExerciseVideoDto = {
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=abc',
        title: 'Squat Tutorial 1',
      };

      const video2: CreateExerciseVideoDto = {
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=def',
        title: 'Squat Tutorial 2',
      };

      await service.create(video1, 'user-1');
      await service.create(video2, 'user-1');

      const videos = await service.findByExerciseId('squat');
      expect(videos).toHaveLength(2);
    });
  });

  describe('findAll', () => {
    it('should return all videos across exercises', async () => {
      // Create another exercise
      await exerciseRepository.create({
        templateId: 'deadlift',
        name: 'Deadlift',
        type: ExerciseType.STRENGTH,
        force: [],
        equipmentIds: [],
        primaryMuscles: [],
        secondaryMuscles: [],
        instructions: [],
        images: [],
        technicalDifficulty: 'BEGINNER' as any,
        bodyWeightScaling: 0,
        createdBy: 'test-user',
        version: 1,
      });

      const video1: CreateExerciseVideoDto = {
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=squat1',
      };

      const video2: CreateExerciseVideoDto = {
        exerciseTemplateId: 'deadlift',
        url: 'https://youtube.com/watch?v=deadlift1',
      };

      await service.create(video1, 'user-1');
      await service.create(video2, 'user-1');

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result.map((v) => v.exerciseTemplateId)).toContain('squat');
      expect(result.map((v) => v.exerciseTemplateId)).toContain('deadlift');
    });

    it('should return empty array when no videos exist', async () => {
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findByExerciseId', () => {
    it('should return all videos for a specific exercise', async () => {
      const video1: CreateExerciseVideoDto = {
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=abc',
        title: 'Tutorial 1',
      };

      const video2: CreateExerciseVideoDto = {
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=def',
        title: 'Tutorial 2',
      };

      await service.create(video1, 'user-1');
      await service.create(video2, 'user-1');

      const result = await service.findByExerciseId('squat');

      expect(result).toHaveLength(2);
      expect(result.map((v) => v.title)).toContain('Tutorial 1');
      expect(result.map((v) => v.title)).toContain('Tutorial 2');
    });

    it('should return empty array for exercise with no videos', async () => {
      const result = await service.findByExerciseId('squat');
      expect(result).toEqual([]);
    });
  });

  describe('findByCompositeKey', () => {
    it('should return a specific video by exercise ID and URL', async () => {
      const videoData: CreateExerciseVideoDto = {
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=unique',
        title: 'Unique Tutorial',
        description: 'Test description',
        video_source: VideoSource.YOUTUBE,
      };

      await service.create(videoData, 'user-1');

      const result = await service.findByCompositeKey(
        'squat',
        'https://youtube.com/watch?v=unique'
      );

      expect(result).toBeDefined();
      expect(result?.exerciseTemplateId).toBe('squat');
      expect(result?.url).toBe('https://youtube.com/watch?v=unique');
      expect(result?.title).toBe('Unique Tutorial');
      expect(result?.description).toBe('Test description');
      expect(result?.video_source).toBe(VideoSource.YOUTUBE);
    });

    it('should return undefined for non-existent video', async () => {
      const result = await service.findByCompositeKey(
        'squat',
        'https://youtube.com/watch?v=nonexistent'
      );

      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update video title and description', async () => {
      const videoData: CreateExerciseVideoDto = {
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=update-test',
        title: 'Original Title',
        description: 'Original Description',
      };

      await service.create(videoData, 'user-1');

      const updateData: Partial<CreateExerciseVideoDto> = {
        title: 'Updated Title',
        description: 'Updated Description',
      };

      const result = await service.update(
        'squat',
        'https://youtube.com/watch?v=update-test',
        updateData,
        'user-2'
      );

      expect(result).toBeDefined();
      expect(result?.title).toBe('Updated Title');
      expect(result?.description).toBe('Updated Description');
      expect(result?.exerciseTemplateId).toBe('squat');
      expect(result?.url).toBe('https://youtube.com/watch?v=update-test');
    });

    it('should update video source', async () => {
      const videoData: CreateExerciseVideoDto = {
        exerciseTemplateId: 'squat',
        url: 'https://example.com/video',
        video_source: VideoSource.OTHER,
      };

      await service.create(videoData, 'user-1');

      const result = await service.update(
        'squat',
        'https://example.com/video',
        { video_source: VideoSource.YOUTUBE },
        'user-1'
      );

      expect(result?.video_source).toBe(VideoSource.YOUTUBE);
    });

    it('should update only specified fields', async () => {
      const videoData: CreateExerciseVideoDto = {
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=partial-update',
        title: 'Original Title',
        description: 'Original Description',
        video_source: VideoSource.YOUTUBE,
      };

      await service.create(videoData, 'user-1');

      const result = await service.update(
        'squat',
        'https://youtube.com/watch?v=partial-update',
        { title: 'New Title' },
        'user-1'
      );

      expect(result?.title).toBe('New Title');
      expect(result?.description).toBe('Original Description');
      expect(result?.video_source).toBe(VideoSource.YOUTUBE);
    });
  });

  describe('delete', () => {
    it('should delete a video', async () => {
      const videoData: CreateExerciseVideoDto = {
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=delete-test',
        title: 'To Be Deleted',
      };

      await service.create(videoData, 'user-1');

      // Verify it exists
      let result = await service.findByCompositeKey(
        'squat',
        'https://youtube.com/watch?v=delete-test'
      );
      expect(result).toBeDefined();

      // Delete it
      await service.delete('squat', 'https://youtube.com/watch?v=delete-test');

      // Verify it's gone
      result = await service.findByCompositeKey(
        'squat',
        'https://youtube.com/watch?v=delete-test'
      );
      expect(result).toBeUndefined();
    });

    it('should delete one video without affecting others', async () => {
      const video1: CreateExerciseVideoDto = {
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=keep',
        title: 'Keep This',
      };

      const video2: CreateExerciseVideoDto = {
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=delete',
        title: 'Delete This',
      };

      await service.create(video1, 'user-1');
      await service.create(video2, 'user-1');

      await service.delete('squat', 'https://youtube.com/watch?v=delete');

      const videos = await service.findByExerciseId('squat');
      expect(videos).toHaveLength(1);
      expect(videos[0]?.title).toBe('Keep This');
    });
  });

  describe('composite key behavior', () => {
    it('should allow same URL for different exercises', async () => {
      // Create another exercise
      await exerciseRepository.create({
        templateId: 'deadlift',
        name: 'Deadlift',
        type: ExerciseType.STRENGTH,
        force: [],
        equipmentIds: [],
        primaryMuscles: [],
        secondaryMuscles: [],
        instructions: [],
        images: [],
        technicalDifficulty: 'BEGINNER' as any,
        bodyWeightScaling: 0,
        createdBy: 'test-user',
        version: 1,
      });

      const sameUrl = 'https://youtube.com/watch?v=shared';

      const video1: CreateExerciseVideoDto = {
        exerciseTemplateId: 'squat',
        url: sameUrl,
        title: 'Squat Video',
      };

      const video2: CreateExerciseVideoDto = {
        exerciseTemplateId: 'deadlift',
        url: sameUrl,
        title: 'Deadlift Video',
      };

      await service.create(video1, 'user-1');
      await service.create(video2, 'user-1');

      const squatVideo = await service.findByCompositeKey('squat', sameUrl);
      const deadliftVideo = await service.findByCompositeKey('deadlift', sameUrl);

      expect(squatVideo?.title).toBe('Squat Video');
      expect(deadliftVideo?.title).toBe('Deadlift Video');
    });

    it('should not allow duplicate exercise-url combinations', async () => {
      const videoData: CreateExerciseVideoDto = {
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=duplicate',
        title: 'First',
      };

      await service.create(videoData, 'user-1');

      // Attempting to create duplicate should fail or be handled by upsert
      const duplicateData: CreateExerciseVideoDto = {
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=duplicate',
        title: 'Second',
      };

      await expect(
        service.create(duplicateData, 'user-1')
      ).rejects.toThrow();
    });
  });

  describe('video source types', () => {
    it('should handle YouTube videos', async () => {
      const videoData: CreateExerciseVideoDto = {
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=yt123',
        video_source: VideoSource.YOUTUBE,
      };

      const result = await service.create(videoData, 'user-1');
      expect(result?.video_source).toBe(VideoSource.YOUTUBE);
    });

    it('should handle TikTok videos', async () => {
      const videoData: CreateExerciseVideoDto = {
        exerciseTemplateId: 'squat',
        url: 'https://tiktok.com/@user/video/123',
        video_source: VideoSource.TIKTOK,
      };

      const result = await service.create(videoData, 'user-1');
      expect(result?.video_source).toBe(VideoSource.TIKTOK);
    });

    it('should handle other video sources', async () => {
      const videoData: CreateExerciseVideoDto = {
        exerciseTemplateId: 'squat',
        url: 'https://vimeo.com/123456',
        video_source: VideoSource.OTHER,
      };

      const result = await service.create(videoData, 'user-1');
      expect(result?.video_source).toBe(VideoSource.OTHER);
    });
  });
});
