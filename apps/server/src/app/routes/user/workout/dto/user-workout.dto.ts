import { IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import type {
  CreateUserWorkoutDto as ICreateUserWorkoutDto,
  UserWorkoutResponseDto as IUserWorkoutResponseDto,
} from '@resitr/api';

export class CreateUserWorkoutDto implements ICreateUserWorkoutDto {
  @ApiProperty({ description: 'Workout template ID to add' })
  @IsString()
  workoutTemplateId!: string;
}

export class UserWorkoutResponseDto implements IUserWorkoutResponseDto {
  @ApiProperty({ description: 'Unique identifier for the user workout' })
  @IsString()
  id!: string;

  @ApiProperty({ description: 'User ID who owns this workout' })
  @IsString()
  userId!: string;

  @ApiProperty({ description: 'Workout template ID' })
  @IsString()
  workoutTemplateId!: string;

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
