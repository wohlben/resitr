import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WorkoutsStore } from '../../features/workouts/workouts.store';
import { LoadingComponent } from '../../components/ui/feedback/loading.component';
import { ErrorLoadingComponent } from '../../components/ui/feedback/error-loading.component';
import { DetailPageHeaderComponent } from '../../components/ui/display/detail-page-header.component';
import { ButtonComponent } from '../../components/ui/buttons/button.component';

@Component({
  selector: 'app-workout-versions',
  standalone: true,
  imports: [
    LoadingComponent,
    ErrorLoadingComponent,
    DetailPageHeaderComponent,
    ButtonComponent,
    RouterLink,
  ],
  template: `
    @if (store.isLoading()) {
      <app-loading message="Loading version history..." />
    } @else if (store.error()) {
      <app-error-loading title="Error loading version history" [message]="store.error()!" />
    } @else if (store.currentWorkout(); as workout) {
      <div class="max-w-4xl mx-auto space-y-6">
        <app-detail-page-header
          title="Version History"
          [subtitle]="workout.name"
          [backLink]="['/compendium/workouts', workout.templateId]"
        >
          @if (isLatestVersion()) {
            <app-button header-primary-action variant="primary" [link]="['/compendium/workouts', workout.templateId, 'edit']">
              Edit Current
            </app-button>
          }
        </app-detail-page-header>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated At
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (version of store.versionHistory(); track version.templateId) {
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <a
                      [routerLink]="['/compendium/workouts', version.templateId]"
                      class="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      v{{ version.version }}
                    </a>
                    @if (version.templateId === store.latestVersion()?.templateId) {
                      <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Latest
                      </span>
                    }
                    @if (version.templateId === workout.templateId) {
                      <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        Current
                      </span>
                    }
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(version.updatedAt || version.createdAt) }}
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="2" class="px-6 py-8 text-center text-gray-500">
                    No version history available
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `,
})
export class WorkoutVersions {
  store = inject(WorkoutsStore);
  private route = inject(ActivatedRoute);

  isLatestVersion = computed(() => {
    const workout = this.store.currentWorkout();
    const latest = this.store.latestVersion();
    if (!workout || !latest) return false;
    return latest.templateId === workout.templateId;
  });

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) => {
        const id = params.get('id');
        if (id) {
          this.store.loadWorkout(id);
        }
      });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
