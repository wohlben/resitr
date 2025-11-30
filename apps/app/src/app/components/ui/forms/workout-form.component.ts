import { Component, computed, effect, inject, input, output, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray, CdkDragHandle } from '@angular/cdk/drag-drop';
import type {
  WorkoutResponseDto,
  CreateWorkoutDto,
  CreateWorkoutSectionDto,
  CreateWorkoutSectionItemDto,
  ExerciseResponseDto,
} from '@resitr/api';
import { WorkoutSectionType, ExerciseType, Muscle } from '@resitr/api';
import { TextInputComponent } from '../inputs/text-input.component';
import { TextareaInputComponent } from '../inputs/textarea-input.component';
import { ComboboxOption } from '../inputs/combobox.component';
import { FormErrorSummaryComponent } from './form-error-summary.component';
import { WorkoutSectionCardComponent } from './workout-section-card.component';
import { ExercisesStore } from '../../../features/exercises/exercises.store';

// Map section types to allowed exercise types
const FLEXIBLE_SECTION_TYPES: ExerciseType[] = [ExerciseType.CARDIO, ExerciseType.STRETCHING];
const SECTION_EXERCISE_TYPES: Record<WorkoutSectionType, ExerciseType[]> = {
  [WorkoutSectionType.WARMUP]: FLEXIBLE_SECTION_TYPES,
  [WorkoutSectionType.STRETCHING]: FLEXIBLE_SECTION_TYPES,
  [WorkoutSectionType.STRENGTH]: [ExerciseType.STRENGTH],
  [WorkoutSectionType.COOLDOWN]: FLEXIBLE_SECTION_TYPES,
};

