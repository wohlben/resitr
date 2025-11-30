import { Component, input, effect } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EquipmentCategory, EquipmentCategoryLabels } from '@resitr/api';
import { EquipmentsStore } from '../../../features/equipments/equipments.store';
import { DropdownComponent } from '../inputs/dropdown.component';
import { EntityFiltersComponent } from './entity-filters.component';
import { EnumValuesPipe } from '../../../shared/pipes/enum-values.pipe';
import { ValueOptionsPipe } from '../../../shared/pipes/value-options.pipe';
import { isValidEnumValue } from '../../../shared/utils/type-guards';

@Component({
  selector: 'app-equipments-filter',
  standalone: true,
  imports: [ReactiveFormsModule, DropdownComponent, EntityFiltersComponent, EnumValuesPipe, ValueOptionsPipe],
  template: `
    <app-entity-filters
      placeholder="Search equipments..."
      [searchTerm]="store().searchTerm()"
      (searchTermChange)="store().setSearchTerm($event)"
      [hasActiveFilters]="store().hasActiveFilters()"
      (clearFilters)="store().clearFilters()"
    >
      <div advancedFilters class="contents">
        <app-dropdown
          label="Category"
          [options]="(EquipmentCategory | enumValues) | valueOptions : EquipmentCategoryLabels"
          [formControl]="categoryControl"
        />
      </div>
    </app-entity-filters>
  `,
})
export class EquipmentsFilterComponent {
  store = input.required<InstanceType<typeof EquipmentsStore>>();

  readonly EquipmentCategory = EquipmentCategory;
  readonly EquipmentCategoryLabels = EquipmentCategoryLabels;

  categoryControl = new FormControl('');
  private isSyncing = false;

  constructor() {
    effect(() => {
      const category = this.store().selectedCategory();
      if (this.categoryControl.value !== category) {
        this.isSyncing = true;
        this.categoryControl.setValue(category, { emitEvent: false });
        this.isSyncing = false;
      }
    });

    this.categoryControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(value => {
        if (this.isSyncing) return;
        if (isValidEnumValue(value, EquipmentCategory)) {
          this.store().setSelectedCategory(value);
        }
      });
  }
}
