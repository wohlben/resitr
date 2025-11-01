import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumExerciseVideoService } from './compendium-exercise-video.service';
import { CompendiumExerciseVideoRepository } from '../../persistence/repositories/compendium-exercise-video.repository';
import { CompendiumExerciseRepository } from '../../persistence/repositories/compendium-exercise.repository';
import { provideTestDatabase } from '../../persistence/database';
import { mockExercise } from '../../persistence/test-factories';
import { VideoSource } from '@resitr/api';
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

    service = module.get<CompendiumExerciseVideoService>(CompendiumExerciseVideoService);
    repository = module.get<CompendiumExerciseVideoRepository>(CompendiumExerciseVideoRepository);
    exerciseRepository = module.get<CompendiumExerciseRepository>(CompendiumExerciseRepository);

    // Create test exercises
    await exerciseRepository.create(mockExercise({ templateId: 'squat' }));
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

      expect(result).toMatchObject({
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=123',
        title: 'How to Squat',
        description: 'A comprehensive guide to squatting',
        video_source: VideoSource.YOUTUBE,
        createdBy: 'user-1',
      });
      expect(result?.createdAt).toBeDefined();
    });

    it('should create a video with minimal fields', async () => {
      const videoData: CreateExerciseVideoDto = {
        exerciseTemplateId: 'squat',
        url: 'https://tiktok.com/@user/video/456',
      };

      const result = await service.create(videoData, 'user-2');

      expect(result).toMatchObject({
        exerciseTemplateId: 'squat',
        url: 'https://tiktok.com/@user/video/456',
        title: null,
        description: null,
        video_source: null,
        createdBy: 'user-2',
      });
    });

    it('should create multiple videos for the same exercise', async () => {
      await service.create({
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=abc',
        title: 'Squat Tutorial 1',
      }, 'user-1');
      await service.create({
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=def',
        title: 'Squat Tutorial 2',
      }, 'user-1');

      const videos = await service.findByExerciseId('squat');
      expect(videos).toHaveLength(2);
    });
  });

  describe('findAll', () => {
    it('should return all videos across exercises', async () => {
      await exerciseRepository.create(mockExercise({ templateId: 'deadlift' }));

      await service.create({
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=squat1',
      }, 'user-1');
      await service.create({
        exerciseTemplateId: 'deadlift',
        url: 'https://youtube.com/watch?v=deadlift1',
      }, 'user-1');

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
      await service.create({
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=abc',
        title: 'Tutorial 1',
      }, 'user-1');
      await service.create({
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=def',
        title: 'Tutorial 2',
      }, 'user-1');

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

      const result = await service.findByCompositeKey('squat', 'https://youtube.com/watch?v=unique');

      expect(result).toMatchObject({
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=unique',
        title: 'Unique Tutorial',
        description: 'Test description',
        video_source: VideoSource.YOUTUBE,
      });
    });

    it('should return undefined for non-existent video', async () => {
      const result = await service.findByCompositeKey('squat', 'https://youtube.com/watch?v=nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update video title and description', async () => {
      await service.create({
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=update-test',
        title: 'Original Title',
        description: 'Original Description',
      }, 'user-1');

      const result = await service.update('squat', 'https://youtube.com/watch?v=update-test', {
        title: 'Updated Title',
        description: 'Updated Description',
      }, 'user-2');

      expect(result).toMatchObject({
        title: 'Updated Title',
        description: 'Updated Description',
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=update-test',
      });
    });

    it('should update video source', async () => {
      await service.create({
        exerciseTemplateId: 'squat',
        url: 'https://example.com/video',
        video_source: VideoSource.OTHER,
      }, 'user-1');

      const result = await service.update('squat', 'https://example.com/video', {
        video_source: VideoSource.YOUTUBE,
      }, 'user-1');

      expect(result?.video_source).toBe(VideoSource.YOUTUBE);
    });

    it('should update only specified fields', async () => {
      await service.create({
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=partial-update',
        title: 'Original Title',
        description: 'Original Description',
        video_source: VideoSource.YOUTUBE,
      }, 'user-1');

      const result = await service.update('squat', 'https://youtube.com/watch?v=partial-update', {
        title: 'New Title',
      }, 'user-1');

      expect(result).toMatchObject({
        title: 'New Title',
        description: 'Original Description',
        video_source: VideoSource.YOUTUBE,
      });
    });
  });

  describe('delete', () => {
    it('should delete a video', async () => {
      await service.create({
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=delete-test',
        title: 'To Be Deleted',
      }, 'user-1');

      let result = await service.findByCompositeKey('squat', 'https://youtube.com/watch?v=delete-test');
      expect(result).toBeDefined();

      await service.delete('squat', 'https://youtube.com/watch?v=delete-test');

      result = await service.findByCompositeKey('squat', 'https://youtube.com/watch?v=delete-test');
      expect(result).toBeUndefined();
    });

    it('should delete one video without affecting others', async () => {
      await service.create({
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=keep',
        title: 'Keep This',
      }, 'user-1');
      await service.create({
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=delete',
        title: 'Delete This',
      }, 'user-1');

      await service.delete('squat', 'https://youtube.com/watch?v=delete');

      const videos = await service.findByExerciseId('squat');
      expect(videos).toHaveLength(1);
      expect(videos[0]?.title).toBe('Keep This');
    });
  });

  describe('composite key behavior', () => {
    it('should allow same URL for different exercises', async () => {
      await exerciseRepository.create(mockExercise({ templateId: 'deadlift' }));

      const sameUrl = 'https://youtube.com/watch?v=shared';

      await service.create({
        exerciseTemplateId: 'squat',
        url: sameUrl,
        title: 'Squat Video',
      }, 'user-1');
      await service.create({
        exerciseTemplateId: 'deadlift',
        url: sameUrl,
        title: 'Deadlift Video',
      }, 'user-1');

      const squatVideo = await service.findByCompositeKey('squat', sameUrl);
      const deadliftVideo = await service.findByCompositeKey('deadlift', sameUrl);

      expect(squatVideo?.title).toBe('Squat Video');
      expect(deadliftVideo?.title).toBe('Deadlift Video');
    });

    it('should not allow duplicate exercise-url combinations', async () => {
      await service.create({
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=duplicate',
        title: 'First',
      }, 'user-1');

      await expect(service.create({
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=duplicate',
        title: 'Second',
      }, 'user-1')).rejects.toThrow();
    });
  });

  describe('video source types', () => {
    it('should handle YouTube videos', async () => {
      const result = await service.create({
        exerciseTemplateId: 'squat',
        url: 'https://youtube.com/watch?v=yt123',
        video_source: VideoSource.YOUTUBE,
      }, 'user-1');

      expect(result?.video_source).toBe(VideoSource.YOUTUBE);
    });

    it('should handle TikTok videos', async () => {
      const result = await service.create({
        exerciseTemplateId: 'squat',
        url: 'https://tiktok.com/@user/video/123',
        video_source: VideoSource.TIKTOK,
      }, 'user-1');

      expect(result?.video_source).toBe(VideoSource.TIKTOK);
    });

    it('should handle other video sources', async () => {
      const result = await service.create({
        exerciseTemplateId: 'squat',
        url: 'https://vimeo.com/123456',
        video_source: VideoSource.OTHER,
      }, 'user-1');

      expect(result?.video_source).toBe(VideoSource.OTHER);
    });
  });
});
