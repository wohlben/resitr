import { Injectable, NotFoundException } from '@nestjs/common';
import { UserWorkoutLogRepository } from '../../persistence/repositories/user-workout-log.repository';
import { UserWorkoutLogSectionRepository } from '../../persistence/repositories/user-workout-log-section.repository';
import { UserWorkoutLogSectionItemRepository } from '../../persistence/repositories/user-workout-log-section-item.repository';
import { UserWorkoutLogSetRepository } from '../../persistence/repositories/user-workout-log-set.repository';
import { UserWorkoutLogSet } from '../../persistence/schemas';
import { UpsertWorkoutLogDto } from '../../../routes/user/workout-log/dto/workout-log.dto';

@Injectable()
export class UserWorkoutLogService {
    constructor(
        private readonly logRepository: UserWorkoutLogRepository,
        private readonly logSectionRepository: UserWorkoutLogSectionRepository,
        private readonly logItemRepository: UserWorkoutLogSectionItemRepository,
        private readonly logSetRepository: UserWorkoutLogSetRepository,
    ) { }

    async upsertLog(dto: UpsertWorkoutLogDto, userId: string) {
        const sectionIds: string[] = [];

        // Bottom-up: sets → items → sections → log
        for (const sectionDto of dto.sections) {
            const itemIds: string[] = [];

            for (const itemDto of sectionDto.items) {
                const setIds: string[] = [];

                // Upsert sets first (standalone, no parent reference)
                for (const setDto of itemDto.sets) {
                    const set = await this.logSetRepository.upsert({
                        id: setDto.id,
                        targetReps: setDto.targetReps,
                        achievedReps: setDto.achievedReps,
                        targetWeight: setDto.targetWeight,
                        achievedWeight: setDto.achievedWeight,
                        targetTime: setDto.targetTime,
                        achievedTime: setDto.achievedTime,
                        targetDistance: setDto.targetDistance,
                        achievedDistance: setDto.achievedDistance,
                        completedAt: setDto.completedAt,
                        skipped: setDto.skipped,
                        createdBy: userId,
                    });
                    setIds.push(set.id);
                }

                // Upsert item with setIds array
                const item = await this.logItemRepository.upsert({
                    id: itemDto.id,
                    exerciseId: itemDto.exerciseId,
                    name: itemDto.name,
                    restBetweenSets: itemDto.restBetweenSets,
                    breakAfter: itemDto.breakAfter,
                    setIds,
                    completedAt: itemDto.completedAt,
                    createdBy: userId,
                });
                itemIds.push(item.id);
            }

            // Upsert section with itemIds array
            const section = await this.logSectionRepository.upsert({
                id: sectionDto.id,
                name: sectionDto.name,
                type: sectionDto.type,
                itemIds,
                completedAt: sectionDto.completedAt,
                createdBy: userId,
            });
            sectionIds.push(section.id);
        }

        // Upsert log with sectionIds array
        const log = await this.logRepository.upsert({
            id: dto.id,
            originalWorkoutId: dto.originalWorkoutId,
            name: dto.name,
            sectionIds,
            startedAt: dto.startedAt,
            completedAt: dto.completedAt,
            createdBy: userId,
        });

        return log;
    }

    async getLog(id: string) {
        const log = await this.logRepository.findById(id);
        if (!log) throw new NotFoundException(`Log with ID ${id} not found`);

        const [populated] = await this.populateSectionsItemsSets([log]);
        return populated;
    }

    async completeSet(setId: string, data: Partial<UserWorkoutLogSet>) {
        // Update the set
        const set = await this.logSetRepository.update(setId, { ...data, completedAt: new Date() });
        if (!set) throw new NotFoundException(`Set with ID ${setId} not found`);

        // Find the log containing this set by fetching all logs and populating
        const allLogs = await this.logRepository.findAll();
        const populatedLogs = await this.populateSectionsItemsSets(allLogs);

        // Find which log/section/item contains this set and check cascading completion
        for (const log of populatedLogs) {
            for (const section of log.sections) {
                for (const item of section.items) {
                    if (item.setIds.includes(setId)) {
                        // Check cascading completion in-memory
                        const allSetsDone = item.sets.every(s => s.completedAt || s.skipped);
                        if (allSetsDone) {
                            await this.logItemRepository.update(item.id, { completedAt: new Date() });

                            const allItemsDone = section.items.every(i =>
                                i.id === item.id || i.completedAt
                            );
                            if (allItemsDone) {
                                await this.logSectionRepository.update(section.id, { completedAt: new Date() });

                                const allSectionsDone = log.sections.every(s =>
                                    s.id === section.id || s.completedAt
                                );
                                if (allSectionsDone) {
                                    await this.logRepository.update(log.id, { completedAt: new Date() });
                                }
                            }
                        }
                        return set;
                    }
                }
            }
        }
        return set;
    }

    async skipSets(setIds: string[]) {
        const results = [];
        for (const setId of setIds) {
            const result = await this.completeSet(setId, { skipped: true });
            results.push(result);
        }
        return results;
    }

    private async populateSectionsItemsSets<T extends { sectionIds: string[] }>(logs: T[]) {
        if (logs.length === 0) return [];

        // Batch fetch all sections
        const allSectionIds = logs.flatMap(l => l.sectionIds);
        const sections = allSectionIds.length > 0
            ? await this.logSectionRepository.findByIds(allSectionIds)
            : [];
        const sectionsById = new Map(sections.map(s => [s.id, s]));

        // Batch fetch all items
        const allItemIds = sections.flatMap(s => s.itemIds);
        const items = allItemIds.length > 0
            ? await this.logItemRepository.findByIds(allItemIds)
            : [];
        const itemsById = new Map(items.map(i => [i.id, i]));

        // Batch fetch all sets
        const allSetIds = items.flatMap(i => i.setIds);
        const sets = allSetIds.length > 0
            ? await this.logSetRepository.findByIds(allSetIds)
            : [];
        const setsById = new Map(sets.map(s => [s.id, s]));

        // Build nested structure
        return logs.map(log => ({
            ...log,
            sections: log.sectionIds
                .map(sId => sectionsById.get(sId))
                .filter((s): s is NonNullable<typeof s> => s !== undefined)
                .map(section => ({
                    ...section,
                    items: section.itemIds
                        .map(iId => itemsById.get(iId))
                        .filter((i): i is NonNullable<typeof i> => i !== undefined)
                        .map(item => ({
                            ...item,
                            sets: item.setIds
                                .map(setId => setsById.get(setId))
                                .filter((s): s is NonNullable<typeof s> => s !== undefined),
                        })),
                })),
        }));
    }
}
