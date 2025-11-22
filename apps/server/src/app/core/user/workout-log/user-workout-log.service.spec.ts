import { Test, TestingModule } from '@nestjs/testing';
import { UserWorkoutLogService } from './user-workout-log.service';
import { UserWorkoutLogRepository } from '../../persistence/repositories/user-workout-log.repository';
import { UserWorkoutLogSectionRepository } from '../../persistence/repositories/user-workout-log-section.repository';
import { UserWorkoutLogSectionItemRepository } from '../../persistence/repositories/user-workout-log-section-item.repository';
import { UserWorkoutLogSetRepository } from '../../persistence/repositories/user-workout-log-set.repository';
import { UpsertWorkoutLogDto } from '../../../routes/user/workout-log/dto/workout-log.dto';
import { WorkoutSectionType } from '../../persistence/schemas/compendium-workout-section.schema';

describe('UserWorkoutLogService', () => {
    let service: UserWorkoutLogService;

    const mockLogRepo = { create: jest.fn(), findById: jest.fn(), update: jest.fn() };
    const mockLogSectionRepo = { create: jest.fn(), update: jest.fn(), findByWorkoutLogId: jest.fn(), delete: jest.fn() };
    const mockLogItemRepo = { create: jest.fn(), update: jest.fn(), findBySectionId: jest.fn() };
    const mockLogSetRepo = { create: jest.fn(), update: jest.fn(), findByItemId: jest.fn() };

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

    it('should upsert a log when ID is provided and log exists', async () => {
        const userId = 'u1';
        const dto = {
            id: 'l1',
            originalWorkoutId: 'w1',
            name: 'Updated Workout',
            startedAt: new Date(),
            sections: [
                {
                    id: 's1',
                    name: 'Warmup',
                    orderIndex: 0,
                    type: WorkoutSectionType.WARMUP,
                    items: [
                        {
                            id: 'i1',
                            exerciseId: 'ex1',
                            name: 'Pushups',
                            orderIndex: 0,
                            restBetweenSets: 30,
                            breakAfter: 60,
                            sets: [
                                { id: 'set1', orderIndex: 0, targetReps: 10, achievedReps: 10 }
                            ]
                        }
                    ]
                }
            ]
        };

        mockLogRepo.findById.mockResolvedValue({ id: 'l1' });
        mockLogRepo.update.mockResolvedValue({ id: 'l1', name: 'Updated Workout' });
        mockLogSectionRepo.findByWorkoutLogId.mockResolvedValue([{ id: 's1' }]);
        mockLogSectionRepo.delete.mockResolvedValue({ id: 's1' });
        mockLogSectionRepo.create.mockResolvedValue({ id: 's1' });
        mockLogItemRepo.create.mockResolvedValue({ id: 'i1' });
        mockLogSetRepo.create.mockResolvedValue({ id: 'set1' });

        await service.upsertLog(dto, userId);

        expect(mockLogRepo.findById).toHaveBeenCalledWith('l1');
        expect(mockLogRepo.update).toHaveBeenCalledWith('l1', expect.objectContaining({
            name: 'Updated Workout'
        }));
        expect(mockLogSectionRepo.delete).toHaveBeenCalled();
        expect(mockLogSectionRepo.create).toHaveBeenCalled();
    });

    it('should upsert a log when ID is provided but log does not exist', async () => {
        const userId = 'u1';
        const dto = {
            id: 'l1',
            name: 'New Workout',
            startedAt: new Date(),
            sections: [
                {
                    name: 'Warmup',
                    orderIndex: 0,
                    type: WorkoutSectionType.WARMUP,
                    items: [
                        {
                            exerciseId: 'ex1',
                            name: 'Pushups',
                            orderIndex: 0,
                            restBetweenSets: 30,
                            breakAfter: 60,
                            sets: [
                                { orderIndex: 0, targetReps: 10 }
                            ]
                        }
                    ]
                }
            ]
        };

        mockLogRepo.findById.mockResolvedValue(null);
        mockLogRepo.create.mockResolvedValue({ id: 'l1', name: 'New Workout' });
        mockLogSectionRepo.findByWorkoutLogId.mockResolvedValue([]);
        mockLogSectionRepo.create.mockResolvedValue({ id: 's1' });
        mockLogItemRepo.create.mockResolvedValue({ id: 'i1' });
        mockLogSetRepo.create.mockResolvedValue({ id: 'set1' });

        await service.upsertLog(dto, userId);

        expect(mockLogRepo.findById).toHaveBeenCalledWith('l1');
        expect(mockLogRepo.create).toHaveBeenCalledWith(expect.objectContaining({
            id: 'l1',
            name: 'New Workout',
            createdBy: userId
        }));
    });

    it('should upsert a log when no ID is provided', async () => {
        const userId = 'u1';
        const dto = {
            name: 'New Workout',
            startedAt: new Date(),
            sections: [
                {
                    name: 'Warmup',
                    orderIndex: 0,
                    type: WorkoutSectionType.WARMUP,
                    items: [
                        {
                            exerciseId: 'ex1',
                            name: 'Pushups',
                            orderIndex: 0,
                            restBetweenSets: 30,
                            breakAfter: 60,
                            sets: [
                                { orderIndex: 0, targetReps: 10 }
                            ]
                        }
                    ]
                }
            ]
        };

        mockLogRepo.create.mockResolvedValue({ id: 'l1', name: 'New Workout' });
        mockLogSectionRepo.findByWorkoutLogId.mockResolvedValue([]);
        mockLogSectionRepo.create.mockResolvedValue({ id: 's1' });
        mockLogItemRepo.create.mockResolvedValue({ id: 'i1' });
        mockLogSetRepo.create.mockResolvedValue({ id: 'set1' });

        await service.upsertLog(dto, userId);

        expect(mockLogRepo.findById).not.toHaveBeenCalled();
        expect(mockLogRepo.create).toHaveBeenCalledWith(expect.objectContaining({
            name: 'New Workout',
            createdBy: userId
        }));
    });

    it('should get a log with nested sections, items, and sets', async () => {
        const logId = 'l1';
        mockLogRepo.findById.mockResolvedValue({ id: logId, name: 'Test Workout' });
        mockLogSectionRepo.findByWorkoutLogId.mockResolvedValue([
            { id: 's1', workoutLogId: logId, name: 'Warmup', orderIndex: 0 }
        ]);
        mockLogItemRepo.findBySectionId.mockResolvedValue([
            { id: 'i1', sectionId: 's1', name: 'Pushups', orderIndex: 0 }
        ]);
        mockLogSetRepo.findByItemId.mockResolvedValue([
            { id: 'set1', itemId: 'i1', orderIndex: 0, targetReps: 10 }
        ]);

        const result = await service.getLog(logId);

        expect(mockLogRepo.findById).toHaveBeenCalledWith(logId);
        expect(result).toEqual(expect.objectContaining({
            id: logId,
            name: 'Test Workout',
            sections: expect.arrayContaining([
                expect.objectContaining({
                    name: 'Warmup',
                    items: expect.arrayContaining([
                        expect.objectContaining({
                            name: 'Pushups',
                            sets: expect.arrayContaining([
                                expect.objectContaining({ targetReps: 10 })
                            ])
                        })
                    ])
                })
            ])
        }));
    });

    it('should complete a set and cascade completion', async () => {
        const setId = 'set1';
        const itemId = 'item1';
        const sectionId = 'section1';
        const logId = 'log1';

        mockLogSetRepo.update.mockResolvedValue({ id: setId, itemId, completedAt: new Date() });
        mockLogSetRepo.findByItemId.mockResolvedValue([
            { id: setId, completedAt: new Date() },
            { id: 'set2', completedAt: new Date() }
        ]);
        mockLogItemRepo.update.mockResolvedValue({ id: itemId, sectionId, completedAt: new Date() });
        mockLogItemRepo.findBySectionId.mockResolvedValue([
            { id: itemId, completedAt: new Date() }
        ]);
        mockLogSectionRepo.update.mockResolvedValue({ id: sectionId, workoutLogId: logId, completedAt: new Date() });
        mockLogSectionRepo.findByWorkoutLogId.mockResolvedValue([
            { id: sectionId, completedAt: new Date() }
        ]);

        await service.completeSet(setId, { achievedReps: 10 });

        expect(mockLogSetRepo.update).toHaveBeenCalledWith(setId, expect.objectContaining({ achievedReps: 10, completedAt: expect.any(Date) }));
        expect(mockLogItemRepo.update).toHaveBeenCalledWith(itemId, expect.objectContaining({ completedAt: expect.any(Date) }));
        expect(mockLogSectionRepo.update).toHaveBeenCalledWith(sectionId, expect.objectContaining({ completedAt: expect.any(Date) }));
        expect(mockLogRepo.update).toHaveBeenCalledWith(logId, expect.objectContaining({ completedAt: expect.any(Date) }));
    });

    it('should skip sets', async () => {
        const setIds = ['set1', 'set2'];
        mockLogSetRepo.update.mockResolvedValue({ id: 'set1', skipped: true, completedAt: new Date() });
        mockLogSetRepo.findByItemId.mockResolvedValue([{ id: 'set1', skipped: true, completedAt: new Date() }]);
        mockLogItemRepo.update.mockResolvedValue({ id: 'item1', completedAt: new Date() });
        mockLogItemRepo.findBySectionId.mockResolvedValue([{ id: 'item1', completedAt: new Date() }]);
        mockLogSectionRepo.update.mockResolvedValue({ id: 'section1', completedAt: new Date() });
        mockLogSectionRepo.findByWorkoutLogId.mockResolvedValue([{ id: 'section1', completedAt: new Date() }]);

        await service.skipSets(setIds);

        expect(mockLogSetRepo.update).toHaveBeenCalledWith('set1', expect.objectContaining({ skipped: true, completedAt: expect.any(Date) }));
    });
});
