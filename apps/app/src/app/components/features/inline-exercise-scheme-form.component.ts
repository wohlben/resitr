import { Component, input, output, signal, computed, effect } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MeasurementType, MeasurementTypeLabels, MeasurementParadigm } from '@resitr/api';
import { TextInputComponent } from '../ui/inputs/text-input.component';
import { NumberInputComponent } from '../ui/inputs/number-input.component';
import { DropdownComponent, DropdownOption } from '../ui/inputs/dropdown.component';
import { ButtonComponent } from '../ui/buttons/button.component';

export interface ExerciseSchemeFormData {
  name: string;
  measurementType: MeasurementType;
  sets: number;
  reps: number;
  restBetweenSets: number;
  weight?: number;
  timePerRep?: number;
  duration?: number;
  distance?: number;
  targetTime?: number;
}

@Component({
  selector: 'app-inline-exercise-scheme-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TextInputComponent,
    NumberInputComponent,
    DropdownComponent,
    ButtonComponent,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 class="text-sm font-medium text-gray-700">Create New Scheme</h4>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <app-text-input
          formControlName="name"
          label="Scheme Name"
          placeholder="e.g., Heavy 3x5"
          hint="Auto-filled from sets/reps"
        />

        <app-dropdown
          formControlName="measurementType"
          label="Measurement Type"
          [options]="measurementTypeOptions()"
          [required]="true"
        />
      </div>

      <div class="grid grid-cols-3 gap-4">
        <app-number-input
          formControlName="sets"
          label="Sets"
          [min]="1"
          [required]="true"
          [error]="getError('sets')"
        />

        <app-number-input
          formControlName="reps"
          label="Reps"
          [min]="1"
          [required]="true"
          [error]="getError('reps')"
        />

        <app-number-input
          formControlName="restBetweenSets"
          label="Rest (seconds)"
          [min]="0"
          [required]="true"
          [error]="getError('restBetweenSets')"
        />
      </div>

      <!-- Conditional fields based on measurement type -->
      @if (showWeightAndTimePerRep()) {
        <div class="grid grid-cols-2 gap-4">
          <app-number-input
            formControlName="weight"
            label="Weight (kg)"
            [min]="0"
            [step]="0.5"
            hint="Optional"
          />

          <app-number-input
            formControlName="timePerRep"
            label="Time per Rep (seconds)"
            [min]="1"
            hint="Optional"
          />
        </div>
      }

      @if (showDuration()) {
        <app-number-input
          formControlName="duration"
          label="Duration (seconds)"
          [min]="1"
          hint="Total time for the exercise"
        />
      }

      @if (showDistanceFields()) {
        <div class="grid grid-cols-2 gap-4">
          <app-number-input
            formControlName="distance"
            label="Distance (meters)"
            [min]="1"
          />

          <app-number-input
            formControlName="targetTime"
            label="Target Time (seconds)"
            [min]="1"
            hint="Optional goal time"
          />
        </div>
      }

      <div class="flex justify-end gap-2 pt-2">
        <app-button
          type="button"
          variant="outline-secondary"
          (click)="onCancel()"
          [disabled]="isSaving()"
        >
          Cancel
        </app-button>
        <app-button
          type="submit"
          variant="primary"
          [disabled]="form.invalid || isSaving()"
        >
          @if (isSaving()) {
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating...
          } @else {
            Create Scheme
          }
        </app-button>
      </div>
    </form>
  `,
})
export class InlineExerciseSchemeFormComponent {
  isSaving = input<boolean>(false);
  suggestedMeasurementParadigms = input<MeasurementParadigm[]>([]);

  formSubmit = output<ExerciseSchemeFormData>();
  formCancel = output<void>();

  private static readonly AUTO_NAME_PATTERN = /^\d+x\d+$/;

  form = new FormGroup({
    name: new FormControl('3x10', { nonNullable: true }),
    measurementType: new FormControl<MeasurementType>(MeasurementType.REP_BASED, { nonNullable: true, validators: [Validators.required] }),
    sets: new FormControl<number>(3, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    reps: new FormControl<number>(10, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    restBetweenSets: new FormControl<number>(60, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    weight: new FormControl<number | null>(null),
    timePerRep: new FormControl<number | null>(null),
    duration: new FormControl<number | null>(null),
    distance: new FormControl<number | null>(null),
    targetTime: new FormControl<number | null>(null),
  });

  // Order measurement types: suggested first, then remaining
  measurementTypeOptions = computed<DropdownOption[]>(() => {
    const suggested = this.suggestedMeasurementParadigms();
    const allTypes = Object.keys(MeasurementTypeLabels) as MeasurementType[];

    // Create a set of suggested types for quick lookup
    const suggestedSet = new Set(suggested as string[]);

    // Separate into suggested and non-suggested
    const suggestedTypes = allTypes.filter(t => suggestedSet.has(t));
    const remainingTypes = allTypes.filter(t => !suggestedSet.has(t));

    // Order: suggested (in their order) first, then remaining
    const orderedTypes = [...suggestedTypes, ...remainingTypes];

    return orderedTypes.map(type => ({
      value: type,
      label: MeasurementTypeLabels[type],
    }));
  });

  private currentMeasurementType = signal<MeasurementType>(MeasurementType.REP_BASED);
  private initialized = signal(false);

  showWeightAndTimePerRep = computed(() => {
    const type = this.currentMeasurementType();
    return [MeasurementType.REP_BASED, MeasurementType.EMOM, MeasurementType.ROUNDS_FOR_TIME].includes(type);
  });

  showDuration = computed(() => {
    const type = this.currentMeasurementType();
    return [MeasurementType.TIME_BASED, MeasurementType.AMRAP].includes(type);
  });

  showDistanceFields = computed(() => {
    return this.currentMeasurementType() === MeasurementType.DISTANCE_BASED;
  });

  constructor() {
    // Track measurement type changes
    this.form.controls.measurementType.valueChanges.subscribe((value) => {
      this.currentMeasurementType.set(value);
    });

    // Auto-fill name from sets/reps if name matches the auto pattern
    this.form.controls.sets.valueChanges.subscribe(() => this.autoFillName());
    this.form.controls.reps.valueChanges.subscribe(() => this.autoFillName());

    // Auto-select first suggested measurement type on init
    effect(() => {
      const suggested = this.suggestedMeasurementParadigms();
      if (!this.initialized() && suggested.length > 0) {
        this.initialized.set(true);
        // MeasurementParadigm values are a subset of MeasurementType values
        const firstSuggested = suggested[0] as unknown as MeasurementType;
        this.form.controls.measurementType.setValue(firstSuggested);
        this.currentMeasurementType.set(firstSuggested);
      }
    });
  }

  private autoFillName(): void {
    const currentName = this.form.controls.name.value;
    // Only auto-fill if name is empty or matches the auto pattern (user hasn't customized it)
    if (!currentName || InlineExerciseSchemeFormComponent.AUTO_NAME_PATTERN.test(currentName)) {
      const sets = this.form.controls.sets.value;
      const reps = this.form.controls.reps.value;
      this.form.controls.name.setValue(`${sets}x${reps}`, { emitEvent: false });
    }
  }

  getError(field: string): string {
    const control = this.form.get(field);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['min']) return `Minimum value is ${control.errors['min'].min}`;
    }
    return '';
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.getRawValue();
      const data: ExerciseSchemeFormData = {
        name: formValue.name,
        measurementType: formValue.measurementType,
        sets: formValue.sets,
        reps: formValue.reps,
        restBetweenSets: formValue.restBetweenSets,
      };

      // Add optional fields based on measurement type
      if (this.showWeightAndTimePerRep()) {
        if (formValue.weight !== null) data.weight = formValue.weight;
        if (formValue.timePerRep !== null) data.timePerRep = formValue.timePerRep;
      }

      if (this.showDuration() && formValue.duration !== null) {
        data.duration = formValue.duration;
      }

      if (this.showDistanceFields()) {
        if (formValue.distance !== null) data.distance = formValue.distance;
        if (formValue.targetTime !== null) data.targetTime = formValue.targetTime;
      }

      this.formSubmit.emit(data);
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  reset(): void {
    const suggested = this.suggestedMeasurementParadigms();
    // MeasurementParadigm values are a subset of MeasurementType values
    const defaultType = suggested.length > 0 ? suggested[0] as unknown as MeasurementType : MeasurementType.REP_BASED;

    this.form.reset({
      name: '3x10',
      measurementType: defaultType,
      sets: 3,
      reps: 10,
      restBetweenSets: 60,
      weight: null,
      timePerRep: null,
      duration: null,
      distance: null,
      targetTime: null,
    });
    this.currentMeasurementType.set(defaultType);
  }
}
