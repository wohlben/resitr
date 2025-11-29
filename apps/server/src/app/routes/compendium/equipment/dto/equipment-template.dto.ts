import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  type EquipmentCategory,
  EquipmentCategory as EquipmentCategoryEnum,
  type CreateEquipmentDto,
  type EquipmentResponseDto,
} from '@resitr/api';

export class CreateEquipmentTemplateDto implements CreateEquipmentDto {
  @ApiProperty({ description: 'Unique name identifier for the equipment' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Display name for the equipment' })
  @IsString()
  displayName!: string;

  @ApiProperty({ description: 'Template ID for the equipment' })
  @IsString()
  templateId!: string;

  @ApiProperty({ description: 'URL to equipment image', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: 'Description of the equipment', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Equipment category',
    enum: EquipmentCategoryEnum,
    required: false
  })
  @IsEnum(EquipmentCategoryEnum)
  @IsOptional()
  category?: EquipmentCategory;

  @ApiProperty({
    description: 'List of equipment IDs this can substitute for',
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  substitutesFor!: string[];
}

export class CreateEquipmentTemplateResponseDto extends CreateEquipmentTemplateDto implements EquipmentResponseDto {
  @Transform(({ obj }) => obj.imageUrl ?? undefined)
  imageUrl?: string;

  @Transform(({ value }) => value ?? undefined)
  description?: string;

  @Transform(({ value }) => value ?? undefined)
  category?: EquipmentCategory;

  @Transform(({ value }) => !value.length ? undefined: null)
  substitutesFor!: string[];
}
