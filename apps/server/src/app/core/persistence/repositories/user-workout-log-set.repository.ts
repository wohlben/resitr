import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import { userWorkoutLogSets, type UserWorkoutLogSet } from '../schemas';

@Injectable()
export class UserWorkoutLogSetRepository {
    constructor(@Inject(DATABASE) private readonly db: Database) { }

    async create(data: UserWorkoutLogSet) {
        const [result] = await this.db.insert(userWorkoutLogSets).values(data).returning();
        return result;
    }

    async findByItemId(itemId: string) {
        return this.db.select().from(userWorkoutLogSets).where(eq(userWorkoutLogSets.itemId, itemId));
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
