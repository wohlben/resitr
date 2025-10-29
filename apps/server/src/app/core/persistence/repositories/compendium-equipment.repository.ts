import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import { compendiumEquipment, type CompendiumEquipment } from '../schemas';

@Injectable()
export class CompendiumEquipmentRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(data: CompendiumEquipment) {
    const [result] = await this.db.insert(compendiumEquipment).values(data).returning();
    return result;
  }

  async findAll() {
    const results = await this.db.query.compendiumEquipment.findMany({
      with: {
        substitutesFor: true,
      },
    });

    return results.map((equipment) => ({
      ...equipment,
      substitutesFor: equipment.substitutesFor.map((f) => f.fulfillsEquipmentId),
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
      substitutesFor: result.substitutesFor.map((f) => f.fulfillsEquipmentId),
    };
  }

  async findByName(name: string) {
    const [result] = await this.db.select().from(compendiumEquipment).where(eq(compendiumEquipment.name, name));
    return result;
  }

  async update(templateId: string, data: Partial<CompendiumEquipment>) {
    const [result] = await this.db
      .update(compendiumEquipment)
      .set(data)
      .where(eq(compendiumEquipment.templateId, templateId))
      .returning();
    return result;
  }

  async delete(templateId: string) {
    const [result] = await this.db
      .delete(compendiumEquipment)
      .where(eq(compendiumEquipment.templateId, templateId))
      .returning();
    return result;
  }
}
