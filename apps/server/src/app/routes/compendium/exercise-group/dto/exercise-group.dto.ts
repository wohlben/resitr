import { Transform } from 'class-transformer';
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { type CreateExerciseGroupDto as CreateExerciseGroupDtoType, type ExerciseGroupResponseDto } from '@resitr/api';

export class CreateExerciseGroupDto implements CreateExerciseGroupDtoType {
  @ApiProperty({ description: 'Name of the exercise group' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Description of the exercise group', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateExerciseGroupResponseDto extends CreateExerciseGroupDto implements ExerciseGroupResponseDto {
  @ApiProperty({ description: 'Unique identifier for the exercise group' })
  @IsString()
  id!: string;

  @ApiProperty({ description: 'User ID of the creator' })
  @IsString()
  createdBy!: string;

  @ApiProperty({ description: 'Creation timestamp in ISO format' })
  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  @IsString()
  createdAt!: string;

  @ApiProperty({ description: 'Last update timestamp in ISO format', required: false })
  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  @IsString()
  @IsOptional()
  updatedAt?: string;
}
