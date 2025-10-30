import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import { compendiumEquipment, type CompendiumEquipment } from '../schemas';

@Injectable()
export class CompendiumEquipmentRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(data: CompendiumEquipment) {
    const [result] = await this.db.insert(compendiumEquipment).values(data).returning();
    return this.findById(result.templateId);
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

  async update(templateId: string, data: Partial<CompendiumEquipment>) {
    await this.db
      .update(compendiumEquipment)
      .set(data)
      .where(eq(compendiumEquipment.templateId, templateId));

    return this.findById(templateId);
  }

  async delete(templateId: string) {
    await this.db
      .delete(compendiumEquipment)
      .where(eq(compendiumEquipment.templateId, templateId));
  }

  async upsert(data: CompendiumEquipment) {
    const { templateId, ...updateData } = data;
    const [result] = await this.db
      .insert(compendiumEquipment)
      .values(data)
      .onConflictDoUpdate({
        target: compendiumEquipment.templateId,
        set: updateData,
      })
      .returning();
    return this.findById(result.templateId);
  }
}
