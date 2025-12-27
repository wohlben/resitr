import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumExerciseGroupMemberRepository } from './compendium-exercise-group-member.repository';
import { CompendiumExerciseRepository } from './compendium-exercise.repository';
import { CompendiumExerciseGroupRepository } from './compendium-exercise-group.repository';
import { provideTestDatabase } from '../database';
import { mockExercise, mockExerciseGroup, mockExerciseGroupMember } from '../test-factories';

describe('CompendiumExerciseGroupMemberRepository', () => {
  let repository: CompendiumExerciseGroupMemberRepository;
  let exerciseRepository: CompendiumExerciseRepository;
  let groupRepository: CompendiumExerciseGroupRepository;

  let testExercise1: ReturnType<typeof mockExercise>;
  let testExercise2: ReturnType<typeof mockExercise>;

  // Use known IDs since we explicitly set them on creation
  const group1Id = 'group-1';
  const group2Id = 'group-2';

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
    testExercise1 = await exerciseRepository.create(mockExercise({ templateId: 'exercise-1' }));
    testExercise2 = await exerciseRepository.create(mockExercise({ templateId: 'exercise-2' }));

    // Create test groups
    await groupRepository.create(mockExerciseGroup({ id: group1Id, name: 'upper-body' }));
    await groupRepository.create(mockExerciseGroup({ id: group2Id, name: 'lower-body' }));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new group member', async () => {
      const memberData = mockExerciseGroupMember({
        exerciseTemplateId: testExercise1.templateId,
        groupId: group1Id,
      });

      const result = await repository.create(memberData);

      expect(result).toMatchObject(memberData);
      expect(result.addedAt).toBeDefined();
    });

    it('should create multiple members for same exercise in different groups', async () => {
      const result1 = await repository.create(mockExerciseGroupMember({
        exerciseTemplateId: testExercise1.templateId,
        groupId: group1Id,
      }));
      const result2 = await repository.create(mockExerciseGroupMember({
        exerciseTemplateId: testExercise1.templateId,
        groupId: group2Id,
      }));

      expect(result1.groupId).toBe(group1Id);
      expect(result2.groupId).toBe(group2Id);
    });

    it('should create multiple exercises in same group', async () => {
      const result1 = await repository.create(mockExerciseGroupMember({
        exerciseTemplateId: testExercise1.templateId,
        groupId: group1Id,
      }));
      const result2 = await repository.create(mockExerciseGroupMember({
        exerciseTemplateId: testExercise2.templateId,
        groupId: group1Id,
      }));

      expect(result1.exerciseTemplateId).toBe(testExercise1.templateId);
      expect(result2.exerciseTemplateId).toBe(testExercise2.templateId);
    });

    it('should fail when creating duplicate group member (same exerciseTemplateId and groupId)', async () => {
      await repository.create(mockExerciseGroupMember({
        exerciseTemplateId: testExercise1.templateId,
        groupId: group1Id,
      }));

      await expect(repository.create(mockExerciseGroupMember({
        exerciseTemplateId: testExercise1.templateId,
        groupId: group1Id,
      }))).rejects.toThrow();
    });

    it('should fail when creating member with non-existent exercise', async () => {
      await expect(repository.create(mockExerciseGroupMember({
        exerciseTemplateId: 'non-existent-exercise',
        groupId: group1Id,
      }))).rejects.toThrow();
    });

    it('should fail when creating member with non-existent group', async () => {
      await expect(repository.create(mockExerciseGroupMember({
        exerciseTemplateId: testExercise1.templateId,
        groupId: 'non-existent-group',
      }))).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return empty array when no group members exist', async () => {
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });

    it('should return all group members', async () => {
      await repository.create(mockExerciseGroupMember({
        exerciseTemplateId: testExercise1.templateId,
        groupId: group1Id,
      }));
      await repository.create(mockExerciseGroupMember({
        exerciseTemplateId: testExercise2.templateId,
        groupId: group1Id,
      }));
      await repository.create(mockExerciseGroupMember({
        exerciseTemplateId: testExercise1.templateId,
        groupId: group2Id,
      }));

      const result = await repository.findAll();

      expect(result).toHaveLength(3);
    });
  });

  describe('findByExerciseId', () => {
    it('should find all groups for a specific exercise', async () => {
      await repository.create(mockExerciseGroupMember({
        exerciseTemplateId: testExercise1.templateId,
        groupId: group1Id,
      }));
      await repository.create(mockExerciseGroupMember({
        exerciseTemplateId: testExercise1.templateId,
        groupId: group2Id,
      }));
      await repository.create(mockExerciseGroupMember({
        exerciseTemplateId: testExercise2.templateId,
        groupId: group1Id,
      }));

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
      await repository.create(mockExerciseGroupMember({
        exerciseTemplateId: testExercise1.templateId,
        groupId: group1Id,
      }));
      await repository.create(mockExerciseGroupMember({
        exerciseTemplateId: testExercise2.templateId,
        groupId: group1Id,
      }));
      await repository.create(mockExerciseGroupMember({
        exerciseTemplateId: testExercise1.templateId,
        groupId: group2Id,
      }));

      const result = await repository.findByGroupId(group1Id);

      expect(result).toHaveLength(2);
      expect(result.every((m) => m.groupId === group1Id)).toBe(true);
    });

    it('should return empty array when group has no exercises', async () => {
      const result = await repository.findByGroupId(group1Id);
      expect(result).toEqual([]);
    });
  });

  describe('findByCompositeKey', () => {
    it('should find a specific group member by composite key', async () => {
      const memberData = mockExerciseGroupMember({
        exerciseTemplateId: testExercise1.templateId,
        groupId: group1Id,
      });

      await repository.create(memberData);

      const result = await repository.findByCompositeKey(testExercise1.templateId, group1Id);

      expect(result).toMatchObject(memberData);
    });

    it('should return undefined when group member not found', async () => {
      const result = await repository.findByCompositeKey(testExercise1.templateId, group1Id);
      expect(result).toBeUndefined();
    });
  });

  describe('upsert', () => {
    it('should insert new group member when it does not exist', async () => {
      const memberData = mockExerciseGroupMember({
        exerciseTemplateId: testExercise1.templateId,
        groupId: group1Id,
      });

      const result = await repository.upsert(memberData);

      expect(result).toMatchObject(memberData);

      const found = await repository.findByCompositeKey(testExercise1.templateId, group1Id);
      expect(found).toBeDefined();
    });

    it('should update existing group member when composite key exists', async () => {
      await repository.create(mockExerciseGroupMember({
        exerciseTemplateId: testExercise1.templateId,
        groupId: group2Id,
        addedBy: 'user-1',
      }));

      const result = await repository.upsert(mockExerciseGroupMember({
        exerciseTemplateId: testExercise1.templateId,
        groupId: group2Id,
        addedBy: 'user-2',
      }));

      expect(result).toMatchObject({
        exerciseTemplateId: testExercise1.templateId,
        groupId: group2Id,
        addedBy: 'user-2',
      });

      const members = await repository.findByGroupId(group2Id);
      expect(members).toHaveLength(1);
    });

    it('should handle multiple upserts with same composite key', async () => {
      const memberData = mockExerciseGroupMember({
        exerciseTemplateId: testExercise2.templateId,
        groupId: group1Id,
        addedBy: 'user-1',
      });

      const result1 = await repository.upsert(memberData);
      expect(result1.addedBy).toBe('user-1');

      const result2 = await repository.upsert(mockExerciseGroupMember({
        exerciseTemplateId: testExercise2.templateId,
        groupId: group1Id,
        addedBy: 'user-2',
      }));
      expect(result2.addedBy).toBe('user-2');

      const members = await repository.findByExerciseId(testExercise2.templateId);
      expect(members).toHaveLength(1);
    });
  });

  describe('delete', () => {
    it('should delete a group member by composite key', async () => {
      await repository.create(mockExerciseGroupMember({
        exerciseTemplateId: testExercise1.templateId,
        groupId: group1Id,
      }));

      const result = await repository.delete(testExercise1.templateId, group1Id);

      expect(result).toMatchObject({
        exerciseTemplateId: testExercise1.templateId,
        groupId: group1Id,
      });

      const found = await repository.findByCompositeKey(testExercise1.templateId, group1Id);
      expect(found).toBeUndefined();
    });

    it('should return undefined when deleting non-existent group member', async () => {
      const result = await repository.delete(testExercise1.templateId, group1Id);
      expect(result).toBeUndefined();
    });

    it('should only delete specific group member, not others', async () => {
      await repository.create(mockExerciseGroupMember({
        exerciseTemplateId: testExercise1.templateId,
        groupId: group1Id,
      }));
      await repository.create(mockExerciseGroupMember({
        exerciseTemplateId: testExercise1.templateId,
        groupId: group2Id,
      }));

      await repository.delete(testExercise1.templateId, group1Id);

      const found = await repository.findByCompositeKey(testExercise1.templateId, group2Id);
      expect(found).toBeDefined();
    });
  });

  describe('cascading deletes', () => {
    it('should delete group members when exercise is deleted', async () => {
      await repository.create(mockExerciseGroupMember({
        exerciseTemplateId: testExercise1.templateId,
        groupId: group1Id,
      }));
      await repository.create(mockExerciseGroupMember({
        exerciseTemplateId: testExercise1.templateId,
        groupId: group2Id,
      }));

      await exerciseRepository.delete(testExercise1.templateId);

      const result = await repository.findByExerciseId(testExercise1.templateId);
      expect(result).toEqual([]);
    });

    it('should delete group members when group is deleted', async () => {
      await repository.create(mockExerciseGroupMember({
        exerciseTemplateId: testExercise1.templateId,
        groupId: group1Id,
      }));
      await repository.create(mockExerciseGroupMember({
        exerciseTemplateId: testExercise2.templateId,
        groupId: group1Id,
      }));

      await groupRepository.delete(group1Id);

      const result = await repository.findByGroupId(group1Id);
      expect(result).toEqual([]);
    });
  });
});
