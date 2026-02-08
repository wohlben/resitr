import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { WorkoutLogsStore } from '../../features/workout-logs/workout-logs.store';
import { WorkoutScheduleStore } from '../../features/workout-schedule/workout-schedule.store';
import { UserWorkoutsStore } from '../../features/user-workouts/user-workouts.store';
import { LoadingComponent } from '../../components/ui/feedback/loading.component';
import { ErrorLoadingComponent } from '../../components/ui/feedback/error-loading.component';
import { ButtonComponent } from '../../components/ui/buttons/button.component';
import { CalendarComponent, type CalendarEntry } from '../../components/ui/calendar/calendar.component';
import type { WorkoutLogListItemDto } from '@resitr/api';

interface LegendConfig {
  [key: string]: string;
}

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, ErrorLoadingComponent, ButtonComponent, CalendarComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4">
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Calendar</h1>
            <p class="text-gray-600 mt-1">View your workout history and upcoming schedules</p>
          </div>
          <app-button variant="primary" link="/user/workouts">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Start Workout
          </app-button>
        </div>
      </div>

      <!-- Loading State -->
      @if (logsStore.isLoading() || schedulesStore.isLoading()) {
      <app-loading message="Loading your calendar..." />
      }

      <!-- Error State -->
      @if (logsStore.error()) {
      <app-error-loading title="Error loading workout logs" [message]="logsStore.error()!" />
      }

      <!-- Content -->
      @if (!logsStore.isLoading() && !logsStore.error()) {
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: List of upcoming schedules and recent logs -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Upcoming Schedules -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Upcoming Workouts</h2>
            @if (upcomingSchedules().length === 0) {
            <p class="text-gray-500 text-center py-4">No upcoming scheduled workouts</p>
            } @else {
            <div class="space-y-3">
              @for (schedule of upcomingSchedules().slice(0, 5); track schedule.id) {
              <div class="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                <div>
                  <div class="font-medium text-gray-900">{{ schedule.workoutName }}</div>
                  <div class="text-sm text-gray-500">{{ schedule.dayName }}s</div>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span class="text-sm text-purple-700">Planned</span>
                </div>
              </div>
              }
            </div>
            }
          </div>

          <!-- Recent Logs -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Workouts</h2>
            @if (logsStore.logs().length === 0) {
            <p class="text-gray-500 text-center py-4">No workout logs yet</p>
            } @else {
            <div class="space-y-3">
              @for (log of recentLogs(); track log.id) {
              <div
                class="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
                [class.bg-green-50]="log.completedAt"
                [class.border-green-100]="log.completedAt"
                [class.bg-yellow-50]="isStartedToday(log)"
                [class.border-yellow-100]="isStartedToday(log)"
                [class.bg-red-50]="!log.completedAt && !isStartedToday(log)"
                [class.border-red-100]="!log.completedAt && !isStartedToday(log)"
                [routerLink]="['/user/workout-logs', log.id]"
              >
                <div>
                  <div class="font-medium text-gray-900">{{ log.name }}</div>
                  <div class="text-sm text-gray-500">{{ log.startedAt | date : 'medium' }}</div>
                </div>
                <div class="flex items-center gap-2">
                  @if (log.completedAt) {
                  <div class="w-2 h-2 rounded-full bg-green-500"></div>
                  <span class="text-sm text-green-700">Completed</span>
                  } @else if (isStartedToday(log)) {
                  <div class="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span class="text-sm text-yellow-700">In Progress</span>
                  } @else {
                  <div class="w-2 h-2 rounded-full bg-red-500"></div>
                  <span class="text-sm text-red-700">Incomplete</span>
                  }
                </div>
              </div>
              }
            </div>
            }
          </div>
        </div>

        <!-- Right: Calendar -->
        <div class="lg:col-span-1">
          <app-calendar [entries]="calendarEntries()" [legend]="calendarLegend" (dayClick)="onDayClick($event)" />
        </div>
      </div>
      }
    </div>
  `,
})
export class CalendarPageComponent {
  readonly logsStore = inject(WorkoutLogsStore);
  readonly schedulesStore = inject(WorkoutScheduleStore);
  readonly userWorkoutsStore = inject(UserWorkoutsStore);
  private readonly router = inject(Router);

  readonly calendarLegend: LegendConfig = {
    green: 'Completed',
    purple: 'Planned',
    yellow: 'In Progress',
    red: 'Incomplete',
  };

  readonly recentLogs = computed(() => {
    return this.logsStore.logs().slice(0, 10);
  });

  readonly upcomingSchedules = computed(() => {
    const today = new Date().getDay();
    const schedules = this.schedulesStore.schedules();
    const enrichedWorkouts = this.userWorkoutsStore.enrichedWorkouts();

    const upcoming: Array<{
      id: string;
      workoutName: string;
      dayIndex: number;
      dayName: string;
    }> = [];

    for (const schedule of schedules) {
      const workout = enrichedWorkouts.find((w) => w.id === schedule.userWorkoutId);
      const workoutName = workout?.workout?.name || 'Unknown Workout';

      // Get all unique days from all criteria
      const allDays = new Set<number>();
      for (const criteria of schedule.criteria) {
        for (const day of criteria.days) {
          allDays.add(day);
        }
      }

      for (const day of allDays) {
        upcoming.push({
          id: schedule.id,
          workoutName,
          dayIndex: day,
          dayName: this.schedulesStore.dayNames()[day],
        });
      }
    }

    // Sort by day of week (today first, then upcoming days)
    return upcoming.sort((a, b) => {
      const dayDiffA = (a.dayIndex - today + 7) % 7;
      const dayDiffB = (b.dayIndex - today + 7) % 7;
      return dayDiffA - dayDiffB;
    });
  });

  readonly calendarEntries = computed((): CalendarEntry[] => {
    const entries: CalendarEntry[] = [];

    // Add log entries (past workouts)
    for (const log of this.logsStore.logs()) {
      const logDate = new Date(log.startedAt);
      let type = 'red';
      if (log.completedAt) {
        type = 'green';
      } else if (this.isStartedToday(log)) {
        type = 'yellow';
      }

      entries.push({
        on: logDate,
        type,
        name: log.name,
      });
    }

    // Add schedule entries (planned workouts for upcoming days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const enrichedWorkouts = this.userWorkoutsStore.enrichedWorkouts();

    // Generate entries for the next 4 weeks
    for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
      for (const schedule of this.schedulesStore.schedules()) {
        const workout = enrichedWorkouts.find((w) => w.id === schedule.userWorkoutId);
        const workoutName = workout?.workout?.name || 'Unknown Workout';

        // Get all unique days from all criteria
        const allDays = new Set<number>();
        for (const criteria of schedule.criteria) {
          for (const day of criteria.days) {
            allDays.add(day);
          }
        }

        for (const dayIndex of allDays) {
          // Calculate the date for this schedule day in the current week
          const scheduleDate = new Date(today);
          const daysUntilDay = (dayIndex - today.getDay() + 7) % 7;
          scheduleDate.setDate(today.getDate() + daysUntilDay + weekOffset * 7);

          entries.push({
            on: scheduleDate,
            type: 'purple',
            name: workoutName,
          });
        }
      }
    }

    return entries;
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

  onDayClick(date: Date): void {
    // Find logs for this date and navigate to the first one if exists
    const dateString = date.toDateString();
    const logs = this.logsStore.logsByDate().get(dateString);
    if (logs && logs.length > 0) {
      this.router.navigate(['/user/workout-logs', logs[0].id]);
    }
  }
}
