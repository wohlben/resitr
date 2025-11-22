import { Injectable, NotFoundException } from '@nestjs/common';
import { UserWorkoutLogRepository } from '../../persistence/repositories/user-workout-log.repository';
import { UserWorkoutLogSectionRepository } from '../../persistence/repositories/user-workout-log-section.repository';
import { UserWorkoutLogSectionItemRepository } from '../../persistence/repositories/user-workout-log-section-item.repository';
import { UserWorkoutLogSetRepository } from '../../persistence/repositories/user-workout-log-set.repository';
import { UserWorkoutLog, UserWorkoutLogSet } from '../../persistence/schemas';
import { CreateWorkoutLogDto, UpsertWorkoutLogDto } from '../../../routes/user/workout-log/dto/workout-log.dto';

@Injectable()
export class UserWorkoutLogService {
    constructor(
        private readonly logRepository: UserWorkoutLogRepository,
        private readonly logSectionRepository: UserWorkoutLogSectionRepository,
        private readonly logItemRepository: UserWorkoutLogSectionItemRepository,
        private readonly logSetRepository: UserWorkoutLogSetRepository,
    ) { }

    async createLog(dto: CreateWorkoutLogDto, userId: string) {
        // Create the workout log
        const log = await this.logRepository.create({
            originalWorkoutId: dto.originalWorkoutId,
            name: dto.name,
            startedAt: dto.startedAt,
            completedAt: dto.completedAt,
            duration: dto.duration,
            createdBy: userId,
        });

        // Create sections, items, and sets from the provided payload
        for (const sectionDto of dto.sections) {
            const section = await this.logSectionRepository.create({
                workoutLogId: log.id,
                name: sectionDto.name,
                orderIndex: sectionDto.orderIndex,
                type: sectionDto.type,
                completedAt: sectionDto.completedAt,
                createdBy: userId,
            });

            for (const itemDto of sectionDto.items) {
                const item = await this.logItemRepository.create({
                    sectionId: section.id,
                    exerciseId: itemDto.exerciseId,
                    name: itemDto.name,
                    orderIndex: itemDto.orderIndex,
                    restBetweenSets: itemDto.restBetweenSets,
                    breakAfter: itemDto.breakAfter,
                    completedAt: itemDto.completedAt,
                    createdBy: userId,
                });

                for (const setDto of itemDto.sets) {
                    await this.logSetRepository.create({
                        itemId: item.id,
                        orderIndex: setDto.orderIndex,
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
                }
            }
        }

        return log;
    }

    async upsertLog(dto: UpsertWorkoutLogDto, userId: string) {
        // If ID exists, we're updating, otherwise creating
        let log;
        if (dto.id) {
            const existingLog = await this.logRepository.findById(dto.id);
            if (existingLog) {
                log = await this.logRepository.update(dto.id, {
                    originalWorkoutId: dto.originalWorkoutId,
                    name: dto.name,
                    startedAt: dto.startedAt,
                    completedAt: dto.completedAt,
                    duration: dto.duration,
                });
            } else {
                // ID provided but not found, create with that ID
                log = await this.logRepository.create({
                    id: dto.id,
                    originalWorkoutId: dto.originalWorkoutId,
                    name: dto.name,
                    startedAt: dto.startedAt,
                    completedAt: dto.completedAt,
                    duration: dto.duration,
                    createdBy: userId,
                });
            }
        } else {
            // No ID provided, create new
            log = await this.logRepository.create({
                originalWorkoutId: dto.originalWorkoutId,
                name: dto.name,
                startedAt: dto.startedAt,
                completedAt: dto.completedAt,
                duration: dto.duration,
                createdBy: userId,
            });
        }

        // Delete all existing sections for this log (cascade will handle items and sets)
        const existingSections = await this.logSectionRepository.findByWorkoutLogId(log.id);
        for (const existingSection of existingSections) {
            await this.logSectionRepository.delete(existingSection.id);
        }

        // Create/update sections, items, and sets from the provided payload
        for (const sectionDto of dto.sections) {
            const section = await this.logSectionRepository.create({
                id: sectionDto.id,
                workoutLogId: log.id,
                name: sectionDto.name,
                orderIndex: sectionDto.orderIndex,
                type: sectionDto.type,
                completedAt: sectionDto.completedAt,
                createdBy: userId,
            });

            for (const itemDto of sectionDto.items) {
                const item = await this.logItemRepository.create({
                    id: itemDto.id,
                    sectionId: section.id,
                    exerciseId: itemDto.exerciseId,
                    name: itemDto.name,
                    orderIndex: itemDto.orderIndex,
                    restBetweenSets: itemDto.restBetweenSets,
                    breakAfter: itemDto.breakAfter,
                    completedAt: itemDto.completedAt,
                    createdBy: userId,
                });

                for (const setDto of itemDto.sets) {
                    await this.logSetRepository.create({
                        id: setDto.id,
                        itemId: item.id,
                        orderIndex: setDto.orderIndex,
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
                }
            }
        }

        return log;
    }

    async getLog(id: string) {
        const log = await this.logRepository.findById(id);
        if (!log) throw new NotFoundException(`Log with ID ${id} not found`);

        const sections = await this.logSectionRepository.findByWorkoutLogId(log.id);
        const sectionsWithItems = await Promise.all(sections.map(async (section) => {
            const items = await this.logItemRepository.findBySectionId(section.id);
            const itemsWithSets = await Promise.all(items.map(async (item) => {
                const sets = await this.logSetRepository.findByItemId(item.id);
                return { ...item, sets: sets.sort((a, b) => a.orderIndex - b.orderIndex) };
            }));
            return { ...section, items: itemsWithSets.sort((a, b) => a.orderIndex - b.orderIndex) };
        }));

        return { ...log, sections: sectionsWithItems.sort((a, b) => a.orderIndex - b.orderIndex) };
    }

    async updateLog(id: string, data: Partial<UserWorkoutLog>) {
        return this.logRepository.update(id, data);
    }

    async updateSet(setId: string, data: Partial<UserWorkoutLogSet>) {
        return this.logSetRepository.update(setId, data);
    }

    async completeSet(setId: string, data: Partial<UserWorkoutLogSet>) {
        const set = await this.logSetRepository.update(setId, { ...data, completedAt: new Date() });
        if (!set) throw new NotFoundException(`Set with ID ${setId} not found`);

        const allSets = await this.logSetRepository.findByItemId(set.itemId);
        const allSetsDone = allSets.every(s => s.completedAt || s.skipped);

        if (allSetsDone) {
            const item = await this.logItemRepository.update(set.itemId, { completedAt: new Date() });
            if (item) {
                const allItems = await this.logItemRepository.findBySectionId(item.sectionId);
                const allItemsDone = allItems.every(i => i.completedAt);

                if (allItemsDone) {
                    const section = await this.logSectionRepository.update(item.sectionId, { completedAt: new Date() });
                    if (section) {
                        const allSections = await this.logSectionRepository.findByWorkoutLogId(section.workoutLogId);
                        const allSectionsDone = allSections.every(s => s.completedAt);

                        if (allSectionsDone) {
                            await this.logRepository.update(section.workoutLogId, { completedAt: new Date() });
                        }
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
}
