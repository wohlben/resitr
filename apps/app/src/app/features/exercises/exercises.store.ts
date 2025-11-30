import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import type {
  ExerciseResponseDto,
  CreateExerciseDto,
  UpdateExerciseDto,
  ExerciseType,
  Muscle,
  TechnicalDifficulty,
  ExerciseRelationshipResponseDto,
  ExerciseGroupMemberResponseDto,
  ExerciseGroupResponseDto,
  EquipmentResponseDto,
  CreateExerciseRelationshipDto,
  ExerciseRelationshipType,
  CreateExerciseGroupMemberDto,
} from '@resitr/api';
import { CompendiumQueries } from '../../core/compendium/compendium-queries';
import { CompendiumMutations } from '../../core/compendium/compendium-mutations';
import { safeErrorMessage } from '../../shared/utils/type-guards';

export interface ExerciseRelationshipWithExercise extends ExerciseRelationshipResponseDto {
  relatedExercise?: ExerciseResponseDto;
}

export interface ExerciseGroupWithDetails extends ExerciseGroupMemberResponseDto {
  group?: ExerciseGroupResponseDto;
}

export interface ExercisesState {
  exercises: ExerciseResponseDto[];
  currentExercise: ExerciseResponseDto | null;
  currentExerciseRelationships: ExerciseRelationshipWithExercise[];
  currentExerciseGroups: ExerciseGroupWithDetails[];
  currentExerciseEquipment: EquipmentResponseDto[];
  isLoading: boolean;
  isLoadingRelations: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  error: string | null;
  saveError: string | null;
  searchTerm: string;
  selectedType: ExerciseType | '';
  selectedMuscle: Muscle | '';
  selectedDifficulty: TechnicalDifficulty | '';
}

const initialState: ExercisesState = {
  exercises: [],
  currentExercise: null,
  currentExerciseRelationships: [],
  currentExerciseGroups: [],
  currentExerciseEquipment: [],
  isLoading: false,
  isLoadingRelations: false,
  isSaving: false,
  isDeleting: false,
  error: null,
  saveError: null,
  searchTerm: '',
  selectedType: '',
  selectedMuscle: '',
  selectedDifficulty: '',
};

