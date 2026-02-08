import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WorkoutLogsStore } from '../../features/workout-logs/workout-logs.store';
import { LoadingComponent } from '../../components/ui/feedback/loading.component';
import { ErrorLoadingComponent } from '../../components/ui/feedback/error-loading.component';
import { ButtonComponent } from '../../components/ui/buttons/button.component';
import { UserWorkoutsStore } from '../../features/user-workouts/user-workouts.store';
import type { WorkoutLogListItemDto } from '@resitr/api';

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  logs: WorkoutLogListItemDto[];
}

@Component({
  selector: 'app-workout-logs',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, LoadingComponent, ErrorLoadingComponent, ButtonComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4">
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              {{ workoutName() ? workoutName() + ' - Logs' : 'Workout Logs' }}
            </h1>
            <p class="text-gray-600 mt-1">
              {{ store.workoutTemplateId() ? 'Viewing logs for a specific workout' : 'View all your workout logs' }}
            </p>
          </div>
          <app-button variant="secondary" link="/user/workouts">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Workouts
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
            @if (store.workoutTemplateId()) {
            <app-button variant="primary" [link]="'/user/workouts/' + store.workoutTemplateId() + '/run'">
              Start This Workout
            </app-button>
            }
          </div>
          } @else {
          <div class="space-y-3">
            @for (log of store.logs(); track log.id) {
            <div
              class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              [routerLink]="['/user/workout-logs', log.id]"
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
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <!-- Calendar Header -->
            <div class="flex items-center justify-between mb-4">
              <button class="p-1 hover:bg-gray-100 rounded" (click)="previousMonth()">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 class="font-semibold text-gray-900">
                {{ currentMonth() | date : 'MMMM yyyy' }}
              </h3>
              <button class="p-1 hover:bg-gray-100 rounded" (click)="nextMonth()">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <!-- Calendar Grid -->
            <div class="grid grid-cols-7 gap-1">
              <!-- Weekday headers -->
              @for (day of ['S', 'M', 'T', 'W', 'T', 'F', 'S']; track $index) {
              <div class="text-center text-xs font-medium text-gray-500 py-1">
                {{ day }}
              </div>
              }

              <!-- Calendar days -->
              @for (day of calendarDays(); track day.date.getTime()) {
              <div
                class="aspect-square p-1 text-sm rounded cursor-pointer hover:bg-gray-100 transition-colors relative"
                [class.bg-gray-50]="!day.isCurrentMonth"
                [class.font-semibold]="isToday(day.date)"
                [class.ring-2]="isToday(day.date)"
                [class.ring-blue-500]="isToday(day.date)"
                (click)="selectDate(day.date)"
              >
                <span [class.text-gray-400]="!day.isCurrentMonth">{{ day.dayOfMonth }}</span>

                <!-- Status dots -->
                @if (day.logs.length > 0) {
                <div class="absolute bottom-1 left-1 right-1 flex justify-center gap-0.5">
                  @for (log of day.logs.slice(0, 3); track log.id) {
                  <div
                    class="w-1.5 h-1.5 rounded-full"
                    [class.bg-green-500]="log.completedAt"
                    [class.bg-yellow-500]="isStartedToday(log)"
                    [class.bg-red-500]="!log.completedAt && !isStartedToday(log)"
                  ></div>
                  } @if (day.logs.length > 3) {
                  <div class="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                  }
                </div>
                }
              </div>
              }
            </div>

            <!-- Legend -->
            <div class="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <div class="flex items-center gap-2 text-xs">
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                <span class="text-gray-600">Completed</span>
              </div>
              <div class="flex items-center gap-2 text-xs">
                <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span class="text-gray-600">Started (Today)</span>
              </div>
              <div class="flex items-center gap-2 text-xs">
                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                <span class="text-gray-600">Incomplete/Aborted</span>
              </div>
            </div>
          </div>
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

  readonly currentMonth = signal(new Date());

  constructor() {
    // Read query params
    this.route.queryParams.subscribe((params) => {
      const workoutTemplateId = params['workoutTemplateId'];
      if (workoutTemplateId) {
        this.store.setWorkoutTemplateId(workoutTemplateId);
        this.store.loadLogs();
      }
    });
  }

  readonly workoutName = computed(() => {
    const templateId = this.store.workoutTemplateId();
    if (!templateId) return null;

    const workout = this.userWorkoutsStore.enrichedWorkouts().find((uw) => uw.workoutTemplateId === templateId);
    return workout?.workout?.name ?? null;
  });

  readonly calendarDays = computed(() => {
    const year = this.currentMonth().getFullYear();
    const month = this.currentMonth().getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);

    // Generate 6 weeks (42 days) to ensure we cover the full month view
    for (let i = 0; i < 42; i++) {
      const date = new Date(currentDate);
      const isCurrentMonth = date.getMonth() === month;
      const dateString = date.toDateString();
      const logs = this.store.logsByDate().get(dateString) ?? [];

      days.push({
        date,
        dayOfMonth: date.getDate(),
        isCurrentMonth,
        logs,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  });

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

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

  previousMonth(): void {
    const newDate = new Date(this.currentMonth());
    newDate.setMonth(newDate.getMonth() - 1);
    this.currentMonth.set(newDate);
  }

  nextMonth(): void {
    const newDate = new Date(this.currentMonth());
    newDate.setMonth(newDate.getMonth() + 1);
    this.currentMonth.set(newDate);
  }

  selectDate(date: Date): void {
    // Find logs for this date and potentially navigate to the first one
    const dateString = date.toDateString();
    const logs = this.store.logsByDate().get(dateString);
    if (logs && logs.length > 0) {
      this.router.navigate(['/user/workout-logs', logs[0].id]);
    }
  }
}
