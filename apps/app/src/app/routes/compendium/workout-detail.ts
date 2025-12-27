import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WorkoutsStore } from '../../features/workouts/workouts.store';
import { ExercisesStore } from '../../features/exercises/exercises.store';
import { UserWorkoutsStore } from '../../features/user-workouts/user-workouts.store';
import { LoadingComponent } from '../../components/ui/feedback/loading.component';
import { ErrorLoadingComponent } from '../../components/ui/feedback/error-loading.component';
import { DetailPageHeaderComponent } from '../../components/ui/display/detail-page-header.component';
import { DetailFieldComponent } from '../../components/ui/display/detail-field.component';
import { ButtonComponent } from '../../components/ui/buttons/button.component';
import { ValueLabelPipe } from '../../shared/pipes/value-label.pipe';
import { ToastService } from '../../core/services/toast.service';
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
    ButtonComponent,
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
          [actionLink]="store.versionHistory().length > 1 ? ['/compendium/workouts', workout.templateId, 'versions'] : null"
          actionLabel="Version History"
        >
          <!-- Add to My Workouts action -->
          <ng-container header-actions>
            @if (userWorkoutsStore.isWorkoutAdded(workout.templateId)) {
              <div class="px-3 py-2 text-sm text-green-600 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Added
              </div>
            } @else {
              <app-button
                variant="outline-primary"
                (click)="addToMyWorkouts(workout)"
                [disabled]="userWorkoutsStore.isAdding()"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add to My Workouts
              </app-button>
            }
          </ng-container>
          <!-- Edit action (only for latest version) -->
          @if (isLatestVersion()) {
            <app-button header-primary-action variant="primary" [link]="['/compendium/workouts', workout.templateId, 'edit']">
              Edit Workout
            </app-button>
          }
        </app-detail-page-header>

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
  userWorkoutsStore = inject(UserWorkoutsStore);
  private exercisesStore = inject(ExercisesStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  readonly WorkoutSectionTypeLabels = WorkoutSectionTypeLabels;

  isLatestVersion = computed(() => {
    const workout = this.store.currentWorkout();
    const latest = this.store.latestVersion();
    if (!workout || !latest) return false;
    return latest.templateId === workout.templateId;
  });

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

  async addToMyWorkouts(workout: { templateId: string; name: string }): Promise<void> {
    const result = await this.userWorkoutsStore.addWorkout({
      workoutTemplateId: workout.templateId,
    });

    if (result) {
      this.router.navigate(['/user/workouts', result.id]);
    } else {
      this.toast.error(this.userWorkoutsStore.actionError() ?? 'Failed to add workout');
    }
  }
}
