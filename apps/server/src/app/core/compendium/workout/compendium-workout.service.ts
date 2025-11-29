import { Injectable } from '@nestjs/common';
import { CompendiumWorkoutRepository } from '../../persistence/repositories/compendium-workout.repository';
import { CompendiumWorkoutSectionRepository } from '../../persistence/repositories/compendium-workout-section.repository';
import { CompendiumWorkoutSectionItemRepository } from '../../persistence/repositories/compendium-workout-section-item.repository';
import { UserExerciseSchemeCompendiumWorkoutSectionItemRepository } from '../../persistence/repositories/user-exercise-scheme-compendium-workout-section-item.repository';
import { CreateWorkoutDto } from '../../../routes/compendium/workout/dto/workout.dto';
import type { CompendiumWorkout } from '../../persistence/schemas/compendium-workout.schema';

@Injectable()
export class CompendiumWorkoutService {
  constructor(
    private readonly workoutRepository: CompendiumWorkoutRepository,
    private readonly sectionRepository: CompendiumWorkoutSectionRepository,
    private readonly sectionItemRepository: CompendiumWorkoutSectionItemRepository,
    private readonly sectionItemSchemeRepository: UserExerciseSchemeCompendiumWorkoutSectionItemRepository
  ) {}

  async create(data: CreateWorkoutDto, userId: string) {
    // Create the workout
    const workout = await this.workoutRepository.create({
      templateId: data.templateId,
      name: data.name,
      description: data.description,
      version: data.version,
      createdBy: userId,
    });

    // Create sections
    if (data.sections) {
      for (const [sectionIndex, sectionData] of data.sections.entries()) {
        const section = await this.sectionRepository.create({
          workoutTemplateId: workout.templateId,
          type: sectionData.type,
          name: sectionData.name,
          orderIndex: sectionIndex,
          createdBy: userId,
        });

        // Create section items
        if (sectionData.items) {
          for (const [itemIndex, itemData] of sectionData.items.entries()) {
            const sectionItem = await this.sectionItemRepository.create({
              sectionId: section.id,
              orderIndex: itemIndex,
              breakBetweenSets: itemData.breakBetweenSets,
              breakAfter: itemData.breakAfter,
              createdBy: userId,
            });

            // Create the join table entry
            await this.sectionItemSchemeRepository.create({
              sectionItemId: sectionItem.id,
              workoutTemplateId: workout.templateId,
              userExerciseSchemeId: itemData.exerciseSchemeId,
            });
          }
        }
      }
    }

    return workout;
  }

  async findAll() {
    return await this.workoutRepository.findAll();
  }

  async findById(templateId: string) {
    const workout = await this.workoutRepository.findById(templateId);
    if (!workout) return null;

    // Get sections
    const sections = await this.sectionRepository.findByWorkoutTemplateId(templateId);

    // Get items for each section with their exercise schemes
    const sectionsWithItems = await Promise.all(
      sections.map(async (section) => {
        const items = await this.sectionItemRepository.findBySectionId(section.id);

        // For each item, get its exercise schemes from the join table
        const itemsWithSchemes = await Promise.all(
          items.map(async (item) => {
            const schemes = await this.sectionItemSchemeRepository.findBySectionItemId(item.id);
            // For now, assuming one scheme per item (backward compatibility)
            const exerciseSchemeId = schemes.length > 0 ? schemes[0].userExerciseSchemeId : null;
            return { ...item, exerciseSchemeId };
          })
        );

        return { ...section, items: itemsWithSchemes };
      })
    );

    return {
      ...workout,
      sections: sectionsWithItems,
    };
  }

  async update(templateId: string, data: Partial<CreateWorkoutDto>, userId: string) {
    const updateData: Partial<CompendiumWorkout> = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.version !== undefined && { version: data.version }),
      createdBy: userId,
      updatedAt: new Date(),
    };
    return await this.workoutRepository.update(templateId, updateData);
  }

  async delete(templateId: string) {
    // Cascade delete will handle sections and items
    return this.workoutRepository.delete(templateId);
  }
}
