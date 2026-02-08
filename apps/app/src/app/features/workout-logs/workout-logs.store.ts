import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import type { WorkoutLogListItemDto } from '@resitr/api';
import { UserQueries } from '../../core/user/user-queries';
import { safeErrorMessage } from '../../shared/utils/type-guards';

export interface WorkoutLogsState {
  logs: WorkoutLogListItemDto[];
  isLoading: boolean;
  error: string | null;
  workoutTemplateId: string | null;
}

const initialState: WorkoutLogsState = {
  logs: [],
  isLoading: false,
  error: null,
  workoutTemplateId: null,
};

export const WorkoutLogsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    // Group logs by date for calendar view
    logsByDate: computed(() => {
      const map = new Map<string, WorkoutLogListItemDto[]>();
      for (const log of store.logs()) {
        const date = new Date(log.startedAt).toDateString();
        if (!map.has(date)) {
          map.set(date, []);
        }
        map.get(date)!.push(log);
      }
      return map;
    }),
    // Get unique months with logs for navigation
    monthsWithLogs: computed(() => {
      const months = new Set<string>();
      for (const log of store.logs()) {
        const date = new Date(log.startedAt);
        months.add(`${date.getFullYear()}-${date.getMonth()}`);
      }
      return Array.from(months).sort().reverse();
    }),
  })),
  withMethods((store, http = inject(HttpClient)) => ({
    setWorkoutTemplateId(workoutTemplateId: string | null): void {
      patchState(store, { workoutTemplateId });
    },

    async loadLogs(): Promise<void> {
      patchState(store, { isLoading: true, error: null });

      try {
        const query = UserQueries.workoutLog.list(store.workoutTemplateId() ?? undefined);
        const logs = await query.fn(http);
        patchState(store, { logs, isLoading: false });
      } catch (error) {
        patchState(store, {
          error: safeErrorMessage(error),
          isLoading: false,
        });
      }
    },

    clearError(): void {
      patchState(store, { error: null });
    },
  })),
  withHooks({
    onInit: (store) => {
      store.loadLogs();
    },
  })
);

export type WorkoutLogsStore = typeof WorkoutLogsStore;
