import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { EquipmentResponseDto } from '@resitr/api';
import { EquipmentCategoryLabelPipe } from '../../shared/pipes/equipment-category-label.pipe';
import { CardComponent } from './card.component';

@Component({
  selector: 'app-equipment-card',
  standalone: true,
  imports: [RouterLink, EquipmentCategoryLabelPipe, CardComponent, NgClass],
  template: `
    <a [routerLink]="['/compendium/equipments', equipment().templateId]">
      <app-card>
        <!-- Title -->
        <div card-title>
          <h3 class="text-lg font-semibold text-gray-900">{{ equipment().displayName }}</h3>
          @if (equipment().name !== equipment().displayName) {
            <p class="text-sm text-gray-500">{{ equipment().name }}</p>
          }
        </div>

        <!-- Badge -->
        <span
          card-badge
          class="px-2 py-1 text-xs font-medium rounded"
          [ngClass]="{
            'bg-blue-100 text-blue-700': equipment().category === 'free_weights',
            'bg-purple-100 text-purple-700': equipment().category === 'machines',
            'bg-green-100 text-green-700': equipment().category === 'functional',
            'bg-orange-100 text-orange-700': equipment().category === 'benches',
            'bg-pink-100 text-pink-700': equipment().category === 'accessories',
            'bg-gray-100 text-gray-700': equipment().category === 'other' || !equipment().category
          }"
        >
          {{ equipment().category | equipmentCategoryLabel }}
        </span>

        <!-- Content: Description -->
        <div card-content>
          @if (equipment().description) {
            <p class="text-sm text-gray-600 line-clamp-2">{{ equipment().description }}</p>
          } @else {
            <p class="text-sm text-gray-400 italic">No description available</p>
          }
        </div>

        <!-- Footer Left: Substitutes -->
        <ng-container card-footer-left>
          @if (equipment().substitutesFor && equipment().substitutesFor.length > 0) {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            <span>{{ equipment().substitutesFor.length }} substitute{{ equipment().substitutesFor.length > 1 ? 's' : '' }}</span>
          } @else {
            <span class="text-gray-400">No substitutes</span>
          }
        </ng-container>

        <!-- Footer Right: Equipment ID -->
        <span card-footer-right class="text-xs text-gray-500">
          {{ equipment().templateId }}
        </span>
      </app-card>
    </a>
  `,
})
export class EquipmentCardComponent {
  equipment = input.required<EquipmentResponseDto>();
}
