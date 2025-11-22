import { WorkoutSectionType } from '../workout-template';

// Set DTOs
export interface SetResponseDto {
  id: string;
  orderIndex: number;
  targetReps?: number;
  achievedReps?: number;
  targetWeight?: number;
  achievedWeight?: number;
  targetTime?: number;
  achievedTime?: number;
  targetDistance?: number;
  achievedDistance?: number;
  completedAt?: Date;
  skipped?: boolean;
}

export interface UpdateSetDto {
  achievedReps?: number;
  achievedWeight?: number;
  achievedTime?: number;
  achievedDistance?: number;
}

export interface UpsertSetDto {
  id?: string;
  orderIndex: number;
  targetReps?: number;
  achievedReps?: number;
  targetWeight?: number;
  achievedWeight?: number;
  targetTime?: number;
  achievedTime?: number;
  targetDistance?: number;
  achievedDistance?: number;
  completedAt?: Date;
  skipped?: boolean;
}

// Section Item DTOs
export interface SectionItemResponseDto {
  id: string;
  exerciseId: string;
  name: string;
  orderIndex: number;
  restBetweenSets: number;
  breakAfter: number;
  completedAt?: Date;
  sets: SetResponseDto[];
}

export interface UpsertSectionItemDto {
  id?: string;
  exerciseId: string;
  name: string;
  orderIndex: number;
  restBetweenSets: number;
  breakAfter: number;
  completedAt?: Date;
  sets: UpsertSetDto[];
}

// Section DTOs
export interface SectionResponseDto {
  id: string;
  name: string;
  orderIndex: number;
  type: WorkoutSectionType;
  completedAt?: Date;
  items: SectionItemResponseDto[];
}

export interface UpsertSectionDto {
  id?: string;
  name: string;
  orderIndex: number;
  type: WorkoutSectionType;
  completedAt?: Date;
  items: UpsertSectionItemDto[];
}

// Workout Log DTOs
export interface WorkoutLogResponseDto {
  id: string;
  originalWorkoutId?: string;
  name: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  sections: SectionResponseDto[];
}

export interface UpsertWorkoutLogDto {
  id?: string;
  originalWorkoutId?: string;
  name: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  sections: UpsertSectionDto[];
}

export interface SkipSetsDto {
  setIds: string[];
}
