import { EquipmentCategory } from './equipment-category';

export type EquipmentTemplate = {
  name: string;
  displayName: string;
  templateId: string;
  image?: string;
  description?: string;
  category?: EquipmentCategory;
  substitutesFor: string[];
};
