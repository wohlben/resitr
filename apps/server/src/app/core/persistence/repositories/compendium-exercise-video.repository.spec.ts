import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumExerciseVideoRepository } from './compendium-exercise-video.repository';
import { CompendiumExerciseRepository } from './compendium-exercise.repository';
import { provideTestDatabase } from '../database';
import type { CompendiumExerciseVideo } from '../schemas';
import type { CompendiumExercise } from '../schemas';
import { VideoSource, ExerciseType, ForceType, Muscle, TechnicalDifficulty } from '@resitr/api';

describe('CompendiumExerciseVideoRepository', () => {
  let repository: CompendiumExerciseVideoRepository;
  let exerciseRepository: CompendiumExerciseRepository;

  let testExercise1: CompendiumExercise;
  let testExercise2: CompendiumExercise;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [provideTestDatabase(), CompendiumExerciseVideoRepository, CompendiumExerciseRepository],
    }).compile();

    repository = module.get<CompendiumExerciseVideoRepository>(CompendiumExerciseVideoRepository);
    exerciseRepository = module.get<CompendiumExerciseRepository>(CompendiumExerciseRepository);

    // Create test exercises
    testExercise1 = await exerciseRepository.create({
      templateId: 'exercise-1',
      name: 'Bench Press',
      slug: 'bench-press',
      type: ExerciseType.STRENGTH,
      force: [ForceType.PUSH],
      primaryMuscles: [Muscle.CHEST],
      secondaryMuscles: [Muscle.TRICEPS],
      technicalDifficulty: TechnicalDifficulty.INTERMEDIATE,
      equipmentIds: ['barbell', 'bench'],
      bodyWeightScaling: 0,
      instructions: ['Lie on bench', 'Press'],
      createdBy: 'user-1',
    });

    testExercise2 = await exerciseRepository.create({
      templateId: 'exercise-2',
      name: 'Squat',
      slug: 'squat',
      type: ExerciseType.STRENGTH,
      force: [ForceType.PUSH],
      primaryMuscles: [Muscle.QUADS],
      secondaryMuscles: [Muscle.GLUTES],
      technicalDifficulty: TechnicalDifficulty.ADVANCED,
      equipmentIds: ['barbell'],
      bodyWeightScaling: 0,
      instructions: ['Squat down'],
      createdBy: 'user-1',
    });
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new video with all fields', async () => {
      const videoData: CompendiumExerciseVideo = {
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=example1',
        title: 'How to Bench Press',
        description: 'A comprehensive guide to bench pressing',
        video_source: VideoSource.YOUTUBE,
        createdBy: 'user-1',
      };

      const result = await repository.create(videoData);

      expect(result).toBeDefined();
      expect(result.exerciseTemplateId).toBe(testExercise1.templateId);
      expect(result.url).toBe('https://youtube.com/watch?v=example1');
      expect(result.title).toBe('How to Bench Press');
      expect(result.description).toBe('A comprehensive guide to bench pressing');
      expect(result.video_source).toBe(VideoSource.YOUTUBE);
      expect(result.createdBy).toBe('user-1');
      expect(result.createdAt).toBeDefined();
    });

    it('should create video with minimal required fields', async () => {
      const videoData: CompendiumExerciseVideo = {
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=example2',
        createdBy: 'user-1',
      };

      const result = await repository.create(videoData);

      expect(result).toBeDefined();
      expect(result.exerciseTemplateId).toBe(testExercise1.templateId);
      expect(result.url).toBe('https://youtube.com/watch?v=example2');
      expect(result.title).toBeNull();
      expect(result.description).toBeNull();
      expect(result.video_source).toBeNull();
    });

    it('should create multiple videos for same exercise', async () => {
      const video1: CompendiumExerciseVideo = {
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=video1',
        title: 'Video 1',
        createdBy: 'user-1',
      };

      const video2: CompendiumExerciseVideo = {
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=video2',
        title: 'Video 2',
        createdBy: 'user-1',
      };

      const result1 = await repository.create(video1);
      const result2 = await repository.create(video2);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1.url).not.toBe(result2.url);
    });

    it('should create videos with different video sources', async () => {
      const youtubeVideo: CompendiumExerciseVideo = {
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=abc',
        video_source: VideoSource.YOUTUBE,
        createdBy: 'user-1',
      };

      const tiktokVideo: CompendiumExerciseVideo = {
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://tiktok.com/@user/video/123',
        video_source: VideoSource.TIKTOK,
        createdBy: 'user-1',
      };

      const otherVideo: CompendiumExerciseVideo = {
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://example.com/video',
        video_source: VideoSource.OTHER,
        createdBy: 'user-1',
      };

      const result1 = await repository.create(youtubeVideo);
      const result2 = await repository.create(tiktokVideo);
      const result3 = await repository.create(otherVideo);

      expect(result1.video_source).toBe(VideoSource.YOUTUBE);
      expect(result2.video_source).toBe(VideoSource.TIKTOK);
      expect(result3.video_source).toBe(VideoSource.OTHER);
    });

    it('should fail when creating duplicate video (same exercise and url)', async () => {
      const videoData: CompendiumExerciseVideo = {
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=duplicate',
        createdBy: 'user-1',
      };

      await repository.create(videoData);

      const duplicateData: CompendiumExerciseVideo = {
        exerciseTemplateId: testExercise1.templateId, // Same exercise
        url: 'https://youtube.com/watch?v=duplicate', // Same URL
        title: 'Different Title',
        createdBy: 'user-2',
      };

      await expect(repository.create(duplicateData)).rejects.toThrow();
    });

    it('should allow same url for different exercises', async () => {
      const video1: CompendiumExerciseVideo = {
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=shared',
        createdBy: 'user-1',
      };

      const video2: CompendiumExerciseVideo = {
        exerciseTemplateId: testExercise2.templateId, // Different exercise
        url: 'https://youtube.com/watch?v=shared', // Same URL
        createdBy: 'user-1',
      };

      const result1 = await repository.create(video1);
      const result2 = await repository.create(video2);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    it('should fail when creating video with non-existent exercise', async () => {
      const videoData: CompendiumExerciseVideo = {
        exerciseTemplateId: 'non-existent-exercise',
        url: 'https://youtube.com/watch?v=test',
        createdBy: 'user-1',
      };

      await expect(repository.create(videoData)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return empty array when no videos exist', async () => {
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });

    it('should return all videos', async () => {
      await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=video1',
        title: 'Video 1',
        createdBy: 'user-1',
      });

      await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=video2',
        title: 'Video 2',
        createdBy: 'user-1',
      });

      await repository.create({
        exerciseTemplateId: testExercise2.templateId,
        url: 'https://youtube.com/watch?v=video3',
        title: 'Video 3',
        createdBy: 'user-1',
      });

      const result = await repository.findAll();

      expect(result).toHaveLength(3);
    });
  });

  describe('findByCompositeKey', () => {
    it('should find video by composite key', async () => {
      const created = await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=test',
        title: 'Test Video',
        description: 'Test description',
        createdBy: 'user-1',
      });

      const result = await repository.findByCompositeKey(testExercise1.templateId, created.url);

      expect(result).toBeDefined();
      expect(result.exerciseTemplateId).toBe(testExercise1.templateId);
      expect(result.url).toBe(created.url);
      expect(result.title).toBe('Test Video');
      expect(result.description).toBe('Test description');
    });

    it('should return undefined when video not found', async () => {
      const result = await repository.findByCompositeKey(testExercise1.templateId, 'https://youtube.com/watch?v=nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('findByExerciseId', () => {
    it('should find all videos for a specific exercise', async () => {
      await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=ex1-video1',
        title: 'Exercise 1 Video 1',
        createdBy: 'user-1',
      });

      await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=ex1-video2',
        title: 'Exercise 1 Video 2',
        createdBy: 'user-1',
      });

      await repository.create({
        exerciseTemplateId: testExercise2.templateId,
        url: 'https://youtube.com/watch?v=ex2-video1',
        title: 'Exercise 2 Video 1',
        createdBy: 'user-1',
      });

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
      const created = await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=update-test',
        title: 'Original Title',
        createdBy: 'user-1',
      });

      const updateData = {
        title: 'Updated Title',
        description: 'New description',
        video_source: VideoSource.YOUTUBE,
      };

      const result = await repository.update(testExercise1.templateId, created.url, updateData);

      expect(result).toBeDefined();
      expect(result.exerciseTemplateId).toBe(testExercise1.templateId);
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe('New description');
      expect(result.video_source).toBe(VideoSource.YOUTUBE);
      expect(result.url).toBe('https://youtube.com/watch?v=update-test'); // Unchanged
    });

    it('should return undefined when updating non-existent video', async () => {
      const result = await repository.update(testExercise1.templateId, 'https://youtube.com/watch?v=nonexistent', {
        title: 'Updated Title',
      });

      expect(result).toBeUndefined();
    });

    it('should be able to clear optional fields', async () => {
      const created = await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=test',
        title: 'Some Title',
        description: 'Some description',
        video_source: VideoSource.YOUTUBE,
        createdBy: 'user-1',
      });

      const result = await repository.update(testExercise1.templateId, created.url, {
        title: null,
        description: null,
        video_source: null,
      });

      expect(result).toBeDefined();
      expect(result.title).toBeNull();
      expect(result.description).toBeNull();
      expect(result.video_source).toBeNull();
    });
  });

  describe('upsert', () => {
    it('should insert new video when it does not exist', async () => {
      const videoData = {
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/new-video',
        title: 'New Video',
        description: 'New video description',
        video_source: VideoSource.YOUTUBE,
        createdBy: 'user-1',
      };

      const result = await repository.upsert(videoData);

      expect(result).toBeDefined();
      expect(result.exerciseTemplateId).toBe(testExercise1.templateId);
      expect(result.url).toBe('https://youtube.com/new-video');
      expect(result.title).toBe('New Video');

      // Verify it was inserted
      const found = await repository.findByCompositeKey(testExercise1.templateId, 'https://youtube.com/new-video');
      expect(found).toBeDefined();
    });

    it('should update existing video when composite key exists', async () => {
      const videoData = {
        exerciseTemplateId: testExercise2.templateId,
        url: 'https://youtube.com/test-video',
        title: 'Original Title',
        createdBy: 'user-1',
      };

      await repository.create(videoData);

      const updatedData = {
        exerciseTemplateId: testExercise2.templateId,
        url: 'https://youtube.com/test-video',
        title: 'Updated Title',
        description: 'Updated description',
        video_source: VideoSource.OTHER,
        createdBy: 'user-2',
      };

      const result = await repository.upsert(updatedData);

      expect(result).toBeDefined();
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe('Updated description');
      expect(result.video_source).toBe(VideoSource.OTHER);
      expect(result.createdBy).toBe('user-2');

      // Verify only one record exists
      const videos = await repository.findByExerciseId(testExercise2.templateId);
      expect(videos).toHaveLength(1);
    });

    it('should handle multiple upserts with same composite key', async () => {
      const videoData = {
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/multi-upsert',
        title: 'Multi Upsert',
        createdBy: 'user-1',
      };

      // First upsert - insert
      const result1 = await repository.upsert(videoData);
      expect(result1.title).toBe('Multi Upsert');
      expect(result1.description).toBeNull();

      // Second upsert - update
      const result2 = await repository.upsert({
        ...videoData,
        title: 'Updated Title 1',
        description: 'First description',
      });
      expect(result2.title).toBe('Updated Title 1');
      expect(result2.description).toBe('First description');

      // Third upsert - another update
      const result3 = await repository.upsert({
        ...videoData,
        title: 'Updated Title 2',
        description: 'Second description',
        video_source: VideoSource.YOUTUBE,
      });
      expect(result3.title).toBe('Updated Title 2');
      expect(result3.description).toBe('Second description');

      // Verify correct video exists (there will be 2 videos for this exercise now)
      const videos = await repository.findByExerciseId(testExercise1.templateId);
      const multiUpsertVideo = videos.find((v) => v.url === 'https://youtube.com/multi-upsert');
      expect(multiUpsertVideo).toBeDefined();
      expect(multiUpsertVideo.title).toBe('Updated Title 2');
    });
  });

  describe('delete', () => {
    it('should delete video by composite key', async () => {
      const created = await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=delete-test',
        title: 'To Be Deleted',
        createdBy: 'user-1',
      });

      const result = await repository.delete(testExercise1.templateId, created.url);

      expect(result).toBeDefined();
      expect(result.exerciseTemplateId).toBe(testExercise1.templateId);
      expect(result.url).toBe(created.url);

      // Verify it's actually deleted
      const found = await repository.findByCompositeKey(testExercise1.templateId, created.url);
      expect(found).toBeUndefined();
    });

    it('should return undefined when deleting non-existent video', async () => {
      const result = await repository.delete(testExercise1.templateId, 'https://youtube.com/watch?v=nonexistent');
      expect(result).toBeUndefined();
    });

    it('should only delete specific video, not others', async () => {
      const video1 = await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=video1',
        title: 'Video 1',
        createdBy: 'user-1',
      });

      const video2 = await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=video2',
        title: 'Video 2',
        createdBy: 'user-1',
      });

      await repository.delete(testExercise1.templateId, video1.url);

      // Verify the other video still exists
      const found = await repository.findByCompositeKey(testExercise1.templateId, video2.url);
      expect(found).toBeDefined();
    });

    it('should delete and allow recreation with same url for same exercise', async () => {
      const created = await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=reusable',
        title: 'Original Video',
        createdBy: 'user-1',
      });

      await repository.delete(testExercise1.templateId, created.url);

      // Should be able to create new video with same exercise and url
      const newVideo = await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=reusable',
        title: 'New Video',
        createdBy: 'user-1',
      });

      expect(newVideo).toBeDefined();
      expect(newVideo.url).toBe(created.url);
    });
  });

  describe('cascading deletes', () => {
    it('should delete all videos when exercise is deleted', async () => {
      await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=video1',
        title: 'Video 1',
        createdBy: 'user-1',
      });

      await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        url: 'https://youtube.com/watch?v=video2',
        title: 'Video 2',
        createdBy: 'user-1',
      });

      await repository.create({
        exerciseTemplateId: testExercise2.templateId,
        url: 'https://youtube.com/watch?v=video3',
        title: 'Video 3',
        createdBy: 'user-1',
      });

      // Delete exercise 1
      await exerciseRepository.delete(testExercise1.templateId);

      // Verify all videos for exercise 1 are deleted
      const result = await repository.findByExerciseId(testExercise1.templateId);
      expect(result).toEqual([]);

      // Verify videos for exercise 2 still exist
      const exercise2Videos = await repository.findByExerciseId(testExercise2.templateId);
      expect(exercise2Videos).toHaveLength(1);
    });
  });
});
