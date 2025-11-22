import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { MeasurementType } from '@resitr/api';

export class CreateExerciseSchemeDto {
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

export class CreateExerciseSchemeResponseDto extends CreateExerciseSchemeDto {
  @IsString()
  id!: string;

  @IsString()
  createdBy!: string;

  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  @IsString()
  createdAt!: string;
}
