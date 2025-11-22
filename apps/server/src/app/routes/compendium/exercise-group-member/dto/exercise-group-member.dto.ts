import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';
import { type CreateExerciseGroupMemberDto as CreateExerciseGroupMemberDtoType, type ExerciseGroupMemberResponseDto } from '@resitr/api';

export class CreateExerciseGroupMemberDto implements CreateExerciseGroupMemberDtoType {
  @IsString()
  exerciseTemplateId!: string;

  @IsString()
  groupId!: string;
}

export class CreateExerciseGroupMemberResponseDto extends CreateExerciseGroupMemberDto implements ExerciseGroupMemberResponseDto {
  @IsString()
  addedBy!: string;

  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  @IsString()
  addedAt!: string;
}
