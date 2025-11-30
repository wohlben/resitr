import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CdkDragDrop, CdkDropList, CdkDrag, CdkDragHandle, moveItemInArray } from '@angular/cdk/drag-drop';
import type { ExerciseResponseDto } from '@resitr/api';
import { WorkoutSectionType, WorkoutSectionTypeLabels, Muscle, MuscleLabels } from '@resitr/api';
import { ComboboxComponent, ComboboxOption } from '../inputs/combobox.component';
import { IconButtonComponent } from '../icon-button.component';
import { ButtonGroupComponent, ButtonGroupOption } from '../button-group.component';
import { SearchIndex } from '../../../shared/utils';

interface SectionConfig {
  icon: string;
  bgColor: string;
  borderColor: string;
  iconBg: string;
}

const SECTION_STYLES: Record<WorkoutSectionType, SectionConfig> = {
  [WorkoutSectionType.WARMUP]: {
    icon: '🔥',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    iconBg: 'bg-orange-100',
  },
  [WorkoutSectionType.STRETCHING]: {
    icon: '🧘',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    iconBg: 'bg-purple-100',
  },
  [WorkoutSectionType.STRENGTH]: {
    icon: '💪',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconBg: 'bg-blue-100',
  },
  [WorkoutSectionType.COOLDOWN]: {
    icon: '❄️',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    iconBg: 'bg-cyan-100',
  },
};

// Section types that should show muscle coverage info
const FLEXIBLE_SECTIONS = new Set([
  WorkoutSectionType.WARMUP,
  WorkoutSectionType.STRETCHING,
  WorkoutSectionType.COOLDOWN,
]);

