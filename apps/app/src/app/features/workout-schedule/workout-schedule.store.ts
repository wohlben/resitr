import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import type {
  UserWorkoutScheduleResponseDto,
  CreateUserWorkoutScheduleDto,
  UpdateUserWorkoutScheduleDto,
} from '@resitr/api';
import { UserQueries } from '../../core/user/user-queries';
import { UserMutations } from '../../core/user/user-mutations';
import { safeErrorMessage } from '../../shared/utils/type-guards';

export interface WorkoutScheduleState {
  schedules: UserWorkoutScheduleResponseDto[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  actionError: string | null;
}

const initialState: WorkoutScheduleState = {
  schedules: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  actionError: null,
};

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const WorkoutScheduleStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    // Group schedules by day of week
    schedulesByDay: computed(() => {
      const map = new Map<number, UserWorkoutScheduleResponseDto[]>();
      for (let i = 0; i < 7; i++) {
        map.set(i, []);
      }
      for (const schedule of store.schedules()) {
        const daySchedules = map.get(schedule.dayOfWeek) ?? [];
        daySchedules.push(schedule);
        map.set(schedule.dayOfWeek, daySchedules);
      }
      // Sort each day's schedules by order
      for (const [day, daySchedules] of map) {
        daySchedules.sort((a, b) => a.order - b.order);
        map.set(day, daySchedules);
      }
      return map;
    }),

    dayNames: computed(() => DAYS_OF_WEEK),
  })),
  withMethods((store, http = inject(HttpClient)) => ({
    async loadSchedules(): Promise<void> {
      patchState(store, { isLoading: true, error: null });

      try {
        const schedules = await UserQueries.workoutSchedule.list.fn(http);
        patchState(store, { schedules, isLoading: false });
      } catch (error) {
        patchState(store, {
          error: safeErrorMessage(error),
          isLoading: false,
        });
      }
    },

    async createSchedule(data: CreateUserWorkoutScheduleDto): Promise<UserWorkoutScheduleResponseDto | null> {
      patchState(store, { isCreating: true, actionError: null });

      try {
        const schedule = await UserMutations.workoutSchedule.create(http, data);
        patchState(store, {
          schedules: [...store.schedules(), schedule],
          isCreating: false,
        });
        return schedule;
      } catch (error) {
        patchState(store, {
          actionError: safeErrorMessage(error),
          isCreating: false,
        });
        return null;
      }
    },

    async updateSchedule(
      id: string,
      data: UpdateUserWorkoutScheduleDto
    ): Promise<UserWorkoutScheduleResponseDto | null> {
      patchState(store, { isUpdating: true, actionError: null });

      try {
        const schedule = await UserMutations.workoutSchedule.update(http, id, data);
        patchState(store, {
          schedules: store.schedules().map((s) => (s.id === id ? schedule : s)),
          isUpdating: false,
        });
        return schedule;
      } catch (error) {
        patchState(store, {
          actionError: safeErrorMessage(error),
          isUpdating: false,
        });
        return null;
      }
    },

    async deleteSchedule(id: string): Promise<boolean> {
      patchState(store, { isDeleting: true, actionError: null });

      try {
        await UserMutations.workoutSchedule.delete(http, id);
        patchState(store, {
          schedules: store.schedules().filter((s) => s.id !== id),
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

    clearActionError(): void {
      patchState(store, { actionError: null });
    },
  })),
  withHooks({
    onInit: (store) => {
      store.loadSchedules();
    },
  })
);

export type WorkoutScheduleStore = typeof WorkoutScheduleStore;
