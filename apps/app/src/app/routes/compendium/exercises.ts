import { Component, effect, inject } from '@angular/core';
import { ExercisesStore } from '../../features/exercises/exercises.store';
import { PaginationComponent } from '../../components/ui/pagination.component';
import { ExerciseCardComponent } from '../../components/ui/exercise-card.component';
import { ErrorLoadingComponent } from '../../components/ui/error-loading.component';
import { LoadingComponent } from '../../components/ui/loading.component';
import { ExercisesFilterComponent } from '../../components/ui/exercises-filter.component';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [PaginationComponent, ExerciseCardComponent, ErrorLoadingComponent, LoadingComponent, ExercisesFilterComponent],
  providers: [ExercisesStore],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Exercise Compendium</h1>
          <p class="text-gray-600 mt-1">Browse and manage exercise templates</p>
        </div>

        <!-- Filters -->
        <app-exercises-filter [store]="store" />
      </div>

      <!-- Loading State -->
      @if (store.isLoading()) {
        <app-loading message="Loading exercises..." />
      }

      <!-- Error State -->
      @if (store.error()) {
        <app-error-loading
          title="Error loading exercises"
          [message]="store.error()!"
        />
      }

      <!-- Success State -->
      @if (!store.isLoading() && !store.error()) {
        <app-pagination #pagination [items]="store.filteredExercises()" [itemName]="'exercises'">
          <div paginationContent>
            <!-- Exercise List -->
            @if (store.filteredExercises().length === 0) {
              <div class="text-center py-12 bg-gray-50 rounded-lg">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-gray-600">No exercises found matching your criteria</p>
              </div>
            } @else {
              <div class="flex flex-col gap-3">
                @for (exercise of pagination.paginatedItems(); track exercise.templateId) {
                  <app-exercise-card [exercise]="exercise" />
                }
              </div>
            }
          </div>
        </app-pagination>
      }
    </div>
  `,
})
export class ExercisesComponent {
  readonly store = inject(ExercisesStore);
}
