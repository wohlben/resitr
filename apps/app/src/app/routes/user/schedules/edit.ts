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
import type { UpdateUserWorkoutScheduleDto, UserWorkoutScheduleResponseDto } from '@resitr/api';

@Component({
  selector: 'app-edit-workout-schedule',
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
          <h1 class="text-3xl font-bold text-gray-900">Edit Workout Schedule</h1>
          <p class="text-gray-600 mt-1">Update your workout schedule</p>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
      <app-loading [message]="loadingMessage()" />
      }

      <!-- Error State -->
      @if (error()) {
      <app-error-loading title="Error loading schedule" [message]="error()!" />
      }

      <!-- Form -->
      @if (!isLoading() && !error()) {
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form (submit)="onSubmit($event)" class="space-y-6">
          <!-- Workout Selection (Read-only) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> Workout </label>
            <div class="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
              {{ selectedWorkoutName() }}
            </div>
            <p class="mt-1 text-sm text-gray-500">
              Workout cannot be changed. Delete and recreate to use a different workout.
            </p>
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
            <app-button variant="primary" type="submit" [disabled]="store.isUpdating() || !isFormValid()">
              @if (store.isUpdating()) {
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Updating... } @else { Update Schedule }
            </app-button>
          </div>
        </form>
      </div>
      }
    </div>
  `,
})
export class EditWorkoutScheduleComponent {
  readonly store = inject(WorkoutScheduleStore);
  readonly userWorkoutsStore = inject(UserWorkoutsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  readonly dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Route params
  private workoutId = signal<string | null>(null);
  private scheduleId = signal<string | null>(null);
  private schedule = signal<UserWorkoutScheduleResponseDto | null>(null);

  formData: UpdateUserWorkoutScheduleDto = {
    dayOfWeek: 0,
    order: 0,
  };

  formErrors: { dayOfWeek?: string } = {};

  constructor() {
    // Read route params
    this.route.params.subscribe((params) => {
      this.workoutId.set(params['id'] || null);
      this.scheduleId.set(params['scheduleId'] || null);
      this.loadSchedule();
    });

    // Also check query params for pre-selection
    this.route.queryParams.subscribe((params) => {
      const dayOfWeek = params['dayOfWeek'];
      if (dayOfWeek !== undefined) {
        const day = parseInt(dayOfWeek, 10);
        if (day >= 0 && day <= 6) {
          this.formData.dayOfWeek = day;
        }
      }
    });
  }

  private loadSchedule(): void {
    const scheduleId = this.scheduleId();
    if (!scheduleId) return;

    const existingSchedule = this.store.schedules().find((s) => s.id === scheduleId);
    if (existingSchedule) {
      this.schedule.set(existingSchedule);
      this.formData = {
        dayOfWeek: existingSchedule.dayOfWeek,
        order: existingSchedule.order,
      };
    }
  }

  readonly isLoading = computed(() => {
    return this.store.isLoading() || this.userWorkoutsStore.isLoading();
  });

  readonly loadingMessage = computed(() => {
    if (this.store.isLoading()) return 'Loading schedule...';
    if (this.userWorkoutsStore.isLoading()) return 'Loading workouts...';
    return 'Loading...';
  });

  readonly error = computed(() => {
    return this.store.error() || this.userWorkoutsStore.error();
  });

  readonly selectedWorkout = computed(() => {
    const schedule = this.schedule();
    if (!schedule) return null;
    return this.userWorkoutsStore.enrichedWorkouts().find((uw) => uw.workoutTemplateId === schedule.workoutTemplateId);
  });

  readonly selectedWorkoutName = computed(() => {
    return this.selectedWorkout()?.workout?.name || 'Unknown Workout';
  });

  readonly backLink = computed(() => {
    const workoutId = this.workoutId();
    if (workoutId) {
      return `/user/workouts/${workoutId}/schedules`;
    }
    return '/user/schedules';
  });

  isFormValid(): boolean {
    const dayOfWeek = this.formData.dayOfWeek ?? -1;
    return dayOfWeek >= 0 && dayOfWeek <= 6;
  }

  validateForm(): boolean {
    this.formErrors = {};

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

    const scheduleId = this.scheduleId();
    if (!scheduleId) {
      this.toast.error('Schedule ID not found');
      return;
    }

    const updated = await this.store.updateSchedule(scheduleId, this.formData);

    if (updated) {
      this.toast.success('Schedule updated successfully');
      this.router.navigate([this.backLink()]);
    } else {
      this.toast.error(this.store.actionError() || 'Failed to update schedule');
    }
  }
}
