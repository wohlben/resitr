import { Inject, Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import { userWorkoutLogSets, type UserWorkoutLogSet } from '../schemas';

@Injectable()
export class UserWorkoutLogSetRepository {
    constructor(@Inject(DATABASE) private readonly db: Database) { }

    async upsert(data: UserWorkoutLogSet) {
        const id = data.id ?? crypto.randomUUID();
        const [result] = await this.db
            .insert(userWorkoutLogSets)
            .values({ ...data, id })
            .onConflictDoUpdate({
                target: userWorkoutLogSets.id,
                set: {
                    targetReps: data.targetReps,
                    achievedReps: data.achievedReps,
                    targetWeight: data.targetWeight,
                    achievedWeight: data.achievedWeight,
                    targetTime: data.targetTime,
                    achievedTime: data.achievedTime,
                    targetDistance: data.targetDistance,
                    achievedDistance: data.achievedDistance,
                    completedAt: data.completedAt,
                    skipped: data.skipped,
                },
            })
            .returning();
        return result;
    }

    async findById(id: string) {
        const [result] = await this.db.select().from(userWorkoutLogSets).where(eq(userWorkoutLogSets.id, id));
        return result;
    }

    async findByIds(ids: string[]) {
        if (ids.length === 0) return [];
        return this.db.select().from(userWorkoutLogSets).where(inArray(userWorkoutLogSets.id, ids));
    }

    async update(id: string, data: Partial<UserWorkoutLogSet>) {
        const [result] = await this.db
            .update(userWorkoutLogSets)
            .set(data)
            .where(eq(userWorkoutLogSets.id, id))
            .returning();
        return result;
    }

    async delete(id: string) {
        const [result] = await this.db.delete(userWorkoutLogSets).where(eq(userWorkoutLogSets.id, id)).returning();
        return result;
    }
}
