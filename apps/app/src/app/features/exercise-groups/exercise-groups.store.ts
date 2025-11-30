import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import type {
  ExerciseGroupResponseDto,
  ExerciseGroupMemberResponseDto,
  ExerciseResponseDto,
  CreateExerciseGroupDto,
  UpdateExerciseGroupDto,
  CreateExerciseGroupMemberDto,
} from '@resitr/api';
import { CompendiumQueries } from '../../core/compendium/compendium-queries';
import { CompendiumMutations } from '../../core/compendium/compendium-mutations';
import { safeErrorMessage } from '../../shared/utils/type-guards';

export interface ExerciseGroupMemberWithExercise extends ExerciseGroupMemberResponseDto {
  exercise?: ExerciseResponseDto;
}

export interface ExerciseGroupsState {
  exerciseGroups: ExerciseGroupResponseDto[];
  currentExerciseGroup: ExerciseGroupResponseDto | null;
  currentGroupMembers: ExerciseGroupMemberWithExercise[];
  isLoading: boolean;
  isLoadingMembers: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  error: string | null;
  saveError: string | null;
  searchTerm: string;
}

const initialState: ExerciseGroupsState = {
  exerciseGroups: [],
  currentExerciseGroup: null,
  currentGroupMembers: [],
  isLoading: false,
  isLoadingMembers: false,
  isSaving: false,
  isDeleting: false,
  error: null,
  saveError: null,
  searchTerm: '',
};

export const ExerciseGroupsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    filteredExerciseGroups: computed(() => {
      let filtered = store.exerciseGroups();

      if (store.searchTerm()) {
        const term = store.searchTerm().toLowerCase();
        filtered = filtered.filter(
          (group) =>
            group.name.toLowerCase().includes(term) ||
            group.description?.toLowerCase().includes(term)
        );
      }

      return filtered;
    }),
    hasActiveFilters: computed(() => {
      return store.searchTerm() !== '';
    }),
  })),
  withMethods((store, http = inject(HttpClient)) => ({
    async loadExerciseGroups(): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const exerciseGroups = await CompendiumQueries.exerciseGroup.list.fn(http);
        patchState(store, { exerciseGroups, isLoading: false });
      } catch (error) {
        patchState(store, {
          error: safeErrorMessage(error),
          isLoading: false,
        });
      }
    },

    async loadExerciseGroup(id: string): Promise<void> {
      patchState(store, {
        isLoading: true,
        error: null,
        currentGroupMembers: [],
      });
      try {
        const exerciseGroup = await CompendiumQueries.exerciseGroup.detail(id).fn(http);
        patchState(store, { currentExerciseGroup: exerciseGroup, isLoading: false });

        // Load group members in background
        this.loadGroupMembers(id);
      } catch (error) {
        patchState(store, {
          error: safeErrorMessage(error),
          isLoading: false,
        });
      }
    },

    async loadGroupMembers(groupId: string): Promise<void> {
      patchState(store, { isLoadingMembers: true });

      try {
        const members = await CompendiumQueries.exerciseGroupMember.byGroup(groupId).fn(http);

        // Enrich members with exercise details
        const enrichedMembers: ExerciseGroupMemberWithExercise[] = await Promise.all(
          members.map(async (member) => {
            try {
              const exercise = await CompendiumQueries.exercise.detail(member.exerciseTemplateId).fn(http);
              return { ...member, exercise };
            } catch {
              return member;
            }
          })
        );

        patchState(store, {
          currentGroupMembers: enrichedMembers,
          isLoadingMembers: false,
        });
      } catch {
        patchState(store, { isLoadingMembers: false });
      }
    },

    async createExerciseGroup(data: CreateExerciseGroupDto): Promise<ExerciseGroupResponseDto | null> {
      patchState(store, { isSaving: true, saveError: null });
      try {
        const exerciseGroup = await CompendiumMutations.exerciseGroup.create(http, data);
        patchState(store, {
          exerciseGroups: [...store.exerciseGroups(), exerciseGroup],
          currentExerciseGroup: exerciseGroup,
          isSaving: false,
        });
        return exerciseGroup;
      } catch (error) {
        patchState(store, {
          saveError: safeErrorMessage(error),
          isSaving: false,
        });
        return null;
      }
    },

    async updateExerciseGroup(id: string, data: UpdateExerciseGroupDto): Promise<ExerciseGroupResponseDto | null> {
      patchState(store, { isSaving: true, saveError: null });
      try {
        const exerciseGroup = await CompendiumMutations.exerciseGroup.update(http, id, data);
        patchState(store, {
          exerciseGroups: store.exerciseGroups().map((g) => (g.id === id ? exerciseGroup : g)),
          currentExerciseGroup: exerciseGroup,
          isSaving: false,
        });
        return exerciseGroup;
      } catch (error) {
        patchState(store, {
          saveError: safeErrorMessage(error),
          isSaving: false,
        });
        return null;
      }
    },

    async deleteExerciseGroup(id: string): Promise<boolean> {
      patchState(store, { isDeleting: true, saveError: null });
      try {
        await CompendiumMutations.exerciseGroup.delete(http, id);
        patchState(store, {
          exerciseGroups: store.exerciseGroups().filter((g) => g.id !== id),
          currentExerciseGroup: null,
          isDeleting: false,
        });
        return true;
      } catch (error) {
        patchState(store, {
          saveError: safeErrorMessage(error),
          isDeleting: false,
        });
        return false;
      }
    },

    async addGroupMember(groupId: string, exerciseTemplateId: string, exercise?: ExerciseResponseDto): Promise<boolean> {
      patchState(store, { isSaving: true, saveError: null });
      try {
        const data: CreateExerciseGroupMemberDto = { exerciseTemplateId, groupId };
        const member = await CompendiumMutations.exerciseGroupMember.create(http, data);
        const newMember: ExerciseGroupMemberWithExercise = exercise
          ? { ...member, exercise }
          : { ...member };
        patchState(store, {
          currentGroupMembers: [...store.currentGroupMembers(), newMember],
          isSaving: false,
        });
        return true;
      } catch (error) {
        patchState(store, {
          saveError: safeErrorMessage(error),
          isSaving: false,
        });
        return false;
      }
    },

    async removeGroupMember(groupId: string, exerciseTemplateId: string): Promise<boolean> {
      patchState(store, { isSaving: true, saveError: null });
      try {
        await CompendiumMutations.exerciseGroupMember.delete(http, exerciseTemplateId, groupId);
        patchState(store, {
          currentGroupMembers: store.currentGroupMembers().filter(
            (m) => m.exerciseTemplateId !== exerciseTemplateId
          ),
          isSaving: false,
        });
        return true;
      } catch (error) {
        patchState(store, {
          saveError: safeErrorMessage(error),
          isSaving: false,
        });
        return false;
      }
    },

    clearCurrentExerciseGroup(): void {
      patchState(store, {
        currentExerciseGroup: null,
        currentGroupMembers: [],
        saveError: null,
      });
    },

    setSearchTerm(searchTerm: string): void {
      patchState(store, { searchTerm });
    },

    clearFilters(): void {
      patchState(store, { searchTerm: '' });
    },
  })),
  withHooks({ onInit: (store) => store.loadExerciseGroups() })
);
