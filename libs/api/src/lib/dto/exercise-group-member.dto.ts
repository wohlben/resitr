import type { ExerciseGroupMemberTemplate } from '../exercise-group-member-template';

export type CreateExerciseGroupMemberDto = Omit<ExerciseGroupMemberTemplate, 'addedBy' | 'addedAt'>;
export type ExerciseGroupMemberResponseDto = ExerciseGroupMemberTemplate;
