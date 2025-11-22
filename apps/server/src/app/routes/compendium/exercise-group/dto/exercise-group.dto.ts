import { Transform } from 'class-transformer';
import { IsString, IsOptional } from 'class-validator';
import { type CreateExerciseGroupDto as CreateExerciseGroupDtoType, type ExerciseGroupResponseDto } from '@resitr/api';

export class CreateExerciseGroupDto implements CreateExerciseGroupDtoType {
  @IsString()
  id!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateExerciseGroupResponseDto extends CreateExerciseGroupDto implements ExerciseGroupResponseDto {
  @IsString()
  createdBy!: string;

  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  @IsString()
  createdAt!: string;

  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  @IsString()
  @IsOptional()
  updatedAt?: string;
}
