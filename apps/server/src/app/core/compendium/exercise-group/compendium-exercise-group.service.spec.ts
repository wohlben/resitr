import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumExerciseGroupService } from './compendium-exercise-group.service';
import { CompendiumExerciseGroupRepository } from '../../persistence/repositories/compendium-exercise-group.repository';
import { provideTestDatabase } from '../../persistence/database';

describe('CompendiumExerciseGroupService', () => {
  let service: CompendiumExerciseGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        provideTestDatabase(),
        CompendiumExerciseGroupRepository,
        CompendiumExerciseGroupService,
      ],
    }).compile();

    service = module.get<CompendiumExerciseGroupService>(CompendiumExerciseGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an exercise group', async () => {
      const result = await service.create({
        name: 'Upper Body',
        description: 'Upper body exercises',
      }, 'user-1');

      expect(result).toMatchObject({
        name: 'Upper Body',
        description: 'Upper body exercises',
        createdBy: 'user-1',
      });
      expect(result.createdAt).toBeDefined();
    });

    it('should create an exercise group without optional description', async () => {
      const result = await service.create({
        name: 'Cardio',
      }, 'user-1');

      expect(result).toMatchObject({
        name: 'Cardio',
        description: null,
        createdBy: 'user-1',
      });
    });
  });

  describe('findAll', () => {
    it('should return all exercise groups', async () => {
      const created1 = await service.create({ name: 'Upper Body' }, 'user-1');
      const created2 = await service.create({ name: 'Lower Body' }, 'user-1');

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result.some((g) => g.id === created1.id)).toBe(true);
      expect(result.some((g) => g.id === created2.id)).toBe(true);
    });

    it('should return empty array when no groups exist', async () => {
      const result = await service.findAll();
      expect(result).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should find an exercise group by id', async () => {
      const created = await service.create({
        name: 'Upper Body',
        description: 'All upper body exercises',
      }, 'user-1');

      const result = await service.findById(created.id);

      expect(result).toMatchObject({
        name: 'Upper Body',
        description: 'All upper body exercises',
      });
    });

    it('should return undefined for non-existent id', async () => {
      const result = await service.findById('non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('findByName', () => {
    it('should find an exercise group by name', async () => {
      const created = await service.create({ name: 'Upper Body' }, 'user-1');

      const result = await service.findByName('Upper Body');

      expect(result).toMatchObject({
        id: created.id,
        name: 'Upper Body',
      });
    });

    it('should return undefined for non-existent name', async () => {
      const result = await service.findByName('Non-existent Group');
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update an exercise group', async () => {
      const created = await service.create({
        name: 'Upper Body',
        description: 'Initial description',
      }, 'user-1');

      const result = await service.update(created.id, {
        name: 'Upper Body Strength',
        description: 'Updated description',
      });

      expect(result).toMatchObject({
        name: 'Upper Body Strength',
        description: 'Updated description',
      });
      expect(result.updatedAt).toBeDefined();
    });

    it('should update only provided fields', async () => {
      const created = await service.create({
        name: 'Upper Body',
        description: 'Original description',
      }, 'user-1');

      const result = await service.update(created.id, {
        name: 'Upper Body Modified',
      });

      expect(result).toMatchObject({
        name: 'Upper Body Modified',
        description: 'Original description',
      });
    });
  });

  describe('delete', () => {
    it('should delete an exercise group', async () => {
      const created = await service.create({name: 'Upper Body' }, 'user-1');

      const result = await service.delete(created.id);

      expect(result).toMatchObject({ id: created.id });

      const found = await service.findById(created.id);
      expect(found).toBeUndefined();
    });
  });

  describe('upsert', () => {
    it('should insert a new exercise group if it does not exist', async () => {
      const result = await service.upsert({
        id: 'group-1',
        name: 'Upper Body',
        description: 'New group',
      }, 'user-1');

      expect(result).toMatchObject({
        id: 'group-1',
        name: 'Upper Body',
        description: 'New group',
        createdBy: 'user-1',
      });
    });

    it('should update an existing exercise group', async () => {
      const created = await service.create({
        name: 'Upper Body',
        description: 'Initial',
      }, 'user-1');

      const result = await service.upsert({
        id: created.id,
        name: 'Upper Body Modified',
        description: 'Updated',
      }, 'user-2');

      expect(result).toMatchObject({
        name: 'Upper Body Modified',
        description: 'Updated',
      });
      expect(result.updatedAt).toBeDefined();

      const all = await service.findAll();
      const matches = all.filter((g) => g.id === result.id);
      expect(matches).toHaveLength(1);
    });
  });
});
