import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumExerciseGroupMemberService } from './compendium-exercise-group-member.service';
import { CompendiumExerciseGroupMemberRepository } from '../../persistence/repositories/compendium-exercise-group-member.repository';
import { CompendiumExerciseGroupRepository } from '../../persistence/repositories/compendium-exercise-group.repository';
import { CompendiumExerciseRepository } from '../../persistence/repositories/compendium-exercise.repository';
import { provideTestDatabase } from '../../persistence/database';
import { ExerciseType, ForceType, Muscle, TechnicalDifficulty } from '@resitr/api';

describe('CompendiumExerciseGroupMemberService', () => {
  let service: CompendiumExerciseGroupMemberService;
  let repository: CompendiumExerciseGroupMemberRepository;
  let exerciseRepository: CompendiumExerciseRepository;
  let groupRepository: CompendiumExerciseGroupRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        provideTestDatabase(),
        CompendiumExerciseGroupMemberRepository,
        CompendiumExerciseGroupRepository,
        CompendiumExerciseRepository,
        CompendiumExerciseGroupMemberService,
      ],
    }).compile();

    service = module.get<CompendiumExerciseGroupMemberService>(CompendiumExerciseGroupMemberService);
    repository = module.get<CompendiumExerciseGroupMemberRepository>(CompendiumExerciseGroupMemberRepository);
    exerciseRepository = module.get<CompendiumExerciseRepository>(CompendiumExerciseRepository);
    groupRepository = module.get<CompendiumExerciseGroupRepository>(CompendiumExerciseGroupRepository);

    // Create test exercises to satisfy foreign key constraints
    await exerciseRepository.create({
      templateId: 'exercise-1',
      name: 'Bench Press',
      type: ExerciseType.STRENGTH,
      force: [ForceType.PUSH],
      primaryMuscles: [Muscle.CHEST],
      secondaryMuscles: [],
      technicalDifficulty: TechnicalDifficulty.BEGINNER,
      equipmentIds: [],
      bodyWeightScaling: 1,
      instructions: [],
      images: [],
      createdBy: 'user-1',
      version: 1,
    });

    await exerciseRepository.create({
      templateId: 'exercise-2',
      name: 'Squat',
      type: ExerciseType.STRENGTH,
      force: [ForceType.PUSH],
      primaryMuscles: [Muscle.QUADS],
      secondaryMuscles: [],
      technicalDifficulty: TechnicalDifficulty.INTERMEDIATE,
      equipmentIds: [],
      bodyWeightScaling: 1,
      instructions: [],
      images: [],
      createdBy: 'user-1',
      version: 1,
    });

    await exerciseRepository.create({
      templateId: 'exercise-3',
      name: 'Pull-up',
      type: ExerciseType.STRENGTH,
      force: [ForceType.PULL],
      primaryMuscles: [Muscle.LATS],
      secondaryMuscles: [],
      technicalDifficulty: TechnicalDifficulty.INTERMEDIATE,
      equipmentIds: [],
      bodyWeightScaling: 1,
      instructions: [],
      images: [],
      createdBy: 'user-1',
      version: 1,
    });

    // Create test groups
    await groupRepository.create({
      id: 'group-1',
      name: 'Upper Body',
      description: 'Upper body exercises',
      createdBy: 'user-1',
    });

    await groupRepository.create({
      id: 'group-2',
      name: 'Lower Body',
      description: 'Lower body exercises',
      createdBy: 'user-1',
    });

    await groupRepository.create({
      id: 'group-3',
      name: 'Compound Movements',
      description: 'Multi-joint exercises',
      createdBy: 'user-1',
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an exercise group member', async () => {
      const memberData = {
        exerciseTemplateId: 'exercise-1',
        groupId: 'group-1',
      };

      const result = await service.create(memberData, 'user-1');

      expect(result).toBeDefined();
      expect(result.exerciseTemplateId).toBe('exercise-1');
      expect(result.groupId).toBe('group-1');
      expect(result.addedBy).toBe('user-1');
      expect(result.addedAt).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all exercise group members', async () => {
      const member1 = {
        exerciseTemplateId: 'exercise-1',
        groupId: 'group-1',
      };

      const member2 = {
        exerciseTemplateId: 'exercise-2',
        groupId: 'group-2',
      };

      await service.create(member1, 'user-1');
      await service.create(member2, 'user-1');

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(
        result.some((m) => m.exerciseTemplateId === 'exercise-1' && m.groupId === 'group-1')
      ).toBe(true);
      expect(
        result.some((m) => m.exerciseTemplateId === 'exercise-2' && m.groupId === 'group-2')
      ).toBe(true);
    });

    it('should return empty array when no members exist', async () => {
      const result = await service.findAll();

      expect(result).toHaveLength(0);
    });
  });

  describe('findByExerciseId', () => {
    it('should find all groups an exercise belongs to', async () => {
      const member1 = {
        exerciseTemplateId: 'exercise-1',
        groupId: 'group-1',
      };

      const member2 = {
        exerciseTemplateId: 'exercise-1',
        groupId: 'group-3',
      };

      const member3 = {
        exerciseTemplateId: 'exercise-2',
        groupId: 'group-2',
      };

      await service.create(member1, 'user-1');
      await service.create(member2, 'user-1');
      await service.create(member3, 'user-1');

      const result = await service.findByExerciseId('exercise-1');

      expect(result).toHaveLength(2);
      expect(result.every((m) => m.exerciseTemplateId === 'exercise-1')).toBe(true);
      expect(result.some((m) => m.groupId === 'group-1')).toBe(true);
      expect(result.some((m) => m.groupId === 'group-3')).toBe(true);
    });

    it('should return empty array for exercise not in any groups', async () => {
      const result = await service.findByExerciseId('exercise-3');

      expect(result).toHaveLength(0);
    });
  });

  describe('findByGroupId', () => {
    it('should find all exercises in a group', async () => {
      const member1 = {
        exerciseTemplateId: 'exercise-1',
        groupId: 'group-1',
      };

      const member2 = {
        exerciseTemplateId: 'exercise-3',
        groupId: 'group-1',
      };

      const member3 = {
        exerciseTemplateId: 'exercise-2',
        groupId: 'group-2',
      };

      await service.create(member1, 'user-1');
      await service.create(member2, 'user-1');
      await service.create(member3, 'user-1');

      const result = await service.findByGroupId('group-1');

      expect(result).toHaveLength(2);
      expect(result.every((m) => m.groupId === 'group-1')).toBe(true);
      expect(result.some((m) => m.exerciseTemplateId === 'exercise-1')).toBe(true);
      expect(result.some((m) => m.exerciseTemplateId === 'exercise-3')).toBe(true);
    });

    it('should return empty array for group with no exercises', async () => {
      const result = await service.findByGroupId('group-3');

      expect(result).toHaveLength(0);
    });
  });

  describe('findByCompositeKey', () => {
    it('should find a specific exercise-group membership', async () => {
      const memberData = {
        exerciseTemplateId: 'exercise-1',
        groupId: 'group-1',
      };

      await service.create(memberData, 'user-1');

      const result = await service.findByCompositeKey('exercise-1', 'group-1');

      expect(result).toBeDefined();
      expect(result?.exerciseTemplateId).toBe('exercise-1');
      expect(result?.groupId).toBe('group-1');
      expect(result?.addedBy).toBe('user-1');
    });

    it('should return undefined for non-existent membership', async () => {
      const result = await service.findByCompositeKey('exercise-1', 'group-1');

      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete an exercise group member', async () => {
      const memberData = {
        exerciseTemplateId: 'exercise-1',
        groupId: 'group-1',
      };

      await service.create(memberData, 'user-1');

      const result = await service.delete('exercise-1', 'group-1');

      expect(result).toBeDefined();
      expect(result.exerciseTemplateId).toBe('exercise-1');
      expect(result.groupId).toBe('group-1');

      const found = await service.findByCompositeKey('exercise-1', 'group-1');
      expect(found).toBeUndefined();
    });
  });

  describe('upsert', () => {
    it('should insert a new membership if it does not exist', async () => {
      const memberData = {
        exerciseTemplateId: 'exercise-1',
        groupId: 'group-1',
      };

      const result = await service.upsert(memberData, 'user-1');

      expect(result).toBeDefined();
      expect(result.exerciseTemplateId).toBe('exercise-1');
      expect(result.groupId).toBe('group-1');
      expect(result.addedBy).toBe('user-1');
    });

    it('should update an existing membership', async () => {
      const memberData = {
        exerciseTemplateId: 'exercise-1',
        groupId: 'group-1',
      };

      await service.create(memberData, 'user-1');

      const upsertData = {
        exerciseTemplateId: 'exercise-1',
        groupId: 'group-1',
      };

      const result = await service.upsert(upsertData, 'user-2');

      expect(result).toBeDefined();
      expect(result.addedBy).toBe('user-2');

      const all = await service.findAll();
      const matches = all.filter(
        (m) => m.exerciseTemplateId === 'exercise-1' && m.groupId === 'group-1'
      );
      expect(matches).toHaveLength(1);
    });
  });
});
