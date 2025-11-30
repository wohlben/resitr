import { Component, computed, effect, inject, input, output, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { ExerciseResponseDto } from '@resitr/api';
import {
  ExerciseTypeLabels,
  ForceType,
  ForceTypeDescriptions,
  ForceTypeLabels,
  MeasurementParadigm,
  MeasurementParadigmDescriptions,
  MeasurementParadigmLabels,
  Muscle,
  MuscleDescriptions,
  MuscleLabels,
  TechnicalDifficultyLabels,
} from '@resitr/api';
import { TextInputComponent } from '../inputs/text-input.component';
import { TextareaInputComponent } from '../inputs/textarea-input.component';
import { NumberInputComponent } from '../inputs/number-input.component';
import { DropdownComponent, DropdownOption } from '../inputs/dropdown.component';
import { MultiTextInputComponent } from '../inputs/multi-text-input.component';
import { MultiSelectComponent, MultiSelectOption } from '../inputs/multi-select.component';
import { FormErrorSummaryComponent } from './form-error-summary.component';

@Component({
  selector: 'app-exercise-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextInputComponent,
    TextareaInputComponent,
    NumberInputComponent,
    DropdownComponent,
    MultiTextInputComponent,
    MultiSelectComponent,
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

      <app-multi-text-input
        formControlName="alternativeNames"
        [label]="'Alternative Names'"
        [placeholder]="'Enter alternative name'"
        [hint]="'Common alternative names for this exercise'"
      />

      <app-dropdown
        formControlName="type"
        [label]="'Exercise Type'"
        [options]="exerciseTypeOptions"
        [placeholder]="'Select exercise type'"
        [required]="true"
        [error]="getFieldError('type')"
      />

      <app-multi-select
        formControlName="force"
        [label]="'Force Types'"
        [options]="forceTypeOptions()"
        [required]="false"
      />

      <app-multi-select
        formControlName="primaryMuscles"
        [label]="'Primary Muscles'"
        [options]="muscleOptions()"
        [required]="true"
        [error]="getFieldError('primaryMuscles')"
      />

      <app-multi-select
        formControlName="secondaryMuscles"
        [label]="'Secondary Muscles'"
        [options]="muscleOptions()"
        [required]="false"
      />

      <app-multi-text-input
        formControlName="equipmentIds"
        [label]="'Equipment'"
        [placeholder]="'Equipment template ID'"
        [hint]="'List equipment required (using template IDs). Leave empty for bodyweight exercises.'"
      />

      <app-number-input
        formControlName="bodyWeightScaling"
        [label]="'Body Weight Scaling'"
        [placeholder]="'0.0 to 1.0'"
        [min]="0"
        [max]="1"
        [step]="0.1"
        [required]="true"
        [error]="getFieldError('bodyWeightScaling')"
        [hint]="'Proportion of body weight involved (0 = no bodyweight, 1 = full bodyweight)'"
      />

      <app-dropdown
        formControlName="technicalDifficulty"
        [label]="'Technical Difficulty'"
        [options]="technicalDifficultyOptions"
        [placeholder]="'Select difficulty level'"
        [required]="true"
        [error]="getFieldError('technicalDifficulty')"
      />

      <app-multi-select
        formControlName="suggestedMeasurementParadigms"
        [label]="'Suggested Measurement Paradigms'"
        [options]="measurementParadigmOptions()"
        [hint]="'How this exercise is typically measured (sets/reps, time, distance, etc.)'"
      />

      <app-multi-text-input
        formControlName="instructions"
        [label]="'Instructions'"
        [placeholder]="'Enter instruction step'"
        [hint]="'Step-by-step instructions for performing the exercise'"
        [error]="getFieldError('instructions')"
      />

      <app-textarea-input
        formControlName="description"
        [label]="'Description'"
        [placeholder]="'Describe the exercise...'"
        [rows]="4"
        [error]="getFieldError('description')"
      />

      <app-multi-text-input
        formControlName="images"
        [label]="'Image URLs'"
        [placeholder]="'https://example.com/image.jpg'"
        [hint]="'URLs to images or GIFs demonstrating the exercise'"
      />

      <app-text-input
        formControlName="authorName"
        [label]="'Author Name'"
        [placeholder]="'e.g., John Doe'"
        [error]="getFieldError('authorName')"
      />

      <app-text-input
        formControlName="authorUrl"
        [label]="'Author URL'"
        [placeholder]="'https://example.com'"
        [type]="'url'"
        [error]="getFieldError('authorUrl')"
      />

      @if (form.invalid && form.touched) {
      <app-form-error-summary [errors]="getFormErrors()" />
      }
    </form>
  `,
})
export class ExerciseFormComponent {
  initialValue = input<ExerciseResponseDto | null>(null);
  isEditMode = input<boolean>(false);

  formChange = output<Partial<ExerciseResponseDto>>();
  validChange = output<boolean>();

  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    templateId: [crypto.randomUUID() as string],
    name: ['', Validators.required],
    alternativeNames: [[] as string[]],
    type: ['', Validators.required],
    force: [[] as string[]],
    primaryMuscles: [[] as string[], Validators.required],
    secondaryMuscles: [[] as string[]],
    equipmentIds: [[] as string[]],
    bodyWeightScaling: [0, [Validators.required, Validators.min(0), Validators.max(1)]],
    technicalDifficulty: ['', Validators.required],
    suggestedMeasurementParadigms: [[] as string[]],
    instructions: [[] as string[]],
    description: [''],
    images: [[] as string[]],
    authorName: [''],
    authorUrl: [''],
  });

  exerciseTypeOptions: DropdownOption[] = Object.entries(ExerciseTypeLabels).map(([value, label]) => ({
    value,
    label,
  }));

  forceTypeOptions = computed<MultiSelectOption[]>(() =>
    Object.entries(ForceTypeLabels).map(([value, label]) => ({
      value,
      label,
      description: ForceTypeDescriptions[value as ForceType],
    }))
  );

  muscleOptions = computed<MultiSelectOption[]>(() =>
    Object.entries(MuscleLabels).map(([value, label]) => ({
      value,
      label,
      description: MuscleDescriptions[value as Muscle],
    }))
  );

  technicalDifficultyOptions: DropdownOption[] = Object.entries(TechnicalDifficultyLabels).map(([value, label]) => ({
    value,
    label,
  }));

  measurementParadigmOptions = computed<MultiSelectOption[]>(() =>
    Object.entries(MeasurementParadigmLabels).map(([value, label]) => ({
      value,
      label,
      description: MeasurementParadigmDescriptions[value as MeasurementParadigm],
    }))
  );

  constructor() {
    effect(() => {
      const initial = this.initialValue();

      if (initial) {
        this.form.patchValue(
          {
            templateId: initial.templateId,
            name: initial.name,
            alternativeNames: initial.alternativeNames || [],
            type: initial.type,
            force: initial.force || [],
            primaryMuscles: initial.primaryMuscles || [],
            secondaryMuscles: initial.secondaryMuscles || [],
            equipmentIds: initial.equipmentIds || [],
            bodyWeightScaling: initial.bodyWeightScaling,
            technicalDifficulty: initial.technicalDifficulty,
            suggestedMeasurementParadigms: initial.suggestedMeasurementParadigms || [],
            instructions: initial.instructions || [],
            description: initial.description || '',
            images: initial.images || [],
            authorName: initial.authorName || '',
            authorUrl: initial.authorUrl || '',
          },
          { emitEvent: false }
        );

        untracked(() => {
          this.formChange.emit(this.form.getRawValue() as Partial<ExerciseResponseDto>);
          this.validChange.emit(this.form.valid);
        });
      }
    });

    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.formChange.emit(this.form.getRawValue() as Partial<ExerciseResponseDto>);
      this.validChange.emit(this.form.valid);
    });

    this.validChange.emit(this.form.valid);
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
    if (control.errors['min']) {
      return `Value must be at least ${control.errors['min'].min}`;
    }
    if (control.errors['max']) {
      return `Value must be at most ${control.errors['max'].max}`;
    }

    return 'Invalid value';
  }

  getFormErrors(): string[] {
    const errors: string[] = [];

    if (this.form.get('name')?.invalid && this.form.get('name')?.touched) {
      errors.push('Name is required');
    }
    if (this.form.get('type')?.invalid && this.form.get('type')?.touched) {
      errors.push('Exercise Type is required');
    }
    if (this.form.get('primaryMuscles')?.invalid && this.form.get('primaryMuscles')?.touched) {
      errors.push('At least one primary muscle is required');
    }
    if (this.form.get('bodyWeightScaling')?.invalid && this.form.get('bodyWeightScaling')?.touched) {
      errors.push('Body Weight Scaling must be between 0 and 1');
    }
    if (this.form.get('technicalDifficulty')?.invalid && this.form.get('technicalDifficulty')?.touched) {
      errors.push('Technical Difficulty is required');
    }

    return errors;
  }
}
