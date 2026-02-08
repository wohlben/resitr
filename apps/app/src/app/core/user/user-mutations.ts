import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import type {
  UpsertWorkoutLogDto,
  UpdateSetDto,
  SkipSetsDto,
  WorkoutLogResponseDto,
  CreateUserWorkoutDto,
  UserWorkoutResponseDto,
  CreateWorkoutScheduleDto,
  WorkoutScheduleResponseDto,
  CreateWorkoutScheduleCriteriaDto,
  UpdateWorkoutScheduleCriteriaDto,
  WorkoutScheduleCriteriaResponseDto,
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
    delete: (client: HttpClient, id: string) => lastValueFrom(client.delete<void>(`/api/user/workout/${id}`)),
  },

  workoutSchedule: {
    create: (client: HttpClient, data: CreateWorkoutScheduleDto) =>
      lastValueFrom(client.post<WorkoutScheduleResponseDto>('/api/user/workout-schedule', data)),
    delete: (client: HttpClient, id: string) => lastValueFrom(client.delete<void>(`/api/user/workout-schedule/${id}`)),
    createCriteria: (client: HttpClient, scheduleId: string, data: CreateWorkoutScheduleCriteriaDto) =>
      lastValueFrom(
        client.post<WorkoutScheduleCriteriaResponseDto>(`/api/user/workout-schedule/${scheduleId}/criteria`, data)
      ),
    updateCriteria: (
      client: HttpClient,
      scheduleId: string,
      criteriaId: string,
      data: UpdateWorkoutScheduleCriteriaDto
    ) =>
      lastValueFrom(
        client.put<WorkoutScheduleCriteriaResponseDto>(
          `/api/user/workout-schedule/${scheduleId}/criteria/${criteriaId}`,
          data
        )
      ),
    deleteCriteria: (client: HttpClient, scheduleId: string, criteriaId: string) =>
      lastValueFrom(client.delete<void>(`/api/user/workout-schedule/${scheduleId}/criteria/${criteriaId}`)),
  },

  exerciseScheme: {
    create: (client: HttpClient, data: CreateUserExerciseSchemeDto) =>
      lastValueFrom(client.post<UserExerciseSchemeResponseDto>('/api/user/exercise-scheme', data)),
    update: (client: HttpClient, id: string, data: UpdateUserExerciseSchemeDto) =>
      lastValueFrom(client.put<UserExerciseSchemeResponseDto>(`/api/user/exercise-scheme/${id}`, data)),
    delete: (client: HttpClient, id: string) => lastValueFrom(client.delete<void>(`/api/user/exercise-scheme/${id}`)),
    assignToSectionItem: (client: HttpClient, id: string, data: AssignToSectionItemDto) =>
      lastValueFrom(client.post<void>(`/api/user/exercise-scheme/${id}/assign-to`, data)),
    unassignFromSectionItem: (client: HttpClient, id: string, data: UnassignFromSectionItemDto) =>
      lastValueFrom(client.delete<void>(`/api/user/exercise-scheme/${id}/assign-to`, { body: data })),
  },
} as const;
