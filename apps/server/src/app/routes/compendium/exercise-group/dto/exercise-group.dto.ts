import { Transform } from 'class-transformer';
import { IsString, IsOptional } from 'class-validator';
import { ExerciseGroupTemplate } from '@resitr/api';

export class CreateExerciseGroupDto implements Omit<ExerciseGroupTemplate, 'createdAt' | 'updatedAt' | 'createdBy'> {
  @IsString()
  id!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateExerciseGroupResponseDto extends CreateExerciseGroupDto implements ExerciseGroupTemplate {
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
