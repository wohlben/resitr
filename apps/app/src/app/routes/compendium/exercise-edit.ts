import { Component, inject, signal, OnInit, computed, effect } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ExercisesStore } from '../../features/exercises/exercises.store';
import { ExerciseGroupsStore } from '../../features/exercise-groups/exercise-groups.store';
import { ExerciseFormComponent } from '../../components/ui/forms/exercise-form.component';
import { FormErrorSummaryComponent } from '../../components/ui/forms/form-error-summary.component';
import { ConfirmDeleteDialogComponent } from '../../components/ui/forms/confirm-delete-dialog.component';
import { LoadingComponent } from '../../components/ui/loading.component';
import { ErrorLoadingComponent } from '../../components/ui/error-loading.component';
import { SpinnerComponent } from '../../components/ui/spinner.component';
import { ButtonComponent } from '../../components/ui/button.component';
import { ComboboxComponent, ComboboxOption } from '../../components/ui/inputs/combobox.component';
import { ValueLabelPipe } from '../../shared/pipes/value-label.pipe';
import type { UpdateExerciseDto, ExerciseResponseDto } from '@resitr/api';
import { ExerciseRelationshipType, ExerciseRelationshipTypeLabels } from '@resitr/api';
import { CanComponentDeactivate, confirmUnsavedChanges, hasFormChanges } from '../../core/guards';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmationService } from '../../core/services/confirmation.service';

