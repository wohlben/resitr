import { Component, inject, signal, OnInit, computed, effect } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ExerciseGroupsStore } from '../../features/exercise-groups/exercise-groups.store';
import { ExercisesStore } from '../../features/exercises/exercises.store';
import { ExerciseGroupFormComponent } from '../../components/ui/forms/exercise-group-form.component';
import { FormErrorSummaryComponent } from '../../components/ui/forms/form-error-summary.component';
import { ConfirmDeleteDialogComponent } from '../../components/ui/forms/confirm-delete-dialog.component';
import { LoadingComponent } from '../../components/ui/feedback/loading.component';
import { ErrorLoadingComponent } from '../../components/ui/feedback/error-loading.component';
import { SpinnerComponent } from '../../components/ui/feedback/spinner.component';
import { ButtonComponent } from '../../components/ui/buttons/button.component';
import { ComboboxComponent, ComboboxOption } from '../../components/ui/inputs/combobox.component';
import type { UpdateExerciseGroupDto, ExerciseGroupResponseDto } from '@resitr/api';
import { CanComponentDeactivate, confirmUnsavedChanges, hasFormChanges } from '../../core/guards';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmationService } from '../../core/services/confirmation.service';

@Component({
  selector: 'app-exercise-group-edit',
  standalone: true,
  imports: [
    ExerciseGroupFormComponent,
    FormErrorSummaryComponent,
    ConfirmDeleteDialogComponent,
    LoadingComponent,
    ErrorLoadingComponent,
    SpinnerComponent,
    ButtonComponent,
    ComboboxComponent,
    RouterLink,
  ],
  template: `
    @if (store.isLoading()) {
      <app-loading message="Loading exercise group..." />
    } @else if (store.error()) {
      <app-error-loading
        title="Error loading exercise group"
        [message]="store.error()!"
      />
    } @else if (groupData()) {
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Edit Exercise Group</h1>
            <p class="text-gray-600 mt-1">{{ groupData()!.name }}</p>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <app-exercise-group-form
            [initialValue]="groupData()!"
            [isEditMode]="true"
            (formChange)="onFormChange($event)"
            (validChange)="onValidChange($event)"
          />

          <app-form-error-summary
            class="block mt-4"
            [errors]="store.saveError() ? [store.saveError()!] : []"
          />

          <div class="mt-6 flex gap-3 justify-between">
            <app-button variant="danger-outline" (click)="showDeleteDialog.set(true)">
              Delete Group
            </app-button>

            <div class="flex gap-3">
              <app-button variant="secondary" [link]="['/compendium/exercise-groups', groupId]">
                Cancel
              </app-button>
              <app-button
                variant="primary"
                (click)="onSubmit()"
                [disabled]="!isFormValid() || store.isSaving()"
              >
                @if (store.isSaving()) {
                  <app-spinner size="small" ariaLabel="Saving exercise group" />
                  Saving...
                } @else {
                  Save Changes
                }
              </app-button>
            </div>
          </div>
        </div>

        <!-- Group Members Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Group Members</h2>

          <!-- Add Member -->
          <div class="mb-4">
            <app-combobox
              [options]="availableExerciseOptions()"
              placeholder="Search exercises to add..."
              emptyMessage="No matching exercises found"
              [disabled]="store.isSaving()"
              (optionSelected)="onExerciseSelected($event)"
            />
          </div>

          <!-- Current Members List -->
          @if (store.isLoadingMembers()) {
            <div class="flex items-center gap-2 text-gray-500 py-4">
              <app-spinner size="small" />
              <span class="text-sm">Loading members...</span>
            </div>
          } @else if (store.currentGroupMembers().length > 0) {
            <div class="space-y-2">
              @for (member of store.currentGroupMembers(); track member.exerciseTemplateId) {
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <a
                    [routerLink]="['/compendium/exercises', member.exerciseTemplateId]"
                    class="flex items-center gap-3 text-gray-900 hover:text-blue-600"
                  >
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span class="text-sm font-medium">
                      {{ member.exercise?.name || member.exerciseTemplateId }}
                    </span>
                  </a>
                  <button
                    type="button"
                    (click)="removeMember(member.exerciseTemplateId)"
                    [disabled]="store.isSaving()"
                    class="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    title="Remove from group"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              }
            </div>
          } @else {
            <p class="text-sm text-gray-500 py-4">No exercises in this group yet. Use the dropdown above to add exercises.</p>
          }
        </div>
      </div>

      <app-confirm-delete-dialog
        [show]="showDeleteDialog()"
        [itemName]="groupData()!.name"
        [isDeleting]="store.isDeleting()"
        (deleteConfirmed)="onDelete()"
        (deleteCancelled)="showDeleteDialog.set(false)"
      />
    }
  `,
})
export class ExerciseGroupEdit implements OnInit, CanComponentDeactivate {
  store = inject(ExerciseGroupsStore);
  exercisesStore = inject(ExercisesStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private confirmation = inject(ConfirmationService);

  groupId = '';
  isFormValid = signal(false);
  formData = signal<Partial<UpdateExerciseGroupDto>>({});
  showDeleteDialog = signal(false);
  private hasSubmitted = false;
  private initialData: Partial<UpdateExerciseGroupDto> = {};

  groupData = computed<ExerciseGroupResponseDto | null>(() => {
    const group = this.store.currentExerciseGroup();
    if (!group) return null;
    return { ...group };
  });

  // Compute available exercises (not already in the group)
  availableExerciseOptions = computed<ComboboxOption[]>(() => {
    const allExercises = this.exercisesStore.exercises();
    const currentMemberIds = new Set(
      this.store.currentGroupMembers().map((m) => m.exerciseTemplateId)
    );

    return allExercises
      .filter((e) => !currentMemberIds.has(e.templateId))
      .map((e): ComboboxOption => ({
        value: e.templateId,
        label: e.name,
        sublabel: e.authorName,
        meta: `v${e.version}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  });

  constructor() {
    effect(() => {
      const group = this.store.currentExerciseGroup();
      if (group && Object.keys(this.initialData).length === 0) {
        this.initialData = structuredClone(group);
      }
    });
  }

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id') as string;
    this.store.loadExerciseGroup(this.groupId);
  }

  onFormChange(data: Partial<UpdateExerciseGroupDto>): void {
    this.formData.set(data);
  }

  onValidChange(valid: boolean): void {
    this.isFormValid.set(valid);
  }

  async onExerciseSelected(option: ComboboxOption): Promise<void> {
    const exercise = this.exercisesStore.exercises().find((e) => e.templateId === option.value);
    const success = await this.store.addGroupMember(this.groupId, option.value, exercise);

    if (success) {
      this.toast.success(`Added "${option.label}" to group`);
    } else {
      this.toast.error('Failed to add exercise to group');
    }
  }

  async removeMember(exerciseTemplateId: string): Promise<void> {
    const member = this.store.currentGroupMembers().find((m) => m.exerciseTemplateId === exerciseTemplateId);
    const exerciseName = member?.exercise?.name || exerciseTemplateId;

    const success = await this.store.removeGroupMember(this.groupId, exerciseTemplateId);

    if (success) {
      this.toast.success(`Removed "${exerciseName}" from group`);
    } else {
      this.toast.error('Failed to remove exercise from group');
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) {
      return;
    }

    const data = this.formData();
    const result = await this.store.updateExerciseGroup(
      this.groupId,
      data as UpdateExerciseGroupDto
    );
    if (result) {
      this.hasSubmitted = true;
      this.toast.success(`Exercise group "${result.name}" updated successfully`);
      await this.router.navigate(['/compendium/exercise-groups', result.id]);
    }
  }

  async onDelete(): Promise<void> {
    const groupName = this.groupData()?.name || 'Exercise Group';
    const success = await this.store.deleteExerciseGroup(this.groupId);
    if (success) {
      this.hasSubmitted = true;
      this.toast.success(`${groupName} deleted successfully`);
      await this.router.navigate(['/compendium/exercise-groups']);
    } else {
      this.showDeleteDialog.set(false);
      this.toast.error(`Failed to delete ${groupName}. Please try again.`);
    }
  }

  canDeactivate(): boolean | Promise<boolean> {
    if (this.hasSubmitted) return true;

    const current = this.formData();
    if (!hasFormChanges(this.initialData, current)) return true;

    return confirmUnsavedChanges(this.confirmation, this.initialData, current);
  }
}
