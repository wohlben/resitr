import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import type {
  UpsertWorkoutLogDto,
  UpdateSetDto,
  SkipSetsDto,
  WorkoutLogResponseDto,
} from '@resitr/api';

export const UserWorkoutLogMutations = {
  // Upsert a workout log (create or update based on presence of id)
  upsert: (client: HttpClient, data: UpsertWorkoutLogDto) =>
    lastValueFrom(client.put<WorkoutLogResponseDto>('/api/user/workout-logs', data)),

  // Complete a set (update and mark as completed)
  completeSet: (client: HttpClient, setId: string, data: UpdateSetDto) =>
    lastValueFrom(client.post<WorkoutLogResponseDto>(`/api/user/workout-logs/sets/${setId}/complete`, data)),

  // Skip multiple sets
  skipSets: (client: HttpClient, data: SkipSetsDto) =>
    lastValueFrom(client.post<void>('/api/user/workout-logs/sets/skip', data)),
} as const;
