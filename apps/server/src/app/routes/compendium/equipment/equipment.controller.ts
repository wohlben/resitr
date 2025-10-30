import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CompendiumEquipmentService } from '../../../core/compendium/equipment/compendium-equipment.service';
import { EquipmentTemplate } from '@resitr/api';

@Controller('equipment')
export class EquipmentController {
  constructor(private compendiumEquipmentService: CompendiumEquipmentService) {}

  @Get()
  async findAll(): Promise<EquipmentTemplate[]> {
    return this.compendiumEquipmentService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<EquipmentTemplate> {
    return this.compendiumEquipmentService.findById(id);
  }

  @Post()
  async create(@Body() data: EquipmentTemplate): Promise<EquipmentTemplate> {
    return this.compendiumEquipmentService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<EquipmentTemplate>) {
    return this.compendiumEquipmentService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.compendiumEquipmentService.delete(id);
  }
}