export const ExercisesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    const filteredExercises = computed(() => {
      const exercises = store.exercises();
      const search = store.searchTerm().toLowerCase().trim();
      const type = store.selectedType();
      const muscle = store.selectedMuscle();
      const difficulty = store.selectedDifficulty();

      return exercises.filter((exercise) => {
        if (search) {
          const matchesName = exercise.name.toLowerCase().includes(search);
          const matchesAltNames = exercise.alternativeNames?.some((name) =>
            name.toLowerCase().includes(search)
          );
          if (!matchesName && !matchesAltNames) return false;
        }

        if (type && exercise.type !== type) return false;

        if (muscle) {
          const hasPrimary = exercise.primaryMuscles.includes(muscle);
          const hasSecondary = exercise.secondaryMuscles.includes(muscle);
          if (!hasPrimary && !hasSecondary) return false;
        }

        if (difficulty && exercise.technicalDifficulty !== difficulty)
          return false;

        return true;
      });
    });

    const hasActiveFilters = computed(() => {
      return !!(
        store.searchTerm() ||
        store.selectedType() ||
        store.selectedMuscle() ||
        store.selectedDifficulty()
      );
    });

    return {
      filteredExercises,
      hasActiveFilters,
    };
  }),
  withMethods((store, http = inject(HttpClient)) => ({
    async loadExercises(): Promise<void> {
      patchState(store, { isLoading: true, error: null });

      try {
        const exercises = await CompendiumQueries.exercise.list.fn(http);
        patchState(store, { exercises, isLoading: false });
      } catch (error) {
        patchState(store, {
          error: safeErrorMessage(error),
          isLoading: false,
        });
      }
    },

    async loadExercise(id: string): Promise<void> {
      patchState(store, {
        isLoading: true,
        isLoadingRelations: true,
        error: null,
        currentExercise: null,
        currentExerciseRelationships: [],
        currentExerciseGroups: [],
        currentExerciseEquipment: [],
      });

      try {
        // Load exercise, relationships, and group memberships ALL in parallel
        const [exercise, relationships, groupMemberships] = await Promise.all([
          CompendiumQueries.exercise.detail(id).fn(http),
          CompendiumQueries.exerciseRelationship.byExercise(id).fn(http),
          CompendiumQueries.exerciseGroupMember.byExercise(id).fn(http),
        ]);

        // Use already-loaded exercises list to enrich relationships (no extra requests)
        const exercisesList = store.exercises();
        const enrichedRelationships: ExerciseRelationshipWithExercise[] = relationships.map((rel) => {
          const relatedId = rel.fromExerciseTemplateId === id
            ? rel.toExerciseTemplateId
            : rel.fromExerciseTemplateId;
          const relatedExercise = exercisesList.find(e => e.templateId === relatedId);
          return relatedExercise ? { ...rel, relatedExercise } : rel;
        });

        // Set exercise and relationships immediately
        patchState(store, {
          currentExercise: exercise,
          currentExerciseRelationships: enrichedRelationships,
          isLoading: false,
        });

        // Load groups and equipment details in parallel (these are smaller lists)
        const equipmentIds = exercise.equipmentIds || [];
        const [groups, equipment] = await Promise.all([
          Promise.all(
            groupMemberships.map(async (membership) => {
              try {
                const group = await CompendiumQueries.exerciseGroup.detail(membership.groupId).fn(http);
                return { ...membership, group };
              } catch {
                return membership;
              }
            })
          ),
          Promise.all(
            equipmentIds.map(async (equipmentId) => {
              try {
                return await CompendiumQueries.equipment.detail(equipmentId).fn(http);
              } catch {
                return null;
              }
            })
          ).then(results => results.filter((e): e is EquipmentResponseDto => e !== null)),
        ]);

        patchState(store, {
          currentExerciseGroups: groups,
          currentExerciseEquipment: equipment,
          isLoadingRelations: false,
        });
      } catch (error) {
        patchState(store, {
          error: safeErrorMessage(error),
          isLoading: false,
          isLoadingRelations: false,
        });
      }
    },

    async createExercise(data: CreateExerciseDto): Promise<ExerciseResponseDto | null> {
      patchState(store, { isSaving: true, saveError: null });

      try {
        const exercise = await CompendiumMutations.exercise.create(http, data);
        patchState(store, {
          exercises: [...store.exercises(), exercise],
          currentExercise: exercise,
          isSaving: false,
        });
        return exercise;
      } catch (error) {
        patchState(store, {
          saveError: safeErrorMessage(error),
          isSaving: false,
        });
        return null;
      }
    },

    async updateExercise(id: string, data: UpdateExerciseDto): Promise<ExerciseResponseDto | null> {
      patchState(store, { isSaving: true, saveError: null });

      try {
        const exercise = await CompendiumMutations.exercise.update(http, id, data);
        patchState(store, {
          exercises: store.exercises().map((e) => (e.templateId === id ? exercise : e)),
          currentExercise: exercise,
          isSaving: false,
        });
        return exercise;
      } catch (error) {
        patchState(store, {
          saveError: safeErrorMessage(error),
          isSaving: false,
        });
        return null;
      }
    },

    async deleteExercise(id: string): Promise<boolean> {
      patchState(store, { isDeleting: true, saveError: null });

      try {
        await CompendiumMutations.exercise.delete(http, id);
        patchState(store, {
          exercises: store.exercises().filter((e) => e.templateId !== id),
          currentExercise: null,
          isDeleting: false,
        });
        return true;
      } catch (error) {
        patchState(store, {
          saveError: safeErrorMessage(error),
          isDeleting: false,
        });
        return false;
      }
    },

    async addRelationship(
      fromExerciseId: string,
      toExerciseId: string,
      relationshipType: ExerciseRelationshipType,
      description?: string
    ): Promise<boolean> {
      patchState(store, { isSaving: true, saveError: null });
      try {
        const data: CreateExerciseRelationshipDto = {
          fromExerciseTemplateId: fromExerciseId,
          toExerciseTemplateId: toExerciseId,
          relationshipType,
          ...(description && { description }),
        };
        const relationship = await CompendiumMutations.exerciseRelationship.create(http, data);

        // Enrich with exercise data from store
        const relatedExercise = store.exercises().find((e) => e.templateId === toExerciseId);
        const enrichedRelationship: ExerciseRelationshipWithExercise = relatedExercise
          ? { ...relationship, relatedExercise }
          : { ...relationship };

        patchState(store, {
          currentExerciseRelationships: [...store.currentExerciseRelationships(), enrichedRelationship],
          isSaving: false,
        });
        return true;
      } catch (error) {
        patchState(store, {
          saveError: safeErrorMessage(error),
          isSaving: false,
        });
        return false;
      }
    },

    async removeRelationship(
      fromExerciseId: string,
      toExerciseId: string,
      relationshipType: ExerciseRelationshipType
    ): Promise<boolean> {
      patchState(store, { isSaving: true, saveError: null });
      try {
        await CompendiumMutations.exerciseRelationship.delete(http, fromExerciseId, toExerciseId, relationshipType);
        patchState(store, {
          currentExerciseRelationships: store.currentExerciseRelationships().filter(
            (r) =>
              !(r.fromExerciseTemplateId === fromExerciseId &&
                r.toExerciseTemplateId === toExerciseId &&
                r.relationshipType === relationshipType)
          ),
          isSaving: false,
        });
        return true;
      } catch (error) {
        patchState(store, {
          saveError: safeErrorMessage(error),
          isSaving: false,
        });
        return false;
      }
    },

    async addToGroup(exerciseId: string, groupId: string, group?: ExerciseGroupResponseDto): Promise<boolean> {
      patchState(store, { isSaving: true, saveError: null });
      try {
        const data: CreateExerciseGroupMemberDto = { exerciseTemplateId: exerciseId, groupId };
        const membership = await CompendiumMutations.exerciseGroupMember.create(http, data);
        const newMembership: ExerciseGroupWithDetails = group
          ? { ...membership, group }
          : { ...membership };
        patchState(store, {
          currentExerciseGroups: [...store.currentExerciseGroups(), newMembership],
          isSaving: false,
        });
        return true;
      } catch (error) {
        patchState(store, {
          saveError: safeErrorMessage(error),
          isSaving: false,
        });
        return false;
      }
    },

    async removeFromGroup(exerciseId: string, groupId: string): Promise<boolean> {
      patchState(store, { isSaving: true, saveError: null });
      try {
        await CompendiumMutations.exerciseGroupMember.delete(http, exerciseId, groupId);
        patchState(store, {
          currentExerciseGroups: store.currentExerciseGroups().filter((g) => g.groupId !== groupId),
          isSaving: false,
        });
        return true;
      } catch (error) {
        patchState(store, {
          saveError: safeErrorMessage(error),
          isSaving: false,
        });
        return false;
      }
    },

    clearCurrentExercise(): void {
      patchState(store, {
        currentExercise: null,
        currentExerciseRelationships: [],
        currentExerciseGroups: [],
        currentExerciseEquipment: [],
        saveError: null,
      });
    },

    setSearchTerm(searchTerm: string): void {
      patchState(store, { searchTerm });
    },

    setSelectedType(selectedType: ExerciseType | ''): void {
      patchState(store, { selectedType });
    },

    setSelectedMuscle(selectedMuscle: Muscle | ''): void {
      patchState(store, { selectedMuscle });
    },

    setSelectedDifficulty(selectedDifficulty: TechnicalDifficulty | ''): void {
      patchState(store, { selectedDifficulty });
    },

    clearFilters(): void {
      patchState(store, {
        searchTerm: '',
        selectedType: '',
        selectedMuscle: '',
        selectedDifficulty: '',
      });
    },
  })),
  withHooks({ onInit: (store) => store.loadExercises() })
);
