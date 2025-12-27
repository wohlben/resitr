import { Inject, Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import { userWorkoutLogSections, type UserWorkoutLogSection } from '../schemas';

@Injectable()
export class UserWorkoutLogSectionRepository {
    constructor(@Inject(DATABASE) private readonly db: Database) { }

    async upsert(data: UserWorkoutLogSection) {
        const id = data.id ?? crypto.randomUUID();
        const [result] = await this.db
            .insert(userWorkoutLogSections)
            .values({ ...data, id })
            .onConflictDoUpdate({
                target: userWorkoutLogSections.id,
                set: {
                    name: data.name,
                    type: data.type,
                    itemIds: data.itemIds,
                    completedAt: data.completedAt,
                },
            })
            .returning();
        return result;
    }

    async findById(id: string) {
        const [result] = await this.db.select().from(userWorkoutLogSections).where(eq(userWorkoutLogSections.id, id));
        return result;
    }

    async findByIds(ids: string[]) {
        if (ids.length === 0) return [];
        return this.db.select().from(userWorkoutLogSections).where(inArray(userWorkoutLogSections.id, ids));
    }

    async update(id: string, data: Partial<UserWorkoutLogSection>) {
        const [result] = await this.db
            .update(userWorkoutLogSections)
            .set(data)
            .where(eq(userWorkoutLogSections.id, id))
            .returning();
        return result;
    }

    async delete(id: string) {
        const [result] = await this.db.delete(userWorkoutLogSections).where(eq(userWorkoutLogSections.id, id)).returning();
        return result;
    }
}
