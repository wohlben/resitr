import { relations } from 'drizzle-orm';
import { compendiumEquipmentFulfillment } from './compendium-equipment-fulfillment.schema';
import { compendiumEquipment } from './compendium-equipment.schema';

export const compendiumEquipmentRelations = relations(compendiumEquipment, ({ many }) => ({
  substitutesFor: many(compendiumEquipmentFulfillment, {
    relationName: 'equipmentSubstitutions',
  }),
}));

export const compendiumEquipmentFulfillmentRelations = relations(compendiumEquipmentFulfillment, ({ one }) => ({
  equipment: one(compendiumEquipment, {
    fields: [compendiumEquipmentFulfillment.equipmentTemplateId],
    references: [compendiumEquipment.templateId],
    relationName: 'equipmentSubstitutions',
  }),
  fulfillsEquipment: one(compendiumEquipment, {
    fields: [compendiumEquipmentFulfillment.fulfillsEquipmentTemplateId],
    references: [compendiumEquipment.templateId],
    relationName: 'fulfilledBy',
  }),
}));
