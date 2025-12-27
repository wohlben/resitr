import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import type {
  WorkoutLogResponseDto,
  UserWorkoutResponseDto,
  UserWorkoutScheduleResponseDto,
  UserExerciseSchemeResponseDto,
} from '@resitr/api';

export const UserQueries = {
  // Workout Log
  workoutLog: {
    detail: (id: string) => ({
      key: `user-workout-log-detail-${id}`,
      fn: (client: HttpClient) => lastValueFrom(client.get<WorkoutLogResponseDto>(`/api/user/workout-logs/${id}`))
    }),
  },

  // User Workout
  workout: {
    list: {
      key: 'user-workouts',
      fn: (client: HttpClient) => lastValueFrom(client.get<UserWorkoutResponseDto[]>('/api/user/workout'))
    },
    detail: (id: string) => ({
      key: `user-workout-detail-${id}`,
      fn: (client: HttpClient) => lastValueFrom(client.get<UserWorkoutResponseDto>(`/api/user/workout/${id}`))
    }),
  },

  // Workout Schedule
  workoutSchedule: {
    list: {
      key: 'user-workout-schedules',
      fn: (client: HttpClient) => lastValueFrom(client.get<UserWorkoutScheduleResponseDto[]>('/api/user/workout-schedule'))
    },
    byDay: (dayOfWeek: number) => ({
      key: `user-workout-schedules-day-${dayOfWeek}`,
      fn: (client: HttpClient) => lastValueFrom(client.get<UserWorkoutScheduleResponseDto[]>(`/api/user/workout-schedule?dayOfWeek=${dayOfWeek}`))
    }),
    detail: (id: string) => ({
      key: `user-workout-schedule-detail-${id}`,
      fn: (client: HttpClient) => lastValueFrom(client.get<UserWorkoutScheduleResponseDto>(`/api/user/workout-schedule/${id}`))
    }),
  },

  // Exercise Scheme
  exerciseScheme: {
    list: {
      key: 'user-exercise-schemes',
      fn: (client: HttpClient) => lastValueFrom(client.get<UserExerciseSchemeResponseDto[]>('/api/user/exercise-scheme'))
    },
    byExercise: (exerciseId: string) => ({
      key: `user-exercise-schemes-exercise-${exerciseId}`,
      fn: (client: HttpClient) => lastValueFrom(client.get<UserExerciseSchemeResponseDto[]>(`/api/user/exercise-scheme?exerciseId=${exerciseId}`))
    }),
    detail: (id: string) => ({
      key: `user-exercise-scheme-detail-${id}`,
      fn: (client: HttpClient) => lastValueFrom(client.get<UserExerciseSchemeResponseDto>(`/api/user/exercise-scheme/${id}`))
    }),
  },
} as const;
