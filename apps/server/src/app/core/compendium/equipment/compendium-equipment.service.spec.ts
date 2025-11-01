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

      expect(result).toMatchObject({
        templateId: 'eq-1',
        name: 'barbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      });
    });

    it('should create equipment with substitutesFor relationships', async () => {
      await service.create({
        templateId: 'barbell',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      }, '');
      await service.create({
        templateId: 'kettlebell',
        name: 'kettlebell',
        displayName: 'Kettlebell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      }, '');

      const result = await service.create({
        templateId: 'dumbbell',
        name: 'dumbbell',
        displayName: 'Dumbbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: ['barbell', 'kettlebell'],
      }, '');

      expect(result).toMatchObject({
        templateId: 'dumbbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: ['barbell', 'kettlebell'],
      });
    });

    it('should create equipment with empty substitutesFor array', async () => {
      const result = await service.create({
        templateId: 'bench',
        name: 'bench',
        displayName: 'Bench',
        category: EquipmentCategory.benches,
        substitutesFor: [],
      }, '');

      expect(result).toMatchObject({
        category: EquipmentCategory.benches,
        substitutesFor: [],
      });
    });
  });

  describe('update', () => {
    it('should update equipment fields without changing substitutesFor', async () => {
      await service.create({
        templateId: 'barbell',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      }, '');

      const result = await service.update('barbell', {
        templateId: 'barbell',
        name: 'barbell',
        displayName: 'Olympic Barbell',
        description: 'A 20kg Olympic barbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      }, '');

      expect(result).toMatchObject({
        displayName: 'Olympic Barbell',
        description: 'A 20kg Olympic barbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      });
    });

    it('should update substitutesFor relationships', async () => {
      await service.create({
        templateId: 'barbell',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      }, '');
      await service.create({
        templateId: 'kettlebell',
        name: 'kettlebell',
        displayName: 'Kettlebell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      }, '');
      await service.create({
        templateId: 'dumbbell',
        name: 'dumbbell',
        displayName: 'Dumbbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      }, '');

      const result = await service.update('dumbbell', {
        templateId: 'dumbbell',
        name: 'dumbbell',
        displayName: 'Dumbbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: ['barbell'],
      }, '');

      expect(result?.substitutesFor).toEqual(['barbell']);
    });

    it('should update both fields and substitutesFor together', async () => {
      await service.create({
        templateId: 'barbell',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      }, '');
      await service.create({
        templateId: 'dumbbell',
        name: 'dumbbell',
        displayName: 'Dumbbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      }, '');

      const result = await service.update('dumbbell', {
        templateId: 'dumbbell',
        name: 'dumbbell',
        displayName: 'Heavy Dumbbell',
        description: 'A heavy-duty dumbbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: ['barbell'],
      }, '');

      expect(result).toMatchObject({
        displayName: 'Heavy Dumbbell',
        description: 'A heavy-duty dumbbell',
        substitutesFor: ['barbell'],
      });
    });

    it('should clear substitutesFor when empty array is provided', async () => {
      await service.create({
        templateId: 'barbell',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      }, '');
      await service.create({
        templateId: 'dumbbell',
        name: 'dumbbell',
        displayName: 'Dumbbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: ['barbell'],
      }, '');

      let result = await service.findById('dumbbell');
      expect(result?.substitutesFor).toEqual(['barbell']);

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
      await service.create({
        templateId: 'barbell',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      }, '');
      await service.create({
        templateId: 'kettlebell',
        name: 'kettlebell',
        displayName: 'Kettlebell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      }, '');
      await service.create({
        templateId: 'dumbbell',
        name: 'dumbbell',
        displayName: 'Dumbbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: ['barbell'],
      }, '');

      let result = await service.findById('dumbbell');
      expect(result?.substitutesFor).toEqual(['barbell']);

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
      await service.create({
        templateId: 'barbell',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      }, '');
      await service.create({
        templateId: 'dumbbell',
        name: 'dumbbell',
        displayName: 'Dumbbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: ['barbell'],
      }, '');

      const result = await service.findById('dumbbell');

      expect(result).toMatchObject({
        category: EquipmentCategory.free_weights,
        substitutesFor: ['barbell'],
      });
    });
  });

  describe('findAll', () => {
    it('should return all equipment with their substitutesFor relationships', async () => {
      await service.create({
        templateId: 'barbell',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      }, '');
      await service.create({
        templateId: 'dumbbell',
        name: 'dumbbell',
        displayName: 'Dumbbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: ['barbell'],
      }, '');

      const result = await service.findAll();

      expect(result).toHaveLength(2);

      const barbellResult = result.find((e) => e.templateId === 'barbell');
      expect(barbellResult).toMatchObject({
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      });

      const dumbbellResult = result.find((e) => e.templateId === 'dumbbell');
      expect(dumbbellResult).toMatchObject({
        category: EquipmentCategory.free_weights,
        substitutesFor: ['barbell'],
      });
    });
  });

  describe('findByName', () => {
    it('should return equipment with substitutesFor', async () => {
      await service.create({
        templateId: 'barbell',
        name: 'barbell',
        displayName: 'Barbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: [],
      }, '');
      await service.create({
        templateId: 'dumbbell',
        name: 'dumbbell',
        displayName: 'Dumbbell',
        category: EquipmentCategory.free_weights,
        substitutesFor: ['barbell'],
      }, '');

      const result = await service.findByName('dumbbell');

      expect(result).toMatchObject({
        category: EquipmentCategory.free_weights,
        substitutesFor: ['barbell'],
      });
    });
  });
});
