import { Component, input } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { WorkoutResponseDto } from '@resitr/api';
import { WorkoutSectionTypeLabels } from '@resitr/api';
import { CardComponent } from './card.component';
import { ValueLabelPipe } from '../../shared/pipes/value-label.pipe';

@Component({
  selector: 'app-workout-card',
  standalone: true,
  imports: [RouterLink, CardComponent, NgClass, CommonModule, ValueLabelPipe],
  template: `
    <a [routerLink]="['/compendium/workouts', workout().templateId]">
      <app-card>
        <div card-title>
          <h3 class="text-lg font-semibold text-gray-900">{{ workout().name }}</h3>
          @if (workout().description) {
            <p class="text-sm text-gray-500">{{ workout().description }}</p>
          }
        </div>

        <span
          card-badge
          class="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-700"
        >
          {{ workout().sections.length }} section{{ workout().sections.length !== 1 ? 's' : '' }}
        </span>

        <div card-content class="flex flex-wrap gap-1">
          @for (section of workout().sections; track section.id) {
            <span
              class="px-2 py-0.5 text-xs font-medium rounded"
              [ngClass]="{
                'bg-orange-100 text-orange-700': section.type === 'warmup',
                'bg-blue-100 text-blue-700': section.type === 'stretching',
                'bg-red-100 text-red-700': section.type === 'strength',
                'bg-green-100 text-green-700': section.type === 'cooldown'
              }"
            >
              {{ section.type | valueLabel : WorkoutSectionTypeLabels }}
            </span>
          }
        </div>

        <ng-container card-footer-left>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span>{{ getTotalItems() }} exercise{{ getTotalItems() !== 1 ? 's' : '' }}</span>
        </ng-container>

        <span card-footer-right class="text-xs">
          v{{ workout().version }}
        </span>
      </app-card>
    </a>
  `,
})
export class WorkoutCardComponent {
  workout = input.required<WorkoutResponseDto>();

  // Make label records available in template
  readonly WorkoutSectionTypeLabels = WorkoutSectionTypeLabels;

  getTotalItems(): number {
    return this.workout().sections.reduce((total, section) => {
      return total + section.items.length;
    }, 0);
  }
}
