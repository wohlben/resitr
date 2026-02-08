import { Component, computed, effect, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WorkoutScheduleStore } from '../../../features/workout-schedule/workout-schedule.store';
import { UserWorkoutsStore } from '../../../features/user-workouts/user-workouts.store';
import { LoadingComponent } from '../../../components/ui/feedback/loading.component';
import { ErrorLoadingComponent } from '../../../components/ui/feedback/error-loading.component';
import { ButtonComponent } from '../../../components/ui/buttons/button.component';
import { ToastService } from '../../../core/services/toast.service';
import type { CreateWorkoutScheduleDto, CreateWorkoutScheduleCriteriaDto } from '@resitr/api';
import type { EnrichedUserWorkout } from '../../../features/user-workouts/user-workouts.store';

@Component({
  selector: 'app-create-workout-schedule',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingComponent, ErrorLoadingComponent, ButtonComponent],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-4">
          <app-button variant="secondary" [link]="backLink()">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Schedules
          </app-button>
        </div>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Schedule Workout</h1>
          <p class="text-gray-600 mt-1">Add a workout to your weekly routine</p>
        </div>
      </div>

      <!-- Loading State -->
      @if (userWorkoutsStore.isLoading()) {
      <app-loading message="Loading your workouts..." />
      }

      <!-- Error State -->
      @if (userWorkoutsStore.error()) {
      <app-error-loading title="Error loading workouts" [message]="userWorkoutsStore.error()!" />
      }

      <!-- Form -->
      @if (!userWorkoutsStore.isLoading() && !userWorkoutsStore.error()) {
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form (submit)="onSubmit($event)" class="space-y-6">
          <!-- Workout Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Workout <span class="text-red-500">*</span>
            </label>
            @if (workout(); as w) {
            <!-- Read-only workout display when workout is passed in -->
            <div class="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
              {{ w.workout?.name || 'Unknown Workout' }}
            </div>
            <input type="hidden" [(ngModel)]="scheduleData.userWorkoutId" name="userWorkoutId" />
            } @else {
            <!-- Editable dropdown when no workout provided -->
            <select
              [(ngModel)]="scheduleData.userWorkoutId"
              name="userWorkoutId"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a workout...</option>
              @for (userWorkout of userWorkoutsStore.enrichedWorkouts(); track userWorkout.id) {
              <option [value]="userWorkout.id">
                {{ userWorkout.workout?.name || 'Unknown Workout' }}
              </option>
              }
            </select>
            } @if (formErrors.userWorkoutId) {
            <p class="mt-1 text-sm text-red-600">{{ formErrors.userWorkoutId }}</p>
            }
          </div>

          <!-- Criteria Type (Radio Card) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Schedule Type</label>
            <div class="border border-blue-200 bg-blue-50 rounded-lg p-4">
              <div class="flex items-center gap-3">
                <input
                  type="radio"
                  id="criteria-day-of-week"
                  [(ngModel)]="criteriaData.type"
                  name="criteriaType"
                  value="DAY_OF_WEEK"
                  disabled
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label for="criteria-day-of-week" class="text-sm font-medium text-gray-900 cursor-pointer">
                  Day of Week
                </label>
              </div>
              <p class="text-xs text-gray-500 mt-2 ml-7">Schedule workout on specific days of the week</p>
            </div>
          </div>

          <!-- Day of Week (Multi-select) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Days of Week <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-7 gap-2">
              @for (dayName of dayNames; track $index) {
              <button
                type="button"
                class="py-3 px-2 text-sm font-medium rounded-lg border transition-all"
                [class.bg-blue-600]="isDaySelected($index)"
                [class.text-white]="isDaySelected($index)"
                [class.border-blue-600]="isDaySelected($index)"
                [class.bg-white]="!isDaySelected($index)"
                [class.text-gray-700]="!isDaySelected($index)"
                [class.border-gray-300]="!isDaySelected($index)"
                [class.hover:bg-gray-50]="!isDaySelected($index)"
                (click)="toggleDay($index)"
              >
                {{ dayName.slice(0, 3) }}
              </button>
              }
            </div>
            @if (formErrors.days) {
            <p class="mt-1 text-sm text-red-600">{{ formErrors.days }}</p>
            }
            <p class="mt-1 text-sm text-gray-500">Select one or more days</p>
          </div>

          <!-- Error Message -->
          @if (store.actionError()) {
          <div class="p-4 bg-red-50 text-red-700 text-sm rounded-lg">
            {{ store.actionError() }}
          </div>
          }

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <app-button variant="secondary" [link]="backLink()"> Cancel </app-button>
            <app-button variant="primary" type="submit" [disabled]="store.isCreating() || !isFormValid()">
              @if (store.isCreating()) {
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Scheduling... } @else { Schedule Workout }
            </app-button>
          </div>
        </form>
      </div>
      }
    </div>
  `,
})
export class CreateWorkoutScheduleComponent {
  readonly store = inject(WorkoutScheduleStore);
  readonly userWorkoutsStore = inject(UserWorkoutsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  readonly dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Optional workout input - when provided, workout is locked
  workout = input<EnrichedUserWorkout | null>(null);

  scheduleData: CreateWorkoutScheduleDto = {
    userWorkoutId: '',
  };

  criteriaData: CreateWorkoutScheduleCriteriaDto = {
    type: 'DAY_OF_WEEK',
    days: [new Date().getDay()],
  };

  formErrors: { userWorkoutId?: string; days?: string } = {};

  constructor() {
    // React when workout input changes and update form
    effect(() => {
      const w = this.workout();
      if (w) {
        this.scheduleData.userWorkoutId = w.id;
      }
    });

    // Handle query params for pre-selection (day of week)
    this.route.queryParams.subscribe((params) => {
      const dayOfWeek = params['dayOfWeek'];
      if (dayOfWeek !== undefined) {
        const day = parseInt(dayOfWeek, 10);
        if (day >= 0 && day <= 6) {
          this.criteriaData.days = [day];
        }
      }
    });
  }

  readonly backLink = computed(() => {
    const w = this.workout();
    if (w) {
      return `/user/workouts/${w.id}/schedules`;
    }
    return '/user/calendar';
  });

  isDaySelected(dayIndex: number): boolean {
    return this.criteriaData.days.includes(dayIndex);
  }

  toggleDay(dayIndex: number): void {
    const index = this.criteriaData.days.indexOf(dayIndex);
    if (index > -1) {
      // Remove if already selected (but ensure at least one day remains)
      if (this.criteriaData.days.length > 1) {
        this.criteriaData.days = this.criteriaData.days.filter((d) => d !== dayIndex);
      }
    } else {
      // Add if not selected
      this.criteriaData.days = [...this.criteriaData.days, dayIndex].sort((a, b) => a - b);
    }
  }

  isFormValid(): boolean {
    return !!this.scheduleData.userWorkoutId && this.criteriaData.days.length > 0;
  }

  validateForm(): boolean {
    this.formErrors = {};

    if (!this.scheduleData.userWorkoutId) {
      this.formErrors.userWorkoutId = 'Please select a workout';
    }

    if (this.criteriaData.days.length === 0) {
      this.formErrors.days = 'Please select at least one day of the week';
    }

    return Object.keys(this.formErrors).length === 0;
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    const schedule = await this.store.createSchedule(this.scheduleData, this.criteriaData);

    if (schedule) {
      this.toast.success('Workout scheduled successfully');
      this.router.navigate([this.backLink()]);
    }
  }
}
