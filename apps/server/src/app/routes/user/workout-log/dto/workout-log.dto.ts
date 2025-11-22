import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { WorkoutSectionType } from '../../../../core/persistence/schemas/compendium-workout-section.schema';

export class UpsertSetDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsInt()
  orderIndex!: number;

  @IsOptional()
  @IsInt()
  targetReps?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  achievedReps?: number;

  @IsOptional()
  @IsNumber()
  targetWeight?: number;

  @IsOptional()
  @IsNumber()
  achievedWeight?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  targetTime?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  achievedTime?: number;

  @IsOptional()
  @IsNumber()
  targetDistance?: number;

  @IsOptional()
  @IsNumber()
  achievedDistance?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  completedAt?: Date;

  @IsOptional()
  @IsBoolean()
  skipped?: boolean;
}

export class UpsertSectionItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  exerciseId!: string;

  @IsString()
  name!: string;

  @IsInt()
  orderIndex!: number;

  @IsInt()
  restBetweenSets!: number;

  @IsInt()
  breakAfter!: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  completedAt?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertSetDto)
  sets!: UpsertSetDto[];
}

export class UpsertSectionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  name!: string;

  @IsInt()
  orderIndex!: number;

  @IsEnum(WorkoutSectionType)
  type!: WorkoutSectionType;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  completedAt?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertSectionItemDto)
  items!: UpsertSectionItemDto[];
}

export class UpsertWorkoutLogDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  originalWorkoutId?: string;

  @IsString()
  name!: string;

  @IsDate()
  @Type(() => Date)
  startedAt!: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  completedAt?: Date;

  @IsOptional()
  @IsInt()
  duration?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertSectionDto)
  sections!: UpsertSectionDto[];
}

export class UpdateSetDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  achievedReps?: number;

  @IsOptional()
  achievedWeight?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  achievedTime?: number;

  @IsOptional()
  achievedDistance?: number;
}

export class SkipSetsDto {
  @IsString({ each: true })
  setIds!: string[];
}
