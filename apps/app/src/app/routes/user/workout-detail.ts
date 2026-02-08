import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WorkoutSectionType, WorkoutSectionTypeLabels } from '@resitr/api';
import { UserWorkoutsStore } from '../../features/user-workouts/user-workouts.store';
import { ExercisesStore } from '../../features/exercises/exercises.store';
import { UserExerciseSchemesStore } from '../../features/user-exercise-schemes/user-exercise-schemes.store';
import { LoadingComponent } from '../../components/ui/feedback/loading.component';
import { ErrorLoadingComponent } from '../../components/ui/feedback/error-loading.component';
import { DetailPageHeaderComponent } from '../../components/ui/display/detail-page-header.component';
import { DetailFieldComponent } from '../../components/ui/display/detail-field.component';
import { ButtonComponent } from '../../components/ui/buttons/button.component';
import { ValueLabelPipe } from '../../shared/pipes/value-label.pipe';

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
  selector: 'app-user-workout-detail',
  standalone: true,
  imports: [
    LoadingComponent,
    ErrorLoadingComponent,
    DetailPageHeaderComponent,
    DetailFieldComponent,
    ButtonComponent,
    ValueLabelPipe,
    RouterLink,
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
        subtitle="My Workout"
        backLink="/user/workouts"
      >
        <ng-container header-actions>
          <app-button variant="outline-secondary" [link]="['/compendium/workouts', workout.workoutTemplateId]">
            View Template
          </app-button>
          <app-button variant="outline-primary" [link]="['/user', 'workouts', workout.id, 'run']">
            Start Workout
          </app-button>
        </ng-container>
        <app-button header-primary-action variant="primary" [link]="['/user/workouts', workout.id, 'edit']">
          Edit Schemes
        </app-button>
      </app-detail-page-header>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        @if (workout.workout?.description; as description) {
        <app-detail-field label="Description" [value]="description" />
        }

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <app-detail-field label="Sections" [value]="(workout.workout?.sections?.length ?? 0).toString()" />
          <app-detail-field label="Total Exercises" [value]="getTotalExercises(workout.workout).toString()" />
          <app-detail-field label="Template Version" [value]="'v' + (workout.workout?.version ?? '?')" />
        </div>
      </div>

      <!-- Sections -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-900">Sections</h2>

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

          <!-- Section Items -->
          <div class="p-4">
            @if (section.items.length === 0) {
            <p class="text-sm text-gray-400 text-center py-2">No exercises in this section</p>
            } @else {
            <div class="space-y-2">
              @for (item of section.items; track item.id; let itemIndex = $index) {
              <div class="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                <span class="text-sm font-medium text-gray-400 w-6">{{ itemIndex + 1 }}.</span>
                <div class="flex-1 min-w-0">
                  <a
                    [routerLink]="['/compendium/exercises', item.exerciseId]"
                    class="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {{ getExerciseName(item.exerciseId) }}
                  </a>
                </div>
                <div class="flex items-center gap-4 text-sm text-gray-500 flex-shrink-0">
                  <span title="Rest between sets">
                    <span class="font-medium">{{ item.breakBetweenSets }}s</span> rest
                  </span>
                  <span title="Break after exercise">
                    <span class="font-medium">{{ item.breakAfter }}s</span> after
                  </span>
                  <!-- Scheme status indicator - only show warning when unconfigured -->
                  @if (!isSchemeAssigned(item.id)) {
                  <span class="flex items-center gap-1 text-amber-500" title="Needs scheme setup">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </span>
                  }
                </div>
              </div>
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
    </div>
    } @else {
    <app-error-loading title="Workout not found" message="The requested workout could not be found." />
    }
  `,
})
export class UserWorkoutDetail {
  store = inject(UserWorkoutsStore);
  private exercisesStore = inject(ExercisesStore);
  private schemesStore = inject(UserExerciseSchemesStore);
  private route = inject(ActivatedRoute);
  private workoutId: string | null = null;

  readonly WorkoutSectionTypeLabels = WorkoutSectionTypeLabels;

  private exerciseMap = computed<Map<string, string>>(() => {
    const map = new Map<string, string>();
    this.exercisesStore.exercises().forEach((e) => map.set(e.templateId, e.name));
    return map;
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.workoutId = params.get('id');
    });
  }

  currentWorkout() {
    if (!this.workoutId) return null;
    return this.store.enrichedWorkouts().find((w) => w.id === this.workoutId) ?? null;
  }

  getTotalExercises(workout: { sections: { items: unknown[] }[] } | undefined | null): number {
    if (!workout) return 0;
    return workout.sections.reduce((total, section) => total + section.items.length, 0);
  }

  getExerciseName(exerciseId: string): string {
    return this.exerciseMap().get(exerciseId) || exerciseId;
  }

  isSchemeAssigned(sectionItemId: string): boolean {
    return !!this.schemesStore.getAssignedSchemeId()(sectionItemId);
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
}
