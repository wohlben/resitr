import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import type {
  WorkoutScheduleResponseDto,
  CreateWorkoutScheduleDto,
  CreateWorkoutScheduleCriteriaDto,
  UpdateWorkoutScheduleCriteriaDto,
} from '@resitr/api';
import { UserQueries } from '../../core/user/user-queries';
import { UserMutations } from '../../core/user/user-mutations';
import { safeErrorMessage } from '../../shared/utils/type-guards';

export interface WorkoutScheduleState {
  schedules: WorkoutScheduleResponseDto[];
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
    // Group schedules by day of week (based on criteria days)
    schedulesByDay: computed(() => {
      const map = new Map<number, WorkoutScheduleResponseDto[]>();
      for (let i = 0; i < 7; i++) {
        map.set(i, []);
      }

      for (const schedule of store.schedules()) {
        // Get all unique days from all criteria
        const allDays = new Set<number>();
        for (const criteria of schedule.criteria) {
          for (const day of criteria.days) {
            allDays.add(day);
          }
        }

        // Add schedule to each day it appears on
        for (const day of allDays) {
          const daySchedules = map.get(day) ?? [];
          // Only add if not already in the list (avoid duplicates)
          if (!daySchedules.find((s) => s.id === schedule.id)) {
            daySchedules.push(schedule);
          }
          map.set(day, daySchedules);
        }
      }

      return map;
    }),

    dayNames: computed(() => DAYS_OF_WEEK),

    // Get upcoming schedule instances with their dates for the next N weeks
    // Returns schedules with upcoming dates that need to be filtered against existing logs
    upcomingScheduleInstances: computed(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayDayOfWeek = today.getDay();

      const instances: Array<{
        schedule: WorkoutScheduleResponseDto;
        criteriaDays: number[];
        upcomingDates: Date[];
      }> = [];

      // Look ahead 4 weeks
      const weeksToLookAhead = 4;

      for (const schedule of store.schedules()) {
        // Get all unique days from all criteria
        const allDays = new Set<number>();
        for (const criteria of schedule.criteria) {
          for (const day of criteria.days) {
            allDays.add(day);
          }
        }

        const criteriaDays = Array.from(allDays).sort((a, b) => a - b);
        const upcomingDates: Date[] = [];

        // Generate dates for each day of week in the next N weeks
        for (const dayOfWeek of criteriaDays) {
          for (let weekOffset = 0; weekOffset < weeksToLookAhead; weekOffset++) {
            const daysUntilDay = (dayOfWeek - todayDayOfWeek + 7) % 7;
            const scheduleDate = new Date(today);
            scheduleDate.setDate(today.getDate() + daysUntilDay + weekOffset * 7);

            // Only include future dates (not today)
            if (scheduleDate > today) {
              upcomingDates.push(scheduleDate);
            }
          }
        }

        // Sort dates chronologically
        upcomingDates.sort((a, b) => a.getTime() - b.getTime());

        if (criteriaDays.length > 0) {
          instances.push({
            schedule,
            criteriaDays,
            upcomingDates,
          });
        }
      }

      return instances;
    }),
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

    async createSchedule(
      data: CreateWorkoutScheduleDto,
      criteriaData: CreateWorkoutScheduleCriteriaDto
    ): Promise<WorkoutScheduleResponseDto | null> {
      patchState(store, { isCreating: true, actionError: null });

      try {
        // First create the schedule
        const schedule = await UserMutations.workoutSchedule.create(http, data);

        // Then create the criteria
        await UserMutations.workoutSchedule.createCriteria(http, schedule.id, criteriaData);

        // Reload schedules to get the full data with criteria
        await this.loadSchedules();

        patchState(store, { isCreating: false });
        return schedule;
      } catch (error) {
        patchState(store, {
          actionError: safeErrorMessage(error),
          isCreating: false,
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

    async addCriteria(
      scheduleId: string,
      data: CreateWorkoutScheduleCriteriaDto
    ): Promise<WorkoutScheduleResponseDto | null> {
      patchState(store, { isUpdating: true, actionError: null });

      try {
        await UserMutations.workoutSchedule.createCriteria(http, scheduleId, data);

        // Reload schedules to get updated data
        await this.loadSchedules();

        patchState(store, { isUpdating: false });
        return store.schedules().find((s) => s.id === scheduleId) ?? null;
      } catch (error) {
        patchState(store, {
          actionError: safeErrorMessage(error),
          isUpdating: false,
        });
        return null;
      }
    },

    async updateCriteria(
      scheduleId: string,
      criteriaId: string,
      data: UpdateWorkoutScheduleCriteriaDto
    ): Promise<WorkoutScheduleResponseDto | null> {
      patchState(store, { isUpdating: true, actionError: null });

      try {
        await UserMutations.workoutSchedule.updateCriteria(http, scheduleId, criteriaId, data);

        // Reload schedules to get updated data
        await this.loadSchedules();

        patchState(store, { isUpdating: false });
        return store.schedules().find((s) => s.id === scheduleId) ?? null;
      } catch (error) {
        patchState(store, {
          actionError: safeErrorMessage(error),
          isUpdating: false,
        });
        return null;
      }
    },

    async deleteCriteria(scheduleId: string, criteriaId: string): Promise<boolean> {
      patchState(store, { isUpdating: true, actionError: null });

      try {
        await UserMutations.workoutSchedule.deleteCriteria(http, scheduleId, criteriaId);

        // Reload schedules to get updated data
        await this.loadSchedules();

        patchState(store, { isUpdating: false });
        return true;
      } catch (error) {
        patchState(store, {
          actionError: safeErrorMessage(error),
          isUpdating: false,
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
