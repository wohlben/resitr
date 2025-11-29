import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CompendiumEquipmentService } from '../../../core/compendium/equipment/compendium-equipment.service';
import { UserId } from '../../../common/decorators/user-id.decorator';
import { CreateEquipmentTemplateDto, CreateEquipmentTemplateResponseDto } from './dto/equipment-template.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('compendium:equipment')
@Controller('compendium/equipment')
export class EquipmentController {
  constructor(private compendiumEquipmentService: CompendiumEquipmentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all equipment', description: 'Retrieve a list of all equipment templates' })
  @ApiResponse({ status: 200, description: 'List of equipment retrieved successfully', type: [CreateEquipmentTemplateResponseDto] })
  async findAll(): Promise<CreateEquipmentTemplateResponseDto[]> {
    const equipments = await this.compendiumEquipmentService.findAll();
    return equipments.map((equipment) => plainToInstance(CreateEquipmentTemplateResponseDto, equipment));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get equipment by ID', description: 'Retrieve a specific equipment template by its ID' })
  @ApiParam({ name: 'id', description: 'Equipment template ID' })
  @ApiResponse({ status: 200, description: 'Equipment retrieved successfully', type: CreateEquipmentTemplateResponseDto })
  @ApiResponse({ status: 404, description: 'Equipment not found' })
  async findById(@Param('id') id: string): Promise<CreateEquipmentTemplateResponseDto> {
    const equipment = this.compendiumEquipmentService.findById(id);
    return plainToInstance(CreateEquipmentTemplateResponseDto, equipment);
  }

  @Post()
  @ApiOperation({ summary: 'Create equipment', description: 'Create a new equipment template' })
  @ApiResponse({ status: 201, description: 'Equipment created successfully', type: CreateEquipmentTemplateResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Body() data: CreateEquipmentTemplateDto,
    @UserId() userId: string
  ): Promise<CreateEquipmentTemplateResponseDto> {
    const equipment = this.compendiumEquipmentService.create(data, userId);
    return plainToInstance(CreateEquipmentTemplateResponseDto, equipment);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update equipment', description: 'Update an existing equipment template' })
  @ApiParam({ name: 'id', description: 'Equipment template ID' })
  @ApiResponse({ status: 200, description: 'Equipment updated successfully', type: CreateEquipmentTemplateResponseDto })
  @ApiResponse({ status: 404, description: 'Equipment not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async update(
    @Param('id') id: string,
    @Body() data: CreateEquipmentTemplateDto,
    @UserId() userId: string
  ): Promise<CreateEquipmentTemplateResponseDto> {
    const equipment = this.compendiumEquipmentService.update(id, data, userId);
    return plainToInstance(CreateEquipmentTemplateResponseDto, equipment);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete equipment', description: 'Delete an equipment template' })
  @ApiParam({ name: 'id', description: 'Equipment template ID' })
  @ApiResponse({ status: 200, description: 'Equipment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Equipment not found' })
  async delete(@Param('id') id: string, @UserId() userId: string) {
    return this.compendiumEquipmentService.delete(id, userId);
  }
}
