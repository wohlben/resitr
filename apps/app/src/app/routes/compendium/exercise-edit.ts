import { Component, inject, signal, OnInit, computed, effect } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ExercisesStore } from '../../features/exercises/exercises.store';
import { ExerciseFormComponent } from '../../components/ui/forms/exercise-form.component';
import { FormErrorSummaryComponent } from '../../components/ui/forms/form-error-summary.component';
import { ConfirmDeleteDialogComponent } from '../../components/ui/forms/confirm-delete-dialog.component';
import { LoadingComponent } from '../../components/ui/loading.component';
import { ErrorLoadingComponent } from '../../components/ui/error-loading.component';
import { SpinnerComponent } from '../../components/ui/spinner.component';
import { ButtonComponent } from '../../components/ui/button.component';
import type { UpdateExerciseDto, ExerciseResponseDto } from '@resitr/api';
import { CanComponentDeactivate, confirmUnsavedChanges } from '../../core/guards';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmationService } from '../../core/services/confirmation.service';

@Component({
  selector: 'app-exercise-edit',
  standalone: true,
  imports: [
    ExerciseFormComponent,
    FormErrorSummaryComponent,
    ConfirmDeleteDialogComponent,
    LoadingComponent,
    ErrorLoadingComponent,
    SpinnerComponent,
    ButtonComponent,
  ],
  template: `
    @if (store.isLoading()) {
      <app-loading message="Loading exercise..." />
    } @else if (store.error()) {
      <app-error-loading title="Error loading exercise" [message]="store.error()!" />
    } @else if (exerciseData()) {
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Edit Exercise</h1>
            <p class="text-gray-600 mt-1">{{ exerciseData()!.name }}</p>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <app-exercise-form
            [initialValue]="exerciseData()!"
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
              Delete Exercise
            </app-button>

            <div class="flex gap-3">
              <app-button variant="secondary" [link]="['/compendium/exercises', exerciseId]">
                Cancel
              </app-button>
              <app-button
                variant="primary"
                (click)="onSubmit()"
                [disabled]="!isFormValid() || store.isSaving()"
              >
                @if (store.isSaving()) {
                  <app-spinner size="small" ariaLabel="Saving exercise" />
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
        [itemName]="exerciseData()!.name"
        [isDeleting]="store.isDeleting()"
        (deleteConfirmed)="onDelete()"
        (deleteCancelled)="showDeleteDialog.set(false)"
      />
    }
  `,
})
export class ExerciseEdit implements OnInit, CanComponentDeactivate {
  store = inject(ExercisesStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private confirmation = inject(ConfirmationService);

  exerciseId = '';
  isFormValid = signal(false);
  formData = signal<Partial<UpdateExerciseDto>>({});
  showDeleteDialog = signal(false);
  private hasSubmitted = false;
  private initialData: Partial<UpdateExerciseDto> = {};

  exerciseData = computed<ExerciseResponseDto | null>(() => {
    const exercise = this.store.currentExercise();
    if (!exercise) return null;
    return { ...exercise };
  });

  constructor() {
    effect(() => {
      const exercise = this.store.currentExercise();
      if (exercise && Object.keys(this.initialData).length === 0) {
        this.initialData = structuredClone(exercise);
      }
    });
  }

  ngOnInit(): void {
    this.exerciseId = this.route.snapshot.paramMap.get('id') as string;
    this.store.loadExercise(this.exerciseId);
  }

  onFormChange(data: Partial<UpdateExerciseDto>): void {
    this.formData.set(data);
  }

  onValidChange(valid: boolean): void {
    this.isFormValid.set(valid);
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) return;

    const data = this.formData();
    const result = await this.store.updateExercise(
      this.exerciseId,
      data as UpdateExerciseDto
    );
    if (result) {
      this.hasSubmitted = true;
      this.toast.success(`Exercise "${result.name}" updated successfully`);
      this.router.navigate(['/compendium/exercises', result.templateId]);
    }
  }

  async onDelete(): Promise<void> {
    const exerciseName = this.exerciseData()?.name || 'Exercise';
    const success = await this.store.deleteExercise(this.exerciseId);
    if (success) {
      this.hasSubmitted = true;
      this.toast.success(`${exerciseName} deleted successfully`);
      this.router.navigate(['/compendium/exercises']);
    } else {
      this.showDeleteDialog.set(false);
      this.toast.error(`Failed to delete ${exerciseName}. Please try again.`);
    }
  }

  canDeactivate(): boolean | Promise<boolean> {
    if (this.hasSubmitted) return true;

    const current = this.formData();
    const hasChanges = JSON.stringify(current) !== JSON.stringify(this.initialData);

    if (!hasChanges) return true;

    return confirmUnsavedChanges(this.confirmation, this.initialData, current);
  }
}
