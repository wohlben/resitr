import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumEquipmentRepository } from './compendium-equipment.repository';
import { provideTestDatabase } from '../database';
import { EquipmentCategory } from '@resitr/api';
import type { CompendiumEquipment } from '../schemas';

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
      const equipmentData: CompendiumEquipment = {
        templateId: 'eq-1',
        name: 'barbell',
        displayName: 'Barbell',
        description: 'A standard barbell for weightlifting',
        category: EquipmentCategory.free_weights,
        imageUrl: 'https://example.com/barbell.jpg',
      };

      const result = await repository.create(equipmentData);

      expect(result).toBeDefined();
      expect(result.templateId).toBe(equipmentData.templateId);
      expect(result.name).toBe(equipmentData.name);
      expect(result.displayName).toBe(equipmentData.displayName);
      expect(result.description).toBe(equipmentData.description);
      expect(result.category).toBe(equipmentData.category);
      expect(result.imageUrl).toBe(equipmentData.imageUrl);
    });

    it('should create equipment with minimal required fields', async () => {
      const equipmentData: CompendiumEquipment = {
        templateId: 'eq-2',
        name: 'dumbbell',
        displayName: 'Dumbbell',
      };

      const result = await repository.create(equipmentData);

      expect(result).toBeDefined();
      expect(result.templateId).toBe(equipmentData.templateId);
      expect(result.name).toBe(equipmentData.name);
      expect(result.displayName).toBe(equipmentData.displayName);
      expect(result.description).toBeNull();
      expect(result.category).toBeNull();
      expect(result.imageUrl).toBeNull();
    });

    it('should fail when creating equipment with duplicate name', async () => {
      const equipmentData: CompendiumEquipment = {
        templateId: 'eq-3',
        name: 'kettlebell',
        displayName: 'Kettlebell',
      };

      await repository.create(equipmentData);

      const duplicateData: CompendiumEquipment = {
        templateId: 'eq-4',
        name: 'kettlebell', // Same name
        displayName: 'Another Kettlebell',
      };

      await expect(repository.create(duplicateData)).rejects.toThrow();
    });

    it('should fail when creating equipment with duplicate templateId', async () => {
      const equipmentData: CompendiumEquipment = {
        templateId: 'eq-5',
        name: 'resistance-band',
        displayName: 'Resistance Band',
      };

      await repository.create(equipmentData);

      const duplicateData: CompendiumEquipment = {
        templateId: 'eq-5', // Same templateId
        name: 'resistance-band-2',
        displayName: 'Another Resistance Band',
      };

      await expect(repository.create(duplicateData)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return empty array when no equipment exists', async () => {
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });

    it('should return all equipment with empty substitutesFor array', async () => {
      const equipment1: CompendiumEquipment = {
        templateId: 'eq-1',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
      };

      const equipment2: CompendiumEquipment = {
        templateId: 'eq-2',
        name: 'bench',
        displayName: 'Bench',
        category: EquipmentCategory.benches,
      };

      await repository.create(equipment1);
      await repository.create(equipment2);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('barbell');
      expect(result[0].substitutesFor).toEqual([]);
      expect(result[1].name).toBe('bench');
      expect(result[1].substitutesFor).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find equipment by templateId with empty substitutesFor', async () => {
      const equipmentData: CompendiumEquipment = {
        templateId: 'eq-1',
        name: 'dumbbell',
        displayName: 'Dumbbell',
        category: EquipmentCategory.free_weights,
      };

      await repository.create(equipmentData);

      const result = await repository.findById('eq-1');

      expect(result).toBeDefined();
      expect(result.templateId).toBe('eq-1');
      expect(result.name).toBe('dumbbell');
      expect(result.substitutesFor).toEqual([]);
    });

    it('should return undefined when equipment not found', async () => {
      const result = await repository.findById('non-existent-id');
      expect(result).toBeUndefined();
    });
  });

  describe('findByName', () => {
    it('should find equipment by name', async () => {
      const equipmentData: CompendiumEquipment = {
        templateId: 'eq-1',
        name: 'kettlebell',
        displayName: 'Kettlebell',
        category: EquipmentCategory.free_weights,
      };

      await repository.create(equipmentData);

      const result = await repository.findByName('kettlebell');

      expect(result).toBeDefined();
      expect(result.name).toBe('kettlebell');
      expect(result.templateId).toBe('eq-1');
    });

    it('should return undefined when equipment not found by name', async () => {
      const result = await repository.findByName('non-existent-name');
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update equipment fields', async () => {
      const equipmentData: CompendiumEquipment = {
        templateId: 'eq-1',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
      };

      await repository.create(equipmentData);

      const updateData = {
        displayName: 'Olympic Barbell',
        description: 'A 20kg Olympic standard barbell',
        imageUrl: 'https://example.com/olympic-barbell.jpg',
      };

      const result = await repository.update('eq-1', updateData);

      expect(result).toBeDefined();
      expect(result.templateId).toBe('eq-1');
      expect(result.name).toBe('barbell'); // Unchanged
      expect(result.displayName).toBe('Olympic Barbell'); // Updated
      expect(result.description).toBe('A 20kg Olympic standard barbell'); // Updated
      expect(result.imageUrl).toBe('https://example.com/olympic-barbell.jpg'); // Updated
    });

    it('should update category', async () => {
      const equipmentData: CompendiumEquipment = {
        templateId: 'eq-1',
        name: 'cable-machine',
        displayName: 'Cable Machine',
        category: EquipmentCategory.other,
      };

      await repository.create(equipmentData);

      const result = await repository.update('eq-1', {
        category: EquipmentCategory.machines,
      });

      expect(result).toBeDefined();
      expect(result.category).toBe(EquipmentCategory.machines);
    });

    it('should return undefined when updating non-existent equipment', async () => {
      const result = await repository.update('non-existent-id', {
        displayName: 'Updated Name',
      });

      expect(result).toBeUndefined();
    });

    it('should be able to clear optional fields', async () => {
      const equipmentData: CompendiumEquipment = {
        templateId: 'eq-1',
        name: 'bench',
        displayName: 'Bench',
        description: 'A workout bench',
        imageUrl: 'https://example.com/bench.jpg',
      };

      await repository.create(equipmentData);

      const result = await repository.update('eq-1', {
        description: null,
        imageUrl: null,
      });

      expect(result).toBeDefined();
      expect(result.description).toBeNull();
      expect(result.imageUrl).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete equipment by templateId', async () => {
      const equipmentData: CompendiumEquipment = {
        templateId: 'eq-1',
        name: 'treadmill',
        displayName: 'Treadmill',
        category: EquipmentCategory.machines,
      };

      await repository.create(equipmentData);

      await repository.delete('eq-1');

      // Verify it's actually deleted
      const found = await repository.findById('eq-1');
      expect(found).toBeUndefined();
    });

    it('should not error when deleting non-existent equipment', async () => {
      await repository.delete('non-existent-id');
      // Should not throw
    });

    it('should delete and allow recreation with same name', async () => {
      const equipmentData: CompendiumEquipment = {
        templateId: 'eq-1',
        name: 'rowing-machine',
        displayName: 'Rowing Machine',
      };

      await repository.create(equipmentData);
      await repository.delete('eq-1');

      // Should be able to create new equipment with same name
      const newEquipmentData: CompendiumEquipment = {
        templateId: 'eq-2',
        name: 'rowing-machine',
        displayName: 'New Rowing Machine',
      };

      const result = await repository.create(newEquipmentData);
      expect(result).toBeDefined();
      expect(result.templateId).toBe('eq-2');
    });
  });

  describe('upsert', () => {
    it('should insert new equipment when it does not exist', async () => {
      const equipmentData: CompendiumEquipment = {
        templateId: 'eq-1',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
        description: 'A standard barbell',
      };

      const result = await repository.upsert(equipmentData);

      expect(result).toBeDefined();
      expect(result.templateId).toBe('eq-1');
      expect(result.name).toBe('barbell');
      expect(result.displayName).toBe('Barbell');
      expect(result.description).toBe('A standard barbell');

      // Verify it was inserted
      const found = await repository.findById('eq-1');
      expect(found).toBeDefined();
      expect(found.name).toBe('barbell');
    });

    it('should update existing equipment when it already exists', async () => {
      const equipmentData: CompendiumEquipment = {
        templateId: 'eq-1',
        name: 'dumbbell',
        displayName: 'Dumbbell',
        category: EquipmentCategory.free_weights,
        description: 'A standard dumbbell',
      };

      await repository.create(equipmentData);

      const updatedData: CompendiumEquipment = {
        templateId: 'eq-1',
        name: 'dumbbell',
        displayName: 'Heavy Dumbbell',
        category: EquipmentCategory.free_weights,
        description: 'A heavy-duty dumbbell',
        imageUrl: 'https://example.com/heavy-dumbbell.jpg',
      };

      const result = await repository.upsert(updatedData);

      expect(result).toBeDefined();
      expect(result.templateId).toBe('eq-1');
      expect(result.displayName).toBe('Heavy Dumbbell');
      expect(result.description).toBe('A heavy-duty dumbbell');
      expect(result.imageUrl).toBe('https://example.com/heavy-dumbbell.jpg');

      // Verify only one record exists
      const allEquipment = await repository.findAll();
      expect(allEquipment).toHaveLength(1);
    });

    it('should handle multiple upserts in sequence', async () => {
      const equipmentData: CompendiumEquipment = {
        templateId: 'eq-1',
        name: 'kettlebell',
        displayName: 'Kettlebell',
        category: EquipmentCategory.free_weights,
      };

      // First upsert - insert
      const result1 = await repository.upsert(equipmentData);
      expect(result1.displayName).toBe('Kettlebell');
      expect(result1.description).toBeNull();

      // Second upsert - update
      const result2 = await repository.upsert({
        ...equipmentData,
        description: 'A cast iron weight',
      });
      expect(result2.displayName).toBe('Kettlebell');
      expect(result2.description).toBe('A cast iron weight');

      // Third upsert - another update
      const result3 = await repository.upsert({
        ...equipmentData,
        displayName: 'Competition Kettlebell',
        description: 'A competition-grade kettlebell',
      });
      expect(result3.displayName).toBe('Competition Kettlebell');
      expect(result3.description).toBe('A competition-grade kettlebell');

      // Verify still only one record
      const allEquipment = await repository.findAll();
      expect(allEquipment).toHaveLength(1);
    });
  });

  describe('substitutesFor relationship', () => {
    it('should include substitutesFor IDs when equipment has fulfillments', async () => {
      const barbell = await repository.create({
        templateId: 'barbell',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
      });

      const olympicBarbell = await repository.create({
        templateId: 'olympic-barbell',
        name: 'olympic-barbell',
        displayName: 'Olympic Barbell',
        category: EquipmentCategory.free_weights,
      });

      const ezBar = await repository.create({
        templateId: 'ez-bar',
        name: 'ez-bar',
        displayName: 'EZ Curl Bar',
        category: EquipmentCategory.free_weights,
      });

      // Create fulfillments: barbell can substitute for olympic-barbell and ez-bar
      await repository.setSubstitutesFor(barbell.templateId, [olympicBarbell.templateId, ezBar.templateId], 'test-user');

      const result = await repository.findById('barbell');

      expect(result).toBeDefined();
      expect(result.substitutesFor).toHaveLength(2);
      expect(result.substitutesFor).toContain('olympic-barbell');
      expect(result.substitutesFor).toContain('ez-bar');
    });

    it('should include substitutesFor in findAll results', async () => {
      const dumbbell = await repository.create({
        templateId: 'dumbbell',
        name: 'dumbbell',
        displayName: 'Dumbbell',
        category: EquipmentCategory.free_weights,
      });

      const barbell = await repository.create({
        templateId: 'barbell',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
      });

      const kettlebell = await repository.create({
        templateId: 'kettlebell',
        name: 'kettlebell',
        displayName: 'Kettlebell',
        category: EquipmentCategory.free_weights,
      });

      // dumbbell can substitute for barbell
      await repository.setSubstitutesFor(dumbbell.templateId, [barbell.templateId], 'test-user');

      // kettlebell can substitute for dumbbell
      await repository.setSubstitutesFor(kettlebell.templateId, [dumbbell.templateId], 'test-user');

      const results = await repository.findAll();

      expect(results).toHaveLength(3);

      const dumbbellResult = results.find((e) => e.templateId === 'dumbbell');
      expect(dumbbellResult.substitutesFor).toEqual(['barbell']);

      const barbellResult = results.find((e) => e.templateId === 'barbell');
      expect(barbellResult.substitutesFor).toEqual([]);

      const kettlebellResult = results.find((e) => e.templateId === 'kettlebell');
      expect(kettlebellResult.substitutesFor).toEqual(['dumbbell']);
    });

    it('should cascade delete fulfillments when equipment is deleted', async () => {
      const bench = await repository.create({
        templateId: 'bench',
        name: 'bench',
        displayName: 'Bench',
        category: EquipmentCategory.benches,
      });

      const inclineBench = await repository.create({
        templateId: 'incline-bench',
        name: 'incline-bench',
        displayName: 'Incline Bench',
        category: EquipmentCategory.benches,
      });

      await repository.setSubstitutesFor(bench.templateId, [inclineBench.templateId], 'test-user');

      // Verify fulfillment exists
      const benchResult = await repository.findById('bench');
      expect(benchResult.substitutesFor).toEqual(['incline-bench']);

      // Delete the bench
      await repository.delete('bench');

      // Verify fulfillment was cascade deleted - bench no longer exists
      const deletedBench = await repository.findById('bench');
      expect(deletedBench).toBeUndefined();
    });
  });

  describe('setSubstitutesFor', () => {
    it('should set substitutesFor relationships for equipment', async () => {
      const dumbbell = await repository.create({
        templateId: 'dumbbell',
        name: 'dumbbell',
        displayName: 'Dumbbell',
        category: EquipmentCategory.free_weights,
      });

      const barbell = await repository.create({
        templateId: 'barbell',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
      });

      const kettlebell = await repository.create({
        templateId: 'kettlebell',
        name: 'kettlebell',
        displayName: 'Kettlebell',
        category: EquipmentCategory.free_weights,
      });

      await repository.setSubstitutesFor('dumbbell', ['barbell', 'kettlebell'], 'test-user');

      const result = await repository.findById('dumbbell');
      expect(result.substitutesFor).toHaveLength(2);
      expect(result.substitutesFor).toContain('barbell');
      expect(result.substitutesFor).toContain('kettlebell');
    });

    it('should replace existing substitutesFor relationships', async () => {
      const bench = await repository.create({
        templateId: 'bench',
        name: 'bench',
        displayName: 'Bench',
        category: EquipmentCategory.benches,
      });

      const inclineBench = await repository.create({
        templateId: 'incline-bench',
        name: 'incline-bench',
        displayName: 'Incline Bench',
        category: EquipmentCategory.benches,
      });

      const declineBench = await repository.create({
        templateId: 'decline-bench',
        name: 'decline-bench',
        displayName: 'Decline Bench',
        category: EquipmentCategory.benches,
      });

      // Initially set to incline bench
      await repository.setSubstitutesFor('bench', ['incline-bench'], 'test-user');

      let result = await repository.findById('bench');
      expect(result.substitutesFor).toEqual(['incline-bench']);

      // Replace with decline bench
      await repository.setSubstitutesFor('bench', ['decline-bench'], 'test-user');

      result = await repository.findById('bench');
      expect(result.substitutesFor).toEqual(['decline-bench']);
    });

    it('should clear substitutesFor when empty array is provided', async () => {
      const barbell = await repository.create({
        templateId: 'barbell',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
      });

      const olympicBarbell = await repository.create({
        templateId: 'olympic-barbell',
        name: 'olympic-barbell',
        displayName: 'Olympic Barbell',
        category: EquipmentCategory.free_weights,
      });

      // Set relationship
      await repository.setSubstitutesFor('barbell', ['olympic-barbell'], 'test-user');

      let result = await repository.findById('barbell');
      expect(result.substitutesFor).toEqual(['olympic-barbell']);

      // Clear relationship
      await repository.setSubstitutesFor('barbell', [], 'test-user');

      result = await repository.findById('barbell');
      expect(result.substitutesFor).toEqual([]);
    });

    it('should handle multiple equipment with different substitutesFor', async () => {
      const dumbbell = await repository.create({
        templateId: 'dumbbell',
        name: 'dumbbell',
        displayName: 'Dumbbell',
        category: EquipmentCategory.free_weights,
      });

      const barbell = await repository.create({
        templateId: 'barbell',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
      });

      const kettlebell = await repository.create({
        templateId: 'kettlebell',
        name: 'kettlebell',
        displayName: 'Kettlebell',
        category: EquipmentCategory.free_weights,
      });

      await repository.setSubstitutesFor('dumbbell', ['barbell'], 'test-user');
      await repository.setSubstitutesFor('kettlebell', ['dumbbell', 'barbell'], 'test-user');

      const dumbbellResult = await repository.findById('dumbbell');
      expect(dumbbellResult.substitutesFor).toEqual(['barbell']);

      const kettlebellResult = await repository.findById('kettlebell');
      expect(kettlebellResult.substitutesFor).toHaveLength(2);
      expect(kettlebellResult.substitutesFor).toContain('dumbbell');
      expect(kettlebellResult.substitutesFor).toContain('barbell');

      const barbellResult = await repository.findById('barbell');
      expect(barbellResult.substitutesFor).toEqual([]);
    });
  });
});
