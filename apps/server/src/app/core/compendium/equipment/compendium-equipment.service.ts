import { Injectable } from '@nestjs/common';
import { CompendiumEquipmentRepository } from '../../persistence/repositories/compendium-equipment.repository';
import { CompendiumEquipment } from '../../persistence/schemas';

@Injectable()
export class CompendiumEquipmentService {
  constructor(private readonly repository: CompendiumEquipmentRepository) {}

  async create(data: CompendiumEquipment) {
    return this.repository.create(data);
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

  async update(templateId: string, data: Partial<CompendiumEquipment>) {
    return this.repository.update(templateId, data);
  }

  async delete(templateId: string) {
    return this.repository.delete(templateId);
  }
}
