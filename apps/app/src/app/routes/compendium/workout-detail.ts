import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WorkoutsStore } from '../../features/workouts/workouts.store';
import { ExercisesStore } from '../../features/exercises/exercises.store';
import { LoadingComponent } from '../../components/ui/feedback/loading.component';
import { ErrorLoadingComponent } from '../../components/ui/feedback/error-loading.component';
import { DetailPageHeaderComponent } from '../../components/ui/display/detail-page-header.component';
import { DetailFieldComponent } from '../../components/ui/display/detail-field.component';
import { ValueLabelPipe } from '../../shared/pipes/value-label.pipe';
import { WorkoutSectionType, WorkoutSectionTypeLabels } from '@resitr/api';

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
  selector: 'app-workout-detail',
  standalone: true,
  imports: [
    LoadingComponent,
    ErrorLoadingComponent,
    DetailPageHeaderComponent,
    DetailFieldComponent,
    ValueLabelPipe,
    RouterLink,
  ],
  template: `
    @if (store.isLoading()) {
      <app-loading message="Loading workout..." />
    } @else if (store.error()) {
      <app-error-loading title="Error loading workout" [message]="store.error()!" />
    } @else if (store.currentWorkout(); as workout) {
      <div class="max-w-4xl mx-auto space-y-6">
        <app-detail-page-header
          [title]="workout.name"
          subtitle="Workout Template"
          backLink="/compendium/workouts"
          [editLink]="['/compendium/workouts', workout.templateId, 'edit']"
          editLabel="Edit Workout"
        />

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          @if (workout.description) {
            <app-detail-field label="Description" [value]="workout.description" />
          }

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <app-detail-field
              label="Sections"
              [value]="workout.sections.length.toString()"
            />
            <app-detail-field
              label="Total Exercises"
              [value]="getTotalExercises(workout).toString()"
            />
            <app-detail-field
              label="Version"
              [value]="'v' + workout.version"
            />
          </div>
        </div>

        <!-- Sections -->
        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-gray-900">Sections</h2>

          @if (workout.sections.length === 0) {
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p class="text-gray-500 text-center">No sections in this workout</p>
            </div>
          } @else {
            @for (section of workout.sections; track section.id; let sectionIndex = $index) {
              <div
                class="rounded-lg border-2 overflow-hidden"
                [class]="getSectionBg(section.type) + ' ' + getSectionBorder(section.type)"
              >
                <!-- Section Header -->
                <div
                  class="flex items-center gap-3 p-4 border-b"
                  [class]="getSectionBorder(section.type)"
                >
                  <span class="text-xl">{{ getSectionIcon(section.type) }}</span>
                  <div class="flex-1">
                    <h3 class="font-semibold" [class]="getSectionTextColor(section.type)">
                      {{ section.name }}
                    </h3>
                    <p class="text-sm text-gray-500">
                      {{ section.type | valueLabel:WorkoutSectionTypeLabels }} · {{ section.items.length }} exercise{{ section.items.length !== 1 ? 's' : '' }}
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
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          }
        </div>

        <!-- Metadata -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Details</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500">Created:</span>
              <span class="ml-2 text-gray-900">{{ formatDate(workout.createdAt) }}</span>
            </div>
            @if (workout.updatedAt) {
              <div>
                <span class="text-gray-500">Updated:</span>
                <span class="ml-2 text-gray-900">{{ formatDate(workout.updatedAt) }}</span>
              </div>
            }
            <div>
              <span class="text-gray-500">Template ID:</span>
              <span class="ml-2 text-gray-900 font-mono text-xs">{{ workout.templateId }}</span>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class WorkoutDetail {
  store = inject(WorkoutsStore);
  private exercisesStore = inject(ExercisesStore);
  private route = inject(ActivatedRoute);

  readonly WorkoutSectionTypeLabels = WorkoutSectionTypeLabels;

  private exerciseMap = computed<Map<string, string>>(() => {
    const map = new Map<string, string>();
    this.exercisesStore.exercises().forEach(e => map.set(e.templateId, e.name));
    return map;
  });

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) => {
        const id = params.get('id');
        if (id) {
          this.store.loadWorkout(id);
        }
      });
  }

  getTotalExercises(workout: { sections: { items: unknown[] }[] }): number {
    return workout.sections.reduce((total, section) => total + section.items.length, 0);
  }

  getExerciseName(exerciseId: string): string {
    return this.exerciseMap().get(exerciseId) || exerciseId;
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
