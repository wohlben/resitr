import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ExerciseRelationshipType } from '@resitr/api';

export class CreateExerciseRelationshipDto {
  @IsString()
  fromExerciseTemplateId!: string;

  @IsString()
  toExerciseTemplateId!: string;

  @IsEnum(ExerciseRelationshipType)
  relationshipType!: ExerciseRelationshipType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  strength?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateExerciseRelationshipResponseDto extends CreateExerciseRelationshipDto {
  @IsString()
  createdBy!: string;

  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  @IsString()
  createdAt!: string;
}
