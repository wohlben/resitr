import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type {
  CreateUserWorkoutScheduleDto as ICreateUserWorkoutScheduleDto,
  UpdateUserWorkoutScheduleDto as IUpdateUserWorkoutScheduleDto,
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
