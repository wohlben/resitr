export type EquipmentTemplate = {
  name: string;
  templateId: string;
  image?: string;
  description?: string;
  substitutesFor: string[];
};
