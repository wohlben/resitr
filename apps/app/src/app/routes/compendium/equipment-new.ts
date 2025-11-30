import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EquipmentsStore } from '../../features/equipments/equipments.store';
import { EquipmentFormComponent } from '../../components/ui/forms/equipment-form.component';
import { FormErrorSummaryComponent } from '../../components/ui/forms/form-error-summary.component';
import { SpinnerComponent } from '../../components/ui/spinner.component';
import { ButtonComponent } from '../../components/ui/button.component';
import type { CreateEquipmentDto } from '@resitr/api';
import { CanComponentDeactivate, confirmUnsavedChanges } from '../../core/guards';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmationService } from '../../core/services/confirmation.service';

@Component({
  selector: 'app-equipment-new',
  standalone: true,
  imports: [EquipmentFormComponent, FormErrorSummaryComponent, SpinnerComponent, ButtonComponent],
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">New Equipment</h1>
          <p class="text-gray-600 mt-1">Create a new equipment template</p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <app-equipment-form
          [isEditMode]="false"
          (formChange)="onFormChange($event)"
          (validChange)="onValidChange($event)"
        />

        <app-form-error-summary
          class="block mt-4"
          [errors]="store.saveError() ? [store.saveError()!] : []"
        />

        <div class="mt-6 flex gap-3 justify-end">
          <app-button variant="secondary" link="/compendium/equipments">
            Cancel
          </app-button>
          <app-button
            variant="primary"
            (click)="onSubmit()"
            [disabled]="!isFormValid() || store.isSaving()"
          >
            @if (store.isSaving()) {
              <app-spinner size="small" ariaLabel="Creating equipment" />
              Creating...
            } @else {
              Create Equipment
            }
          </app-button>
        </div>
      </div>
    </div>
  `,
})
export class EquipmentNew implements CanComponentDeactivate {
  store = inject(EquipmentsStore);
  private router = inject(Router);
  private toast = inject(ToastService);
  private confirmation = inject(ConfirmationService);

  isFormValid = signal(false);
  formData = signal<Partial<CreateEquipmentDto>>({});
  private hasSubmitted = false;

  onFormChange(data: Partial<CreateEquipmentDto>): void {
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
    const result = await this.store.createEquipment(data as CreateEquipmentDto);
    if (result) {
      this.hasSubmitted = true;
      this.toast.success(`Equipment "${result.displayName}" created successfully`);
      this.router.navigate(['/compendium/equipments', result.templateId]);
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
