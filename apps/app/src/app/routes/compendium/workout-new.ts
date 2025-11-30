import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { WorkoutsStore } from '../../features/workouts/workouts.store';
import { WorkoutFormComponent } from '../../components/ui/forms/workout-form.component';
import { FormErrorSummaryComponent } from '../../components/ui/forms/form-error-summary.component';
import { SpinnerComponent } from '../../components/ui/spinner.component';
import { ButtonComponent } from '../../components/ui/button.component';
import type { CreateWorkoutDto } from '@resitr/api';
import { CanComponentDeactivate, confirmUnsavedChanges } from '../../core/guards';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmationService } from '../../core/services/confirmation.service';

@Component({
  selector: 'app-workout-new',
  standalone: true,
  imports: [WorkoutFormComponent, FormErrorSummaryComponent, SpinnerComponent, ButtonComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">New Workout</h1>
          <p class="text-gray-600 mt-1">Create a new workout template</p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <app-workout-form
          [isEditMode]="false"
          (formChange)="onFormChange($event)"
          (validChange)="onValidChange($event)"
        />

        <app-form-error-summary
          class="block mt-4"
          [errors]="store.saveError() ? [store.saveError()!] : []"
        />

        <div class="mt-6 flex gap-3 justify-end">
          <app-button variant="secondary" link="/compendium/workouts">
            Cancel
          </app-button>
          <app-button
            variant="primary"
            (click)="onSubmit()"
            [disabled]="!isFormValid() || store.isSaving()"
          >
            @if (store.isSaving()) {
              <app-spinner size="small" ariaLabel="Creating workout" />
              Creating...
            } @else {
              Create Workout
            }
          </app-button>
        </div>
      </div>
    </div>
  `,
})
export class WorkoutNew implements CanComponentDeactivate {
  store = inject(WorkoutsStore);
  private router = inject(Router);
  private toast = inject(ToastService);
  private confirmation = inject(ConfirmationService);

  isFormValid = signal(false);
  formData = signal<Partial<CreateWorkoutDto>>({});
  private hasSubmitted = false;

  onFormChange(data: Partial<CreateWorkoutDto>): void {
    this.formData.set(data);
  }

  onValidChange(valid: boolean): void {
    this.isFormValid.set(valid);
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) return;

    const data = this.formData();
    const result = await this.store.createWorkout(data as CreateWorkoutDto);
    if (result) {
      this.hasSubmitted = true;
      this.toast.success(`Workout "${result.name}" created successfully`);
      this.router.navigate(['/compendium/workouts', result.templateId]);
    }
  }

  canDeactivate(): boolean | Promise<boolean> {
    if (this.hasSubmitted) return true;

    const data = this.formData();
    // Check for actual user input (exclude auto-generated templateId and version)
    const hasUserInput =
      (data.name && data.name.trim() !== '') ||
      (data.description && data.description.trim() !== '') ||
      (data.sections && data.sections.length > 0);

    if (!hasUserInput) return true;

    return confirmUnsavedChanges(this.confirmation, {}, data);
  }
}
