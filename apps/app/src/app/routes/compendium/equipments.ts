import { Component, effect, inject } from '@angular/core';
import { EquipmentsStore } from '../../features/equipments/equipments.store';
import { PaginationComponent } from '../../components/ui/pagination.component';
import { EquipmentCardComponent } from '../../components/ui/equipment-card.component';
import { ErrorLoadingComponent } from '../../components/ui/error-loading.component';
import { LoadingComponent } from '../../components/ui/loading.component';
import { EquipmentsFilterComponent } from '../../components/ui/equipments-filter.component';

@Component({
  selector: 'app-equipments',
  standalone: true,
  imports: [PaginationComponent, EquipmentCardComponent, ErrorLoadingComponent, LoadingComponent, EquipmentsFilterComponent],
  providers: [EquipmentsStore],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Equipment Compendium</h1>
          <p class="text-gray-600 mt-1">Browse and manage equipment templates</p>
        </div>

        <app-equipments-filter [store]="store" />
      </div>

      @if (store.isLoading()) {
        <app-loading message="Loading equipments..." />
      }

      @if (store.error()) {
        <app-error-loading
          title="Error loading equipments"
          [message]="store.error()!"
        />
      }

      <!-- Success State -->
      @if (!store.isLoading() && !store.error()) {
        <app-pagination #pagination [items]="store.filteredEquipments()" [itemName]="'equipments'">
          <div paginationContent>
            <!-- Equipment List -->
            @if (store.filteredEquipments().length === 0) {
              <div class="text-center py-12 bg-gray-50 rounded-lg">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-gray-600">No equipments found matching your criteria</p>
              </div>
            } @else {
              <div class="flex flex-col gap-3">
                @for (equipment of pagination.paginatedItems(); track equipment.templateId) {
                  <app-equipment-card [equipment]="equipment" />
                }
              </div>
            }
          </div>
        </app-pagination>
      }
    </div>
  `,
})
export class EquipmentsComponent {
  readonly store = inject(EquipmentsStore);

  constructor() {
    effect(() => {
      this.store.loadEquipments();
    });
  }
}
