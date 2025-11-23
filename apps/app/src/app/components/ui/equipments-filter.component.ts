import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipmentCategory } from '@resitr/api';
import { EquipmentsStore } from '../../features/equipments/equipments.store';
import { DropdownComponent } from './inputs/dropdown.component';
import { EnumValuesPipe } from '../../shared/pipes/enum-values.pipe';
import { EquipmentCategoryOptionsPipe } from '../../shared/pipes/equipment-category-options.pipe';

@Component({
  selector: 'app-equipments-filter',
  standalone: true,
  imports: [CommonModule, DropdownComponent, EnumValuesPipe, EquipmentCategoryOptionsPipe],
  template: `
    <div class="space-y-4">
      <!-- Search Bar -->
      <div class="flex gap-2">
        <input
          type="text"
          placeholder="Search equipments..."
          [value]="store().searchTerm()"
          (input)="store().setSearchTerm($any($event.target).value)"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
        />
        <button
          (click)="showAdvancedFilters.set(!showAdvancedFilters())"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
          [class.bg-blue-50]="showAdvancedFilters()"
          [class.border-blue-500]="showAdvancedFilters()"
          [class.text-blue-700]="showAdvancedFilters()"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search
        </button>
      </div>

      <!-- Advanced Filters -->
      @if (showAdvancedFilters()) {
        <div class="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <!-- Category Filter -->
          <app-dropdown
            label="Category"
            [options]="EquipmentCategory | enumValues | equipmentCategoryOptions"
            [value]="store().selectedCategory()"
            (valueChange)="store().setSelectedCategory($any($event))"
          />

          <!-- Clear Filters -->
          @if (store().hasActiveFilters()) {
            <button
              (click)="store().clearFilters()"
              class="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear filters
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class EquipmentsFilterComponent {
  // Input
  store = input.required<InstanceType<typeof EquipmentsStore>>();

  // Local state
  showAdvancedFilters = signal(false);

  // Make enums available in template
  readonly EquipmentCategory = EquipmentCategory;
}
