import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import type { WorkoutResponseDto, WorkoutSectionType } from '@resitr/api';
import { CompendiumQueries } from '../../core/compendium/compendium-queries';
import { safeErrorMessage } from '../../shared/utils/type-guards';

export interface WorkoutsState {
  workouts: WorkoutResponseDto[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  selectedSectionType: WorkoutSectionType | '';
}

const initialState: WorkoutsState = {
  workouts: [],
  isLoading: false,
  error: null,
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

    return {
      filteredWorkouts,
      hasActiveFilters,
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