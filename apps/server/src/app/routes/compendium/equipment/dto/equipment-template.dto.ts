import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  type EquipmentCategory,
  EquipmentCategory as EquipmentCategoryEnum,
  type CreateEquipmentDto,
  type EquipmentResponseDto,
} from '@resitr/api';

export class CreateEquipmentTemplateDto implements CreateEquipmentDto {
  @IsString()
  name!: string;

  @IsString()
  displayName!: string;

  @IsString()
  templateId!: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(EquipmentCategoryEnum)
  @IsOptional()
  category?: EquipmentCategory;

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