@Component({
  selector: 'app-workout-section-card',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    ComboboxComponent,
    IconButtonComponent,
    ButtonGroupComponent,
  ],
  template: `
    <div
      class="rounded-lg border-2 transition-colors"
      [ngClass]="sectionStyles()"
    >
      <!-- Section Header -->
      <div class="flex flex-col gap-2 p-4 border-b" [ngClass]="sectionBorderColor()">
        <!-- Top row -->
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 flex-1">
            <div class="cursor-move text-gray-400 hover:text-gray-600 drag-handle">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-2 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8-14a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-2 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm2 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6-12a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-2 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
              </svg>
            </div>
            @if (itemsArray.length > 0) {
              <!-- Locked state: icon + name input -->
              <span class="text-xl p-1 rounded" [ngClass]="sectionIconBg()">
                {{ sectionIcon() }}
              </span>
              <input
                type="text"
                [formControl]="nameControl()"
                placeholder="Section name..."
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            } @else {
              <!-- Unlocked state: section type picker -->
              <app-button-group
                [options]="sectionTypeButtonOptions()"
                [value]="sectionType()"
                (valueChange)="onSectionTypeChange($event)"
              />
            }
          </div>
          <app-icon-button
            variant="danger"
            (click)="remove.emit()"
            title="Remove section"
            ariaLabel="Remove section"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </app-icon-button>
        </div>

        <!-- Second row: name input (only when unlocked) -->
        @if (itemsArray.length === 0) {
          <input
            type="text"
            [formControl]="nameControl()"
            placeholder="Section name..."
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        }
      </div>

      <!-- Section Items -->
      <div class="p-4">
        <!-- Add Exercise Input + Muscle Filter -->
        <div class="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 mb-3">
          <div class="flex-1 w-full md:w-auto">
            <app-combobox
              [options]="filteredExerciseOptions()"
              [searchIndex]="exerciseSearchIndex()"
              [placeholder]="'Search and add exercise...'"
              [emptyMessage]="'No matching exercises found'"
              (optionSelected)="onExerciseSelected($event)"
            />
          </div>
          @if (isFlexibleSection()) {
            <div class="flex items-center gap-2 flex-wrap flex-shrink-0">
              <!-- Active muscle filter chips -->
              @for (muscle of activeMuscleFilters(); track muscle) {
                <button
                  type="button"
                  (click)="removeMuscleFilter(muscle)"
                  class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                >
                  {{ MuscleLabels[muscle] }}
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              }
              <div class="w-40">
                <app-combobox
                  [options]="availableMuscleFilterOptions()"
                  [placeholder]="'Filter by muscle...'"
                  [emptyMessage]="'No muscles available'"
                  (optionSelected)="onMuscleFilterSelected($event)"
                />
              </div>
            </div>
          }
        </div>

        <!-- Exercise List -->
        @if (itemsArray.length > 0) {
          <div
            cdkDropList
            [cdkDropListData]="itemsArray.controls"
            (cdkDropListDropped)="onItemDrop($event)"
            class="space-y-2"
          >
            @for (item of itemsArray.controls; track item; let itemIndex = $index) {
              <div
                cdkDrag
                [cdkDragData]="item"
                class="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <div cdkDragHandle class="cursor-move text-gray-400 hover:text-gray-600">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-2 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8-14a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-2 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm2 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                  </svg>
                </div>

                <div class="flex-1 min-w-0">
                  <span class="font-medium text-gray-900">{{ getExerciseName(itemIndex) }}</span>
                </div>

                <div class="flex items-center gap-2 flex-shrink-0">
                  <div class="flex items-center gap-1">
                    <span class="text-xs text-gray-500">Rest:</span>
                    <input
                      type="number"
                      [formControl]="getItemControl(itemIndex, 'breakBetweenSets')"
                      min="0"
                      aria-label="Rest between sets in seconds"
                      class="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                    />
                    <span class="text-xs text-gray-500">s</span>
                  </div>

                  <div class="flex items-center gap-1">
                    <span class="text-xs text-gray-500">After:</span>
                    <input
                      type="number"
                      [formControl]="getItemControl(itemIndex, 'breakAfter')"
                      min="0"
                      aria-label="Break after exercise in seconds"
                      class="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                    />
                    <span class="text-xs text-gray-500">s</span>
                  </div>

                  <app-icon-button
                    variant="danger"
                    size="sm"
                    (click)="onRemoveItem(itemIndex)"
                    title="Remove exercise"
                    ariaLabel="Remove exercise"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </app-icon-button>
                </div>
              </div>
            }
          </div>
        }

        <!-- Uncovered Muscles Indicator (for flexible sections) -->
        @if (isFlexibleSection() && strengthMuscles().size > 0) {
          @let uncovered = uncoveredMuscles();
          @if (uncovered.length > 0) {
            <div class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-amber-800">Muscles not yet covered:</p>
                  <div class="flex flex-wrap gap-1 mt-1">
                    @for (muscle of uncovered; track muscle) {
                      <button
                        type="button"
                        (click)="addMuscleFilter(muscle)"
                        class="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 cursor-pointer transition-colors"
                        title="Click to filter exercises by this muscle"
                      >
                        {{ MuscleLabels[muscle] }}
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class WorkoutSectionCardComponent {
  // Inputs
  section = input.required<FormGroup>();
  exerciseOptions = input.required<ComboboxOption[]>();
  exerciseMap = input.required<Map<string, ExerciseResponseDto>>();
  strengthMuscles = input<Set<Muscle>>(new Set());

  // Outputs
  remove = output<void>();
  exerciseAdded = output<ComboboxOption>();
  exerciseRemoved = output<number>();
  itemsReordered = output<CdkDragDrop<AbstractControl[]>>();
  sectionTypeChanged = output<WorkoutSectionType>();

  /** Local UI state - active muscle filters (simple signal, no FormGroup needed) */
  private muscleFilters = signal<Muscle[]>([]);

  // Expose labels for template
  readonly MuscleLabels = MuscleLabels;
  readonly WorkoutSectionTypeLabels = WorkoutSectionTypeLabels;

  muscleFilterOptions: ComboboxOption[] = Object.entries(MuscleLabels).map(([value, label]) => ({
    value,
    label,
  }));

  /** Button group options for section type picker */
  sectionTypeButtonOptions = computed((): ButtonGroupOption[] => {
    return Object.entries(WorkoutSectionTypeLabels).map(([value, label]) => ({
      value,
      label,
      icon: this.getSectionTypeIcon(value),
      activeClass: this.getButtonActiveClass(value),
    }));
  });

  // Computed properties
  sectionType = computed(() => {
    const type = this.section().get('type')?.value;
    return type as WorkoutSectionType;
  });

  sectionTypeLabel = computed(() => {
    const type = this.sectionType();
    return type ? WorkoutSectionTypeLabels[type] : '';
  });

  isFlexibleSection = computed(() => {
    const type = this.sectionType();
    return type !== null && FLEXIBLE_SECTIONS.has(type);
  });

  sectionStyles = computed(() => {
    const type = this.sectionType();
    if (!type) return 'bg-gray-50 border-gray-200';
    const config = SECTION_STYLES[type];
    return `${config.bgColor} ${config.borderColor}`;
  });

  sectionBorderColor = computed(() => {
    const type = this.sectionType();
    if (!type) return 'border-gray-200';
    return SECTION_STYLES[type].borderColor;
  });

  sectionIcon = computed(() => {
    const type = this.sectionType();
    if (!type) return '📋';
    return SECTION_STYLES[type].icon;
  });

  sectionIconBg = computed(() => {
    const type = this.sectionType();
    if (!type) return 'bg-gray-100';
    return SECTION_STYLES[type].iconBg;
  });

  /** Get the items FormArray from the section */
  get itemsArray(): FormArray {
    return this.section().get('items') as FormArray;
  }

  nameControl = computed(() => {
    return this.section().get('name') as FormControl;
  });

  // Muscle filter computed properties
  activeMuscleFilters = computed(() => this.muscleFilters());

  availableMuscleFilterOptions = computed(() => {
    const active = new Set(this.activeMuscleFilters());
    return this.muscleFilterOptions.filter(opt => !active.has(opt.value as Muscle));
  });

  filteredExerciseOptions = computed(() => {
    let options = this.exerciseOptions();
    const muscleFilters = this.activeMuscleFilters();

    if (muscleFilters.length > 0) {
      const exerciseMap = this.exerciseMap();
      options = options.filter(opt => {
        const exercise = exerciseMap.get(opt.value);
        if (!exercise) return false;

        const exerciseMuscles = new Set([
          ...(exercise.primaryMuscles || []),
          ...(exercise.secondaryMuscles || []),
        ]);

        return muscleFilters.some(muscle => exerciseMuscles.has(muscle));
      });
    }

    return options;
  });

  exerciseSearchIndex = computed(() => {
    const options = this.filteredExerciseOptions();
    if (options.length === 0) return undefined;

    return new SearchIndex(options, (opt) => [
      opt.label,
      opt.sublabel,
      opt.meta,
      ...(opt.searchTerms || []),
    ]);
  });

  coveredMuscles = computed(() => {
    // Read strengthMuscles to trigger reactivity when parent form changes
    this.strengthMuscles();

    const muscles = new Set<Muscle>();
    const exerciseMap = this.exerciseMap();
    const items = this.itemsArray;

    for (const itemCtrl of items.controls) {
      const item = itemCtrl as FormGroup;
      const exerciseId = item.get('exerciseId')?.value;
      const exercise = exerciseMap.get(exerciseId);
      if (exercise?.primaryMuscles) {
        exercise.primaryMuscles.forEach(m => muscles.add(m as Muscle));
      }
      if (exercise?.secondaryMuscles) {
        exercise.secondaryMuscles.forEach(m => muscles.add(m as Muscle));
      }
    }

    return muscles;
  });

  uncoveredMuscles = computed(() => {
    if (!this.isFlexibleSection()) {
      return [];
    }

    const strengthMuscles = this.strengthMuscles();
    const covered = this.coveredMuscles();

    return Array.from(strengthMuscles).filter(m => !covered.has(m));
  });

  // Methods
  getSectionTypeIcon(type: string): string {
    const sectionType = type as WorkoutSectionType;
    return SECTION_STYLES[sectionType]?.icon || '📋';
  }

  getButtonActiveClass(type: string): string {
    const sectionType = type as WorkoutSectionType;
    switch (sectionType) {
      case WorkoutSectionType.WARMUP:
        return 'bg-orange-500 text-white';
      case WorkoutSectionType.STRETCHING:
        return 'bg-purple-500 text-white';
      case WorkoutSectionType.STRENGTH:
        return 'bg-blue-500 text-white';
      case WorkoutSectionType.COOLDOWN:
        return 'bg-cyan-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }

  getExerciseName(itemIndex: number): string {
    const items = this.itemsArray;
    const item = items.at(itemIndex) as FormGroup;
    const exerciseId = item.get('exerciseId')?.value;
    if (!exerciseId) return '';
    const exercise = this.exerciseMap().get(exerciseId);
    return exercise?.name || '';
  }

  getItemControl(itemIndex: number, controlName: string): FormControl {
    const items = this.itemsArray;
    const item = items.at(itemIndex) as FormGroup;
    return item.get(controlName) as FormControl;
  }

  // Event handlers
  onSectionTypeChange(type: string): void {
    this.section().get('type')?.setValue(type);
    this.sectionTypeChanged.emit(type as WorkoutSectionType);
  }

  onExerciseSelected(option: ComboboxOption): void {
    this.exerciseAdded.emit(option);
  }

  onRemoveItem(itemIndex: number): void {
    this.exerciseRemoved.emit(itemIndex);
  }

  onItemDrop(event: CdkDragDrop<AbstractControl[]>): void {
    const items = this.itemsArray;
    moveItemInArray(items.controls, event.previousIndex, event.currentIndex);
    this.itemsReordered.emit(event);
  }

  // Muscle filter methods
  addMuscleFilter(muscle: Muscle): void {
    this.muscleFilters.update(filters =>
      filters.includes(muscle) ? filters : [...filters, muscle]
    );
  }

  removeMuscleFilter(muscle: Muscle): void {
    this.muscleFilters.update(filters => filters.filter(m => m !== muscle));
  }

  onMuscleFilterSelected(option: ComboboxOption): void {
    this.addMuscleFilter(option.value as Muscle);
  }
}
