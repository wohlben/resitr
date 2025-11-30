import { Component, input, output, effect, inject, untracked, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { EquipmentResponseDto, EquipmentTemplate } from '@resitr/api';
import { EquipmentCategoryLabels } from '@resitr/api';
import { TextInputComponent } from '../inputs/text-input.component';
import { TextareaInputComponent } from '../inputs/textarea-input.component';
import { DropdownComponent, DropdownOption } from '../inputs/dropdown.component';
import { ComboboxComponent, ComboboxOption } from '../inputs/combobox.component';
import { FormErrorSummaryComponent } from './form-error-summary.component';

@Component({
  selector: 'app-equipment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextInputComponent,
    TextareaInputComponent,
    DropdownComponent,
    ComboboxComponent,
    FormErrorSummaryComponent,
  ],
  template: `
    <form [formGroup]="form" class="space-y-6">
      <app-text-input
        formControlName="name"
        [label]="'Name'"
        [placeholder]="'e.g., Barbell Bench Press'"
        [required]="true"
        [error]="getFieldError('name')"
      />

      <app-text-input
        formControlName="displayName"
        [label]="'Display Name'"
        [placeholder]="'e.g., Barbell'"
        [required]="true"
        [error]="getFieldError('displayName')"
      />

      <app-dropdown
        formControlName="category"
        [label]="'Category'"
        [options]="categoryOptions"
        [placeholder]="'Select category (optional)'"
      />

      <app-text-input
        formControlName="imageUrl"
        [label]="'Image URL'"
        [placeholder]="'https://example.com/image.jpg'"
        [type]="'url'"
        [error]="getFieldError('imageUrl')"
      />

      <app-textarea-input
        formControlName="description"
        [label]="'Description'"
        [placeholder]="'Describe the equipment...'"
        [rows]="4"
        [error]="getFieldError('description')"
      />

      <!-- Substitutes For Section -->
      <div class="space-y-3">
        <span class="block text-sm font-medium text-gray-700">Substitutes For</span>
        <p class="text-xs text-gray-500">Select equipment that this can substitute for</p>

        <app-combobox
          [options]="availableEquipmentOptions()"
          placeholder="Search equipment to add..."
          emptyMessage="No matching equipment found"
          (optionSelected)="onSubstituteSelected($event)"
        />

        <!-- Selected Substitutes List -->
        @if (selectedSubstitutes().length > 0) {
          <div class="space-y-2 mt-3">
            @for (substitute of selectedSubstitutes(); track substitute.templateId) {
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3 text-gray-900">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span class="text-sm font-medium">{{ substitute.displayName }}</span>
                </div>
                <button
                  type="button"
                  (click)="removeSubstitute(substitute.templateId)"
                  class="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Remove substitute"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            }
          </div>
        }
      </div>

      @if (form.invalid && form.touched) {
        <app-form-error-summary [errors]="getFormErrors()" />
      }
    </form>
  `,
})
export class EquipmentFormComponent {
  initialValue = input<EquipmentResponseDto | null>(null);
  isEditMode = input<boolean>(false);
  allEquipment = input<EquipmentResponseDto[]>([]);

  formChange = output<Partial<EquipmentTemplate>>();
  validChange = output<boolean>();

  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    templateId: [crypto.randomUUID() as string],
    name: ['', Validators.required],
    displayName: ['', Validators.required],
    category: [''],
    imageUrl: [''],
    description: [''],
    substitutesFor: [[] as string[]],
  });

  categoryOptions: DropdownOption[] = [
    { value: '', label: 'None' },
    ...Object.entries(EquipmentCategoryLabels).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  // Computed: equipment options not already selected as substitutes (and not the current equipment)
  availableEquipmentOptions = computed<ComboboxOption[]>(() => {
    const all = this.allEquipment();
    const currentSubstituteIds = new Set(this.form.controls.substitutesFor.value);
    const currentTemplateId = this.form.controls.templateId.value;

    return all
      .filter((e) => !currentSubstituteIds.has(e.templateId) && e.templateId !== currentTemplateId)
      .map((e): ComboboxOption => ({
        value: e.templateId,
        label: e.displayName,
        sublabel: e.name !== e.displayName ? e.name : undefined,
        meta: e.category || undefined,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  });

  // Computed: full equipment objects for selected substitutes
  selectedSubstitutes = computed<EquipmentResponseDto[]>(() => {
    const all = this.allEquipment();
    const substituteIds = this.form.controls.substitutesFor.value;
    return substituteIds
      .map((id) => all.find((e) => e.templateId === id))
      .filter((e): e is EquipmentResponseDto => e !== undefined);
  });

  constructor() {
    effect(() => {
      const initial = this.initialValue();

      if (initial) {
        this.form.patchValue({
          templateId: initial.templateId,
          name: initial.name,
          displayName: initial.displayName,
          category: initial.category || '',
          imageUrl: initial.imageUrl || '',
          description: initial.description || '',
          substitutesFor: initial.substitutesFor || [],
        }, { emitEvent: false });


        untracked(() => {
          this.formChange.emit(this.form.getRawValue() as Partial<EquipmentTemplate>);
          this.validChange.emit(this.form.valid);
        });
      }
    });

    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.formChange.emit(this.form.getRawValue() as Partial<EquipmentTemplate>);
        this.validChange.emit(this.form.valid);
      });
  }

  onSubstituteSelected(option: ComboboxOption): void {
    const currentSubstitutes = [...this.form.controls.substitutesFor.value];
    if (!currentSubstitutes.includes(option.value)) {
      currentSubstitutes.push(option.value);
      this.form.controls.substitutesFor.setValue(currentSubstitutes);
    }
  }

  removeSubstitute(templateId: string): void {
    const currentSubstitutes = this.form.controls.substitutesFor.value.filter(
      (id) => id !== templateId
    );
    this.form.controls.substitutesFor.setValue(currentSubstitutes);
  }

  getFieldError(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.touched || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'This field is required';
    }
    if (control.errors['url']) {
      return 'Please enter a valid URL';
    }

    return 'Invalid value';
  }

  getFormErrors(): string[] {
    const errors: string[] = [];

    if (this.form.controls.name.invalid && this.form.controls.name.touched) {
      errors.push('Name is required');
    }
    if (this.form.controls.displayName.invalid && this.form.controls.displayName.touched) {
      errors.push('Display Name is required');
    }

    return errors;
  }
}
