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

    it('should return all equipment', async () => {
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
      expect(result[1].name).toBe('bench');
    });
  });

  describe('findById', () => {
    it('should find equipment by templateId', async () => {
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

      const result = await repository.delete('eq-1');

      expect(result).toBeDefined();
      expect(result.templateId).toBe('eq-1');

      // Verify it's actually deleted
      const found = await repository.findById('eq-1');
      expect(found).toBeUndefined();
    });

    it('should return undefined when deleting non-existent equipment', async () => {
      const result = await repository.delete('non-existent-id');
      expect(result).toBeUndefined();
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
});
