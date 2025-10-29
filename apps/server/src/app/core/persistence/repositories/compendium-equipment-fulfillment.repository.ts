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

  async findByEquipmentId(equipmentId: string) {
    return this.db
      .select()
      .from(compendiumEquipmentFulfillment)
      .where(eq(compendiumEquipmentFulfillment.equipmentId, equipmentId));
  }

  async findByFulfillsEquipmentId(fulfillsEquipmentId: string) {
    return this.db
      .select()
      .from(compendiumEquipmentFulfillment)
      .where(eq(compendiumEquipmentFulfillment.fulfillsEquipmentId, fulfillsEquipmentId));
  }

  async findByCompositeKey(equipmentId: string, fulfillsEquipmentId: string) {
    const [result] = await this.db
      .select()
      .from(compendiumEquipmentFulfillment)
      .where(
        and(
          eq(compendiumEquipmentFulfillment.equipmentId, equipmentId),
          eq(compendiumEquipmentFulfillment.fulfillsEquipmentId, fulfillsEquipmentId)
        )
      );
    return result;
  }

  async update(equipmentId: string, fulfillsEquipmentId: string, data: Partial<CompendiumEquipmentFulfillment>) {
    const [result] = await this.db
      .update(compendiumEquipmentFulfillment)
      .set(data)
      .where(
        and(
          eq(compendiumEquipmentFulfillment.equipmentId, equipmentId),
          eq(compendiumEquipmentFulfillment.fulfillsEquipmentId, fulfillsEquipmentId)
        )
      )
      .returning();
    return result;
  }

  async delete(equipmentId: string, fulfillsEquipmentId: string) {
    const [result] = await this.db
      .delete(compendiumEquipmentFulfillment)
      .where(
        and(
          eq(compendiumEquipmentFulfillment.equipmentId, equipmentId),
          eq(compendiumEquipmentFulfillment.fulfillsEquipmentId, fulfillsEquipmentId)
        )
      )
      .returning();
    return result;
  }
}
