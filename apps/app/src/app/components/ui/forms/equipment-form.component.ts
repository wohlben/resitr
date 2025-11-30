import { Component, input, output, effect, inject, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { EquipmentResponseDto, EquipmentTemplate } from '@resitr/api';
import { EquipmentCategoryLabels } from '@resitr/api';
import { TextInputComponent } from '../inputs/text-input.component';
import { TextareaInputComponent } from '../inputs/textarea-input.component';
import { DropdownComponent, DropdownOption } from '../inputs/dropdown.component';
import { MultiTextInputComponent } from '../inputs/multi-text-input.component';
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
    MultiTextInputComponent,
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

      <app-multi-text-input
        formControlName="substitutesFor"
        [label]="'Substitutes For'"
        [placeholder]="'Equipment template ID'"
        [hint]="'List equipment that this can substitute for (using their template IDs)'"
      />

      @if (form.invalid && form.touched) {
        <app-form-error-summary [errors]="getFormErrors()" />
      }
    </form>
  `,
})
export class EquipmentFormComponent {
  initialValue = input<EquipmentResponseDto | null>(null);
  isEditMode = input<boolean>(false);

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
