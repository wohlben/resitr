import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { type CreateExerciseGroupMemberDto as CreateExerciseGroupMemberDtoType, type ExerciseGroupMemberResponseDto } from '@resitr/api';

export class CreateExerciseGroupMemberDto implements CreateExerciseGroupMemberDtoType {
  @ApiProperty({ description: 'Exercise template ID' })
  @IsString()
  exerciseTemplateId!: string;

  @ApiProperty({ description: 'Exercise group ID' })
  @IsString()
  groupId!: string;
}

export class CreateExerciseGroupMemberResponseDto extends CreateExerciseGroupMemberDto implements ExerciseGroupMemberResponseDto {
  @ApiProperty({ description: 'User ID who added the exercise to the group' })
  @IsString()
  addedBy!: string;

  @ApiProperty({ description: 'Timestamp when the exercise was added to the group in ISO format' })
  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  @IsString()
  addedAt!: string;
}
