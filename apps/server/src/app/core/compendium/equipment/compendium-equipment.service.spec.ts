import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumEquipmentService } from './compendium-equipment.service';
import { CompendiumEquipmentRepository } from '../../persistence/repositories/compendium-equipment.repository';
import { provideTestDatabase } from '../../persistence/database';
import { EquipmentTemplate, EquipmentCategory } from '@resitr/api';

describe('CompendiumEquipmentService', () => {
  let service: CompendiumEquipmentService;
  let repository: CompendiumEquipmentRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [provideTestDatabase(), CompendiumEquipmentRepository, CompendiumEquipmentService],
    }).compile();

    service = module.get<CompendiumEquipmentService>(CompendiumEquipmentService);
    repository = module.get<CompendiumEquipmentRepository>(CompendiumEquipmentRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create equipment without substitutesFor', async () => {
      const equipmentData: EquipmentTemplate = {
        templateId: 'eq-1',
        name: 'barbell',
        displayName: 'Barbell',
        description: 'A standard barbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      };

      const result = await service.create(equipmentData, '');

      expect(result).toBeDefined();
      expect(result?.templateId).toBe('eq-1');
      expect(result?.name).toBe('barbell');
      expect(result?.category).toBe(EquipmentCategory.free_weights);
      expect(result?.substitutesFor).toEqual([]);
    });

    it('should create equipment with substitutesFor relationships', async () => {
      // Create the equipment that will be substituted
      const barbell: EquipmentTemplate = {
        templateId: 'barbell',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      };

      const kettlebell: EquipmentTemplate = {
        templateId: 'kettlebell',
        name: 'kettlebell',
        displayName: 'Kettlebell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      };

      await service.create(barbell, '');
      await service.create(kettlebell, '');

      // Create dumbbell that substitutes for both barbell and kettlebell
      const dumbbell: EquipmentTemplate = {
        templateId: 'dumbbell',
        name: 'dumbbell',
        displayName: 'Dumbbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: ['barbell', 'kettlebell'],
      };

      const result = await service.create(dumbbell, '');

      expect(result).toBeDefined();
      expect(result?.templateId).toBe('dumbbell');
      expect(result?.category).toBe(EquipmentCategory.free_weights);
      expect(result?.substitutesFor).toHaveLength(2);
      expect(result?.substitutesFor).toContain('barbell');
      expect(result?.substitutesFor).toContain('kettlebell');
    });

    it('should create equipment with empty substitutesFor array', async () => {
      const equipmentData: EquipmentTemplate = {
        templateId: 'bench',
        name: 'bench',
        displayName: 'Bench',
        category: EquipmentCategory.benches,
        substitutesFor: [],
      };

      const result = await service.create(equipmentData, '');

      expect(result).toBeDefined();
      expect(result?.category).toBe(EquipmentCategory.benches);
      expect(result?.substitutesFor).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update equipment fields without changing substitutesFor', async () => {
      const equipmentData: EquipmentTemplate = {
        templateId: 'barbell',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      };

      await service.create(equipmentData, '');

      const updateData: Partial<EquipmentTemplate> = {
        displayName: 'Olympic Barbell',
        description: 'A 20kg Olympic barbell',
      };

      const result = await service.update('barbell', {...equipmentData, ...updateData}, '');

      expect(result).toBeDefined();
      expect(result?.displayName).toBe('Olympic Barbell');
      expect(result?.description).toBe('A 20kg Olympic barbell');
      expect(result?.category).toBe(EquipmentCategory.free_weights);
      expect(result?.substitutesFor).toEqual([]);
    });

    it('should update substitutesFor relationships', async () => {
      // Create equipment
      const barbell: EquipmentTemplate = {
        templateId: 'barbell',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      };

      const kettlebell: EquipmentTemplate = {
        templateId: 'kettlebell',
        name: 'kettlebell',
        displayName: 'Kettlebell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      };

      const dumbbell: EquipmentTemplate = {
        templateId: 'dumbbell',
        name: 'dumbbell',
        displayName: 'Dumbbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      };

      await service.create(barbell, '');
      await service.create(kettlebell, '');
      await service.create(dumbbell, '');

      // Update dumbbell to substitute for barbell
      const result = await service.update('dumbbell', {
        ...dumbbell,
        substitutesFor: ['barbell'],
      }, '');

      expect(result).toBeDefined();
      expect(result?.substitutesFor).toEqual(['barbell']);
    });

    it('should update both fields and substitutesFor together', async () => {
      const barbell: EquipmentTemplate = {
        templateId: 'barbell',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      };

      const dumbbell: EquipmentTemplate = {
        templateId: 'dumbbell',
        name: 'dumbbell',
        displayName: 'Dumbbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      };

      await service.create(barbell, '');
      await service.create(dumbbell, '');

      const result = await service.update('dumbbell', {
        ...dumbbell,
        displayName: 'Heavy Dumbbell',
        description: 'A heavy-duty dumbbell',
        substitutesFor: ['barbell'],
      }, '');

      expect(result).toBeDefined();
      expect(result?.displayName).toBe('Heavy Dumbbell');
      expect(result?.description).toBe('A heavy-duty dumbbell');
      expect(result?.substitutesFor).toEqual(['barbell']);
    });

    it('should clear substitutesFor when empty array is provided', async () => {
      const barbell: EquipmentTemplate = {
        templateId: 'barbell',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      };

      const dumbbell: EquipmentTemplate = {
        templateId: 'dumbbell',
        name: 'dumbbell',
        displayName: 'Dumbbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: ['barbell'],
      };

      await service.create(barbell, '');
      await service.create(dumbbell, '');

      // Verify it has substitutesFor
      let result = await service.findById('dumbbell');
      expect(result?.substitutesFor).toEqual(['barbell']);

      // Clear substitutesFor
      const dumbbellData = await service.findById('dumbbell');
      result = await service.update('dumbbell', {
        templateId: dumbbellData!.templateId,
        name: dumbbellData!.name,
        displayName: dumbbellData!.displayName,
        category: dumbbellData!.category!,
        substitutesFor: [],
      }, '');

      expect(result?.substitutesFor).toEqual([]);
    });

    it('should replace existing substitutesFor relationships', async () => {
      const barbell: EquipmentTemplate = {
        templateId: 'barbell',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      };

      const kettlebell: EquipmentTemplate = {
        templateId: 'kettlebell',
        name: 'kettlebell',
        displayName: 'Kettlebell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      };

      const dumbbell: EquipmentTemplate = {
        templateId: 'dumbbell',
        name: 'dumbbell',
        displayName: 'Dumbbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: ['barbell'],
      };

      await service.create(barbell, '');
      await service.create(kettlebell, '');
      await service.create(dumbbell, '');

      // Verify initial state
      let result = await service.findById('dumbbell');
      expect(result?.substitutesFor).toEqual(['barbell']);

      // Replace with kettlebell
      const currentDumbbell = await service.findById('dumbbell');
      result = await service.update('dumbbell', {
        templateId: currentDumbbell!.templateId,
        name: currentDumbbell!.name,
        displayName: currentDumbbell!.displayName,
        category: currentDumbbell!.category!,
        substitutesFor: ['kettlebell'],
      }, '');

      expect(result?.substitutesFor).toEqual(['kettlebell']);
    });
  });

  describe('findById', () => {
    it('should return equipment with substitutesFor', async () => {
      const barbell: EquipmentTemplate = {
        templateId: 'barbell',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      };

      const dumbbell: EquipmentTemplate = {
        templateId: 'dumbbell',
        name: 'dumbbell',
        displayName: 'Dumbbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: ['barbell'],
      };

      await service.create(barbell, '');
      await service.create(dumbbell, '');

      const result = await service.findById('dumbbell');

      expect(result).toBeDefined();
      expect(result?.category).toBe(EquipmentCategory.free_weights);
      expect(result?.substitutesFor).toEqual(['barbell']);
    });
  });

  describe('findAll', () => {
    it('should return all equipment with their substitutesFor relationships', async () => {
      const barbell: EquipmentTemplate = {
        templateId: 'barbell',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      };

      const dumbbell: EquipmentTemplate = {
        templateId: 'dumbbell',
        name: 'dumbbell',
        displayName: 'Dumbbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: ['barbell'],
      };

      await service.create(barbell, '');
      await service.create(dumbbell, '');

      const result = await service.findAll();

      expect(result).toHaveLength(2);

      const barbellResult = result.find((e) => e.templateId === 'barbell');
      expect(barbellResult?.category).toBe(EquipmentCategory.free_weights);
      expect(barbellResult?.substitutesFor).toEqual([]);

      const dumbbellResult = result.find((e) => e.templateId === 'dumbbell');
      expect(dumbbellResult?.category).toBe(EquipmentCategory.free_weights);
      expect(dumbbellResult?.substitutesFor).toEqual(['barbell']);
    });
  });

  describe('findByName', () => {
    it('should return equipment with substitutesFor', async () => {
      const barbell: EquipmentTemplate = {
        templateId: 'barbell',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      };

      const dumbbell: EquipmentTemplate = {
        templateId: 'dumbbell',
        name: 'dumbbell',
        displayName: 'Dumbbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: ['barbell'],
      };

      await service.create(barbell, '');
      await service.create(dumbbell, '');

      const result = await service.findByName('dumbbell');

      expect(result).toBeDefined();
      expect(result?.category).toBe(EquipmentCategory.free_weights);
      expect(result?.substitutesFor).toEqual(['barbell']);
    });
  });
});
