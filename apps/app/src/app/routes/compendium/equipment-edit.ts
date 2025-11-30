import { Component, inject, signal, OnInit, computed, effect } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EquipmentsStore } from '../../features/equipments/equipments.store';
import { EquipmentFormComponent } from '../../components/ui/forms/equipment-form.component';
import { FormErrorSummaryComponent } from '../../components/ui/forms/form-error-summary.component';
import { ConfirmDeleteDialogComponent } from '../../components/ui/forms/confirm-delete-dialog.component';
import { LoadingComponent } from '../../components/ui/loading.component';
import { ErrorLoadingComponent } from '../../components/ui/error-loading.component';
import { SpinnerComponent } from '../../components/ui/spinner.component';
import { ButtonComponent } from '../../components/ui/button.component';
import type { UpdateEquipmentDto, EquipmentResponseDto } from '@resitr/api';
import { CanComponentDeactivate, confirmUnsavedChanges } from '../../core/guards';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmationService } from '../../core/services/confirmation.service';

@Component({
  selector: 'app-equipment-edit',
  standalone: true,
  imports: [
    EquipmentFormComponent,
    FormErrorSummaryComponent,
    ConfirmDeleteDialogComponent,
    LoadingComponent,
    ErrorLoadingComponent,
    SpinnerComponent,
    ButtonComponent,
  ],
  template: `
    @if (store.isLoading()) {
      <app-loading message="Loading equipment..." />
    } @else if (store.error()) {
      <app-error-loading
        title="Error loading equipment"
        [message]="store.error()!"
      />
    } @else if (equipmentData()) {
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Edit Equipment</h1>
            <p class="text-gray-600 mt-1">{{ equipmentData()!.displayName }}</p>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <app-equipment-form
            [initialValue]="equipmentData()!"
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
              Delete Equipment
            </app-button>

            <div class="flex gap-3">
              <app-button variant="secondary" [link]="['/compendium/equipments', equipmentId]">
                Cancel
              </app-button>
              <app-button
                variant="primary"
                (click)="onSubmit()"
                [disabled]="!isFormValid() || store.isSaving()"
              >
                @if (store.isSaving()) {
                  <app-spinner size="small" ariaLabel="Saving equipment" />
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
        [itemName]="equipmentData()!.displayName"
        [isDeleting]="store.isDeleting()"
        (deleteConfirmed)="onDelete()"
        (deleteCancelled)="showDeleteDialog.set(false)"
      />
    }
  `,
})
export class EquipmentEdit implements OnInit, CanComponentDeactivate {
  store = inject(EquipmentsStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private confirmation = inject(ConfirmationService);

  equipmentId = '';
  isFormValid = signal(false);
  formData = signal<Partial<UpdateEquipmentDto>>({});
  showDeleteDialog = signal(false);
  private hasSubmitted = false;
  private initialData: Partial<UpdateEquipmentDto> = {};

  equipmentData = computed<EquipmentResponseDto | null>(() => {
    const equipment = this.store.currentEquipment();
    if (!equipment) return null;
    return { ...equipment };
  });

  constructor() {
    effect(() => {
      const equipment = this.store.currentEquipment();
      if (equipment && Object.keys(this.initialData).length === 0) {
        this.initialData = structuredClone(equipment);
      }
    });
  }

  ngOnInit(): void {
    this.equipmentId = this.route.snapshot.paramMap.get('id') as string;
    this.store.loadEquipment(this.equipmentId);
  }

  onFormChange(data: Partial<UpdateEquipmentDto>): void {
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
    const result = await this.store.updateEquipment(
      this.equipmentId,
      data as UpdateEquipmentDto
    );
    if (result) {
      this.hasSubmitted = true;
      this.toast.success(`Equipment "${result.displayName}" updated successfully`);
      await this.router.navigate(['/compendium/equipments', result.templateId]);
    }
  }

  async onDelete(): Promise<void> {
    const equipmentName = this.equipmentData()?.displayName || 'Equipment';
    const success = await this.store.deleteEquipment(this.equipmentId);
    if (success) {
      this.hasSubmitted = true;
      this.toast.success(`${equipmentName} deleted successfully`);
      await this.router.navigate(['/compendium/equipments']);
    } else {
      this.showDeleteDialog.set(false);
      this.toast.error(`Failed to delete ${equipmentName}. Please try again.`);
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
