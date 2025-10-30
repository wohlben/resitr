import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import { compendiumEquipmentFulfillment, type CompendiumEquipmentFulfillment } from '../schemas';

@Injectable()
export class CompendiumEquipmentFulfillmentRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(data: CompendiumEquipmentFulfillment) {
    const [result] = await this.db.insert(compendiumEquipmentFulfillment).values(data).returning();
    return result;
  }

  async findAll() {
    return this.db.select().from(compendiumEquipmentFulfillment);
  }

  async findByEquipmentId(equipmentTemplateId: string) {
    return this.db
      .select()
      .from(compendiumEquipmentFulfillment)
      .where(eq(compendiumEquipmentFulfillment.equipmentTemplateId, equipmentTemplateId));
  }

  async findByFulfillsEquipmentTemplateId(fulfillsEquipmentTemplateId: string) {
    return this.db
      .select()
      .from(compendiumEquipmentFulfillment)
      .where(eq(compendiumEquipmentFulfillment.fulfillsEquipmentTemplateId, fulfillsEquipmentTemplateId));
  }

  async findByCompositeKey(equipmentTemplateId: string, fulfillsEquipmentTemplateId: string) {
    const [result] = await this.db
      .select()
      .from(compendiumEquipmentFulfillment)
      .where(
        and(
          eq(compendiumEquipmentFulfillment.equipmentTemplateId, equipmentTemplateId),
          eq(compendiumEquipmentFulfillment.fulfillsEquipmentTemplateId, fulfillsEquipmentTemplateId)
        )
      );
    return result;
  }

  async update(equipmentTemplateId: string, fulfillsEquipmentTemplateId: string, data: Partial<CompendiumEquipmentFulfillment>) {
    const [result] = await this.db
      .update(compendiumEquipmentFulfillment)
      .set(data)
      .where(
        and(
          eq(compendiumEquipmentFulfillment.equipmentTemplateId, equipmentTemplateId),
          eq(compendiumEquipmentFulfillment.fulfillsEquipmentTemplateId, fulfillsEquipmentTemplateId)
        )
      )
      .returning();
    return result;
  }

  async delete(equipmentTemplateId: string, fulfillsEquipmentTemplateId: string) {
    const [result] = await this.db
      .delete(compendiumEquipmentFulfillment)
      .where(
        and(
          eq(compendiumEquipmentFulfillment.equipmentTemplateId, equipmentTemplateId),
          eq(compendiumEquipmentFulfillment.fulfillsEquipmentTemplateId, fulfillsEquipmentTemplateId)
        )
      )
      .returning();
    return result;
  }
}
