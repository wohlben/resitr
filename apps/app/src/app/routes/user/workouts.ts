import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserWorkoutsStore } from '../../features/user-workouts/user-workouts.store';
import { UserWorkoutCardComponent, type UserWorkoutAction } from '../../components/ui/cards/user-workout-card.component';
import { ErrorLoadingComponent } from '../../components/ui/feedback/error-loading.component';
import { LoadingComponent } from '../../components/ui/feedback/loading.component';
import { ButtonComponent } from '../../components/ui/buttons/button.component';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmationService } from '../../core/services/confirmation.service';
import type { EnrichedUserWorkout } from '../../features/user-workouts/user-workouts.store';

@Component({
  selector: 'app-user-workouts',
  standalone: true,
  imports: [UserWorkoutCardComponent, ErrorLoadingComponent, LoadingComponent, ButtonComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4">
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">My Workouts</h1>
            <p class="text-gray-600 mt-1">Manage your personal workout collection</p>
          </div>
          <app-button variant="primary" link="/compendium/workouts">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Import Workout
          </app-button>
        </div>
      </div>

      <!-- Loading State -->
      @if (store.isLoading()) {
        <app-loading message="Loading your workouts..." />
      }

      <!-- Error State -->
      @if (store.error()) {
        <app-error-loading
          title="Error loading workouts"
          [message]="store.error()!"
        />
      }

      <!-- Success State -->
      @if (!store.isLoading() && !store.error()) {
        @if (store.enrichedWorkouts().length === 0) {
          <div class="text-center py-12 bg-gray-50 rounded-lg">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p class="text-gray-600 mb-4">You haven't added any workouts yet</p>
            <app-button variant="primary" link="/compendium/workouts">
              Browse Workout Compendium
            </app-button>
          </div>
        } @else {
          <div class="flex flex-col gap-3">
            @for (userWorkout of store.enrichedWorkouts(); track userWorkout.id) {
              <app-user-workout-card
                [userWorkout]="userWorkout"
                (actionTriggered)="onAction($event, userWorkout)"
                (cardClicked)="onCardClicked(userWorkout)"
              />
            }
          </div>
        }
      }
    </div>
  `,
})
export class UserWorkoutsComponent {
  readonly store = inject(UserWorkoutsStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly confirmation = inject(ConfirmationService);

  onCardClicked(userWorkout: EnrichedUserWorkout): void {
    this.router.navigate(['/user/workouts', userWorkout.id]);
  }

  async onAction(action: UserWorkoutAction, userWorkout: EnrichedUserWorkout): Promise<void> {
    switch (action) {
      case 'viewLogs':
        this.router.navigate(['/user/workout-logs']);
        break;
      case 'schedule':
        this.router.navigate(['/user/workout-schedule']);
        break;
      case 'delete':
        await this.deleteWorkout(userWorkout);
        break;
    }
  }

  private async deleteWorkout(userWorkout: EnrichedUserWorkout): Promise<void> {
    const workoutName = userWorkout.workout?.name ?? 'this workout';

    const confirmed = await this.confirmation.confirm({
      title: 'Remove from My Workouts',
      message: `Are you sure you want to remove "${workoutName}" from your workouts? This won't delete the workout from the compendium.`,
      confirmText: 'Remove',
      isDestructive: true,
    });

    if (!confirmed) return;

    const success = await this.store.deleteWorkout(userWorkout.id);

    if (success) {
      this.toast.success(`"${workoutName}" removed from your workouts`);
    } else {
      this.toast.error(this.store.actionError() ?? 'Failed to remove workout');
    }
  }
}
