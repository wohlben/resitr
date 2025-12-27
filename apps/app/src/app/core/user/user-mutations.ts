import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import type {
  UpsertWorkoutLogDto,
  UpdateSetDto,
  SkipSetsDto,
  WorkoutLogResponseDto,
  CreateUserWorkoutDto,
  UserWorkoutResponseDto,
  CreateUserWorkoutScheduleDto,
  UpdateUserWorkoutScheduleDto,
  UserWorkoutScheduleResponseDto,
  CreateUserExerciseSchemeDto,
  UpdateUserExerciseSchemeDto,
  UserExerciseSchemeResponseDto,
  AssignToSectionItemDto,
  UnassignFromSectionItemDto,
} from '@resitr/api';

export const UserMutations = {
  workoutLog: {
    upsert: (client: HttpClient, data: UpsertWorkoutLogDto) =>
      lastValueFrom(client.put<WorkoutLogResponseDto>('/api/user/workout-logs', data)),
    completeSet: (client: HttpClient, setId: string, data: UpdateSetDto) =>
      lastValueFrom(client.post<WorkoutLogResponseDto>(`/api/user/workout-logs/sets/${setId}/complete`, data)),
    skipSets: (client: HttpClient, data: SkipSetsDto) =>
      lastValueFrom(client.post<void>('/api/user/workout-logs/sets/skip', data)),
  },

  workout: {
    create: (client: HttpClient, data: CreateUserWorkoutDto) =>
      lastValueFrom(client.post<UserWorkoutResponseDto>('/api/user/workout', data)),
    delete: (client: HttpClient, id: string) =>
      lastValueFrom(client.delete<void>(`/api/user/workout/${id}`)),
  },

  workoutSchedule: {
    create: (client: HttpClient, data: CreateUserWorkoutScheduleDto) =>
      lastValueFrom(client.post<UserWorkoutScheduleResponseDto>('/api/user/workout-schedule', data)),
    update: (client: HttpClient, id: string, data: UpdateUserWorkoutScheduleDto) =>
      lastValueFrom(client.put<UserWorkoutScheduleResponseDto>(`/api/user/workout-schedule/${id}`, data)),
    delete: (client: HttpClient, id: string) =>
      lastValueFrom(client.delete<void>(`/api/user/workout-schedule/${id}`)),
  },

  exerciseScheme: {
    create: (client: HttpClient, data: CreateUserExerciseSchemeDto) =>
      lastValueFrom(client.post<UserExerciseSchemeResponseDto>('/api/user/exercise-scheme', data)),
    update: (client: HttpClient, id: string, data: UpdateUserExerciseSchemeDto) =>
      lastValueFrom(client.put<UserExerciseSchemeResponseDto>(`/api/user/exercise-scheme/${id}`, data)),
    delete: (client: HttpClient, id: string) =>
      lastValueFrom(client.delete<void>(`/api/user/exercise-scheme/${id}`)),
    assignToSectionItem: (client: HttpClient, id: string, data: AssignToSectionItemDto) =>
      lastValueFrom(client.post<void>(`/api/user/exercise-scheme/${id}/assign-to`, data)),
    unassignFromSectionItem: (client: HttpClient, id: string, data: UnassignFromSectionItemDto) =>
      lastValueFrom(client.delete<void>(`/api/user/exercise-scheme/${id}/assign-to`, { body: data })),
  },
} as const;
