import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import type { UserWorkoutResponseDto, WorkoutResponseDto, CreateUserWorkoutDto } from '@resitr/api';
import { UserQueries } from '../../core/user/user-queries';
import { UserMutations } from '../../core/user/user-mutations';
import { CompendiumQueries } from '../../core/compendium/compendium-queries';
import { safeErrorMessage } from '../../shared/utils/type-guards';

export interface EnrichedUserWorkout extends UserWorkoutResponseDto {
  workout: WorkoutResponseDto | null;
}

export interface UserWorkoutsState {
  userWorkouts: UserWorkoutResponseDto[];
  workoutTemplates: WorkoutResponseDto[];
  isLoading: boolean;
  isAdding: boolean;
  isDeleting: boolean;
  error: string | null;
  actionError: string | null;
}

const initialState: UserWorkoutsState = {
  userWorkouts: [],
  workoutTemplates: [],
  isLoading: false,
  isAdding: false,
  isDeleting: false,
  error: null,
  actionError: null,
};

export const UserWorkoutsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    enrichedWorkouts: computed(() => {
      const userWorkouts = store.userWorkouts();
      const templates = store.workoutTemplates();
      const templateMap = new Map(templates.map(t => [t.templateId, t]));

      return userWorkouts.map((uw): EnrichedUserWorkout => ({
        ...uw,
        workout: templateMap.get(uw.workoutTemplateId) ?? null,
      }));
    }),
  })),
  withMethods((store, http = inject(HttpClient)) => ({
    async loadUserWorkouts(): Promise<void> {
      patchState(store, { isLoading: true, error: null });

      try {
        const [userWorkouts, workoutTemplates] = await Promise.all([
          UserQueries.workout.list.fn(http),
          CompendiumQueries.workout.list.fn(http),
        ]);
        patchState(store, { userWorkouts, workoutTemplates, isLoading: false });
      } catch (error) {
        patchState(store, {
          error: safeErrorMessage(error),
          isLoading: false,
        });
      }
    },

    async addWorkout(data: CreateUserWorkoutDto): Promise<UserWorkoutResponseDto | null> {
      patchState(store, { isAdding: true, actionError: null });

      try {
        const userWorkout = await UserMutations.workout.create(http, data);
        patchState(store, {
          userWorkouts: [...store.userWorkouts(), userWorkout],
          isAdding: false,
        });
        return userWorkout;
      } catch (error) {
        patchState(store, {
          actionError: safeErrorMessage(error),
          isAdding: false,
        });
        return null;
      }
    },

    async deleteWorkout(id: string): Promise<boolean> {
      patchState(store, { isDeleting: true, actionError: null });

      try {
        await UserMutations.workout.delete(http, id);
        patchState(store, {
          userWorkouts: store.userWorkouts().filter(uw => uw.id !== id),
          isDeleting: false,
        });
        return true;
      } catch (error) {
        patchState(store, {
          actionError: safeErrorMessage(error),
          isDeleting: false,
        });
        return false;
      }
    },

    isWorkoutAdded(templateId: string): boolean {
      return store.userWorkouts().some(uw => uw.workoutTemplateId === templateId);
    },

    clearActionError(): void {
      patchState(store, { actionError: null });
    },
  })),
  withHooks({ onInit: (store) => store.loadUserWorkouts() })
);

export type UserWorkoutsStore = typeof UserWorkoutsStore;
