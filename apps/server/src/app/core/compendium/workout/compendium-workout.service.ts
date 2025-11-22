import { Injectable } from '@nestjs/common';
import { CompendiumWorkoutRepository } from '../../persistence/repositories/compendium-workout.repository';
import { CompendiumWorkoutSectionRepository } from '../../persistence/repositories/compendium-workout-section.repository';
import { CompendiumWorkoutSectionItemRepository } from '../../persistence/repositories/compendium-workout-section-item.repository';
import { CompendiumWorkoutScheduleRepository } from '../../persistence/repositories/compendium-workout-schedule.repository';
import { CreateWorkoutDto } from '../../../routes/compendium/workout/dto/workout.dto';
import type { CompendiumWorkout } from '../../persistence/schemas/compendium-workout.schema';

@Injectable()
export class CompendiumWorkoutService {
  constructor(
    private readonly workoutRepository: CompendiumWorkoutRepository,
    private readonly sectionRepository: CompendiumWorkoutSectionRepository,
    private readonly sectionItemRepository: CompendiumWorkoutSectionItemRepository,
    private readonly scheduleRepository: CompendiumWorkoutScheduleRepository
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
      for (const sectionData of data.sections) {
        const section = await this.sectionRepository.create({
          workoutTemplateId: workout.templateId,
          type: sectionData.type,
          name: sectionData.name,
          orderIndex: sectionData.orderIndex,
          createdBy: userId,
        });

        // Create section items
        if (sectionData.items) {
          for (const itemData of sectionData.items) {
            await this.sectionItemRepository.create({
              sectionId: section.id,
              exerciseSchemeId: itemData.exerciseSchemeId,
              orderIndex: itemData.orderIndex,
              breakBetweenSets: itemData.breakBetweenSets,
              breakAfter: itemData.breakAfter,
              createdBy: userId,
            });
          }
        }
      }
    }

    // Create schedule
    if (data.schedule) {
      for (const dayOfWeek of data.schedule) {
        await this.scheduleRepository.create({
          workoutTemplateId: workout.templateId,
          dayOfWeek,
          createdBy: userId,
        });
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

    // Get items for each section
    const sectionsWithItems = await Promise.all(
      sections.map(async (section) => {
        const items = await this.sectionItemRepository.findBySectionId(section.id);
        return { ...section, items };
      })
    );

    // Get schedule
    const schedule = await this.scheduleRepository.findByWorkoutTemplateId(templateId);

    return {
      ...workout,
      sections: sectionsWithItems,
      schedule: schedule.map((s) => s.dayOfWeek),
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
    // Cascade delete will handle sections, items, and schedule
    return this.workoutRepository.delete(templateId);
  }
}
