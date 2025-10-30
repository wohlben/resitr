import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumExerciseGroupMemberRepository } from './compendium-exercise-group-member.repository';
import { CompendiumExerciseRepository } from './compendium-exercise.repository';
import { CompendiumExerciseGroupRepository } from './compendium-exercise-group.repository';
import { provideTestDatabase } from '../database';
import type { CompendiumExerciseGroupMember } from '../schemas';
import type { CompendiumExercise } from '../schemas';
import type { CompendiumExerciseGroup } from '../schemas';
import { ExerciseType, ForceType, Muscle, TechnicalDifficulty } from '@resitr/api';

describe('CompendiumExerciseGroupMemberRepository', () => {
  let repository: CompendiumExerciseGroupMemberRepository;
  let exerciseRepository: CompendiumExerciseRepository;
  let groupRepository: CompendiumExerciseGroupRepository;

  let testExercise1: CompendiumExercise;
  let testExercise2: CompendiumExercise;
  let testGroup1: CompendiumExerciseGroup;
  let testGroup2: CompendiumExerciseGroup;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        provideTestDatabase(),
        CompendiumExerciseGroupMemberRepository,
        CompendiumExerciseRepository,
        CompendiumExerciseGroupRepository,
      ],
    }).compile();

    repository = module.get<CompendiumExerciseGroupMemberRepository>(CompendiumExerciseGroupMemberRepository);
    exerciseRepository = module.get<CompendiumExerciseRepository>(CompendiumExerciseRepository);
    groupRepository = module.get<CompendiumExerciseGroupRepository>(CompendiumExerciseGroupRepository);

    // Create test exercises
    testExercise1 = await exerciseRepository.create({
      templateId: 'exercise-1',
      name: 'Bench Press',
      slug: 'bench-press',
      type: ExerciseType.STRENGTH,
      force: [ForceType.PUSH],
      primaryMuscles: [Muscle.CHEST],
      secondaryMuscles: [Muscle.TRICEPS, Muscle.FRONT_DELTS],
      technicalDifficulty: TechnicalDifficulty.INTERMEDIATE,
      equipmentIds: ['barbell', 'bench'],
      bodyWeightScaling: 0,
      instructions: ['Lie on bench', 'Lower bar to chest', 'Press up'],
      createdBy: 'user-1',
    });

    testExercise2 = await exerciseRepository.create({
      templateId: 'exercise-2',
      name: 'Squat',
      slug: 'squat',
      type: ExerciseType.STRENGTH,
      force: [ForceType.PUSH],
      primaryMuscles: [Muscle.QUADS],
      secondaryMuscles: [Muscle.GLUTES, Muscle.HAMSTRINGS],
      technicalDifficulty: TechnicalDifficulty.ADVANCED,
      equipmentIds: ['barbell'],
      bodyWeightScaling: 0,
      instructions: ['Stand with bar', 'Lower down', 'Stand up'],
      createdBy: 'user-1',
    });

    // Create test groups
    testGroup1 = await groupRepository.create({
      id: 'group-1',
      name: 'upper-body',
      description: 'Upper body exercises',
      createdBy: 'user-1',
    });

    testGroup2 = await groupRepository.create({
      id: 'group-2',
      name: 'lower-body',
      description: 'Lower body exercises',
      createdBy: 'user-1',
    });
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new group member', async () => {
      const memberData: CompendiumExerciseGroupMember = {
        exerciseTemplateId: testExercise1.templateId,
        groupId: testGroup1.id,
        addedBy: 'user-1',
      };

      const result = await repository.create(memberData);

      expect(result).toBeDefined();
      expect(result.exerciseTemplateId).toBe(testExercise1.templateId);
      expect(result.groupId).toBe(testGroup1.id);
      expect(result.addedBy).toBe('user-1');
      expect(result.addedAt).toBeDefined();
    });

    it('should create multiple members for same exercise in different groups', async () => {
      const member1: CompendiumExerciseGroupMember = {
        exerciseTemplateId: testExercise1.templateId,
        groupId: testGroup1.id,
        addedBy: 'user-1',
      };

      const member2: CompendiumExerciseGroupMember = {
        exerciseTemplateId: testExercise1.templateId,
        groupId: testGroup2.id,
        addedBy: 'user-1',
      };

      const result1 = await repository.create(member1);
      const result2 = await repository.create(member2);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1.groupId).toBe(testGroup1.id);
      expect(result2.groupId).toBe(testGroup2.id);
    });

    it('should create multiple exercises in same group', async () => {
      const member1: CompendiumExerciseGroupMember = {
        exerciseTemplateId: testExercise1.templateId,
        groupId: testGroup1.id,
        addedBy: 'user-1',
      };

      const member2: CompendiumExerciseGroupMember = {
        exerciseTemplateId: testExercise2.templateId,
        groupId: testGroup1.id,
        addedBy: 'user-1',
      };

      const result1 = await repository.create(member1);
      const result2 = await repository.create(member2);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1.exerciseTemplateId).toBe(testExercise1.templateId);
      expect(result2.exerciseTemplateId).toBe(testExercise2.templateId);
    });

    it('should fail when creating duplicate group member (same exerciseTemplateId and groupId)', async () => {
      const memberData: CompendiumExerciseGroupMember = {
        exerciseTemplateId: testExercise1.templateId,
        groupId: testGroup1.id,
        addedBy: 'user-1',
      };

      await repository.create(memberData);

      const duplicateData: CompendiumExerciseGroupMember = {
        exerciseTemplateId: testExercise1.templateId, // Same composite key
        groupId: testGroup1.id, // Same composite key
        addedBy: 'user-2',
      };

      await expect(repository.create(duplicateData)).rejects.toThrow();
    });

    it('should fail when creating member with non-existent exercise', async () => {
      const memberData: CompendiumExerciseGroupMember = {
        exerciseTemplateId: 'non-existent-exercise',
        groupId: testGroup1.id,
        addedBy: 'user-1',
      };

      await expect(repository.create(memberData)).rejects.toThrow();
    });

    it('should fail when creating member with non-existent group', async () => {
      const memberData: CompendiumExerciseGroupMember = {
        exerciseTemplateId: testExercise1.templateId,
        groupId: 'non-existent-group',
        addedBy: 'user-1',
      };

      await expect(repository.create(memberData)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return empty array when no group members exist', async () => {
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });

    it('should return all group members', async () => {
      await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        groupId: testGroup1.id,
        addedBy: 'user-1',
      });

      await repository.create({
        exerciseTemplateId: testExercise2.templateId,
        groupId: testGroup1.id,
        addedBy: 'user-1',
      });

      await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        groupId: testGroup2.id,
        addedBy: 'user-1',
      });

      const result = await repository.findAll();

      expect(result).toHaveLength(3);
    });
  });

  describe('findByExerciseId', () => {
    it('should find all groups for a specific exercise', async () => {
      await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        groupId: testGroup1.id,
        addedBy: 'user-1',
      });

      await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        groupId: testGroup2.id,
        addedBy: 'user-1',
      });

      await repository.create({
        exerciseTemplateId: testExercise2.templateId,
        groupId: testGroup1.id,
        addedBy: 'user-1',
      });

      const result = await repository.findByExerciseId(testExercise1.templateId);

      expect(result).toHaveLength(2);
      expect(result.every((m) => m.exerciseTemplateId === testExercise1.templateId)).toBe(true);
    });

    it('should return empty array when exercise has no groups', async () => {
      const result = await repository.findByExerciseId(testExercise1.templateId);
      expect(result).toEqual([]);
    });
  });

  describe('findByGroupId', () => {
    it('should find all exercises in a specific group', async () => {
      await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        groupId: testGroup1.id,
        addedBy: 'user-1',
      });

      await repository.create({
        exerciseTemplateId: testExercise2.templateId,
        groupId: testGroup1.id,
        addedBy: 'user-1',
      });

      await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        groupId: testGroup2.id,
        addedBy: 'user-1',
      });

      const result = await repository.findByGroupId(testGroup1.id);

      expect(result).toHaveLength(2);
      expect(result.every((m) => m.groupId === testGroup1.id)).toBe(true);
    });

    it('should return empty array when group has no exercises', async () => {
      const result = await repository.findByGroupId(testGroup1.id);
      expect(result).toEqual([]);
    });
  });

  describe('findByCompositeKey', () => {
    it('should find a specific group member by composite key', async () => {
      await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        groupId: testGroup1.id,
        addedBy: 'user-1',
      });

      const result = await repository.findByCompositeKey(testExercise1.templateId, testGroup1.id);

      expect(result).toBeDefined();
      expect(result.exerciseTemplateId).toBe(testExercise1.templateId);
      expect(result.groupId).toBe(testGroup1.id);
      expect(result.addedBy).toBe('user-1');
    });

    it('should return undefined when group member not found', async () => {
      const result = await repository.findByCompositeKey(testExercise1.templateId, testGroup1.id);
      expect(result).toBeUndefined();
    });
  });

  describe('upsert', () => {
    it('should insert new group member when it does not exist', async () => {
      const memberData = {
        exerciseTemplateId: testExercise1.templateId,
        groupId: testGroup1.id,
        addedBy: 'user-1',
      };

      const result = await repository.upsert(memberData);

      expect(result).toBeDefined();
      expect(result.exerciseTemplateId).toBe(testExercise1.templateId);
      expect(result.groupId).toBe(testGroup1.id);
      expect(result.addedBy).toBe('user-1');

      // Verify it was inserted
      const found = await repository.findByCompositeKey(testExercise1.templateId, testGroup1.id);
      expect(found).toBeDefined();
    });

    it('should update existing group member when composite key exists', async () => {
      const memberData = {
        exerciseTemplateId: testExercise1.templateId,
        groupId: testGroup2.id,
        addedBy: 'user-1',
      };

      await repository.create(memberData);

      const updatedData = {
        exerciseTemplateId: testExercise1.templateId,
        groupId: testGroup2.id,
        addedBy: 'user-2', // Changed addedBy
      };

      const result = await repository.upsert(updatedData);

      expect(result).toBeDefined();
      expect(result.exerciseTemplateId).toBe(testExercise1.templateId);
      expect(result.groupId).toBe(testGroup2.id);
      expect(result.addedBy).toBe('user-2');

      // Verify only one record exists for this composite key
      const members = await repository.findByGroupId(testGroup2.id);
      expect(members).toHaveLength(1);
    });

    it('should handle multiple upserts with same composite key', async () => {
      const memberData = {
        exerciseTemplateId: testExercise2.templateId,
        groupId: testGroup1.id,
        addedBy: 'user-1',
      };

      // First upsert - insert
      const result1 = await repository.upsert(memberData);
      expect(result1.addedBy).toBe('user-1');

      // Second upsert - update
      const result2 = await repository.upsert({
        ...memberData,
        addedBy: 'user-2',
      });
      expect(result2.addedBy).toBe('user-2');

      // Verify still only one record
      const members = await repository.findByExerciseId(testExercise2.templateId);
      expect(members).toHaveLength(1);
    });
  });

  describe('delete', () => {
    it('should delete a group member by composite key', async () => {
      await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        groupId: testGroup1.id,
        addedBy: 'user-1',
      });

      const result = await repository.delete(testExercise1.templateId, testGroup1.id);

      expect(result).toBeDefined();
      expect(result.exerciseTemplateId).toBe(testExercise1.templateId);
      expect(result.groupId).toBe(testGroup1.id);

      // Verify it's actually deleted
      const found = await repository.findByCompositeKey(testExercise1.templateId, testGroup1.id);
      expect(found).toBeUndefined();
    });

    it('should return undefined when deleting non-existent group member', async () => {
      const result = await repository.delete(testExercise1.templateId, testGroup1.id);
      expect(result).toBeUndefined();
    });

    it('should only delete specific group member, not others', async () => {
      await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        groupId: testGroup1.id,
        addedBy: 'user-1',
      });

      await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        groupId: testGroup2.id,
        addedBy: 'user-1',
      });

      await repository.delete(testExercise1.templateId, testGroup1.id);

      // Verify the other member still exists
      const found = await repository.findByCompositeKey(testExercise1.templateId, testGroup2.id);
      expect(found).toBeDefined();
    });
  });

  describe('cascading deletes', () => {
    it('should delete group members when exercise is deleted', async () => {
      await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        groupId: testGroup1.id,
        addedBy: 'user-1',
      });

      await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        groupId: testGroup2.id,
        addedBy: 'user-1',
      });

      // Delete the exercise
      await exerciseRepository.delete(testExercise1.templateId);

      // Verify all group members for that exercise are deleted
      const result = await repository.findByExerciseId(testExercise1.templateId);
      expect(result).toEqual([]);
    });

    it('should delete group members when group is deleted', async () => {
      await repository.create({
        exerciseTemplateId: testExercise1.templateId,
        groupId: testGroup1.id,
        addedBy: 'user-1',
      });

      await repository.create({
        exerciseTemplateId: testExercise2.templateId,
        groupId: testGroup1.id,
        addedBy: 'user-1',
      });

      // Delete the group
      await groupRepository.delete(testGroup1.id);

      // Verify all group members for that group are deleted
      const result = await repository.findByGroupId(testGroup1.id);
      expect(result).toEqual([]);
    });
  });
});
