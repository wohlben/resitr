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
        error: null,
        currentExerciseRelationships: [],
        currentExerciseGroups: [],
        currentExerciseEquipment: [],
      });

      try {
        const exercise = await CompendiumQueries.exercise.detail(id).fn(http);
        patchState(store, { currentExercise: exercise, isLoading: false });

        // Load relationships, groups, and equipment in background
        this.loadExerciseRelationsAndGroups(id, exercise.equipmentIds || []);
      } catch (error) {
        patchState(store, {
          error: safeErrorMessage(error),
          isLoading: false,
        });
      }
    },

    async loadExerciseRelationsAndGroups(id: string, equipmentIds: string[] = []): Promise<void> {
      patchState(store, { isLoadingRelations: true });

      try {
        const [relationships, groupMemberships] = await Promise.all([
          CompendiumQueries.exerciseRelationship.byExercise(id).fn(http),
          CompendiumQueries.exerciseGroupMember.byExercise(id).fn(http),
        ]);

        // Enrich relationships with exercise details
        const enrichedRelationships: ExerciseRelationshipWithExercise[] = await Promise.all(
          relationships.map(async (rel) => {
            const relatedId = rel.fromExerciseTemplateId === id
              ? rel.toExerciseTemplateId
              : rel.fromExerciseTemplateId;
            try {
              const relatedExercise = await CompendiumQueries.exercise.detail(relatedId).fn(http);
              return { ...rel, relatedExercise };
            } catch {
              return rel;
            }
          })
        );

        // Enrich group memberships with group details
        const enrichedGroups: ExerciseGroupWithDetails[] = await Promise.all(
          groupMemberships.map(async (membership) => {
            try {
              const group = await CompendiumQueries.exerciseGroup.detail(membership.groupId).fn(http);
              return { ...membership, group };
            } catch {
              return membership;
            }
          })
        );

        // Load equipment details
        const equipment: EquipmentResponseDto[] = (await Promise.all(
          equipmentIds.map(async (equipmentId) => {
            try {
              return await CompendiumQueries.equipment.detail(equipmentId).fn(http);
            } catch {
              return null;
            }
          })
        )).filter((e): e is EquipmentResponseDto => e !== null);

        patchState(store, {
          currentExerciseRelationships: enrichedRelationships,
          currentExerciseGroups: enrichedGroups,
          currentExerciseEquipment: equipment,
          isLoadingRelations: false,
        });
      } catch (error) {
        patchState(store, { isLoadingRelations: false });
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
