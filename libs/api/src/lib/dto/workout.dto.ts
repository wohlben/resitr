import type { WorkoutSectionType, WorkoutTemplate } from '../workout-template';

// Create DTOs for nested structures
export type CreateWorkoutSectionItemDto = {
  exerciseId: string;
  breakBetweenSets: number;
  breakAfter: number;
};

export type CreateWorkoutSectionDto = {
  type: WorkoutSectionType;
  name: string;
  items: CreateWorkoutSectionItemDto[];
};

export type CreateWorkoutDto = {
  templateId: string;
  name: string;
  description?: string;
  sections: CreateWorkoutSectionDto[];
  version: number;
};

export type UpdateWorkoutDto = Partial<CreateWorkoutDto>;
export type WorkoutResponseDto = WorkoutTemplate;
