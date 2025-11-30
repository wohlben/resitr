import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ExerciseGroupResponseDto } from '@resitr/api';
import { CardComponent } from './card.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-exercise-group-card',
  standalone: true,
  imports: [RouterLink, CardComponent, DatePipe],
  template: `
    <a [routerLink]="['/compendium/exercise-groups', exerciseGroup().id]">
      <app-card>
        <!-- Title -->
        <div card-title>
          <h3 class="text-lg font-semibold text-gray-900">{{ exerciseGroup().name }}</h3>
        </div>

        <!-- Badge -->
        <span
          card-badge
          class="px-2 py-1 text-xs font-medium rounded bg-indigo-100 text-indigo-700"
        >
          Group
        </span>

        <!-- Content: Description -->
        <div card-content>
          @if (exerciseGroup().description) {
            <p class="text-sm text-gray-600 line-clamp-2">{{ exerciseGroup().description }}</p>
          } @else {
            <p class="text-sm text-gray-400 italic">No description available</p>
          }
        </div>

        <!-- Footer Left: Created info -->
        <ng-container card-footer-left>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{{ exerciseGroup().createdAt | date:'mediumDate' }}</span>
        </ng-container>

        <!-- Footer Right: Group ID -->
        <span card-footer-right class="text-xs text-gray-500">
          {{ exerciseGroup().id }}
        </span>
      </app-card>
    </a>
  `,
})
export class ExerciseGroupCardComponent {
  exerciseGroup = input.required<ExerciseGroupResponseDto>();
}
