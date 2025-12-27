import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { CompendiumWorkoutRepository } from '../../persistence/repositories/compendium-workout.repository';
import { CompendiumWorkoutSectionRepository } from '../../persistence/repositories/compendium-workout-section.repository';
import { CompendiumWorkoutSectionItemRepository } from '../../persistence/repositories/compendium-workout-section-item.repository';
import { CreateWorkoutDto } from '../../../routes/compendium/workout/dto/workout.dto';
import type { CompendiumWorkoutSection } from '../../persistence/schemas/compendium-workout-section.schema';
import type { CompendiumWorkoutSectionItem } from '../../persistence/schemas/compendium-workout-section-item.schema';

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
      workoutLineageId: data.workoutLineageId || crypto.randomUUID(),
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
    // Fetch the old workout to get lineage and version info
    const oldWorkout = await this.workoutRepository.findById(templateId);
    if (!oldWorkout) {
      return null;
    }

    // Fetch old sections for item comparison
    type SectionData = { section: CompendiumWorkoutSection & { id: string }; items: (CompendiumWorkoutSectionItem & { id: string })[] };
    const oldSectionsMap = new Map<number, SectionData>();
    if (oldWorkout.sectionIds.length > 0) {
      const oldSections = await this.sectionRepository.findByIds(oldWorkout.sectionIds);
      for (let i = 0; i < oldWorkout.sectionIds.length; i++) {
        const section = oldSections.find(s => s.id === oldWorkout.sectionIds[i]);
        if (section) {
          const items = section.workoutSectionItemIds.length > 0
            ? await this.sectionItemRepository.findByIds(section.workoutSectionItemIds)
            : [];
          oldSectionsMap.set(i, { section, items });
        }
      }
    }

    // Build new sections with item reuse
    const newSectionIds: string[] = [];
    const newSections = data.sections ?? [];

    for (let sectionIndex = 0; sectionIndex < newSections.length; sectionIndex++) {
      const newSectionData = newSections[sectionIndex];
      const oldSectionData = oldSectionsMap.get(sectionIndex);

      // Build items for this section with reuse logic
      const newItemIds: string[] = [];
      const newItems = newSectionData.items ?? [];

      for (let itemIndex = 0; itemIndex < newItems.length; itemIndex++) {
        const newItemData = newItems[itemIndex];

        // Try to reuse item if old section exists and has item at same position
        let reuseItemId: string | null = null;
        const oldItemIds = oldSectionData?.section.workoutSectionItemIds ?? [];
        if (oldSectionData && oldItemIds[itemIndex]) {
          const oldItemId = oldItemIds[itemIndex];
          const oldItem = oldSectionData.items.find(i => i.id === oldItemId);

          if (oldItem &&
              oldItem.exerciseId === newItemData.exerciseId &&
              oldItem.breakBetweenSets === newItemData.breakBetweenSets &&
              oldItem.breakAfter === newItemData.breakAfter) {
            reuseItemId = oldItem.id;
          }
        }

        if (reuseItemId) {
          newItemIds.push(reuseItemId);
        } else {
          // Create new item
          const newItem = await this.sectionItemRepository.create({
            exerciseId: newItemData.exerciseId,
            breakBetweenSets: newItemData.breakBetweenSets,
            breakAfter: newItemData.breakAfter,
            createdBy: userId,
          });
          newItemIds.push(newItem.id);
        }
      }

      // Always create new section (sections are version-specific)
      const newSection = await this.sectionRepository.create({
        type: newSectionData.type,
        name: newSectionData.name,
        workoutSectionItemIds: newItemIds,
        createdBy: userId,
      });
      newSectionIds.push(newSection.id);
    }

    // Create new workout version with same lineageId
    const newWorkout = await this.workoutRepository.create({
      templateId: crypto.randomUUID(),
      workoutLineageId: oldWorkout.workoutLineageId,
      name: data.name ?? oldWorkout.name,
      description: data.description !== undefined ? data.description : oldWorkout.description,
      version: oldWorkout.version + 1,
      sectionIds: newSectionIds,
      createdBy: userId,
    });

    return newWorkout;
  }

  async delete(templateId: string) {
    // Note: Sections and items are NOT deleted - they may be referenced
    // by other workout versions per versioning architecture
    // TODO: implement a cleanup strategy for orphaned sections/items later
    return this.workoutRepository.delete(templateId);
  }
}
