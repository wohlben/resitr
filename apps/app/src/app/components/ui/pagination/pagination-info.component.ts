import { Component, input, output, effect } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DropdownComponent } from '../inputs/dropdown.component';
import { ValueOptionsPipe } from '../../../shared/pipes/value-options.pipe';
import { safeNumberConversion } from '../../../shared/utils/type-guards';

@Component({
  selector: 'app-pagination-info',
  standalone: true,
  imports: [ReactiveFormsModule, DropdownComponent, ValueOptionsPipe],
  template: `
    <div class="flex items-center justify-between">
      <p class="text-sm text-gray-600">
        Showing {{ currentCount() }} of {{ filteredCount() }} {{ itemName() }}
        @if (filteredCount() !== totalCount()) {
          ({{ totalCount() }} total)
        }
      </p>

      <app-dropdown
        label="Per page"
        labelClass="text-sm text-gray-600"
        [options]="[10, 25, 50, 100] | valueOptions"
        [formControl]="itemsPerPageControl"
        [placeholder]="''"
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

  itemsPerPageControl = new FormControl('');

  constructor() {
    effect(() => {
      const perPage = this.itemsPerPage().toString();
      if (this.itemsPerPageControl.value !== perPage) {
        this.itemsPerPageControl.setValue(perPage, { emitEvent: false });
      }
    });

    this.itemsPerPageControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(value => {
        this.itemsPerPageChange.emit(safeNumberConversion(value, 10));
      });
  }
}
