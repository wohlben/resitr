import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';
import type {
  CreateUserWorkoutScheduleDto as ICreateUserWorkoutScheduleDto,
  UpdateUserWorkoutScheduleDto as IUpdateUserWorkoutScheduleDto,
} from '@resitr/api';

export class CreateUserWorkoutScheduleDto implements ICreateUserWorkoutScheduleDto {
  @IsString()
  workoutTemplateId!: string;

  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class UpdateUserWorkoutScheduleDto implements IUpdateUserWorkoutScheduleDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
