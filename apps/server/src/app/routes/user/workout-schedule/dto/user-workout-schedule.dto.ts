import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateUserWorkoutScheduleDto {
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

export class UpdateUserWorkoutScheduleDto {
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
