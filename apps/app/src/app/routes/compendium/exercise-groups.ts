import { Component, inject } from '@angular/core';
import { ExerciseGroupsStore } from '../../features/exercise-groups/exercise-groups.store';
import { PaginationComponent } from '../../components/ui/pagination.component';
import { ExerciseGroupCardComponent } from '../../components/ui/exercise-group-card.component';
import { ErrorLoadingComponent } from '../../components/ui/error-loading.component';
import { LoadingComponent } from '../../components/ui/loading.component';
import { ExerciseGroupsFilterComponent } from '../../components/ui/exercise-groups-filter.component';
import { ButtonComponent } from '../../components/ui/button.component';

@Component({
  selector: 'app-exercise-groups',
  standalone: true,
  imports: [
    PaginationComponent,
    ExerciseGroupCardComponent,
    ErrorLoadingComponent,
    LoadingComponent,
    ExerciseGroupsFilterComponent,
    ButtonComponent,
  ],
  providers: [ExerciseGroupsStore],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Exercise Groups</h1>
            <p class="text-gray-600 mt-1">Browse and manage exercise group templates</p>
          </div>
          <app-button variant="primary" link="/compendium/exercise-groups/new">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Group
          </app-button>
        </div>

        <app-exercise-groups-filter [store]="store" />
      </div>

      @if (store.isLoading()) {
        <app-loading message="Loading exercise groups..." />
      }

      @if (store.error()) {
        <app-error-loading
          title="Error loading exercise groups"
          [message]="store.error()!"
        />
      }

      @if (!store.isLoading() && !store.error()) {
        <app-pagination #pagination [items]="store.filteredExerciseGroups()" [itemName]="'exercise groups'">
          <div paginationContent>
            @if (store.filteredExerciseGroups().length === 0) {
              <div class="text-center py-12 bg-gray-50 rounded-lg">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p class="text-gray-600">No exercise groups found matching your criteria</p>
              </div>
            } @else {
              <div class="flex flex-col gap-3">
                @for (group of pagination.paginatedItems(); track group.id) {
                  <app-exercise-group-card [exerciseGroup]="group" />
                }
              </div>
            }
          </div>
        </app-pagination>
      }
    </div>
  `,
})
export class ExerciseGroupsComponent {
  readonly store = inject(ExerciseGroupsStore);
}
