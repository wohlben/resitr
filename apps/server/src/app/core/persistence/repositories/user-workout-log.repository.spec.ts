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

    describe('upsert', () => {
        it('should create a log with all fields', async () => {
            const logData = {
                name: 'Test Log',
                startedAt: new Date(),
                createdBy: 'user-1',
                originalWorkoutId: null,
                sectionIds: [],
            };

            const result = await repository.upsert(logData);

            expect(result).toMatchObject({
                name: 'Test Log',
                createdBy: 'user-1',
            });
            expect(result.id).toBeDefined();
            expect(result.createdAt).toBeDefined();
            expect(result.startedAt).toBeDefined();
        });

        it('should update a log when ID exists', async () => {
            const created = await repository.upsert({
                name: 'Initial Name',
                startedAt: new Date(),
                createdBy: 'user-1',
                sectionIds: [],
            });

            const updated = await repository.upsert({
                id: created.id,
                name: 'Updated Name',
                startedAt: new Date(),
                createdBy: 'user-1',
                sectionIds: ['s1'],
            });

            expect(updated.id).toBe(created.id);
            expect(updated.name).toBe('Updated Name');
            expect(updated.sectionIds).toEqual(['s1']);
        });
    });

    describe('findById', () => {
        it('should find a log by id', async () => {
            const created = await repository.upsert({
                name: 'Find Me',
                startedAt: new Date(),
                createdBy: 'user-1',
                sectionIds: [],
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
            const created = await repository.upsert({
                name: 'Update Me',
                startedAt: new Date(),
                createdBy: 'user-1',
                sectionIds: [],
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
            const created = await repository.upsert({
                name: 'Delete Me',
                startedAt: new Date(),
                createdBy: 'user-1',
                sectionIds: [],
            });

            await repository.delete(created.id);

            const found = await repository.findById(created.id);
            expect(found).toBeUndefined();
        });
    });
});
