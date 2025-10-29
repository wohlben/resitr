import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Equipment } from '../../schemas/equipment.schema';
import { inject } from '@angular/core';
import { Database } from '../../persistence/database';

type UserEquipmentState = {
  equipment: Partial<Equipment>;
};

const isEquipmentvalid = (
  equipment: Partial<Equipment>
): equipment is Equipment => !!equipment.name;

export const userEquipmentStore = signalStore(
  withState<UserEquipmentState>({ equipment: {} }),
  withMethods((store, database = inject(Database)) => ({
    readEquipment: async (id: string) => {
      const equipment = await database.equipment.get(id);
      patchState(store, () => ({ equipment }));
    },
    updateEquipment: async (equipment: Partial<Equipment>) => {
      patchState(store, (state) => ({
        equipment: { ...state.equipment, ...equipment },
      }));
    },
    saveEquipment: async () => {
      const equipment = store.equipment();
      const equipmentValid = isEquipmentvalid(equipment);
      if (!equipmentValid) return;
      await database.equipment.upsert(
        equipment.id ?? crypto.randomUUID(),
        equipment
      );
    },
  }))
);
