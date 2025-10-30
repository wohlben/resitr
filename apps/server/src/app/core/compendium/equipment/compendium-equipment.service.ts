import { Injectable } from '@nestjs/common';
import { CompendiumEquipmentRepository } from '../../persistence/repositories/compendium-equipment.repository';
import { EquipmentTemplate } from '@resitr/api'
@Injectable()
export class CompendiumEquipmentService {
  constructor(private readonly repository: CompendiumEquipmentRepository) {}

  async create(data: EquipmentTemplate): Promise<EquipmentTemplate>{
    return this.repository.create(data);
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
    return this.repository.update(templateId, data);
  }

  async delete(templateId: string) {
    return this.repository.delete(templateId);
  }
}
