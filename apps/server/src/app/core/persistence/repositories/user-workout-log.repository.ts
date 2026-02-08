import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import { userWorkoutLogs, type UserWorkoutLog } from '../schemas';

@Injectable()
export class UserWorkoutLogRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async upsert(data: UserWorkoutLog) {
    const id = data.id ?? crypto.randomUUID();
    const [result] = await this.db
      .insert(userWorkoutLogs)
      .values({ ...data, id })
      .onConflictDoUpdate({
        target: userWorkoutLogs.id,
        set: {
          originalWorkoutId: data.originalWorkoutId,
          name: data.name,
          sectionIds: data.sectionIds,
          startedAt: data.startedAt,
          completedAt: data.completedAt,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  async findAll() {
    return this.db.select().from(userWorkoutLogs);
  }

  async findByUserId(userId: string) {
    return this.db.select().from(userWorkoutLogs).where(eq(userWorkoutLogs.createdBy, userId));
  }

  async findByUserIdAndWorkoutTemplateId(userId: string, workoutTemplateId: string) {
    return this.db
      .select()
      .from(userWorkoutLogs)
      .where(and(eq(userWorkoutLogs.createdBy, userId), eq(userWorkoutLogs.originalWorkoutId, workoutTemplateId)));
  }

  async findById(id: string) {
    const [result] = await this.db.select().from(userWorkoutLogs).where(eq(userWorkoutLogs.id, id));
    return result;
  }

  async findByIds(ids: string[]) {
    if (ids.length === 0) return [];
    return this.db.select().from(userWorkoutLogs).where(inArray(userWorkoutLogs.id, ids));
  }

  async update(id: string, data: Partial<UserWorkoutLog>) {
    const [result] = await this.db.update(userWorkoutLogs).set(data).where(eq(userWorkoutLogs.id, id)).returning();
    return result;
  }

  async delete(id: string) {
    const [result] = await this.db.delete(userWorkoutLogs).where(eq(userWorkoutLogs.id, id)).returning();
    return result;
  }
}
