import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumExerciseRelationshipService } from './compendium-exercise-relationship.service';
import { CompendiumExerciseRelationshipRepository } from '../../persistence/repositories/compendium-exercise-relationship.repository';
import { CompendiumExerciseRepository } from '../../persistence/repositories/compendium-exercise.repository';
import { provideTestDatabase } from '../../persistence/database';
import { ExerciseRelationshipType, ExerciseType, ForceType, Muscle, TechnicalDifficulty } from '@resitr/api';
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

    // Create test exercises to satisfy foreign key constraints
    await exerciseRepository.create({
      templateId: 'exercise-1',
      name: 'Test Exercise 1',
      type: ExerciseType.STRENGTH,
      force: [ForceType.PUSH],
      primaryMuscles: [Muscle.CHEST],
      secondaryMuscles: [],
      technicalDifficulty: TechnicalDifficulty.BEGINNER,
      equipmentIds: [],
      bodyWeightScaling: 1,
      instructions: [],
      images: [],
      createdBy: 'user-1',
      version: 1,
    });

    await exerciseRepository.create({
      templateId: 'exercise-2',
      name: 'Test Exercise 2',
      type: ExerciseType.STRENGTH,
      force: [ForceType.PUSH],
      primaryMuscles: [Muscle.CHEST],
      secondaryMuscles: [],
      technicalDifficulty: TechnicalDifficulty.BEGINNER,
      equipmentIds: [],
      bodyWeightScaling: 1,
      instructions: [],
      images: [],
      createdBy: 'user-1',
      version: 1,
    });

    await exerciseRepository.create({
      templateId: 'exercise-3',
      name: 'Test Exercise 3',
      type: ExerciseType.STRENGTH,
      force: [ForceType.PULL],
      primaryMuscles: [Muscle.LATS],
      secondaryMuscles: [],
      technicalDifficulty: TechnicalDifficulty.INTERMEDIATE,
      equipmentIds: [],
      bodyWeightScaling: 1,
      instructions: [],
      images: [],
      createdBy: 'user-1',
      version: 1,
    });

    await exerciseRepository.create({
      templateId: 'exercise-4',
      name: 'Test Exercise 4',
      type: ExerciseType.STRENGTH,
      force: [ForceType.PULL],
      primaryMuscles: [Muscle.LATS],
      secondaryMuscles: [],
      technicalDifficulty: TechnicalDifficulty.ADVANCED,
      equipmentIds: [],
      bodyWeightScaling: 1,
      instructions: [],
      images: [],
      createdBy: 'user-1',
      version: 1,
    });
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

      expect(result).toBeDefined();
      expect(result.fromExerciseTemplateId).toBe('exercise-1');
      expect(result.toExerciseTemplateId).toBe('exercise-2');
      expect(result.relationshipType).toBe(ExerciseRelationshipType.ALTERNATIVE);
      expect(result.strength).toBe(0.8);
      expect(result.description).toBe('Similar exercises');
      expect(result.createdBy).toBe('user-1');
    });

    it('should create a relationship without optional fields', async () => {
      const relationshipData: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.PREREQUISITE,
      };

      const result = await service.create(relationshipData, 'user-1');

      expect(result).toBeDefined();
      expect(result.fromExerciseTemplateId).toBe('exercise-1');
      expect(result.toExerciseTemplateId).toBe('exercise-2');
      expect(result.relationshipType).toBe(ExerciseRelationshipType.PREREQUISITE);
      expect(result.createdBy).toBe('user-1');
    });
  });

  describe('findAll', () => {
    it('should return all relationships', async () => {
      const relationship1: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
      };

      const relationship2: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-2',
        toExerciseTemplateId: 'exercise-3',
        relationshipType: ExerciseRelationshipType.PROGRESSION,
      };

      await service.create(relationship1, 'user-1');
      await service.create(relationship2, 'user-1');

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result.some((r) => r.fromExerciseTemplateId === 'exercise-1')).toBe(true);
      expect(result.some((r) => r.fromExerciseTemplateId === 'exercise-2')).toBe(true);
    });
  });

  describe('findByCompositeKey', () => {
    it('should find a relationship by composite key', async () => {
      const relationshipData: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
        strength: 0.9,
      };

      await service.create(relationshipData, 'user-1');

      const result = await service.findByCompositeKey(
        'exercise-1',
        'exercise-2',
        ExerciseRelationshipType.ALTERNATIVE
      );

      expect(result).toBeDefined();
      expect(result?.fromExerciseTemplateId).toBe('exercise-1');
      expect(result?.toExerciseTemplateId).toBe('exercise-2');
      expect(result?.relationshipType).toBe(ExerciseRelationshipType.ALTERNATIVE);
      expect(result?.strength).toBe(0.9);
    });
  });

  describe('findByFromExerciseId', () => {
    it('should find all relationships from a specific exercise', async () => {
      const relationship1: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
      };

      const relationship2: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-3',
        relationshipType: ExerciseRelationshipType.PROGRESSION,
      };

      const relationship3: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-2',
        toExerciseTemplateId: 'exercise-3',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
      };

      await service.create(relationship1, 'user-1');
      await service.create(relationship2, 'user-1');
      await service.create(relationship3, 'user-1');

      const result = await service.findByFromExerciseId('exercise-1');

      expect(result).toHaveLength(2);
      expect(result.every((r) => r.fromExerciseTemplateId === 'exercise-1')).toBe(true);
    });
  });

  describe('findByToExerciseId', () => {
    it('should find all relationships to a specific exercise', async () => {
      const relationship1: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-3',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
      };

      const relationship2: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-2',
        toExerciseTemplateId: 'exercise-3',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
      };

      const relationship3: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.PROGRESSION,
      };

      await service.create(relationship1, 'user-1');
      await service.create(relationship2, 'user-1');
      await service.create(relationship3, 'user-1');

      const result = await service.findByToExerciseId('exercise-3');

      expect(result).toHaveLength(2);
      expect(result.every((r) => r.toExerciseTemplateId === 'exercise-3')).toBe(true);
    });
  });

  describe('findByExerciseId', () => {
    it('should find all relationships involving a specific exercise (from or to)', async () => {
      const relationship1: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
      };

      const relationship2: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-2',
        toExerciseTemplateId: 'exercise-3',
        relationshipType: ExerciseRelationshipType.PROGRESSION,
      };

      const relationship3: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-3',
        toExerciseTemplateId: 'exercise-4',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
      };

      await service.create(relationship1, 'user-1');
      await service.create(relationship2, 'user-1');
      await service.create(relationship3, 'user-1');

      const result = await service.findByExerciseId('exercise-2');

      expect(result).toHaveLength(2);
      expect(
        result.some((r) => r.fromExerciseTemplateId === 'exercise-1' && r.toExerciseTemplateId === 'exercise-2')
      ).toBe(true);
      expect(
        result.some((r) => r.fromExerciseTemplateId === 'exercise-2' && r.toExerciseTemplateId === 'exercise-3')
      ).toBe(true);
    });
  });

  describe('findByRelationshipType', () => {
    it('should find all relationships of a specific type from an exercise', async () => {
      const relationship1: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
      };

      const relationship2: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-3',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
      };

      const relationship3: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-4',
        relationshipType: ExerciseRelationshipType.PROGRESSION,
      };

      await service.create(relationship1, 'user-1');
      await service.create(relationship2, 'user-1');
      await service.create(relationship3, 'user-1');

      const result = await service.findByRelationshipType('exercise-1', ExerciseRelationshipType.ALTERNATIVE);

      expect(result).toHaveLength(2);
      expect(result.every((r) => r.relationshipType === ExerciseRelationshipType.ALTERNATIVE)).toBe(true);
      expect(result.every((r) => r.fromExerciseTemplateId === 'exercise-1')).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a relationship', async () => {
      const relationshipData: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
        strength: 0.5,
        description: 'Initial description',
      };

      await service.create(relationshipData, 'user-1');

      const updateData: Partial<CreateExerciseRelationshipDto> = {
        strength: 0.9,
        description: 'Updated description',
      };

      const result = await service.update(
        'exercise-1',
        'exercise-2',
        ExerciseRelationshipType.ALTERNATIVE,
        updateData,
        'user-2'
      );

      expect(result).toBeDefined();
      expect(result.strength).toBe(0.9);
      expect(result.description).toBe('Updated description');
      expect(result.createdBy).toBe('user-2');
    });
  });

  describe('delete', () => {
    it('should delete a relationship', async () => {
      const relationshipData: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
      };

      await service.create(relationshipData, 'user-1');

      const result = await service.delete(
        'exercise-1',
        'exercise-2',
        ExerciseRelationshipType.ALTERNATIVE,
        'user-1'
      );

      expect(result).toBeDefined();
      expect(result.fromExerciseTemplateId).toBe('exercise-1');

      const found = await service.findByCompositeKey(
        'exercise-1',
        'exercise-2',
        ExerciseRelationshipType.ALTERNATIVE
      );
      expect(found).toBeUndefined();
    });
  });

  describe('upsert', () => {
    it('should insert a new relationship if it does not exist', async () => {
      const relationshipData: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
        strength: 0.7,
      };

      const result = await service.upsert(relationshipData, 'user-1');

      expect(result).toBeDefined();
      expect(result.fromExerciseTemplateId).toBe('exercise-1');
      expect(result.strength).toBe(0.7);
      expect(result.createdBy).toBe('user-1');
    });

    it('should update an existing relationship', async () => {
      const relationshipData: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
        strength: 0.5,
        description: 'Initial',
      };

      await service.create(relationshipData, 'user-1');

      const upsertData: CreateExerciseRelationshipDto = {
        fromExerciseTemplateId: 'exercise-1',
        toExerciseTemplateId: 'exercise-2',
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
        strength: 0.9,
        description: 'Updated',
      };

      const result = await service.upsert(upsertData, 'user-2');

      expect(result).toBeDefined();
      expect(result.strength).toBe(0.9);
      expect(result.description).toBe('Updated');
      expect(result.createdBy).toBe('user-2');

      const all = await service.findAll();
      const matches = all.filter(
        (r) =>
          r.fromExerciseTemplateId === 'exercise-1' &&
          r.toExerciseTemplateId === 'exercise-2' &&
          r.relationshipType === ExerciseRelationshipType.ALTERNATIVE
      );
      expect(matches).toHaveLength(1);
    });
  });
});
