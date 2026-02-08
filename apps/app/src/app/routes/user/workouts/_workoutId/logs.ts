import { Component, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WorkoutLogsStore } from '../../../../features/workout-logs/workout-logs.store';
import { LoadingComponent } from '../../../../components/ui/feedback/loading.component';
import { ErrorLoadingComponent } from '../../../../components/ui/feedback/error-loading.component';
import { ButtonComponent } from '../../../../components/ui/buttons/button.component';
import { UserWorkoutsStore } from '../../../../features/user-workouts/user-workouts.store';
import { CalendarComponent, type CalendarEntry } from '../../../../components/ui/calendar/calendar.component';
import type { WorkoutLogListItemDto } from '@resitr/api';

@Component({
  selector: 'app-workout-logs',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DatePipe,
    LoadingComponent,
    ErrorLoadingComponent,
    ButtonComponent,
    CalendarComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4">
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ workoutName() }} - Logs</h1>
            <p class="text-gray-600 mt-1">View workout history and performance</p>
          </div>
          <app-button variant="secondary" [link]="'/user/workouts/' + workoutId()">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Workout
          </app-button>
        </div>
      </div>

      <!-- Loading State -->
      @if (store.isLoading()) {
      <app-loading message="Loading workout logs..." />
      }

      <!-- Error State -->
      @if (store.error()) {
      <app-error-loading title="Error loading workout logs" [message]="store.error()!" />
      }

      <!-- Content -->
      @if (!store.isLoading() && !store.error()) {
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: Log List -->
        <div class="lg:col-span-2 space-y-4">
          @if (store.logs().length === 0) {
          <div class="text-center py-12 bg-gray-50 rounded-lg">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p class="text-gray-600 mb-4">No workout logs found</p>
            <app-button variant="primary" [link]="'/user/workouts/' + workoutId() + '/run'">
              Start This Workout
            </app-button>
          </div>
          } @else {
          <div class="space-y-3">
            @for (log of store.logs(); track log.id) {
            <div
              class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              [routerLink]="['/user/workouts', workoutId(), 'logs', log.id]"
            >
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-semibold text-gray-900">{{ log.name }}</h3>
                  <p class="text-sm text-gray-500">{{ log.startedAt | date : 'medium' }}</p>
                </div>
                <div class="flex items-center gap-2">
                  @if (log.completedAt) {
                  <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    Completed
                  </span>
                  } @else if (isStartedToday(log)) {
                  <span class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                    In Progress
                  </span>
                  } @else {
                  <span class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700"> Incomplete </span>
                  }
                </div>
              </div>
              @if (log.completedAt) {
              <div class="mt-2 text-sm text-gray-600">
                Duration: {{ formatDuration(log.startedAt, log.completedAt) }}
              </div>
              }
            </div>
            }
          </div>
          }
        </div>

        <!-- Right: Calendar -->
        <div class="lg:col-span-1">
          <app-calendar [entries]="calendarEntries()" [legend]="calendarLegend" (dayClick)="selectDate($event)" />
        </div>
      </div>
      }
    </div>
  `,
})
export class WorkoutLogsComponent {
  readonly store = inject(WorkoutLogsStore);
  readonly userWorkoutsStore = inject(UserWorkoutsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Get workoutId from route params
  readonly workoutId = computed(() => this.route.snapshot.paramMap.get('workoutId') || '');

  readonly calendarLegend = {
    green: 'Completed',
    yellow: 'Started (Today)',
    red: 'Incomplete/Aborted',
  };

  constructor() {
    // Load logs for this workout
    const workoutId = this.workoutId();
    if (workoutId) {
      this.store.setWorkoutTemplateId(workoutId);
      this.store.loadLogs();
    }
  }

  readonly workoutName = computed(() => {
    const workoutId = this.workoutId();
    if (!workoutId) return 'Workout';

    const workout = this.userWorkoutsStore.enrichedWorkouts().find((uw) => uw.id === workoutId);
    return workout?.workout?.name ?? 'Workout';
  });

  readonly calendarEntries = computed((): CalendarEntry[] => {
    return this.store.logs().map((log) => {
      const logDate = new Date(log.startedAt);
      let type = 'red';
      if (log.completedAt) {
        type = 'green';
      } else if (this.isStartedToday(log)) {
        type = 'yellow';
      }

      return {
        on: logDate,
        type,
        name: log.name,
      };
    });
  });

  isStartedToday(log: WorkoutLogListItemDto): boolean {
    if (log.completedAt) return false;

    const startedAt = new Date(log.startedAt);
    const today = new Date();
    return (
      startedAt.getDate() === today.getDate() &&
      startedAt.getMonth() === today.getMonth() &&
      startedAt.getFullYear() === today.getFullYear()
    );
  }

  formatDuration(startedAt: Date, completedAt: Date): string {
    const start = new Date(startedAt).getTime();
    const end = new Date(completedAt).getTime();
    const durationMs = end - start;

    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  selectDate(date: Date): void {
    // Find logs for this date and navigate to the first one
    const dateString = date.toDateString();
    const logs = this.store.logsByDate().get(dateString);
    if (logs && logs.length > 0) {
      this.router.navigate(['/user/workouts', this.workoutId(), 'logs', logs[0].id]);
    }
  }
}
