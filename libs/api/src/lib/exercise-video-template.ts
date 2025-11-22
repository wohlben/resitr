import type { VideoSource } from './video-source';

export type ExerciseVideoTemplate = {
  exerciseTemplateId: string;
  url: string;
  title?: string;
  description?: string;
  video_source?: VideoSource;
  createdBy: string;
  createdAt: string;
};
