import { type EquipmentTemplate } from '@resitr/api';

export type Equipment = Omit<EquipmentTemplate, 'templateId'> & {
  id: string;
  templateId?: string;
};

export type NewEquipment = Omit<Equipment, 'id'>;
