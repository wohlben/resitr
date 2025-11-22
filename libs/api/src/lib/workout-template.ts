export enum WorkoutSectionType {
  WARMUP = 'warmup',
  STRETCHING = 'stretching',
  STRENGTH = 'strength',
  COOLDOWN = 'cooldown',
}

export type WorkoutSectionItemTemplate = {
  id: string;
  sectionId: string;
  exerciseSchemeId: string;
  orderIndex: number;
  breakBetweenSets: number;
  breakAfter: number;
  createdBy: string;
  createdAt: string;
};

export type WorkoutSectionTemplate = {
  id: string;
  workoutTemplateId: string;
  type: WorkoutSectionType;
  name: string;
  orderIndex: number;
  items: WorkoutSectionItemTemplate[];
  createdBy: string;
  createdAt: string;
};

export type WorkoutTemplate = {
  templateId: string;
  name: string;
  description?: string;
  sections: WorkoutSectionTemplate[];
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
};
