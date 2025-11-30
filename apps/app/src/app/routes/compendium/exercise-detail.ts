import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExercisesStore } from '../../features/exercises/exercises.store';
import { LoadingComponent } from '../../components/ui/loading.component';
import { ErrorLoadingComponent } from '../../components/ui/error-loading.component';
import { DetailPageHeaderComponent } from '../../components/ui/detail-page-header.component';
import { DetailFieldComponent } from '../../components/ui/detail-field.component';
import { TagListComponent } from '../../components/ui/tag-list.component';
import { ValueLabelPipe } from '../../shared/pipes/value-label.pipe';
import {
  ExerciseTypeLabels,
  ForceTypeLabels,
  MuscleLabels,
  TechnicalDifficultyLabels,
} from '@resitr/api';

@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  imports: [
    LoadingComponent,
    ErrorLoadingComponent,
    DetailPageHeaderComponent,
    DetailFieldComponent,
    TagListComponent,
    ValueLabelPipe,
  ],
  template: `
    @if (store.isLoading()) {
      <app-loading message="Loading exercise..." />
    } @else if (store.error()) {
      <app-error-loading title="Error loading exercise" [message]="store.error()!" />
    } @else if (store.currentExercise(); as exercise) {
      <div class="max-w-4xl mx-auto space-y-6">
        <app-detail-page-header
          [title]="exercise.name"
          [subtitle]="(exercise.type | valueLabel:ExerciseTypeLabels) + ' Exercise'"
          backLink="/compendium/exercises"
          [editLink]="['/compendium/exercises', exercise.templateId, 'edit']"
          editLabel="Edit Exercise"
        />

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <app-detail-field
            label="Difficulty"
            [value]="exercise.technicalDifficulty | valueLabel:TechnicalDifficultyLabels"
          />

          <app-tag-list
            label="Primary Muscles"
            [items]="exercise.primaryMuscles"
            [labels]="MuscleLabels"
            color="blue"
          />

          <app-tag-list
            label="Force Types"
            [items]="exercise.force"
            [labels]="ForceTypeLabels"
          />

          @if (exercise.instructions.length > 0) {
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-2">Instructions</h3>
              <ol class="list-decimal list-inside space-y-1">
                @for (instruction of exercise.instructions; track $index) {
                  <li class="text-sm text-gray-700">{{ instruction }}</li>
                }
              </ol>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class ExerciseDetail implements OnInit {
  store = inject(ExercisesStore);
  private route = inject(ActivatedRoute);

  readonly ExerciseTypeLabels = ExerciseTypeLabels;
  readonly TechnicalDifficultyLabels = TechnicalDifficultyLabels;
  readonly MuscleLabels = MuscleLabels;
  readonly ForceTypeLabels = ForceTypeLabels;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') as string;
    this.store.loadExercise(id);
  }
}
