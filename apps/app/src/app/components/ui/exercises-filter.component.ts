import { Component, input, effect } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Muscle, MuscleLabels, ExerciseType, ExerciseTypeLabels, TechnicalDifficulty, TechnicalDifficultyLabels } from '@resitr/api';
import { ExercisesStore } from '../../features/exercises/exercises.store';
import { DropdownComponent } from './inputs/dropdown.component';
import { EntityFiltersComponent } from './entity-filters.component';
import { EnumValuesPipe } from '../../shared/pipes/enum-values.pipe';
import { ValueOptionsPipe } from '../../shared/pipes/value-options.pipe';
import { isValidEnumValue } from '../../shared/utils/type-guards';

@Component({
  selector: 'app-exercises-filter',
  standalone: true,
  imports: [ReactiveFormsModule, DropdownComponent, EntityFiltersComponent, EnumValuesPipe, ValueOptionsPipe],
  template: `
    <app-entity-filters
      placeholder="Search exercises..."
      [searchTerm]="store().searchTerm()"
      (searchTermChange)="store().setSearchTerm($event)"
      [hasActiveFilters]="store().hasActiveFilters()"
      (clearFilters)="store().clearFilters()"
    >
      <div advancedFilters class="contents" [formGroup]="filterForm">
        <app-dropdown
          label="Type"
          [options]="(ExerciseType | enumValues) | valueOptions : ExerciseTypeLabels"
          formControlName="type"
        />

        <app-dropdown
          label="Muscle"
          [options]="(Muscle | enumValues) | valueOptions : MuscleLabels"
          formControlName="muscle"
        />

        <app-dropdown
          label="Difficulty"
          [options]="(TechnicalDifficulty | enumValues) | valueOptions : TechnicalDifficultyLabels"
          formControlName="difficulty"
        />
      </div>
    </app-entity-filters>
  `,
})
export class ExercisesFilterComponent {
  store = input.required<InstanceType<typeof ExercisesStore>>();

  readonly Muscle = Muscle;
  readonly MuscleLabels = MuscleLabels;
  readonly ExerciseType = ExerciseType;
  readonly ExerciseTypeLabels = ExerciseTypeLabels;
  readonly TechnicalDifficulty = TechnicalDifficulty;
  readonly TechnicalDifficultyLabels = TechnicalDifficultyLabels;

  filterForm = new FormGroup({
    type: new FormControl(''),
    muscle: new FormControl(''),
    difficulty: new FormControl(''),
  });

  private isSyncing = false;

  constructor() {
    effect(() => {
      const type = this.store().selectedType();
      const muscle = this.store().selectedMuscle();
      const difficulty = this.store().selectedDifficulty();

      const current = this.filterForm.value;
      if (current.type !== type || current.muscle !== muscle || current.difficulty !== difficulty) {
        this.isSyncing = true;
        this.filterForm.patchValue({ type, muscle, difficulty }, { emitEvent: false });
        this.isSyncing = false;
      }
    });

    this.filterForm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(value => {
        if (this.isSyncing) return;

        if (isValidEnumValue(value.type, ExerciseType)) {
          this.store().setSelectedType(value.type);
        }
        if (isValidEnumValue(value.muscle, Muscle)) {
          this.store().setSelectedMuscle(value.muscle);
        }
        if (isValidEnumValue(value.difficulty, TechnicalDifficulty)) {
          this.store().setSelectedDifficulty(value.difficulty);
        }
      });
  }
}
