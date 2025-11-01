import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumExerciseGroupMemberService } from './compendium-exercise-group-member.service';
import { CompendiumExerciseGroupMemberRepository } from '../../persistence/repositories/compendium-exercise-group-member.repository';
import { CompendiumExerciseGroupRepository } from '../../persistence/repositories/compendium-exercise-group.repository';
import { CompendiumExerciseRepository } from '../../persistence/repositories/compendium-exercise.repository';
import { provideTestDatabase } from '../../persistence/database';
import { mockExercise, mockExerciseGroup } from '../../persistence/test-factories';

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

    // Create test exercises
    await exerciseRepository.create(mockExercise({ templateId: 'exercise-1' }));
    await exerciseRepository.create(mockExercise({ templateId: 'exercise-2' }));
    await exerciseRepository.create(mockExercise({ templateId: 'exercise-3' }));

    // Create test groups
    await groupRepository.create(mockExerciseGroup({ id: 'group-1', name: 'Upper Body' }));
    await groupRepository.create(mockExerciseGroup({ id: 'group-2', name: 'Lower Body' }));
    await groupRepository.create(mockExerciseGroup({ id: 'group-3', name: 'Compound Movements' }));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an exercise group member', async () => {
      const result = await service.create({
        exerciseTemplateId: 'exercise-1',
        groupId: 'group-1',
      }, 'user-1');

      expect(result).toMatchObject({
        exerciseTemplateId: 'exercise-1',
        groupId: 'group-1',
        addedBy: 'user-1',
      });
      expect(result.addedAt).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all exercise group members', async () => {
      await service.create({ exerciseTemplateId: 'exercise-1', groupId: 'group-1' }, 'user-1');
      await service.create({ exerciseTemplateId: 'exercise-2', groupId: 'group-2' }, 'user-1');

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result.some((m) => m.exerciseTemplateId === 'exercise-1' && m.groupId === 'group-1')).toBe(true);
      expect(result.some((m) => m.exerciseTemplateId === 'exercise-2' && m.groupId === 'group-2')).toBe(true);
    });

    it('should return empty array when no members exist', async () => {
      const result = await service.findAll();
      expect(result).toHaveLength(0);
    });
  });

  describe('findByExerciseId', () => {
    it('should find all groups an exercise belongs to', async () => {
      await service.create({ exerciseTemplateId: 'exercise-1', groupId: 'group-1' }, 'user-1');
      await service.create({ exerciseTemplateId: 'exercise-1', groupId: 'group-3' }, 'user-1');
      await service.create({ exerciseTemplateId: 'exercise-2', groupId: 'group-2' }, 'user-1');

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
      await service.create({ exerciseTemplateId: 'exercise-1', groupId: 'group-1' }, 'user-1');
      await service.create({ exerciseTemplateId: 'exercise-3', groupId: 'group-1' }, 'user-1');
      await service.create({ exerciseTemplateId: 'exercise-2', groupId: 'group-2' }, 'user-1');

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
      await service.create({
        exerciseTemplateId: 'exercise-1',
        groupId: 'group-1',
      }, 'user-1');

      const result = await service.findByCompositeKey('exercise-1', 'group-1');

      expect(result).toMatchObject({
        exerciseTemplateId: 'exercise-1',
        groupId: 'group-1',
        addedBy: 'user-1',
      });
    });

    it('should return undefined for non-existent membership', async () => {
      const result = await service.findByCompositeKey('exercise-1', 'group-1');
      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete an exercise group member', async () => {
      await service.create({
        exerciseTemplateId: 'exercise-1',
        groupId: 'group-1',
      }, 'user-1');

      const result = await service.delete('exercise-1', 'group-1');

      expect(result).toMatchObject({
        exerciseTemplateId: 'exercise-1',
        groupId: 'group-1',
      });

      const found = await service.findByCompositeKey('exercise-1', 'group-1');
      expect(found).toBeUndefined();
    });
  });

  describe('upsert', () => {
    it('should insert a new membership if it does not exist', async () => {
      const result = await service.upsert({
        exerciseTemplateId: 'exercise-1',
        groupId: 'group-1',
      }, 'user-1');

      expect(result).toMatchObject({
        exerciseTemplateId: 'exercise-1',
        groupId: 'group-1',
        addedBy: 'user-1',
      });
    });

    it('should update an existing membership', async () => {
      await service.create({
        exerciseTemplateId: 'exercise-1',
        groupId: 'group-1',
      }, 'user-1');

      const result = await service.upsert({
        exerciseTemplateId: 'exercise-1',
        groupId: 'group-1',
      }, 'user-2');

      expect(result).toMatchObject({ addedBy: 'user-2' });

      const all = await service.findAll();
      const matches = all.filter((m) => m.exerciseTemplateId === 'exercise-1' && m.groupId === 'group-1');
      expect(matches).toHaveLength(1);
    });
  });
});
