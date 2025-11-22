import { Test, TestingModule } from '@nestjs/testing';
import { UserWorkoutLogRepository } from './user-workout-log.repository';
import { provideTestDatabase } from '../database';

describe('UserWorkoutLogRepository', () => {
    let repository: UserWorkoutLogRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [provideTestDatabase(), UserWorkoutLogRepository],
        }).compile();

        repository = module.get<UserWorkoutLogRepository>(UserWorkoutLogRepository);
    });

    describe('create', () => {
        it('should create a log with all fields', async () => {
            const logData = {
                name: 'Test Log',
                startedAt: new Date(),
                createdBy: 'user-1',
                originalWorkoutId: null,
            };

            const result = await repository.create(logData);

            expect(result).toMatchObject({
                name: 'Test Log',
                createdBy: 'user-1',
            });
            expect(result.id).toBeDefined();
            expect(result.createdAt).toBeDefined();
            expect(result.startedAt).toBeDefined();
        });
    });

    describe('findById', () => {
        it('should find a log by id', async () => {
            const created = await repository.create({
                name: 'Find Me',
                startedAt: new Date(),
                createdBy: 'user-1',
            });

            const result = await repository.findById(created.id);

            expect(result).toMatchObject({
                id: created.id,
                name: 'Find Me',
            });
        });

        it('should return undefined when log does not exist', async () => {
            const result = await repository.findById('nonexistent');
            expect(result).toBeUndefined();
        });
    });

    describe('update', () => {
        it('should update a log', async () => {
            const created = await repository.create({
                name: 'Update Me',
                startedAt: new Date(),
                createdBy: 'user-1',
            });

            const result = await repository.update(created.id, { name: 'Updated Name' });

            expect(result).toMatchObject({
                id: created.id,
                name: 'Updated Name',
            });
        });
    });

    describe('delete', () => {
        it('should delete a log', async () => {
            const created = await repository.create({
                name: 'Delete Me',
                startedAt: new Date(),
                createdBy: 'user-1',
            });

            await repository.delete(created.id);

            const found = await repository.findById(created.id);
            expect(found).toBeUndefined();
        });
    });
});
