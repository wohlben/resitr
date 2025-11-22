import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import { userWorkoutLogSections, type UserWorkoutLogSection } from '../schemas';

@Injectable()
export class UserWorkoutLogSectionRepository {
    constructor(@Inject(DATABASE) private readonly db: Database) { }

    async create(data: UserWorkoutLogSection) {
        const [result] = await this.db.insert(userWorkoutLogSections).values(data).returning();
        return result;
    }

    async findByWorkoutLogId(workoutLogId: string) {
        return this.db.select().from(userWorkoutLogSections).where(eq(userWorkoutLogSections.workoutLogId, workoutLogId));
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
