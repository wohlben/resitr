import { Component, input, effect } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WorkoutSectionType, WorkoutSectionTypeLabels } from '@resitr/api';
import { type WorkoutsStore } from '../../features/workouts/workouts.store';
import { DropdownComponent } from './inputs/dropdown.component';
import { EntityFiltersComponent } from './entity-filters.component';
import { EnumValuesPipe } from '../../shared/pipes/enum-values.pipe';
import { ValueOptionsPipe } from '../../shared/pipes/value-options.pipe';
import { isValidEnumValue } from '../../shared/utils/type-guards';

@Component({
  selector: 'app-workouts-filter',
  standalone: true,
  imports: [ReactiveFormsModule, DropdownComponent, EntityFiltersComponent, EnumValuesPipe, ValueOptionsPipe],
  template: `
    <app-entity-filters
      placeholder="Search workouts..."
      [searchTerm]="store().searchTerm()"
      (searchTermChange)="store().setSearchTerm($event)"
      [hasActiveFilters]="store().hasActiveFilters()"
      (clearFilters)="store().clearFilters()"
    >
      <div advancedFilters class="contents">
        <app-dropdown
          label="Section Type"
          [options]="(WorkoutSectionType | enumValues) | valueOptions : WorkoutSectionTypeLabels"
          [formControl]="sectionTypeControl"
        />
      </div>
    </app-entity-filters>
  `,
})
export class WorkoutsFilterComponent {
  store = input.required<InstanceType<WorkoutsStore>>();

  readonly WorkoutSectionType = WorkoutSectionType;
  readonly WorkoutSectionTypeLabels = WorkoutSectionTypeLabels;

  sectionTypeControl = new FormControl('');
  private isSyncing = false;

  constructor() {
    effect(() => {
      const sectionType = this.store().selectedSectionType();
      if (this.sectionTypeControl.value !== sectionType) {
        this.isSyncing = true;
        this.sectionTypeControl.setValue(sectionType, { emitEvent: false });
        this.isSyncing = false;
      }
    });

    this.sectionTypeControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(value => {
        if (this.isSyncing) return;
        if (isValidEnumValue(value, WorkoutSectionType)) {
          this.store().setSelectedSectionType(value);
        }
      });
  }
}
