import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExerciseRelationshipType, type CreateExerciseRelationshipDto as CreateExerciseRelationshipDtoType, type ExerciseRelationshipResponseDto } from '@resitr/api';

export class CreateExerciseRelationshipDto implements CreateExerciseRelationshipDtoType {
  @ApiProperty({ description: 'Source exercise template ID' })
  @IsString()
  fromExerciseTemplateId!: string;

  @ApiProperty({ description: 'Target exercise template ID' })
  @IsString()
  toExerciseTemplateId!: string;

  @ApiProperty({ description: 'Type of relationship between exercises', enum: ExerciseRelationshipType })
  @IsEnum(ExerciseRelationshipType)
  relationshipType!: ExerciseRelationshipType;

  @ApiProperty({ description: 'Strength of the relationship (0-1)', minimum: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  strength?: number;

  @ApiProperty({ description: 'Description of the relationship', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateExerciseRelationshipResponseDto extends CreateExerciseRelationshipDto implements ExerciseRelationshipResponseDto {
  @ApiProperty({ description: 'User ID of the creator' })
  @IsString()
  createdBy!: string;

  @ApiProperty({ description: 'Creation timestamp in ISO format' })
  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  @IsString()
  createdAt!: string;
}
