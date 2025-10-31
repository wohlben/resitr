import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';
import { ExerciseGroupMemberTemplate } from '@resitr/api';

export class CreateExerciseGroupMemberDto implements Omit<ExerciseGroupMemberTemplate, 'addedAt' | 'addedBy'> {
  @IsString()
  exerciseTemplateId!: string;

  @IsString()
  groupId!: string;
}

export class CreateExerciseGroupMemberResponseDto extends CreateExerciseGroupMemberDto implements ExerciseGroupMemberTemplate {
  @IsString()
  addedBy!: string;

  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  @IsString()
  addedAt!: string;
}
