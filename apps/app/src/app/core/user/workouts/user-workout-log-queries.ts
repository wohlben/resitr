import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import type { WorkoutLogResponseDto } from '@resitr/api';

export const UserWorkoutLogQueries = {
  // Get a specific workout log by ID
  detail: (id: string) => ({
    key: `user-workout-log-detail-${id}`,
    fn: (client: HttpClient) => lastValueFrom(client.get<WorkoutLogResponseDto>(`/api/user/workout-logs/${id}`))
  }),
} as const;
