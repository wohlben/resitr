import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { WorkoutSectionType } from '../../../../core/persistence/schemas';

export class CreateWorkoutSectionItemDto {
  @IsString()
  exerciseSchemeId!: string;

  @IsInt()
  @Min(0)
  orderIndex!: number;

  @IsInt()
  @Min(0)
  breakBetweenSets!: number;

  @IsInt()
  @Min(0)
  breakAfter!: number;
}

export class CreateWorkoutSectionDto {
  @IsEnum(WorkoutSectionType)
  type!: WorkoutSectionType;

  @IsString()
  name!: string;

  @IsInt()
  @Min(0)
  orderIndex!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutSectionItemDto)
  items!: CreateWorkoutSectionItemDto[];
}

export class CreateWorkoutDto {
  @IsString()
  templateId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  version!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutSectionDto)
  sections!: CreateWorkoutSectionDto[];

  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  schedule!: number[]; // Array of day numbers (0-6)
}

export class CreateWorkoutResponseDto extends CreateWorkoutDto {
  @IsString()
  createdBy!: string;

  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  @IsString()
  createdAt!: string;

  @IsOptional()
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  @IsString()
  updatedAt?: string;
}
