import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WorkoutScheduleStore } from '../../../features/workout-schedule/workout-schedule.store';
import { UserWorkoutsStore } from '../../../features/user-workouts/user-workouts.store';
import { LoadingComponent } from '../../../components/ui/feedback/loading.component';
import { ErrorLoadingComponent } from '../../../components/ui/feedback/error-loading.component';
import { ButtonComponent } from '../../../components/ui/buttons/button.component';
import { ToastService } from '../../../core/services/toast.service';
import type { CreateUserWorkoutScheduleDto } from '@resitr/api';

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
            @if (isWorkoutLocked()) {
            <!-- Read-only workout display when accessed from workout-specific route -->
            <div class="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
              {{ selectedWorkoutName() }}
            </div>
            <input type="hidden" [(ngModel)]="formData.workoutTemplateId" name="workoutTemplateId" />
            } @else {
            <!-- Editable dropdown when accessed from general route -->
            <select
              [(ngModel)]="formData.workoutTemplateId"
              name="workoutTemplateId"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a workout...</option>
              @for (workout of userWorkoutsStore.enrichedWorkouts(); track workout.id) {
              <option [value]="workout.workoutTemplateId">
                {{ workout.workout?.name || 'Unknown Workout' }}
              </option>
              }
            </select>
            } @if (formErrors.workoutTemplateId) {
            <p class="mt-1 text-sm text-red-600">{{ formErrors.workoutTemplateId }}</p>
            }
          </div>

          <!-- Day of Week -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Day of Week <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-7 gap-2">
              @for (dayName of dayNames; track $index) {
              <button
                type="button"
                class="py-3 px-2 text-sm font-medium rounded-lg border transition-all"
                [class.bg-blue-600]="formData.dayOfWeek === $index"
                [class.text-white]="formData.dayOfWeek === $index"
                [class.border-blue-600]="formData.dayOfWeek === $index"
                [class.bg-white]="formData.dayOfWeek !== $index"
                [class.text-gray-700]="formData.dayOfWeek !== $index"
                [class.border-gray-300]="formData.dayOfWeek !== $index"
                [class.hover:bg-gray-50]="formData.dayOfWeek !== $index"
                (click)="formData.dayOfWeek = $index"
              >
                {{ dayName.slice(0, 3) }}
              </button>
              }
            </div>
            @if (formErrors.dayOfWeek) {
            <p class="mt-1 text-sm text-red-600">{{ formErrors.dayOfWeek }}</p>
            }
          </div>

          <!-- Order -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> Order </label>
            <input
              type="number"
              [(ngModel)]="formData.order"
              name="order"
              min="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p class="mt-1 text-sm text-gray-500">
              Order for multiple workouts on the same day (0 = first, 1 = second, etc.)
            </p>
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

  formData: CreateUserWorkoutScheduleDto = {
    workoutTemplateId: '',
    dayOfWeek: new Date().getDay(),
    order: 0,
  };

  formErrors: { workoutTemplateId?: string; dayOfWeek?: string } = {};

  // Determine if we're on a workout-specific route by checking for :id param
  readonly isWorkoutLocked = signal(false);

  constructor() {
    // Check route params to determine if we're in workout-specific mode
    this.route.params.subscribe((params) => {
      const routeWorkoutId = params['id'];
      if (routeWorkoutId) {
        // We're on /user/workouts/:id/schedules/new - workout is locked
        this.isWorkoutLocked.set(true);
      }
    });

    // Handle query params for pre-selection
    this.route.queryParams.subscribe((params) => {
      const workoutTemplateId = params['workoutTemplateId'];
      if (workoutTemplateId && this.isWorkoutLocked()) {
        this.formData.workoutTemplateId = workoutTemplateId;
      }
      const dayOfWeek = params['dayOfWeek'];
      if (dayOfWeek !== undefined) {
        const day = parseInt(dayOfWeek, 10);
        if (day >= 0 && day <= 6) {
          this.formData.dayOfWeek = day;
        }
      }
    });
  }

  // Get the workout from store when in workout-specific mode
  readonly selectedWorkout = computed(() => {
    if (!this.isWorkoutLocked()) return null;

    // Get workout ID from current route
    let workoutId: string | undefined;
    this.route.params
      .subscribe((params) => {
        workoutId = params['id'];
      })
      .unsubscribe();

    if (!workoutId) return null;

    return this.userWorkoutsStore.enrichedWorkouts().find((uw) => uw.id === workoutId);
  });

  readonly selectedWorkoutName = computed(() => {
    return this.selectedWorkout()?.workout?.name || 'Loading...';
  });

  readonly backLink = computed(() => {
    if (this.isWorkoutLocked()) {
      // Get workout ID from current route
      let workoutId: string | undefined;
      this.route.params
        .subscribe((params) => {
          workoutId = params['id'];
        })
        .unsubscribe();

      if (workoutId) {
        return `/user/workouts/${workoutId}/schedules`;
      }
    }
    return '/user/schedules';
  });

  isFormValid(): boolean {
    const dayOfWeek = this.formData.dayOfWeek ?? -1;
    return !!this.formData.workoutTemplateId && dayOfWeek >= 0 && dayOfWeek <= 6;
  }

  validateForm(): boolean {
    this.formErrors = {};

    if (!this.formData.workoutTemplateId) {
      this.formErrors.workoutTemplateId = 'Please select a workout';
    }

    const dayOfWeek = this.formData.dayOfWeek ?? -1;
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      this.formErrors.dayOfWeek = 'Please select a day of the week';
    }

    return Object.keys(this.formErrors).length === 0;
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    const schedule = await this.store.createSchedule(this.formData);

    if (schedule) {
      this.toast.success('Workout scheduled successfully');
      this.router.navigate([this.backLink()]);
    }
  }
}
