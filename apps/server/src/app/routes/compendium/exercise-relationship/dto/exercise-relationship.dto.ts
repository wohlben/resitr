import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ExerciseRelationshipType, type CreateExerciseRelationshipDto as CreateExerciseRelationshipDtoType, type ExerciseRelationshipResponseDto } from '@resitr/api';

export class CreateExerciseRelationshipDto implements CreateExerciseRelationshipDtoType {
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

export class CreateExerciseRelationshipResponseDto extends CreateExerciseRelationshipDto implements ExerciseRelationshipResponseDto {
  @IsString()
  createdBy!: string;

  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  @IsString()
  createdAt!: string;
}
