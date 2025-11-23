import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from './inputs/dropdown.component';
import { ValueOptionsPipe } from '../../shared/pipes/value-options.pipe';

@Component({
  selector: 'app-pagination-info',
  standalone: true,
  imports: [CommonModule, DropdownComponent, ValueOptionsPipe],
  template: `
    <div class="flex items-center justify-between">
      <p class="text-sm text-gray-600">
        Showing {{ currentCount() }} of {{ filteredCount() }} {{ itemName() }}
        @if (filteredCount() !== totalCount()) {
          ({{ totalCount() }} total)
        }
      </p>

      <!-- Items Per Page -->
      <app-dropdown
        label="Per page"
        labelClass="text-sm text-gray-600"
        [options]="[10, 25, 50, 100] | valueOptions"
        [value]="itemsPerPage().toString()"
        [placeholder]="''"
        (valueChange)="itemsPerPageChange.emit(+$event)"
      />
    </div>
  `,
})
export class PaginationInfoComponent {
  currentCount = input.required<number>();
  filteredCount = input.required<number>();
  totalCount = input.required<number>();
  itemsPerPage = input.required<number>();
  itemName = input<string>('items');

  itemsPerPageChange = output<number>();
}
