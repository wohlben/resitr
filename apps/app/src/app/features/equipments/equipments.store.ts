import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import type { EquipmentResponseDto, CreateEquipmentDto, UpdateEquipmentDto } from '@resitr/api';
import { EquipmentCategory } from '@resitr/api';
import { CompendiumQueries } from '../../core/compendium/compendium-queries';
import { CompendiumMutations } from '../../core/compendium/compendium-mutations';
import { safeErrorMessage } from '../../shared/utils/type-guards';

type EquipmentsState = {
  equipments: EquipmentResponseDto[];
  currentEquipment: EquipmentResponseDto | null;
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  error: string | null;
  saveError: string | null;
  searchTerm: string;
  selectedCategory: EquipmentCategory | '';
};

const initialState: EquipmentsState = {
  equipments: [],
  currentEquipment: null,
  isLoading: false,
  isSaving: false,
  isDeleting: false,
  error: null,
  saveError: null,
  searchTerm: '',
  selectedCategory: '',
};

export const EquipmentsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    filteredEquipments: computed(() => {
      let filtered = store.equipments();

      if (store.searchTerm()) {
        const term = store.searchTerm().toLowerCase();
        filtered = filtered.filter(
          (equipment) =>
            equipment.name.toLowerCase().includes(term) ||
            equipment.displayName.toLowerCase().includes(term) ||
            equipment.description?.toLowerCase().includes(term)
        );
      }

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
          error: safeErrorMessage(error),
          isLoading: false,
        });
      }
    },
    async loadEquipment(id: string): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const equipment = await CompendiumQueries.equipment.detail(id).fn(http);
        patchState(store, { currentEquipment: equipment, isLoading: false });
      } catch (error) {
        patchState(store, {
          error: safeErrorMessage(error),
          isLoading: false,
        });
      }
    },
    async createEquipment(data: CreateEquipmentDto): Promise<EquipmentResponseDto | null> {
      patchState(store, { isSaving: true, saveError: null });
      try {
        const equipment = await CompendiumMutations.equipment.create(http, data);
        patchState(store, {
          equipments: [...store.equipments(), equipment],
          currentEquipment: equipment,
          isSaving: false,
        });
        return equipment;
      } catch (error) {
        patchState(store, {
          saveError: safeErrorMessage(error),
          isSaving: false,
        });
        return null;
      }
    },
    async updateEquipment(id: string, data: UpdateEquipmentDto): Promise<EquipmentResponseDto | null> {
      patchState(store, { isSaving: true, saveError: null });
      try {
        const equipment = await CompendiumMutations.equipment.update(http, id, data);
        patchState(store, {
          equipments: store.equipments().map((e) => (e.templateId === id ? equipment : e)),
          currentEquipment: equipment,
          isSaving: false,
        });
        return equipment;
      } catch (error) {
        patchState(store, {
          saveError: safeErrorMessage(error),
          isSaving: false,
        });
        return null;
      }
    },
    async deleteEquipment(id: string): Promise<boolean> {
      patchState(store, { isDeleting: true, saveError: null });
      try {
        await CompendiumMutations.equipment.delete(http, id);
        patchState(store, {
          equipments: store.equipments().filter((e) => e.templateId !== id),
          currentEquipment: null,
          isDeleting: false,
        });
        return true;
      } catch (error) {
        patchState(store, {
          saveError: safeErrorMessage(error),
          isDeleting: false,
        });
        return false;
      }
    },
    clearCurrentEquipment(): void {
      patchState(store, { currentEquipment: null, saveError: null });
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
