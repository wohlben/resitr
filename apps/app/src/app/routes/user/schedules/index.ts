import { Component, computed, effect, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { WorkoutScheduleStore } from '../../../features/workout-schedule/workout-schedule.store';
import { UserWorkoutsStore } from '../../../features/user-workouts/user-workouts.store';
import { LoadingComponent } from '../../../components/ui/feedback/loading.component';
import { ErrorLoadingComponent } from '../../../components/ui/feedback/error-loading.component';
import { ButtonComponent } from '../../../components/ui/buttons/button.component';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { ToastService } from '../../../core/services/toast.service';
import type { UserWorkoutScheduleResponseDto } from '@resitr/api';
import type { EnrichedUserWorkout } from '../../../features/user-workouts/user-workouts.store';

interface DaySchedule {
  dayIndex: number;
  dayName: string;
  isToday: boolean;
  schedules: Array<{
    schedule: UserWorkoutScheduleResponseDto;
    workoutName: string | null;
    workoutId: string | null;
  }>;
}

@Component({
  selector: 'app-schedules-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, ErrorLoadingComponent, ButtonComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4">
        <!-- Contextual Back Button (only shown when workout is provided) -->
        @if (workout()) {
        <div class="flex items-center gap-4">
          <app-button variant="secondary" [link]="backLink()">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Workout
          </app-button>
        </div>
        }

        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ pageTitle() }}</h1>
            <p class="text-gray-600 mt-1">{{ pageSubtitle() }}</p>
          </div>
          <app-button variant="primary" [link]="createScheduleLink()" [queryParams]="dayCreateQueryParams()">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Schedule Workout
          </app-button>
        </div>
      </div>

      <!-- Loading State -->
      @if (store.isLoading()) {
      <app-loading message="Loading your schedules..." />
      }

      <!-- Error State -->
      @if (store.error()) {
      <app-error-loading title="Error loading schedules" [message]="store.error()!" />
      }

      <!-- Content -->
      @if (!store.isLoading() && !store.error()) {
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <!-- Weekly Calendar Grid -->
        <div class="grid grid-cols-7 divide-x divide-gray-200">
          @for (day of weekDays(); track day.dayIndex) {
          <div class="min-h-[200px] flex flex-col" [class.bg-blue-50]="day.isToday" [class.bg-gray-50]="!day.isToday">
            <!-- Day Header -->
            <div
              class="p-3 border-b border-gray-200 text-center"
              [class.bg-blue-100]="day.isToday"
              [class.bg-gray-100]="!day.isToday"
            >
              <div class="text-sm font-medium" [class.text-blue-700]="day.isToday" [class.text-gray-600]="!day.isToday">
                {{ day.dayName }}
              </div>
              @if (day.isToday) {
              <div class="text-xs text-blue-600 mt-1">Today</div>
              }
            </div>

            <!-- Day Content -->
            <div class="p-2 space-y-2 flex-1">
              @for (item of day.schedules; track item.schedule.id) {
              <div
                class="bg-white rounded border border-gray-200 p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                [routerLink]="scheduleEditLink(item.schedule.id)"
              >
                <div class="flex items-start justify-between gap-1">
                  <div class="min-w-0 flex-1">
                    <div class="text-sm font-medium text-gray-900 truncate">
                      {{ item.workoutName || 'Unknown Workout' }}
                    </div>
                    <div class="text-xs text-gray-500 mt-0.5">Order: {{ item.schedule.order + 1 }}</div>
                  </div>
                  <!-- Delete Button -->
                  <button
                    class="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                    (click)="deleteSchedule($event, item.schedule)"
                    title="Delete workout schedule"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              } @if (day.schedules.length === 0) {
              <div class="text-center py-4 text-gray-400 text-sm italic">No workouts</div>
              }
            </div>

            <!-- Add Button -->
            <div class="p-2 border-t border-gray-200">
              <a
                class="w-full py-1 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center justify-center gap-1"
                [routerLink]="createScheduleLink()"
                [queryParams]="dayCreateQueryParams(day.dayIndex)"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Schedule
              </a>
            </div>
          </div>
          }
        </div>
      </div>

      <!-- Legend -->
      <div class="flex items-center gap-6 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
          <span>Today</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-white border border-gray-200 rounded"></div>
          <span>Scheduled</span>
        </div>
      </div>
      }
    </div>
  `,
})
export class SchedulesListComponent {
  readonly store = inject(WorkoutScheduleStore);
  readonly userWorkoutsStore = inject(UserWorkoutsStore);
  private readonly router = inject(Router);
  private readonly confirmation = inject(ConfirmationService);
  private readonly toast = inject(ToastService);

  // Optional workout input - when provided, filters to that workout
  workout = input<EnrichedUserWorkout | null>(null);

  // Optional back link input
  backLink = input<string>('/user/workouts');

  constructor() {
    console.log('[SchedulesList] Component created');
    // Log when workout input changes
    effect(() => {
      console.log('[SchedulesList] workout() changed to:', this.workout());
    });
  }

  readonly pageTitle = computed(() => {
    const w = this.workout();
    return w?.workout?.name ? `${w.workout.name} Schedule` : 'All Workout Schedules';
  });

  readonly pageSubtitle = computed(() => {
    return this.workout() ? 'Weekly schedule for this workout' : 'Manage all your weekly workout schedules';
  });

  readonly createScheduleLink = computed(() => {
    const w = this.workout();
    if (w) {
      return `/user/workouts/${w.id}/schedules/new`;
    }
    return '/user/schedules/new';
  });

  dayCreateQueryParams(dayIndex?: number): Record<string, string> | null {
    const params: Record<string, string> = {};
    if (dayIndex !== undefined) {
      params['dayOfWeek'] = dayIndex.toString();
    }
    return Object.keys(params).length > 0 ? params : null;
  }

  scheduleEditLink(scheduleId: string): string[] {
    const w = this.workout();
    if (w) {
      return ['/user/workouts', w.id, 'schedules', scheduleId, 'edit'];
    }
    return ['/user/schedules', scheduleId];
  }

  readonly weekDays = computed(() => {
    const today = new Date().getDay();
    const days: DaySchedule[] = [];
    const w = this.workout();

    for (let i = 0; i < 7; i++) {
      let schedules = this.store.schedulesByDay().get(i) ?? [];

      // Filter to only show schedules for this specific workout if provided
      if (w) {
        schedules = schedules.filter((s) => s.workoutTemplateId === w.workoutTemplateId);
      }

      const enrichedSchedules = schedules.map((schedule) => {
        const schedWorkout = this.userWorkoutsStore
          .enrichedWorkouts()
          .find((uw) => uw.workoutTemplateId === schedule.workoutTemplateId);
        return {
          schedule,
          workoutName: schedWorkout?.workout?.name || null,
          workoutId: schedWorkout?.id || null,
        };
      });

      days.push({
        dayIndex: i,
        dayName: this.store.dayNames()[i],
        isToday: i === today,
        schedules: enrichedSchedules,
      });
    }

    return days;
  });

  async deleteSchedule(event: Event, schedule: UserWorkoutScheduleResponseDto): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const workout = this.userWorkoutsStore
      .enrichedWorkouts()
      .find((uw) => uw.workoutTemplateId === schedule.workoutTemplateId);
    const workoutName = workout?.workout?.name || 'this workout';

    const confirmed = await this.confirmation.confirm({
      title: 'Delete Workout Schedule',
      message: `Delete the scheduled "${workoutName}" from ${this.store.dayNames()[schedule.dayOfWeek]}?`,
      confirmText: 'Delete',
      isDestructive: true,
    });

    if (!confirmed) return;

    const success = await this.store.deleteSchedule(schedule.id);

    if (success) {
      this.toast.success(`Workout schedule deleted`);
    } else {
      this.toast.error(this.store.actionError() || 'Failed to delete workout schedule');
    }
  }
}
