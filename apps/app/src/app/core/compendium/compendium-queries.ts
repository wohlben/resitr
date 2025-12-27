import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import type {
  EquipmentResponseDto,
  ExerciseResponseDto,
  ExerciseSchemeResponseDto,
  ExerciseVideoResponseDto,
  ExerciseGroupResponseDto,
  ExerciseGroupMemberResponseDto,
  ExerciseRelationshipResponseDto,
  WorkoutResponseDto,
} from '@resitr/api';

export const CompendiumQueries = {
  // Equipment
  equipment: {
    list: {
      key: 'compendium-equipment-list',
      fn: (client: HttpClient) => lastValueFrom(client.get<EquipmentResponseDto[]>('/api/compendium/equipment'))
    },
    detail: (id: string) => ({
      key: `compendium-equipment-detail-${id}`,
      fn: (client: HttpClient) => lastValueFrom(client.get<EquipmentResponseDto>(`/api/compendium/equipment/${id}`))
    }),
  },

  // Exercise
  exercise: {
    list: {
      key: 'compendium-exercise-list',
      fn: (client: HttpClient) => lastValueFrom(client.get<ExerciseResponseDto[]>('/api/compendium/exercise'))
    },
    detail: (id: string) => ({
      key: `compendium-exercise-detail-${id}`,
      fn: (client: HttpClient) => lastValueFrom(client.get<ExerciseResponseDto>(`/api/compendium/exercise/${id}`))
    }),
  },

  // Exercise Scheme
  exerciseScheme: {
    list: {
      key: 'compendium-exercise-scheme-list',
      fn: (client: HttpClient) => lastValueFrom(client.get<ExerciseSchemeResponseDto[]>('/api/compendium/exercise-scheme'))
    },
    detail: (id: string) => ({
      key: `compendium-exercise-scheme-detail-${id}`,
      fn: (client: HttpClient) => lastValueFrom(client.get<ExerciseSchemeResponseDto>(`/api/compendium/exercise-scheme/${id}`))
    }),
    byExercise: (exerciseId: string) => ({
      key: `compendium-exercise-scheme-by-exercise-${exerciseId}`,
      fn: (client: HttpClient) => lastValueFrom(client.get<ExerciseSchemeResponseDto[]>(`/api/compendium/exercise-scheme/exercise/${exerciseId}`))
    }),
  },

  // Exercise Video
  exerciseVideo: {
    list: {
      key: 'compendium-exercise-video-list',
      fn: (client: HttpClient) => lastValueFrom(client.get<ExerciseVideoResponseDto[]>('/api/compendium/exercise-video'))
    },
    byExercise: (exerciseTemplateId: string) => ({
      key: `compendium-exercise-video-by-exercise-${exerciseTemplateId}`,
      fn: (client: HttpClient) => lastValueFrom(client.get<ExerciseVideoResponseDto[]>(`/api/compendium/exercise-video/exercise/${exerciseTemplateId}`))
    }),
    detail: (exerciseTemplateId: string, url: string) => ({
      key: `compendium-exercise-video-detail-${exerciseTemplateId}-${url}`,
      fn: (client: HttpClient) => lastValueFrom(client.get<ExerciseVideoResponseDto>(`/api/compendium/exercise-video/${exerciseTemplateId}/${url}`))
    }),
  },

  // Exercise Group
  exerciseGroup: {
    list: {
      key: 'compendium-exercise-group-list',
      fn: (client: HttpClient) => lastValueFrom(client.get<ExerciseGroupResponseDto[]>('/api/compendium/exercise-group'))
    },
    detail: (id: string) => ({
      key: `compendium-exercise-group-detail-${id}`,
      fn: (client: HttpClient) => lastValueFrom(client.get<ExerciseGroupResponseDto>(`/api/compendium/exercise-group/${id}`))
    }),
    byName: (name: string) => ({
      key: `compendium-exercise-group-by-name-${name}`,
      fn: (client: HttpClient) => lastValueFrom(client.get<ExerciseGroupResponseDto>(`/api/compendium/exercise-group/by-name/${name}`))
    }),
  },

  // Exercise Group Member
  exerciseGroupMember: {
    list: {
      key: 'compendium-exercise-group-member-list',
      fn: (client: HttpClient) => lastValueFrom(client.get<ExerciseGroupMemberResponseDto[]>('/api/compendium/exercise-group-member'))
    },
    byExercise: (exerciseId: string) => ({
      key: `compendium-exercise-group-member-by-exercise-${exerciseId}`,
      fn: (client: HttpClient) => lastValueFrom(client.get<ExerciseGroupMemberResponseDto[]>(`/api/compendium/exercise-group-member/exercise/${exerciseId}`))
    }),
    byGroup: (groupId: string) => ({
      key: `compendium-exercise-group-member-by-group-${groupId}`,
      fn: (client: HttpClient) => lastValueFrom(client.get<ExerciseGroupMemberResponseDto[]>(`/api/compendium/exercise-group-member/group/${groupId}`))
    }),
    detail: (exerciseId: string, groupId: string) => ({
      key: `compendium-exercise-group-member-detail-${exerciseId}-${groupId}`,
      fn: (client: HttpClient) => lastValueFrom(client.get<ExerciseGroupMemberResponseDto>(`/api/compendium/exercise-group-member/${exerciseId}/${groupId}`))
    }),
  },

  // Exercise Relationship
  exerciseRelationship: {
    fromExercise: (fromExerciseId: string) => ({
      key: `compendium-exercise-relationship-from-${fromExerciseId}`,
      fn: (client: HttpClient) => lastValueFrom(client.get<ExerciseRelationshipResponseDto[]>(`/api/compendium/exercise-relationship/from/${fromExerciseId}`))
    }),
    toExercise: (toExerciseId: string) => ({
      key: `compendium-exercise-relationship-to-${toExerciseId}`,
      fn: (client: HttpClient) => lastValueFrom(client.get<ExerciseRelationshipResponseDto[]>(`/api/compendium/exercise-relationship/to/${toExerciseId}`))
    }),
    byExercise: (exerciseId: string) => ({
      key: `compendium-exercise-relationship-exercise-${exerciseId}`,
      fn: (client: HttpClient) => lastValueFrom(client.get<ExerciseRelationshipResponseDto[]>(`/api/compendium/exercise-relationship/exercise/${exerciseId}`))
    }),
    byType: (fromExerciseId: string, relationshipType: string) => ({
      key: `compendium-exercise-relationship-type-${fromExerciseId}-${relationshipType}`,
      fn: (client: HttpClient) => lastValueFrom(client.get<ExerciseRelationshipResponseDto[]>(`/api/compendium/exercise-relationship/by-type/${fromExerciseId}/${relationshipType}`))
    }),
  },

  // Workout
  workout: {
    list: {
      key: 'compendium-workout-list',
      fn: (client: HttpClient) => lastValueFrom(client.get<WorkoutResponseDto[]>('/api/compendium/workout'))
    },
    detail: (templateId: string) => ({
      key: `compendium-workout-detail-${templateId}`,
      fn: (client: HttpClient) => lastValueFrom(client.get<WorkoutResponseDto>(`/api/compendium/workout/${templateId}`))
    }),
    versionHistory: (lineageId: string) => ({
      key: `compendium-workout-version-history-${lineageId}`,
      fn: (client: HttpClient) => lastValueFrom(client.get<WorkoutResponseDto[]>(`/api/compendium/workout/lineage/${lineageId}/versions`))
    }),
  },
} as const;
