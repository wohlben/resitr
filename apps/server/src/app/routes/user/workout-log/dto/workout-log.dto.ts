import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { WorkoutSectionType } from '../../../../core/persistence/schemas/compendium-workout-section.schema';

export class CreateSetDto {
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

export class CreateSectionItemDto {
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
  @Type(() => CreateSetDto)
  sets!: CreateSetDto[];
}

export class CreateSectionDto {
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
  @Type(() => CreateSectionItemDto)
  items!: CreateSectionItemDto[];
}

export class CreateWorkoutLogDto {
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
  @Type(() => CreateSectionDto)
  sections!: CreateSectionDto[];
}

export class UpsertSetDto extends CreateSetDto {
  @IsOptional()
  @IsString()
  id?: string;
}

export class UpsertSectionItemDto extends CreateSectionItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertSetDto)
  sets!: UpsertSetDto[];
}

export class UpsertSectionDto extends CreateSectionDto {
  @IsOptional()
  @IsString()
  id?: string;

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

export class UpdateWorkoutLogDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  duration?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  completedAt?: Date;
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
