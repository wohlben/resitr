import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumExerciseGroupService } from './compendium-exercise-group.service';
import { CompendiumExerciseGroupRepository } from '../../persistence/repositories/compendium-exercise-group.repository';
import { provideTestDatabase } from '../../persistence/database';

describe('CompendiumExerciseGroupService', () => {
  let service: CompendiumExerciseGroupService;
  let repository: CompendiumExerciseGroupRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        provideTestDatabase(),
        CompendiumExerciseGroupRepository,
        CompendiumExerciseGroupService,
      ],
    }).compile();

    service = module.get<CompendiumExerciseGroupService>(CompendiumExerciseGroupService);
    repository = module.get<CompendiumExerciseGroupRepository>(CompendiumExerciseGroupRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an exercise group', async () => {
      const groupData = {
        id: 'group-1',
        name: 'Upper Body',
        description: 'Upper body exercises',
      };

      const result = await service.create(groupData, 'user-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('group-1');
      expect(result.name).toBe('Upper Body');
      expect(result.description).toBe('Upper body exercises');
      expect(result.createdBy).toBe('user-1');
      expect(result.createdAt).toBeDefined();
    });

    it('should create an exercise group without optional description', async () => {
      const groupData = {
        id: 'group-2',
        name: 'Cardio',
      };

      const result = await service.create(groupData, 'user-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('group-2');
      expect(result.name).toBe('Cardio');
      expect(result.description).toBeNull();
      expect(result.createdBy).toBe('user-1');
    });
  });

  describe('findAll', () => {
    it('should return all exercise groups', async () => {
      const group1 = {
        id: 'group-1',
        name: 'Upper Body',
      };

      const group2 = {
        id: 'group-2',
        name: 'Lower Body',
      };

      await service.create(group1, 'user-1');
      await service.create(group2, 'user-1');

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result.some((g) => g.id === 'group-1')).toBe(true);
      expect(result.some((g) => g.id === 'group-2')).toBe(true);
    });

    it('should return empty array when no groups exist', async () => {
      const result = await service.findAll();

      expect(result).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should find an exercise group by id', async () => {
      const groupData = {
        id: 'group-1',
        name: 'Upper Body',
        description: 'All upper body exercises',
      };

      await service.create(groupData, 'user-1');

      const result = await service.findById('group-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('group-1');
      expect(result?.name).toBe('Upper Body');
      expect(result?.description).toBe('All upper body exercises');
    });

    it('should return undefined for non-existent id', async () => {
      const result = await service.findById('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('findByName', () => {
    it('should find an exercise group by name', async () => {
      const groupData = {
        id: 'group-1',
        name: 'Upper Body',
      };

      await service.create(groupData, 'user-1');

      const result = await service.findByName('Upper Body');

      expect(result).toBeDefined();
      expect(result?.id).toBe('group-1');
      expect(result?.name).toBe('Upper Body');
    });

    it('should return undefined for non-existent name', async () => {
      const result = await service.findByName('Non-existent Group');

      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update an exercise group', async () => {
      const groupData = {
        id: 'group-1',
        name: 'Upper Body',
        description: 'Initial description',
      };

      await service.create(groupData, 'user-1');

      const updateData = {
        name: 'Upper Body Strength',
        description: 'Updated description',
      };

      const result = await service.update('group-1', updateData);

      expect(result).toBeDefined();
      expect(result.name).toBe('Upper Body Strength');
      expect(result.description).toBe('Updated description');
      expect(result.updatedAt).toBeDefined();
    });

    it('should update only provided fields', async () => {
      const groupData = {
        id: 'group-1',
        name: 'Upper Body',
        description: 'Original description',
      };

      await service.create(groupData, 'user-1');

      const updateData = {
        name: 'Upper Body Modified',
      };

      const result = await service.update('group-1', updateData);

      expect(result.name).toBe('Upper Body Modified');
      expect(result.description).toBe('Original description');
    });
  });

  describe('delete', () => {
    it('should delete an exercise group', async () => {
      const groupData = {
        id: 'group-1',
        name: 'Upper Body',
      };

      await service.create(groupData, 'user-1');

      const result = await service.delete('group-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('group-1');

      const found = await service.findById('group-1');
      expect(found).toBeUndefined();
    });
  });

  describe('upsert', () => {
    it('should insert a new exercise group if it does not exist', async () => {
      const groupData = {
        id: 'group-1',
        name: 'Upper Body',
        description: 'New group',
      };

      const result = await service.upsert(groupData, 'user-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('group-1');
      expect(result.name).toBe('Upper Body');
      expect(result.description).toBe('New group');
      expect(result.createdBy).toBe('user-1');
    });

    it('should update an existing exercise group', async () => {
      const groupData = {
        id: 'group-1',
        name: 'Upper Body',
        description: 'Initial',
      };

      await service.create(groupData, 'user-1');

      const upsertData = {
        id: 'group-1',
        name: 'Upper Body Modified',
        description: 'Updated',
      };

      const result = await service.upsert(upsertData, 'user-2');

      expect(result).toBeDefined();
      expect(result.name).toBe('Upper Body Modified');
      expect(result.description).toBe('Updated');
      expect(result.updatedAt).toBeDefined();

      const all = await service.findAll();
      const matches = all.filter((g) => g.id === 'group-1');
      expect(matches).toHaveLength(1);
    });
  });
});
