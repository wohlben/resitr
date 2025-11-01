import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumEquipmentRepository } from './compendium-equipment.repository';
import { provideTestDatabase } from '../database';
import { EquipmentCategory } from '@resitr/api';
import type { NewCompendiumEquipment } from '../schemas';
import { mockEquipment } from '../test-factories';

describe('CompendiumEquipmentRepository', () => {
  let repository: CompendiumEquipmentRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [provideTestDatabase(), CompendiumEquipmentRepository],
    }).compile();

    repository = module.get<CompendiumEquipmentRepository>(CompendiumEquipmentRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new equipment', async () => {
      const equipmentData = mockEquipment({
        templateId: 'eq-1',
        name: 'barbell',
        displayName: 'Barbell',
        description: 'A standard barbell for weightlifting',
        imageUrl: 'https://example.com/barbell.jpg',
      });

      const result = await repository.create(equipmentData);

      expect(result).toMatchObject(equipmentData);
    });

    it('should create equipment with minimal required fields', async () => {
      const equipmentData = mockEquipment({
        templateId: 'eq-2',
        name: 'dumbbell',
        displayName: 'Dumbbell',
        description: null,
        category: null,
        imageUrl: null,
      });

      const result = await repository.create(equipmentData);

      expect(result).toMatchObject(equipmentData);
    });

    it('should fail when creating equipment with duplicate name', async () => {
      const equipmentData = mockEquipment({
        templateId: 'eq-3',
        name: 'kettlebell',
        displayName: 'Kettlebell',
      });

      await repository.create(equipmentData);

      const duplicateData = mockEquipment({
        templateId: 'eq-4',
        name: 'kettlebell', // Same name
        displayName: 'Another Kettlebell',
      });

      await expect(repository.create(duplicateData)).rejects.toThrow();
    });

    it('should fail when creating equipment with duplicate templateId', async () => {
      const equipmentData = mockEquipment({
        templateId: 'eq-5',
        name: 'resistance-band',
        displayName: 'Resistance Band',
      });

      await repository.create(equipmentData);

      const duplicateData = mockEquipment({
        templateId: 'eq-5', // Same templateId
        name: 'resistance-band-2',
        displayName: 'Another Resistance Band',
      });

      await expect(repository.create(duplicateData)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return empty array when no equipment exists', async () => {
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });

    it('should return all equipment with empty substitutesFor array', async () => {
      await repository.create(mockEquipment({ templateId: 'eq-1', name: 'barbell' }));
      await repository.create(mockEquipment({ templateId: 'eq-2', name: 'bench' }));

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].substitutesFor).toEqual([]);
      expect(result[1].substitutesFor).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find equipment by templateId with empty substitutesFor', async () => {
      await repository.create(mockEquipment({ templateId: 'eq-1' }));

      const result = await repository.findById('eq-1');

      expect(result).toBeDefined();
      expect(result?.templateId).toBe('eq-1');
      expect(result?.substitutesFor).toEqual([]);
    });

    it('should return undefined when equipment not found', async () => {
      const result = await repository.findById('non-existent-id');
      expect(result).toBeUndefined();
    });
  });

  describe('findByName', () => {
    it('should find equipment by name', async () => {
      await repository.create(mockEquipment({ templateId: 'eq-1', name: 'kettlebell' }));

      const result = await repository.findByName('kettlebell');

      expect(result).toBeDefined();
      expect(result?.name).toBe('kettlebell');
      expect(result?.templateId).toBe('eq-1');
    });

    it('should return undefined when equipment not found by name', async () => {
      const result = await repository.findByName('non-existent-name');
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update equipment fields', async () => {
      await repository.create(mockEquipment({ templateId: 'eq-1' }));

      const result = await repository.update('eq-1', {
        displayName: 'Updated Name',
        description: 'Updated description',
      });

      expect(result.displayName).toBe('Updated Name');
      expect(result.description).toBe('Updated description');
    });

    it('should update category', async () => {
      await repository.create(mockEquipment({ templateId: 'eq-1' }));

      const result = await repository.update('eq-1', {
        category: EquipmentCategory.machines,
      });

      expect(result.category).toBe(EquipmentCategory.machines);
    });

    it('should throw error when updating non-existent equipment', async () => {
      await expect(repository.update('non-existent-id', {
        displayName: 'Updated Name',
      })).rejects.toThrow();
    });

    it('should be able to clear optional fields', async () => {
      await repository.create(mockEquipment({
        templateId: 'eq-1',
        description: 'Has description',
        imageUrl: 'https://example.com/image.jpg',
      }));

      const result = await repository.update('eq-1', {
        description: null,
        imageUrl: null,
      });

      expect(result.description).toBeNull();
      expect(result.imageUrl).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete equipment by templateId', async () => {
      await repository.create(mockEquipment({ templateId: 'eq-1' }));

      await repository.delete('eq-1');

      const found = await repository.findById('eq-1');
      expect(found).toBeUndefined();
    });

    it('should not error when deleting non-existent equipment', async () => {
      await repository.delete('non-existent-id');
    });

    it('should delete and allow recreation with same name', async () => {
      await repository.create(mockEquipment({ templateId: 'eq-1', name: 'rowing-machine' }));
      await repository.delete('eq-1');

      const result = await repository.create(mockEquipment({ templateId: 'eq-2', name: 'rowing-machine' }));
      expect(result.templateId).toBe('eq-2');
    });
  });

  describe('upsert', () => {
    it('should insert new equipment when it does not exist', async () => {
      const result = await repository.upsert(mockEquipment({ templateId: 'eq-1' }));

      expect(result.templateId).toBe('eq-1');

      const found = await repository.findById('eq-1');
      expect(found).toBeDefined();
    });

    it('should update existing equipment when it already exists', async () => {
      await repository.create(mockEquipment({ templateId: 'eq-1' }));

      const result = await repository.upsert(mockEquipment({
        templateId: 'eq-1',
        description: 'Updated',
      }));

      expect(result.templateId).toBe('eq-1');
      expect(result.description).toBe('Updated');

      const allEquipment = await repository.findAll();
      expect(allEquipment).toHaveLength(1);
    });

    it('should handle multiple upserts in sequence', async () => {
      const templateId = 'eq-1';

      const result1 = await repository.upsert(mockEquipment({ templateId, description: null }));
      expect(result1.description).toBeNull();

      const result2 = await repository.upsert(mockEquipment({ templateId, description: 'First' }));
      expect(result2.description).toBe('First');

      const result3 = await repository.upsert(mockEquipment({ templateId, description: 'Second' }));
      expect(result3.description).toBe('Second');

      const allEquipment = await repository.findAll();
      expect(allEquipment).toHaveLength(1);
    });
  });

  describe('substitutesFor relationship', () => {
    it('should include substitutesFor IDs when equipment has fulfillments', async () => {
      await repository.create(mockEquipment({ templateId: 'barbell', name: 'barbell' }));
      await repository.create(mockEquipment({ templateId: 'olympic-barbell', name: 'olympic-barbell' }));
      await repository.create(mockEquipment({ templateId: 'ez-bar', name: 'ez-bar' }));

      await repository.setSubstitutesFor('barbell', ['olympic-barbell', 'ez-bar'], 'test-user');

      const result = await repository.findById('barbell');

      expect(result?.substitutesFor).toHaveLength(2);
      expect(result?.substitutesFor).toContain('olympic-barbell');
      expect(result?.substitutesFor).toContain('ez-bar');
    });

    it('should include substitutesFor in findAll results', async () => {
      await repository.create(mockEquipment({ templateId: 'dumbbell', name: 'dumbbell' }));
      await repository.create(mockEquipment({ templateId: 'barbell', name: 'barbell' }));
      await repository.create(mockEquipment({ templateId: 'kettlebell', name: 'kettlebell' }));

      await repository.setSubstitutesFor('dumbbell', ['barbell'], 'test-user');
      await repository.setSubstitutesFor('kettlebell', ['dumbbell'], 'test-user');

      const results = await repository.findAll();

      expect(results).toHaveLength(3);

      const dumbbellResult = results.find((e) => e.templateId === 'dumbbell');
      expect(dumbbellResult?.substitutesFor).toEqual(['barbell']);

      const barbellResult = results.find((e) => e.templateId === 'barbell');
      expect(barbellResult?.substitutesFor).toEqual([]);

      const kettlebellResult = results.find((e) => e.templateId === 'kettlebell');
      expect(kettlebellResult?.substitutesFor).toEqual(['dumbbell']);
    });

    it('should cascade delete fulfillments when equipment is deleted', async () => {
      await repository.create(mockEquipment({ templateId: 'bench', name: 'bench' }));
      await repository.create(mockEquipment({ templateId: 'incline-bench', name: 'incline-bench' }));

      await repository.setSubstitutesFor('bench', ['incline-bench'], 'test-user');

      const benchResult = await repository.findById('bench');
      expect(benchResult?.substitutesFor).toEqual(['incline-bench']);

      await repository.delete('bench');

      const deletedBench = await repository.findById('bench');
      expect(deletedBench).toBeUndefined();
    });
  });

  describe('setSubstitutesFor', () => {
    it('should set substitutesFor relationships for equipment', async () => {
      await repository.create(mockEquipment({ templateId: 'dumbbell', name: 'dumbbell' }));
      await repository.create(mockEquipment({ templateId: 'barbell', name: 'barbell' }));
      await repository.create(mockEquipment({ templateId: 'kettlebell', name: 'kettlebell' }));

      await repository.setSubstitutesFor('dumbbell', ['barbell', 'kettlebell'], 'test-user');

      const result = await repository.findById('dumbbell');
      expect(result?.substitutesFor).toHaveLength(2);
      expect(result?.substitutesFor).toContain('barbell');
      expect(result?.substitutesFor).toContain('kettlebell');
    });

    it('should replace existing substitutesFor relationships', async () => {
      await repository.create(mockEquipment({ templateId: 'bench', name: 'bench' }));
      await repository.create(mockEquipment({ templateId: 'incline-bench', name: 'incline-bench' }));
      await repository.create(mockEquipment({ templateId: 'decline-bench', name: 'decline-bench' }));

      await repository.setSubstitutesFor('bench', ['incline-bench'], 'test-user');

      let result = await repository.findById('bench');
      expect(result?.substitutesFor).toEqual(['incline-bench']);

      await repository.setSubstitutesFor('bench', ['decline-bench'], 'test-user');

      result = await repository.findById('bench');
      expect(result?.substitutesFor).toEqual(['decline-bench']);
    });

    it('should clear substitutesFor when empty array is provided', async () => {
      await repository.create(mockEquipment({ templateId: 'barbell', name: 'barbell' }));
      await repository.create(mockEquipment({ templateId: 'olympic-barbell', name: 'olympic-barbell' }));

      await repository.setSubstitutesFor('barbell', ['olympic-barbell'], 'test-user');

      let result = await repository.findById('barbell');
      expect(result?.substitutesFor).toEqual(['olympic-barbell']);

      await repository.setSubstitutesFor('barbell', [], 'test-user');

      result = await repository.findById('barbell');
      expect(result?.substitutesFor).toEqual([]);
    });

    it('should handle multiple equipment with different substitutesFor', async () => {
      await repository.create(mockEquipment({ templateId: 'dumbbell', name: 'dumbbell' }));
      await repository.create(mockEquipment({ templateId: 'barbell', name: 'barbell' }));
      await repository.create(mockEquipment({ templateId: 'kettlebell', name: 'kettlebell' }));

      await repository.setSubstitutesFor('dumbbell', ['barbell'], 'test-user');
      await repository.setSubstitutesFor('kettlebell', ['dumbbell', 'barbell'], 'test-user');

      const dumbbellResult = await repository.findById('dumbbell');
      expect(dumbbellResult?.substitutesFor).toEqual(['barbell']);

      const kettlebellResult = await repository.findById('kettlebell');
      expect(kettlebellResult?.substitutesFor).toHaveLength(2);
      expect(kettlebellResult?.substitutesFor).toContain('dumbbell');
      expect(kettlebellResult?.substitutesFor).toContain('barbell');

      const barbellResult = await repository.findById('barbell');
      expect(barbellResult?.substitutesFor).toEqual([]);
    });
  });
});
