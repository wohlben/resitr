import { Component, input, output, model } from '@angular/core';

@Component({
  selector: 'app-entity-filters',
  standalone: true,
  imports: [],
  template: `
    <div class="space-y-4">
      <div class="flex gap-2">
        <input
          type="text"
          [placeholder]="placeholder()"
          [value]="searchTerm()"
          (input)="searchTermChange.emit($any($event.target).value)"
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
          (click)="searchClick.emit()"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search
        </button>
      </div>

      @if (showAdvancedFilters()) {
        <div class="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <ng-content select="[advancedFilters]" />

          @if (hasActiveFilters()) {
            <button
              (click)="clearFilters.emit()"
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
export class EntityFiltersComponent {
  // Inputs
  placeholder = input<string>('Search...');
  hasActiveFilters = input<boolean>(false);
  searchTerm = input.required<string>();

  // Outputs
  searchTermChange = output<string>();
  searchClick = output<void>();
  clearFilters = output<void>();

  // Models
  showAdvancedFilters = model<boolean>(false);
}
