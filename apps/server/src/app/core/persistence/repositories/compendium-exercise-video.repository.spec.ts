import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumExerciseVideoRepository } from './compendium-exercise-video.repository';
import { CompendiumExerciseRepository } from './compendium-exercise.repository';
import { provideTestDatabase } from '../database';
import { mockExercise, mockExerciseVideo } from '../test-factories';
import { VideoSource } from '@resitr/api';

describe('CompendiumExerciseVideoRepository', () => {
  let repository: CompendiumExerciseVideoRepository;
  let exerciseRepository: CompendiumExerciseRepository;

  let testExercise1: ReturnType<typeof mockExercise>;
  let testExercise2: ReturnType<typeof mockExercise>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [provideTestDatabase(), CompendiumExerciseVideoRepository, CompendiumExerciseRepository],
    }).compile();

    repository = module.get<CompendiumExerciseVideoRepository>(CompendiumExerciseVideoRepository);
    exerciseRepository = module.get<CompendiumExerciseRepository>(CompendiumExerciseRepository);

    // Create test exercises
    testExercise1 = await exerciseRepository.create(mockExercise({ templateId: 'exercise-1' }));
    testExercise2 = await exerciseRepository.create(mockExercise({ templateId: 'exercise-2' }));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new video with all fields', async () => {
      const videoData = mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=example1',
        title: 'How to Bench Press',
        description: 'A comprehensive guide to bench pressing',
        video_source: VideoSource.YOUTUBE,
      });

      const result = await repository.create(videoData);

      expect(result).toMatchObject(videoData);
      expect(result.createdAt).toBeDefined();
    });

    it('should create video with minimal required fields', async () => {
      const videoData = mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=example2',
        title: null,
        description: null,
        video_source: null,
      });

      const result = await repository.create(videoData);

      expect(result).toMatchObject(videoData);
    });

    it('should create multiple videos for same exercise', async () => {
      const result1 = await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=video1',
      }));
      const result2 = await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=video2',
      }));

      expect(result1.url).not.toBe(result2.url);
    });

    it('should create videos with different video sources', async () => {
      const result1 = await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=abc',
        video_source: VideoSource.YOUTUBE,
      }));
      const result2 = await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://tiktok.com/@user/video/123',
        video_source: VideoSource.TIKTOK,
      }));
      const result3 = await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://example.com/video',
        video_source: VideoSource.OTHER,
      }));

      expect(result1.video_source).toBe(VideoSource.YOUTUBE);
      expect(result2.video_source).toBe(VideoSource.TIKTOK);
      expect(result3.video_source).toBe(VideoSource.OTHER);
    });

    it('should fail when creating duplicate video (same exercise and url)', async () => {
      await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=duplicate',
      }));

      await expect(repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=duplicate',
      }))).rejects.toThrow();
    });

    it('should allow same url for different exercises', async () => {
      const result1 = await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=shared',
      }));
      const result2 = await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise2.templateId,
        url: 'https://youtube.com/watch?v=shared',
      }));

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    it('should fail when creating video with non-existent exercise', async () => {
      await expect(repository.create(mockExerciseVideo({
        exerciseTemplateId: 'non-existent-exercise',
      }))).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return empty array when no videos exist', async () => {
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });

    it('should return all videos', async () => {
      await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=video1',
      }));
      await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=video2',
      }));
      await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise2.templateId,
        url: 'https://youtube.com/watch?v=video3',
      }));

      const result = await repository.findAll();

      expect(result).toHaveLength(3);
    });
  });

  describe('findByCompositeKey', () => {
    it('should find video by composite key', async () => {
      const videoData = mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=test',
        title: 'Test Video',
        description: 'Test description',
      });

      await repository.create(videoData);

      const result = await repository.findByCompositeKey(testExercise1.templateId, videoData.url);

      expect(result).toMatchObject(videoData);
    });

    it('should return undefined when video not found', async () => {
      const result = await repository.findByCompositeKey(testExercise1.templateId, 'https://youtube.com/watch?v=nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('findByExerciseId', () => {
    it('should find all videos for a specific exercise', async () => {
      await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=ex1-video1',
      }));
      await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=ex1-video2',
      }));
      await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise2.templateId,
        url: 'https://youtube.com/watch?v=ex2-video1',
      }));

      const result = await repository.findByExerciseId(testExercise1.templateId);

      expect(result).toHaveLength(2);
      expect(result.every((v) => v.exerciseTemplateId === testExercise1.templateId)).toBe(true);
    });

    it('should return empty array when exercise has no videos', async () => {
      const result = await repository.findByExerciseId(testExercise1.templateId);
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update video fields', async () => {
      const created = await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=update-test',
      }));

      const result = await repository.update(testExercise1.templateId, created.url, {
        title: 'Updated Title',
        description: 'New description',
        video_source: VideoSource.YOUTUBE,
      });

      expect(result).toMatchObject({
        title: 'Updated Title',
        description: 'New description',
        video_source: VideoSource.YOUTUBE,
        url: created.url,
      });
    });

    it('should return undefined when updating non-existent video', async () => {
      const result = await repository.update(testExercise1.templateId, 'https://youtube.com/watch?v=nonexistent', {
        title: 'Updated Title',
      });

      expect(result).toBeUndefined();
    });

    it('should be able to clear optional fields', async () => {
      const created = await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=test',
        title: 'Some Title',
        description: 'Some description',
        video_source: VideoSource.YOUTUBE,
      }));

      const result = await repository.update(testExercise1.templateId, created.url, {
        title: null,
        description: null,
        video_source: null,
      });

      expect(result).toMatchObject({
        title: null,
        description: null,
        video_source: null,
      });
    });
  });

  describe('upsert', () => {
    it('should insert new video when it does not exist', async () => {
      const videoData = mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/new-video',
        title: 'New Video',
        description: 'New video description',
        video_source: VideoSource.YOUTUBE,
      });

      const result = await repository.upsert(videoData);

      expect(result).toMatchObject(videoData);

      const found = await repository.findByCompositeKey(testExercise1.templateId, 'https://youtube.com/new-video');
      expect(found).toBeDefined();
    });

    it('should update existing video when composite key exists', async () => {
      await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise2.templateId,
        url: 'https://youtube.com/test-video',
        title: 'Original Title',
      }));

      const result = await repository.upsert(mockExerciseVideo({
        exerciseTemplateId: testExercise2.templateId,
        url: 'https://youtube.com/test-video',
        title: 'Updated Title',
        description: 'Updated description',
        video_source: VideoSource.OTHER,
      }));

      expect(result).toMatchObject({
        title: 'Updated Title',
        description: 'Updated description',
        video_source: VideoSource.OTHER,
      });

      const videos = await repository.findByExerciseId(testExercise2.templateId);
      expect(videos).toHaveLength(1);
    });

    it('should handle multiple upserts with same composite key', async () => {
      const videoData = mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/multi-upsert',
      });

      const result1 = await repository.upsert(videoData);
      expect(result1.title).toBe(videoData.title);

      const result2 = await repository.upsert(mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/multi-upsert',
        title: 'Updated Title 1',
        description: 'First description',
      }));
      expect(result2.title).toBe('Updated Title 1');

      const result3 = await repository.upsert(mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/multi-upsert',
        title: 'Updated Title 2',
        description: 'Second description',
        video_source: VideoSource.YOUTUBE,
      }));
      expect(result3.title).toBe('Updated Title 2');

      const videos = await repository.findByExerciseId(testExercise1.templateId);
      const multiUpsertVideo = videos.find((v) => v.url === 'https://youtube.com/multi-upsert');
      expect(multiUpsertVideo?.title).toBe('Updated Title 2');
    });
  });

  describe('delete', () => {
    it('should delete video by composite key', async () => {
      const created = await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=delete-test',
      }));

      const result = await repository.delete(testExercise1.templateId, created.url);

      expect(result).toMatchObject({
        exerciseTemplateId: testExercise1.templateId,
        url: created.url,
      });

      const found = await repository.findByCompositeKey(testExercise1.templateId, created.url);
      expect(found).toBeUndefined();
    });

    it('should return undefined when deleting non-existent video', async () => {
      const result = await repository.delete(testExercise1.templateId, 'https://youtube.com/watch?v=nonexistent');
      expect(result).toBeUndefined();
    });

    it('should only delete specific video, not others', async () => {
      const video1 = await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=video1',
      }));
      await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=video2',
      }));

      await repository.delete(testExercise1.templateId, video1.url);

      const found = await repository.findByCompositeKey(testExercise1.templateId, 'https://youtube.com/watch?v=video2');
      expect(found).toBeDefined();
    });

    it('should delete and allow recreation with same url for same exercise', async () => {
      const created = await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=reusable',
      }));

      await repository.delete(testExercise1.templateId, created.url);

      const newVideo = await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=reusable',
      }));

      expect(newVideo.url).toBe(created.url);
    });
  });

  describe('cascading deletes', () => {
    it('should delete all videos when exercise is deleted', async () => {
      await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=video1',
      }));
      await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=video2',
      }));
      await repository.create(mockExerciseVideo({
        exerciseTemplateId: testExercise2.templateId,
        url: 'https://youtube.com/watch?v=video3',
      }));

      await exerciseRepository.delete(testExercise1.templateId);

      const result = await repository.findByExerciseId(testExercise1.templateId);
      expect(result).toEqual([]);

      const exercise2Videos = await repository.findByExerciseId(testExercise2.templateId);
      expect(exercise2Videos).toHaveLength(1);
    });
  });
});
