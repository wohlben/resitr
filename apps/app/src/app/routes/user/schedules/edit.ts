import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WorkoutScheduleStore } from '../../../features/workout-schedule/workout-schedule.store';
import { UserWorkoutsStore } from '../../../features/user-workouts/user-workouts.store';
import { LoadingComponent } from '../../../components/ui/feedback/loading.component';
import { ErrorLoadingComponent } from '../../../components/ui/feedback/error-loading.component';
import { ButtonComponent } from '../../../components/ui/buttons/button.component';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { ToastService } from '../../../core/services/toast.service';
import type {
  WorkoutScheduleResponseDto,
  CreateWorkoutScheduleCriteriaDto,
  UpdateWorkoutScheduleCriteriaDto,
} from '@resitr/api';

@Component({
  selector: 'app-schedule-detail',
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
          <h1 class="text-3xl font-bold text-gray-900">Schedule Detail</h1>
          <p class="text-gray-600 mt-1">Manage workout schedule and days</p>
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

      <!-- Content -->
      @if (!isLoading() && !error()) {
      <div class="space-y-6">
        <!-- Schedule Info -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Workout</h2>
          <div class="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
            {{ selectedWorkoutName() }}
          </div>
        </div>

        <!-- Criteria List -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Scheduled Days</h2>
            <app-button variant="secondary" (click)="showAddCriteriaForm = true" [disabled]="showAddCriteriaForm">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Days
            </app-button>
          </div>

          <!-- Existing Criteria -->
          @if (schedule()?.criteria?.length === 0) {
          <div class="text-center py-8 text-gray-500">No scheduled days configured</div>
          } @else {
          <div class="space-y-3">
            @for (criteria of schedule()?.criteria; track criteria.id) {
            <div class="border border-gray-200 rounded-lg p-4">
              @if (editingCriteriaId === criteria.id) {
              <!-- Edit Form -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Days</label>
                  <div class="grid grid-cols-7 gap-2">
                    @for (dayName of dayNames; track $index) {
                    <button
                      type="button"
                      class="py-2 px-1 text-xs font-medium rounded border transition-all"
                      [class.bg-blue-600]="editCriteriaDays.includes($index)"
                      [class.text-white]="editCriteriaDays.includes($index)"
                      [class.border-blue-600]="editCriteriaDays.includes($index)"
                      [class.bg-white]="!editCriteriaDays.includes($index)"
                      [class.text-gray-700]="!editCriteriaDays.includes($index)"
                      [class.border-gray-300]="!editCriteriaDays.includes($index)"
                      [class.hover:bg-gray-50]="!editCriteriaDays.includes($index)"
                      (click)="toggleEditDay($index)"
                    >
                      {{ dayName.slice(0, 3) }}
                    </button>
                    }
                  </div>
                </div>

                <div class="flex justify-end gap-2">
                  <button
                    type="button"
                    class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    (click)="cancelEditCriteria()"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    (click)="saveEditCriteria(criteria.id)"
                    [disabled]="editCriteriaDays.length === 0"
                  >
                    Save
                  </button>
                </div>
              </div>
              } @else {
              <!-- Display -->
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ formatDays(criteria.days) }}</div>
                  <div class="text-xs text-gray-500">Priority: {{ criteria.order + 1 }}</div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="p-1 text-gray-400 hover:text-blue-600"
                    (click)="startEditCriteria(criteria)"
                    title="Edit"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="p-1 text-gray-400 hover:text-red-600"
                    (click)="deleteCriteria(criteria.id)"
                    title="Delete"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              }
            </div>
            }
          </div>
          }
        </div>

        <!-- Add Criteria Form -->
        @if (showAddCriteriaForm) {
        <div class="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Add Days</h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Select Days</label>
              <div class="grid grid-cols-7 gap-2">
                @for (dayName of dayNames; track $index) {
                <button
                  type="button"
                  class="py-3 px-2 text-sm font-medium rounded-lg border transition-all"
                  [class.bg-blue-600]="newCriteriaDays.includes($index)"
                  [class.text-white]="newCriteriaDays.includes($index)"
                  [class.border-blue-600]="newCriteriaDays.includes($index)"
                  [class.bg-white]="!newCriteriaDays.includes($index)"
                  [class.text-gray-700]="!newCriteriaDays.includes($index)"
                  [class.border-gray-300]="!newCriteriaDays.includes($index)"
                  [class.hover:bg-gray-50]="!newCriteriaDays.includes($index)"
                  (click)="toggleNewDay($index)"
                >
                  {{ dayName.slice(0, 3) }}
                </button>
                }
              </div>
              @if (newCriteriaDays.length === 0) {
              <p class="mt-1 text-sm text-red-600">Please select at least one day</p>
              }
            </div>

            @if (store.actionError()) {
            <div class="p-4 bg-red-50 text-red-700 text-sm rounded-lg">
              {{ store.actionError() }}
            </div>
            }

            <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <app-button variant="secondary" (click)="cancelAddCriteria()">Cancel</app-button>
              <app-button
                variant="primary"
                (click)="addCriteria()"
                [disabled]="newCriteriaDays.length === 0 || store.isCreating()"
              >
                @if (store.isCreating()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Adding... } @else { Add Days }
              </app-button>
            </div>
          </div>
        </div>
        }

        <!-- Delete Schedule -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
          <p class="text-sm text-gray-600 mb-4">
            Deleting this schedule will remove all associated day configurations.
          </p>
          <app-button variant="danger" (click)="deleteSchedule()">Delete Schedule</app-button>
        </div>
      </div>
      }
    </div>
  `,
})
export class ScheduleDetailComponent {
  readonly store = inject(WorkoutScheduleStore);
  readonly userWorkoutsStore = inject(UserWorkoutsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly confirmation = inject(ConfirmationService);
  private readonly toast = inject(ToastService);

  readonly dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Route params
  private workoutId = signal<string | null>(null);
  private scheduleId = signal<string | null>(null);
  private scheduleData = signal<WorkoutScheduleResponseDto | null>(null);

  // UI state
  showAddCriteriaForm = false;
  newCriteriaDays: number[] = [];
  editingCriteriaId: string | null = null;
  editCriteriaDays: number[] = [];

  constructor() {
    // Read route params
    this.route.params.subscribe((params) => {
      this.workoutId.set(params['workoutId'] || null);
      this.scheduleId.set(params['scheduleId'] || null);
      this.loadSchedule();
    });
  }

  private loadSchedule(): void {
    const scheduleId = this.scheduleId();
    if (!scheduleId) return;

    const existingSchedule = this.store.schedules().find((s) => s.id === scheduleId);
    if (existingSchedule) {
      this.scheduleData.set(existingSchedule);
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

  readonly schedule = computed(() => {
    return this.scheduleData();
  });

  readonly selectedWorkoutName = computed(() => {
    const schedule = this.scheduleData();
    if (!schedule) return 'Unknown Workout';
    const workout = this.userWorkoutsStore.enrichedWorkouts().find((uw) => uw.id === schedule.userWorkoutId);
    return workout?.workout?.name || 'Unknown Workout';
  });

  readonly backLink = computed(() => {
    const workoutId = this.workoutId();
    if (workoutId) {
      return `/user/workouts/${workoutId}/schedules`;
    }
    return '/user/calendar';
  });

  formatDays(days: number[]): string {
    if (days.length === 0) return 'No days';
    const sortedDays = [...days].sort((a, b) => a - b);
    return sortedDays.map((d) => this.dayNames[d]).join(', ');
  }

  toggleNewDay(dayIndex: number): void {
    const index = this.newCriteriaDays.indexOf(dayIndex);
    if (index > -1) {
      this.newCriteriaDays = this.newCriteriaDays.filter((d) => d !== dayIndex);
    } else {
      this.newCriteriaDays = [...this.newCriteriaDays, dayIndex].sort((a, b) => a - b);
    }
  }

  cancelAddCriteria(): void {
    this.showAddCriteriaForm = false;
    this.newCriteriaDays = [];
    this.store.clearActionError();
  }

  async addCriteria(): Promise<void> {
    const scheduleId = this.scheduleId();
    if (!scheduleId || this.newCriteriaDays.length === 0) return;

    const criteriaData: CreateWorkoutScheduleCriteriaDto = {
      type: 'DAY_OF_WEEK',
      days: this.newCriteriaDays,
    };

    const result = await this.store.addCriteria(scheduleId, criteriaData);

    if (result) {
      this.toast.success('Days added successfully');
      this.cancelAddCriteria();
    } else {
      this.toast.error(this.store.actionError() || 'Failed to add days');
    }
  }

  startEditCriteria(criteria: WorkoutScheduleResponseDto['criteria'][0]): void {
    this.editingCriteriaId = criteria.id;
    this.editCriteriaDays = [...criteria.days];
  }

  toggleEditDay(dayIndex: number): void {
    const index = this.editCriteriaDays.indexOf(dayIndex);
    if (index > -1) {
      // Ensure at least one day remains
      if (this.editCriteriaDays.length > 1) {
        this.editCriteriaDays = this.editCriteriaDays.filter((d) => d !== dayIndex);
      }
    } else {
      this.editCriteriaDays = [...this.editCriteriaDays, dayIndex].sort((a, b) => a - b);
    }
  }

  cancelEditCriteria(): void {
    this.editingCriteriaId = null;
    this.editCriteriaDays = [];
    this.store.clearActionError();
  }

  async saveEditCriteria(criteriaId: string): Promise<void> {
    const scheduleId = this.scheduleId();
    if (!scheduleId || this.editCriteriaDays.length === 0) return;

    const criteria = this.scheduleData()?.criteria.find((c) => c.id === criteriaId);
    if (!criteria) return;

    const updateData: UpdateWorkoutScheduleCriteriaDto = {
      type: 'DAY_OF_WEEK',
      days: this.editCriteriaDays,
      order: criteria.order,
    };

    const result = await this.store.updateCriteria(scheduleId, criteriaId, updateData);

    if (result) {
      this.toast.success('Days updated successfully');
      this.cancelEditCriteria();
    } else {
      this.toast.error(this.store.actionError() || 'Failed to update days');
    }
  }

  async deleteCriteria(criteriaId: string): Promise<void> {
    const confirmed = await this.confirmation.confirm({
      title: 'Delete Days',
      message: 'Are you sure you want to remove these scheduled days?',
      confirmText: 'Delete',
      isDestructive: true,
    });

    if (!confirmed) return;

    const scheduleId = this.scheduleId();
    if (!scheduleId) return;

    const success = await this.store.deleteCriteria(scheduleId, criteriaId);

    if (success) {
      this.toast.success('Days removed successfully');
    } else {
      this.toast.error(this.store.actionError() || 'Failed to remove days');
    }
  }

  async deleteSchedule(): Promise<void> {
    const confirmed = await this.confirmation.confirm({
      title: 'Delete Schedule',
      message: 'Are you sure you want to delete this entire schedule? This cannot be undone.',
      confirmText: 'Delete',
      isDestructive: true,
    });

    if (!confirmed) return;

    const scheduleId = this.scheduleId();
    if (!scheduleId) return;

    const success = await this.store.deleteSchedule(scheduleId);

    if (success) {
      this.toast.success('Schedule deleted successfully');
      this.router.navigate([this.backLink()]);
    } else {
      this.toast.error(this.store.actionError() || 'Failed to delete schedule');
    }
  }
}
