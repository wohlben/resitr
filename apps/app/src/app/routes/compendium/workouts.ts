import { Component, inject } from '@angular/core';
import { WorkoutsStore } from '../../features/workouts/workouts.store';
import { PaginationComponent } from '../../components/ui/pagination.component';
import { WorkoutCardComponent } from '../../components/ui/workout-card.component';
import { ErrorLoadingComponent } from '../../components/ui/error-loading.component';
import { LoadingComponent } from '../../components/ui/loading.component';
import { WorkoutsFilterComponent } from '../../components/ui/workouts-filter.component';

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [PaginationComponent, WorkoutCardComponent, ErrorLoadingComponent, LoadingComponent, WorkoutsFilterComponent],
  providers: [WorkoutsStore],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Workout Compendium</h1>
          <p class="text-gray-600 mt-1">Browse and manage workout templates</p>
        </div>

        <!-- Filters -->
        <app-workouts-filter [store]="store" />
      </div>

      <!-- Loading State -->
      @if (store.isLoading()) {
        <app-loading message="Loading workouts..." />
      }

      <!-- Error State -->
      @if (store.error()) {
        <app-error-loading
          title="Error loading workouts"
          [message]="store.error()!"
        />
      }

      <!-- Success State -->
      @if (!store.isLoading() && !store.error()) {
        <app-pagination #pagination [items]="store.filteredWorkouts()" [itemName]="'workouts'">
          <div paginationContent>
            <!-- Workout List -->
            @if (store.filteredWorkouts().length === 0) {
              <div class="text-center py-12 bg-gray-50 rounded-lg">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p class="text-gray-600">No workouts found matching your criteria</p>
              </div>
            } @else {
              <div class="flex flex-col gap-3">
                @for (workout of pagination.paginatedItems(); track workout.templateId) {
                  <app-workout-card [workout]="workout" />
                }
              </div>
            }
          </div>
        </app-pagination>
      }
    </div>
  `,
})
export class WorkoutsComponent {
  readonly store = inject(WorkoutsStore);
}
