import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CompendiumEquipmentService } from '../../../core/compendium/equipment/compendium-equipment.service';
import { UserId } from '../../../common/decorators/user-id.decorator';
import { CreateEquipmentTemplateDto, CreateEquipmentTemplateResponseDto } from './dto/equipment-template.dto';
import { plainToInstance } from 'class-transformer';

@Controller('compendium/equipment')
export class EquipmentController {
  constructor(private compendiumEquipmentService: CompendiumEquipmentService) {}

  @Get()
  async findAll(): Promise<CreateEquipmentTemplateResponseDto[]> {
    const equipments = await this.compendiumEquipmentService.findAll();
    return equipments.map((equipment) => plainToInstance(CreateEquipmentTemplateResponseDto, equipment));
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<CreateEquipmentTemplateResponseDto> {
    const equipment = this.compendiumEquipmentService.findById(id);
    return plainToInstance(CreateEquipmentTemplateResponseDto, equipment);
  }

  @Post()
  async create(
    @Body() data: CreateEquipmentTemplateDto,
    @UserId() userId: string
  ): Promise<CreateEquipmentTemplateResponseDto> {
    const equipment = this.compendiumEquipmentService.create(data, userId);
    return plainToInstance(CreateEquipmentTemplateResponseDto, equipment);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: CreateEquipmentTemplateDto,
    @UserId() userId: string
  ): Promise<CreateEquipmentTemplateResponseDto> {
    const equipment = this.compendiumEquipmentService.update(id, data, userId);
    return plainToInstance(CreateEquipmentTemplateResponseDto, equipment);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @UserId() userId: string) {
    return this.compendiumEquipmentService.delete(id, userId);
  }
}
