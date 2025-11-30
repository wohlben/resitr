import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  MeasurementType,
  type CreateUserExerciseSchemeDto as ICreateUserExerciseSchemeDto,
  type UpdateUserExerciseSchemeDto as IUpdateUserExerciseSchemeDto,
  type UserExerciseSchemeResponseDto as IUserExerciseSchemeResponseDto,
  type AssignToSectionItemDto as IAssignToSectionItemDto,
  type UnassignFromSectionItemDto as IUnassignFromSectionItemDto,
} from '@resitr/api';

export class CreateUserExerciseSchemeDto implements ICreateUserExerciseSchemeDto {
  @ApiProperty({ description: 'Exercise ID this scheme is for' })
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

  @ApiProperty({ description: 'Number of repetitions per set', minimum: 1 })
  @IsInt()
  @Min(1)
  reps!: number;

  @ApiProperty({ description: 'Rest duration between sets in seconds', minimum: 0 })
  @IsInt()
  @Min(0)
  restBetweenSets!: number;

  @ApiProperty({ description: 'Weight in kg (for REP_BASED, EMOM, RFT)', minimum: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiProperty({ description: 'Time per repetition in seconds (for REP_BASED, EMOM, RFT)', minimum: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  timePerRep?: number;

  @ApiProperty({ description: 'Duration in seconds (for TIME_BASED, AMRAP)', minimum: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @ApiProperty({ description: 'Distance in meters (for DISTANCE_BASED)', minimum: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  distance?: number;

  @ApiProperty({ description: 'Target time to complete in seconds (for DISTANCE_BASED)', minimum: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  targetTime?: number;
}

export class UpdateUserExerciseSchemeDto implements IUpdateUserExerciseSchemeDto {
  @ApiProperty({ description: 'Name of the exercise scheme', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Type of measurement for this scheme', enum: MeasurementType, required: false })
  @IsOptional()
  @IsEnum(MeasurementType)
  measurementType?: MeasurementType;

  @ApiProperty({ description: 'Number of sets', minimum: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  sets?: number;

  @ApiProperty({ description: 'Number of repetitions per set', minimum: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  reps?: number;

  @ApiProperty({ description: 'Rest duration between sets in seconds', minimum: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  restBetweenSets?: number;

  @ApiProperty({ description: 'Weight in kg', minimum: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiProperty({ description: 'Time per repetition in seconds', minimum: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  timePerRep?: number;

  @ApiProperty({ description: 'Duration in seconds', minimum: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @ApiProperty({ description: 'Distance in meters', minimum: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  distance?: number;

  @ApiProperty({ description: 'Target time to complete in seconds', minimum: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  targetTime?: number;
}

export class UserExerciseSchemeResponseDto extends CreateUserExerciseSchemeDto implements IUserExerciseSchemeResponseDto {
  @ApiProperty({ description: 'Exercise scheme ID' })
  @IsString()
  id!: string;

  @ApiProperty({ description: 'User ID who owns this scheme' })
  @IsString()
  userId!: string;

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

export class AssignToSectionItemDto implements IAssignToSectionItemDto {
  @ApiProperty({ description: 'Workout section item ID to assign to' })
  @IsString()
  sectionItemId!: string;

  @ApiProperty({ description: 'Workout template ID containing the section item' })
  @IsString()
  workoutTemplateId!: string;
}

export class UnassignFromSectionItemDto implements IUnassignFromSectionItemDto {
  @ApiProperty({ description: 'Workout section item ID to unassign from' })
  @IsString()
  sectionItemId!: string;

  @ApiProperty({ description: 'Workout template ID containing the section item' })
  @IsString()
  workoutTemplateId!: string;
}
