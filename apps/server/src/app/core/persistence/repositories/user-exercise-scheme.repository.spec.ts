import { Test, TestingModule } from '@nestjs/testing';
import { UserExerciseSchemeRepository } from './user-exercise-scheme.repository';
import { CompendiumExerciseRepository } from './compendium-exercise.repository';
import { CompendiumWorkoutRepository } from './compendium-workout.repository';
import { CompendiumWorkoutSectionRepository } from './compendium-workout-section.repository';
import { CompendiumWorkoutSectionItemRepository } from './compendium-workout-section-item.repository';
import { provideTestDatabase } from '../database';
import { mockExercise, mockUserExerciseScheme, mockWorkout, mockWorkoutSection, mockWorkoutSectionItem } from '../test-factories';
import type { CompendiumExercise } from '../schemas/compendium-exercise.schema';
import { MeasurementType } from '@resitr/api';

describe('UserExerciseSchemeRepository', () => {
  let module: TestingModule;
  let repository: UserExerciseSchemeRepository;
  let exerciseRepository: CompendiumExerciseRepository;
  let workoutRepository: CompendiumWorkoutRepository;
  let sectionRepository: CompendiumWorkoutSectionRepository;
  let sectionItemRepository: CompendiumWorkoutSectionItemRepository;
  let testExercise1: CompendiumExercise;
  let testExercise2: CompendiumExercise;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        provideTestDatabase(),
        UserExerciseSchemeRepository,
        CompendiumExerciseRepository,
        CompendiumWorkoutRepository,
        CompendiumWorkoutSectionRepository,
        CompendiumWorkoutSectionItemRepository,
      ],
    }).compile();

    repository = module.get<UserExerciseSchemeRepository>(UserExerciseSchemeRepository);
    exerciseRepository = module.get<CompendiumExerciseRepository>(CompendiumExerciseRepository);
    workoutRepository = module.get<CompendiumWorkoutRepository>(CompendiumWorkoutRepository);
    sectionRepository = module.get<CompendiumWorkoutSectionRepository>(CompendiumWorkoutSectionRepository);
    sectionItemRepository = module.get<CompendiumWorkoutSectionItemRepository>(CompendiumWorkoutSectionItemRepository);

    // Create prerequisite test exercises
    testExercise1 = await exerciseRepository.create(mockExercise({ templateId: 'exercise-1', name: 'Squat' }));
    testExercise2 = await exerciseRepository.create(mockExercise({ templateId: 'exercise-2', name: 'Deadlift' }));
  });

  describe('create', () => {
    it('should create a scheme with all fields', async () => {
      const schemeData = mockUserExerciseScheme({
        userId: 'user-1',
        exerciseId: testExercise1.templateId,
        name: '5x5 Strength',
        measurementType: MeasurementType.REP_BASED,
        sets: 5,
        reps: 5,
        restBetweenSets: 180,
        weight: 225,
        timePerRep: 3,
      });

      const result = await repository.create(schemeData);

      expect(result).toMatchObject({
        userId: 'user-1',
        exerciseId: testExercise1.templateId,
        name: '5x5 Strength',
        measurementType: MeasurementType.REP_BASED,
        sets: 5,
        reps: 5,
        restBetweenSets: 180,
        weight: 225,
        timePerRep: 3,
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });

    it('should create a time-based scheme', async () => {
      const schemeData = mockUserExerciseScheme({
        userId: 'user-1',
        exerciseId: testExercise1.templateId,
        name: 'AMRAP 10 minutes',
        measurementType: MeasurementType.AMRAP,
        sets: 1,
        reps: 0,
        restBetweenSets: 0,
        duration: 600,
        weight: null,
      });

      const result = await repository.create(schemeData);

      expect(result).toMatchObject({
        measurementType: MeasurementType.AMRAP,
        duration: 600,
      });
      expect(result.weight).toBeNull();
    });

    it('should create a distance-based scheme', async () => {
      const schemeData = mockUserExerciseScheme({
        userId: 'user-1',
        exerciseId: testExercise1.templateId,
        name: '5K Run',
        measurementType: MeasurementType.DISTANCE_BASED,
        sets: 1,
        reps: 1,
        restBetweenSets: 0,
        distance: 5000,
        targetTime: 1800,
      });

      const result = await repository.create(schemeData);

      expect(result).toMatchObject({
        measurementType: MeasurementType.DISTANCE_BASED,
        distance: 5000,
        targetTime: 1800,
      });
    });

    it('should auto-generate id if not provided', async () => {
      const schemeData = mockUserExerciseScheme({
        userId: 'user-1',
        exerciseId: testExercise1.templateId,
      });

      const result = await repository.create(schemeData);

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
    });

    it('should fail when exerciseId references non-existent exercise', async () => {
      const schemeData = mockUserExerciseScheme({
        userId: 'user-1',
        exerciseId: 'non-existent-exercise',
      });

      await expect(repository.create(schemeData)).rejects.toThrow();
    });

    it('should allow multiple users to create schemes for the same exercise', async () => {
      const scheme1 = await repository.create(mockUserExerciseScheme({
        userId: 'user-1',
        exerciseId: testExercise1.templateId,
        name: 'User 1 Scheme',
      }));
      const scheme2 = await repository.create(mockUserExerciseScheme({
        userId: 'user-2',
        exerciseId: testExercise1.templateId,
        name: 'User 2 Scheme',
      }));

      expect(scheme1.userId).toBe('user-1');
      expect(scheme2.userId).toBe('user-2');
      expect(scheme1.id).not.toBe(scheme2.id);
    });
  });

  describe('findAll', () => {
    it('should return all schemes across all users', async () => {
      await repository.create(mockUserExerciseScheme({ userId: 'user-1', exerciseId: testExercise1.templateId, name: 'Scheme 1' }));
      await repository.create(mockUserExerciseScheme({ userId: 'user-2', exerciseId: testExercise1.templateId, name: 'Scheme 2' }));
      await repository.create(mockUserExerciseScheme({ userId: 'user-1', exerciseId: testExercise2.templateId, name: 'Scheme 3' }));

      const results = await repository.findAll();

      expect(results).toHaveLength(3);
      expect(results.map((s) => s.name)).toEqual(expect.arrayContaining(['Scheme 1', 'Scheme 2', 'Scheme 3']));
    });

    it('should return empty array when no schemes exist', async () => {
      const results = await repository.findAll();

      expect(results).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find a scheme by id', async () => {
      const created = await repository.create(mockUserExerciseScheme({ userId: 'user-1', exerciseId: testExercise1.templateId, name: 'Find Me' }));

      const result = await repository.findById(created.id);

      expect(result).toMatchObject({
        id: created.id,
        name: 'Find Me',
      });
    });

    it('should return undefined when scheme does not exist', async () => {
      const result = await repository.findById('non-existent-id');

      expect(result).toBeUndefined();
    });
  });

  describe('findByUserId', () => {
    it('should find all schemes for a specific user', async () => {
      await repository.create(mockUserExerciseScheme({ userId: 'user-1', exerciseId: testExercise1.templateId, name: 'Scheme 1' }));
      await repository.create(mockUserExerciseScheme({ userId: 'user-1', exerciseId: testExercise2.templateId, name: 'Scheme 2' }));
      await repository.create(mockUserExerciseScheme({ userId: 'user-2', exerciseId: testExercise1.templateId, name: 'Other User' }));

      const results = await repository.findByUserId('user-1');

      expect(results).toHaveLength(2);
      expect(results.every((s) => s.userId === 'user-1')).toBe(true);
      expect(results.map((s) => s.name)).toEqual(expect.arrayContaining(['Scheme 1', 'Scheme 2']));
    });

    it('should return empty array when user has no schemes', async () => {
      const results = await repository.findByUserId('user-1');

      expect(results).toEqual([]);
    });
  });

  describe('findByUserIdAndExerciseId', () => {
    it('should find all schemes for a specific user and exercise', async () => {
      await repository.create(mockUserExerciseScheme({ userId: 'user-1', exerciseId: testExercise1.templateId, name: 'Scheme 1' }));
      await repository.create(mockUserExerciseScheme({ userId: 'user-1', exerciseId: testExercise1.templateId, name: 'Scheme 2' }));
      await repository.create(mockUserExerciseScheme({ userId: 'user-1', exerciseId: testExercise2.templateId, name: 'Other Exercise' }));
      await repository.create(mockUserExerciseScheme({ userId: 'user-2', exerciseId: testExercise1.templateId, name: 'Other User' }));

      const results = await repository.findByUserIdAndExerciseId('user-1', testExercise1.templateId);

      expect(results).toHaveLength(2);
      expect(results.every((s) => s.userId === 'user-1' && s.exerciseId === testExercise1.templateId)).toBe(true);
      expect(results.map((s) => s.name)).toEqual(expect.arrayContaining(['Scheme 1', 'Scheme 2']));
    });

    it('should return empty array when no schemes exist for user and exercise', async () => {
      const results = await repository.findByUserIdAndExerciseId('user-1', testExercise1.templateId);

      expect(results).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update scheme fields', async () => {
      const created = await repository.create(mockUserExerciseScheme({ userId: 'user-1', exerciseId: testExercise1.templateId, name: 'Original' }));

      const updated = await repository.update(created.id, {
        name: 'Updated',
        sets: 10,
        reps: 20,
      });

      expect(updated).toMatchObject({
        id: created.id,
        name: 'Updated',
        sets: 10,
        reps: 20,
      });
      expect(updated?.updatedAt).toBeDefined();
    });

    it('should update optional fields to null', async () => {
      const created = await repository.create(
        mockUserExerciseScheme({
          userId: 'user-1',
          exerciseId: testExercise1.templateId,
          weight: 100,
          timePerRep: 5,
        })
      );

      const updated = await repository.update(created.id, {
        weight: null,
        timePerRep: null,
      });

      expect(updated?.weight).toBeNull();
      expect(updated?.timePerRep).toBeNull();
    });

    it('should return undefined when updating non-existent scheme', async () => {
      const result = await repository.update('non-existent-id', { name: 'Updated' });

      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete a scheme', async () => {
      const created = await repository.create(mockUserExerciseScheme({ userId: 'user-1', exerciseId: testExercise1.templateId }));

      await repository.delete(created.id);

      const found = await repository.findById(created.id);
      expect(found).toBeUndefined();
    });

    it('should not throw when deleting non-existent scheme', async () => {
      await expect(repository.delete('non-existent-id')).resolves.not.toThrow();
    });
  });

  describe('deleteByUserId', () => {
    it('should delete all schemes for a specific user', async () => {
      const scheme1 = await repository.create(mockUserExerciseScheme({ userId: 'user-1', exerciseId: testExercise1.templateId, name: 'Scheme 1' }));
      const scheme2 = await repository.create(mockUserExerciseScheme({ userId: 'user-1', exerciseId: testExercise2.templateId, name: 'Scheme 2' }));
      const scheme3 = await repository.create(mockUserExerciseScheme({ userId: 'user-2', exerciseId: testExercise1.templateId, name: 'Other User' }));

      await repository.deleteByUserId('user-1');

      const found1 = await repository.findById(scheme1.id);
      const found2 = await repository.findById(scheme2.id);
      const found3 = await repository.findById(scheme3.id);

      expect(found1).toBeUndefined();
      expect(found2).toBeUndefined();
      expect(found3).toBeDefined();
    });
  });

  describe('deleteByUserIdAndExerciseId', () => {
    it('should delete all schemes for a specific user and exercise', async () => {
      const scheme1 = await repository.create(mockUserExerciseScheme({ userId: 'user-1', exerciseId: testExercise1.templateId, name: 'Scheme 1' }));
      const scheme2 = await repository.create(mockUserExerciseScheme({ userId: 'user-1', exerciseId: testExercise1.templateId, name: 'Scheme 2' }));
      const scheme3 = await repository.create(mockUserExerciseScheme({ userId: 'user-1', exerciseId: testExercise2.templateId, name: 'Other Exercise' }));
      const scheme4 = await repository.create(mockUserExerciseScheme({ userId: 'user-2', exerciseId: testExercise1.templateId, name: 'Other User' }));

      await repository.deleteByUserIdAndExerciseId('user-1', testExercise1.templateId);

      const found1 = await repository.findById(scheme1.id);
      const found2 = await repository.findById(scheme2.id);
      const found3 = await repository.findById(scheme3.id);
      const found4 = await repository.findById(scheme4.id);

      expect(found1).toBeUndefined();
      expect(found2).toBeUndefined();
      expect(found3).toBeDefined();
      expect(found4).toBeDefined();
    });
  });

  describe('upsert', () => {
    it('should insert a new scheme when id does not exist', async () => {
      const schemeData = {
        ...mockUserExerciseScheme({
          userId: 'user-1',
          exerciseId: testExercise1.templateId,
          name: 'New Scheme',
        }),
        id: 'new-scheme-id',
      };

      const result = await repository.upsert(schemeData as any);

      expect(result).toMatchObject({
        id: 'new-scheme-id',
        name: 'New Scheme',
      });
    });

    it('should update existing scheme when id already exists', async () => {
      const created = await repository.create(mockUserExerciseScheme({ userId: 'user-1', exerciseId: testExercise1.templateId, name: 'Original' }));

      const upserted = await repository.upsert({
        id: created.id,
        userId: 'user-1',
        exerciseId: testExercise1.templateId,
        name: 'Updated via Upsert',
        measurementType: MeasurementType.REP_BASED,
        sets: 99,
        reps: 99,
        restBetweenSets: 99,
      });

      expect(upserted).toMatchObject({
        id: created.id,
        name: 'Updated via Upsert',
        sets: 99,
      });
      expect(upserted.updatedAt).toBeDefined();
    });
  });

  describe('cascading deletes', () => {
    it('should delete schemes when parent exercise is deleted', async () => {
      const scheme1 = await repository.create(mockUserExerciseScheme({ userId: 'user-1', exerciseId: testExercise1.templateId, name: 'Scheme 1' }));
      const scheme2 = await repository.create(mockUserExerciseScheme({ userId: 'user-2', exerciseId: testExercise1.templateId, name: 'Scheme 2' }));
      const scheme3 = await repository.create(mockUserExerciseScheme({ userId: 'user-1', exerciseId: testExercise2.templateId, name: 'Other' }));

      // Delete the parent exercise
      await exerciseRepository.delete(testExercise1.templateId);

      // Schemes for exercise 1 should be deleted
      const found1 = await repository.findById(scheme1.id);
      const found2 = await repository.findById(scheme2.id);
      expect(found1).toBeUndefined();
      expect(found2).toBeUndefined();

      // Scheme for exercise 2 should still exist
      const found3 = await repository.findById(scheme3.id);
      expect(found3).toBeDefined();
    });
  });

  describe('join table operations', () => {
    let scheme: any;
    let workout: any;
    let section: any;
    let sectionItem: any;

    beforeEach(async () => {
      // Create test data
      scheme = await repository.create(
        mockUserExerciseScheme({
          userId: 'test-user',
          exerciseId: testExercise1.templateId,
        })
      );

      workout = await workoutRepository.create(
        mockWorkout({
          templateId: 'test-workout',
          name: 'Test Workout',
        })
      );

      section = await sectionRepository.create(
        mockWorkoutSection({
          workoutTemplateId: workout.templateId,
          name: 'Test Section',
          orderIndex: 0,
        })
      );

      sectionItem = await sectionItemRepository.create(
        mockWorkoutSectionItem({
          sectionId: section.id,
          orderIndex: 0,
          breakBetweenSets: 60,
          breakAfter: 120,
        })
      );
    });

    describe('assignToSectionItem', () => {
      it('should assign scheme to section item', async () => {
        const result = await repository.assignToSectionItem({
          sectionItemId: sectionItem.id,
          workoutTemplateId: workout.templateId,
          userExerciseSchemeId: scheme.id,
        });

        expect(result).toMatchObject({
          sectionItemId: sectionItem.id,
          workoutTemplateId: workout.templateId,
          userExerciseSchemeId: scheme.id,
        });
      });

      it('should fail when assigning duplicate', async () => {
        await repository.assignToSectionItem({
          sectionItemId: sectionItem.id,
          workoutTemplateId: workout.templateId,
          userExerciseSchemeId: scheme.id,
        });

        await expect(
          repository.assignToSectionItem({
            sectionItemId: sectionItem.id,
            workoutTemplateId: workout.templateId,
            userExerciseSchemeId: scheme.id,
          })
        ).rejects.toThrow();
      });
    });

    describe('unassignFromSectionItem', () => {
      it('should unassign scheme from section item', async () => {
        await repository.assignToSectionItem({
          sectionItemId: sectionItem.id,
          workoutTemplateId: workout.templateId,
          userExerciseSchemeId: scheme.id,
        });

        await repository.unassignFromSectionItem(
          sectionItem.id,
          workout.templateId,
          scheme.id
        );

        const assignments = await repository.findSectionItemAssignments(scheme.id);
        expect(assignments).toHaveLength(0);
      });

      it('should not throw when unassigning non-existent assignment', async () => {
        await expect(
          repository.unassignFromSectionItem(
            'non-existent',
            'non-existent',
            'non-existent'
          )
        ).resolves.not.toThrow();
      });
    });

    describe('findSectionItemAssignments', () => {
      it('should find all section item assignments for a scheme', async () => {
        await repository.assignToSectionItem({
          sectionItemId: sectionItem.id,
          workoutTemplateId: workout.templateId,
          userExerciseSchemeId: scheme.id,
        });

        const assignments = await repository.findSectionItemAssignments(scheme.id);

        expect(assignments).toHaveLength(1);
        expect(assignments[0]).toMatchObject({
          sectionItemId: sectionItem.id,
          workoutTemplateId: workout.templateId,
          userExerciseSchemeId: scheme.id,
        });
      });

      it('should return empty array when no assignments exist', async () => {
        const assignments = await repository.findSectionItemAssignments(scheme.id);
        expect(assignments).toEqual([]);
      });

      it('should find multiple assignments for same scheme', async () => {
        // Create second section item
        const sectionItem2 = await sectionItemRepository.create(
          mockWorkoutSectionItem({
            sectionId: section.id,
            orderIndex: 1,
            breakBetweenSets: 90,
            breakAfter: 180,
          })
        );

        await repository.assignToSectionItem({
          sectionItemId: sectionItem.id,
          workoutTemplateId: workout.templateId,
          userExerciseSchemeId: scheme.id,
        });

        await repository.assignToSectionItem({
          sectionItemId: sectionItem2.id,
          workoutTemplateId: workout.templateId,
          userExerciseSchemeId: scheme.id,
        });

        const assignments = await repository.findSectionItemAssignments(scheme.id);
        expect(assignments).toHaveLength(2);
      });
    });

    describe('cascading deletes for join table', () => {
      it('should delete join table entries when scheme is deleted', async () => {
        await repository.assignToSectionItem({
          sectionItemId: sectionItem.id,
          workoutTemplateId: workout.templateId,
          userExerciseSchemeId: scheme.id,
        });

        await repository.delete(scheme.id);

        const assignments = await repository.findSectionItemAssignments(scheme.id);
        expect(assignments).toHaveLength(0);
      });

      it('should delete join table entries when section item is deleted', async () => {
        await repository.assignToSectionItem({
          sectionItemId: sectionItem.id,
          workoutTemplateId: workout.templateId,
          userExerciseSchemeId: scheme.id,
        });

        await sectionItemRepository.delete(sectionItem.id);

        const assignments = await repository.findSectionItemAssignments(scheme.id);
        expect(assignments).toHaveLength(0);
      });
    });
  });
});
