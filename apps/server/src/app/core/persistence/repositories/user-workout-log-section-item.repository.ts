import { Inject, Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import { userWorkoutLogSectionItems, type UserWorkoutLogSectionItem } from '../schemas';

@Injectable()
export class UserWorkoutLogSectionItemRepository {
    constructor(@Inject(DATABASE) private readonly db: Database) { }

    async upsert(data: UserWorkoutLogSectionItem) {
        const id = data.id ?? crypto.randomUUID();
        const [result] = await this.db
            .insert(userWorkoutLogSectionItems)
            .values({ ...data, id })
            .onConflictDoUpdate({
                target: userWorkoutLogSectionItems.id,
                set: {
                    exerciseId: data.exerciseId,
                    name: data.name,
                    restBetweenSets: data.restBetweenSets,
                    breakAfter: data.breakAfter,
                    setIds: data.setIds,
                    completedAt: data.completedAt,
                },
            })
            .returning();
        return result;
    }

    async findById(id: string) {
        const [result] = await this.db.select().from(userWorkoutLogSectionItems).where(eq(userWorkoutLogSectionItems.id, id));
        return result;
    }

    async findByIds(ids: string[]) {
        if (ids.length === 0) return [];
        return this.db.select().from(userWorkoutLogSectionItems).where(inArray(userWorkoutLogSectionItems.id, ids));
    }

    async update(id: string, data: Partial<UserWorkoutLogSectionItem>) {
        const [result] = await this.db
            .update(userWorkoutLogSectionItems)
            .set(data)
            .where(eq(userWorkoutLogSectionItems.id, id))
            .returning();
        return result;
    }

    async delete(id: string) {
        const [result] = await this.db.delete(userWorkoutLogSectionItems).where(eq(userWorkoutLogSectionItems.id, id)).returning();
        return result;
    }
}
