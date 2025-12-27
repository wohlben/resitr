import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import type { WorkoutResponseDto, WorkoutSectionType, CreateWorkoutDto, UpdateWorkoutDto } from '@resitr/api';
import { CompendiumQueries } from '../../core/compendium/compendium-queries';
import { CompendiumMutations } from '../../core/compendium/compendium-mutations';
import { safeErrorMessage } from '../../shared/utils/type-guards';

export interface WorkoutsState {
  workouts: WorkoutResponseDto[];
  currentWorkout: WorkoutResponseDto | null;
  versionHistory: WorkoutResponseDto[];
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  error: string | null;
  saveError: string | null;
  searchTerm: string;
  selectedSectionType: WorkoutSectionType | '';
}

const initialState: WorkoutsState = {
  workouts: [],
  currentWorkout: null,
  versionHistory: [],
  isLoading: false,
  isSaving: false,
  isDeleting: false,
  error: null,
  saveError: null,
  searchTerm: '',
  selectedSectionType: '',
};

export const WorkoutsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    const filteredWorkouts = computed(() => {
      const workouts = store.workouts();
      const search = store.searchTerm().toLowerCase().trim();
      const sectionType = store.selectedSectionType();

      return workouts.filter((workout) => {
        if (search) {
          const matchesName = workout.name.toLowerCase().includes(search);
          const matchesDescription = workout.description?.toLowerCase().includes(search);
          if (!matchesName && !matchesDescription) return false;
        }

        if (sectionType) {
          const hasSectionType = workout.sections.some((section) => section.type === sectionType);
          if (!hasSectionType) return false;
        }

        return true;
      });
    });

    const hasActiveFilters = computed(() => {
      return !!(store.searchTerm() || store.selectedSectionType());
    });

    const latestVersion = computed(() => {
      const versions = store.versionHistory();
      if (versions.length === 0) return null;
      return versions.reduce((a, b) => (a.version > b.version ? a : b));
    });

    return {
      filteredWorkouts,
      hasActiveFilters,
      latestVersion,
    };
  }),
  withMethods((store, http = inject(HttpClient)) => ({
    async loadWorkouts(): Promise<void> {
      patchState(store, { isLoading: true, error: null });

      try {
        const workouts = await CompendiumQueries.workout.list.fn(http);
        patchState(store, { workouts, isLoading: false });
      } catch (error) {
        patchState(store, {
          error: safeErrorMessage(error),
          isLoading: false,
        });
      }
    },

    async loadWorkout(templateId: string): Promise<void> {
      patchState(store, {
        isLoading: true,
        error: null,
        currentWorkout: null,
        versionHistory: [],
      });

      try {
        const workout = await CompendiumQueries.workout.detail(templateId).fn(http);
        patchState(store, {
          currentWorkout: workout,
          isLoading: false,
        });

        // Load version history in parallel (non-blocking)
        if (workout.workoutLineageId) {
          CompendiumQueries.workout.versionHistory(workout.workoutLineageId)
            .fn(http)
            .then((versions) => patchState(store, { versionHistory: versions }))
            .catch(() => {/* ignore version history errors */});
        }
      } catch (error) {
        patchState(store, {
          error: safeErrorMessage(error),
          isLoading: false,
        });
      }
    },

    async createWorkout(data: CreateWorkoutDto): Promise<WorkoutResponseDto | null> {
      patchState(store, { isSaving: true, saveError: null });

      try {
        const workout = await CompendiumMutations.workout.create(http, data);
        patchState(store, {
          workouts: [...store.workouts(), workout],
          currentWorkout: workout,
          isSaving: false,
        });
        return workout;
      } catch (error) {
        patchState(store, {
          saveError: safeErrorMessage(error),
          isSaving: false,
        });
        return null;
      }
    },

    async updateWorkout(templateId: string, data: UpdateWorkoutDto): Promise<WorkoutResponseDto | null> {
      patchState(store, { isSaving: true, saveError: null });

      try {
        const workout = await CompendiumMutations.workout.update(http, templateId, data);
        patchState(store, {
          workouts: store.workouts().map((w) => (w.templateId === templateId ? workout : w)),
          currentWorkout: workout,
          isSaving: false,
        });
        return workout;
      } catch (error) {
        patchState(store, {
          saveError: safeErrorMessage(error),
          isSaving: false,
        });
        return null;
      }
    },

    async deleteWorkout(templateId: string): Promise<boolean> {
      patchState(store, { isDeleting: true, saveError: null });

      try {
        await CompendiumMutations.workout.delete(http, templateId);
        patchState(store, {
          workouts: store.workouts().filter((w) => w.templateId !== templateId),
          currentWorkout: null,
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

    clearCurrentWorkout(): void {
      patchState(store, {
        currentWorkout: null,
        saveError: null,
      });
    },

    setSearchTerm(searchTerm: string): void {
      patchState(store, { searchTerm });
    },

    setSelectedSectionType(selectedSectionType: WorkoutSectionType | ''): void {
      patchState(store, { selectedSectionType });
    },

    clearFilters(): void {
      patchState(store, {
        searchTerm: '',
        selectedSectionType: '',
      });
    },
  })),
  withHooks({ onInit: (store) => store.loadWorkouts() })
);

export type WorkoutsStore = typeof WorkoutsStore;