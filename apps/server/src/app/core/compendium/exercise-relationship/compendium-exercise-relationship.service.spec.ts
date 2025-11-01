import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumExerciseRelationshipService } from './compendium-exercise-relationship.service';
import { CompendiumExerciseRelationshipRepository } from '../../persistence/repositories/compendium-exercise-relationship.repository';
import { CompendiumExerciseRepository } from '../../persistence/repositories/compendium-exercise.repository';
import { provideTestDatabase } from '../../persistence/database';
import { mockExercise } from '../../persistence/test-factories';
import { ExerciseRelationshipType } from '@resitr/api';
import { CreateExerciseRelationshipDto } from '../../../routes/compendium/exercise-relationship/dto/exercise-relationship.dto';

describe('CompendiumExerciseRelationshipService', () => {
  let service: CompendiumExerciseRelationshipService;
  let repository: CompendiumExerciseRelationshipRepository;
  let exerciseRepository: CompendiumExerciseRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        provideTestDatabase(),
        CompendiumExerciseRelationshipRepository,
        CompendiumExerciseRepository,
        CompendiumExerciseRelationshipService,
      ],
    }).compile();

    service = module.get<CompendiumExerciseRelationshipService>(CompendiumExerciseRelationshipService);
    repository = module.get<CompendiumExerciseRelationshipRepository>(CompendiumExerciseRelationshipRepository);
    exerciseRepository = module.get<CompendiumExerciseRepository>(CompendiumExerciseRepository);

    // Create test exercises
    await exerciseRepository.create(mockExercise({ templateId: 'exercise-1' }));
    await exerciseRepository.create(mockExercise({ templateId: 'exercise-2' }));
    await exerciseRepository.create(mockExercise({ templateId: 'exercise-3' }));
    await exerciseRepository.create(mockExercise({ templateId: 'exercise-4' }));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a relationship', async () => {
      const relationshipData: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
        strength: 0.8,
        description: 'Similar exercises',
      };

      const result = await service.create(relationshipData, 'user-1');

      expect(result).toMatchObject({
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
        strength: 0.8,
        description: 'Similar exercises',
        createdBy: 'user-1',
      });
    });

    it('should create a relationship without optional fields', async () => {
      const result = await service.create({
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.PREREQUISITE,
      }, 'user-1');

      expect(result).toMatchObject({
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.PREREQUISITE,
        createdBy: 'user-1',
      });
    });
  });

  describe('findAll', () => {
    it('should return all relationships', async () => {
      await service.create({
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
      }, 'user-1');
      await service.create({
        fromExerciseTemplateId: 'exercise-2',
        toExerciseTemplateId: 'exercise-3',
        relationshipType: ExerciseRelationshipType.PROGRESSION,
      }, 'user-1');

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result.some((r) => r.fromExerciseTemplateId === 'exercise-1')).toBe(true);
      expect(result.some((r) => r.fromExerciseTemplateId === 'exercise-2')).toBe(true);
    });
  });

  describe('findByCompositeKey', () => {
    it('should find a relationship by composite key', async () => {
      await service.create({
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
        strength: 0.9,
      }, 'user-1');

      const result = await service.findByCompositeKey('exercise-1', 'exercise-2', ExerciseRelationshipType.ALTERNATIVE);

      expect(result).toMatchObject({
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
        strength: 0.9,
      });
    });
  });

  describe('findByFromExerciseId', () => {
    it('should find all relationships from a specific exercise', async () => {
      await service.create({
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
      }, 'user-1');
      await service.create({
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-3',
        relationshipType: ExerciseRelationshipType.PROGRESSION,
      }, 'user-1');
      await service.create({
        fromExerciseTemplateId: 'exercise-2',
        toExerciseTemplateId: 'exercise-3',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
      }, 'user-1');

      const result = await service.findByFromExerciseId('exercise-1');

      expect(result).toHaveLength(2);
      expect(result.every((r) => r.fromExerciseTemplateId === 'exercise-1')).toBe(true);
    });
  });

  describe('findByToExerciseId', () => {
    it('should find all relationships to a specific exercise', async () => {
      await service.create({
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-3',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
      }, 'user-1');
      await service.create({
        fromExerciseTemplateId: 'exercise-2',
        toExerciseTemplateId: 'exercise-3',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
      }, 'user-1');
      await service.create({
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.PROGRESSION,
      }, 'user-1');

      const result = await service.findByToExerciseId('exercise-3');

      expect(result).toHaveLength(2);
      expect(result.every((r) => r.toExerciseTemplateId === 'exercise-3')).toBe(true);
    });
  });

  describe('findByExerciseId', () => {
    it('should find all relationships involving a specific exercise (from or to)', async () => {
      await service.create({
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
      }, 'user-1');
      await service.create({
        fromExerciseTemplateId: 'exercise-2',
        toExerciseTemplateId: 'exercise-3',
        relationshipType: ExerciseRelationshipType.PROGRESSION,
      }, 'user-1');
      await service.create({
        fromExerciseTemplateId: 'exercise-3',
        toExerciseTemplateId: 'exercise-4',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
      }, 'user-1');

      const result = await service.findByExerciseId('exercise-2');

      expect(result).toHaveLength(2);
      expect(result.some((r) => r.fromExerciseTemplateId === 'exercise-1' && r.toExerciseTemplateId === 'exercise-2')).toBe(true);
      expect(result.some((r) => r.fromExerciseTemplateId === 'exercise-2' && r.toExerciseTemplateId === 'exercise-3')).toBe(true);
    });
  });

  describe('findByRelationshipType', () => {
    it('should find all relationships of a specific type from an exercise', async () => {
      await service.create({
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
      }, 'user-1');
      await service.create({
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-3',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
      }, 'user-1');
      await service.create({
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-4',
        relationshipType: ExerciseRelationshipType.PROGRESSION,
      }, 'user-1');

      const result = await service.findByRelationshipType('exercise-1', ExerciseRelationshipType.ALTERNATIVE);

      expect(result).toHaveLength(2);
      expect(result.every((r) => r.relationshipType === ExerciseRelationshipType.ALTERNATIVE)).toBe(true);
      expect(result.every((r) => r.fromExerciseTemplateId === 'exercise-1')).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a relationship', async () => {
      await service.create({
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
        strength: 0.5,
        description: 'Initial description',
      }, 'user-1');

      const result = await service.update('exercise-1', 'exercise-2', ExerciseRelationshipType.ALTERNATIVE, {
        strength: 0.9,
        description: 'Updated description',
      }, 'user-2');

      expect(result).toMatchObject({
        strength: 0.9,
        description: 'Updated description',
        createdBy: 'user-2',
      });
    });
  });

  describe('delete', () => {
    it('should delete a relationship', async () => {
      await service.create({
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
      }, 'user-1');

      const result = await service.delete('exercise-1', 'exercise-2', ExerciseRelationshipType.ALTERNATIVE, 'user-1');

      expect(result).toMatchObject({ fromExerciseTemplateId: 'exercise-1' });

      const found = await service.findByCompositeKey('exercise-1', 'exercise-2', ExerciseRelationshipType.ALTERNATIVE);
      expect(found).toBeUndefined();
    });
  });

  describe('upsert', () => {
    it('should insert a new relationship if it does not exist', async () => {
      const result = await service.upsert({
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
        strength: 0.7,
      }, 'user-1');

      expect(result).toMatchObject({
        fromExerciseTemplateId: 'exercise-1',
        strength: 0.7,
        createdBy: 'user-1',
      });
    });

    it('should update an existing relationship', async () => {
      await service.create({
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
        strength: 0.5,
        description: 'Initial',
      }, 'user-1');

      const result = await service.upsert({
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
        strength: 0.9,
        description: 'Updated',
      }, 'user-2');

      expect(result).toMatchObject({
        strength: 0.9,
        description: 'Updated',
        createdBy: 'user-2',
      });

      const all = await service.findAll();
      const matches = all.filter((r) =>
        r.fromExerciseTemplateId === 'exercise-1' &&
        r.toExerciseTemplateId === 'exercise-2' &&
        r.relationshipType === ExerciseRelationshipType.ALTERNATIVE
      );
      expect(matches).toHaveLength(1);
    });
  });
});
