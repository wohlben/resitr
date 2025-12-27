import { Inject, Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import { userExerciseSchemeCompendiumWorkoutSectionItems } from '../schemas/user-exercise-scheme-compendium-workout-section-item.schema';
import type { UserExerciseSchemeCompendiumWorkoutSectionItem } from '../schemas/user-exercise-scheme-compendium-workout-section-item.schema';

@Injectable()
export class UserExerciseSchemeCompendiumWorkoutSectionItemRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(data: UserExerciseSchemeCompendiumWorkoutSectionItem) {
    const result = await this.db
      .insert(userExerciseSchemeCompendiumWorkoutSectionItems)
      .values(data)
      .returning();
    return result[0];
  }

  async findBySectionItemId(sectionItemId: string) {
    return await this.db
      .select()
      .from(userExerciseSchemeCompendiumWorkoutSectionItems)
      .where(eq(userExerciseSchemeCompendiumWorkoutSectionItems.sectionItemId, sectionItemId));
  }

  async findByUserWorkoutId(userWorkoutId: string) {
    return await this.db
      .select()
      .from(userExerciseSchemeCompendiumWorkoutSectionItems)
      .where(eq(userExerciseSchemeCompendiumWorkoutSectionItems.userWorkoutId, userWorkoutId));
  }

  async delete(sectionItemId: string, userWorkoutId: string, userExerciseSchemeId: string) {
    const result = await this.db
      .delete(userExerciseSchemeCompendiumWorkoutSectionItems)
      .where(
        and(
          eq(userExerciseSchemeCompendiumWorkoutSectionItems.sectionItemId, sectionItemId),
          eq(userExerciseSchemeCompendiumWorkoutSectionItems.userWorkoutId, userWorkoutId),
          eq(userExerciseSchemeCompendiumWorkoutSectionItems.userExerciseSchemeId, userExerciseSchemeId)
        )
      )
      .returning();
    return result[0];
  }

  async deleteBySectionItemId(sectionItemId: string) {
    await this.db
      .delete(userExerciseSchemeCompendiumWorkoutSectionItems)
      .where(eq(userExerciseSchemeCompendiumWorkoutSectionItems.sectionItemId, sectionItemId));
  }
}
