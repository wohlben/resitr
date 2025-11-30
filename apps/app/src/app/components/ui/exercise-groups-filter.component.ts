import { Component, input } from '@angular/core';
import { ExerciseGroupsStore } from '../../features/exercise-groups/exercise-groups.store';
import { EntityFiltersComponent } from './entity-filters.component';

@Component({
  selector: 'app-exercise-groups-filter',
  standalone: true,
  imports: [EntityFiltersComponent],
  template: `
    <app-entity-filters
      placeholder="Search exercise groups..."
      [searchTerm]="store().searchTerm()"
      (searchTermChange)="store().setSearchTerm($event)"
      [hasActiveFilters]="store().hasActiveFilters()"
      (clearFilters)="store().clearFilters()"
    />
  `,
})
export class ExerciseGroupsFilterComponent {
  store = input.required<InstanceType<typeof ExerciseGroupsStore>>();
}
