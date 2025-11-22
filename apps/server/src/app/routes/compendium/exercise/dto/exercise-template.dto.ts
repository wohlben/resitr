import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsArray, IsEnum, IsNumber, IsUrl } from 'class-validator';
import {
  type CreateExerciseDto,
  type ExerciseResponseDto,
  ExerciseType,
  ForceType,
  MeasurementParadigm,
  Muscle,
  TechnicalDifficulty,
} from '@resitr/api';

export class CreateExerciseTemplateDto implements CreateExerciseDto {
  @IsString()
  templateId!: string;

  @IsString()
  name!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  alternativeNames?: string[];

  @IsEnum(ExerciseType)
  type!: ExerciseType;

  @IsArray()
  @IsEnum(ForceType, { each: true })
  force!: ForceType[];

  @IsArray()
  @IsEnum(MeasurementParadigm, { each: true })
  @IsOptional()
  suggestedMeasurementParadigms?: MeasurementParadigm[];

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  instructions!: string[];

  @IsArray()
  @IsEnum(Muscle, { each: true })
  primaryMuscles!: Muscle[];

  @IsArray()
  @IsEnum(Muscle, { each: true })
  secondaryMuscles!: Muscle[];

  @IsArray()
  @IsString({ each: true })
  equipmentIds!: string[];

  @IsNumber()
  bodyWeightScaling!: number;

  @IsEnum(TechnicalDifficulty)
  technicalDifficulty!: TechnicalDifficulty;

  @IsArray()
  @IsString({ each: true })
  images!: string[];

  @IsString()
  @IsOptional()
  authorName?: string;

  @IsUrl()
  @IsOptional()
  authorUrl?: string;

  @IsNumber()
  version!: number;
}

export class CreateExerciseTemplateResponseDto extends CreateExerciseTemplateDto implements ExerciseResponseDto {
  @IsString()
  createdBy!: string;

  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  @IsString()
  createdAt!: string;

  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  @IsString()
  updatedAt!: string;
}

