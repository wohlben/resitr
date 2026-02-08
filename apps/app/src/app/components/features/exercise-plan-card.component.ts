import { Component, input, output, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserExerciseSchemeResponseDto, MeasurementTypeLabels } from '@resitr/api';
import { SetGoalRowComponent, SetTarget } from './set-goal-row.component';

export interface ExercisePlanItem {
  sectionItemId: string;
  exerciseId: string;
  exerciseName: string;
  scheme: UserExerciseSchemeResponseDto;
  isLocked: boolean;
  sets: SetTarget[];
  restBetweenSets: number;
  breakAfter: number;
}

@Component({
  selector: 'app-exercise-plan-card',
  standalone: true,
  imports: [FormsModule, SetGoalRowComponent],
  template: `
    <div class="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <h4 class="font-medium text-gray-900 truncate">{{ item().exerciseName }}</h4>
          <p class="text-sm text-gray-500">
            {{ item().scheme.sets }} sets · {{ MeasurementTypeLabels[item().scheme.measurementType] }}
          </p>
        </div>
        <button
          type="button"
          (click)="toggleLock()"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          [title]="item().isLocked ? 'Unlock to edit sets individually' : 'Lock to sync all sets'"
        >
          <span class="text-lg">{{ item().isLocked ? '🔒' : '🔓' }}</span>
        </button>
      </div>

      <!-- Column headers -->
      <div class="flex items-center gap-2 pb-2 border-b border-gray-100">
        <span class="text-sm font-medium text-gray-500 w-12"></span>
        <div class="flex-1 grid grid-cols-4 gap-2 text-xs text-gray-400">
          <span>Reps</span>
          <span>Weight</span>
          <span>Time (s)</span>
          <span>Distance</span>
        </div>
      </div>

      <!-- Synced view (locked) -->
      @if (item().isLocked) {
      <div class="py-2">
        <app-set-goal-row [setNumber]="1" [target]="syncedTarget()" (targetChange)="onSyncedTargetChange($event)" />
        <p class="text-xs text-gray-400 mt-1">Changes apply to all {{ item().scheme.sets }} sets</p>
      </div>
      } @else {
      <!-- Individual view (unlocked) -->
      <div class="space-y-1">
        @for (target of item().sets; track $index; let i = $index) {
        <app-set-goal-row [setNumber]="i + 1" [target]="target" (targetChange)="onIndividualTargetChange(i, $event)" />
        }
      </div>
      }

      <!-- Rest info -->
      <div class="flex items-center gap-4 text-sm text-gray-500 pt-2 border-t border-gray-100">
        <span
          >Rest between sets: <strong>{{ item().restBetweenSets }}s</strong></span
        >
        <span
          >Break after: <strong>{{ item().breakAfter }}s</strong></span
        >
      </div>
    </div>
  `,
})
export class ExercisePlanCardComponent {
  item = input.required<ExercisePlanItem>();
  itemChange = output<ExercisePlanItem>();

  readonly MeasurementTypeLabels = MeasurementTypeLabels;

  syncedTarget = computed<SetTarget>(() => {
    const item = this.item();
    if (item.sets.length > 0) {
      return { ...item.sets[0] };
    }
    return {};
  });

  toggleLock(): void {
    const item = this.item();
    const newIsLocked = !item.isLocked;

    if (newIsLocked) {
      // Locking: sync all sets to the first set's values
      const firstSet = item.sets[0] || {};
      const syncedSets = Array(item.scheme.sets)
        .fill(null)
        .map(() => ({ ...firstSet }));

      this.itemChange.emit({
        ...item,
        isLocked: newIsLocked,
        sets: syncedSets,
      });
    } else {
      // Unlocking: just change the flag
      this.itemChange.emit({
        ...item,
        isLocked: newIsLocked,
      });
    }
  }

  onSyncedTargetChange(newTarget: SetTarget): void {
    const item = this.item();
    const syncedSets = Array(item.scheme.sets)
      .fill(null)
      .map(() => ({ ...newTarget }));

    this.itemChange.emit({
      ...item,
      sets: syncedSets,
    });
  }

  onIndividualTargetChange(index: number, newTarget: SetTarget): void {
    const item = this.item();
    const newSets = [...item.sets];
    newSets[index] = newTarget;

    this.itemChange.emit({
      ...item,
      sets: newSets,
    });
  }
}
