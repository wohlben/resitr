import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MeasurementType, type CreateExerciseSchemeDto as CreateExerciseSchemeDtoType, type ExerciseSchemeResponseDto } from '@resitr/api';

export class CreateExerciseSchemeDto implements CreateExerciseSchemeDtoType {
  @ApiProperty({ description: 'ID of the exercise this scheme applies to' })
  @IsString()
  exerciseId!: string;

  @ApiProperty({ description: 'Name of the exercise scheme' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Type of measurement for this scheme', enum: MeasurementType })
  @IsEnum(MeasurementType)
  measurementType!: MeasurementType;

  @ApiProperty({ description: 'Number of sets', minimum: 1 })
  @IsInt()
  @Min(1)
  sets!: number;

  @ApiProperty({ description: 'Number of reps per set', minimum: 1 })
  @IsInt()
  @Min(1)
  reps!: number;

  @ApiProperty({ description: 'Rest time between sets in seconds', minimum: 0 })
  @IsInt()
  @Min(0)
  restBetweenSets!: number;

  @ApiProperty({ description: 'Weight in kg (for REP_BASED, EMOM, RFT)', required: false, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiProperty({ description: 'Time per rep in seconds (for tempo work)', required: false, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  timePerRep?: number;

  @ApiProperty({ description: 'Duration in seconds (for TIME_BASED, AMRAP)', required: false, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @ApiProperty({ description: 'Distance in meters (for DISTANCE_BASED)', required: false, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  distance?: number;

  @ApiProperty({ description: 'Target time in seconds (for distance-based exercises)', required: false, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  targetTime?: number;
}

export class CreateExerciseSchemeResponseDto extends CreateExerciseSchemeDto implements ExerciseSchemeResponseDto {
  @ApiProperty({ description: 'Unique identifier for this scheme' })
  @IsString()
  id!: string;

  @ApiProperty({ description: 'User ID of the creator' })
  @IsString()
  createdBy!: string;

  @ApiProperty({ description: 'Creation timestamp in ISO format' })
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  @IsString()
  createdAt!: string;
}
