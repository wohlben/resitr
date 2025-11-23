import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserExerciseSchemeService } from './user-exercise-scheme.service';
import { UserExerciseSchemeRepository } from '../../persistence/repositories/user-exercise-scheme.repository';
import { MeasurementType } from '@resitr/api';
import type { UserExerciseScheme } from '../../persistence/schemas/user-exercise-scheme.schema';

describe('UserExerciseSchemeService', () => {
  let service: UserExerciseSchemeService;
  let repository: UserExerciseSchemeRepository;

  const mockScheme: UserExerciseScheme = {
    id: 'scheme-1',
    userId: 'user-1',
    exerciseId: 'exercise-1',
    name: 'Test Scheme',
    measurementType: MeasurementType.REP_BASED,
    sets: 3,
    reps: 10,
    restBetweenSets: 60,
    weight: 100,
    timePerRep: null,
    duration: null,
    distance: null,
    targetTime: null,
    createdAt: new Date(),
    updatedAt: null,
  };

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findByUserIdAndExerciseId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteByUserId: jest.fn(),
    deleteByUserIdAndExerciseId: jest.fn(),
    upsert: jest.fn(),
    addToWorkoutSection: jest.fn(),
    removeFromWorkoutSection: jest.fn(),
    findWorkoutSectionAssignments: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserExerciseSchemeService,
        { provide: UserExerciseSchemeRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UserExerciseSchemeService>(UserExerciseSchemeService);
    repository = module.get<UserExerciseSchemeRepository>(UserExerciseSchemeRepository);
  });

  describe('createScheme', () => {
    it('should create a scheme with userId', async () => {
      const schemeData = {
        exerciseId: 'exercise-1',
        name: '5x5 Strength',
        measurementType: MeasurementType.REP_BASED,
        sets: 5,
        reps: 5,
        restBetweenSets: 180,
        weight: 225,
      };

      mockRepository.create.mockResolvedValue({ ...mockScheme, ...schemeData });

      const result = await service.createScheme('user-1', schemeData);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...schemeData,
        userId: 'user-1',
      });
      expect(result).toMatchObject(schemeData);
    });

    it('should create a time-based scheme', async () => {
      const schemeData = {
        exerciseId: 'exercise-1',
        name: 'AMRAP 10 minutes',
        measurementType: MeasurementType.AMRAP,
        sets: 1,
        reps: 0,
        restBetweenSets: 0,
        duration: 600,
      };

      mockRepository.create.mockResolvedValue({ ...mockScheme, ...schemeData });

      const result = await service.createScheme('user-1', schemeData);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...schemeData,
        userId: 'user-1',
      });
      expect(result.measurementType).toBe(MeasurementType.AMRAP);
    });

    it('should create a distance-based scheme', async () => {
      const schemeData = {
        exerciseId: 'exercise-1',
        name: '5K Run',
        measurementType: MeasurementType.DISTANCE_BASED,
        sets: 1,
        reps: 1,
        restBetweenSets: 0,
        distance: 5000,
        targetTime: 1800,
      };

      mockRepository.create.mockResolvedValue({ ...mockScheme, ...schemeData });

      const result = await service.createScheme('user-1', schemeData);

      expect(result.distance).toBe(5000);
      expect(result.targetTime).toBe(1800);
    });
  });

  describe('getUserSchemes', () => {
    it('should return all schemes for a user', async () => {
      const schemes = [mockScheme, { ...mockScheme, id: 'scheme-2', name: 'Another Scheme' }];
      mockRepository.findByUserId.mockResolvedValue(schemes);

      const result = await service.getUserSchemes('user-1');

      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(schemes);
    });

    it('should return empty array when user has no schemes', async () => {
      mockRepository.findByUserId.mockResolvedValue([]);

      const result = await service.getUserSchemes('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getUserSchemesByExercise', () => {
    it('should return all schemes for a user and exercise', async () => {
      const schemes = [mockScheme, { ...mockScheme, id: 'scheme-2' }];
      mockRepository.findByUserIdAndExerciseId.mockResolvedValue(schemes);

      const result = await service.getUserSchemesByExercise('user-1', 'exercise-1');

      expect(mockRepository.findByUserIdAndExerciseId).toHaveBeenCalledWith('user-1', 'exercise-1');
      expect(result).toEqual(schemes);
    });

    it('should return empty array when no schemes exist', async () => {
      mockRepository.findByUserIdAndExerciseId.mockResolvedValue([]);

      const result = await service.getUserSchemesByExercise('user-1', 'exercise-1');

      expect(result).toEqual([]);
    });
  });

  describe('getSchemeById', () => {
    it('should return a scheme when user owns it', async () => {
      mockRepository.findById.mockResolvedValue(mockScheme);

      const result = await service.getSchemeById('user-1', 'scheme-1');

      expect(mockRepository.findById).toHaveBeenCalledWith('scheme-1');
      expect(result).toEqual(mockScheme);
    });

    it('should throw NotFoundException when scheme does not exist', async () => {
      mockRepository.findById.mockResolvedValue(undefined);

      await expect(service.getSchemeById('user-1', 'scheme-1')).rejects.toThrow(NotFoundException);
      await expect(service.getSchemeById('user-1', 'scheme-1')).rejects.toThrow('Exercise scheme not found');
    });

    it('should throw NotFoundException when user does not own the scheme', async () => {
      mockRepository.findById.mockResolvedValue(mockScheme);

      await expect(service.getSchemeById('user-2', 'scheme-1')).rejects.toThrow(NotFoundException);
      await expect(service.getSchemeById('user-2', 'scheme-1')).rejects.toThrow('Exercise scheme not found');
    });
  });

  describe('updateScheme', () => {
    it('should update a scheme when user owns it', async () => {
      const updateData = { name: 'Updated Scheme', sets: 5 };
      const updatedScheme = { ...mockScheme, ...updateData };

      mockRepository.findById.mockResolvedValue(mockScheme);
      mockRepository.update.mockResolvedValue(updatedScheme);

      const result = await service.updateScheme('user-1', 'scheme-1', updateData);

      expect(mockRepository.update).toHaveBeenCalledWith('scheme-1', updateData);
      expect(result).toEqual(updatedScheme);
    });

    it('should handle partial updates', async () => {
      const updateData = { weight: 150 };
      const updatedScheme = { ...mockScheme, weight: 150 };

      mockRepository.findById.mockResolvedValue(mockScheme);
      mockRepository.update.mockResolvedValue(updatedScheme);

      const result = await service.updateScheme('user-1', 'scheme-1', updateData);

      expect(mockRepository.update).toHaveBeenCalledWith('scheme-1', updateData);
      expect(result.weight).toBe(150);
    });

    it('should throw NotFoundException when scheme does not exist', async () => {
      mockRepository.findById.mockResolvedValue(undefined);

      await expect(service.updateScheme('user-1', 'scheme-1', { name: 'Updated' })).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user does not own the scheme', async () => {
      mockRepository.findById.mockResolvedValue(mockScheme);

      await expect(service.updateScheme('user-2', 'scheme-1', { name: 'Updated' })).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when update fails', async () => {
      mockRepository.findById.mockResolvedValue(mockScheme);
      mockRepository.update.mockResolvedValue(undefined);

      await expect(service.updateScheme('user-1', 'scheme-1', { name: 'Updated' })).rejects.toThrow(NotFoundException);
      await expect(service.updateScheme('user-1', 'scheme-1', { name: 'Updated' })).rejects.toThrow('Failed to update exercise scheme');
    });
  });

  describe('deleteScheme', () => {
    it('should delete a scheme when user owns it', async () => {
      mockRepository.findById.mockResolvedValue(mockScheme);
      mockRepository.delete.mockResolvedValue(undefined);

      await service.deleteScheme('user-1', 'scheme-1');

      expect(mockRepository.delete).toHaveBeenCalledWith('scheme-1');
    });

    it('should throw NotFoundException when scheme does not exist', async () => {
      mockRepository.findById.mockResolvedValue(undefined);

      await expect(service.deleteScheme('user-1', 'scheme-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user does not own the scheme', async () => {
      mockRepository.findById.mockResolvedValue(mockScheme);

      await expect(service.deleteScheme('user-2', 'scheme-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUserSchemesByExercise', () => {
    it('should delete all schemes for a user and exercise', async () => {
      mockRepository.deleteByUserIdAndExerciseId.mockResolvedValue(undefined);

      await service.deleteUserSchemesByExercise('user-1', 'exercise-1');

      expect(mockRepository.deleteByUserIdAndExerciseId).toHaveBeenCalledWith('user-1', 'exercise-1');
    });
  });

  describe('deleteAllUserSchemes', () => {
    it('should delete all schemes for a user', async () => {
      mockRepository.deleteByUserId.mockResolvedValue(undefined);

      await service.deleteAllUserSchemes('user-1');

      expect(mockRepository.deleteByUserId).toHaveBeenCalledWith('user-1');
    });
  });

  describe('upsertScheme', () => {
    it('should upsert a scheme with userId', async () => {
      const schemeData = {
        id: 'scheme-1',
        exerciseId: 'exercise-1',
        name: 'Upserted Scheme',
        measurementType: MeasurementType.REP_BASED,
        sets: 5,
        reps: 5,
        restBetweenSets: 180,
      };

      mockRepository.upsert.mockResolvedValue({ ...mockScheme, ...schemeData });

      const result = await service.upsertScheme('user-1', schemeData);

      expect(mockRepository.upsert).toHaveBeenCalledWith({
        ...schemeData,
        userId: 'user-1',
      });
      expect(result).toMatchObject(schemeData);
    });

    it('should handle upsert without id (create)', async () => {
      const schemeData = {
        exerciseId: 'exercise-1',
        name: 'New Scheme',
        measurementType: MeasurementType.REP_BASED,
        sets: 3,
        reps: 10,
        restBetweenSets: 60,
      };

      mockRepository.upsert.mockResolvedValue({ ...mockScheme, ...schemeData, id: 'new-scheme-id' });

      const result = await service.upsertScheme('user-1', schemeData);

      expect(mockRepository.upsert).toHaveBeenCalledWith({
        ...schemeData,
        userId: 'user-1',
      });
      expect(result.id).toBeDefined();
    });
  });

  describe('join table operations', () => {
    describe('addToWorkoutSection', () => {
      it('should add scheme to workout section when user owns the scheme', async () => {
        const joinData = {
          sectionItemId: 'section-item-1',
          workoutTemplateId: 'workout-1',
          userExerciseSchemeId: 'scheme-1',
        };

        mockRepository.findById.mockResolvedValue(mockScheme);
        mockRepository.addToWorkoutSection.mockResolvedValue(joinData);

        const result = await service.addToWorkoutSection(
          'user-1',
          'scheme-1',
          'section-item-1',
          'workout-1'
        );

        expect(mockRepository.findById).toHaveBeenCalledWith('scheme-1');
        expect(mockRepository.addToWorkoutSection).toHaveBeenCalledWith({
          sectionItemId: 'section-item-1',
          workoutTemplateId: 'workout-1',
          userExerciseSchemeId: 'scheme-1',
        });
        expect(result).toEqual(joinData);
      });

      it('should throw NotFoundException when scheme does not exist', async () => {
        mockRepository.findById.mockResolvedValue(undefined);

        await expect(
          service.addToWorkoutSection('user-1', 'scheme-1', 'section-item-1', 'workout-1')
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw NotFoundException when user does not own the scheme', async () => {
        mockRepository.findById.mockResolvedValue(mockScheme);

        await expect(
          service.addToWorkoutSection('user-2', 'scheme-1', 'section-item-1', 'workout-1')
        ).rejects.toThrow(NotFoundException);

        expect(mockRepository.addToWorkoutSection).not.toHaveBeenCalled();
      });
    });

    describe('removeFromWorkoutSection', () => {
      it('should remove scheme from workout section when user owns the scheme', async () => {
        mockRepository.findById.mockResolvedValue(mockScheme);
        mockRepository.removeFromWorkoutSection.mockResolvedValue(undefined);

        await service.removeFromWorkoutSection(
          'user-1',
          'scheme-1',
          'section-item-1',
          'workout-1'
        );

        expect(mockRepository.findById).toHaveBeenCalledWith('scheme-1');
        expect(mockRepository.removeFromWorkoutSection).toHaveBeenCalledWith(
          'section-item-1',
          'workout-1',
          'scheme-1'
        );
      });

      it('should throw NotFoundException when scheme does not exist', async () => {
        mockRepository.findById.mockResolvedValue(undefined);

        await expect(
          service.removeFromWorkoutSection('user-1', 'scheme-1', 'section-item-1', 'workout-1')
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw NotFoundException when user does not own the scheme', async () => {
        mockRepository.findById.mockResolvedValue(mockScheme);

        await expect(
          service.removeFromWorkoutSection('user-2', 'scheme-1', 'section-item-1', 'workout-1')
        ).rejects.toThrow(NotFoundException);

        expect(mockRepository.removeFromWorkoutSection).not.toHaveBeenCalled();
      });
    });
  });
});
