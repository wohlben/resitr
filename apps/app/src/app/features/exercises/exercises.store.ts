import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import type {
  ExerciseResponseDto,
  ExerciseType,
  Muscle,
  TechnicalDifficulty,
} from '@resitr/api';
import { CompendiumQueries } from '../../core/compendium/compendium-queries';

export interface ExercisesState {
  exercises: ExerciseResponseDto[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  selectedType: ExerciseType | '';
  selectedMuscle: Muscle | '';
  selectedDifficulty: TechnicalDifficulty | '';
}

const initialState: ExercisesState = {
  exercises: [],
  isLoading: false,
  error: null,
  searchTerm: '',
  selectedType: '',
  selectedMuscle: '',
  selectedDifficulty: '',
};

export const ExercisesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    // Filtered exercises based on search and filters
    const filteredExercises = computed(() => {
      const exercises = store.exercises();
      const search = store.searchTerm().toLowerCase().trim();
      const type = store.selectedType();
      const muscle = store.selectedMuscle();
      const difficulty = store.selectedDifficulty();

      return exercises.filter((exercise) => {
        // Search filter
        if (search) {
          const matchesName = exercise.name.toLowerCase().includes(search);
          const matchesAltNames = exercise.alternativeNames?.some((name) =>
            name.toLowerCase().includes(search)
          );
          if (!matchesName && !matchesAltNames) return false;
        }

        // Type filter
        if (type && exercise.type !== type) return false;

        // Muscle filter
        if (muscle) {
          const hasPrimary = exercise.primaryMuscles.includes(muscle);
          const hasSecondary = exercise.secondaryMuscles.includes(muscle);
          if (!hasPrimary && !hasSecondary) return false;
        }

        // Difficulty filter
        if (difficulty && exercise.technicalDifficulty !== difficulty)
          return false;

        return true;
      });
    });

    // Check if any filters are active
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
    // Load exercises
    async loadExercises(): Promise<void> {
      patchState(store, { isLoading: true, error: null });

      try {
        const exercises = await CompendiumQueries.exercise.list.fn(http);
        patchState(store, { exercises, isLoading: false });
      } catch (error) {
        patchState(store, {
          error: (error as Error).message || 'Failed to load exercises',
          isLoading: false,
        });
      }
    },

    // Update search term
    setSearchTerm(searchTerm: string): void {
      patchState(store, { searchTerm });
    },

    // Update type filter
    setSelectedType(selectedType: ExerciseType | ''): void {
      patchState(store, { selectedType });
    },

    // Update muscle filter
    setSelectedMuscle(selectedMuscle: Muscle | ''): void {
      patchState(store, { selectedMuscle });
    },

    // Update difficulty filter
    setSelectedDifficulty(selectedDifficulty: TechnicalDifficulty | ''): void {
      patchState(store, { selectedDifficulty });
    },

    // Clear all filters
    clearFilters(): void {
      patchState(store, {
        searchTerm: '',
        selectedType: '',
        selectedMuscle: '',
        selectedDifficulty: '',
      });
    },
  }))
);
