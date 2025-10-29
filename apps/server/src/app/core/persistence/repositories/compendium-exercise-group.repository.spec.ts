import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumExerciseGroupRepository } from './compendium-exercise-group.repository';
import { provideTestDatabase } from '../database';
import type { CompendiumExerciseGroup } from '../schemas';

describe('CompendiumExerciseGroupRepository', () => {
  let repository: CompendiumExerciseGroupRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [provideTestDatabase(), CompendiumExerciseGroupRepository],
    }).compile();

    repository = module.get<CompendiumExerciseGroupRepository>(CompendiumExerciseGroupRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new exercise group', async () => {
      const groupData: CompendiumExerciseGroup = {
        id: 'group-1',
        name: 'upper-body-push',
        description: 'Upper body pushing exercises',
        createdBy: 'user-1',
      };

      const result = await repository.create(groupData);

      expect(result).toBeDefined();
      expect(result.id).toBe(groupData.id);
      expect(result.name).toBe(groupData.name);
      expect(result.description).toBe(groupData.description);
      expect(result.createdBy).toBe(groupData.createdBy);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeNull();
    });

    it('should create exercise group with minimal required fields', async () => {
      const groupData: CompendiumExerciseGroup = {
        id: 'group-2',
        name: 'leg-exercises',
        createdBy: 'user-1',
      };

      const result = await repository.create(groupData);

      expect(result).toBeDefined();
      expect(result.id).toBe(groupData.id);
      expect(result.name).toBe(groupData.name);
      expect(result.description).toBeNull();
      expect(result.createdBy).toBe(groupData.createdBy);
    });

    it('should fail when creating exercise group with duplicate id', async () => {
      const groupData: CompendiumExerciseGroup = {
        id: 'group-3',
        name: 'core-exercises',
        createdBy: 'user-1',
      };

      await repository.create(groupData);

      const duplicateData: CompendiumExerciseGroup = {
        id: 'group-3', // Same id
        name: 'different-name',
        createdBy: 'user-1',
      };

      await expect(repository.create(duplicateData)).rejects.toThrow();
    });

    it('should fail when creating exercise group with duplicate name', async () => {
      const groupData: CompendiumExerciseGroup = {
        id: 'group-4',
        name: 'cardio-exercises',
        createdBy: 'user-1',
      };

      await repository.create(groupData);

      const duplicateData: CompendiumExerciseGroup = {
        id: 'group-5',
        name: 'cardio-exercises', // Same name
        createdBy: 'user-1',
      };

      await expect(repository.create(duplicateData)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return empty array when no exercise groups exist', async () => {
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });

    it('should return all exercise groups', async () => {
      const group1: CompendiumExerciseGroup = {
        id: 'group-1',
        name: 'push-exercises',
        description: 'Pushing movements',
        createdBy: 'user-1',
      };

      const group2: CompendiumExerciseGroup = {
        id: 'group-2',
        name: 'pull-exercises',
        description: 'Pulling movements',
        createdBy: 'user-1',
      };

      await repository.create(group1);
      await repository.create(group2);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('push-exercises');
      expect(result[1].name).toBe('pull-exercises');
    });
  });

  describe('findById', () => {
    it('should find exercise group by id', async () => {
      const groupData: CompendiumExerciseGroup = {
        id: 'group-1',
        name: 'leg-day',
        description: 'Leg exercises collection',
        createdBy: 'user-1',
      };

      await repository.create(groupData);

      const result = await repository.findById('group-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('group-1');
      expect(result.name).toBe('leg-day');
      expect(result.description).toBe('Leg exercises collection');
    });

    it('should return undefined when exercise group not found', async () => {
      const result = await repository.findById('non-existent-id');
      expect(result).toBeUndefined();
    });
  });

  describe('findByName', () => {
    it('should find exercise group by name', async () => {
      const groupData: CompendiumExerciseGroup = {
        id: 'group-1',
        name: 'compound-movements',
        description: 'Big compound exercises',
        createdBy: 'user-1',
      };

      await repository.create(groupData);

      const result = await repository.findByName('compound-movements');

      expect(result).toBeDefined();
      expect(result.name).toBe('compound-movements');
      expect(result.id).toBe('group-1');
    });

    it('should return undefined when exercise group not found by name', async () => {
      const result = await repository.findByName('non-existent-name');
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update exercise group fields', async () => {
      const groupData: CompendiumExerciseGroup = {
        id: 'group-1',
        name: 'stretching',
        createdBy: 'user-1',
      };

      await repository.create(groupData);

      const updateData = {
        description: 'Flexibility and mobility exercises',
      };

      const result = await repository.update('group-1', updateData);

      expect(result).toBeDefined();
      expect(result.id).toBe('group-1');
      expect(result.name).toBe('stretching'); // Unchanged
      expect(result.description).toBe('Flexibility and mobility exercises'); // Updated
      expect(result.updatedAt).toBeDefined();
    });

    it('should update name field', async () => {
      const groupData: CompendiumExerciseGroup = {
        id: 'group-1',
        name: 'old-name',
        description: 'Original description',
        createdBy: 'user-1',
      };

      await repository.create(groupData);

      const result = await repository.update('group-1', {
        name: 'new-name',
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('new-name');
      expect(result.description).toBe('Original description'); // Unchanged
    });

    it('should return undefined when updating non-existent exercise group', async () => {
      const result = await repository.update('non-existent-id', {
        description: 'Updated Description',
      });

      expect(result).toBeUndefined();
    });

    it('should be able to clear optional fields', async () => {
      const groupData: CompendiumExerciseGroup = {
        id: 'group-1',
        name: 'test-group',
        description: 'Some description',
        createdBy: 'user-1',
      };

      await repository.create(groupData);

      const result = await repository.update('group-1', {
        description: null,
      });

      expect(result).toBeDefined();
      expect(result.description).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete exercise group by id', async () => {
      const groupData: CompendiumExerciseGroup = {
        id: 'group-1',
        name: 'to-be-deleted',
        description: 'This will be deleted',
        createdBy: 'user-1',
      };

      await repository.create(groupData);

      const result = await repository.delete('group-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('group-1');

      // Verify it's actually deleted
      const found = await repository.findById('group-1');
      expect(found).toBeUndefined();
    });

    it('should return undefined when deleting non-existent exercise group', async () => {
      const result = await repository.delete('non-existent-id');
      expect(result).toBeUndefined();
    });

    it('should delete and allow recreation with same name', async () => {
      const groupData: CompendiumExerciseGroup = {
        id: 'group-1',
        name: 'reusable-name',
        createdBy: 'user-1',
      };

      await repository.create(groupData);
      await repository.delete('group-1');

      // Should be able to create new group with same name
      const newGroupData: CompendiumExerciseGroup = {
        id: 'group-2',
        name: 'reusable-name',
        createdBy: 'user-2',
      };

      const result = await repository.create(newGroupData);
      expect(result).toBeDefined();
      expect(result.id).toBe('group-2');
    });
  });
});
