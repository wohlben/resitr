import { Inject, Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import { userWorkoutLogSectionItems, type UserWorkoutLogSectionItem } from '../schemas';

@Injectable()
export class UserWorkoutLogSectionItemRepository {
    constructor(@Inject(DATABASE) private readonly db: Database) { }

    async create(data: UserWorkoutLogSectionItem) {
        const [result] = await this.db.insert(userWorkoutLogSectionItems).values(data).returning();
        return result;
    }

    async findBySectionId(sectionId: string) {
        return this.db.select().from(userWorkoutLogSectionItems).where(eq(userWorkoutLogSectionItems.sectionId, sectionId)).orderBy(asc(userWorkoutLogSectionItems.orderIndex));
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
