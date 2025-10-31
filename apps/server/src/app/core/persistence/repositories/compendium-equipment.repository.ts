import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import { compendiumEquipment, compendiumEquipmentFulfillment, type NewCompendiumEquipment } from '../schemas';

@Injectable()
export class CompendiumEquipmentRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(data: NewCompendiumEquipment) {
    const [result] = await this.db.insert(compendiumEquipment).values(data).returning();

    return this.getById(result.templateId);
  }

  async findAll() {
    const results = await this.db.query.compendiumEquipment.findMany({
      with: {
        substitutesFor: true,
      },
    });

    return results.map((equipment) => ({
      ...equipment,
      substitutesFor: equipment.substitutesFor.map((f) => f.fulfillsEquipmentTemplateId),
    }));
  }

  async findById(templateId: string) {
    const result = await this.db.query.compendiumEquipment.findFirst({
      where: eq(compendiumEquipment.templateId, templateId),
      with: {
        substitutesFor: true,
      },
    });

    if (!result) {
      return undefined;
    }

    return {
      ...result,
      substitutesFor: result.substitutesFor.map((f) => f.fulfillsEquipmentTemplateId),
    };
  }

  async getById(templateId: string) {
    const result = await this.findById(templateId);
    if (!result) {
      throw new Error(`Equipment with templateId ${templateId} not found`);
    }
    return result;
  }

  async findByName(name: string) {
    const result = await this.db.query.compendiumEquipment.findFirst({
      where: eq(compendiumEquipment.name, name),
      with: {
        substitutesFor: true,
      },
    });

    if (!result) {
      return undefined;
    }

    return {
      ...result,
      substitutesFor: result.substitutesFor.map((f) => f.fulfillsEquipmentTemplateId),
    };
  }

  async update(templateId: string, data: Partial<NewCompendiumEquipment>) {
    await this.db.update(compendiumEquipment).set(data).where(eq(compendiumEquipment.templateId, templateId));

    return this.getById(templateId);
  }

  async delete(templateId: string) {
    await this.db.delete(compendiumEquipment).where(eq(compendiumEquipment.templateId, templateId));
  }

  async upsert(data: NewCompendiumEquipment) {
    const { templateId, ...updateData } = data;
    const [result] = await this.db
      .insert(compendiumEquipment)
      .values(data)
      .onConflictDoUpdate({
        target: compendiumEquipment.templateId,
        set: updateData,
      })
      .returning();
    return this.getById(result.templateId);
  }

  async setSubstitutesFor(equipmentTemplateId: string, fulfillsTemplateIds: string[], createdBy: string) {
    const existing = await this.db.query.compendiumEquipmentFulfillment.findMany({
      where: eq(compendiumEquipmentFulfillment.equipmentTemplateId, equipmentTemplateId),
    });

    const existingIds = new Set(existing.map((f) => f.fulfillsEquipmentTemplateId));
    const desiredIds = new Set(fulfillsTemplateIds);

    const obsoleteFulfillment = existing
      .filter((f) => !desiredIds.has(f.fulfillsEquipmentTemplateId))
      .map((f) => f.fulfillsEquipmentTemplateId);

    const newFulfillment = fulfillsTemplateIds.filter((id) => !existingIds.has(id));

    if (obsoleteFulfillment.length > 0) {
      await this.db
        .delete(compendiumEquipmentFulfillment)
        .where(
          and(
            eq(compendiumEquipmentFulfillment.equipmentTemplateId, equipmentTemplateId),
            inArray(compendiumEquipmentFulfillment.fulfillsEquipmentTemplateId, obsoleteFulfillment)
          )
        );
    }

    if (newFulfillment.length > 0) {
      await this.db.insert(compendiumEquipmentFulfillment).values(
        newFulfillment.map((fulfillsId) => ({
          equipmentTemplateId,
          fulfillsEquipmentTemplateId: fulfillsId,
          createdBy,
        }))
      );
    }
  }
}
