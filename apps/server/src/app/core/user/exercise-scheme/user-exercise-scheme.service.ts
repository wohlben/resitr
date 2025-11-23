import { Injectable, NotFoundException } from '@nestjs/common';
import { UserExerciseSchemeRepository } from '../../persistence/repositories/user-exercise-scheme.repository';
import { UserExerciseScheme, NewUserExerciseScheme } from '../../persistence/schemas/user-exercise-scheme.schema';
import { UserExerciseSchemeCompendiumWorkoutSectionItem } from '../../persistence/schemas/user-exercise-scheme-compendium-workout-section-item.schema';

@Injectable()
export class UserExerciseSchemeService {
  constructor(
    private readonly schemeRepository: UserExerciseSchemeRepository
  ) {}

  async createScheme(
    userId: string,
    data: Omit<NewUserExerciseScheme, 'userId'>
  ): Promise<UserExerciseScheme> {
    return this.schemeRepository.create({
      ...data,
      userId,
    });
  }

  async getUserSchemes(userId: string): Promise<UserExerciseScheme[]> {
    return this.schemeRepository.findByUserId(userId);
  }

  async getUserSchemesByExercise(
    userId: string,
    exerciseId: string
  ): Promise<UserExerciseScheme[]> {
    return this.schemeRepository.findByUserIdAndExerciseId(userId, exerciseId);
  }

  async getSchemeById(
    userId: string,
    schemeId: string
  ): Promise<UserExerciseScheme> {
    const scheme = await this.schemeRepository.findById(schemeId);

    if (!scheme) {
      throw new NotFoundException('Exercise scheme not found');
    }

    if (scheme.userId !== userId) {
      throw new NotFoundException('Exercise scheme not found');
    }

    return scheme;
  }

  async updateScheme(
    userId: string,
    schemeId: string,
    data: Partial<Omit<NewUserExerciseScheme, 'userId'>>
  ): Promise<UserExerciseScheme> {
    const scheme = await this.getSchemeById(userId, schemeId);

    const updated = await this.schemeRepository.update(scheme.id, data);

    if (!updated) {
      throw new NotFoundException('Failed to update exercise scheme');
    }

    return updated;
  }

  async deleteScheme(userId: string, schemeId: string): Promise<void> {
    const scheme = await this.getSchemeById(userId, schemeId);
    await this.schemeRepository.delete(scheme.id);
  }

  async deleteUserSchemesByExercise(
    userId: string,
    exerciseId: string
  ): Promise<void> {
    await this.schemeRepository.deleteByUserIdAndExerciseId(userId, exerciseId);
  }

  async deleteAllUserSchemes(userId: string): Promise<void> {
    await this.schemeRepository.deleteByUserId(userId);
  }

  async upsertScheme(
    userId: string,
    data: Omit<NewUserExerciseScheme, 'userId'> & { id?: string }
  ): Promise<UserExerciseScheme> {
    return this.schemeRepository.upsert({
      ...data,
      userId,
    });
  }

  async addToWorkoutSection(
    userId: string,
    schemeId: string,
    sectionItemId: string,
    workoutTemplateId: string
  ): Promise<UserExerciseSchemeCompendiumWorkoutSectionItem> {
    await this.getSchemeById(userId, schemeId);

    return this.schemeRepository.addToWorkoutSection({
      sectionItemId,
      workoutTemplateId,
      userExerciseSchemeId: schemeId,
    });
  }

  async removeFromWorkoutSection(
    userId: string,
    schemeId: string,
    sectionItemId: string,
    workoutTemplateId: string
  ): Promise<void> {
    // Verify the scheme belongs to the user
    await this.getSchemeById(userId, schemeId);

    await this.schemeRepository.removeFromWorkoutSection(
      sectionItemId,
      workoutTemplateId,
      schemeId
    );
  }
}
