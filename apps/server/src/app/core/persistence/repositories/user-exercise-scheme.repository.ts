import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import { NewUserExerciseScheme, UserExerciseScheme, userExerciseSchemes } from '../schemas/user-exercise-scheme.schema';
import {
  UserExerciseSchemeCompendiumWorkoutSectionItem,
  userExerciseSchemeCompendiumWorkoutSectionItems,
} from '../schemas/user-exercise-scheme-compendium-workout-section-item.schema';

@Injectable()
export class UserExerciseSchemeRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(data: NewUserExerciseScheme): Promise<UserExerciseScheme> {
    const [scheme] = await this.db.insert(userExerciseSchemes).values(data).returning();
    return scheme;
  }

  async findAll(): Promise<UserExerciseScheme[]> {
    return this.db.select().from(userExerciseSchemes);
  }

  async findByUserId(userId: string): Promise<UserExerciseScheme[]> {
    return this.db.select().from(userExerciseSchemes).where(eq(userExerciseSchemes.userId, userId));
  }

  async findByUserIdAndExerciseId(userId: string, exerciseId: string): Promise<UserExerciseScheme[]> {
    return this.db
      .select()
      .from(userExerciseSchemes)
      .where(and(eq(userExerciseSchemes.userId, userId), eq(userExerciseSchemes.exerciseId, exerciseId)));
  }

  async findById(id: string): Promise<UserExerciseScheme | undefined> {
    const [scheme] = await this.db.select().from(userExerciseSchemes).where(eq(userExerciseSchemes.id, id)).limit(1);
    return scheme;
  }

  async update(id: string, data: Partial<NewUserExerciseScheme>): Promise<UserExerciseScheme | undefined> {
    const [updated] = await this.db
      .update(userExerciseSchemes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userExerciseSchemes.id, id))
      .returning();
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(userExerciseSchemes).where(eq(userExerciseSchemes.id, id));
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.db.delete(userExerciseSchemes).where(eq(userExerciseSchemes.userId, userId));
  }

  async deleteByUserIdAndExerciseId(userId: string, exerciseId: string): Promise<void> {
    await this.db
      .delete(userExerciseSchemes)
      .where(and(eq(userExerciseSchemes.userId, userId), eq(userExerciseSchemes.exerciseId, exerciseId)));
  }

  async upsert(data: NewUserExerciseScheme & { id?: string }): Promise<UserExerciseScheme> {
    const { id, ...updateData } = data;
    const [result] = await this.db
      .insert(userExerciseSchemes)
      .values(data)
      .onConflictDoUpdate({
        target: userExerciseSchemes.id,
        set: { ...updateData, updatedAt: new Date() },
      })
      .returning();
    return result;
  }

  async assignToSectionItem(
    data: UserExerciseSchemeCompendiumWorkoutSectionItem
  ): Promise<UserExerciseSchemeCompendiumWorkoutSectionItem> {
    const [result] = await this.db.insert(userExerciseSchemeCompendiumWorkoutSectionItems).values(data).returning();
    return result;
  }

  async unassignFromSectionItem(
    sectionItemId: string,
    workoutTemplateId: string,
    userExerciseSchemeId: string
  ): Promise<void> {
    await this.db
      .delete(userExerciseSchemeCompendiumWorkoutSectionItems)
      .where(
        and(
          eq(userExerciseSchemeCompendiumWorkoutSectionItems.sectionItemId, sectionItemId),
          eq(userExerciseSchemeCompendiumWorkoutSectionItems.workoutTemplateId, workoutTemplateId),
          eq(userExerciseSchemeCompendiumWorkoutSectionItems.userExerciseSchemeId, userExerciseSchemeId)
        )
      );
  }

  async findSectionItemAssignments(
    userExerciseSchemeId: string
  ): Promise<UserExerciseSchemeCompendiumWorkoutSectionItem[]> {
    return this.db
      .select()
      .from(userExerciseSchemeCompendiumWorkoutSectionItems)
      .where(eq(userExerciseSchemeCompendiumWorkoutSectionItems.userExerciseSchemeId, userExerciseSchemeId));
  }
}
