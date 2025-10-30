import { Injectable } from '@nestjs/common';
import { CompendiumEquipmentRepository } from '../../persistence/repositories/compendium-equipment.repository';
import { EquipmentTemplate } from '@resitr/api'
@Injectable()
export class CompendiumEquipmentService {
  constructor(private readonly repository: CompendiumEquipmentRepository) {}

  async create(data: EquipmentTemplate): Promise<EquipmentTemplate>{
    const { substitutesFor, ...equipmentData } = data;
    const result = await this.repository.create(equipmentData);

    if (substitutesFor && substitutesFor.length > 0) {
      await this.repository.setSubstitutesFor(result.templateId, substitutesFor, 'system');
      return this.repository.findById(result.templateId);
    }

    return result;
  }

  async findAll(): Promise<EquipmentTemplate[]> {
    return this.repository.findAll();
  }

  async findById(templateId: string): Promise<EquipmentTemplate> {
    return this.repository.findById(templateId);
  }

  async findByName(name: string): Promise<EquipmentTemplate> {
    return this.repository.findByName(name);
  }

  async update(templateId: string, data: Partial<EquipmentTemplate>): Promise<EquipmentTemplate> {
    const { substitutesFor, ...equipmentData } = data;

    if (substitutesFor !== undefined) {
      await this.repository.setSubstitutesFor(templateId, substitutesFor, 'system');
    }

    if (Object.keys(equipmentData).length > 0) {
      await this.repository.update(templateId, equipmentData);
    }

    return this.repository.findById(templateId);
  }

  async delete(templateId: string) {
    return this.repository.delete(templateId);
  }
}
