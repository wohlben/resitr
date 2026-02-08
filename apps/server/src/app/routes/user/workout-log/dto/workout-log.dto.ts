import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  WorkoutSectionType,
  type UpsertSetDto as IUpsertSetDto,
  type UpsertSectionItemDto as IUpsertSectionItemDto,
  type UpsertSectionDto as IUpsertSectionDto,
  type UpsertWorkoutLogDto as IUpsertWorkoutLogDto,
  type UpdateSetDto as IUpdateSetDto,
  type SkipSetsDto as ISkipSetsDto,
} from '@resitr/api';

export class UpsertSetDto implements IUpsertSetDto {
  @ApiProperty({ description: 'Set ID (for updates)', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Target number of repetitions', required: false })
  @IsOptional()
  @IsInt()
  targetReps?: number;

  @ApiProperty({ description: 'Achieved number of repetitions', minimum: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  achievedReps?: number;

  @ApiProperty({ description: 'Target weight in kg', required: false })
  @IsOptional()
  @IsNumber()
  targetWeight?: number;

  @ApiProperty({ description: 'Achieved weight in kg', required: false })
  @IsOptional()
  @IsNumber()
  achievedWeight?: number;

  @ApiProperty({ description: 'Target time in seconds', minimum: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  targetTime?: number;

  @ApiProperty({ description: 'Achieved time in seconds', minimum: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  achievedTime?: number;

  @ApiProperty({ description: 'Target distance in meters', required: false })
  @IsOptional()
  @IsNumber()
  targetDistance?: number;

  @ApiProperty({ description: 'Achieved distance in meters', required: false })
  @IsOptional()
  @IsNumber()
  achievedDistance?: number;

  @ApiProperty({ description: 'Timestamp when the set was completed', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  completedAt?: Date;

  @ApiProperty({ description: 'Whether the set was skipped', required: false })
  @IsOptional()
  @IsBoolean()
  skipped?: boolean;
}

export class UpsertSectionItemDto implements IUpsertSectionItemDto {
  @ApiProperty({ description: 'Section item ID (for updates)', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Exercise ID' })
  @IsString()
  exerciseId!: string;

  @ApiProperty({ description: 'Exercise name' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Rest duration between sets in seconds' })
  @IsInt()
  restBetweenSets!: number;

  @ApiProperty({ description: 'Break duration after this item in seconds' })
  @IsInt()
  breakAfter!: number;

  @ApiProperty({ description: 'Timestamp when the item was completed', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  completedAt?: Date;

  @ApiProperty({ description: 'List of sets for this item', type: [UpsertSetDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertSetDto)
  sets!: UpsertSetDto[];
}

export class UpsertSectionDto implements IUpsertSectionDto {
  @ApiProperty({ description: 'Section ID (for updates)', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Section name' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Type of workout section', enum: WorkoutSectionType })
  @IsEnum(WorkoutSectionType)
  type!: WorkoutSectionType;

  @ApiProperty({ description: 'Timestamp when the section was completed', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  completedAt?: Date;

  @ApiProperty({ description: 'List of items in this section', type: [UpsertSectionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertSectionItemDto)
  items!: UpsertSectionItemDto[];
}

export class UpsertWorkoutLogDto implements IUpsertWorkoutLogDto {
  @ApiProperty({ description: 'Workout log ID (for updates)', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'User workout ID this log belongs to' })
  @IsString()
  userWorkoutId!: string;

  @ApiProperty({ description: 'Original workout template ID this log is based on', required: false })
  @IsOptional()
  @IsString()
  originalWorkoutId?: string;

  @ApiProperty({ description: 'Workout name' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Timestamp when the workout was started' })
  @IsDate()
  @Type(() => Date)
  startedAt!: Date;

  @ApiProperty({ description: 'Timestamp when the workout was completed', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  completedAt?: Date;

  @ApiProperty({ description: 'List of sections in the workout log', type: [UpsertSectionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertSectionDto)
  sections!: UpsertSectionDto[];
}

export class UpdateSetDto implements IUpdateSetDto {
  @ApiProperty({ description: 'Achieved number of repetitions', minimum: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  achievedReps?: number;

  @ApiProperty({ description: 'Achieved weight in kg', required: false })
  @IsOptional()
  achievedWeight?: number;

  @ApiProperty({ description: 'Achieved time in seconds', minimum: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  achievedTime?: number;

  @ApiProperty({ description: 'Achieved distance in meters', required: false })
  @IsOptional()
  achievedDistance?: number;
}

export class SkipSetsDto implements ISkipSetsDto {
  @ApiProperty({ description: 'List of set IDs to skip', type: [String] })
  @IsString({ each: true })
  setIds!: string[];
}
