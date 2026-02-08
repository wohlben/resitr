import { Component, inject, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import {
  WorkoutSectionType,
  WorkoutSectionTypeLabels,
  UpsertWorkoutLogDto,
  UserExerciseSchemeResponseDto,
} from '@resitr/api';
import { UserWorkoutsStore } from '../../features/user-workouts/user-workouts.store';
import { ExercisesStore } from '../../features/exercises/exercises.store';
import { LoadingComponent } from '../../components/ui/feedback/loading.component';
import { ErrorLoadingComponent } from '../../components/ui/feedback/error-loading.component';
import { DetailPageHeaderComponent } from '../../components/ui/display/detail-page-header.component';
import { ButtonComponent } from '../../components/ui/buttons/button.component';
import { ExercisePlanCardComponent, ExercisePlanItem } from '../../components/features/exercise-plan-card.component';
import { SetTarget } from '../../components/features/set-goal-row.component';
import { UserQueries } from '../../core/user/user-queries';
import { UserMutations } from '../../core/user/user-mutations';
import { ToastService } from '../../core/services/toast.service';
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

interface WorkoutPlan {
  sections: Array<{
    id: string;
    name: string;
    type: WorkoutSectionType;
    items: ExercisePlanItem[];
  }>;
}

@Component({
  selector: 'app-workout-run',
  standalone: true,
  imports: [
    LoadingComponent,
    ErrorLoadingComponent,
    DetailPageHeaderComponent,
    ButtonComponent,
    ExercisePlanCardComponent,
    ValueLabelPipe,
  ],
  template: `
    @if (isLoading()) {
    <app-loading message="Loading workout plan..." />
    } @else if (error()) {
    <app-error-loading title="Error loading workout" [message]="error()!" />
    } @else if (workout(); as currentWorkout) {
    <div class="max-w-4xl mx-auto space-y-6">
      <app-detail-page-header
        [title]="currentWorkout.workout?.name || 'Workout'"
        subtitle="Plan Your Workout"
        [backLink]="'/user/workouts/' + currentWorkout.id"
      >
        <app-button header-primary-action variant="primary" (click)="startWorkout()" [disabled]="isStarting()">
          @if (isStarting()) { Starting... } @else { Start Workout }
        </app-button>
      </app-detail-page-header>

      @if (currentWorkout.workout?.description; as description) {
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p class="text-gray-600">{{ description }}</p>
      </div>
      }

      <!-- Plan Sections -->
      <div class="space-y-6">
        @for (section of plan()?.sections; track section.id) {
        <div
          class="rounded-lg border-2 overflow-hidden"
          [class]="getSectionBg(section.type) + ' ' + getSectionBorder(section.type)"
        >
          <!-- Section Header -->
          <div class="flex items-center gap-3 p-4 border-b" [class]="getSectionBorder(section.type)">
            <span class="text-xl">{{ getSectionIcon(section.type) }}</span>
            <div class="flex-1">
              <h3 class="font-semibold" [class]="getSectionTextColor(section.type)">{{ section.name }}</h3>
              <p class="text-sm text-gray-500">
                {{ section.type | valueLabel : WorkoutSectionTypeLabels }} · {{ section.items.length }} exercise{{
                  section.items.length !== 1 ? 's' : ''
                }}
              </p>
            </div>
          </div>

          <!-- Section Items -->
          <div class="p-4 space-y-4">
            @if (section.items.length === 0) {
            <p class="text-sm text-gray-400 text-center py-2">No exercises in this section</p>
            } @else { @for (item of section.items; track item.sectionItemId) {
            <app-exercise-plan-card [item]="item" (itemChange)="onItemChange(section.id, item.sectionItemId, $event)" />
            } }
          </div>
        </div>
        }
      </div>

      <!-- Bottom Start Button -->
      <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg -mx-4 sm:mx-0 sm:rounded-lg">
        <app-button variant="primary" size="md" class="w-full" (click)="startWorkout()" [disabled]="isStarting()">
          @if (isStarting()) { Starting Workout... } @else { Start Workout }
        </app-button>
      </div>
    </div>
    } @else {
    <app-error-loading title="Workout not found" message="The requested workout could not be found." />
    }
  `,
})
export class WorkoutRunComponent {
  private workoutsStore = inject(UserWorkoutsStore);
  private exercisesStore = inject(ExercisesStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  private workoutId: string | null = null;

  readonly WorkoutSectionTypeLabels = WorkoutSectionTypeLabels;

  isLoading = signal(true);
  error = signal<string | null>(null);
  isStarting = signal(false);
  plan = signal<WorkoutPlan | null>(null);

  workout = computed(() => {
    if (!this.workoutId) return null;
    return this.workoutsStore.enrichedWorkouts().find((w) => w.id === this.workoutId) ?? null;
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.workoutId = params.get('id');
    });

    // Load plan when workout data is available (handles refresh case)
    effect(() => {
      const currentWorkout = this.workout();
      if (currentWorkout && this.workoutId) {
        this.loadWorkoutPlan();
      }
    });
  }

  async loadWorkoutPlan(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const currentWorkout = this.workout();
      if (!currentWorkout) {
        this.error.set('Workout not found');
        this.isLoading.set(false);
        return;
      }

      // Load schemes for this workout
      const schemeResults = await UserQueries.exerciseScheme.byWorkout(this.workoutId!).fn(this.http);

      // Create a map of sectionItemId -> scheme
      const schemeMap = new Map<string, UserExerciseSchemeResponseDto>();
      schemeResults.forEach((result) => {
        schemeMap.set(result.sectionItemId, result.scheme);
      });

      // Build the plan
      const planSections =
        currentWorkout.workout?.sections.map((section) => {
          const items: ExercisePlanItem[] = section.items.map((item) => {
            const scheme = schemeMap.get(item.id);
            const exercise = this.exercisesStore.exercises().find((e) => e.templateId === item.exerciseId);

            // Build default targets from scheme
            const defaultTarget: SetTarget = {
              targetReps: scheme?.reps,
              targetWeight: scheme?.weight,
              targetTime: scheme?.targetTime ?? scheme?.duration,
              targetDistance: scheme?.distance,
            };

            return {
              sectionItemId: item.id,
              exerciseId: item.exerciseId,
              exerciseName: exercise?.name || 'Unknown Exercise',
              scheme: scheme!, // We assume schemes are assigned
              isLocked: true, // Default to synced mode
              sets: Array(scheme?.sets || 1)
                .fill(null)
                .map(() => ({ ...defaultTarget })),
              restBetweenSets: item.breakBetweenSets,
              breakAfter: item.breakAfter,
            };
          });

          return {
            id: section.id,
            name: section.name,
            type: section.type,
            items,
          };
        }) || [];

      this.plan.set({ sections: planSections });
      this.isLoading.set(false);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load workout plan');
      this.isLoading.set(false);
    }
  }

  onItemChange(sectionId: string, sectionItemId: string, updatedItem: ExercisePlanItem): void {
    const currentPlan = this.plan();
    if (!currentPlan) return;

    const newSections = currentPlan.sections.map((section) => {
      if (section.id !== sectionId) return section;

      return {
        ...section,
        items: section.items.map((item) => (item.sectionItemId === sectionItemId ? updatedItem : item)),
      };
    });

    this.plan.set({ sections: newSections });
  }

  async startWorkout(): Promise<void> {
    const currentWorkout = this.workout();
    const currentPlan = this.plan();

    if (!currentWorkout || !currentPlan) return;

    this.isStarting.set(true);

    try {
      // Build the workout log DTO
      const workoutLogDto: UpsertWorkoutLogDto = {
        originalWorkoutId: currentWorkout.workoutTemplateId,
        name: currentWorkout.workout?.name || 'Workout',
        startedAt: new Date(),
        sections: currentPlan.sections.map((section) => ({
          name: section.name,
          type: section.type,
          items: section.items.map((item) => ({
            exerciseId: item.exerciseId,
            name: item.exerciseName,
            restBetweenSets: item.restBetweenSets,
            breakAfter: item.breakAfter,
            sets: item.sets.map((set) => {
              const setDto: {
                targetReps?: number;
                targetWeight?: number;
                targetTime?: number;
                targetDistance?: number;
              } = {};
              if (set.targetReps !== undefined) setDto.targetReps = set.targetReps;
              if (set.targetWeight !== undefined) setDto.targetWeight = set.targetWeight;
              if (set.targetTime !== undefined) setDto.targetTime = set.targetTime;
              if (set.targetDistance !== undefined) setDto.targetDistance = set.targetDistance;
              return setDto;
            }),
          })),
        })),
      };

      const result = await UserMutations.workoutLog.upsert(this.http, workoutLogDto);

      this.toast.success('Workout started successfully!');
      this.router.navigate(['/user/workout-logs', result.id]);
    } catch (err) {
      this.toast.error(err instanceof Error ? err.message : 'Failed to start workout');
      this.isStarting.set(false);
    }
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
}
