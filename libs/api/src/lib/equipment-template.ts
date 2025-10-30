export type EquipmentTemplate = {
  name: string;
  displayName: string;
  templateId: string;
  image?: string;
  description?: string;
  substitutesFor: string[];
};
