import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WorkoutSectionType } from '@resitr/api';

export class CreateWorkoutSectionItemDto {
  @ApiProperty({ description: 'Exercise scheme ID to include in this section item' })
  @IsString()
  exerciseSchemeId!: string;

  @ApiProperty({ description: 'Break duration between sets in seconds', minimum: 0 })
  @IsInt()
  @Min(0)
  breakBetweenSets!: number;

  @ApiProperty({ description: 'Break duration after completing this item in seconds', minimum: 0 })
  @IsInt()
  @Min(0)
  breakAfter!: number;
}

export class CreateWorkoutSectionDto {
  @ApiProperty({ description: 'Type of workout section', enum: WorkoutSectionType })
  @IsEnum(WorkoutSectionType)
  type!: WorkoutSectionType;

  @ApiProperty({ description: 'Name of the workout section' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'List of exercises/items in this section', type: [CreateWorkoutSectionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutSectionItemDto)
  items!: CreateWorkoutSectionItemDto[];
}

export class CreateWorkoutDto {
  @ApiProperty({ description: 'Unique template identifier for the workout' })
  @IsString()
  templateId!: string;

  @ApiProperty({ description: 'Name of the workout' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Description of the workout', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Version number for tracking changes', minimum: 1 })
  @IsInt()
  @Min(1)
  version!: number;

  @ApiProperty({ description: 'List of sections in the workout', type: [CreateWorkoutSectionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutSectionDto)
  sections!: CreateWorkoutSectionDto[];
}

export class CreateWorkoutResponseDto extends CreateWorkoutDto {
  @ApiProperty({ description: 'User ID of the creator' })
  @IsString()
  createdBy!: string;

  @ApiProperty({ description: 'Creation timestamp in ISO format' })
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  @IsString()
  createdAt!: string;

  @ApiProperty({ description: 'Last update timestamp in ISO format', required: false })
  @IsOptional()
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  @IsString()
  updatedAt?: string;
}
