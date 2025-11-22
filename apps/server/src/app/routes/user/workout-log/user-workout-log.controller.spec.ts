import { Test, TestingModule } from '@nestjs/testing';
import { UserWorkoutLogController } from './user-workout-log.controller';
import { UserWorkoutLogService } from '../../../core/user/workout-log/user-workout-log.service';
import { WorkoutSectionType } from '../../../core/persistence/schemas/compendium-workout-section.schema';

describe('UserWorkoutLogController', () => {
    let controller: UserWorkoutLogController;
    let service: UserWorkoutLogService;

    const mockService = {
        createLog: jest.fn(),
        upsertLog: jest.fn(),
        getLog: jest.fn(),
        updateLog: jest.fn(),
        updateSet: jest.fn(),
        completeSet: jest.fn(),
        skipSets: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserWorkoutLogController],
            providers: [
                {
                    provide: UserWorkoutLogService,
                    useValue: mockService,
                },
            ],
        }).compile();

        controller = module.get<UserWorkoutLogController>(UserWorkoutLogController);
        service = module.get<UserWorkoutLogService>(UserWorkoutLogService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createLog', () => {
        it('should call service.createLog', async () => {
            const dto = {
                name: 'Test Workout',
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
            const userId = 'user-123';
            mockService.createLog.mockResolvedValue({ id: 'l1', name: 'Test Workout' });

            const result = await controller.createLog(dto, userId);

            expect(service.createLog).toHaveBeenCalledWith(dto, userId);
            expect(result).toEqual({ id: 'l1', name: 'Test Workout' });
        });
    });

    describe('upsertLog', () => {
        it('should call service.upsertLog', async () => {
            const dto = {
                id: 'l1',
                name: 'Test Workout',
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
            const userId = 'user-123';
            mockService.upsertLog.mockResolvedValue({ id: 'l1', name: 'Test Workout' });

            const result = await controller.upsertLog(dto, userId);

            expect(service.upsertLog).toHaveBeenCalledWith(dto, userId);
            expect(result).toEqual({ id: 'l1', name: 'Test Workout' });
        });
    });

    describe('getLog', () => {
        it('should call service.getLog', async () => {
            const id = 'l1';
            mockService.getLog.mockResolvedValue({ id, name: 'Log 1' });

            const result = await controller.getLog(id);

            expect(service.getLog).toHaveBeenCalledWith(id);
            expect(result).toEqual({ id, name: 'Log 1' });
        });
    });

    describe('updateLog', () => {
        it('should call service.updateLog', async () => {
            const id = 'l1';
            const dto = { name: 'Updated' };
            mockService.updateLog.mockResolvedValue({ id, ...dto });

            const result = await controller.updateLog(id, dto);

            expect(service.updateLog).toHaveBeenCalledWith(id, dto);
            expect(result).toEqual({ id, ...dto });
        });
    });

    describe('updateSet', () => {
        it('should call service.updateSet', async () => {
            const setId = 's1';
            const dto = { achievedReps: 10 };
            mockService.updateSet.mockResolvedValue({ id: setId, ...dto });

            const result = await controller.updateSet(setId, dto);

            expect(service.updateSet).toHaveBeenCalledWith(setId, dto);
            expect(result).toEqual({ id: setId, ...dto });
        });
    });

    describe('completeSet', () => {
        it('should call service.completeSet', async () => {
            const setId = 's1';
            const dto = { achievedReps: 10 };
            mockService.completeSet.mockResolvedValue({ id: setId, ...dto, completedAt: new Date() });

            const result = await controller.completeSet(setId, dto);

            expect(service.completeSet).toHaveBeenCalledWith(setId, dto);
            expect(result).toHaveProperty('completedAt');
        });
    });

    describe('skipSets', () => {
        it('should call service.skipSets', async () => {
            const dto = { setIds: ['s1', 's2'] };
            mockService.skipSets.mockResolvedValue([
                { id: 's1', skipped: true },
                { id: 's2', skipped: true }
            ]);

            const result = await controller.skipSets(dto);

            expect(service.skipSets).toHaveBeenCalledWith(['s1', 's2']);
            expect(result).toHaveLength(2);
        });
    });
});
