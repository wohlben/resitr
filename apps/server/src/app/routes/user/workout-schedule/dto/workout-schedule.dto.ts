import { IsString, IsNotEmpty, IsEnum, IsNumber, IsArray, ArrayMinSize } from 'class-validator';

export class CreateWorkoutScheduleDto {
  @IsString()
  @IsNotEmpty()
  userWorkoutId!: string;
}

export class CreateWorkoutScheduleCriteriaDto {
  @IsEnum(['DAY_OF_WEEK'])
  type!: 'DAY_OF_WEEK';

  @IsArray()
  @ArrayMinSize(1)
  days!: number[];
}

export class UpdateWorkoutScheduleCriteriaDto {
  @IsEnum(['DAY_OF_WEEK'])
  type!: 'DAY_OF_WEEK';

  @IsArray()
  @ArrayMinSize(1)
  days!: number[];

  @IsNumber()
  order!: number;
}

export interface WorkoutScheduleCriteriaResponseDto {
  id: string;
  scheduleId: string;
  type: 'DAY_OF_WEEK';
  order: number;
  days: number[];
}

export interface WorkoutScheduleResponseDto {
  id: string;
  userId: string;
  userWorkoutId: string;
  criteria: WorkoutScheduleCriteriaResponseDto[];
  createdAt: string;
  updatedAt: string | undefined;
}
