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
              forkedFrom: null,  // New items are not derived from anything
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
          forkedFrom: null,  // New sections are not derived from anything
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
    const workouts = await this.workoutRepository.findAll();
    return this.populateSectionsAndItems(workouts);
  }

  async findVersionHistory(lineageId: string) {
    const workouts = await this.workoutRepository.findByLineageId(lineageId);
    return this.populateSectionsAndItems(workouts);
  }

  async findById(templateId: string) {
    const workout = await this.workoutRepository.findById(templateId);
    if (!workout) return null;

    const [populated] = await this.populateSectionsAndItems([workout]);
    return populated;
  }

  async update(templateId: string, data: Partial<CreateWorkoutDto>, userId: string) {
    // Fetch the old workout to get lineage and version info
    const oldWorkout = await this.workoutRepository.findById(templateId);
    if (!oldWorkout) {
      return null;
    }

    // Batch fetch: all old sections in one query
    const oldSections = oldWorkout.sectionIds.length > 0
      ? await this.sectionRepository.findByIds(oldWorkout.sectionIds)
      : [];
    const oldSectionsById = new Map(oldSections.map(s => [s.id, s]));

    // Batch fetch: all old items across all sections in one query
    const allOldItemIds = oldSections.flatMap(s => s.workoutSectionItemIds);
    const oldItems = allOldItemIds.length > 0
      ? await this.sectionItemRepository.findByIds(allOldItemIds)
      : [];
    const oldItemsById = new Map(oldItems.map(i => [i.id, i]));

    // Map sections to new section IDs with item reuse logic
    const newSections = data.sections ?? [];
    const newSectionIds = await Promise.all(
      newSections.map(async (newSectionData, sectionIndex) => {
        const oldSectionId = oldWorkout.sectionIds[sectionIndex];
        const oldSection = oldSectionId ? oldSectionsById.get(oldSectionId) : undefined;

        // Map items: reuse unchanged, fork changed, create new
        const newItemIds = await Promise.all(
          (newSectionData.items ?? []).map(async (newItemData, itemIndex) => {
            const oldItemId = oldSection?.workoutSectionItemIds[itemIndex];
            const oldItem = oldItemId ? oldItemsById.get(oldItemId) : undefined;

            // Reuse unchanged item
            if (oldItem && this.itemsMatch(oldItem, newItemData)) {
              return oldItem.id;
            }

            // Create new item (forked if oldItem exists, brand new otherwise)
            const newItem = await this.sectionItemRepository.create({
              exerciseId: newItemData.exerciseId,
              breakBetweenSets: newItemData.breakBetweenSets,
              breakAfter: newItemData.breakAfter,
              forkedFrom: oldItemId ?? null,
              createdBy: userId,
              createdAt: oldItem?.createdAt,  // Preserve original creation time if forking
              updatedAt: oldItem ? new Date() : null,  // Set update time if forking
            });
            return newItem.id;
          })
        );

        // Create new section (always new for versioning)
        const newSection = await this.sectionRepository.create({
          type: newSectionData.type,
          name: newSectionData.name,
          workoutSectionItemIds: newItemIds,
          forkedFrom: oldSection?.id ?? null,
          createdBy: userId,
          createdAt: oldSection?.createdAt,  // Preserve original creation time if forking
          updatedAt: oldSection ? new Date() : null,  // Set update time if forking
        });
        return newSection.id;
      })
    );

    // Create new workout version with same lineageId
    const newWorkout = await this.workoutRepository.create({
      templateId: crypto.randomUUID(),
      workoutLineageId: oldWorkout.workoutLineageId,
      name: data.name ?? oldWorkout.name,
      description: data.description !== undefined ? data.description : oldWorkout.description,
      version: oldWorkout.version + 1,
      sectionIds: newSectionIds,
      createdBy: userId,
      createdAt: oldWorkout.createdAt,  // Preserve original creation time
      updatedAt: new Date(),             // Set update time to now
    });

    return newWorkout;
  }

  async delete(templateId: string) {
    // Note: Sections and items are NOT deleted - they may be referenced
    // by other workout versions per versioning architecture
    // TODO: implement a cleanup strategy for orphaned sections/items later
    return this.workoutRepository.delete(templateId);
  }

  private itemsMatch(
    oldItem: CompendiumWorkoutSectionItem & { id: string },
    newItemData: { exerciseId: string; breakBetweenSets: number; breakAfter: number }
  ): boolean {
    return (
      oldItem.exerciseId === newItemData.exerciseId &&
      oldItem.breakBetweenSets === newItemData.breakBetweenSets &&
      oldItem.breakAfter === newItemData.breakAfter
    );
  }

  private async populateSectionsAndItems<T extends { sectionIds: string[] }>(workouts: T[]) {
    if (workouts.length === 0) return [];

    // Batch fetch all sections across all workouts
    const allSectionIds = workouts.flatMap(w => w.sectionIds);
    const sections = allSectionIds.length > 0
      ? await this.sectionRepository.findByIds(allSectionIds)
      : [];
    const sectionsById = new Map(sections.map(s => [s.id, s]));

    // Batch fetch all items across all sections
    const allItemIds = sections.flatMap(s => s.workoutSectionItemIds);
    const items = allItemIds.length > 0
      ? await this.sectionItemRepository.findByIds(allItemIds)
      : [];
    const itemsById = new Map(items.map(i => [i.id, i]));

    // Build nested structure with sections and items populated
    return workouts.map(workout => ({
      ...workout,
      sections: workout.sectionIds
        .map(sId => sectionsById.get(sId))
        .filter((s): s is NonNullable<typeof s> => s !== undefined)
        .map(section => ({
          ...section,
          items: section.workoutSectionItemIds
            .map(iId => itemsById.get(iId))
            .filter((i): i is NonNullable<typeof i> => i !== undefined),
        })),
    }));
  }
}
