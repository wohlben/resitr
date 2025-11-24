import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutSectionType, WorkoutSectionTypeLabels } from '@resitr/api';
import { type WorkoutsStore } from '../../features/workouts/workouts.store';
import { DropdownComponent } from './inputs/dropdown.component';
import { EntityFiltersComponent } from './entity-filters.component';
import { EnumValuesPipe } from '../../shared/pipes/enum-values.pipe';
import { ValueOptionsPipe } from '../../shared/pipes/value-options.pipe';

@Component({
  selector: 'app-workouts-filter',
  standalone: true,
  imports: [CommonModule, DropdownComponent, EntityFiltersComponent, EnumValuesPipe, ValueOptionsPipe],
  template: `
    <app-entity-filters
      placeholder="Search workouts..."
      [searchTerm]="store().searchTerm()"
      (searchTermChange)="store().setSearchTerm($event)"
      [hasActiveFilters]="store().hasActiveFilters()"
      (clearFilters)="store().clearFilters()"
    >
      <div advancedFilters class="contents">
        <!-- Section Type Filter -->
        <app-dropdown
          label="Section Type"
          [options]="(WorkoutSectionType | enumValues) | valueOptions : WorkoutSectionTypeLabels"
          [value]="store().selectedSectionType()"
          (valueChange)="store().setSelectedSectionType($any($event))"
        />
      </div>
    </app-entity-filters>
  `,
})
export class WorkoutsFilterComponent {
  // Input
  store = input.required<InstanceType<WorkoutsStore>>();

  // Make enum and labels available in template
  readonly WorkoutSectionType = WorkoutSectionType;
  readonly WorkoutSectionTypeLabels = WorkoutSectionTypeLabels;
}
