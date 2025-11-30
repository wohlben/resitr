import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { ExerciseResponseDto } from '@resitr/api';
import { MuscleLabels, ExerciseTypeLabels, TechnicalDifficultyLabels } from '@resitr/api';
import { ValueLabelPipe } from '../../../shared/pipes/value-label.pipe';
import { CardComponent } from './card.component';

@Component({
  selector: 'app-exercise-card',
  standalone: true,
  imports: [RouterLink, ValueLabelPipe, CardComponent, NgClass],
  template: `
    <a [routerLink]="['/compendium/exercises', exercise().templateId]">
      <app-card>
        <!-- Title -->
        <div card-title>
          <h3 class="text-lg font-semibold text-gray-900">{{ exercise().name }}</h3>
          @if (exercise().alternativeNames && !!exercise().alternativeNames?.length) {
          <p class="text-sm text-gray-500">{{ exercise().alternativeNames!.join(', ') }}</p>
          }
        </div>

        <!-- Badge -->
        <span
          card-badge
          class="px-2 py-1 text-xs font-medium rounded"
          [ngClass]="{
            'bg-red-100 text-red-700': exercise().type === 'STRENGTH',
            'bg-green-100 text-green-700': exercise().type === 'CARDIO',
            'bg-purple-100 text-purple-700': exercise().type === 'STRETCHING'
          }"
        >
          {{ exercise().type | valueLabel : ExerciseTypeLabels }}
        </span>

        <!-- Content: Muscles -->
        <div card-content class="flex flex-wrap gap-1">
          @for (muscle of exercise().primaryMuscles; track muscle) {
          <span class="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
            {{ muscle | valueLabel : MuscleLabels }}
          </span>
          } @for (muscle of exercise().secondaryMuscles; track muscle) {
          <span class="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
            {{ muscle | valueLabel : MuscleLabels }}
          </span>
          }
        </div>

        <!-- Footer Left: Equipment -->
        <ng-container card-footer-left>
          @if (exercise().equipmentIds && exercise().equipmentIds.length > 0) {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            <span>{{ exercise().equipmentIds.length }} equipment</span>
          } @else {
            <span>Bodyweight</span>
          }
        </ng-container>

        <!-- Footer Right: Difficulty -->
        <span card-footer-right class="text-xs">
          {{ exercise().technicalDifficulty | valueLabel : TechnicalDifficultyLabels }}
        </span>
      </app-card>
    </a>
  `,
})
export class ExerciseCardComponent {
  exercise = input.required<ExerciseResponseDto>();

  // Make label records available in template
  readonly MuscleLabels = MuscleLabels;
  readonly ExerciseTypeLabels = ExerciseTypeLabels;
  readonly TechnicalDifficultyLabels = TechnicalDifficultyLabels;
}
