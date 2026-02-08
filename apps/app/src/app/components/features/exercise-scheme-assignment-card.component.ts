import { Component, inject, input, output, signal, computed, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import type {
  WorkoutSectionItemTemplate,
  CreateUserExerciseSchemeDto,
  UserExerciseSchemeResponseDto,
  MeasurementParadigm,
} from '@resitr/api';
import { UserExerciseSchemesStore } from '../../features/user-exercise-schemes/user-exercise-schemes.store';
import { InlineExerciseSchemeFormComponent, ExerciseSchemeFormData } from './inline-exercise-scheme-form.component';

const NEW_SCHEME_VALUE = '__NEW__';
const NOT_SELECTED_VALUE = '';

interface SchemeOption {
  value: string;
  label: string;
  sublabel: string;
  scheme: UserExerciseSchemeResponseDto | null;
}

@Component({
  selector: 'app-exercise-scheme-assignment-card',
  standalone: true,
  imports: [RouterLink, InlineExerciseSchemeFormComponent],
  template: `
    <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <!-- Header with exercise name and status -->
      <div class="flex items-center justify-between p-4 border-b border-gray-100">
        <div class="flex items-center gap-3 min-w-0">
          <span class="text-sm font-medium text-gray-400 w-6 flex-shrink-0">{{ itemIndex() + 1 }}.</span>
          <div class="min-w-0">
            <a
              [routerLink]="['/compendium/exercises', sectionItem().exerciseId]"
              class="font-medium text-blue-600 hover:text-blue-800 hover:underline truncate block"
            >
              {{ exerciseName() }}
            </a>
          </div>
        </div>

        <!-- Status indicator -->
        <div class="flex-shrink-0 ml-2">
          @if (isSaving()) {
          <svg class="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          } @else if (showSuccess()) {
          <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          } @else if (error()) {
          <div class="flex items-center gap-1">
            <svg class="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span class="text-xs text-red-600">{{ error() }}</span>
          </div>
          } @else if (hasPendingChange()) {
          <span class="flex items-center gap-1 text-amber-500" title="Unsaved change">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
          } @else if (isAssigned()) {
          <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          } @else if (needsConfiguration()) {
          <span class="flex items-center gap-1 text-gray-400" title="Needs configuration">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
          }
        </div>
      </div>

      <!-- Scheme selection -->
      <div class="p-4">
        @if (isLoading()) {
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading schemes...
        </div>
        } @else {
        <div class="space-y-3">
          <label class="block text-sm font-medium text-gray-700">Exercise Scheme</label>

          <select
            [value]="selectedValue()"
            (change)="onSchemeChange($event)"
            [disabled]="isSaving()"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            @for (option of schemeOptions(); track option.value) {
            <option [value]="option.value">{{ option.label }}@if (option.sublabel) { - {{ option.sublabel }}}</option>
            }
          </select>

          <!-- Show selected scheme details -->
          @if (selectedOption(); as selected) { @if (selected.scheme) {
          <div class="text-xs text-gray-500 flex gap-4">
            <span>{{ selected.scheme.sets }} sets</span>
            <span>{{ selected.scheme.reps }} reps</span>
            <span>{{ selected.scheme.restBetweenSets }}s rest</span>
            @if (selected.scheme.weight) {
            <span>{{ selected.scheme.weight }}kg</span>
            }
          </div>
          } }
        </div>

        <!-- Inline form for new scheme -->
        @if (showNewSchemeForm()) {
        <div class="mt-4">
          <app-inline-exercise-scheme-form
            [isSaving]="isSaving()"
            [suggestedMeasurementParadigms]="suggestedMeasurementParadigms()"
            (formSubmit)="onCreateScheme($event)"
            (formCancel)="onCancelNewScheme()"
          />
        </div>
        } }
      </div>
    </div>
  `,
})
export class ExerciseSchemeAssignmentCardComponent {
  private store = inject(UserExerciseSchemesStore);

  sectionItem = input.required<WorkoutSectionItemTemplate>();
  userWorkoutId = input.required<string>();
  exerciseName = input.required<string>();
  suggestedMeasurementParadigms = input<MeasurementParadigm[]>([]);
  itemIndex = input<number>(0);
  deferAssignment = input<boolean>(false);

  schemeSelected = output<{ sectionItemId: string; schemeId: string }>();

  showNewSchemeForm = signal(false);
  showSuccess = signal(false);
  hasPendingChange = signal(false);
  private selectedSchemeId = signal<string | null>(null);
  private initialized = signal(false);

  // Computed states from store
  isLoading = computed(() => this.store.isLoadingExercise()(this.sectionItem().exerciseId));
  isSaving = computed(() => this.store.isSavingSectionItem()(this.sectionItem().id));
  isAssigned = computed(() => !!this.store.getAssignedSchemeId()(this.sectionItem().id));
  error = computed(() => this.store.getErrorForSectionItem()(this.sectionItem().id));

  schemes = computed(() => this.store.getSchemesForExercise()(this.sectionItem().exerciseId));

  schemeOptions = computed<SchemeOption[]>(() => {
    const schemes = this.schemes();
    const options: SchemeOption[] = [];

    // Add placeholder when in deferred mode and nothing is assigned yet
    if (this.deferAssignment() && !this.isAssigned()) {
      options.push({
        value: NOT_SELECTED_VALUE,
        label: '-- Select a scheme --',
        sublabel: '',
        scheme: null,
      });
    }

    // Add existing schemes
    options.push(
      ...schemes.map((scheme) => ({
        value: scheme.id,
        label: scheme.name,
        sublabel: `${scheme.sets}x${scheme.reps}`,
        scheme,
      }))
    );

    // Add "Create New" option at the end
    options.push({
      value: NEW_SCHEME_VALUE,
      label: '+ Create New Scheme',
      sublabel: '',
      scheme: null,
    });

    return options;
  });

  selectedValue = computed(() => {
    const id = this.selectedSchemeId();
    if (id !== null) return id;

    // Default to placeholder if nothing selected yet
    return NOT_SELECTED_VALUE;
  });

  // Whether a scheme needs to be configured (nothing selected and nothing assigned)
  needsConfiguration = computed(() => {
    return this.selectedValue() === NOT_SELECTED_VALUE && !this.isAssigned();
  });

  selectedOption = computed(() => {
    const value = this.selectedValue();
    return this.schemeOptions().find((o) => o.value === value) ?? null;
  });

  constructor() {
    // Load schemes for this exercise on init
    effect(() => {
      const exerciseId = this.sectionItem().exerciseId;
      this.store.loadSchemesForExercise(exerciseId);
    });

    // Auto-initialize selection and show form if needed
    effect(() => {
      const schemes = this.schemes();
      const isLoading = this.isLoading();
      const deferred = this.deferAssignment();

      if (!isLoading && !this.initialized()) {
        this.initialized.set(true);

        // Auto-select first scheme or show new form
        if (schemes.length > 0) {
          this.selectedSchemeId.set(schemes[0].id);

          // In deferred mode, emit the selection as a pending change
          if (deferred) {
            this.hasPendingChange.set(true);
            this.schemeSelected.emit({
              sectionItemId: this.sectionItem().id,
              schemeId: schemes[0].id,
            });
          }
        } else {
          this.selectedSchemeId.set(NEW_SCHEME_VALUE);
          this.showNewSchemeForm.set(true);
        }
      }
    });
  }

  onSchemeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;

    this.selectedSchemeId.set(value);

    if (value === NOT_SELECTED_VALUE) {
      // User selected placeholder - nothing to do
      this.showNewSchemeForm.set(false);
      this.hasPendingChange.set(false);
    } else if (value === NEW_SCHEME_VALUE) {
      this.showNewSchemeForm.set(true);
      this.hasPendingChange.set(false);
    } else {
      this.showNewSchemeForm.set(false);
      if (this.deferAssignment()) {
        // In deferred mode, just emit the selection and mark as pending
        this.hasPendingChange.set(true);
        this.schemeSelected.emit({
          sectionItemId: this.sectionItem().id,
          schemeId: value,
        });
      } else {
        // Immediate mode - save right away
        this.assignScheme(value);
      }
    }
  }

  async assignScheme(schemeId: string): Promise<void> {
    const success = await this.store.assignSchemeToSectionItem(schemeId, this.sectionItem().id, this.userWorkoutId());

    if (success) {
      this.showSuccessIndicator();
    }
  }

  async onCreateScheme(formData: ExerciseSchemeFormData): Promise<void> {
    const data: CreateUserExerciseSchemeDto = {
      ...formData,
      exerciseId: this.sectionItem().exerciseId,
    };

    const success = await this.store.createAndAssignScheme(data, this.sectionItem().id, this.userWorkoutId());

    if (success) {
      this.showNewSchemeForm.set(false);
      // Update selection to the newly created scheme
      const schemes = this.schemes();
      if (schemes.length > 0) {
        this.selectedSchemeId.set(schemes[schemes.length - 1].id);
      }
      this.showSuccessIndicator();
    }
  }

  onCancelNewScheme(): void {
    this.showNewSchemeForm.set(false);
    // If there are existing schemes, select the first one
    const schemes = this.schemes();
    if (schemes.length > 0) {
      this.selectedSchemeId.set(schemes[0].id);
    }
  }

  private showSuccessIndicator(): void {
    this.showSuccess.set(true);
    setTimeout(() => this.showSuccess.set(false), 2000);
  }

  clearPendingState(): void {
    this.hasPendingChange.set(false);
  }
}
