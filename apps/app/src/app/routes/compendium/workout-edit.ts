import { Component, inject, signal, OnInit, computed, effect } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WorkoutsStore } from '../../features/workouts/workouts.store';
import { WorkoutFormComponent } from '../../components/ui/forms/workout-form.component';
import { FormErrorSummaryComponent } from '../../components/ui/forms/form-error-summary.component';
import { ConfirmDeleteDialogComponent } from '../../components/ui/forms/confirm-delete-dialog.component';
import { LoadingComponent } from '../../components/ui/loading.component';
import { ErrorLoadingComponent } from '../../components/ui/error-loading.component';
import { SpinnerComponent } from '../../components/ui/spinner.component';
import { ButtonComponent } from '../../components/ui/button.component';
import type { UpdateWorkoutDto, WorkoutResponseDto } from '@resitr/api';
import { CanComponentDeactivate, confirmUnsavedChanges, hasFormChanges } from '../../core/guards';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmationService } from '../../core/services/confirmation.service';

@Component({
  selector: 'app-workout-edit',
  standalone: true,
  imports: [
    WorkoutFormComponent,
    FormErrorSummaryComponent,
    ConfirmDeleteDialogComponent,
    LoadingComponent,
    ErrorLoadingComponent,
    SpinnerComponent,
    ButtonComponent,
  ],
  template: `
    @if (store.isLoading()) {
      <app-loading message="Loading workout..." />
    } @else if (store.error()) {
      <app-error-loading title="Error loading workout" [message]="store.error()!" />
    } @else if (workoutData()) {
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Edit Workout</h1>
            <p class="text-gray-600 mt-1">{{ workoutData()!.name }}</p>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <app-workout-form
            [initialValue]="workoutData()!"
            [isEditMode]="true"
            (formChange)="onFormChange($event)"
            (validChange)="onValidChange($event)"
          />

          <app-form-error-summary
            class="block mt-4"
            [errors]="store.saveError() ? [store.saveError()!] : []"
          />

          <div class="mt-6 flex gap-3 justify-between">
            <app-button variant="danger-outline" (click)="showDeleteDialog.set(true)">
              Delete Workout
            </app-button>

            <div class="flex gap-3">
              <app-button variant="secondary" [link]="['/compendium/workouts', workoutId]">
                Cancel
              </app-button>
              <app-button
                variant="primary"
                (click)="onSubmit()"
                [disabled]="!isFormValid() || store.isSaving()"
              >
                @if (store.isSaving()) {
                  <app-spinner size="small" ariaLabel="Saving workout" />
                  Saving...
                } @else {
                  Save Changes
                }
              </app-button>
            </div>
          </div>
        </div>
      </div>

      <app-confirm-delete-dialog
        [show]="showDeleteDialog()"
        [itemName]="workoutData()!.name"
        [isDeleting]="store.isDeleting()"
        (deleteConfirmed)="onDelete()"
        (deleteCancelled)="showDeleteDialog.set(false)"
      />
    }
  `,
})
export class WorkoutEdit implements OnInit, CanComponentDeactivate {
  store = inject(WorkoutsStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private confirmation = inject(ConfirmationService);

  workoutId = '';
  isFormValid = signal(false);
  formData = signal<Partial<UpdateWorkoutDto>>({});
  showDeleteDialog = signal(false);
  private hasSubmitted = false;
  private initialData: Partial<UpdateWorkoutDto> = {};

  workoutData = computed<WorkoutResponseDto | null>(() => {
    const workout = this.store.currentWorkout();
    if (!workout) return null;
    return { ...workout };
  });

  constructor() {
    effect(() => {
      const workout = this.store.currentWorkout();
      if (workout && Object.keys(this.initialData).length === 0) {
        this.initialData = structuredClone(workout);
      }
    });
  }

  ngOnInit(): void {
    this.workoutId = this.route.snapshot.paramMap.get('id') as string;
    this.store.loadWorkout(this.workoutId);
  }

  onFormChange(data: Partial<UpdateWorkoutDto>): void {
    this.formData.set(data);
  }

  onValidChange(valid: boolean): void {
    this.isFormValid.set(valid);
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) return;

    const data = this.formData();
    const result = await this.store.updateWorkout(
      this.workoutId,
      data as UpdateWorkoutDto
    );
    if (result) {
      this.hasSubmitted = true;
      this.toast.success(`Workout "${result.name}" updated successfully`);
      this.router.navigate(['/compendium/workouts', result.templateId]);
    }
  }

  async onDelete(): Promise<void> {
    const workoutName = this.workoutData()?.name || 'Workout';
    const success = await this.store.deleteWorkout(this.workoutId);
    if (success) {
      this.hasSubmitted = true;
      this.toast.success(`${workoutName} deleted successfully`);
      this.router.navigate(['/compendium/workouts']);
    } else {
      this.showDeleteDialog.set(false);
      this.toast.error(`Failed to delete ${workoutName}. Please try again.`);
    }
  }

  canDeactivate(): boolean | Promise<boolean> {
    if (this.hasSubmitted) return true;

    const current = this.formData();
    if (!hasFormChanges(this.initialData, current)) return true;

    return confirmUnsavedChanges(this.confirmation, this.initialData, current);
  }
}
