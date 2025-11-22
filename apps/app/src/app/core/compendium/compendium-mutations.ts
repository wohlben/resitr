import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import type {
  CreateEquipmentDto,
  UpdateEquipmentDto,
  EquipmentResponseDto,
  CreateExerciseDto,
  UpdateExerciseDto,
  ExerciseResponseDto,
  CreateExerciseSchemeDto,
  UpdateExerciseSchemeDto,
  ExerciseSchemeResponseDto,
  CreateExerciseVideoDto,
  UpdateExerciseVideoDto,
  ExerciseVideoResponseDto,
  CreateExerciseGroupDto,
  UpdateExerciseGroupDto,
  ExerciseGroupResponseDto,
  CreateExerciseGroupMemberDto,
  ExerciseGroupMemberResponseDto,
  CreateExerciseRelationshipDto,
  UpdateExerciseRelationshipDto,
  ExerciseRelationshipResponseDto,
  CreateWorkoutDto,
  UpdateWorkoutDto,
  WorkoutResponseDto,
} from '@resitr/api';

export const CompendiumMutations = {
  // Equipment
  equipment: {
    create: (client: HttpClient, data: CreateEquipmentDto) =>
      lastValueFrom(client.post<EquipmentResponseDto>('/api/compendium/equipment', data)),
    update: (client: HttpClient, id: string, data: UpdateEquipmentDto) =>
      lastValueFrom(client.put<EquipmentResponseDto>(`/api/compendium/equipment/${id}`, data)),
    delete: (client: HttpClient, id: string) =>
      lastValueFrom(client.delete<void>(`/api/compendium/equipment/${id}`)),
  },

  // Exercise
  exercise: {
    create: (client: HttpClient, data: CreateExerciseDto) =>
      lastValueFrom(client.post<ExerciseResponseDto>('/api/compendium/exercise', data)),
    update: (client: HttpClient, id: string, data: UpdateExerciseDto) =>
      lastValueFrom(client.put<ExerciseResponseDto>(`/api/compendium/exercise/${id}`, data)),
    delete: (client: HttpClient, id: string) =>
      lastValueFrom(client.delete<void>(`/api/compendium/exercise/${id}`)),
  },

  // Exercise Scheme
  exerciseScheme: {
    create: (client: HttpClient, data: CreateExerciseSchemeDto) =>
      lastValueFrom(client.post<ExerciseSchemeResponseDto>('/api/compendium/exercise-scheme', data)),
    update: (client: HttpClient, id: string, data: UpdateExerciseSchemeDto) =>
      lastValueFrom(client.put<ExerciseSchemeResponseDto>(`/api/compendium/exercise-scheme/${id}`, data)),
    delete: (client: HttpClient, id: string) =>
      lastValueFrom(client.delete<void>(`/api/compendium/exercise-scheme/${id}`)),
  },

  // Exercise Video
  exerciseVideo: {
    create: (client: HttpClient, data: CreateExerciseVideoDto) =>
      lastValueFrom(client.post<ExerciseVideoResponseDto>('/api/compendium/exercise-video', data)),
    update: (client: HttpClient, exerciseTemplateId: string, url: string, data: UpdateExerciseVideoDto) =>
      lastValueFrom(client.put<ExerciseVideoResponseDto>(`/api/compendium/exercise-video/${exerciseTemplateId}/${url}`, data)),
    delete: (client: HttpClient, exerciseTemplateId: string, url: string) =>
      lastValueFrom(client.delete<void>(`/api/compendium/exercise-video/${exerciseTemplateId}/${url}`)),
  },

  // Exercise Group
  exerciseGroup: {
    create: (client: HttpClient, data: CreateExerciseGroupDto) =>
      lastValueFrom(client.post<ExerciseGroupResponseDto>('/api/compendium/exercise-group', data)),
    upsert: (client: HttpClient, data: CreateExerciseGroupDto) =>
      lastValueFrom(client.post<ExerciseGroupResponseDto>('/api/compendium/exercise-group/upsert', data)),
    update: (client: HttpClient, id: string, data: UpdateExerciseGroupDto) =>
      lastValueFrom(client.put<ExerciseGroupResponseDto>(`/api/compendium/exercise-group/${id}`, data)),
    delete: (client: HttpClient, id: string) =>
      lastValueFrom(client.delete<void>(`/api/compendium/exercise-group/${id}`)),
  },

  // Exercise Group Member
  exerciseGroupMember: {
    create: (client: HttpClient, data: CreateExerciseGroupMemberDto) =>
      lastValueFrom(client.post<ExerciseGroupMemberResponseDto>('/api/compendium/exercise-group-member', data)),
    upsert: (client: HttpClient, data: CreateExerciseGroupMemberDto) =>
      lastValueFrom(client.post<ExerciseGroupMemberResponseDto>('/api/compendium/exercise-group-member/upsert', data)),
    delete: (client: HttpClient, exerciseId: string, groupId: string) =>
      lastValueFrom(client.delete<void>(`/api/compendium/exercise-group-member/${exerciseId}/${groupId}`)),
  },

  // Exercise Relationship
  exerciseRelationship: {
    create: (client: HttpClient, data: CreateExerciseRelationshipDto) =>
      lastValueFrom(client.post<ExerciseRelationshipResponseDto>('/api/compendium/exercise-relationship', data)),
    upsert: (client: HttpClient, data: CreateExerciseRelationshipDto) =>
      lastValueFrom(client.post<ExerciseRelationshipResponseDto>('/api/compendium/exercise-relationship/upsert', data)),
    update: (client: HttpClient, fromExerciseId: string, toExerciseId: string, relationshipType: string, data: UpdateExerciseRelationshipDto) =>
      lastValueFrom(client.put<ExerciseRelationshipResponseDto>(`/api/compendium/exercise-relationship/${fromExerciseId}/${toExerciseId}/${relationshipType}`, data)),
    delete: (client: HttpClient, fromExerciseId: string, toExerciseId: string, relationshipType: string) =>
      lastValueFrom(client.delete<void>(`/api/compendium/exercise-relationship/${fromExerciseId}/${toExerciseId}/${relationshipType}`)),
  },

  // Workout
  workout: {
    create: (client: HttpClient, data: CreateWorkoutDto) =>
      lastValueFrom(client.post<WorkoutResponseDto>('/api/compendium/workout', data)),
    update: (client: HttpClient, templateId: string, data: UpdateWorkoutDto) =>
      lastValueFrom(client.put<WorkoutResponseDto>(`/api/compendium/workout/${templateId}`, data)),
    delete: (client: HttpClient, templateId: string) =>
      lastValueFrom(client.delete<void>(`/api/compendium/workout/${templateId}`)),
  },
} as const;
