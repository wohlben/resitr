import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { EquipmentCategory } from '@resitr/api';

export const compendiumEquipment = sqliteTable('compendium_equipments', {
  templateId: text('template_id').primaryKey(),
  name: text('name').notNull().unique(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  category: text('category').$type<EquipmentCategory>(),
  imageUrl: text('image_url'),
});


export type NewCompendiumEquipment = typeof compendiumEquipment.$inferInsert;
