import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ExerciseGroupsStore } from '../../features/exercise-groups/exercise-groups.store';
import { ExerciseGroupFormComponent } from '../../components/ui/forms/exercise-group-form.component';
import { FormErrorSummaryComponent } from '../../components/ui/forms/form-error-summary.component';
import { SpinnerComponent } from '../../components/ui/feedback/spinner.component';
import { ButtonComponent } from '../../components/ui/buttons/button.component';
import type { CreateExerciseGroupDto } from '@resitr/api';
import { CanComponentDeactivate, confirmUnsavedChanges } from '../../core/guards';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmationService } from '../../core/services/confirmation.service';

@Component({
  selector: 'app-exercise-group-new',
  standalone: true,
  imports: [ExerciseGroupFormComponent, FormErrorSummaryComponent, SpinnerComponent, ButtonComponent],
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">New Exercise Group</h1>
          <p class="text-gray-600 mt-1">Create a new exercise group template</p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <app-exercise-group-form
          [isEditMode]="false"
          (formChange)="onFormChange($event)"
          (validChange)="onValidChange($event)"
        />

        <app-form-error-summary
          class="block mt-4"
          [errors]="store.saveError() ? [store.saveError()!] : []"
        />

        <div class="mt-6 flex gap-3 justify-end">
          <app-button variant="secondary" link="/compendium/exercise-groups">
            Cancel
          </app-button>
          <app-button
            variant="primary"
            (click)="onSubmit()"
            [disabled]="!isFormValid() || store.isSaving()"
          >
            @if (store.isSaving()) {
              <app-spinner size="small" ariaLabel="Creating exercise group" />
              Creating...
            } @else {
              Create Group
            }
          </app-button>
        </div>
      </div>
    </div>
  `,
})
export class ExerciseGroupNew implements CanComponentDeactivate {
  store = inject(ExerciseGroupsStore);
  private router = inject(Router);
  private toast = inject(ToastService);
  private confirmation = inject(ConfirmationService);

  isFormValid = signal(false);
  formData = signal<Partial<CreateExerciseGroupDto>>({});
  private hasSubmitted = false;

  onFormChange(data: Partial<CreateExerciseGroupDto>): void {
    this.formData.set(data);
  }

  onValidChange(valid: boolean): void {
    this.isFormValid.set(valid);
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) {
      return;
    }

    const data = this.formData();
    const result = await this.store.createExerciseGroup(data as CreateExerciseGroupDto);
    if (result) {
      this.hasSubmitted = true;
      this.toast.success(`Exercise group "${result.name}" created successfully`);
      this.router.navigate(['/compendium/exercise-groups', result.id]);
    }
  }

  canDeactivate(): boolean | Promise<boolean> {
    if (this.hasSubmitted) return true;

    const data = this.formData();
    const hasData = Object.values(data).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== '' && value !== null && value !== undefined;
    });

    if (!hasData) return true;

    return confirmUnsavedChanges(this.confirmation, {}, data);
  }
}
