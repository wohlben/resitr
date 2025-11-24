import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import type { EquipmentResponseDto } from '@resitr/api';
import { EquipmentCategory } from '@resitr/api';
import { CompendiumQueries } from '../../core/compendium/compendium-queries';

type EquipmentsState = {
  equipments: EquipmentResponseDto[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  selectedCategory: EquipmentCategory | '';
};

const initialState: EquipmentsState = {
  equipments: [],
  isLoading: false,
  error: null,
  searchTerm: '',
  selectedCategory: '',
};

export const EquipmentsStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    filteredEquipments: computed(() => {
      let filtered = store.equipments();

      // Filter by search term
      if (store.searchTerm()) {
        const term = store.searchTerm().toLowerCase();
        filtered = filtered.filter(
          (equipment) =>
            equipment.name.toLowerCase().includes(term) ||
            equipment.displayName.toLowerCase().includes(term) ||
            equipment.description?.toLowerCase().includes(term)
        );
      }

      // Filter by category
      if (store.selectedCategory()) {
        filtered = filtered.filter(
          (equipment) => equipment.category === store.selectedCategory()
        );
      }

      return filtered;
    }),
    hasActiveFilters: computed(() => {
      return store.searchTerm() !== '' || store.selectedCategory() !== '';
    }),
  })),
  withMethods((store, http = inject(HttpClient)) => ({
    async loadEquipments(): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const equipments = await CompendiumQueries.equipment.list.fn(http);
        patchState(store, { equipments, isLoading: false });
      } catch (error) {
        patchState(store, {
          error: (error as Error).message || 'Failed to load equipments',
          isLoading: false,
        });
      }
    },
    setSearchTerm(searchTerm: string): void {
      patchState(store, { searchTerm });
    },
    setSelectedCategory(selectedCategory: EquipmentCategory | ''): void {
      patchState(store, { selectedCategory });
    },
    clearFilters(): void {
      patchState(store, {
        searchTerm: '',
        selectedCategory: '',
      });
    },
  })),
  withHooks({ onInit: (store) => store.loadEquipments() })
);
