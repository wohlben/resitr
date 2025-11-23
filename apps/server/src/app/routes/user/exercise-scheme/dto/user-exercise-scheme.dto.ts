import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { MeasurementType } from '@resitr/api';

export class CreateUserExerciseSchemeDto {
  @IsString()
  exerciseId!: string;

  @IsString()
  name!: string;

  @IsEnum(MeasurementType)
  measurementType!: MeasurementType;

  @IsInt()
  @Min(1)
  sets!: number;

  @IsInt()
  @Min(1)
  reps!: number;

  @IsInt()
  @Min(0)
  restBetweenSets!: number;

  // REP_BASED EMOM RFT
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  timePerRep?: number;

  // TIME BASED AMRAP
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  // DISTANCE BASED
  @IsOptional()
  @IsNumber()
  @Min(0)
  distance?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  targetTime?: number;
}

export class UpdateUserExerciseSchemeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(MeasurementType)
  measurementType?: MeasurementType;

  @IsOptional()
  @IsInt()
  @Min(1)
  sets?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  reps?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  restBetweenSets?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  timePerRep?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  distance?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  targetTime?: number;
}

export class UserExerciseSchemeResponseDto extends CreateUserExerciseSchemeDto {
  @IsString()
  id!: string;

  @IsString()
  userId!: string;

  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  @IsString()
  createdAt!: string;

  @IsOptional()
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  @IsString()
  updatedAt?: string;
}

export class AddToWorkoutSectionDto {
  @IsString()
  sectionItemId!: string;

  @IsString()
  workoutTemplateId!: string;
}

export class RemoveFromWorkoutSectionDto {
  @IsString()
  sectionItemId!: string;

  @IsString()
  workoutTemplateId!: string;
}
