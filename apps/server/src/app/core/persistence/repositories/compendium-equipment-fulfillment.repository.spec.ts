import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumEquipmentFulfillmentRepository } from './compendium-equipment-fulfillment.repository';
import { CompendiumEquipmentRepository } from './compendium-equipment.repository';
import { provideTestDatabase } from '../database';
import type { CompendiumEquipmentFulfillment } from '../schemas';
import type { CompendiumEquipment } from '../schemas';
import { EquipmentCategory } from '@resitr/api';

describe('CompendiumEquipmentFulfillmentRepository', () => {
  let repository: CompendiumEquipmentFulfillmentRepository;
  let equipmentRepository: CompendiumEquipmentRepository;
  let equipment1: CompendiumEquipment;
  let equipment2: CompendiumEquipment;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [provideTestDatabase(), CompendiumEquipmentFulfillmentRepository, CompendiumEquipmentRepository],
    }).compile();

    repository = module.get<CompendiumEquipmentFulfillmentRepository>(CompendiumEquipmentFulfillmentRepository);
    equipmentRepository = module.get<CompendiumEquipmentRepository>(CompendiumEquipmentRepository);

    // Create test equipment for foreign key relationships
    equipment1 = await equipmentRepository.create({
      templateId: 'eq-1',
      name: 'barbell',
      displayName: 'Barbell',
      category: EquipmentCategory.free_weights,
    });

    equipment2 = await equipmentRepository.create({
      templateId: 'eq-2',
      name: 'dumbbell',
      displayName: 'Dumbbell',
      category: EquipmentCategory.free_weights,
    });
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new equipment fulfillment', async () => {
      const fulfillmentData: CompendiumEquipmentFulfillment = {
        equipmentTemplateId: equipment1.templateId,
        fulfillsEquipmentTemplateId: equipment2.templateId,
        createdBy: 'user-1',
      };

      const result = await repository.create(fulfillmentData);

      expect(result).toBeDefined();
      expect(result.equipmentTemplateId).toBe(equipment1.templateId);
      expect(result.fulfillsEquipmentTemplateId).toBe(equipment2.templateId);
      expect(result.createdBy).toBe('user-1');
      expect(result.createdAt).toBeDefined();
    });

    it('should fail when creating duplicate fulfillment', async () => {
      const fulfillmentData: CompendiumEquipmentFulfillment = {
        equipmentTemplateId: equipment1.templateId,
        fulfillsEquipmentTemplateId: equipment2.templateId,
        createdBy: 'user-1',
      };

      await repository.create(fulfillmentData);

      await expect(repository.create(fulfillmentData)).rejects.toThrow();
    });

    it('should create multiple fulfillments for one equipment', async () => {
      const equipment3 = await equipmentRepository.create({
        templateId: 'eq-3',
        name: 'kettlebell',
        displayName: 'Kettlebell',
        category: EquipmentCategory.free_weights,
      });

      await repository.create({
        equipmentTemplateId: equipment1.templateId,
        fulfillsEquipmentTemplateId: equipment2.templateId,
        createdBy: 'user-1',
      });

      await repository.create({
        equipmentTemplateId: equipment1.templateId,
        fulfillsEquipmentTemplateId: equipment3.templateId,
        createdBy: 'user-1',
      });

      const fulfillments = await repository.findByEquipmentId(equipment1.templateId);
      expect(fulfillments).toHaveLength(2);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no fulfillments exist', async () => {
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });

    it('should return all fulfillments', async () => {
      const equipment3 = await equipmentRepository.create({
        templateId: 'eq-3',
        name: 'kettlebell',
        displayName: 'Kettlebell',
      });

      await repository.create({
        equipmentTemplateId: equipment1.templateId,
        fulfillsEquipmentTemplateId: equipment2.templateId,
        createdBy: 'user-1',
      });

      await repository.create({
        equipmentTemplateId: equipment2.templateId,
        fulfillsEquipmentTemplateId: equipment3.templateId,
        createdBy: 'user-1',
      });

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
    });
  });

  describe('findByequipmentTemplateId', () => {
    it('should find fulfillments by equipment id', async () => {
      const equipment3 = await equipmentRepository.create({
        templateId: 'eq-3',
        name: 'kettlebell',
        displayName: 'Kettlebell',
      });

      await repository.create({
        equipmentTemplateId: equipment1.templateId,
        fulfillsEquipmentTemplateId: equipment2.templateId,
        createdBy: 'user-1',
      });

      await repository.create({
        equipmentTemplateId: equipment1.templateId,
        fulfillsEquipmentTemplateId: equipment3.templateId,
        createdBy: 'user-1',
      });

      const result = await repository.findByEquipmentId(equipment1.templateId);

      expect(result).toHaveLength(2);
      expect(result[0].equipmentTemplateId).toBe(equipment1.templateId);
      expect(result[1].equipmentTemplateId).toBe(equipment1.templateId);
    });

    it('should return empty array when no fulfillments found', async () => {
      const result = await repository.findByFulfillsEquipmentTemplateId('non-existent');
      expect(result).toEqual([]);
    });
  });

  describe('findByfulfillsEquipmentTemplateId', () => {
    it('should find fulfillments by fulfills equipment id', async () => {
      const equipment3 = await equipmentRepository.create({
        templateId: 'eq-3',
        name: 'kettlebell',
        displayName: 'Kettlebell',
      });

      await repository.create({
        equipmentTemplateId: equipment1.templateId,
        fulfillsEquipmentTemplateId: equipment2.templateId,
        createdBy: 'user-1',
      });

      await repository.create({
        equipmentTemplateId: equipment3.templateId,
        fulfillsEquipmentTemplateId: equipment2.templateId,
        createdBy: 'user-1',
      });

      const result = await repository.findByFulfillsEquipmentTemplateId(equipment2.templateId);

      expect(result).toHaveLength(2);
      expect(result[0].fulfillsEquipmentTemplateId).toBe(equipment2.templateId);
      expect(result[1].fulfillsEquipmentTemplateId).toBe(equipment2.templateId);
    });
  });

  describe('findByCompositeKey', () => {
    it('should find fulfillment by composite key', async () => {
      await repository.create({
        equipmentTemplateId: equipment1.templateId,
        fulfillsEquipmentTemplateId: equipment2.templateId,
        createdBy: 'user-1',
      });

      const result = await repository.findByCompositeKey(equipment1.templateId, equipment2.templateId);

      expect(result).toBeDefined();
      expect(result.equipmentTemplateId).toBe(equipment1.templateId);
      expect(result.fulfillsEquipmentTemplateId).toBe(equipment2.templateId);
      expect(result.createdBy).toBe('user-1');
    });

    it('should return undefined when fulfillment not found', async () => {
      const result = await repository.findByCompositeKey('non-existent', 'non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update fulfillment createdBy', async () => {
      await repository.create({
        equipmentTemplateId: equipment1.templateId,
        fulfillsEquipmentTemplateId: equipment2.templateId,
        createdBy: 'user-1',
      });

      const result = await repository.update(equipment1.templateId, equipment2.templateId, { createdBy: 'user-2' });

      expect(result).toBeDefined();
      expect(result.createdBy).toBe('user-2');
      expect(result.equipmentTemplateId).toBe(equipment1.templateId);
      expect(result.fulfillsEquipmentTemplateId).toBe(equipment2.templateId);
    });

    it('should return undefined when updating non-existent fulfillment', async () => {
      const result = await repository.update('non-existent', 'non-existent', {
        createdBy: 'user-2',
      });

      expect(result).toBeUndefined();
    });
  });

  describe('upsert', () => {
    it('should insert new fulfillment when it does not exist', async () => {
      const fulfillmentData = {
        equipmentTemplateId: equipment1.templateId,
        fulfillsEquipmentTemplateId: equipment2.templateId,
        createdBy: 'user-1',
      };

      const result = await repository.upsert(fulfillmentData);

      expect(result).toBeDefined();
      expect(result.equipmentTemplateId).toBe(equipment1.templateId);
      expect(result.fulfillsEquipmentTemplateId).toBe(equipment2.templateId);
      expect(result.createdBy).toBe('user-1');

      // Verify it was inserted
      const found = await repository.findByCompositeKey(equipment1.templateId, equipment2.templateId);
      expect(found).toBeDefined();
    });

    it('should update existing fulfillment when composite key exists', async () => {
      const fulfillmentData = {
        equipmentTemplateId: equipment2.templateId,
        fulfillsEquipmentTemplateId: equipment1.templateId,
        createdBy: 'user-1',
      };

      await repository.create(fulfillmentData);

      const updatedData = {
        equipmentTemplateId: equipment2.templateId,
        fulfillsEquipmentTemplateId: equipment1.templateId,
        createdBy: 'user-2',
      };

      const result = await repository.upsert(updatedData);

      expect(result).toBeDefined();
      expect(result.equipmentTemplateId).toBe(equipment2.templateId);
      expect(result.fulfillsEquipmentTemplateId).toBe(equipment1.templateId);
      expect(result.createdBy).toBe('user-2');

      // Verify only one record exists
      const fulfillments = await repository.findByEquipmentId(equipment2.templateId);
      expect(fulfillments).toHaveLength(1);
    });

    it('should handle multiple upserts with same composite key', async () => {
      const fulfillmentData = {
        equipmentTemplateId: equipment1.templateId,
        fulfillsEquipmentTemplateId: equipment2.templateId,
        createdBy: 'user-1',
      };

      // First upsert - insert
      const result1 = await repository.upsert(fulfillmentData);
      expect(result1.createdBy).toBe('user-1');

      // Second upsert - update
      const result2 = await repository.upsert({
        ...fulfillmentData,
        createdBy: 'user-2',
      });
      expect(result2.createdBy).toBe('user-2');

      // Verify still only one record
      const fulfillments = await repository.findByCompositeKey(equipment1.templateId, equipment2.templateId);
      expect(fulfillments).toBeDefined();
      expect(fulfillments.createdBy).toBe('user-2');
    });
  });

  describe('delete', () => {
    it('should delete fulfillment by composite key', async () => {
      await repository.create({
        equipmentTemplateId: equipment1.templateId,
        fulfillsEquipmentTemplateId: equipment2.templateId,
        createdBy: 'user-1',
      });

      const result = await repository.delete(equipment1.templateId, equipment2.templateId);

      expect(result).toBeDefined();
      expect(result.equipmentTemplateId).toBe(equipment1.templateId);

      // Verify it's deleted
      const found = await repository.findByCompositeKey(equipment1.templateId, equipment2.templateId);
      expect(found).toBeUndefined();
    });

    it('should return undefined when deleting non-existent fulfillment', async () => {
      const result = await repository.delete('non-existent', 'non-existent');
      expect(result).toBeUndefined();
    });

    it('should allow recreation after deletion', async () => {
      await repository.create({
        equipmentTemplateId: equipment1.templateId,
        fulfillsEquipmentTemplateId: equipment2.templateId,
        createdBy: 'user-1',
      });

      await repository.delete(equipment1.templateId, equipment2.templateId);

      const newFulfillment = await repository.create({
        equipmentTemplateId: equipment1.templateId,
        fulfillsEquipmentTemplateId: equipment2.templateId,
        createdBy: 'user-2',
      });

      expect(newFulfillment).toBeDefined();
      expect(newFulfillment.createdBy).toBe('user-2');
      expect(newFulfillment.equipmentTemplateId).toBe(equipment1.templateId);
      expect(newFulfillment.fulfillsEquipmentTemplateId).toBe(equipment2.templateId);
    });
  });
});
