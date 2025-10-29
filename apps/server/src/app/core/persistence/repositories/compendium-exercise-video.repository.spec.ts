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
      id: 'exercise-1',
      name: 'Bench Press',
      slug: 'bench-press',
      type: ExerciseType.STRENGTH,
      force: [ForceType.PUSH],
      primaryMuscles: [Muscle.CHEST],
      secondaryMuscles: [Muscle.TRICEPS],
      technicalDifficulty: TechnicalDifficulty.INTERMEDIATE,
      equipments: ['barbell', 'bench'],
      bodyWeightScaling: 0,
      instructions: ['Lie on bench', 'Press'],
      createdBy: 'user-1',
    });

    testExercise2 = await exerciseRepository.create({
      id: 'exercise-2',
      name: 'Squat',
      slug: 'squat',
      type: ExerciseType.STRENGTH,
      force: [ForceType.PUSH],
      primaryMuscles: [Muscle.QUADS],
      secondaryMuscles: [Muscle.GLUTES],
      technicalDifficulty: TechnicalDifficulty.ADVANCED,
      equipments: ['barbell'],
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
        compendiumExerciseId: testExercise1.id,
        url: 'https://youtube.com/watch?v=example1',
        title: 'How to Bench Press',
        description: 'A comprehensive guide to bench pressing',
        video_source: VideoSource.YOUTUBE,
        createdBy: 'user-1',
      };

      const result = await repository.create(videoData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.compendiumExerciseId).toBe(testExercise1.id);
      expect(result.url).toBe('https://youtube.com/watch?v=example1');
      expect(result.title).toBe('How to Bench Press');
      expect(result.description).toBe('A comprehensive guide to bench pressing');
      expect(result.video_source).toBe(VideoSource.YOUTUBE);
      expect(result.createdBy).toBe('user-1');
      expect(result.createdAt).toBeDefined();
    });

    it('should create video with minimal required fields', async () => {
      const videoData: CompendiumExerciseVideo = {
        compendiumExerciseId: testExercise1.id,
        url: 'https://youtube.com/watch?v=example2',
        createdBy: 'user-1',
      };

      const result = await repository.create(videoData);

      expect(result).toBeDefined();
      expect(result.compendiumExerciseId).toBe(testExercise1.id);
      expect(result.url).toBe('https://youtube.com/watch?v=example2');
      expect(result.title).toBeNull();
      expect(result.description).toBeNull();
      expect(result.video_source).toBeNull();
    });

    it('should create multiple videos for same exercise', async () => {
      const video1: CompendiumExerciseVideo = {
        compendiumExerciseId: testExercise1.id,
        url: 'https://youtube.com/watch?v=video1',
        title: 'Video 1',
        createdBy: 'user-1',
      };

      const video2: CompendiumExerciseVideo = {
        compendiumExerciseId: testExercise1.id,
        url: 'https://youtube.com/watch?v=video2',
        title: 'Video 2',
        createdBy: 'user-1',
      };

      const result1 = await repository.create(video1);
      const result2 = await repository.create(video2);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1.id).not.toBe(result2.id);
    });

    it('should create videos with different video sources', async () => {
      const youtubeVideo: CompendiumExerciseVideo = {
        compendiumExerciseId: testExercise1.id,
        url: 'https://youtube.com/watch?v=abc',
        video_source: VideoSource.YOUTUBE,
        createdBy: 'user-1',
      };

      const tiktokVideo: CompendiumExerciseVideo = {
        compendiumExerciseId: testExercise1.id,
        url: 'https://tiktok.com/@user/video/123',
        video_source: VideoSource.TIKTOK,
        createdBy: 'user-1',
      };

      const otherVideo: CompendiumExerciseVideo = {
        compendiumExerciseId: testExercise1.id,
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
        compendiumExerciseId: testExercise1.id,
        url: 'https://youtube.com/watch?v=duplicate',
        createdBy: 'user-1',
      };

      await repository.create(videoData);

      const duplicateData: CompendiumExerciseVideo = {
        compendiumExerciseId: testExercise1.id, // Same exercise
        url: 'https://youtube.com/watch?v=duplicate', // Same URL
        title: 'Different Title',
        createdBy: 'user-2',
      };

      await expect(repository.create(duplicateData)).rejects.toThrow();
    });

    it('should allow same url for different exercises', async () => {
      const video1: CompendiumExerciseVideo = {
        compendiumExerciseId: testExercise1.id,
        url: 'https://youtube.com/watch?v=shared',
        createdBy: 'user-1',
      };

      const video2: CompendiumExerciseVideo = {
        compendiumExerciseId: testExercise2.id, // Different exercise
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
        compendiumExerciseId: 'non-existent-exercise',
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
        compendiumExerciseId: testExercise1.id,
        url: 'https://youtube.com/watch?v=video1',
        title: 'Video 1',
        createdBy: 'user-1',
      });

      await repository.create({
        compendiumExerciseId: testExercise1.id,
        url: 'https://youtube.com/watch?v=video2',
        title: 'Video 2',
        createdBy: 'user-1',
      });

      await repository.create({
        compendiumExerciseId: testExercise2.id,
        url: 'https://youtube.com/watch?v=video3',
        title: 'Video 3',
        createdBy: 'user-1',
      });

      const result = await repository.findAll();

      expect(result).toHaveLength(3);
    });
  });

  describe('findById', () => {
    it('should find video by id', async () => {
      const created = await repository.create({
        compendiumExerciseId: testExercise1.id,
        url: 'https://youtube.com/watch?v=test',
        title: 'Test Video',
        description: 'Test description',
        createdBy: 'user-1',
      });

      const result = await repository.findById(created.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
      expect(result.title).toBe('Test Video');
      expect(result.description).toBe('Test description');
    });

    it('should return undefined when video not found', async () => {
      const result = await repository.findById(999999);
      expect(result).toBeUndefined();
    });
  });

  describe('findByExerciseId', () => {
    it('should find all videos for a specific exercise', async () => {
      await repository.create({
        compendiumExerciseId: testExercise1.id,
        url: 'https://youtube.com/watch?v=ex1-video1',
        title: 'Exercise 1 Video 1',
        createdBy: 'user-1',
      });

      await repository.create({
        compendiumExerciseId: testExercise1.id,
        url: 'https://youtube.com/watch?v=ex1-video2',
        title: 'Exercise 1 Video 2',
        createdBy: 'user-1',
      });

      await repository.create({
        compendiumExerciseId: testExercise2.id,
        url: 'https://youtube.com/watch?v=ex2-video1',
        title: 'Exercise 2 Video 1',
        createdBy: 'user-1',
      });

      const result = await repository.findByExerciseId(testExercise1.id);

      expect(result).toHaveLength(2);
      expect(result.every((v) => v.compendiumExerciseId === testExercise1.id)).toBe(true);
    });

    it('should return empty array when exercise has no videos', async () => {
      const result = await repository.findByExerciseId(testExercise1.id);
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update video fields', async () => {
      const created = await repository.create({
        compendiumExerciseId: testExercise1.id,
        url: 'https://youtube.com/watch?v=update-test',
        title: 'Original Title',
        createdBy: 'user-1',
      });

      const updateData = {
        title: 'Updated Title',
        description: 'New description',
        video_source: VideoSource.YOUTUBE,
      };

      const result = await repository.update(created.id, updateData);

      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe('New description');
      expect(result.video_source).toBe(VideoSource.YOUTUBE);
      expect(result.url).toBe('https://youtube.com/watch?v=update-test'); // Unchanged
    });

    it('should update url field', async () => {
      const created = await repository.create({
        compendiumExerciseId: testExercise1.id,
        url: 'https://youtube.com/watch?v=old',
        title: 'Test Video',
        createdBy: 'user-1',
      });

      const result = await repository.update(created.id, {
        url: 'https://youtube.com/watch?v=new',
      });

      expect(result).toBeDefined();
      expect(result.url).toBe('https://youtube.com/watch?v=new');
      expect(result.title).toBe('Test Video'); // Unchanged
    });

    it('should return undefined when updating non-existent video', async () => {
      const result = await repository.update(999999, {
        title: 'Updated Title',
      });

      expect(result).toBeUndefined();
    });

    it('should be able to clear optional fields', async () => {
      const created = await repository.create({
        compendiumExerciseId: testExercise1.id,
        url: 'https://youtube.com/watch?v=test',
        title: 'Some Title',
        description: 'Some description',
        video_source: VideoSource.YOUTUBE,
        createdBy: 'user-1',
      });

      const result = await repository.update(created.id, {
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

  describe('delete', () => {
    it('should delete video by id', async () => {
      const created = await repository.create({
        compendiumExerciseId: testExercise1.id,
        url: 'https://youtube.com/watch?v=delete-test',
        title: 'To Be Deleted',
        createdBy: 'user-1',
      });

      const result = await repository.delete(created.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);

      // Verify it's actually deleted
      const found = await repository.findById(created.id);
      expect(found).toBeUndefined();
    });

    it('should return undefined when deleting non-existent video', async () => {
      const result = await repository.delete(999999);
      expect(result).toBeUndefined();
    });

    it('should only delete specific video, not others', async () => {
      const video1 = await repository.create({
        compendiumExerciseId: testExercise1.id,
        url: 'https://youtube.com/watch?v=video1',
        title: 'Video 1',
        createdBy: 'user-1',
      });

      const video2 = await repository.create({
        compendiumExerciseId: testExercise1.id,
        url: 'https://youtube.com/watch?v=video2',
        title: 'Video 2',
        createdBy: 'user-1',
      });

      await repository.delete(video1.id);

      // Verify the other video still exists
      const found = await repository.findById(video2.id);
      expect(found).toBeDefined();
    });

    it('should delete and allow recreation with same url for same exercise', async () => {
      const created = await repository.create({
        compendiumExerciseId: testExercise1.id,
        url: 'https://youtube.com/watch?v=reusable',
        title: 'Original Video',
        createdBy: 'user-1',
      });

      await repository.delete(created.id);

      // Should be able to create new video with same exercise and url
      const newVideo = await repository.create({
        compendiumExerciseId: testExercise1.id,
        url: 'https://youtube.com/watch?v=reusable',
        title: 'New Video',
        createdBy: 'user-1',
      });

      expect(newVideo).toBeDefined();
      expect(newVideo.id).not.toBe(created.id);
    });
  });

  describe('cascading deletes', () => {
    it('should delete all videos when exercise is deleted', async () => {
      await repository.create({
        compendiumExerciseId: testExercise1.id,
        url: 'https://youtube.com/watch?v=video1',
        title: 'Video 1',
        createdBy: 'user-1',
      });

      await repository.create({
        compendiumExerciseId: testExercise1.id,
        url: 'https://youtube.com/watch?v=video2',
        title: 'Video 2',
        createdBy: 'user-1',
      });

      await repository.create({
        compendiumExerciseId: testExercise2.id,
        url: 'https://youtube.com/watch?v=video3',
        title: 'Video 3',
        createdBy: 'user-1',
      });

      // Delete exercise 1
      await exerciseRepository.delete(testExercise1.id);

      // Verify all videos for exercise 1 are deleted
      const result = await repository.findByExerciseId(testExercise1.id);
      expect(result).toEqual([]);

      // Verify videos for exercise 2 still exist
      const exercise2Videos = await repository.findByExerciseId(testExercise2.id);
      expect(exercise2Videos).toHaveLength(1);
    });
  });

  describe('auto-increment id', () => {
    it('should auto-increment id for each new video', async () => {
      const video1 = await repository.create({
        compendiumExerciseId: testExercise1.id,
        url: 'https://youtube.com/watch?v=auto1',
        createdBy: 'user-1',
      });

      const video2 = await repository.create({
        compendiumExerciseId: testExercise1.id,
        url: 'https://youtube.com/watch?v=auto2',
        createdBy: 'user-1',
      });

      const video3 = await repository.create({
        compendiumExerciseId: testExercise2.id,
        url: 'https://youtube.com/watch?v=auto3',
        createdBy: 'user-1',
      });

      expect(video1.id).toBeDefined();
      expect(video2.id).toBeDefined();
      expect(video3.id).toBeDefined();
      expect(video2.id).toBeGreaterThan(video1.id);
      expect(video3.id).toBeGreaterThan(video2.id);
    });
  });
});
