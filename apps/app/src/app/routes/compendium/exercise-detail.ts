import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ExercisesStore } from '../../features/exercises/exercises.store';
import { LoadingComponent } from '../../components/ui/feedback/loading.component';
import { ErrorLoadingComponent } from '../../components/ui/feedback/error-loading.component';
import { DetailPageHeaderComponent } from '../../components/ui/display/detail-page-header.component';
import { DetailFieldComponent } from '../../components/ui/display/detail-field.component';
import { TagListComponent } from '../../components/ui/display/tag-list.component';
import { ValueLabelPipe } from '../../shared/pipes/value-label.pipe';
import {
  ExerciseTypeLabels,
  ForceTypeLabels,
  MuscleLabels,
  TechnicalDifficultyLabels,
  MeasurementParadigmLabels,
  ExerciseRelationshipTypeLabels,
} from '@resitr/api';
import { SpinnerComponent } from '../../components/ui/feedback/spinner.component';

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
    RouterLink,
    SpinnerComponent,
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
          @if (exercise.description) {
            <app-detail-field label="Description" [value]="exercise.description" />
          }

          @if (exercise.alternativeNames && exercise.alternativeNames.length > 0) {
            <app-detail-field label="Alternative Names" [value]="exercise.alternativeNames.join(', ')" />
          }

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <app-detail-field
              label="Technical Difficulty"
              [value]="exercise.technicalDifficulty | valueLabel:TechnicalDifficultyLabels"
            />

            <app-detail-field
              label="Body Weight Scaling"
              [value]="(exercise.bodyWeightScaling * 100) + '%'"
            />
          </div>

          <app-tag-list
            label="Primary Muscles"
            [items]="exercise.primaryMuscles"
            [labels]="MuscleLabels"
            color="blue"
          />

          @if (exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0) {
            <app-tag-list
              label="Secondary Muscles"
              [items]="exercise.secondaryMuscles"
              [labels]="MuscleLabels"
              color="gray"
            />
          }

          @if (exercise.force && exercise.force.length > 0) {
            <app-tag-list
              label="Force Types"
              [items]="exercise.force"
              [labels]="ForceTypeLabels"
            />
          }

          @if (exercise.suggestedMeasurementParadigms && exercise.suggestedMeasurementParadigms.length > 0) {
            <app-tag-list
              label="Measurement Paradigms"
              [items]="exercise.suggestedMeasurementParadigms"
              [labels]="MeasurementParadigmLabels"
              color="purple"
            />
          }

          @if (exercise.equipmentIds && exercise.equipmentIds.length > 0) {
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-2">Equipment</h3>
              <div class="flex flex-wrap gap-2">
                @if (store.isLoadingRelations()) {
                  <span class="text-sm text-gray-400">Loading...</span>
                } @else {
                  @for (equipmentId of exercise.equipmentIds; track equipmentId) {
                    <a
                      [routerLink]="['/compendium/equipments', equipmentId]"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
                    >
                      {{ getEquipmentName(equipmentId) }}
                    </a>
                  }
                }
              </div>
            </div>
          }

          @if (exercise.instructions && exercise.instructions.length > 0) {
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-2">Instructions</h3>
              <ol class="list-decimal list-inside space-y-1">
                @for (instruction of exercise.instructions; track $index) {
                  <li class="text-sm text-gray-700">{{ instruction }}</li>
                }
              </ol>
            </div>
          }

          @if (exercise.images && exercise.images.length > 0) {
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-2">Images</h3>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                @for (image of exercise.images; track image) {
                  <a [href]="image" target="_blank" rel="noopener noreferrer">
                    <img
                      [src]="image"
                      [alt]="exercise.name"
                      class="rounded-lg object-cover w-full h-32 hover:opacity-80 transition-opacity"
                    />
                  </a>
                }
              </div>
            </div>
          }

          @if (exercise.authorName || exercise.authorUrl) {
            <div class="border-t pt-4">
              <h3 class="text-sm font-medium text-gray-500 mb-2">Author</h3>
              @if (exercise.authorUrl) {
                <a
                  [href]="exercise.authorUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-blue-600 hover:underline"
                >
                  {{ exercise.authorName || exercise.authorUrl }}
                </a>
              } @else {
                <span class="text-sm text-gray-700">{{ exercise.authorName }}</span>
              }
            </div>
          }
        </div>

        <!-- Groups Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Groups</h2>
          @if (store.isLoadingRelations()) {
            <div class="flex items-center gap-2 text-gray-500">
              <app-spinner size="small" />
              <span class="text-sm">Loading groups...</span>
            </div>
          } @else if (store.currentExerciseGroups().length > 0) {
            <div class="flex flex-wrap gap-2">
              @for (membership of store.currentExerciseGroups(); track membership.groupId) {
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  {{ membership.group?.name || membership.groupId }}
                </span>
              }
            </div>
          } @else {
            <p class="text-sm text-gray-500">This exercise is not part of any groups.</p>
          }
        </div>

        <!-- Relationships Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Related Exercises</h2>
          @if (store.isLoadingRelations()) {
            <div class="flex items-center gap-2 text-gray-500">
              <app-spinner size="small" />
              <span class="text-sm">Loading relationships...</span>
            </div>
          } @else if (store.currentExerciseRelationships().length > 0) {
            <div class="space-y-3">
              @for (rel of store.currentExerciseRelationships(); track rel.fromExerciseTemplateId + rel.toExerciseTemplateId + rel.relationshipType) {
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center gap-3">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
                      {{ rel.relationshipType | valueLabel:ExerciseRelationshipTypeLabels }}
                    </span>
                    @if (rel.relatedExercise) {
                      <a
                        [routerLink]="['/compendium/exercises', rel.relatedExercise.templateId]"
                        class="text-sm font-medium text-blue-600 hover:underline"
                      >
                        {{ rel.relatedExercise.name }}
                      </a>
                    } @else {
                      <span class="text-sm text-gray-600">
                        {{ rel.fromExerciseTemplateId === exercise.templateId ? rel.toExerciseTemplateId : rel.fromExerciseTemplateId }}
                      </span>
                    }
                  </div>
                  @if (rel.description) {
                    <span class="text-xs text-gray-500">{{ rel.description }}</span>
                  }
                </div>
              }
            </div>
          } @else {
            <p class="text-sm text-gray-500">No related exercises found.</p>
          }
        </div>
      </div>
    }
  `,
})
export class ExerciseDetail {
  store = inject(ExercisesStore);
  private route = inject(ActivatedRoute);

  readonly ExerciseTypeLabels = ExerciseTypeLabels;
  readonly TechnicalDifficultyLabels = TechnicalDifficultyLabels;
  readonly MuscleLabels = MuscleLabels;
  readonly ForceTypeLabels = ForceTypeLabels;
  readonly MeasurementParadigmLabels = MeasurementParadigmLabels;
  readonly ExerciseRelationshipTypeLabels = ExerciseRelationshipTypeLabels;

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) => {
        const id = params.get('id');
        if (id) {
          this.store.loadExercise(id);
        }
      });
  }

  getEquipmentName(equipmentId: string): string {
    const equipment = this.store.currentExerciseEquipment().find(e => e.templateId === equipmentId);
    return equipment?.displayName || equipment?.name || equipmentId;
  }
}
