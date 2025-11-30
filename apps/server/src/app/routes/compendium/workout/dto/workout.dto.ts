import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  WorkoutSectionType,
  type CreateWorkoutSectionItemDto as ICreateWorkoutSectionItemDto,
  type CreateWorkoutSectionDto as ICreateWorkoutSectionDto,
  type CreateWorkoutDto as ICreateWorkoutDto,
  type WorkoutResponseDto,
  type WorkoutSectionItemTemplate,
  type WorkoutSectionTemplate,
} from '@resitr/api';

export class CreateWorkoutSectionItemDto implements ICreateWorkoutSectionItemDto {
  @ApiProperty({ description: 'Exercise ID to include in this section item' })
  @IsString()
  exerciseId!: string;

  @ApiProperty({ description: 'Break duration between sets in seconds', minimum: 0 })
  @IsInt()
  @Min(0)
  breakBetweenSets!: number;

  @ApiProperty({ description: 'Break duration after completing this item in seconds', minimum: 0 })
  @IsInt()
  @Min(0)
  breakAfter!: number;
}

export class CreateWorkoutSectionDto implements ICreateWorkoutSectionDto {
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

export class CreateWorkoutDto implements ICreateWorkoutDto {
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

// Response DTOs for nested structures
export class WorkoutSectionItemResponseDto extends CreateWorkoutSectionItemDto implements WorkoutSectionItemTemplate {
  @ApiProperty({ description: 'Unique identifier for the section item' })
  @IsString()
  id!: string;

  @ApiProperty({ description: 'Section ID this item belongs to' })
  @IsString()
  sectionId!: string;

  @ApiProperty({ description: 'User ID of the creator' })
  @IsString()
  createdBy!: string;

  @ApiProperty({ description: 'Creation timestamp in ISO format' })
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  @IsString()
  createdAt!: string;
}

export class WorkoutSectionResponseDto implements WorkoutSectionTemplate {
  @ApiProperty({ description: 'Unique identifier for the section' })
  @IsString()
  id!: string;

  @ApiProperty({ description: 'Workout template ID this section belongs to' })
  @IsString()
  workoutTemplateId!: string;

  @ApiProperty({ description: 'Type of workout section', enum: WorkoutSectionType })
  @IsEnum(WorkoutSectionType)
  type!: WorkoutSectionType;

  @ApiProperty({ description: 'Name of the workout section' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'List of items in this section', type: [WorkoutSectionItemResponseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutSectionItemResponseDto)
  items!: WorkoutSectionItemResponseDto[];

  @ApiProperty({ description: 'User ID of the creator' })
  @IsString()
  createdBy!: string;

  @ApiProperty({ description: 'Creation timestamp in ISO format' })
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  @IsString()
  createdAt!: string;
}

export class CreateWorkoutResponseDto implements WorkoutResponseDto {
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

  @ApiProperty({ description: 'List of sections in the workout', type: [WorkoutSectionResponseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutSectionResponseDto)
  sections!: WorkoutSectionResponseDto[];

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
