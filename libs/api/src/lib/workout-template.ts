export enum WorkoutSectionType {
  WARMUP = 'warmup',
  STRETCHING = 'stretching',
  STRENGTH = 'strength',
  COOLDOWN = 'cooldown',
}

export const WorkoutSectionTypeLabels = {
  warmup: 'Warm Up',
  stretching: 'Stretching',
  strength: 'Strength',
  cooldown: 'Cool Down',
} as const satisfies Record<WorkoutSectionType, string>;

export type WorkoutSectionItemTemplate = {
  id: string;
  exerciseId: string;
  breakBetweenSets: number;
  breakAfter: number;
  createdBy: string;
  createdAt: string;
};

export type WorkoutSectionTemplate = {
  id: string;
  type: WorkoutSectionType;
  name: string;
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
