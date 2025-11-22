import type { WorkoutTemplate } from '../workout-template';

export type CreateWorkoutDto = Omit<WorkoutTemplate, 'createdBy' | 'createdAt' | 'updatedAt'>;
export type UpdateWorkoutDto = Partial<CreateWorkoutDto>;
export type WorkoutResponseDto = WorkoutTemplate;
