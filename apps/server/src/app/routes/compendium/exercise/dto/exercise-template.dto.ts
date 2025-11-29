import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsArray, IsEnum, IsNumber, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ description: 'Unique template identifier for the exercise' })
  @IsString()
  templateId!: string;

  @ApiProperty({ description: 'Primary name of the exercise' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Alternative names for the exercise', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  alternativeNames?: string[];

  @ApiProperty({ description: 'Type of exercise', enum: ExerciseType })
  @IsEnum(ExerciseType)
  type!: ExerciseType;

  @ApiProperty({ description: 'Force types involved in the exercise', enum: ForceType, isArray: true })
  @IsArray()
  @IsEnum(ForceType, { each: true })
  force!: ForceType[];

  @ApiProperty({ description: 'Suggested measurement paradigms for tracking', enum: MeasurementParadigm, isArray: true, required: false })
  @IsArray()
  @IsEnum(MeasurementParadigm, { each: true })
  @IsOptional()
  suggestedMeasurementParadigms?: MeasurementParadigm[];

  @ApiProperty({ description: 'Detailed description of the exercise', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Step-by-step instructions for performing the exercise', type: [String] })
  @IsArray()
  @IsString({ each: true })
  instructions!: string[];

  @ApiProperty({ description: 'Primary muscles targeted by the exercise', enum: Muscle, isArray: true })
  @IsArray()
  @IsEnum(Muscle, { each: true })
  primaryMuscles!: Muscle[];

  @ApiProperty({ description: 'Secondary muscles engaged during the exercise', enum: Muscle, isArray: true })
  @IsArray()
  @IsEnum(Muscle, { each: true })
  secondaryMuscles!: Muscle[];

  @ApiProperty({ description: 'IDs of required equipment', type: [String] })
  @IsArray()
  @IsString({ each: true })
  equipmentIds!: string[];

  @ApiProperty({ description: 'Body weight scaling factor (0-1, where 1 = full body weight)' })
  @IsNumber()
  bodyWeightScaling!: number;

  @ApiProperty({ description: 'Technical difficulty level', enum: TechnicalDifficulty })
  @IsEnum(TechnicalDifficulty)
  technicalDifficulty!: TechnicalDifficulty;

  @ApiProperty({ description: 'URLs to exercise demonstration images', type: [String] })
  @IsArray()
  @IsString({ each: true })
  images!: string[];

  @ApiProperty({ description: 'Author or creator name', required: false })
  @IsString()
  @IsOptional()
  authorName?: string;

  @ApiProperty({ description: 'URL to author profile or website', required: false })
  @IsUrl()
  @IsOptional()
  authorUrl?: string;

  @ApiProperty({ description: 'Version number for tracking changes' })
  @IsNumber()
  version!: number;
}

export class CreateExerciseTemplateResponseDto extends CreateExerciseTemplateDto implements ExerciseResponseDto {
  @ApiProperty({ description: 'User ID of the creator' })
  @IsString()
  createdBy!: string;

  @ApiProperty({ description: 'Creation timestamp in ISO format' })
  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  @IsString()
  createdAt!: string;

  @ApiProperty({ description: 'Last update timestamp in ISO format' })
  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  @IsString()
  updatedAt!: string;
}

