import { Component, inject, computed, signal, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WorkoutSectionType, WorkoutSectionTypeLabels, MeasurementParadigm } from '@resitr/api';
import { UserWorkoutsStore } from '../../features/user-workouts/user-workouts.store';
import { ExercisesStore } from '../../features/exercises/exercises.store';
import { UserExerciseSchemesStore } from '../../features/user-exercise-schemes/user-exercise-schemes.store';
import { LoadingComponent } from '../../components/ui/feedback/loading.component';
import { ErrorLoadingComponent } from '../../components/ui/feedback/error-loading.component';
import { DetailPageHeaderComponent } from '../../components/ui/display/detail-page-header.component';
import { ButtonComponent } from '../../components/ui/buttons/button.component';
import { ValueLabelPipe } from '../../shared/pipes/value-label.pipe';
import { ExerciseSchemeAssignmentCardComponent } from '../../components/features/exercise-scheme-assignment-card.component';
import { ToastService } from '../../core/services/toast.service';

interface SectionConfig {
  icon: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

const SECTION_STYLES: Record<WorkoutSectionType, SectionConfig> = {
  [WorkoutSectionType.WARMUP]: {
    icon: '🔥',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
  },
  [WorkoutSectionType.STRETCHING]: {
    icon: '🧘',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
  },
  [WorkoutSectionType.STRENGTH]: {
    icon: '💪',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
  },
  [WorkoutSectionType.COOLDOWN]: {
    icon: '❄️',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    textColor: 'text-cyan-800',
  },
};

@Component({
  selector: 'app-user-workout-edit',
  standalone: true,
  imports: [
    LoadingComponent,
    ErrorLoadingComponent,
    DetailPageHeaderComponent,
    ButtonComponent,
    ValueLabelPipe,
    ExerciseSchemeAssignmentCardComponent,
  ],
  template: `
    @if (store.isLoading()) {
    <app-loading message="Loading workout..." />
    } @else if (store.error()) {
    <app-error-loading title="Error loading workout" [message]="store.error()!" />
    } @else if (currentWorkout(); as workout) {
    <div class="max-w-4xl mx-auto space-y-6">
      <app-detail-page-header
        [title]="workout.workout?.name || 'Workout'"
        subtitle="Edit Exercise Schemes"
        [backLink]="'/user/workouts/' + workout.id"
      >
        <app-button
          header-primary-action
          variant="outline-secondary"
          [link]="['/compendium/workouts', workout.workoutTemplateId]"
        >
          View Template
        </app-button>
      </app-detail-page-header>

      <!-- Workout description -->
      @if (workout.workout?.description; as description) {
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p class="text-gray-600">{{ description }}</p>
      </div>
      }

      <!-- Configure Exercise Schemes -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Configure Exercise Schemes</h2>
          <p class="text-sm text-gray-500">Set up how you want to perform each exercise</p>
        </div>

        @if (workout.workout?.sections; as sections) { @if (sections.length === 0) {
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p class="text-gray-500 text-center">No sections in this workout</p>
        </div>
        } @else { @for (section of sections; track section.id) {
        <div
          class="rounded-lg border-2 overflow-hidden"
          [class]="getSectionBg(section.type) + ' ' + getSectionBorder(section.type)"
        >
          <!-- Section Header -->
          <div class="flex items-center gap-3 p-4 border-b" [class]="getSectionBorder(section.type)">
            <span class="text-xl">{{ getSectionIcon(section.type) }}</span>
            <div class="flex-1">
              <h3 class="font-semibold" [class]="getSectionTextColor(section.type)">
                {{ section.name }}
              </h3>
              <p class="text-sm text-gray-500">
                {{ section.type | valueLabel : WorkoutSectionTypeLabels }} · {{ section.items.length }} exercise{{
                  section.items.length !== 1 ? 's' : ''
                }}
              </p>
            </div>
          </div>

          <!-- Section Items with Exercise Scheme Cards -->
          <div class="p-4">
            @if (section.items.length === 0) {
            <p class="text-sm text-gray-400 text-center py-2">No exercises in this section</p>
            } @else {
            <div class="space-y-3">
              @for (item of section.items; track item.id; let itemIndex = $index) {
              <app-exercise-scheme-assignment-card
                [sectionItem]="item"
                [userWorkoutId]="workout.id"
                [exerciseName]="getExerciseName(item.exerciseId)"
                [suggestedMeasurementParadigms]="getSuggestedParadigms(item.exerciseId)"
                [itemIndex]="itemIndex"
                [deferAssignment]="true"
                (schemeSelected)="onSchemeSelected($event)"
              />
              }
            </div>
            }
          </div>
        </div>
        } } } @else {
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p class="text-gray-500 text-center">Loading workout template...</p>
        </div>
        }
      </div>

      <!-- Metadata -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Details</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-500">Added to My Workouts:</span>
            <span class="ml-2 text-gray-900">{{ formatDate(workout.createdAt) }}</span>
          </div>
          <div>
            <span class="text-gray-500">Template ID:</span>
            <span class="ml-2 text-gray-900 font-mono text-xs">{{ workout.workoutTemplateId }}</span>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      @if (hasUnsavedChanges()) {
      <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg -mx-4 sm:mx-0 sm:rounded-lg">
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-600">
            {{ pendingAssignments().size }} unsaved change{{ pendingAssignments().size !== 1 ? 's' : '' }}
          </p>
          <app-button variant="primary" (click)="saveAssignments()" [disabled]="isSaving()">
            @if (isSaving()) { Saving... } @else { Save Changes }
          </app-button>
        </div>
      </div>
      }
    </div>
    } @else {
    <app-error-loading title="Workout not found" message="The requested workout could not be found." />
    }
  `,
})
export class UserWorkoutEdit {
  store = inject(UserWorkoutsStore);
  private exercisesStore = inject(ExercisesStore);
  private schemesStore = inject(UserExerciseSchemesStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  private workoutId: string | null = null;

  readonly WorkoutSectionTypeLabels = WorkoutSectionTypeLabels;

  // Pending assignments: sectionItemId -> schemeId
  pendingAssignments = signal<Map<string, string>>(new Map());
  hasUnsavedChanges = computed(() => this.pendingAssignments().size > 0);
  isSaving = signal(false);

  private exerciseDataMap = computed(() => {
    const map = new Map<string, { name: string; suggestedMeasurementParadigms: MeasurementParadigm[] }>();
    this.exercisesStore.exercises().forEach((e) =>
      map.set(e.templateId, {
        name: e.name,
        suggestedMeasurementParadigms: e.suggestedMeasurementParadigms ?? [],
      })
    );
    return map;
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.workoutId = params.get('id');
    });

    // Load assignments when workout data is available
    effect(() => {
      const workout = this.currentWorkout();
      if (workout?.id) {
        this.schemesStore.loadAssignmentsForWorkout(workout.id);
      }
    });
  }

