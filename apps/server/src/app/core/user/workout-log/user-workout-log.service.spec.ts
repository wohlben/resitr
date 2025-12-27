import { Test, TestingModule } from '@nestjs/testing';
import { UserWorkoutLogService } from './user-workout-log.service';
import { UserWorkoutLogRepository } from '../../persistence/repositories/user-workout-log.repository';
import { UserWorkoutLogSectionRepository } from '../../persistence/repositories/user-workout-log-section.repository';
import { UserWorkoutLogSectionItemRepository } from '../../persistence/repositories/user-workout-log-section-item.repository';
import { UserWorkoutLogSetRepository } from '../../persistence/repositories/user-workout-log-set.repository';
import { WorkoutSectionType } from '../../persistence/schemas/compendium-workout-section.schema';

describe('UserWorkoutLogService', () => {
    let service: UserWorkoutLogService;

    const mockLogRepo = {
        upsert: jest.fn(),
        findById: jest.fn(),
        findByIds: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn()
    };
    const mockLogSectionRepo = {
        upsert: jest.fn(),
        findById: jest.fn(),
        findByIds: jest.fn(),
        update: jest.fn()
    };
    const mockLogItemRepo = {
        upsert: jest.fn(),
        findById: jest.fn(),
        findByIds: jest.fn(),
        update: jest.fn()
    };
    const mockLogSetRepo = {
        upsert: jest.fn(),
        findById: jest.fn(),
        findByIds: jest.fn(),
        update: jest.fn()
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserWorkoutLogService,
                { provide: UserWorkoutLogRepository, useValue: mockLogRepo },
                { provide: UserWorkoutLogSectionRepository, useValue: mockLogSectionRepo },
                { provide: UserWorkoutLogSectionItemRepository, useValue: mockLogItemRepo },
                { provide: UserWorkoutLogSetRepository, useValue: mockLogSetRepo },
            ],
        }).compile();

        service = module.get<UserWorkoutLogService>(UserWorkoutLogService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should upsert a log with nested structure (bottom-up)', async () => {
        const userId = 'u1';
        const dto = {
            id: 'l1',
            originalWorkoutId: 'w1',
            name: 'Test Workout',
            startedAt: new Date(),
            sections: [
                {
                    id: 's1',
                    name: 'Warmup',
                    type: WorkoutSectionType.WARMUP,
                    items: [
                        {
                            id: 'i1',
                            exerciseId: 'ex1',
                            name: 'Pushups',
                            restBetweenSets: 30,
                            breakAfter: 60,
                            sets: [
                                { id: 'set1', targetReps: 10, achievedReps: 10 }
                            ]
                        }
                    ]
                }
            ]
        };

        // Sets are upserted first
        mockLogSetRepo.upsert.mockResolvedValue({ id: 'set1' });
        // Then items with setIds
        mockLogItemRepo.upsert.mockResolvedValue({ id: 'i1' });
        // Then sections with itemIds
        mockLogSectionRepo.upsert.mockResolvedValue({ id: 's1' });
        // Finally log with sectionIds
        mockLogRepo.upsert.mockResolvedValue({ id: 'l1', name: 'Test Workout', sectionIds: ['s1'] });

        const result = await service.upsertLog(dto, userId);

        // Verify bottom-up order: sets → items → sections → log
        expect(mockLogSetRepo.upsert).toHaveBeenCalledWith(expect.objectContaining({
            id: 'set1',
            targetReps: 10,
            createdBy: userId
        }));
        expect(mockLogItemRepo.upsert).toHaveBeenCalledWith(expect.objectContaining({
            id: 'i1',
            setIds: ['set1'],
            createdBy: userId
        }));
        expect(mockLogSectionRepo.upsert).toHaveBeenCalledWith(expect.objectContaining({
            id: 's1',
            itemIds: ['i1'],
            createdBy: userId
        }));
        expect(mockLogRepo.upsert).toHaveBeenCalledWith(expect.objectContaining({
            id: 'l1',
            sectionIds: ['s1'],
            createdBy: userId
        }));
        expect(result).toEqual(expect.objectContaining({ id: 'l1' }));
    });

    it('should upsert a log without IDs (generates UUIDs)', async () => {
        const userId = 'u1';
        const dto = {
            name: 'New Workout',
            startedAt: new Date(),
            sections: [
                {
                    name: 'Warmup',
                    type: WorkoutSectionType.WARMUP,
                    items: [
                        {
                            exerciseId: 'ex1',
                            name: 'Pushups',
                            restBetweenSets: 30,
                            breakAfter: 60,
                            sets: [
                                { targetReps: 10 }
                            ]
                        }
                    ]
                }
            ]
        };

        mockLogSetRepo.upsert.mockResolvedValue({ id: 'generated-set-id' });
        mockLogItemRepo.upsert.mockResolvedValue({ id: 'generated-item-id' });
        mockLogSectionRepo.upsert.mockResolvedValue({ id: 'generated-section-id' });
        mockLogRepo.upsert.mockResolvedValue({ id: 'generated-log-id', name: 'New Workout' });

        await service.upsertLog(dto, userId);

        expect(mockLogSetRepo.upsert).toHaveBeenCalledWith(expect.objectContaining({
            id: undefined,
            createdBy: userId
        }));
        expect(mockLogRepo.upsert).toHaveBeenCalledWith(expect.objectContaining({
            id: undefined,
            sectionIds: ['generated-section-id']
        }));
    });

    it('should get a log with nested sections, items, and sets', async () => {
        const logId = 'l1';
        const log = { id: logId, name: 'Test Workout', sectionIds: ['s1'] };
        const section = { id: 's1', name: 'Warmup', itemIds: ['i1'] };
        const item = { id: 'i1', name: 'Pushups', setIds: ['set1'] };
        const set = { id: 'set1', targetReps: 10 };

        mockLogRepo.findById.mockResolvedValue(log);
        mockLogSectionRepo.findByIds.mockResolvedValue([section]);
        mockLogItemRepo.findByIds.mockResolvedValue([item]);
        mockLogSetRepo.findByIds.mockResolvedValue([set]);

        const result = await service.getLog(logId);

        expect(mockLogRepo.findById).toHaveBeenCalledWith(logId);
        expect(mockLogSectionRepo.findByIds).toHaveBeenCalledWith(['s1']);
        expect(mockLogItemRepo.findByIds).toHaveBeenCalledWith(['i1']);
        expect(mockLogSetRepo.findByIds).toHaveBeenCalledWith(['set1']);

        expect(result).toEqual({
            ...log,
            sections: [{
                ...section,
                items: [{
                    ...item,
                    sets: [set]
                }]
            }]
        });
    });

    it('should complete a set and cascade completion', async () => {
        const setId = 'set1';
        const log = { id: 'log1', sectionIds: ['s1'] };
        const section = { id: 's1', itemIds: ['i1'] };
        const item = { id: 'i1', setIds: ['set1', 'set2'] };
        const set1 = { id: 'set1', completedAt: new Date() };
        const set2 = { id: 'set2', completedAt: new Date() };

        mockLogSetRepo.update.mockResolvedValue({ id: setId, completedAt: new Date() });
        mockLogRepo.findAll.mockResolvedValue([log]);
        mockLogSectionRepo.findByIds.mockResolvedValue([section]);
        mockLogItemRepo.findByIds.mockResolvedValue([item]);
        mockLogSetRepo.findByIds.mockResolvedValue([set1, set2]);
        mockLogItemRepo.update.mockResolvedValue({ id: 'i1', completedAt: new Date() });
        mockLogSectionRepo.update.mockResolvedValue({ id: 's1', completedAt: new Date() });
        mockLogRepo.update.mockResolvedValue({ id: 'log1', completedAt: new Date() });

        await service.completeSet(setId, { achievedReps: 10 });

        expect(mockLogSetRepo.update).toHaveBeenCalledWith(setId, expect.objectContaining({
            achievedReps: 10,
            completedAt: expect.any(Date)
        }));
        // All sets are done, so item should be marked complete
        expect(mockLogItemRepo.update).toHaveBeenCalledWith('i1', expect.objectContaining({
            completedAt: expect.any(Date)
        }));
    });

    it('should skip sets', async () => {
        const setIds = ['set1', 'set2'];
        const log = { id: 'log1', sectionIds: ['s1'] };
        const section = { id: 's1', itemIds: ['i1'] };
        const item = { id: 'i1', setIds: ['set1'] };

        mockLogSetRepo.update.mockResolvedValue({ id: 'set1', skipped: true, completedAt: new Date() });
        mockLogRepo.findAll.mockResolvedValue([log]);
        mockLogSectionRepo.findByIds.mockResolvedValue([section]);
        mockLogItemRepo.findByIds.mockResolvedValue([item]);
        mockLogSetRepo.findByIds.mockResolvedValue([{ id: 'set1', skipped: true, completedAt: new Date() }]);
        mockLogItemRepo.update.mockResolvedValue({ id: 'i1', completedAt: new Date() });
        mockLogSectionRepo.update.mockResolvedValue({ id: 's1', completedAt: new Date() });
        mockLogRepo.update.mockResolvedValue({ id: 'log1', completedAt: new Date() });

        await service.skipSets(setIds);

        expect(mockLogSetRepo.update).toHaveBeenCalledWith('set1', expect.objectContaining({
            skipped: true,
            completedAt: expect.any(Date)
        }));
    });
});
