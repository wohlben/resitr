import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import type { UserExerciseSchemeResponseDto, CreateUserExerciseSchemeDto } from '@resitr/api';
import { UserQueries } from '../../core/user/user-queries';
import { UserMutations } from '../../core/user/user-mutations';
import { safeErrorMessage } from '../../shared/utils/type-guards';

export interface UserExerciseSchemesState {
  // Map of exerciseId -> schemes[]
  schemesByExercise: Record<string, UserExerciseSchemeResponseDto[]>;
  // Map of sectionItemId -> assigned schemeId
  assignedSchemes: Record<string, string>;
  // Loading states per exercise
  loadingExercises: Set<string>;
  // Saving states per section item (for inline feedback)
  savingSectionItems: Set<string>;
  // Error per section item
  errorBySectionItem: Record<string, string | null>;
}

const initialState: UserExerciseSchemesState = {
  schemesByExercise: {},
  assignedSchemes: {},
  loadingExercises: new Set(),
  savingSectionItems: new Set(),
  errorBySectionItem: {},
};

export const UserExerciseSchemesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isLoadingExercise: computed(() => (exerciseId: string) =>
      store.loadingExercises().has(exerciseId)
    ),
    isSavingSectionItem: computed(() => (sectionItemId: string) =>
      store.savingSectionItems().has(sectionItemId)
    ),
    getSchemesForExercise: computed(() => (exerciseId: string) =>
      store.schemesByExercise()[exerciseId] ?? []
    ),
    getAssignedSchemeId: computed(() => (sectionItemId: string) =>
      store.assignedSchemes()[sectionItemId] ?? null
    ),
    getErrorForSectionItem: computed(() => (sectionItemId: string) =>
      store.errorBySectionItem()[sectionItemId] ?? null
    ),
  })),
  withMethods((store, http = inject(HttpClient)) => ({
    async loadSchemesForExercise(exerciseId: string): Promise<void> {
      // Skip if already loaded or currently loading
      if (store.schemesByExercise()[exerciseId] || store.loadingExercises().has(exerciseId)) {
        return;
      }

      patchState(store, {
        loadingExercises: new Set([...store.loadingExercises(), exerciseId]),
      });

      try {
        const schemes = await UserQueries.exerciseScheme.byExercise(exerciseId).fn(http);
        patchState(store, {
          schemesByExercise: { ...store.schemesByExercise(), [exerciseId]: schemes },
          loadingExercises: new Set([...store.loadingExercises()].filter(id => id !== exerciseId)),
        });
      } catch (error) {
        console.error(`Failed to load schemes for exercise ${exerciseId}:`, error);
        patchState(store, {
          schemesByExercise: { ...store.schemesByExercise(), [exerciseId]: [] },
          loadingExercises: new Set([...store.loadingExercises()].filter(id => id !== exerciseId)),
        });
      }
    },

    async assignSchemeToSectionItem(
      schemeId: string,
      sectionItemId: string,
      userWorkoutId: string
    ): Promise<boolean> {
      patchState(store, {
        savingSectionItems: new Set([...store.savingSectionItems(), sectionItemId]),
        errorBySectionItem: { ...store.errorBySectionItem(), [sectionItemId]: null },
      });

      try {
        await UserMutations.exerciseScheme.assignToSectionItem(http, schemeId, {
          sectionItemId,
          userWorkoutId,
        });

        patchState(store, {
          assignedSchemes: { ...store.assignedSchemes(), [sectionItemId]: schemeId },
          savingSectionItems: new Set([...store.savingSectionItems()].filter(id => id !== sectionItemId)),
        });
        return true;
      } catch (error) {
        patchState(store, {
          errorBySectionItem: { ...store.errorBySectionItem(), [sectionItemId]: safeErrorMessage(error) },
          savingSectionItems: new Set([...store.savingSectionItems()].filter(id => id !== sectionItemId)),
        });
        return false;
      }
    },

    async createAndAssignScheme(
      data: CreateUserExerciseSchemeDto,
      sectionItemId: string,
      userWorkoutId: string
    ): Promise<boolean> {
      patchState(store, {
        savingSectionItems: new Set([...store.savingSectionItems(), sectionItemId]),
        errorBySectionItem: { ...store.errorBySectionItem(), [sectionItemId]: null },
      });

      try {
        // Create the scheme
        const scheme = await UserMutations.exerciseScheme.create(http, data);

        // Assign it to the section item
        await UserMutations.exerciseScheme.assignToSectionItem(http, scheme.id, {
          sectionItemId,
          userWorkoutId,
        });

        // Update cache with new scheme
        const exerciseSchemes = store.schemesByExercise()[data.exerciseId] ?? [];
        patchState(store, {
          schemesByExercise: {
            ...store.schemesByExercise(),
            [data.exerciseId]: [...exerciseSchemes, scheme],
          },
          assignedSchemes: { ...store.assignedSchemes(), [sectionItemId]: scheme.id },
          savingSectionItems: new Set([...store.savingSectionItems()].filter(id => id !== sectionItemId)),
        });
        return true;
      } catch (error) {
        patchState(store, {
          errorBySectionItem: { ...store.errorBySectionItem(), [sectionItemId]: safeErrorMessage(error) },
          savingSectionItems: new Set([...store.savingSectionItems()].filter(id => id !== sectionItemId)),
        });
        return false;
      }
    },

    clearErrorForSectionItem(sectionItemId: string): void {
      patchState(store, {
        errorBySectionItem: { ...store.errorBySectionItem(), [sectionItemId]: null },
      });
    },

    setAssignedScheme(sectionItemId: string, schemeId: string): void {
      patchState(store, {
        assignedSchemes: { ...store.assignedSchemes(), [sectionItemId]: schemeId },
      });
    },
  }))
);

export type UserExerciseSchemesStore = typeof UserExerciseSchemesStore;