@Component({
  selector: 'app-workout-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CdkDropList,
    CdkDrag,
    TextInputComponent,
    TextareaInputComponent,
    FormErrorSummaryComponent,
    WorkoutSectionCardComponent,
    CdkDragHandle,
  ],
  template: `
    <form [formGroup]="form" class="space-y-6">
      <app-text-input
        formControlName="name"
        [label]="'Name'"
        [placeholder]="'e.g., Morning Full Body Workout'"
        [required]="true"
        [error]="getFieldError('name')"
      />

      <app-textarea-input
        formControlName="description"
        [label]="'Description'"
        [placeholder]="'Describe the workout...'"
        [rows]="3"
        [error]="getFieldError('description')"
      />

      <!-- Sections -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="block text-sm font-medium text-gray-700">Sections</span>
          <button
            type="button"
            (click)="addSection()"
            class="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Section
          </button>
        </div>

        @if (sectionsArray.length === 0) {
        <div class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p class="text-gray-500 mb-2">No sections added yet</p>
          <button type="button" (click)="addSection()" class="text-blue-600 hover:text-blue-800 font-medium">
            Add your first section
          </button>
        </div>
        } @else {
        <div
          cdkDropList
          [cdkDropListData]="sectionsArray.controls"
          (cdkDropListDropped)="dropSection($event)"
          class="space-y-4"
        >
          @for (section of sectionsArray.controls; track section; let sectionIndex = $index) {
          <div cdkDrag [cdkDragData]="section" cdkDragHandle>
            <app-workout-section-card
              [section]="$any(section)"
              [exerciseOptions]="getExerciseOptionsForSection(sectionIndex)"
              [exerciseMap]="exerciseMap()"
              [strengthMuscles]="strengthMuscles()"
              (remove)="removeSection(sectionIndex)"
              (exerciseAdded)="addExerciseToSection($event, sectionIndex)"
              (exerciseRemoved)="removeItem(sectionIndex, $event)"
              (itemsReordered)="onItemsReordered(sectionIndex)"
              (sectionTypeChanged)="onSectionTypeChanged(sectionIndex)"
            />
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
export class WorkoutFormComponent {
  private exercisesStore = inject(ExercisesStore);
  initialValue = input<WorkoutResponseDto | null>(null);
  isEditMode = input<boolean>(false);

  formChange = output<Partial<CreateWorkoutDto>>();
  validChange = output<boolean>();

  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    templateId: [crypto.randomUUID() as string],
    name: ['', Validators.required],
    description: [''],
    sections: this.fb.array<FormGroup>([]),
    version: [1],
  });

  /** Signal derived from form valueChanges for reactive computeds */
  private formValue = toSignal(this.form.valueChanges);

  exerciseMap = computed<Map<string, ExerciseResponseDto>>(() => {
    const map = new Map<string, ExerciseResponseDto>();
    this.exercisesStore.exercises().forEach((e) => map.set(e.templateId, e));
    return map;
  });

  /** Pre-computed ComboboxOption arrays per section type */
  private optionsBySectionType = computed<Map<WorkoutSectionType, ComboboxOption[]>>(() => {
    const exercises = this.exercisesStore.exercises();
    const map = new Map<WorkoutSectionType, ComboboxOption[]>();

    for (const sectionType of Object.values(WorkoutSectionType)) {
      const allowedTypes = SECTION_EXERCISE_TYPES[sectionType];
      const options = exercises
        .filter((e) => allowedTypes.includes(e.type as ExerciseType))
        .map(
          (e): ComboboxOption => ({
            value: e.templateId,
            label: e.name,
            sublabel: e.authorName,
            meta: `v${e.version}`,
            searchTerms: e.alternativeNames,
          })
        );
      map.set(sectionType, options);
    }

    return map;
  });

  /** Get all primary muscles from all strength section exercises */
  strengthMuscles = computed(() => {
    // Access formValue to trigger reactivity when form changes
    this.formValue();

    const muscles = new Set<Muscle>();
    const exerciseMap = this.exerciseMap();

    for (const sectionCtrl of this.sectionsArray.controls) {
      const section = sectionCtrl as FormGroup;
      const sectionType = section.get('type')?.value as WorkoutSectionType;

      if (sectionType !== WorkoutSectionType.STRENGTH) continue;

      const itemsArray = section.get('items') as FormArray;
      for (const itemCtrl of itemsArray.controls) {
        const item = itemCtrl as FormGroup;
        const exerciseId = item.get('exerciseId')?.value;
        const exercise = exerciseMap.get(exerciseId);
        if (exercise?.primaryMuscles) {
          exercise.primaryMuscles.forEach((m) => muscles.add(m as Muscle));
        }
      }
    }

    return muscles;
  });

  get sectionsArray(): FormArray {
    return this.form.get('sections') as FormArray;
  }

  constructor() {
    // Initialize default sections for new workouts
    this.initializeDefaultSections();

    effect(() => {
      const initial = this.initialValue();

      if (initial) {
        // Clear existing sections
        while (this.sectionsArray.length > 0) {
          this.sectionsArray.removeAt(0);
        }

        // Populate from initial value
        initial.sections.forEach((section) => {
          const sectionGroup = this.createSectionGroup({
            type: section.type,
            name: section.name,
            items: section.items.map((item) => ({
              exerciseId: item.exerciseId,
              breakBetweenSets: item.breakBetweenSets,
              breakAfter: item.breakAfter,
            })),
          });
          this.sectionsArray.push(sectionGroup);
        });

        this.form.patchValue(
          {
            templateId: initial.templateId,
            name: initial.name,
            description: initial.description || '',
            version: initial.version,
          },
          { emitEvent: false }
        );

        untracked(() => {
          this.emitFormData();
        });
      }
    });

    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.emitFormData();
    });

    this.validChange.emit(this.form.valid);
  }

  private initializeDefaultSections(): void {
    const defaultSections = [
      { type: WorkoutSectionType.STRETCHING, name: 'Stretching' },
      { type: WorkoutSectionType.STRENGTH, name: 'Strength' },
    ];

    defaultSections.forEach((section) => {
      this.sectionsArray.push(this.createSectionGroup(section));
    });
  }

  private emitFormData(): void {
    const rawValue = this.form.getRawValue();

    // Build all sections
    const allSections: CreateWorkoutSectionDto[] = this.sectionsArray.controls.map((sectionCtrl) => {
      const section = sectionCtrl as FormGroup;
      const itemsArray = section.get('items') as FormArray;
      return {
        type: section.get('type')?.value as WorkoutSectionType,
        name: section.get('name')?.value as string,
        items: itemsArray.controls.map((itemCtrl) => {
          const item = itemCtrl as FormGroup;
          return {
            exerciseId: item.get('exerciseId')?.value as string,
            breakBetweenSets: item.get('breakBetweenSets')?.value as number,
            breakAfter: item.get('breakAfter')?.value as number,
          };
        }),
      };
    });

    // Filter out empty sections (no exercises added)
    const sections = allSections.filter((section) => section.items.length > 0);

    const formData: Partial<CreateWorkoutDto> = {
      templateId: rawValue.templateId,
      name: rawValue.name,
      sections,
      version: rawValue.version,
    };
    if (rawValue.description) {
      formData.description = rawValue.description;
    }

    this.formChange.emit(formData);
    this.validChange.emit(this.form.valid && this.validateSections());
  }

  private validateSections(): boolean {
    // Validate only sections that have exercises
    for (const sectionCtrl of this.sectionsArray.controls) {
      const section = sectionCtrl as FormGroup;
      const itemsArray = section.get('items') as FormArray;

      // Skip empty sections - they'll be filtered out on save
      if (itemsArray.length === 0) continue;

      // Sections with exercises must have type and name
      if (!section.get('type')?.value || !section.get('name')?.value) {
        return false;
      }

      // All items must have an exercise selected
      for (const itemCtrl of itemsArray.controls) {
        const item = itemCtrl as FormGroup;
        if (!item.get('exerciseId')?.value) {
          return false;
        }
      }
    }
    return true;
  }

  private createSectionGroup(data?: Partial<CreateWorkoutSectionDto>): FormGroup {
    const itemsArray = this.fb.array<FormGroup>([]);
    if (data?.items) {
      data.items.forEach((item) => {
        itemsArray.push(this.createItemGroup(item));
      });
    }

    return this.fb.group({
      type: [data?.type ?? '', Validators.required],
      name: [data?.name ?? '', Validators.required],
      items: itemsArray,
    });
  }

  private createItemGroup(data?: Partial<CreateWorkoutSectionItemDto>): FormGroup {
    return this.fb.group({
      exerciseId: [data?.exerciseId ?? '', Validators.required],
      breakBetweenSets: [data?.breakBetweenSets ?? 30, [Validators.required, Validators.min(0)]],
      breakAfter: [data?.breakAfter ?? 60, [Validators.required, Validators.min(0)]],
    });
  }

  getExerciseOptionsForSection(sectionIndex: number): ComboboxOption[] {
    const section = this.sectionsArray.at(sectionIndex) as FormGroup;
    const sectionType = section.get('type')?.value as WorkoutSectionType;

    if (!sectionType) {
      return [];
    }

    return this.optionsBySectionType().get(sectionType) || [];
  }

  addSection(): void {
    this.sectionsArray.push(this.createSectionGroup());
    this.emitFormData();
  }

  removeSection(index: number): void {
    this.sectionsArray.removeAt(index);
    this.emitFormData();
  }

  addExerciseToSection(option: ComboboxOption, sectionIndex: number): void {
    const section = this.sectionsArray.at(sectionIndex) as FormGroup;
    const itemsArray = section.get('items') as FormArray;
    itemsArray.push(this.createItemGroup({ exerciseId: option.value }));
    this.emitFormData();
  }

  removeItem(sectionIndex: number, itemIndex: number): void {
    const section = this.sectionsArray.at(sectionIndex) as FormGroup;
    const itemsArray = section.get('items') as FormArray;
    itemsArray.removeAt(itemIndex);
    this.emitFormData();
  }

  dropSection(event: CdkDragDrop<AbstractControl[]>): void {
    moveItemInArray(this.sectionsArray.controls, event.previousIndex, event.currentIndex);
    this.emitFormData();
  }

  onItemsReordered(_sectionIndex: number): void {
    // Items are already reordered in the child component
    this.emitFormData();
  }

  onSectionTypeChanged(_sectionIndex: number): void {
    this.emitFormData();
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

    if (this.form.get('name')?.invalid && this.form.get('name')?.touched) {
      errors.push('Name is required');
    }

    // Check sections
    this.sectionsArray.controls.forEach((sectionCtrl, sectionIndex) => {
      const section = sectionCtrl as FormGroup;
      if (!section.get('type')?.value) {
        errors.push(`Section ${sectionIndex + 1}: Type is required`);
      }
      if (!section.get('name')?.value) {
        errors.push(`Section ${sectionIndex + 1}: Name is required`);
      }

      const itemsArray = section.get('items') as FormArray;
      itemsArray.controls.forEach((itemCtrl, itemIndex) => {
        const item = itemCtrl as FormGroup;
        if (!item.get('exerciseId')?.value) {
          errors.push(`Section ${sectionIndex + 1}, Exercise ${itemIndex + 1}: Exercise is required`);
        }
      });
    });

    return errors;
  }
}
