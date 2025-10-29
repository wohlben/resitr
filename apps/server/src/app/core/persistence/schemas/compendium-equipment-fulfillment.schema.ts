import {
  primaryKey,
  sqliteTable,
  text,
  real,
  integer,
} from 'drizzle-orm/sqlite-core';
import { compendiumEquipment } from './compendium-equipment.schema';
import { sql } from 'drizzle-orm';

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

    // Optional: strength/confidence of substitution (0-1)
    // e.g., adjustable bench is perfect for incline (1.0) vs partial substitute (0.7)
    strength: real('strength').default(1.0),

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

export type CompendiumEquipmentFulfillment = typeof compendiumEquipmentFulfillment.$inferInsert;
