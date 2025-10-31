import { sqliteTable, text, primaryKey, integer, index } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { EquipmentCategory } from '@resitr/api';

export const compendiumEquipment = sqliteTable('compendium_equipments', {
  templateId: text('template_id').primaryKey(),
  name: text('name').notNull().unique(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  category: text('category').$type<EquipmentCategory>(),
  imageUrl: text('image_url'),
});

export const compendiumEquipmentFulfillment = sqliteTable(
  'compendium_equipment_fulfillment',
  {
    equipmentTemplateId: text('equipment_template_id')
      .notNull()
      .references(() => compendiumEquipment.templateId, {
        onDelete: 'cascade',
      }),
    fulfillsEquipmentTemplateId: text('fulfills_equipment_template_id')
      .notNull()
      .references(() => compendiumEquipment.templateId, {
        onDelete: 'cascade',
      }),

    // Metadata
    createdBy: text('created_by').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    primaryKey({ columns: [table.equipmentTemplateId, table.fulfillsEquipmentTemplateId] }),
    index('fulfills_equipment_idx').on(table.fulfillsEquipmentTemplateId),
  ]
);

export const compendiumEquipmentRelations = relations(compendiumEquipment, ({ many }) => ({
  substitutesFor: many(compendiumEquipmentFulfillment, {
    relationName: 'equipmentSubstitutions',
  }),
}));

export const compendiumEquipmentFulfillmentRelations = relations(
  compendiumEquipmentFulfillment,
  ({ one }) => ({
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
  })
);

export type NewCompendiumEquipment = typeof compendiumEquipment.$inferInsert;
export type NewCompendiumEquipmentFulfillment = typeof compendiumEquipmentFulfillment.$inferInsert;
