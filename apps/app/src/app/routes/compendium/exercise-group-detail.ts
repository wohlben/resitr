import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ExerciseGroupsStore } from '../../features/exercise-groups/exercise-groups.store';
import { LoadingComponent } from '../../components/ui/feedback/loading.component';
import { ErrorLoadingComponent } from '../../components/ui/feedback/error-loading.component';
import { DetailPageHeaderComponent } from '../../components/ui/display/detail-page-header.component';
import { DetailFieldComponent } from '../../components/ui/display/detail-field.component';
import { ButtonComponent } from '../../components/ui/buttons/button.component';
import { SpinnerComponent } from '../../components/ui/feedback/spinner.component';

@Component({
  selector: 'app-exercise-group-detail',
  standalone: true,
  imports: [
    LoadingComponent,
    ErrorLoadingComponent,
    DetailPageHeaderComponent,
    DetailFieldComponent,
    ButtonComponent,
    RouterLink,
    SpinnerComponent,
    DatePipe,
  ],
  template: `
    @if (store.isLoading()) {
      <app-loading message="Loading exercise group..." />
    } @else if (store.error()) {
      <app-error-loading title="Error loading exercise group" [message]="store.error()!" />
    } @else if (store.currentExerciseGroup(); as group) {
      <div class="max-w-4xl mx-auto space-y-6">
        <app-detail-page-header
          [title]="group.name"
          subtitle="Exercise Group"
          backLink="/compendium/exercise-groups"
        >
          <app-button header-primary-action variant="primary" [link]="['/compendium/exercise-groups', group.id, 'edit']">
            Edit Group
          </app-button>
        </app-detail-page-header>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          @if (group.description) {
            <app-detail-field label="Description" [value]="group.description" />
          }

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <app-detail-field
              label="Created"
              [value]="(group.createdAt | date:'medium') || 'Unknown'"
            />

            @if (group.updatedAt) {
              <app-detail-field
                label="Last Updated"
                [value]="(group.updatedAt | date:'medium') || ''"
              />
            }
          </div>
        </div>

        <!-- Group Members Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Exercises in this Group</h2>
          @if (store.isLoadingMembers()) {
            <div class="flex items-center gap-2 text-gray-500">
              <app-spinner size="small" />
              <span class="text-sm">Loading exercises...</span>
            </div>
          } @else if (store.currentGroupMembers().length > 0) {
            <div class="space-y-3">
              @for (member of store.currentGroupMembers(); track member.exerciseTemplateId) {
                <a
                  [routerLink]="['/compendium/exercises', member.exerciseTemplateId]"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div class="flex items-center gap-3">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    @if (member.exercise) {
                      <span class="text-sm font-medium text-blue-600">{{ member.exercise.name }}</span>
                    } @else {
                      <span class="text-sm text-gray-600">{{ member.exerciseTemplateId }}</span>
                    }
                  </div>
                  @if (member.addedAt) {
                    <span class="text-xs text-gray-500">Added {{ member.addedAt | date:'mediumDate' }}</span>
                  }
                </a>
              }
            </div>
          } @else {
            <p class="text-sm text-gray-500">No exercises in this group yet.</p>
          }
        </div>
      </div>
    }
  `,
})
export class ExerciseGroupDetail {
  store = inject(ExerciseGroupsStore);
  private route = inject(ActivatedRoute);

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) => {
        const id = params.get('id');
        if (id) {
          this.store.loadExerciseGroup(id);
        }
      });
  }
}
