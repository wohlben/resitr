import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Muscle, MuscleLabels, ExerciseType, ExerciseTypeLabels, TechnicalDifficulty, TechnicalDifficultyLabels } from '@resitr/api';
import { ExercisesStore } from '../../features/exercises/exercises.store';
import { DropdownComponent } from './inputs/dropdown.component';
import { EntityFiltersComponent } from './entity-filters.component';
import { EnumValuesPipe } from '../../shared/pipes/enum-values.pipe';
import { ValueOptionsPipe } from '../../shared/pipes/value-options.pipe';

@Component({
  selector: 'app-exercises-filter',
  standalone: true,
  imports: [CommonModule, DropdownComponent, EntityFiltersComponent, EnumValuesPipe, ValueOptionsPipe],
  template: `
    <app-entity-filters
      placeholder="Search exercises..."
      [searchTerm]="store().searchTerm()"
      (searchTermChange)="store().setSearchTerm($event)"
      [hasActiveFilters]="store().hasActiveFilters()"
      (clearFilters)="store().clearFilters()"
    >
      <div advancedFilters class="contents">
        <app-dropdown
          label="Type"
          [options]="(ExerciseType | enumValues) | valueOptions : ExerciseTypeLabels"
          [value]="store().selectedType()"
          (valueChange)="store().setSelectedType($any($event))"
        />

        <app-dropdown
          label="Muscle"
          [options]="(Muscle | enumValues) | valueOptions : MuscleLabels"
          [value]="store().selectedMuscle()"
          (valueChange)="store().setSelectedMuscle($any($event))"
        />

        <app-dropdown
          label="Difficulty"
          [options]="(TechnicalDifficulty | enumValues) | valueOptions : TechnicalDifficultyLabels"
          [value]="store().selectedDifficulty()"
          (valueChange)="store().setSelectedDifficulty($any($event))"
        />
      </div>
    </app-entity-filters>
  `,
})
export class ExercisesFilterComponent {
  // Input
  store = input.required<InstanceType<typeof ExercisesStore>>();

  // Make enums and labels available in template
  readonly Muscle = Muscle;
  readonly MuscleLabels = MuscleLabels;
  readonly ExerciseType = ExerciseType;
  readonly ExerciseTypeLabels = ExerciseTypeLabels;
  readonly TechnicalDifficulty = TechnicalDifficulty;
  readonly TechnicalDifficultyLabels = TechnicalDifficultyLabels;
}