  currentWorkout() {
    if (!this.workoutId) return null;
    return this.store.enrichedWorkouts().find((w) => w.id === this.workoutId) ?? null;
  }

  getExerciseName(exerciseId: string): string {
    return this.exerciseDataMap().get(exerciseId)?.name || exerciseId;
  }

  getSuggestedParadigms(exerciseId: string): MeasurementParadigm[] {
    return this.exerciseDataMap().get(exerciseId)?.suggestedMeasurementParadigms || [];
  }

  getSectionIcon(type: WorkoutSectionType): string {
    return SECTION_STYLES[type]?.icon || '📋';
  }

  getSectionBg(type: WorkoutSectionType): string {
    return SECTION_STYLES[type]?.bgColor || 'bg-gray-50';
  }

  getSectionBorder(type: WorkoutSectionType): string {
    return SECTION_STYLES[type]?.borderColor || 'border-gray-200';
  }

  getSectionTextColor(type: WorkoutSectionType): string {
    return SECTION_STYLES[type]?.textColor || 'text-gray-800';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  onSchemeSelected(event: { sectionItemId: string; schemeId: string }): void {
    const current = this.pendingAssignments();
    const updated = new Map(current);
    updated.set(event.sectionItemId, event.schemeId);
    this.pendingAssignments.set(updated);
  }

  async saveAssignments(): Promise<void> {
    const workout = this.currentWorkout();
    if (!workout) return;

    const pending = this.pendingAssignments();
    if (pending.size === 0) return;

    this.isSaving.set(true);

    try {
      const entries = Array.from(pending.entries());
      let successCount = 0;

      for (const [sectionItemId, schemeId] of entries) {
        const success = await this.schemesStore.assignSchemeToSectionItem(schemeId, sectionItemId, workout.id);
        if (success) {
          successCount++;
        }
      }

      if (successCount === entries.length) {
        this.toast.success('All exercise schemes saved successfully');
        this.pendingAssignments.set(new Map());
        this.router.navigate(['/user/workouts', workout.id]);
      } else {
        this.toast.error(`Saved ${successCount} of ${entries.length} assignments. Some failed.`);
      }
    } finally {
      this.isSaving.set(false);
    }
  }
}
