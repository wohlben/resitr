import { sqliteTable, text, primaryKey, integer } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { EquipmentCategory } from '@resitr/api';

export const compendiumEquipment = sqliteTable('compendium_equipment', {
  templateId: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  category: text('category').$type<EquipmentCategory>(),
  imageUrl: text('image_url'),
});

export const compendiumEquipmentFulfillment = sqliteTable(
  'compendium_equipment_fulfillments',
  {
    equipmentId: text('equipment_id')
      .notNull()
      .references(() => compendiumEquipment.templateId, {
        onDelete: 'cascade',
      }),
    fulfillsEquipmentId: text('fulfills_equipment_id')
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
    primaryKey({ columns: [table.equipmentId, table.fulfillsEquipmentId] }),
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
      fields: [compendiumEquipmentFulfillment.equipmentId],
      references: [compendiumEquipment.templateId],
      relationName: 'equipmentSubstitutions',
    }),
    fulfillsEquipment: one(compendiumEquipment, {
      fields: [compendiumEquipmentFulfillment.fulfillsEquipmentId],
      references: [compendiumEquipment.templateId],
      relationName: 'fulfilledBy',
    }),
  })
);

export type CompendiumEquipment = typeof compendiumEquipment.$inferInsert;
export type CompendiumEquipmentFulfillment = typeof compendiumEquipmentFulfillment.$inferInsert;
