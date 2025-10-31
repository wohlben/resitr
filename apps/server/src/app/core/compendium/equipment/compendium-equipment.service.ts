import { Injectable } from '@nestjs/common';
import { CompendiumEquipmentRepository } from '../../persistence/repositories/compendium-equipment.repository';
import { CreateEquipmentTemplateDto } from '../../../routes/compendium/equipment/dto/equipment-template.dto';

@Injectable()
export class CompendiumEquipmentService {
  constructor(private readonly repository: CompendiumEquipmentRepository) {}

  async create(data: CreateEquipmentTemplateDto, createdBy: string) {
    const { substitutesFor, ...equipmentData } = data;
    const result = await this.repository.create(equipmentData);

    if (substitutesFor && substitutesFor.length > 0) {
      await this.repository.setSubstitutesFor(data.templateId, substitutesFor, createdBy);
      return this.repository.findById(data.templateId);
    }

    return result;
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(templateId: string) {
    return this.repository.findById(templateId);
  }

  async findByName(name: string) {
    return this.repository.findByName(name);
  }

  async update(templateId: string, data: CreateEquipmentTemplateDto, updatedBy: string) {
    const { substitutesFor, ...equipmentData } = data;

    if (substitutesFor !== undefined) {
      await this.repository.setSubstitutesFor(templateId, substitutesFor, updatedBy);
    }

    if (Object.keys(equipmentData).length > 0) {
      await this.repository.upsert({ ...equipmentData, templateId });
    }

    return this.repository.findById(templateId);
  }

  async delete(templateId: string, deletedBy?: string) {
    return this.repository.delete(templateId);
  }
}