@Component({
  selector: 'app-exercise-edit',
  standalone: true,
  imports: [
    ExerciseFormComponent,
    FormErrorSummaryComponent,
    ConfirmDeleteDialogComponent,
    LoadingComponent,
    ErrorLoadingComponent,
    SpinnerComponent,
    ButtonComponent,
    ComboboxComponent,
    RouterLink,
    ValueLabelPipe,
  ],
  template: `
    @if (store.isLoading()) {
      <app-loading message="Loading exercise..." />
    } @else if (store.error()) {
      <app-error-loading title="Error loading exercise" [message]="store.error()!" />
    } @else if (exerciseData()) {
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Edit Exercise</h1>
            <p class="text-gray-600 mt-1">{{ exerciseData()!.name }}</p>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <app-exercise-form
            [initialValue]="exerciseData()!"
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
              Delete Exercise
            </app-button>

            <div class="flex gap-3">
              <app-button variant="secondary" [link]="['/compendium/exercises', exerciseId]">
                Cancel
              </app-button>
              <app-button
                variant="primary"
                (click)="onSubmit()"
                [disabled]="!isFormValid() || store.isSaving()"
              >
                @if (store.isSaving()) {
                  <app-spinner size="small" ariaLabel="Saving exercise" />
                  Saving...
                } @else {
                  Save Changes
                }
              </app-button>
            </div>
          </div>
        </div>

        <!-- Related Exercises Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Related Exercises</h2>

          <!-- Add Relationship -->
          <div class="space-y-3 mb-4 p-4 bg-gray-50 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <app-combobox
                [options]="availableExerciseOptions()"
                placeholder="Search exercise to relate..."
                emptyMessage="No matching exercises found"
                [disabled]="store.isSaving()"
                (optionSelected)="onRelatedExerciseSelected($event)"
              />
              <select
                (change)="onRelationshipTypeChange($event)"
                class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              >
                <option value="">Select relationship type...</option>
                @for (option of relationshipTypeOptions; track option.value) {
                  <option [value]="option.value" [selected]="option.value === selectedRelationshipType()">
                    {{ option.label }}
                  </option>
                }
              </select>
            </div>
            <div class="flex justify-end">
              <app-button
                variant="primary"
                (click)="addRelationship()"
                [disabled]="!canAddRelationship() || store.isSaving()"
              >
                @if (store.isSaving()) {
                  <app-spinner size="small" ariaLabel="Adding relationship" />
                } @else {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                }
                Add Relationship
              </app-button>
            </div>
          </div>

          <!-- Current Relationships List -->
          @if (store.isLoadingRelations()) {
            <div class="flex items-center gap-2 text-gray-500 py-4">
              <app-spinner size="small" />
              <span class="text-sm">Loading relationships...</span>
            </div>
          } @else if (store.currentExerciseRelationships().length > 0) {
            <div class="space-y-2">
              @for (rel of store.currentExerciseRelationships(); track rel.fromExerciseTemplateId + rel.toExerciseTemplateId + rel.relationshipType) {
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center gap-3 min-w-0">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700 flex-shrink-0">
                      {{ rel.relationshipType | valueLabel:ExerciseRelationshipTypeLabels }}
                    </span>
                    <a
                      [routerLink]="['/compendium/exercises', getRelatedExerciseId(rel)]"
                      class="text-sm font-medium text-blue-600 hover:text-blue-800 truncate"
                    >
                      {{ rel.relatedExercise?.name || getRelatedExerciseId(rel) }}
                    </a>
                    @if (rel.description) {
                      <span class="text-xs text-gray-500 truncate hidden md:inline">{{ rel.description }}</span>
                    }
                  </div>
                  <button
                    type="button"
                    (click)="removeRelationship(rel)"
                    [disabled]="store.isSaving()"
                    class="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 flex-shrink-0"
                    title="Remove relationship"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              }
            </div>
          } @else {
            <p class="text-sm text-gray-500 py-4">No related exercises yet. Use the form above to add relationships.</p>
          }
        </div>

        <!-- Exercise Groups Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Exercise Groups</h2>

          <!-- Add to Group -->
          <div class="mb-4">
            <app-combobox
              [options]="availableGroupOptions()"
              placeholder="Search groups to join..."
              emptyMessage="No available groups found"
              [disabled]="store.isSaving()"
              (optionSelected)="onGroupSelected($event)"
            />
          </div>

          <!-- Current Groups List -->
          @if (store.isLoadingRelations()) {
            <div class="flex items-center gap-2 text-gray-500 py-4">
              <app-spinner size="small" />
              <span class="text-sm">Loading groups...</span>
            </div>
          } @else if (store.currentExerciseGroups().length > 0) {
            <div class="flex flex-wrap gap-2">
              @for (membership of store.currentExerciseGroups(); track membership.groupId) {
                <div class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  <a
                    [routerLink]="['/compendium/exercise-groups', membership.groupId]"
                    class="hover:underline"
                  >
                    {{ membership.group?.name || membership.groupId }}
                  </a>
                  <button
                    type="button"
                    (click)="removeFromGroup(membership.groupId, membership.group?.name)"
                    [disabled]="store.isSaving()"
                    class="p-0.5 text-indigo-600 hover:text-red-600 rounded transition-colors disabled:opacity-50"
                    title="Leave group"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              }
            </div>
          } @else {
            <p class="text-sm text-gray-500 py-4">This exercise is not part of any groups yet. Use the search above to join groups.</p>
          }
        </div>
      </div>

      <app-confirm-delete-dialog
        [show]="showDeleteDialog()"
        [itemName]="exerciseData()!.name"
        [isDeleting]="store.isDeleting()"
        (deleteConfirmed)="onDelete()"
        (deleteCancelled)="showDeleteDialog.set(false)"
      />
    }
  `,
})
export class ExerciseEdit implements OnInit, CanComponentDeactivate {
  store = inject(ExercisesStore);
  groupsStore = inject(ExerciseGroupsStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private confirmation = inject(ConfirmationService);

  readonly ExerciseRelationshipTypeLabels = ExerciseRelationshipTypeLabels;

  exerciseId = '';
  isFormValid = signal(false);
  formData = signal<Partial<UpdateExerciseDto>>({});
  showDeleteDialog = signal(false);
  selectedExerciseForRelation = signal<ComboboxOption | null>(null);
  selectedRelationshipType = signal<ExerciseRelationshipType | ''>('');
  private hasSubmitted = false;
  private initialData: Partial<UpdateExerciseDto> = {};

  exerciseData = computed<ExerciseResponseDto | null>(() => {
    const exercise = this.store.currentExercise();
    if (!exercise) return null;
    return { ...exercise };
  });

  // Compute available exercises (exclude current exercise and already related ones)
  availableExerciseOptions = computed<ComboboxOption[]>(() => {
    const allExercises = this.store.exercises();
    const currentRelatedIds = new Set(
      this.store.currentExerciseRelationships().map((r) =>
        r.fromExerciseTemplateId === this.exerciseId
          ? r.toExerciseTemplateId
          : r.fromExerciseTemplateId
      )
    );

    return allExercises
      .filter((e) => e.templateId !== this.exerciseId && !currentRelatedIds.has(e.templateId))
      .map((e): ComboboxOption => ({
        value: e.templateId,
        label: e.name,
        sublabel: e.authorName,
        meta: `v${e.version}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  });

  canAddRelationship = computed(() => {
    return this.selectedExerciseForRelation() !== null && this.selectedRelationshipType() !== '';
  });

  relationshipTypeOptions = Object.entries(ExerciseRelationshipTypeLabels).map(([value, label]) => ({
    value,
    label,
  }));

  // Compute available groups (not already joined)
  availableGroupOptions = computed<ComboboxOption[]>(() => {
    const allGroups = this.groupsStore.exerciseGroups();
    const currentGroupIds = new Set(
      this.store.currentExerciseGroups().map((g) => g.groupId)
    );

    return allGroups
      .filter((g) => !currentGroupIds.has(g.id))
      .map((g): ComboboxOption => ({
        value: g.id,
        label: g.name,
        sublabel: g.description,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  });

  constructor() {
    effect(() => {
      const exercise = this.store.currentExercise();
      if (exercise && Object.keys(this.initialData).length === 0) {
        this.initialData = structuredClone(exercise);
      }
    });
  }

  ngOnInit(): void {
    this.exerciseId = this.route.snapshot.paramMap.get('id') as string;
    this.store.loadExercise(this.exerciseId);
  }

  onFormChange(data: Partial<UpdateExerciseDto>): void {
    this.formData.set(data);
  }

  onValidChange(valid: boolean): void {
    this.isFormValid.set(valid);
  }

  onRelatedExerciseSelected(option: ComboboxOption): void {
    this.selectedExerciseForRelation.set(option);
  }

  onRelationshipTypeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedRelationshipType.set(select.value as ExerciseRelationshipType | '');
  }

  async addRelationship(): Promise<void> {
    const selectedExercise = this.selectedExerciseForRelation();
    const relationshipType = this.selectedRelationshipType();

    if (!selectedExercise || !relationshipType) return;

    const success = await this.store.addRelationship(
      this.exerciseId,
      selectedExercise.value,
      relationshipType as ExerciseRelationshipType
    );

    if (success) {
      this.toast.success(`Added "${selectedExercise.label}" as ${ExerciseRelationshipTypeLabels[relationshipType as ExerciseRelationshipType]}`);
      this.selectedExerciseForRelation.set(null);
      this.selectedRelationshipType.set('');
    } else {
      this.toast.error('Failed to add relationship');
    }
  }

  async removeRelationship(rel: { fromExerciseTemplateId: string; toExerciseTemplateId: string; relationshipType: ExerciseRelationshipType; relatedExercise?: ExerciseResponseDto }): Promise<void> {
    const exerciseName = rel.relatedExercise?.name || 'exercise';

    const success = await this.store.removeRelationship(
      rel.fromExerciseTemplateId,
      rel.toExerciseTemplateId,
      rel.relationshipType
    );

    if (success) {
      this.toast.success(`Removed relationship with "${exerciseName}"`);
    } else {
      this.toast.error('Failed to remove relationship');
    }
  }

  getRelatedExerciseId(rel: { fromExerciseTemplateId: string; toExerciseTemplateId: string }): string {
    return rel.fromExerciseTemplateId === this.exerciseId
      ? rel.toExerciseTemplateId
      : rel.fromExerciseTemplateId;
  }

  async onGroupSelected(option: ComboboxOption): Promise<void> {
    const group = this.groupsStore.exerciseGroups().find((g) => g.id === option.value);
    const success = await this.store.addToGroup(this.exerciseId, option.value, group);

    if (success) {
      this.toast.success(`Joined group "${option.label}"`);
    } else {
      this.toast.error('Failed to join group');
    }
  }

  async removeFromGroup(groupId: string, groupName?: string): Promise<void> {
    const success = await this.store.removeFromGroup(this.exerciseId, groupId);

    if (success) {
      this.toast.success(`Left group "${groupName || groupId}"`);
    } else {
      this.toast.error('Failed to leave group');
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) return;

    const data = this.formData();
    const result = await this.store.updateExercise(
      this.exerciseId,
      data as UpdateExerciseDto
    );
    if (result) {
      this.hasSubmitted = true;
      this.toast.success(`Exercise "${result.name}" updated successfully`);
      this.router.navigate(['/compendium/exercises', result.templateId]);
    }
  }

  async onDelete(): Promise<void> {
    const exerciseName = this.exerciseData()?.name || 'Exercise';
    const success = await this.store.deleteExercise(this.exerciseId);
    if (success) {
      this.hasSubmitted = true;
      this.toast.success(`${exerciseName} deleted successfully`);
      this.router.navigate(['/compendium/exercises']);
    } else {
      this.showDeleteDialog.set(false);
      this.toast.error(`Failed to delete ${exerciseName}. Please try again.`);
    }
  }

  canDeactivate(): boolean | Promise<boolean> {
    if (this.hasSubmitted) return true;

    const current = this.formData();
    if (!hasFormChanges(this.initialData, current)) return true;

    return confirmUnsavedChanges(this.confirmation, this.initialData, current);
  }
}
