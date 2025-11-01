import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { compendiumEquipment } from './compendium-equipment.schema';

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
export type NewCompendiumEquipmentFulfillment = typeof compendiumEquipmentFulfillment.$inferInsert;
