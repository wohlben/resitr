import { Injectable } from '@nestjs/common';
import { CompendiumWorkoutRepository } from '../../persistence/repositories/compendium-workout.repository';
import { CompendiumWorkoutSectionRepository } from '../../persistence/repositories/compendium-workout-section.repository';
import { CompendiumWorkoutSectionItemRepository } from '../../persistence/repositories/compendium-workout-section-item.repository';
import { CreateWorkoutDto } from '../../../routes/compendium/workout/dto/workout.dto';
import type { CompendiumWorkout } from '../../persistence/schemas/compendium-workout.schema';

@Injectable()
export class CompendiumWorkoutService {
  constructor(
    private readonly workoutRepository: CompendiumWorkoutRepository,
    private readonly sectionRepository: CompendiumWorkoutSectionRepository,
    private readonly sectionItemRepository: CompendiumWorkoutSectionItemRepository
  ) {}

  async create(data: CreateWorkoutDto, userId: string) {
    const sectionIds: string[] = [];

    // Create sections and items first
    if (data.sections) {
      for (const sectionData of data.sections) {
        const itemIds: string[] = [];

        // Create items first (standalone, no parent reference)
        if (sectionData.items) {
          for (const itemData of sectionData.items) {
            const item = await this.sectionItemRepository.create({
              exerciseId: itemData.exerciseId,
              breakBetweenSets: itemData.breakBetweenSets,
              breakAfter: itemData.breakAfter,
              createdBy: userId,
            });
            itemIds.push(item.id);
          }
        }

        // Create section with item IDs
        const section = await this.sectionRepository.create({
          type: sectionData.type,
          name: sectionData.name,
          workoutSectionItemIds: itemIds,
          createdBy: userId,
        });
        sectionIds.push(section.id);
      }
    }

    // Create workout with section IDs
    const workout = await this.workoutRepository.create({
      templateId: data.templateId,
      name: data.name,
      description: data.description,
      version: data.version,
      sectionIds: sectionIds,
      createdBy: userId,
    });

    return workout;
  }

  async findAll() {
    return await this.workoutRepository.findAll();
  }

  async findById(templateId: string) {
    const workout = await this.workoutRepository.findById(templateId);
    if (!workout) return null;

    // Fetch sections by IDs from workout.sectionIds
    const sectionsMap = new Map<string, Awaited<ReturnType<typeof this.sectionRepository.findById>>>();
    if (workout.sectionIds.length > 0) {
      const sections = await this.sectionRepository.findByIds(workout.sectionIds);
      sections.forEach((s) => sectionsMap.set(s.id, s));
    }

    // Preserve order from sectionIds array
    const orderedSections = workout.sectionIds.map((id) => sectionsMap.get(id)).filter(Boolean);

    // For each section, fetch items by IDs from section.workoutSectionItemIds
    const sectionsWithItems = await Promise.all(
      orderedSections.map(async (section) => {
        const itemsMap = new Map<string, Awaited<ReturnType<typeof this.sectionItemRepository.findById>>>();
        if (section!.workoutSectionItemIds.length > 0) {
          const items = await this.sectionItemRepository.findByIds(section!.workoutSectionItemIds);
          items.forEach((i) => itemsMap.set(i.id, i));
        }

        // Preserve order from workoutSectionItemIds array
        const orderedItems = section!.workoutSectionItemIds.map((id) => itemsMap.get(id)).filter(Boolean);

        return { ...section, items: orderedItems };
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
    // Note: Sections and items are NOT deleted - they may be referenced
    // by other workout versions per versioning architecture
    // TODO: implement a cleanup strategy for orphaned sections/items later
    return this.workoutRepository.delete(templateId);
  }
}
