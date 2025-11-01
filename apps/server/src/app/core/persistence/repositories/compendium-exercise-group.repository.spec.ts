import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumExerciseGroupRepository } from './compendium-exercise-group.repository';
import { provideTestDatabase } from '../database';
import { mockExerciseGroup } from '../test-factories';

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
      const groupData = mockExerciseGroup({
        id: 'group-1',
        name: 'upper-body-push',
        description: 'Upper body pushing exercises',
      });

      const result = await repository.create(groupData);

      expect(result).toMatchObject(groupData);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeNull();
    });

    it('should create exercise group with minimal required fields', async () => {
      const groupData = mockExerciseGroup({
        id: 'group-2',
        name: 'leg-exercises',
        description: null,
      });

      const result = await repository.create(groupData);

      expect(result).toMatchObject(groupData);
    });

    it('should fail when creating exercise group with duplicate id', async () => {
      await repository.create(mockExerciseGroup({ id: 'group-3' }));

      await expect(repository.create(mockExerciseGroup({ id: 'group-3' }))).rejects.toThrow();
    });

    it('should fail when creating exercise group with duplicate name', async () => {
      await repository.create(mockExerciseGroup({ id: 'group-4', name: 'cardio-exercises' }));

      await expect(repository.create(mockExerciseGroup({ id: 'group-5', name: 'cardio-exercises' }))).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return empty array when no exercise groups exist', async () => {
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });

    it('should return all exercise groups', async () => {
      await repository.create(mockExerciseGroup({ id: 'group-1', name: 'push-exercises' }));
      await repository.create(mockExerciseGroup({ id: 'group-2', name: 'pull-exercises' }));

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('push-exercises');
      expect(result[1].name).toBe('pull-exercises');
    });
  });

  describe('findById', () => {
    it('should find exercise group by id', async () => {
      const groupData = mockExerciseGroup({
        id: 'group-1',
        name: 'leg-day',
        description: 'Leg exercises collection',
      });

      await repository.create(groupData);

      const result = await repository.findById('group-1');

      expect(result).toMatchObject(groupData);
    });

    it('should return undefined when exercise group not found', async () => {
      const result = await repository.findById('non-existent-id');
      expect(result).toBeUndefined();
    });
  });

  describe('findByName', () => {
    it('should find exercise group by name', async () => {
      const groupData = mockExerciseGroup({
        id: 'group-1',
        name: 'compound-movements',
        description: 'Big compound exercises',
      });

      await repository.create(groupData);

      const result = await repository.findByName('compound-movements');

      expect(result).toMatchObject(groupData);
    });

    it('should return undefined when exercise group not found by name', async () => {
      const result = await repository.findByName('non-existent-name');
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update exercise group fields', async () => {
      await repository.create(mockExerciseGroup({ id: 'group-1', name: 'stretching' }));

      const result = await repository.update('group-1', {
        description: 'Flexibility and mobility exercises',
      });

      expect(result).toMatchObject({
        name: 'stretching',
        description: 'Flexibility and mobility exercises',
      });
      expect(result.updatedAt).toBeDefined();
    });

    it('should update name field', async () => {
      await repository.create(mockExerciseGroup({
        id: 'group-1',
        name: 'old-name',
        description: 'Original description',
      }));

      const result = await repository.update('group-1', {
        name: 'new-name',
      });

      expect(result).toMatchObject({
        name: 'new-name',
        description: 'Original description',
      });
    });

    it('should return undefined when updating non-existent exercise group', async () => {
      const result = await repository.update('non-existent-id', {
        description: 'Updated Description',
      });

      expect(result).toBeUndefined();
    });

    it('should be able to clear optional fields', async () => {
      await repository.create(mockExerciseGroup({
        id: 'group-1',
        description: 'Some description',
      }));

      const result = await repository.update('group-1', {
        description: null,
      });

      expect(result.description).toBeNull();
    });
  });

  describe('upsert', () => {
    it('should insert new exercise group when it does not exist', async () => {
      const groupData = mockExerciseGroup({
        id: 'upsert-group-1',
        name: 'upsert-test-group',
        description: 'Test upsert functionality',
      });

      const result = await repository.upsert(groupData);

      expect(result).toMatchObject(groupData);
      expect(result.updatedAt).toBeNull();

      const found = await repository.findById('upsert-group-1');
      expect(found).toBeDefined();
    });

    it('should update existing exercise group and set updatedAt', async () => {
      const created = await repository.create(mockExerciseGroup({
        id: 'upsert-group-2',
        name: 'original-name',
        description: 'Original description',
      }));
      expect(created.updatedAt).toBeNull();

      const result = await repository.upsert(mockExerciseGroup({
        id: 'upsert-group-2',
        name: 'updated-name',
        description: 'Updated description',
      }));

      expect(result).toMatchObject({
        name: 'updated-name',
        description: 'Updated description',
      });
      expect(result.updatedAt).toBeDefined();

      const allGroups = await repository.findAll();
      expect(allGroups).toHaveLength(1);
    });

    it('should handle multiple upserts in sequence', async () => {
      const groupData = mockExerciseGroup({
        id: 'upsert-group-3',
        name: 'multi-upsert',
        description: null,
      });

      const result1 = await repository.upsert(groupData);
      expect(result1.description).toBeNull();

      const result2 = await repository.upsert(mockExerciseGroup({
        id: 'upsert-group-3',
        name: 'multi-upsert',
        description: 'First update',
      }));
      expect(result2.description).toBe('First update');

      const result3 = await repository.upsert(mockExerciseGroup({
        id: 'upsert-group-3',
        name: 'multi-upsert',
        description: 'Second update',
      }));
      expect(result3.description).toBe('Second update');

      const allGroups = await repository.findAll();
      expect(allGroups).toHaveLength(1);
    });
  });

  describe('delete', () => {
    it('should delete exercise group by id', async () => {
      await repository.create(mockExerciseGroup({
        id: 'group-1',
        name: 'to-be-deleted',
        description: 'This will be deleted',
      }));

      const result = await repository.delete('group-1');

      expect(result).toMatchObject({ id: 'group-1' });

      const found = await repository.findById('group-1');
      expect(found).toBeUndefined();
    });

    it('should return undefined when deleting non-existent exercise group', async () => {
      const result = await repository.delete('non-existent-id');
      expect(result).toBeUndefined();
    });

    it('should delete and allow recreation with same name', async () => {
      await repository.create(mockExerciseGroup({ id: 'group-1', name: 'reusable-name' }));
      await repository.delete('group-1');

      const result = await repository.create(mockExerciseGroup({ id: 'group-2', name: 'reusable-name' }));
      expect(result.id).toBe('group-2');
    });
  });
});
