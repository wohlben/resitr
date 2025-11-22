import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import { userWorkoutLogs, type UserWorkoutLog } from '../schemas';

@Injectable()
export class UserWorkoutLogRepository {
    constructor(@Inject(DATABASE) private readonly db: Database) { }

    async create(data: UserWorkoutLog) {
        const [result] = await this.db.insert(userWorkoutLogs).values(data).returning();
        return result;
    }

    async findAll() {
        return this.db.select().from(userWorkoutLogs);
    }

    async findById(id: string) {
        const [result] = await this.db.select().from(userWorkoutLogs).where(eq(userWorkoutLogs.id, id));
        return result;
    }

    async update(id: string, data: Partial<UserWorkoutLog>) {
        const [result] = await this.db
            .update(userWorkoutLogs)
            .set(data)
            .where(eq(userWorkoutLogs.id, id))
            .returning();
        return result;
    }

    async delete(id: string) {
        const [result] = await this.db.delete(userWorkoutLogs).where(eq(userWorkoutLogs.id, id)).returning();
        return result;
    }
}
