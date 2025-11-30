import { Component, input, output, effect, inject, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { ExerciseGroupResponseDto, ExerciseGroupTemplate } from '@resitr/api';
import { TextInputComponent } from '../inputs/text-input.component';
import { TextareaInputComponent } from '../inputs/textarea-input.component';
import { FormErrorSummaryComponent } from './form-error-summary.component';

@Component({
  selector: 'app-exercise-group-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextInputComponent,
    TextareaInputComponent,
    FormErrorSummaryComponent,
  ],
  template: `
    <form [formGroup]="form" class="space-y-6">
      <app-text-input
        formControlName="name"
        [label]="'Name'"
        [placeholder]="'e.g., Push Exercises'"
        [required]="true"
        [error]="getFieldError('name')"
      />

      <app-textarea-input
        formControlName="description"
        [label]="'Description'"
        [placeholder]="'Describe this exercise group...'"
        [rows]="4"
        [error]="getFieldError('description')"
      />

      @if (form.invalid && form.touched) {
        <app-form-error-summary [errors]="getFormErrors()" />
      }
    </form>
  `,
})
export class ExerciseGroupFormComponent {
  initialValue = input<ExerciseGroupResponseDto | null>(null);
  isEditMode = input<boolean>(false);

  formChange = output<Partial<ExerciseGroupTemplate>>();
  validChange = output<boolean>();

  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
  });

  constructor() {
    effect(() => {
      const initial = this.initialValue();

      if (initial) {
        this.form.patchValue({
          name: initial.name,
          description: initial.description || '',
        }, { emitEvent: false });

        untracked(() => {
          this.formChange.emit(this.form.getRawValue() as Partial<ExerciseGroupTemplate>);
          this.validChange.emit(this.form.valid);
        });
      }
    });

    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.formChange.emit(this.form.getRawValue() as Partial<ExerciseGroupTemplate>);
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

    return 'Invalid value';
  }

  getFormErrors(): string[] {
    const errors: string[] = [];

    if (this.form.controls.name.invalid && this.form.controls.name.touched) {
      errors.push('Name is required');
    }

    return errors;
  }
}
