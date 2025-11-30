import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import type {
  CreateUserWorkoutScheduleDto as ICreateUserWorkoutScheduleDto,
  UpdateUserWorkoutScheduleDto as IUpdateUserWorkoutScheduleDto,
  UserWorkoutScheduleResponseDto as IUserWorkoutScheduleResponseDto,
} from '@resitr/api';

export class CreateUserWorkoutScheduleDto implements ICreateUserWorkoutScheduleDto {
  @ApiProperty({ description: 'Workout template ID to schedule' })
  @IsString()
  workoutTemplateId!: string;

  @ApiProperty({ description: 'Day of week (0-6, Sunday-Saturday)', minimum: 0 })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty({ description: 'Order/position within the day', minimum: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class UpdateUserWorkoutScheduleDto implements IUpdateUserWorkoutScheduleDto {
  @ApiProperty({ description: 'Day of week (0-6, Sunday-Saturday)', minimum: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @ApiProperty({ description: 'Order/position within the day', minimum: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class UserWorkoutScheduleResponseDto implements IUserWorkoutScheduleResponseDto {
  @ApiProperty({ description: 'Unique identifier for the schedule' })
  @IsString()
  id!: string;

  @ApiProperty({ description: 'User ID who owns this schedule' })
  @IsString()
  userId!: string;

  @ApiProperty({ description: 'Workout template ID' })
  @IsString()
  workoutTemplateId!: string;

  @ApiProperty({ description: 'Day of week (0-6, Sunday-Saturday)' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty({ description: 'Order/position within the day' })
  @IsInt()
  @Min(0)
  order!: number;

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
